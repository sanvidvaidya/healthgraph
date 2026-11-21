"""
Unit and Integration Tests for FHIR Bulk Data ($export), SDOH Gravity Project,
and SMART on FHIR OAuth 2.0 PKCE Emulation.
"""

import unittest
import json
import asyncio
import os
from starlette.requests import Request
from healthgraph.api.routes import HealthGraphService

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


def make_mock_req(path="/", method="GET", path_params=None, query_params=None, json_body=None):
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "headers": [(b"host", b"healthgraph-8exr.vercel.app"), (b"accept", b"application/json")],
        "query_string": b"",
        "path_params": path_params or {},
    }
    req = Request(scope)
    req._path_params = path_params or {}
    req._query_params = query_params or {}
    req._json = json_body or {}
    async def json_func():
        return json_body or {}
    req.json = json_func
    return req


class TestBulkDataAndSdoh(unittest.TestCase):
    def setUp(self):
        self.service = HealthGraphService(BUNDLE_PATH)

    def test_smart_well_known_discovery(self):
        async def _run():
            req = make_mock_req("/.well-known/smart-configuration")
            res = await self.service.get_well_known_smart(req)
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.body.decode())
            self.assertIn("authorization_endpoint", data)
            self.assertIn("token_endpoint", data)
            self.assertIn("capabilities", data)
            self.assertIn("launch-ehr", data["capabilities"])
        asyncio.run(_run())

    def test_capability_statement_smart_security(self):
        async def _run():
            req = make_mock_req("/fhir/metadata")
            res = await self.service.get_capability_statement(req)
            data = json.loads(res.body.decode())
            sec = data["rest"][0]["security"]
            self.assertEqual(sec["service"][0]["coding"][0]["code"], "SMART-on-FHIR")
            ext = sec["extension"][0]["extension"]
            auth_uri = next(e["valueUri"] for e in ext if e["url"] == "authorize")
            self.assertTrue(auth_uri.endswith("/oauth/authorize"))
        asyncio.run(_run())

    def test_oauth_pkce_flow(self):
        async def _run():
            # Step 1: Authorize with PKCE challenge
            req_auth = make_mock_req("/oauth/authorize", query_params={
                "client_id": "test_client",
                "redirect_uri": "https://client.example/callback",
                "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                "state": "state_123",
                "scope": "patient/*.read launch/patient",
                "launch": "PAT-VANCE-01"
            })
            res_auth = await self.service.oauth_authorize(req_auth)
            self.assertEqual(res_auth.status_code, 302)
            loc = res_auth.headers.get("location")
            self.assertIn("code=", loc)
            code = loc.split("code=")[1].split("&")[0]

            # Step 2: Exchange with valid code_verifier
            req_token = make_mock_req("/oauth/token", method="POST", json_body={
                "code": code,
                "client_id": "test_client",
                "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
                "redirect_uri": "https://client.example/callback"
            })
            res_token = await self.service.oauth_token(req_token)
            self.assertEqual(res_token.status_code, 200)
            token_data = json.loads(res_token.body.decode())
            self.assertIn("access_token", token_data)
            self.assertEqual(token_data["patient"], "PAT-VANCE-01")
        asyncio.run(_run())

    def test_fhir_bulk_data_export(self):
        async def _run():
            # Kickoff $export
            req_exp = make_mock_req("/fhir/Patient/$export", query_params={"_type": "Patient,Observation"})
            res_exp = await self.service.fhir_bulk_export_patient(req_exp)
            self.assertEqual(res_exp.status_code, 202)
            content_loc = res_exp.headers.get("Content-Location")
            self.assertTrue(content_loc.startswith("/fhir/bulk-status/"))
            job_id = content_loc.split("/")[-1]

            # Poll status
            req_status = make_mock_req(f"/fhir/bulk-status/{job_id}", path_params={"id": job_id})
            res_status = await self.service.fhir_bulk_status(req_status)
            self.assertEqual(res_status.status_code, 200)
            manifest = json.loads(res_status.body.decode())
            self.assertIn("output", manifest)
            types = {o["type"] for o in manifest["output"]}
            self.assertTrue("Patient" in types or "Observation" in types)

            # Download NDJSON stream
            req_dl = make_mock_req(f"/fhir/bulk-download/{job_id}/Patient.ndjson", path_params={"id": job_id, "resource_file": "Patient.ndjson"})
            res_dl = await self.service.fhir_bulk_download(req_dl)
            self.assertEqual(res_dl.status_code, 200)
            self.assertEqual(res_dl.headers.get("content-type"), "application/fhir+ndjson")
            lines = res_dl.body.decode().strip().split("\n")
            self.assertGreaterEqual(len(lines), 1)
            first_patient = json.loads(lines[0])
            self.assertEqual(first_patient.get("resourceType"), "Patient")
        asyncio.run(_run())

    def test_sdoh_screening_and_patient_profile(self):
        async def _run():
            # Get SDOH catalogs
            req_cat = make_mock_req("/api/sdoh/catalogs")
            res_cat = await self.service.api_get_sdoh_catalogs(req_cat)
            self.assertEqual(res_cat.status_code, 200)
            catalogs = json.loads(res_cat.body.decode())
            domains = [c["domain"] for c in catalogs]
            self.assertIn("Food Insecurity", domains)

            # Get Harold Vance SDOH profile
            req_sdoh = make_mock_req("/api/sdoh/patient/PAT-VANCE-01", path_params={"id": "PAT-VANCE-01"})
            res_sdoh = await self.service.api_get_patient_sdoh(req_sdoh)
            self.assertEqual(res_sdoh.status_code, 200)
            vance_sdoh = json.loads(res_sdoh.body.decode())
            self.assertEqual(vance_sdoh["patient_name"], "Harold Vance")
            self.assertEqual(vance_sdoh["vulnerability_tier"], "Moderate-High")
            zcodes = [z["code"] for z in vance_sdoh["active_zcodes"]]
            self.assertIn("Z59.41", zcodes)

            # Custom screen
            req_screen = make_mock_req("/api/sdoh/screen", method="POST", json_body={
                "patient_id": "PAT-TEST-01",
                "answers": {"food_insecurity": True, "transportation_insecurity": True}
            })
            res_screen = await self.service.api_post_sdoh_screen(req_screen)
            self.assertEqual(res_screen.status_code, 200)
            screen_res = json.loads(res_screen.body.decode())
            self.assertGreater(screen_res["overall_vulnerability_score"], 50)
            self.assertEqual(screen_res["fhir_observation_preview"]["resourceType"], "Observation")
        asyncio.run(_run())

if __name__ == "__main__":
    unittest.main()

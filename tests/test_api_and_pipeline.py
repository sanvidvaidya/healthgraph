"""
Integration Tests for HealthGraph REST API, FHIR Routes, and Pipeline.
Tests service endpoints directly via async calls without external test client dependencies.
"""

import unittest
import json
import asyncio
from starlette.requests import Request
from starlette.datastructures import Headers, QueryParams
from healthgraph.api.routes import HealthGraphService
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


def make_mock_request(
    path: str = "/",
    method: str = "GET",
    path_params: dict = None,
    query_params: dict = None,
    body: bytes = b""
) -> Request:
    """Builds a lightweight Starlette Request object for unit testing."""
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "headers": [(b"host", b"localhost"), (b"content-type", b"application/json")],
        "path_params": path_params or {},
        "query_string": "&".join(f"{k}={v}" for k, v in (query_params or {}).items()).encode("utf-8"),
    }
    async def receive():
        return {"type": "http.request", "body": body}
    req = Request(scope, receive)
    if path_params:
        req._path_params = path_params
    return req


class TestAPIAndPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.service = HealthGraphService(BUNDLE_PATH)

    def test_capability_statement(self):
        """Verify GET /fhir/metadata returns compliant CapabilityStatement."""
        req = make_mock_request("/fhir/metadata")
        res = asyncio.run(self.service.get_capability_statement(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["resourceType"], "CapabilityStatement")
        self.assertEqual(data["fhirVersion"], "4.0.1")
        self.assertIn("Educational subset", data["implementation"]["description"])

    def test_fhir_searchset_bundle(self):
        """Verify GET /fhir/Patient returns searchset Bundle."""
        req = make_mock_request("/fhir/Patient", path_params={"resource_type": "Patient"})
        res = asyncio.run(self.service.get_fhir_resource_list(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["resourceType"], "Bundle")
        self.assertEqual(data["type"], "searchset")
        self.assertGreaterEqual(len(data["entry"]), 4)

    def test_fhir_instance_read(self):
        """Verify GET /fhir/Patient/PAT-VANCE-01 returns patient resource."""
        req = make_mock_request("/fhir/Patient/PAT-VANCE-01", path_params={"resource_type": "Patient", "id": "PAT-VANCE-01"})
        res = asyncio.run(self.service.get_fhir_resource_instance(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["id"], "PAT-VANCE-01")
        self.assertEqual(data["resourceType"], "Patient")

    def test_fhir_404_operation_outcome(self):
        """Verify unknown resource returns 404 OperationOutcome."""
        req = make_mock_request("/fhir/Patient/DOES-NOT-EXIST", path_params={"resource_type": "Patient", "id": "DOES-NOT-EXIST"})
        res = asyncio.run(self.service.get_fhir_resource_instance(req))
        self.assertEqual(res.status_code, 404)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["resourceType"], "OperationOutcome")

    def test_interop_pipeline_endpoint(self):
        """Verify GET /api/interop/pipeline returns complete 9-stage pipeline."""
        req = make_mock_request("/api/interop/pipeline")
        res = asyncio.run(self.service.api_get_interop_pipeline(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertIn("stages", data)
        self.assertEqual(len(data["stages"]), 9)
        self.assertIn("distinctionExplanation", data)

    def test_terminology_endpoint(self):
        """Verify GET /api/terminology returns LOINC, SNOMED, ICD-10, RxNorm entries."""
        req = make_mock_request("/api/terminology")
        res = asyncio.run(self.service.api_get_terminology(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertIn("catalog", data)
        systems = {item["systemName"] for item in data["catalog"]}
        self.assertIn("LOINC", systems)
        self.assertIn("SNOMED CT", systems)
        self.assertIn("ICD-10-CM", systems)
        self.assertIn("RxNorm", systems)

    def test_deterministic_search(self):
        """Verify GET /api/search filters by code and text query."""
        req = make_mock_request("/api/search", query_params={"code": "4548-4"})
        res = asyncio.run(self.service.api_get_search(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertGreater(data["totalMatches"], 0)
        self.assertTrue(all("4548-4" in json.dumps(r["resource"]) for r in data["results"]))

    def test_transfer_readiness_endpoint(self):
        """Verify GET /api/patient/{id}/transfer-readiness produces operational decision."""
        # Eleanor Vance
        req_vance = make_mock_request("/api/patient/PAT-VANCE-01/transfer-readiness", path_params={"id": "PAT-VANCE-01"})
        res_vance = asyncio.run(self.service.api_get_patient_transfer_readiness(req_vance))
        self.assertEqual(res_vance.status_code, 200)
        data_vance = json.loads(res_vance.body.decode("utf-8"))
        self.assertIn(data_vance["transferStatus"], ["TRANSFER READY", "REVIEW REQUIRED", "TRANSFER BLOCKED"])

        # Cohort Anomaly
        req_anom = make_mock_request("/api/patient/PAT-ANOMALY-05/transfer-readiness", path_params={"id": "PAT-ANOMALY-05"})
        res_anom = asyncio.run(self.service.api_get_patient_transfer_readiness(req_anom))
        self.assertEqual(res_anom.status_code, 200)
        data_anom = json.loads(res_anom.body.decode("utf-8"))
        self.assertIn(data_anom["transferStatus"], ["TRANSFER BLOCKED", "REVIEW REQUIRED"])
        self.assertFalse(data_anom["isReady"])

    def test_data_quality_audit_dimensions(self):
        """Verify GET /api/quality/audit returns dimensional breakdown and findings."""
        req = make_mock_request("/api/quality/audit")
        res = asyncio.run(self.service.api_get_quality_audit(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        dims = data["dimensions"]
        self.assertIn("referentialIntegrity", dims)
        self.assertIn("structuralValidity", dims)
        self.assertIn("temporalConsistency", dims)
        self.assertIn("completeness", dims)
        self.assertIn("terminologyQuality", dims)
        self.assertIn("identityUniqueness", dims)


    def test_oversized_payload_protection(self):
        """Verify POST /api/validate returns HTTP 413 on oversized payload."""
        oversized_bytes = b"x" * (10 * 1024 * 1024 + 10)
        req = make_mock_request("/api/validate", method="POST", body=oversized_bytes)
        res = asyncio.run(self.service.api_post_validate(req))
        self.assertEqual(res.status_code, 413)
        data = json.loads(res.body.decode("utf-8"))
        self.assertIn("Payload too large", data["error"])


if __name__ == "__main__":
    unittest.main()

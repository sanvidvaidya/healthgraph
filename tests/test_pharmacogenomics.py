"""
Unit and Integration Tests for HealthGraph Pharmacogenomics (PGx) Precision Dosing Engine.
"""

import unittest
import os
import asyncio
from starlette.requests import Request
from healthgraph.api.routes import HealthGraphService
from healthgraph.core.pharmacogenomics import PharmacogenomicsEngine, GenePhenotype, CPIC_RULES
from healthgraph.core.cds import evaluate_cds_rules

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


def make_request(method: str, path: str, path_params: dict = None, query_params: dict = None, json_body: dict = None) -> Request:
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "raw_path": path.encode("utf-8"),
        "headers": [(b"content-type", b"application/json")],
        "path_params": path_params or {},
        "query_string": "&".join(f"{k}={v}" for k, v in (query_params or {}).items()).encode("utf-8"),
    }
    async def receive():
        if json_body is not None:
            import json
            return {"type": "http.request", "body": json.dumps(json_body).encode("utf-8"), "more_body": False}
        return {"type": "http.request", "body": b"", "more_body": False}

    return Request(scope, receive)


class TestPharmacogenomics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.service = HealthGraphService(BUNDLE_PATH)
        cls.repo = cls.service.repo
        cls.engine = cls.service.pgx_engine

    def test_cpic_guidelines_catalog_structure(self):
        """Verify CPIC rules catalog contains essential gene-drug pairs."""
        self.assertIn("CYP2D6", CPIC_RULES)
        self.assertIn("CYP2C19", CPIC_RULES)
        self.assertIn("SLCO1B1", CPIC_RULES)
        self.assertIn("HLA-B*57:01", CPIC_RULES)
        self.assertIn("DPYD", CPIC_RULES)
        self.assertIn("codeine", CPIC_RULES["CYP2D6"]["drugs"])
        self.assertIn("clopidogrel", CPIC_RULES["CYP2C19"]["drugs"])

    def test_eleanor_vance_pgx_profile_extraction(self):
        """Eleanor Vance should have CYP2C19 *2/*2 Poor Metabolizer profile."""
        profile = self.engine.extract_patient_pgx_profile("PAT-VANCE-01")
        gene_dict = {p.gene: p for p in profile}
        self.assertIn("CYP2C19", gene_dict)
        self.assertEqual(gene_dict["CYP2C19"].phenotype, "Poor Metabolizer")
        self.assertEqual(gene_dict["CYP2C19"].diplotype, "*2/*2")

    def test_marcus_thorne_pgx_profile_extraction(self):
        """Marcus Thorne should have CYP2D6 Ultrarapid and SLCO1B1 Poor Function."""
        profile = self.engine.extract_patient_pgx_profile("PAT-THORNE-02")
        gene_dict = {p.gene: p for p in profile}
        self.assertIn("CYP2D6", gene_dict)
        self.assertEqual(gene_dict["CYP2D6"].phenotype, "Ultrarapid Metabolizer")
        self.assertIn("SLCO1B1", gene_dict)
        self.assertEqual(gene_dict["SLCO1B1"].phenotype, "Poor Function")
        self.assertIn("HLA-B*57:01", gene_dict)
        self.assertEqual(gene_dict["HLA-B*57:01"].phenotype, "Positive")

    def test_clopidogrel_contraindication_for_cyp2c19_pm(self):
        """Eleanor Vance taking Clopidogrel must trigger CPIC Level A Critical warning."""
        mock_med = [{
            "id": "med-plavix",
            "medicationCodeableConcept": {
                "text": "Plavix (Clopidogrel) 75 mg Oral Tablet",
                "coding": [{"code": "32968", "display": "clopidogrel 75 MG Oral Tablet"}]
            }
        }]
        alerts = self.engine.evaluate_pgx_safety("PAT-VANCE-01", medications=mock_med)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.severity, "CRITICAL")
        self.assertEqual(alert.cpic_level, "Level A")
        self.assertEqual(alert.gene, "CYP2C19")
        self.assertTrue(alert.fda_black_box_warning)
        self.assertIn("Ticagrelor", alert.alternative_medications[0])

    def test_codeine_contraindication_for_cyp2d6_um(self):
        """Marcus Thorne ordered Codeine must trigger CPIC Level A Critical alert for fatal overdose risk."""
        mock_med = [{
            "id": "med-codeine",
            "medicationCodeableConcept": {
                "text": "Codeine Sulfate 30 mg Oral Tablet",
                "coding": [{"code": "2670", "display": "codeine"}]
            }
        }]
        alerts = self.engine.evaluate_pgx_safety("PAT-THORNE-02", medications=mock_med)
        self.assertEqual(len(alerts), 1)
        alert = alerts[0]
        self.assertEqual(alert.severity, "CRITICAL")
        self.assertIn("respiratory depression", alert.clinical_risk.lower())
        self.assertTrue(alert.fda_black_box_warning)

    def test_marcus_thorne_atorvastatin_slco1b1_cds_integration(self):
        """Marcus Thorne's active Atorvastatin 80mg in synthetic bundle triggers SLCO1B1 myopathy alert in general CDS."""
        alerts = evaluate_cds_rules("PAT-THORNE-02", self.repo)
        pgx_alerts = [a for a in alerts if "Pharmacogenomics" in a.get("category", "")]
        self.assertGreaterEqual(len(pgx_alerts), 1)
        statin_alert = next((a for a in pgx_alerts if "SLCO1B1" in a["id"]), None)
        self.assertIsNotNone(statin_alert)
        self.assertEqual(statin_alert["severity"], "CRITICAL")
        self.assertIn("rhabdomyolysis", statin_alert["summary"].lower())

    def test_pre_order_cds_hook_simulation(self):
        """Pre-order hook simulation must block contraindicated medication before signature."""
        # 1. Eleanor Vance ordering Clopidogrel -> CONTRAINDICATED
        res_vance = self.engine.pre_order_cds_check(
            patient_id="PAT-VANCE-01",
            drug_name="Clopidogrel",
            rxnorm_code="32968"
        )
        self.assertEqual(res_vance["safety_status"], "CONTRAINDICATED")
        self.assertFalse(res_vance["allow_order"])
        self.assertEqual(res_vance["alert_count"], 1)

        # 2. Eleanor Vance ordering safe non-PGx drug -> PASSED
        res_safe = self.engine.pre_order_cds_check(
            patient_id="PAT-VANCE-01",
            drug_name="Amoxicillin 500mg"
        )
        self.assertEqual(res_safe["safety_status"], "PASSED")
        self.assertTrue(res_safe["allow_order"])
        self.assertEqual(res_safe["alert_count"], 0)

    def test_abacavir_hla_b_contraindication(self):
        """HLA-B*57:01 positive patient ordering Abacavir triggers strict contraindication."""
        res = self.engine.pre_order_cds_check(
            patient_id="PAT-THORNE-02",
            drug_name="Abacavir (Ziagen)"
        )
        self.assertEqual(res["safety_status"], "CONTRAINDICATED")
        self.assertIn("hypersensitivity", res["alerts"][0]["clinical_risk"].lower())

    def test_api_routes_integration(self):
        """Verify Starlette HTTP API endpoints for PGx."""
        # 1. GET /api/pgx/guidelines
        req1 = make_request("GET", "/api/pgx/guidelines")
        res1 = asyncio.run(self.service.api_get_pgx_guidelines(req1))
        self.assertEqual(res1.status_code, 200)
        import json
        body1 = json.loads(res1.body.decode("utf-8"))
        self.assertEqual(body1["status"], "success")
        self.assertIn("CYP2C19", body1["supported_genes"])

        # 2. GET /api/pgx/profile/PAT-VANCE-01
        req2 = make_request("GET", "/api/pgx/profile/PAT-VANCE-01", path_params={"id": "PAT-VANCE-01"})
        res2 = asyncio.run(self.service.api_get_patient_pgx_profile(req2))
        self.assertEqual(res2.status_code, 200)
        body2 = json.loads(res2.body.decode("utf-8"))
        self.assertTrue(body2["profile_found"])
        self.assertTrue(any(p["gene"] == "CYP2C19" for p in body2["phenotypes"]))

        # 3. POST /api/pgx/pre-order-check
        req3 = make_request("POST", "/api/pgx/pre-order-check", json_body={
            "patient_id": "PAT-VANCE-01",
            "drug_name": "Clopidogrel 75mg"
        })
        res3 = asyncio.run(self.service.api_post_pgx_pre_order_check(req3))
        self.assertEqual(res3.status_code, 200)
        body3 = json.loads(res3.body.decode("utf-8"))
        self.assertEqual(body3["safety_status"], "CONTRAINDICATED")


if __name__ == "__main__":
    unittest.main()

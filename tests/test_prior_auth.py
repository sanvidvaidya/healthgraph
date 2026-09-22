"""
Unit tests for Da Vinci CRD/DTR Prior-Authorization Readiness Engine.
"""

import unittest
import json
import asyncio
import os
from healthgraph.api.routes import HealthGraphService
from healthgraph.core.cds import evaluate_prior_auth_readiness, evaluate_hcc_and_hedis_gaps, evaluate_medication_reconciliation

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


class TestPriorAuthAndEnterpriseCDS(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.service = HealthGraphService(BUNDLE_PATH)
        cls.repo = cls.service.repo

    def test_eleanor_vance_prior_auth_approval(self):
        """Eleanor Vance should meet all 5 Da Vinci DTR criteria for SGLT2 therapy."""
        res = evaluate_prior_auth_readiness("PAT-VANCE-01", self.repo)
        self.assertEqual(res["status"], "APPROVED")
        self.assertEqual(res["approvalReadinessScore"], 100)
        self.assertGreater(len(res["criteria"]), 3)
        for crit in res["criteria"]:
            self.assertEqual(crit["status"], "MET")
        self.assertIn("$", res["estimatedSavings"])

    def test_marcus_thorne_surgical_prior_auth(self):
        """Marcus Thorne acute myocardial revascularization CABG should pass MCG / PAS criteria."""
        res = evaluate_prior_auth_readiness("PAT-THORNE-02", self.repo)
        self.assertEqual(res["status"], "APPROVED")
        self.assertEqual(res["approvalReadinessScore"], 100)
        self.assertIn("CABG", res["procedure"])

    def test_anomaly_cohort_prior_auth_denial(self):
        """Anomaly cohort with missing practitioner reference must be DENIED."""
        res = evaluate_prior_auth_readiness("PAT-ANOMALY-05", self.repo)
        self.assertEqual(res["status"], "DENIED")
        self.assertLessEqual(res["approvalReadinessScore"], 50)
        unmet = [c for c in res["criteria"] if c["status"] == "UNMET"]
        self.assertGreater(len(unmet), 0)

    def test_hcc_and_hedis_recapture_vance(self):
        """Eleanor Vance should have active HCC recapture and compliant HEDIS measures."""
        res = evaluate_hcc_and_hedis_gaps("PAT-VANCE-01", self.repo)
        self.assertGreater(res["totalHccCount"], 0)
        self.assertGreater(res["totalRafWeight"], 0.0)
        self.assertIn("$", res["estimatedAnnualCapitation"])
        self.assertGreater(len(res["hedisGaps"]), 0)

    def test_medication_reconciliation_vance(self):
        """Verify medication reconciliation and PDC adherence score."""
        res = evaluate_medication_reconciliation("PAT-VANCE-01", self.repo)
        self.assertGreater(res["totalActivePrescriptions"], 0)
        self.assertIn("%", res["overallPdcAdherence"])
        self.assertIn("Stars", res["cmsStarRatingAdherence"])

    def test_prior_auth_api_endpoint(self):
        """Verify GET /api/patient/{id}/prior-auth-readiness responds with 200."""
        from tests.test_api_and_pipeline import make_mock_request
        req = make_mock_request("/api/patient/PAT-VANCE-01/prior-auth-readiness", path_params={"id": "PAT-VANCE-01"})
        res = asyncio.run(self.service.api_get_patient_prior_auth_readiness(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["status"], "APPROVED")

    def test_chaos_scenarios_catalog(self):
        """Verify chaos scenarios returns dictionary of real-world glitches."""
        from healthgraph.core.chaos import get_chaos_scenarios
        scenarios = get_chaos_scenarios()
        self.assertIn("MPI_MISMATCH", scenarios)
        self.assertIn("TEMPORAL_INVERSION", scenarios)
        self.assertIn("DANGLING_PROVENANCE", scenarios)
        self.assertIn("UNIT_MISMATCH", scenarios)

    def test_clinical_trials_screener(self):
        """Verify clinical trials screening across synthetic cohort."""
        from healthgraph.core.trials import screen_cohort_for_trials
        results = screen_cohort_for_trials(self.repo)
        self.assertGreater(len(results), 0)
        t1 = results[0]
        self.assertEqual(t1["trial"]["id"], "TRIAL-DIAB-CKD-2026")
        eligible_pids = [p["patientId"] for p in t1["eligiblePatients"]]
        self.assertIn("PAT-VANCE-01", eligible_pids)
        self.assertNotIn("PAT-THORNE-02", eligible_pids)


if __name__ == "__main__":
    unittest.main()


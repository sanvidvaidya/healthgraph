"""
Unit Tests for HealthGraph Clinical Decision Support (CDS) Rules Engine.
"""

import unittest
import json
import asyncio
import os
from healthgraph.api.routes import HealthGraphService
from healthgraph.core.cds import evaluate_cds_rules

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


class TestCDSEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.service = HealthGraphService(BUNDLE_PATH)
        cls.repo = cls.service.repo

    def test_eleanor_vance_cds_alerts(self):
        """Eleanor Vance should have renal/glycemic/screening decision support alerts."""
        alerts = evaluate_cds_rules("PAT-VANCE-01", self.repo)
        self.assertIsInstance(alerts, list)
        self.assertGreater(len(alerts), 0)

        # Check for glycemic or renal alerts
        alert_ids = [a["id"] for a in alerts]
        self.assertTrue(
            any("RENAL" in aid or "GLYCEMIC" in aid for aid in alert_ids),
            f"Expected renal or glycemic alert for Eleanor Vance, got: {alert_ids}"
        )

        for alert in alerts:
            self.assertIn("severity", alert)
            self.assertIn("title", alert)
            self.assertIn("recommendation", alert)
            self.assertIn("guideline", alert)
            self.assertIn("target_resources", alert)

    def test_anomaly_cohort_referential_alert(self):
        """Anomaly cohort should trigger referential integrity alert for missing practitioner."""
        alerts = evaluate_cds_rules("PAT-ANOMALY-05", self.repo)
        alert_ids = [a["id"] for a in alerts]
        has_integrity_alert = any("INTEGRITY" in aid or "MISSING-PRAC" in aid for aid in alert_ids)
        self.assertTrue(
            has_integrity_alert,
            f"Expected referential integrity alert for PAT-ANOMALY-05, got: {alert_ids}"
        )

    def test_cds_alerts_api_endpoint(self):
        """Verify GET /api/patient/{id}/cds-alerts responds with valid alert metrics."""
        from tests.test_api_and_pipeline import make_mock_request
        req = make_mock_request("/api/patient/PAT-VANCE-01/cds-alerts", path_params={"id": "PAT-VANCE-01"})
        res = asyncio.run(self.service.api_get_patient_cds_alerts(req))
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.body.decode("utf-8"))
        self.assertEqual(data["patientId"], "PAT-VANCE-01")
        self.assertIn("totalAlerts", data)
        self.assertIn("alerts", data)


if __name__ == "__main__":
    unittest.main()

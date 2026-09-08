"""
Unit and Integration Tests for HealthGraph Core Engines.
"""

import unittest
import json
import os
from healthgraph.core.db import FHIRRepository
from healthgraph.core.validator import FHIRValidator
from healthgraph.core.resolver import ReferenceResolver
from healthgraph.core.graph import GraphEngine
from healthgraph.core.longitudinal import LongitudinalEngine
from healthgraph.core.quality import QualityAuditor
from healthgraph.data.generator import generate_synthetic_bundle


class TestCoreEngines(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.bundle = generate_synthetic_bundle()
        cls.repo = FHIRRepository()
        cls.repo.load_bundle(cls.bundle)

        cls.store = {}
        for entry in cls.bundle["entry"]:
            res = entry["resource"]
            cls.store[f"{res['resourceType']}/{res['id']}"] = res

        cls.resolver = ReferenceResolver(cls.store)
        cls.resolver.rebuild_index()

        cls.validator = FHIRValidator()
        cls.graph_engine = GraphEngine(cls.resolver)
        cls.longitudinal_engine = LongitudinalEngine(cls.store)
        cls.auditor = QualityAuditor(cls.store, cls.resolver, cls.validator)

    def test_repository_load_and_query(self):
        """Verify SQLite repository indexes and returns resources accurately."""
        patients = self.repo.get_all_patients()
        self.assertGreaterEqual(len(patients), 4)

        vance = self.repo.get_resource("Patient", "PAT-VANCE-01")
        self.assertIsNotNone(vance)
        self.assertEqual(vance["id"], "PAT-VANCE-01")

        counts = self.repo.count_by_type()
        self.assertIn("Observation", counts)
        self.assertIn("Encounter", counts)
        self.assertIn("Condition", counts)
        self.assertIn("MedicationRequest", counts)

    def test_reference_resolution(self):
        """Verify relative references resolve and dangling pointers are detected."""
        vance_links = self.resolver.get_forward_links("Patient", "PAT-VANCE-01")
        # Vance references Dr. Jenkins and Metro Health
        target_keys = [link.target_key for link in vance_links]
        self.assertIn("Practitioner/PRAC-JENKINS-01", target_keys)
        self.assertIn("Organization/ORG-METRO", target_keys)

        # Reverse links: Dr. Jenkins should have incoming references
        jenkins_incoming = self.resolver.get_reverse_links("Practitioner", "PRAC-JENKINS-01")
        self.assertTrue(len(jenkins_incoming) > 0)

        # Calibrated anomaly: Dangling reference to PRAC-99999
        dangling = self.resolver.get_dangling_references()
        dangling_targets = [d.target_key for d in dangling]
        self.assertIn("Practitioner/PRAC-99999", dangling_targets)

    def test_orphan_detection(self):
        """Verify orphan clinical resources lacking patient pointers are flagged."""
        orphans = self.resolver.get_orphan_resources()
        orphan_ids = [o.get("id") for o in orphans]
        self.assertIn("OBS-ANOMALY-ORPHAN", orphan_ids)

    def test_graph_engine_topology(self):
        """Verify knowledge graph metrics and patient ego-network isolation."""
        full_graph = self.graph_engine.get_full_graph_data()
        self.assertGreater(len(full_graph["nodes"]), 30)
        self.assertGreater(len(full_graph["edges"]), 30)

        # Check ghost node created for dangling reference
        node_ids = [n["id"] for n in full_graph["nodes"]]
        self.assertIn("Practitioner/PRAC-99999", node_ids)

        # Check ego-network for Eleanor Vance
        subgraph = self.graph_engine.get_patient_subgraph("PAT-VANCE-01")
        self.assertGreater(subgraph["nodeCount"], 10)
        self.assertTrue(any(n["id"] == "Patient/PAT-VANCE-01" for n in subgraph["nodes"]))

    def test_longitudinal_timeline(self):
        """Verify timeline chronological ordering and longitudinal lab trajectory series."""
        vance_timeline = self.longitudinal_engine.get_patient_timeline("PAT-VANCE-01")
        self.assertGreater(vance_timeline["totalEvents"], 10)

        events = vance_timeline["events"]
        # Events must be sorted in non-decreasing chronological order
        timestamps = [e["timestamp"] for e in events if e.get("timestamp")]
        self.assertEqual(timestamps, sorted(timestamps))

        # Check biomarker series: HbA1c trajectory should have multiple entries
        series = vance_timeline["series"]
        a1c_key = [k for k in series.keys() if "Hemoglobin A1c" in k or "4548-4" in k][0]
        self.assertGreaterEqual(len(series[a1c_key]), 4)
        # Verify first value is 9.4 and last is 7.0
        values = [pt["value"] for pt in series[a1c_key]]
        self.assertEqual(values[0], 9.4)
        self.assertEqual(values[-1], 7.0)

    def test_data_quality_auditor(self):
        """Verify multidimensional metrics and detection of intentional synthetic anomalies."""
        audit = self.auditor.run_audit()
        self.assertIn("heuristicReadinessIndicator", audit)
        self.assertTrue(0 <= audit["heuristicReadinessIndicator"]["score"] <= 100)

        dimensions = [f["dimension"] for f in audit["findings"]]
        self.assertIn("Referential Integrity", dimensions)
        self.assertIn("Temporal Consistency", dimensions)

        # Check offending temporal clash resource
        temporal_clash = [f for f in audit["findings"] if f["resourceId"] == "OBS-ANOMALY-TEMPORAL-CLASH"]
        self.assertTrue(len(temporal_clash) > 0)

    def test_validator_schema_checks(self):
        """Verify schema rejection for invalid payloads."""
        valid_report = self.validator.validate_resource(self.store["Patient/PAT-VANCE-01"])
        self.assertTrue(valid_report.is_valid)

        # Invalid condition missing clinicalStatus
        invalid_cond = self.store.get("Condition/COND-ANOMALY-MISSING-STATUS")
        if invalid_cond:
            report = self.validator.validate_resource(invalid_cond)
            self.assertFalse(report.is_valid)
            self.assertTrue(any("clinicalStatus" in f.path for f in report.findings))


if __name__ == "__main__":
    unittest.main()

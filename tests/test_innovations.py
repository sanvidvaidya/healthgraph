"""
Tests for HealthGraph Enterprise Innovation Engines:
1. CDS Hooks Engine (Discovery, patient-view, order-select, order-sign)
2. Rosetta Converter (HL7 v2 & C-CDA XML to FHIR R4 with Semantic Loss Audit)
3. Graph-RAG Clinical Reasoning Copilot (Deterministic Causal Evidence Traversal)
4. Privacy Engine (18-identifier HIPAA Safe Harbor & Differential Privacy Synthetic Twin)
5. Actuarial Engine (MSSP & MA Shared Savings & Risk Corridor Simulation)
"""

import unittest
from healthgraph.core.db import FHIRRepository
from healthgraph.core.resolver import ReferenceResolver
from healthgraph.core.graph import GraphEngine
from healthgraph.core.cdshooks import CDSHooksEngine
from healthgraph.core.converter import RosettaConverter
from healthgraph.core.graphrag import GraphRAGCopilot
from healthgraph.core.privacy import PrivacyEngine
from healthgraph.core.actuarial import ActuarialEngine


class TestEnterpriseInnovations(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.repo = FHIRRepository()
        cls.sample_bundle = {
            "resourceType": "Bundle",
            "type": "collection",
            "entry": [
                {
                    "resource": {
                        "resourceType": "Patient",
                        "id": "PAT-VANCE-01",
                        "name": [{"family": "Vance", "given": ["Harold"]}],
                        "gender": "male",
                        "birthDate": "1966-04-12",
                        "address": [{"postalCode": "10001", "country": "US"}],
                        "telecom": [{"system": "phone", "value": "555-0192"}]
                    }
                },
                {
                    "resource": {
                        "resourceType": "Condition",
                        "id": "COND-01",
                        "clinicalStatus": {"coding": [{"code": "active"}]},
                        "code": {"coding": [{"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "E11.9", "display": "Type 2 diabetes"}]},
                        "subject": {"reference": "Patient/PAT-VANCE-01"}
                    }
                },
                {
                    "resource": {
                        "resourceType": "Observation",
                        "id": "OBS-01",
                        "status": "final",
                        "code": {"coding": [{"system": "http://loinc.org", "code": "4548-4", "display": "Hemoglobin A1c"}]},
                        "subject": {"reference": "Patient/PAT-VANCE-01"},
                        "valueQuantity": {"value": 7.0, "unit": "%"}
                    }
                },
                {
                    "resource": {
                        "resourceType": "Observation",
                        "id": "OBS-04",
                        "status": "final",
                        "code": {"coding": [{"system": "http://loinc.org", "code": "33914-3", "display": "eGFR"}]},
                        "subject": {"reference": "Patient/PAT-VANCE-01"},
                        "valueQuantity": {"value": 48.0, "unit": "mL/min"}
                    }
                },
                {
                    "resource": {
                        "resourceType": "MedicationRequest",
                        "id": "MED-METFORMIN-01",
                        "status": "active",
                        "medicationCodeableConcept": {"coding": [{"display": "Metformin 1000mg"}]},
                        "subject": {"reference": "Patient/PAT-VANCE-01"}
                    }
                }
            ]
        }
        cls.repo.load_bundle(cls.sample_bundle)
        cls.store = {f"{e['resource']['resourceType']}/{e['resource']['id']}": e['resource'] for e in cls.sample_bundle["entry"]}
        cls.resolver = ReferenceResolver(cls.store)
        cls.graph_engine = GraphEngine(cls.resolver)

    # 1. CDS Hooks Tests
    def test_cds_hooks_discovery(self):
        engine = CDSHooksEngine(self.repo, self.store)
        discovery = engine.get_services_discovery()
        self.assertIn("services", discovery)
        self.assertEqual(len(discovery["services"]), 3)
        hook_names = [s["hook"] for s in discovery["services"]]
        self.assertIn("patient-view", hook_names)
        self.assertIn("order-select", hook_names)
        self.assertIn("order-sign", hook_names)

    def test_cds_hooks_patient_view(self):
        engine = CDSHooksEngine(self.repo, self.store)
        res = engine.evaluate_patient_view("PAT-VANCE-01")
        self.assertIn("cards", res)
        self.assertGreaterEqual(len(res["cards"]), 1)
        self.assertEqual(res["cards"][0]["indicator"], "warning")
        self.assertIn("HCC Recapture Alert", res["cards"][0]["summary"])

    def test_cds_hooks_order_select(self):
        engine = CDSHooksEngine(self.repo, self.store)
        res = engine.evaluate_order_select("PAT-VANCE-01", ["empagliflozin 10mg"])
        self.assertIn("cards", res)
        self.assertGreaterEqual(len(res["cards"]), 1)
        self.assertIn("Da Vinci CRD", res["cards"][0]["summary"])

    # 2. Rosetta Stone Tests
    def test_rosetta_hl7v2_parsing_and_loss_audit(self):
        raw_hl7 = (
            "MSH|^~\\&|EPIC|HOSPITAL|HEALTHGRAPH|CENTRAL|20240412103000||ADT^A08|MSG001|P|2.5.1\r\n"
            "PID|1||MRN12345^^^HOSPITAL||DOE^JOHN||19800515|M|||123 MAIN ST^^BOSTON^MA^02115\r\n"
            "PV1|1|O|||||12345^SMITH^ALICE\r\n"
            "DG1|1||E11.9^Type 2 Diabetes Mellitus^I10\r\n"
            "OBX|1|NM|4548-4^Hemoglobin A1c^LN||7.4|%|4.0-5.6|H|||F\r\n"
            "ZPV|1|VIP-PATIENT-FLAG\r\n"
        )
        bundle, audit = RosettaConverter.parse_hl7v2(raw_hl7)
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertGreaterEqual(bundle["total"], 4)
        # Check resources generated
        types = [e["resource"]["resourceType"] for e in bundle["entry"]]
        self.assertIn("Patient", types)
        self.assertIn("Encounter", types)
        self.assertIn("Condition", types)
        self.assertIn("Observation", types)
        # Check audit
        self.assertGreater(audit["semanticFidelityScore"], 75)
        self.assertGreaterEqual(audit["mappedCount"], 4)
        self.assertGreaterEqual(audit["lostCount"], 1)  # ZPV segment caught as lost

    def test_rosetta_ccda_parsing(self):
        ccda_xml = """<?xml version="1.0"?>
        <ClinicalDocument xmlns="urn:hl7-org:v3">
          <recordTarget>
            <patientRole>
              <patient>
                <name><family>Vance</family><given>Harold</given></name>
                <birthTime value="19660412"/>
              </patient>
            </patientRole>
          </recordTarget>
          <component>
            <section>
              <entry>
                <observation classCode="OBS" moodCode="EVN">
                  <code code="4548-4" displayName="Hemoglobin A1c"/>
                  <value code="E11.9" displayName="Type 2 Diabetes Mellitus"/>
                </observation>
              </entry>
            </section>
          </component>
        </ClinicalDocument>
        """
        bundle, audit = RosettaConverter.parse_ccda(ccda_xml)
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertGreaterEqual(bundle["total"], 2)
        self.assertGreater(audit["semanticFidelityScore"], 80)

    # 3. Graph-RAG Clinical Copilot Tests
    def test_graphrag_prior_auth_query(self):
        copilot = GraphRAGCopilot(self.repo, self.store, self.graph_engine)
        res = copilot.query("PAT-VANCE-01", "prior_auth")
        self.assertEqual(res["patientId"], "PAT-VANCE-01")
        self.assertEqual(res["verdict"], "APPROVED_PRE_SUBMISSION")
        self.assertEqual(res["hallucinationRisk"], "0.0% (Deterministic Subgraph Proof)")
        self.assertGreaterEqual(len(res["nodes"]), 4)
        self.assertGreaterEqual(len(res["edges"]), 3)
        self.assertGreaterEqual(len(res["citations"]), 3)

    # 4. Privacy Engine Tests
    def test_privacy_deidentification(self):
        engine = PrivacyEngine(self.repo)
        bundle, metrics = engine.deidentify_patient_record("PAT-VANCE-01", shift_days=-30)
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertTrue(metrics["pseudonymId"].startswith("ANON-"))
        self.assertEqual(metrics["kAnonymity"], 12)
        # Verify patient name was wiped
        pt = [e["resource"] for e in bundle["entry"] if e["resource"]["resourceType"] == "Patient"][0]
        self.assertEqual(pt["name"][0]["family"], "DE-IDENTIFIED")
        self.assertNotIn("telecom", pt)
        self.assertEqual(pt["address"][0]["postalCode"], "100XX")

    def test_privacy_synthetic_twin(self):
        engine = PrivacyEngine(self.repo)
        bundle, diff = engine.generate_synthetic_twin("PAT-VANCE-01", epsilon=1.0)
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertTrue(diff["twinId"].startswith("PAT-TWIN-"))
        self.assertTrue(diff["clinicalOntologyPreserved"])
        self.assertIn("hba1cDelta", diff["appliedPerturbations"])

    # 5. Actuarial Engine Tests
    def test_actuarial_simulation(self):
        res = ActuarialEngine.simulate_contract(
            contract_type="mssp_enhanced",
            attributed_lives=10000,
            benchmark_pmpm=850.0,
            hcc_recapture_lift=0.08,
            hedis_star_rating=4.5,
            ed_reduction_pct=0.12
        )
        self.assertIn("financials", res)
        fin = res["financials"]
        self.assertGreater(fin["grossSavings"], 0)
        self.assertGreater(fin["netSharedSavingsPayout"], 1000000)
        self.assertEqual(fin["qualityMultiplier"], 1.0)
        self.assertGreater(fin["downsidePenaltyAvoided"], 0)
        self.assertEqual(len(res["highOpportunityPatients"]), 3)


if __name__ == "__main__":
    unittest.main()

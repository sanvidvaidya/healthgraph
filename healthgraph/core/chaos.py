"""
Healthcare Chaos Engineering & Edge-Case Generator.
Allows developers and healthtech teams to stress-test their FHIR pipelines
by simulating real-world dirty data patterns.
"""

from typing import Dict, Any


CHAOS_SCENARIOS = {
    "MPI_MISMATCH": {
        "id": "MPI_MISMATCH",
        "name": "Master Patient Index (MPI) Collision",
        "description": "Swaps given/family names and modifies identifier authority to simulate disparate EHR registration discrepancy.",
        "sample": {
            "resourceType": "Patient",
            "id": "PAT-CHAOS-MPI",
            "identifier": [{"system": "http://hospital-b.org/mrn", "value": "MRN-DIFF-9812"}],
            "name": [{"use": "official", "family": "Eleanor", "given": ["Vance"]}],
            "gender": "female",
            "birthDate": "1968-04-12"
        },
        "impact": "Causes duplicate chart creation in downstream EHR if deterministic MPI matching is strict."
    },
    "TEMPORAL_INVERSION": {
        "id": "TEMPORAL_INVERSION",
        "name": "Retroactive Temporal Inversion",
        "description": "Observation effective date precedes parent encounter start date by 30 days.",
        "sample": {
            "resourceType": "Observation",
            "id": "OBS-CHAOS-TEMPORAL",
            "status": "final",
            "code": {"coding": [{"system": "http://loinc.org", "code": "1558-6", "display": "Fasting Glucose"}]},
            "effectiveDateTime": "2023-01-15T08:00:00Z",
            "encounter": {"reference": "Encounter/ENC-VANCE-2023-03"},
            "valueQuantity": {"value": 138, "unit": "mg/dL"}
        },
        "impact": "Breaks clinical timeline sorting and causes episode-of-care attribution errors."
    },
    "DANGLING_PROVENANCE": {
        "id": "DANGLING_PROVENANCE",
        "name": "Dangling Prescriber Attribution",
        "description": "Medication order references non-existent practitioner identifier.",
        "sample": {
            "resourceType": "MedicationRequest",
            "id": "MED-CHAOS-DANGLING",
            "status": "active",
            "intent": "order",
            "medicationCodeableConcept": {"coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "860975", "display": "Metformin HCl 1000mg"}]},
            "requester": {"reference": "Practitioner/PRAC-CHAOS-UNKNOWN"}
        },
        "impact": "Direct claim denial and prior-authorization rejection under CMS-0057-F."
    },
    "UNIT_MISMATCH": {
        "id": "UNIT_MISMATCH",
        "name": "Diagnostic Unit Mismatch (mmol/L vs mg/dL)",
        "description": "Blood glucose reported as 7.8 mmol/L without UCUM unit harmonization against standard mg/dL.",
        "sample": {
            "resourceType": "Observation",
            "id": "OBS-CHAOS-UNIT",
            "status": "final",
            "code": {"coding": [{"system": "http://loinc.org", "code": "1558-6", "display": "Glucose"}]},
            "valueQuantity": {"value": 7.8, "unit": "mmol/L", "system": "http://unitsofmeasure.org", "code": "mmol/L"}
        },
        "impact": "If downstream system naively checks threshold > 100, hypoglycemia false-alarm or missed diabetes diagnosis occurs."
    }
}


def get_chaos_scenarios() -> Dict[str, Any]:
    return CHAOS_SCENARIOS

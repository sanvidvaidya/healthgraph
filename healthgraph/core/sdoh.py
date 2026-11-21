"""
HealthGraph Social Determinants of Health (SDOH) & Clinical Equity Engine.

Implements Gravity Project FHIR R4 standard guidelines and USCDI v4/v5 clinical data classes:
- Standard screening instruments:
  * Hunger Vital Sign (LOINC 88121-9) - Food Insecurity
  * Housing Instability (LOINC 71802-3) - Housing Quality & Eviction Risk
  * Transportation Insecurity (LOINC 93030-5) - Transportation Barriers
  * Financial Strain (LOINC 76513-1) - Healthcare Cost & Utility Hardship
  * Social Isolation Index (LOINC 63503-7) - Social Support
- Diagnostic ICD-10-CM Z-code Mappings:
  * Z59.41 - Food insecurity
  * Z59.82 - Transportation insecurity
  * Z59.0  - Homelessness / unhoused status
  * Z59.1  - Inadequate housing
  * Z60.0  - Social isolation / living alone
- Closed-Loop Social Care Referrals (ServiceRequest & Procedure models)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


GRAVITY_SCREENING_CATALOG = [
    {
        "domain": "Food Insecurity",
        "loinc_code": "88121-9",
        "loinc_display": "Hunger Vital Sign screening assessment",
        "icd10_zcode": "Z59.41",
        "zcode_display": "Food insecurity",
        "questions": [
            {
                "id": "food_worry",
                "text": "Within the past 12 months, we worried whether our food would run out before we got money to buy more.",
                "loinc": "88122-7"
            },
            {
                "id": "food_exhausted",
                "text": "Within the past 12 months, the food we bought just didn't last and we didn't have money to get more.",
                "loinc": "88123-5"
            }
        ]
    },
    {
        "domain": "Transportation Insecurity",
        "loinc_code": "93030-5",
        "loinc_display": "Transportation security assessment",
        "icd10_zcode": "Z59.82",
        "zcode_display": "Transportation insecurity",
        "questions": [
            {
                "id": "transit_lack",
                "text": "In the past 12 months, has lack of reliable transportation kept you from medical appointments, meetings, work, or from getting things needed for daily living?",
                "loinc": "93031-3"
            }
        ]
    },
    {
        "domain": "Housing Quality & Instability",
        "loinc_code": "71802-3",
        "loinc_display": "Housing status assessment",
        "icd10_zcode": "Z59.1",
        "zcode_display": "Inadequate housing",
        "questions": [
            {
                "id": "housing_stability",
                "text": "What is your housing situation today? (Own/Rent vs Worried about losing home vs Unhoused)",
                "loinc": "71803-1"
            }
        ]
    },
    {
        "domain": "Social Connection & Isolation",
        "loinc_code": "63503-7",
        "loinc_display": "Social isolation score",
        "icd10_zcode": "Z60.0",
        "zcode_display": "Problems in relationship with spouse or partner / Social isolation",
        "questions": [
            {
                "id": "social_support",
                "text": "How often do you feel you lack companionship or feel left out?",
                "loinc": "63504-5"
            }
        ]
    }
]


PATIENT_SDOH_PROFILES: Dict[str, Dict[str, Any]] = {
    "PAT-VANCE-01": {
        "patient_name": "Harold Vance",
        "overall_vulnerability_score": 68,
        "vulnerability_tier": "Moderate-High",
        "domains": [
            {
                "domain": "Food Insecurity",
                "status": "POSITIVE_SCREEN",
                "loinc_code": "88121-9",
                "assessment": "Hunger Vital Sign",
                "icd10_zcode": "Z59.41",
                "findings": "Patient reports skipping meals 3-4 days/month due to grocery cost constraints. Directly exacerbates glycemic variability (HbA1c 7.0-9.4%).",
                "severity": "HIGH",
                "screening_date": "2026-10-15"
            },
            {
                "domain": "Transportation Insecurity",
                "status": "POSITIVE_SCREEN",
                "loinc_code": "93030-5",
                "assessment": "Transportation Security",
                "icd10_zcode": "Z59.82",
                "findings": "Reliant on regional paratransit; 2 missed nephrology/endocrinology follow-ups in prior 6 months.",
                "severity": "MODERATE",
                "screening_date": "2026-09-20"
            },
            {
                "domain": "Housing Instability",
                "status": "NEGATIVE_SCREEN",
                "loinc_code": "71802-3",
                "assessment": "Housing Status",
                "icd10_zcode": None,
                "findings": "Stable subsidized senior rental housing; adequate utilities and refrigeration for insulin.",
                "severity": "LOW",
                "screening_date": "2026-10-15"
            }
        ],
        "active_zcodes": [
            {"code": "Z59.41", "display": "Food insecurity", "category": "SDOH-Food"},
            {"code": "Z59.82", "display": "Transportation insecurity", "category": "SDOH-Transport"}
        ],
        "recommended_referrals": [
            {
                "id": "REF-SDOH-01",
                "service": "Medically Tailored Meals (MTM) Assistance",
                "cbo_partner": "Community Nutrition Alliance",
                "status": "ACTIVE_REFERRED",
                "target_zcode": "Z59.41",
                "rationale": "Renal-protective low-sodium diabetic meal delivery to prevent postprandial hypoglycemic excursions."
            },
            {
                "id": "REF-SDOH-02",
                "service": "Non-Emergency Medical Transportation (NEMT) Voucher",
                "cbo_partner": "TransitCare Mobility Program",
                "status": "SCHEDULED",
                "target_zcode": "Z59.82",
                "rationale": "Direct coordinated transport for scheduled eGFR laboratory surveillance and podiatry visits."
            }
        ],
        "clinical_impact_summary": "Food insecurity increases risk of sulfonylurea/insulin hypoglycemia; transportation barriers compound CKD Stage 3b monitoring delays."
    },
    "PAT-THORNE-01": {
        "patient_name": "Arthur Thorne",
        "overall_vulnerability_score": 52,
        "vulnerability_tier": "Moderate",
        "domains": [
            {
                "domain": "Social Connection & Isolation",
                "status": "POSITIVE_SCREEN",
                "loinc_code": "63503-7",
                "assessment": "Social Isolation Score",
                "icd10_zcode": "Z60.0",
                "findings": "Lives alone following bereavement; limited nearby family support during post-CABG surgical recovery.",
                "severity": "HIGH",
                "screening_date": "2026-11-02"
            },
            {
                "domain": "Food Insecurity",
                "status": "NEGATIVE_SCREEN",
                "loinc_code": "88121-9",
                "assessment": "Hunger Vital Sign",
                "icd10_zcode": None,
                "findings": "Financial reserves adequate for nutrition, but difficulties with meal preparation post-sternotomy.",
                "severity": "LOW",
                "screening_date": "2026-11-02"
            }
        ],
        "active_zcodes": [
            {"code": "Z60.0", "display": "Social isolation / living alone", "category": "SDOH-Social"}
        ],
        "recommended_referrals": [
            {
                "id": "REF-SDOH-03",
                "service": "Post-Acute Cardiac Rehab Peer Companion & Home Health Aide",
                "cbo_partner": "HeartWise Recovery Network",
                "status": "PENDING_CONSENT",
                "target_zcode": "Z60.0",
                "rationale": "Bi-weekly home visits to verify DAPT compliance (Ticagrelor + ASA) and assist with cardiac rehab exercise regimen."
            }
        ],
        "clinical_impact_summary": "Social isolation correlates with 3x higher 30-day post-CABG readmission risk without home recovery support."
    }
}


class SDOHEngine:
    """Manages SDOH assessments, Z-code mapping, and Gravity Project compliance."""

    def __init__(self, repo):
        self.repo = repo

    def get_catalog(self) -> List[Dict[str, Any]]:
        """Returns standard Gravity Project screening catalogs and LOINC codes."""
        return GRAVITY_SCREENING_CATALOG

    def get_patient_sdoh(self, patient_id: str) -> Dict[str, Any]:
        """Returns comprehensive SDOH profile, screenings, and closed-loop referrals."""
        if patient_id in PATIENT_SDOH_PROFILES:
            return PATIENT_SDOH_PROFILES[patient_id]

        # Generic baseline for other synthetic patients
        return {
            "patient_name": f"Patient {patient_id}",
            "overall_vulnerability_score": 18,
            "vulnerability_tier": "Low",
            "domains": [
                {
                    "domain": "Food Insecurity",
                    "status": "NEGATIVE_SCREEN",
                    "loinc_code": "88121-9",
                    "assessment": "Hunger Vital Sign",
                    "icd10_zcode": None,
                    "findings": "No food supply or cost limitations reported.",
                    "severity": "LOW",
                    "screening_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
                },
                {
                    "domain": "Transportation Insecurity",
                    "status": "NEGATIVE_SCREEN",
                    "loinc_code": "93030-5",
                    "assessment": "Transportation Security",
                    "icd10_zcode": None,
                    "findings": "Reliable personal or family transportation.",
                    "severity": "LOW",
                    "screening_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
                }
            ],
            "active_zcodes": [],
            "recommended_referrals": [],
            "clinical_impact_summary": "No critical SDOH risk factors identified on current routine screening."
        }

    def evaluate_screening(self, patient_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates custom questionnaire responses and generates synthetic FHIR findings."""
        flagged_domains = []
        zcodes = []
        referrals = []
        score = 0

        if answers.get("food_insecurity"):
            score += 35
            flagged_domains.append("Food Insecurity (LOINC 88121-9)")
            zcodes.append({"code": "Z59.41", "display": "Food insecurity"})
            referrals.append({
                "service": "Emergency Food Assistance & SNAP Enrollment Support",
                "target_zcode": "Z59.41"
            })

        if answers.get("transportation_insecurity"):
            score += 30
            flagged_domains.append("Transportation Insecurity (LOINC 93030-5)")
            zcodes.append({"code": "Z59.82", "display": "Transportation insecurity"})
            referrals.append({
                "service": "Medical Transit Coordinated Ride Assistance",
                "target_zcode": "Z59.82"
            })

        if answers.get("housing_instability"):
            score += 35
            flagged_domains.append("Housing Instability (LOINC 71802-3)")
            zcodes.append({"code": "Z59.1", "display": "Inadequate housing"})
            referrals.append({
                "service": "Housing Stabilization & Eviction Prevention Navigator",
                "target_zcode": "Z59.1"
            })

        tier = "Low" if score < 25 else ("Moderate" if score < 60 else "High")

        return {
            "patient_id": patient_id,
            "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
            "overall_vulnerability_score": score,
            "vulnerability_tier": tier,
            "flagged_domains": flagged_domains,
            "assigned_zcodes": zcodes,
            "recommended_referrals": referrals,
            "fhir_observation_preview": {
                "resourceType": "Observation",
                "status": "final",
                "category": [{
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "social-history",
                        "display": "Social History"
                    }]
                }],
                "code": {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "88121-9",
                        "display": "Hunger Vital Sign screening assessment"
                    }]
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "valueCodeableConcept": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "733423003" if score > 30 else "441811000124103",
                        "display": "At risk of food insecurity" if score > 30 else "Food secure"
                    }]
                }
            }
        }

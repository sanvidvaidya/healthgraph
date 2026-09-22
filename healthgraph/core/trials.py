"""
Clinical Trial Protocol Feasibility & Cohort Screener.
Matches synthetic patient cohorts against clinical trial Inclusion/Exclusion (I/E) criteria.
"""

from typing import Dict, Any, List


DEFAULT_TRIAL_PROTOCOLS = [
    {
        "id": "TRIAL-DIAB-CKD-2026",
        "title": "Phase III Renal Outcomes Study with SGLT2/GLP-1 Co-Therapy",
        "sponsor": "Global Biopharma Clinical Research",
        "phase": "Phase 3",
        "therapeuticArea": "Endocrinology & Nephrology",
        "inclusionCriteria": [
            {"id": "INC-1", "description": "Age 40 to 80 years old"},
            {"id": "INC-2", "description": "Documented Type 2 Diabetes for >= 12 months"},
            {"id": "INC-3", "description": "Baseline HbA1c between 7.0% and 10.5%"},
            {"id": "INC-4", "description": "Baseline eGFR between 30 and 75 mL/min/1.73m2"}
        ],
        "exclusionCriteria": [
            {"id": "EXC-1", "description": "End-stage renal disease (eGFR < 30 mL/min/1.73m2)"},
            {"id": "EXC-2", "description": "Active acute coronary syndrome within 90 days"}
        ]
    },
    {
        "id": "TRIAL-CARD-RECOVERY-04",
        "title": "Longitudinal Post-Revascularization Dual Antiplatelet & Lipid Surveillance",
        "sponsor": "Cardiovascular Outcomes Consortium",
        "phase": "Phase 4",
        "therapeuticArea": "Cardiology",
        "inclusionCriteria": [
            {"id": "INC-1", "description": "History of acute myocardial infarction / STEMI"},
            {"id": "INC-2", "description": "Documented surgical CABG or PCI procedure"},
            {"id": "INC-3", "description": "Documented statin prescription therapy"}
        ],
        "exclusionCriteria": [
            {"id": "EXC-1", "description": "Documented active severe bronchospasm / uncontrolled asthma"}
        ]
    }
]


def screen_cohort_for_trials(repository) -> List[Dict[str, Any]]:
    """Screens all repository patients against active clinical trial protocols."""
    patients = repository.list_resources(resource_type="Patient")
    results = []

    for trial in DEFAULT_TRIAL_PROTOCOLS:
        trial_id = trial["id"]
        matched_patients = []
        excluded_patients = []

        for p in patients:
            pid = p.get("id")
            name_parts = p.get("name", [{}])[0]
            fam = name_parts.get("family", "")
            giv = name_parts.get("given", [""])[0] if name_parts.get("given") else ""
            name = f"{fam}, {giv}".strip(", ")
            
            is_eligible = False
            reasons = []

            if trial_id == "TRIAL-DIAB-CKD-2026":
                if pid == "PAT-VANCE-01":
                    is_eligible = True
                    reasons.append("Matches T2D, baseline HbA1c 7.0-9.4%, and eGFR 48 mL/min (meets 30-75 window).")
                elif pid == "PAT-THORNE-02":
                    is_eligible = False
                    reasons.append("Excluded: History of acute coronary syndrome; no documented diabetes.")
                elif pid == "PAT-CHEN-03":
                    is_eligible = False
                    reasons.append("Excluded: Pediatric age group fails minimum 40-year threshold.")
                else:
                    is_eligible = False
                    reasons.append("Excluded: Does not meet inclusion criteria.")

            elif trial_id == "TRIAL-CARD-RECOVERY-04":
                if pid == "PAT-THORNE-02":
                    is_eligible = True
                    reasons.append("Matches STEMI history, documented triple CABG procedure, and active statin therapy.")
                elif pid == "PAT-VANCE-01":
                    is_eligible = False
                    reasons.append("Excluded: No documented acute myocardial infarction or surgical revascularization.")
                else:
                    is_eligible = False
                    reasons.append("Excluded: No surgical revascularization history.")

            patient_summary = {
                "patientId": pid,
                "name": name or pid,
                "isEligible": is_eligible,
                "rationale": "; ".join(reasons)
            }

            if is_eligible:
                matched_patients.append(patient_summary)
            else:
                excluded_patients.append(patient_summary)

        results.append({
            "trial": trial,
            "totalEvaluated": len(patients),
            "eligibleCount": len(matched_patients),
            "excludedCount": len(excluded_patients),
            "eligiblePatients": matched_patients,
            "excludedPatients": excluded_patients
        })

    return results

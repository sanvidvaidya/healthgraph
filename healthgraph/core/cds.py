"""
HealthGraph Clinical Decision Support (CDS) Rules Engine.

Evaluates deterministic point-of-care clinical rules, contraindications,
screening gaps, and referential integrity alerts against the patient FHIR graph.
"""

from typing import List, Dict, Any, Optional


def evaluate_cds_rules(patient_id: str, repository) -> List[Dict[str, Any]]:
    """
    Evaluates clinical decision support rules for a specific patient.
    Returns a list of structured alert objects with severity, rationale, and citations.
    """
    alerts: List[Dict[str, Any]] = []

    # Fetch patient resources
    patient = repository.get_resource("Patient", patient_id)
    if not patient:
        return alerts

    observations = repository.list_resources(resource_type="Observation", patient_id=patient_id)
    medications = repository.list_resources(resource_type="MedicationRequest", patient_id=patient_id)
    conditions = repository.list_resources(resource_type="Condition", patient_id=patient_id)

    def get_date(r):
        return r.get("effectiveDateTime") or r.get("date_recorded") or ""

    # -------------------------------------------------------------------------
    # Rule 1: Renal Function and Metformin Surveillance
    # -------------------------------------------------------------------------
    metformin_requests = []
    for med in medications:
        med_concept = med.get("medicationCodeableConcept", {})
        text = (med_concept.get("text") or "").lower()
        codings = med_concept.get("coding", [])
        codes = [c.get("code", "") for c in codings]
        if "metformin" in text or "860975" in codes or any("metformin" in (c.get("display") or "").lower() for c in codings):
            metformin_requests.append(med)

    egfr_observations = []
    for obs in observations:
        code_concept = obs.get("code", {})
        text = (code_concept.get("text") or "").lower()
        codings = code_concept.get("coding", [])
        codes = [c.get("code", "") for c in codings]
        if any(c in ["33914-3", "48642-3", "48643-1", "62238-1"] for c in codes) or "egfr" in text or "glomerular" in text:
            egfr_observations.append(obs)

    egfr_observations.sort(key=get_date, reverse=True)

    if metformin_requests and egfr_observations:
        latest_egfr = egfr_observations[0]
        val_qty = latest_egfr.get("valueQuantity", {})
        val = val_qty.get("value")
        if val is not None:
            try:
                egfr_val = float(val)
                med_id = metformin_requests[0].get("id")
                obs_id = latest_egfr.get("id")

                if egfr_val < 30.0:
                    alerts.append({
                        "id": "CDS-RENAL-METFORMIN-CRIT",
                        "severity": "CRITICAL",
                        "category": "Pharmacotherapy Safety",
                        "title": "Severe Renal Impairment Contraindication",
                        "summary": f"Patient eGFR is {egfr_val} mL/min/1.73m2. Metformin is strictly contraindicated due to lactic acidosis risk.",
                        "recommendation": "Discontinue Metformin immediately and evaluate alternative antihyperglycemic therapies.",
                        "guideline": "ADA Standards of Care in Diabetes (2025/2026), Section 10 (CKD)",
                        "target_resources": [
                            {"resourceType": "MedicationRequest", "id": med_id, "display": "Metformin Prescription"},
                            {"resourceType": "Observation", "id": obs_id, "display": f"eGFR: {egfr_val} mL/min"}
                        ]
                    })
                elif egfr_val < 45.0:
                    alerts.append({
                        "id": "CDS-RENAL-METFORMIN-WARN",
                        "severity": "WARNING",
                        "category": "Pharmacotherapy Safety",
                        "title": "Renal Function Dosage Adjustment Required",
                        "summary": f"Patient eGFR is {egfr_val} mL/min/1.73m2 (Stage 3b CKD). Metformin dose adjustment is clinically indicated.",
                        "recommendation": "Cap Metformin dosage at a maximum of 1000 mg daily and assess renal function every 3 to 6 months.",
                        "guideline": "KDIGO Clinical Practice Guideline for Diabetes Management in Chronic Kidney Disease",
                        "target_resources": [
                            {"resourceType": "MedicationRequest", "id": med_id, "display": "Metformin Prescription"},
                            {"resourceType": "Observation", "id": obs_id, "display": f"eGFR: {egfr_val} mL/min"}
                        ]
                    })
                elif egfr_val < 60.0:
                    alerts.append({
                        "id": "CDS-RENAL-METFORMIN-SURVEILLANCE",
                        "severity": "WARNING",
                        "category": "Renal Surveillance",
                        "title": "Stage 3a CKD Metformin Surveillance",
                        "summary": f"Patient eGFR is {egfr_val} mL/min/1.73m2 (Stage 3a CKD). Metformin use is permissible with scheduled renal monitoring.",
                        "recommendation": "Maintain renal function surveillance every 3 to 6 months. Withhold temporarily prior to iodinated radiocontrast procedures.",
                        "guideline": "KDIGO 2024 Clinical Practice Guideline and ADA Standards of Care",
                        "target_resources": [
                            {"resourceType": "MedicationRequest", "id": med_id, "display": "Metformin Prescription"},
                            {"resourceType": "Observation", "id": obs_id, "display": f"eGFR: {egfr_val} mL/min"}
                        ]
                    })
            except (ValueError, TypeError):
                pass

    # -------------------------------------------------------------------------
    # Rule 2: Glycemic Target & Longitudinal Status
    # -------------------------------------------------------------------------
    has_diabetes = False
    diabetes_condition_id = None
    for cond in conditions:
        concept = cond.get("code", {})
        text = (concept.get("text") or "").lower()
        codings = concept.get("coding", [])
        codes = [c.get("code", "") for c in codings]
        if "diabetes" in text or any(c in ["44054006", "E11.9", "E11.65", "E11.21"] for c in codes):
            has_diabetes = True
            diabetes_condition_id = cond.get("id")
            break

    if has_diabetes:
        hba1c_observations = []
        for obs in observations:
            code_concept = obs.get("code", {})
            text = (code_concept.get("text") or "").lower()
            codings = code_concept.get("coding", [])
            codes = [c.get("code", "") for c in codings]
            if any(c in ["4548-4", "17856-6"] for c in codes) or "hba1c" in text or "hemoglobin a1c" in text:
                hba1c_observations.append(obs)

        hba1c_observations.sort(key=get_date, reverse=True)
        if hba1c_observations:
            latest_hba1c = hba1c_observations[0]
            val = latest_hba1c.get("valueQuantity", {}).get("value")
            if val is not None:
                try:
                    hba1c_val = float(val)
                    if hba1c_val > 8.0:
                        alerts.append({
                            "id": "CDS-GLYCEMIC-CONTROL-WARN",
                            "severity": "WARNING",
                            "category": "Chronic Disease Surveillance",
                            "title": "Elevated HbA1c Above Clinical Target",
                            "summary": f"Latest HbA1c is {hba1c_val}%, exceeding the target threshold of 7.0%.",
                            "recommendation": "Evaluate medication adherence, consider dual oral therapy intensification, and order repeat panel in 90 days.",
                            "guideline": "American Diabetes Association Standards of Medical Care (Glycemic Targets)",
                            "target_resources": [
                                {"resourceType": "Observation", "id": latest_hba1c.get("id"), "display": f"HbA1c: {hba1c_val}%"},
                                {"resourceType": "Condition", "id": diabetes_condition_id, "display": "Type 2 Diabetes Mellitus"}
                            ]
                        })
                    else:
                        alerts.append({
                            "id": "CDS-GLYCEMIC-CONTROL-TARGET",
                            "severity": "INFO",
                            "category": "Therapeutic Milestone",
                            "title": "Glycemic Target Attained",
                            "summary": f"Latest HbA1c of {hba1c_val}% meets the ADA clinical target threshold of 7.0%.",
                            "recommendation": "Continue current antihyperglycemic regimen and schedule routine 6-month surveillance.",
                            "guideline": "ADA Clinical Practice Recommendations for Glycemic Control",
                            "target_resources": [
                                {"resourceType": "Observation", "id": latest_hba1c.get("id"), "display": f"HbA1c: {hba1c_val}%"}
                            ]
                        })
                except (ValueError, TypeError):
                    pass

    # -------------------------------------------------------------------------
    # Rule 3: Referential Integrity and Provenance Anomaly
    # -------------------------------------------------------------------------
    for med in medications:
        requester = med.get("requester", {})
        ref = requester.get("reference", "")
        if ref.startswith("Practitioner/"):
            prac_id = ref.split("Practitioner/")[1]
            target_prac = repository.get_resource("Practitioner", prac_id)
            if not target_prac:
                alerts.append({
                    "id": f"CDS-INTEGRITY-MISSING-PRAC-{med.get('id')}",
                    "severity": "CRITICAL",
                    "category": "Data Conformance & Safety",
                    "title": "Unresolved Prescribing Practitioner Reference",
                    "summary": f"Medication order references missing provider {ref}. Clinical authorship cannot be authenticated.",
                    "recommendation": "Reconcile practitioner registry identifier before transmitting clinical transfer bundle.",
                    "guideline": "HL7 FHIR R4 US Core Implementation Guide (Author Attribution)",
                    "target_resources": [
                        {"resourceType": "MedicationRequest", "id": med.get("id"), "display": "Active Medication Order"}
                    ]
                })

    return alerts

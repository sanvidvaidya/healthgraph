"""
HealthGraph Deterministic Synthetic FHIR R4 Dataset Generator.

Constructs rich, clinically authentic, longitudinal synthetic patient records
with realistic terminology codes (LOINC, SNOMED CT, ICD-10-CM, RxNorm, CPT)
and calibrated data-quality edge cases.
"""

import json
import os
from typing import List, Dict, Any


def generate_synthetic_bundle() -> Dict[str, Any]:
    """Builds complete FHIR R4 Bundle with 5 patients and realistic clinical histories."""

    entries: List[Dict[str, Any]] = []

    def add(res: Dict[str, Any]):
        entries.append({
            "fullUrl": f"urn:uuid:{res['resourceType']}-{res['id']}",
            "resource": res
        })

    # =========================================================================
    # 1. ORGANIZATIONS
    # =========================================================================
    org_metro = {
        "resourceType": "Organization",
        "id": "ORG-METRO",
        "active": True,
        "type": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                "code": "prov",
                "display": "Healthcare Provider"
            }],
            "text": "Academic Medical Center"
        }],
        "name": "Metropolitan Academic Health System",
        "telecom": [
            {"system": "phone", "value": "+1-617-555-0100", "use": "work"},
            {"system": "url", "value": "https://metrohealth.example.org", "use": "work"}
        ],
        "address": [{
            "use": "work",
            "line": ["750 Longwood Avenue"],
            "city": "Boston",
            "state": "MA",
            "postalCode": "02115",
            "country": "USA"
        }]
    }
    add(org_metro)

    org_lab = {
        "resourceType": "Organization",
        "id": "ORG-PRECISION-LAB",
        "active": True,
        "type": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                "code": "diag",
                "display": "Diagnostic Lab"
            }],
            "text": "Clinical Reference Laboratory"
        }],
        "name": "Precision Diagnostic Laboratories",
        "telecom": [{"system": "phone", "value": "+1-617-555-0199", "use": "work"}],
        "address": [{
            "use": "work",
            "line": ["100 Innovation Way"],
            "city": "Cambridge",
            "state": "MA",
            "postalCode": "02142",
            "country": "USA"
        }]
    }
    add(org_lab)

    # =========================================================================
    # 2. PRACTITIONERS
    # =========================================================================
    prac_jenkins = {
        "resourceType": "Practitioner",
        "id": "PRAC-JENKINS-01",
        "active": True,
        "identifier": [{
            "system": "http://hl7.org/fhir/sid/us-npi",
            "value": "1942857102"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Dr."],
            "given": ["Sarah"],
            "family": "Jenkins"
        }],
        "telecom": [{"system": "email", "value": "s.jenkins@metrohealth.example.org", "use": "work"}],
        "qualification": [{
            "code": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "394583002",
                    "display": "Endocrinology and diabetes mellitus"
                }],
                "text": "Board Certified Endocrinologist"
            }
        }]
    }
    add(prac_jenkins)

    prac_chen = {
        "resourceType": "Practitioner",
        "id": "PRAC-CHEN-02",
        "active": True,
        "identifier": [{
            "system": "http://hl7.org/fhir/sid/us-npi",
            "value": "1831746291"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Dr."],
            "given": ["Robert", "K."],
            "family": "Chen"
        }],
        "qualification": [{
            "code": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "394589003",
                    "display": "Nephrology"
                }],
                "text": "Consultant Nephrologist"
            }
        }]
    }
    add(prac_chen)

    prac_rostova = {
        "resourceType": "Practitioner",
        "id": "PRAC-ROSTOVA-03",
        "active": True,
        "identifier": [{
            "system": "http://hl7.org/fhir/sid/us-npi",
            "value": "1477583920"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Dr."],
            "given": ["Elena"],
            "family": "Rostova"
        }],
        "qualification": [{
            "code": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "394609007",
                    "display": "Cardiothoracic surgery"
                }],
                "text": "Cardiothoracic Surgeon"
            }
        }]
    }
    add(prac_rostova)

    prac_brody = {
        "resourceType": "Practitioner",
        "id": "PRAC-BRODY-04",
        "active": True,
        "identifier": [{
            "system": "http://hl7.org/fhir/sid/us-npi",
            "value": "1629485012"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Dr."],
            "given": ["Marcus"],
            "family": "Brody"
        }],
        "qualification": [{
            "code": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "394579002",
                    "display": "Cardiology"
                }],
                "text": "Clinical Cardiologist"
            }
        }]
    }
    add(prac_brody)

    prac_walsh = {
        "resourceType": "Practitioner",
        "id": "PRAC-WALSH-05",
        "active": True,
        "identifier": [{
            "system": "http://hl7.org/fhir/sid/us-npi",
            "value": "1358920147"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Dr."],
            "given": ["Amy", "L."],
            "family": "Walsh"
        }],
        "qualification": [{
            "code": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "394537008",
                    "display": "Pediatrics"
                }],
                "text": "Pediatrician"
            }
        }]
    }
    add(prac_walsh)

    # =========================================================================
    # 3. PATIENT 1: ELEANOR VANCE (T2D, CKD Stage 3a, HTN Longitudinal History)
    # =========================================================================
    pat_vance = {
        "resourceType": "Patient",
        "id": "PAT-VANCE-01",
        "active": True,
        "identifier": [{
            "use": "usual",
            "type": {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR"}],
                "text": "Medical Record Number"
            },
            "system": "http://metrohealth.example.org/mrn",
            "value": "MRN-849201"
        }],
        "name": [{
            "use": "official",
            "prefix": ["Ms."],
            "family": "Vance",
            "given": ["Eleanor", "Rose"]
        }],
        "telecom": [
            {"system": "phone", "value": "+1-617-555-0142", "use": "home"},
            {"system": "email", "value": "e.vance@example.org", "use": "home"}
        ],
        "gender": "female",
        "birthDate": "1958-04-12",
        "address": [{
            "use": "home",
            "line": ["42 Beacon Street", "Apt 3B"],
            "city": "Boston",
            "state": "MA",
            "postalCode": "02108",
            "country": "USA"
        }],
        "generalPractitioner": [{"reference": "Practitioner/PRAC-JENKINS-01", "display": "Dr. Sarah Jenkins"}],
        "managingOrganization": {"reference": "Organization/ORG-METRO", "display": "Metropolitan Academic Health System"}
    }
    add(pat_vance)

    # Patient 1 Conditions
    cond_t2d = {
        "resourceType": "Condition",
        "id": "COND-VANCE-T2D",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active", "display": "Active"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed", "display": "Confirmed"}]
        },
        "category": [{
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "problem-list-item", "display": "Problem List Item"}]
        }],
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "E11.9", "display": "Type 2 diabetes mellitus without complications"},
                {"system": "http://snomed.info/sct", "code": "44054006", "display": "Type 2 diabetes mellitus"}
            ],
            "text": "Type 2 Diabetes Mellitus"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "onsetDateTime": "2018-09-15"
    }
    add(cond_t2d)

    cond_ckd = {
        "resourceType": "Condition",
        "id": "COND-VANCE-CKD",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active", "display": "Active"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed", "display": "Confirmed"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "N18.31", "display": "Chronic kidney disease, stage 3a"},
                {"system": "http://snomed.info/sct", "code": "709044004", "display": "Chronic kidney disease stage 3"}
            ],
            "text": "Diabetic Chronic Kidney Disease, Stage 3a"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "onsetDateTime": "2023-01-20"
    }
    add(cond_ckd)

    cond_htn = {
        "resourceType": "Condition",
        "id": "COND-VANCE-HTN",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active", "display": "Active"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed", "display": "Confirmed"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "I10", "display": "Essential (primary) hypertension"},
                {"system": "http://snomed.info/sct", "code": "38341003", "display": "Hypertension"}
            ],
            "text": "Essential Hypertension"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "onsetDateTime": "2019-03-10"
    }
    add(cond_htn)

    # Patient 1: Encounters across 3 years
    enc_vance_1 = {
        "resourceType": "Encounter",
        "id": "ENC-VANCE-2023-03",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
        "type": [{
            "coding": [{"system": "http://snomed.info/sct", "code": "308335008", "display": "Patient encounter with doctor"}],
            "text": "Endocrinology Comprehensive Initial Review"
        }],
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "participant": [{
            "individual": {"reference": "Practitioner/PRAC-JENKINS-01", "display": "Dr. Sarah Jenkins"}
        }],
        "period": {"start": "2023-03-14T09:30:00Z", "end": "2023-03-14T10:45:00Z"},
        "reasonCode": [{"text": "Elevated uncontrolled fasting glucose and microalbuminuria"}],
        "diagnosis": [{"condition": {"reference": "Condition/COND-VANCE-T2D"}}],
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_vance_1)

    enc_vance_2 = {
        "resourceType": "Encounter",
        "id": "ENC-VANCE-2023-09",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
        "type": [{"text": "Endocrinology 6-Month Treatment Assessment"}],
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "participant": [{"individual": {"reference": "Practitioner/PRAC-JENKINS-01"}}],
        "period": {"start": "2023-09-18T14:00:00Z", "end": "2023-09-18T14:40:00Z"},
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_vance_2)

    enc_vance_3 = {
        "resourceType": "Encounter",
        "id": "ENC-VANCE-2024-02",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "EMER", "display": "emergency"},
        "type": [{
            "coding": [{"system": "http://snomed.info/sct", "code": "4525004", "display": "Emergency department visit"}],
            "text": "Emergency Department Acute Hyperglycemia Evaluation"
        }],
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "period": {"start": "2024-02-11T20:15:00Z", "end": "2024-02-12T04:30:00Z"},
        "reasonCode": [{"text": "Severe symptomatic hyperglycemia with nausea and dehydration"}],
        "diagnosis": [{"condition": {"reference": "Condition/COND-VANCE-T2D"}}],
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_vance_3)

    enc_vance_4 = {
        "resourceType": "Encounter",
        "id": "ENC-VANCE-2024-08",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
        "type": [{"text": "Nephrology Consultation & Renal Staging"}],
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "participant": [{"individual": {"reference": "Practitioner/PRAC-CHEN-02", "display": "Dr. Robert Chen"}}],
        "period": {"start": "2024-08-22T11:00:00Z", "end": "2024-08-22T11:50:00Z"},
        "diagnosis": [{"condition": {"reference": "Condition/COND-VANCE-CKD"}}],
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_vance_4)

    enc_vance_5 = {
        "resourceType": "Encounter",
        "id": "ENC-VANCE-2025-05",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
        "type": [{"text": "Annual Longitudinal Care Plan Review"}],
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "participant": [{"individual": {"reference": "Practitioner/PRAC-JENKINS-01"}}],
        "period": {"start": "2025-05-10T10:00:00Z", "end": "2025-05-10T10:45:00Z"},
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_vance_5)

    # Observations for Eleanor Vance across time (HbA1c longitudinal trend, eGFR, Blood Pressure)
    obs_data_vance = [
        # 2023-03 Visit
        ("OBS-VANCE-A1C-1", "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood", 9.4, "%", "2023-03-14T09:45:00Z", "ENC-VANCE-2023-03", 4.0, 5.6, "High"),
        ("OBS-VANCE-EGFR-1", "33914-3", "Glomerular filtration rate/1.73 sq M.predicted", 58.0, "mL/min/1.73m2", "2023-03-14T09:45:00Z", "ENC-VANCE-2023-03", 60.0, 120.0, "Low"),
        ("OBS-VANCE-BP-1", "85354-9", "Systolic Blood Pressure", 148.0, "mmHg", "2023-03-14T09:35:00Z", "ENC-VANCE-2023-03", 90.0, 120.0, "High"),
        ("OBS-VANCE-CREAT-1", "2160-0", "Creatinine [Mass/volume] in Serum or Plasma", 1.32, "mg/dL", "2023-03-14T09:45:00Z", "ENC-VANCE-2023-03", 0.5, 1.1, "High"),

        # 2023-09 Visit
        ("OBS-VANCE-A1C-2", "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood", 8.3, "%", "2023-09-18T14:15:00Z", "ENC-VANCE-2023-09", 4.0, 5.6, "High"),
        ("OBS-VANCE-EGFR-2", "33914-3", "Glomerular filtration rate/1.73 sq M.predicted", 56.0, "mL/min/1.73m2", "2023-09-18T14:15:00Z", "ENC-VANCE-2023-09", 60.0, 120.0, "Low"),
        ("OBS-VANCE-BP-2", "85354-9", "Systolic Blood Pressure", 138.0, "mmHg", "2023-09-18T14:05:00Z", "ENC-VANCE-2023-09", 90.0, 120.0, "High"),

        # 2024-02 Emergency Visit
        ("OBS-VANCE-GLUC-EMER", "2345-7", "Glucose [Mass/volume] in Serum or Plasma", 342.0, "mg/dL", "2024-02-11T20:30:00Z", "ENC-VANCE-2024-02", 70.0, 99.0, "Critical High"),
        ("OBS-VANCE-A1C-3", "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood", 8.8, "%", "2024-02-11T20:30:00Z", "ENC-VANCE-2024-02", 4.0, 5.6, "High"),
        ("OBS-VANCE-BP-3", "85354-9", "Systolic Blood Pressure", 154.0, "mmHg", "2024-02-11T20:20:00Z", "ENC-VANCE-2024-02", 90.0, 120.0, "High"),

        # 2024-08 Nephrology Visit
        ("OBS-VANCE-EGFR-3", "33914-3", "Glomerular filtration rate/1.73 sq M.predicted", 54.0, "mL/min/1.73m2", "2024-08-22T11:15:00Z", "ENC-VANCE-2024-08", 60.0, 120.0, "Low"),
        ("OBS-VANCE-ALB-CREAT", "14959-1", "Microalbumin/Creatinine in Urine", 185.0, "mg/g", "2024-08-22T11:15:00Z", "ENC-VANCE-2024-08", 0.0, 30.0, "High"),
        ("OBS-VANCE-A1C-4", "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood", 7.6, "%", "2024-08-22T11:15:00Z", "ENC-VANCE-2024-08", 4.0, 5.6, "High"),

        # 2025-05 Visit
        ("OBS-VANCE-A1C-5", "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood", 7.0, "%", "2025-05-10T10:15:00Z", "ENC-VANCE-2025-05", 4.0, 5.6, "Normal"),
        ("OBS-VANCE-EGFR-4", "33914-3", "Glomerular filtration rate/1.73 sq M.predicted", 57.0, "mL/min/1.73m2", "2025-05-10T10:15:00Z", "ENC-VANCE-2025-05", 60.0, 120.0, "Low"),
        ("OBS-VANCE-BP-4", "85354-9", "Systolic Blood Pressure", 126.0, "mmHg", "2025-05-10T10:05:00Z", "ENC-VANCE-2025-05", 90.0, 120.0, "Normal"),
    ]

    for obs_id, loinc, display, val, unit, eff_time, enc_id, ref_low, ref_high, interp in obs_data_vance:
        add({
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "category": [{
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "laboratory" if unit != "mmHg" else "vital-signs"}]
            }],
            "code": {
                "coding": [{"system": "http://loinc.org", "code": loinc, "display": display}],
                "text": display
            },
            "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
            "encounter": {"reference": f"Encounter/{enc_id}"},
            "effectiveDateTime": eff_time,
            "performer": [{"reference": "Organization/ORG-PRECISION-LAB"}],
            "valueQuantity": {
                "value": val,
                "unit": unit,
                "system": "http://unitsofmeasure.org",
                "code": unit
            },
            "referenceRange": [{
                "low": {"value": ref_low, "unit": unit},
                "high": {"value": ref_high, "unit": unit}
            }],
            "interpretation": [{
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", "code": "N" if interp == "Normal" else "H"}],
                "text": interp
            }]
        })

    # DiagnosticReport for Eleanor Vance (Renal Ultrasound)
    dr_renal = {
        "resourceType": "DiagnosticReport",
        "id": "DR-VANCE-RENAL-US",
        "status": "final",
        "category": [{
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0074", "code": "RAD", "display": "Radiology"}]
        }],
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "24748-6", "display": "Ultrasonography of kidney"}],
            "text": "Renal Ultrasound Bilateral"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "encounter": {"reference": "Encounter/ENC-VANCE-2024-08"},
        "effectiveDateTime": "2024-08-23T09:00:00Z",
        "issued": "2024-08-23T14:30:00Z",
        "performer": [{"reference": "Organization/ORG-METRO"}],
        "result": [
            {"reference": "Observation/OBS-VANCE-EGFR-3"},
            {"reference": "Observation/OBS-VANCE-ALB-CREAT"}
        ],
        "conclusion": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronephrosis or discrete calculi."
    }
    add(dr_renal)

    # Procedures for Eleanor Vance
    proc_eye = {
        "resourceType": "Procedure",
        "id": "PROC-VANCE-EYE-EXAM",
        "status": "completed",
        "code": {
            "coding": [{"system": "http://snomed.info/sct", "code": "171231001", "display": "Diabetic eye examination"}],
            "text": "Comprehensive Dilated Diabetic Eye Examination"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "encounter": {"reference": "Encounter/ENC-VANCE-2024-08"},
        "performedDateTime": "2024-08-25T13:30:00Z",
        "performer": [{"actor": {"reference": "Practitioner/PRAC-JENKINS-01"}}],
        "outcome": {"text": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema."}
    }
    add(proc_eye)

    # MedicationRequests for Eleanor Vance
    med_metformin = {
        "resourceType": "MedicationRequest",
        "id": "MED-VANCE-METFORMIN",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "860975", "display": "Metformin hydrochloride 1000 MG Extended Release Oral Tablet"}],
            "text": "Metformin ER 1000 mg Oral Tablet"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "encounter": {"reference": "Encounter/ENC-VANCE-2023-03"},
        "authoredOn": "2023-03-14T10:30:00Z",
        "requester": {"reference": "Practitioner/PRAC-JENKINS-01"},
        "reasonReference": [{"reference": "Condition/COND-VANCE-T2D"}],
        "dosageInstruction": [{
            "text": "Take 1 tablet by mouth twice daily with meals",
            "doseAndRate": [{"doseQuantity": {"value": 1000, "unit": "mg"}}]
        }]
    }
    add(med_metformin)

    med_lisinopril = {
        "resourceType": "MedicationRequest",
        "id": "MED-VANCE-LISINOPRIL",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "314076", "display": "Lisinopril 20 MG Oral Tablet"}],
            "text": "Lisinopril 20 mg Oral Tablet"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "encounter": {"reference": "Encounter/ENC-VANCE-2023-03"},
        "authoredOn": "2023-03-14T10:35:00Z",
        "requester": {"reference": "Practitioner/PRAC-JENKINS-01"},
        "reasonReference": [{"reference": "Condition/COND-VANCE-HTN"}, {"reference": "Condition/COND-VANCE-CKD"}],
        "dosageInstruction": [{
            "text": "Take 1 tablet by mouth daily in the morning",
            "doseAndRate": [{"doseQuantity": {"value": 20, "unit": "mg"}}]
        }]
    }
    add(med_lisinopril)

    med_empagliflozin = {
        "resourceType": "MedicationRequest",
        "id": "MED-VANCE-EMPAGLIFLOZIN",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "1545653", "display": "Empagliflozin 25 MG Oral Tablet"}],
            "text": "Jardiance (Empagliflozin) 25 mg Oral Tablet"
        },
        "subject": {"reference": "Patient/PAT-VANCE-01", "display": "Eleanor Vance"},
        "encounter": {"reference": "Encounter/ENC-VANCE-2024-08"},
        "authoredOn": "2024-08-22T11:45:00Z",
        "requester": {"reference": "Practitioner/PRAC-CHEN-02"},
        "reasonReference": [{"reference": "Condition/COND-VANCE-CKD"}],
        "dosageInstruction": [{
            "text": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
            "doseAndRate": [{"doseQuantity": {"value": 25, "unit": "mg"}}]
        }]
    }
    add(med_empagliflozin)

    # =========================================================================
    # 4. PATIENT 2: MARCUS THORNE (Acute Coronary Syndrome & Post-CABG)
    # =========================================================================
    pat_thorne = {
        "resourceType": "Patient",
        "id": "PAT-THORNE-02",
        "active": True,
        "identifier": [{
            "use": "usual",
            "system": "http://metrohealth.example.org/mrn",
            "value": "MRN-602931"
        }],
        "name": [{
            "use": "official",
            "family": "Thorne",
            "given": ["Marcus", "Anthony"]
        }],
        "gender": "male",
        "birthDate": "1966-11-28",
        "address": [{
            "line": ["15 Chestnut Hill Road"],
            "city": "Newton",
            "state": "MA",
            "postalCode": "02467",
            "country": "USA"
        }],
        "managingOrganization": {"reference": "Organization/ORG-METRO"}
    }
    add(pat_thorne)

    cond_stemi = {
        "resourceType": "Condition",
        "id": "COND-THORNE-STEMI",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "resolved", "display": "Resolved"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "I21.09", "display": "ST elevation myocardial infarction involving anterior wall"},
                {"system": "http://snomed.info/sct", "code": "401303003", "display": "Acute ST segment elevation myocardial infarction"}
            ],
            "text": "Acute Anteroseptal ST-Elevation Myocardial Infarction"
        },
        "subject": {"reference": "Patient/PAT-THORNE-02", "display": "Marcus Thorne"},
        "onsetDateTime": "2024-04-03T05:15:00Z"
    }
    add(cond_stemi)

    cond_cad = {
        "resourceType": "Condition",
        "id": "COND-THORNE-CAD",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active", "display": "Active"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "I25.10", "display": "Atherosclerotic heart disease of native coronary artery"},
                {"system": "http://snomed.info/sct", "code": "53741008", "display": "Coronary arteriosclerosis"}
            ],
            "text": "Severe Triple Vessel Coronary Artery Disease"
        },
        "subject": {"reference": "Patient/PAT-THORNE-02"},
        "onsetDateTime": "2024-04-03"
    }
    add(cond_cad)

    enc_thorne_inpatient = {
        "resourceType": "Encounter",
        "id": "ENC-THORNE-2024-04",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "IMP", "display": "inpatient encounter"},
        "type": [{"text": "Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization"}],
        "subject": {"reference": "Patient/PAT-THORNE-02", "display": "Marcus Thorne"},
        "participant": [
            {"individual": {"reference": "Practitioner/PRAC-ROSTOVA-03", "display": "Dr. Elena Rostova"}},
            {"individual": {"reference": "Practitioner/PRAC-BRODY-04", "display": "Dr. Marcus Brody"}}
        ],
        "period": {"start": "2024-04-03T06:00:00Z", "end": "2024-04-10T12:00:00Z"},
        "diagnosis": [{"condition": {"reference": "Condition/COND-THORNE-STEMI"}}],
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_thorne_inpatient)

    # Procedure: CABG
    proc_cabg = {
        "resourceType": "Procedure",
        "id": "PROC-THORNE-CABG",
        "status": "completed",
        "code": {
            "coding": [
                {"system": "http://www.ama-assn.org/go/cpt", "code": "33533", "display": "Coronary artery bypass, using arterial graft(s); single arterial graft"},
                {"system": "http://snomed.info/sct", "code": "232717009", "display": "Coronary artery bypass grafting"}
            ],
            "text": "Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)"
        },
        "subject": {"reference": "Patient/PAT-THORNE-02", "display": "Marcus Thorne"},
        "encounter": {"reference": "Encounter/ENC-THORNE-2024-04"},
        "performedDateTime": "2024-04-04T07:30:00Z",
        "performer": [{"actor": {"reference": "Practitioner/PRAC-ROSTOVA-03", "display": "Dr. Elena Rostova"}}],
        "outcome": {"text": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass."}
    }
    add(proc_cabg)

    # Observations: Troponin trajectory during STEMI
    trop_values = [
        ("OBS-THORNE-TROP-1", 1.45, "2024-04-03T06:30:00Z"),
        ("OBS-THORNE-TROP-2", 18.20, "2024-04-03T12:00:00Z"),
        ("OBS-THORNE-TROP-3", 8.40, "2024-04-04T06:00:00Z"),
        ("OBS-THORNE-TROP-4", 0.85, "2024-04-08T08:00:00Z"),
    ]
    for obs_id, val, timestamp in trop_values:
        add({
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "laboratory"}]}],
            "code": {
                "coding": [{"system": "http://loinc.org", "code": "49563-0", "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method"}],
                "text": "High Sensitivity Cardiac Troponin I"
            },
            "subject": {"reference": "Patient/PAT-THORNE-02", "display": "Marcus Thorne"},
            "encounter": {"reference": "Encounter/ENC-THORNE-2024-04"},
            "effectiveDateTime": timestamp,
            "valueQuantity": {"value": val, "unit": "ng/mL", "system": "http://unitsofmeasure.org", "code": "ng/mL"},
            "referenceRange": [{"high": {"value": 0.04, "unit": "ng/mL"}}],
            "interpretation": [{"text": "Abnormal Elevation / Myocardial Necrosis"}]
        })

    # Echocardiogram DiagnosticReport
    dr_echo = {
        "resourceType": "DiagnosticReport",
        "id": "DR-THORNE-ECHO",
        "status": "final",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0074", "code": "MB", "display": "Cardiology"}]}],
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "88062-5", "display": "Transthoracic echocardiogram panel"}],
            "text": "Post-Operative Transthoracic Echocardiogram"
        },
        "subject": {"reference": "Patient/PAT-THORNE-02", "display": "Marcus Thorne"},
        "encounter": {"reference": "Encounter/ENC-THORNE-2024-04"},
        "effectiveDateTime": "2024-04-08T10:00:00Z",
        "performer": [{"reference": "Practitioner/PRAC-BRODY-04"}],
        "result": [{"reference": "Observation/OBS-THORNE-TROP-4"}],
        "conclusion": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contractility. Grafts patent."
    }
    add(dr_echo)

    # Post-op Cardiology Ambulatory Follow-up
    enc_thorne_cardio = {
        "resourceType": "Encounter",
        "id": "ENC-THORNE-2024-10",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB"},
        "type": [{"text": "Outpatient Cardiology 6-Month Post-Surgical Follow-up"}],
        "subject": {"reference": "Patient/PAT-THORNE-02"},
        "participant": [{"individual": {"reference": "Practitioner/PRAC-BRODY-04"}}],
        "period": {"start": "2024-10-15T13:30:00Z", "end": "2024-10-15T14:15:00Z"},
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_thorne_cardio)

    med_atorvastatin = {
        "resourceType": "MedicationRequest",
        "id": "MED-THORNE-ATORVASTATIN",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "617312", "display": "Atorvastatin 80 MG Oral Tablet"}],
            "text": "Atorvastatin 80 mg Oral Tablet"
        },
        "subject": {"reference": "Patient/PAT-THORNE-02"},
        "encounter": {"reference": "Encounter/ENC-THORNE-2024-10"},
        "authoredOn": "2024-10-15T14:00:00Z",
        "requester": {"reference": "Practitioner/PRAC-BRODY-04"},
        "dosageInstruction": [{"text": "Take 1 tablet by mouth daily at bedtime"}]
    }
    add(med_atorvastatin)

    # =========================================================================
    # 5. PATIENT 3: SOFIA CHEN (Pediatric Asthma & Allergies)
    # =========================================================================
    pat_chen = {
        "resourceType": "Patient",
        "id": "PAT-CHEN-03",
        "active": True,
        "identifier": [{
            "use": "usual",
            "system": "http://metrohealth.example.org/mrn",
            "value": "MRN-330194"
        }],
        "name": [{
            "use": "official",
            "family": "Chen",
            "given": ["Sofia", "Mei"]
        }],
        "gender": "female",
        "birthDate": "2013-07-22",
        "address": [{
            "line": ["88 Harvard Street"],
            "city": "Brookline",
            "state": "MA",
            "postalCode": "02446",
            "country": "USA"
        }],
        "generalPractitioner": [{"reference": "Practitioner/PRAC-WALSH-05", "display": "Dr. Amy Walsh"}],
        "managingOrganization": {"reference": "Organization/ORG-METRO"}
    }
    add(pat_chen)

    cond_asthma = {
        "resourceType": "Condition",
        "id": "COND-CHEN-ASTHMA",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "J45.40", "display": "Moderate persistent asthma, uncomplicated"},
                {"system": "http://snomed.info/sct", "code": "195967001", "display": "Asthma"}
            ],
            "text": "Moderate Persistent Allergic Asthma"
        },
        "subject": {"reference": "Patient/PAT-CHEN-03"},
        "onsetDateTime": "2020-05-18"
    }
    add(cond_asthma)

    enc_chen_clinic = {
        "resourceType": "Encounter",
        "id": "ENC-CHEN-2024-09",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB"},
        "type": [{"text": "Pediatric Pulmonary Care & Spirometry Testing"}],
        "subject": {"reference": "Patient/PAT-CHEN-03"},
        "participant": [{"individual": {"reference": "Practitioner/PRAC-WALSH-05"}}],
        "period": {"start": "2024-09-04T15:00:00Z", "end": "2024-09-04T15:45:00Z"},
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_chen_clinic)

    obs_fev1 = {
        "resourceType": "Observation",
        "id": "OBS-CHEN-FEV1",
        "status": "final",
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "20150-9", "display": "FEV1"}],
            "text": "Forced Expiratory Volume in 1 Second (FEV1)"
        },
        "subject": {"reference": "Patient/PAT-CHEN-03"},
        "encounter": {"reference": "Encounter/ENC-CHEN-2024-09"},
        "effectiveDateTime": "2024-09-04T15:15:00Z",
        "valueQuantity": {"value": 1.78, "unit": "L", "system": "http://unitsofmeasure.org", "code": "L"},
        "referenceRange": [{"low": {"value": 2.10, "unit": "L"}}],
        "interpretation": [{"text": "Mild Obstructive Defect (76% Predicted)"}]
    }
    add(obs_fev1)

    med_albuterol = {
        "resourceType": "MedicationRequest",
        "id": "MED-CHEN-ALBUTEROL",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "745679", "display": "Albuterol 0.09 MG/ACTUAT Inhalant Metered Dose Inhaler"}],
            "text": "Albuterol HFA Inhaler 90 mcg/actuation"
        },
        "subject": {"reference": "Patient/PAT-CHEN-03"},
        "encounter": {"reference": "Encounter/ENC-CHEN-2024-09"},
        "authoredOn": "2024-09-04T15:30:00Z",
        "requester": {"reference": "Practitioner/PRAC-WALSH-05"},
        "dosageInstruction": [{"text": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing"}]
    }
    add(med_albuterol)

    # =========================================================================
    # 6. PATIENT 4: DAVID ROSS (Oncology Remission & Surveillance)
    # =========================================================================
    pat_ross = {
        "resourceType": "Patient",
        "id": "PAT-ROSS-04",
        "active": True,
        "identifier": [{
            "use": "usual",
            "system": "http://metrohealth.example.org/mrn",
            "value": "MRN-512093"
        }],
        "name": [{
            "use": "official",
            "family": "Ross",
            "given": ["David", "Edward"]
        }],
        "gender": "male",
        "birthDate": "1972-02-14",
        "address": [{
            "line": ["210 Commonwealth Avenue"],
            "city": "Boston",
            "state": "MA",
            "postalCode": "02116",
            "country": "USA"
        }],
        "managingOrganization": {"reference": "Organization/ORG-METRO"}
    }
    add(pat_ross)

    cond_colorectal = {
        "resourceType": "Condition",
        "id": "COND-ROSS-COLON",
        "clinicalStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "remission", "display": "Remission"}]
        },
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]
        },
        "code": {
            "coding": [
                {"system": "http://hl7.org/fhir/sid/icd-10-cm", "code": "C18.2", "display": "Malignant neoplasm of ascending colon"},
                {"system": "http://snomed.info/sct", "code": "363406005", "display": "Malignant tumor of colon"}
            ],
            "text": "Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)"
        },
        "subject": {"reference": "Patient/PAT-ROSS-04"},
        "onsetDateTime": "2021-10-10"
    }
    add(cond_colorectal)

    enc_ross_surv = {
        "resourceType": "Encounter",
        "id": "ENC-ROSS-2025-01",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB"},
        "type": [{"text": "Medical Oncology 3-Year Post-Treatment Surveillance"}],
        "subject": {"reference": "Patient/PAT-ROSS-04"},
        "period": {"start": "2025-01-14T09:00:00Z", "end": "2025-01-14T09:40:00Z"},
        "diagnosis": [{"condition": {"reference": "Condition/COND-ROSS-COLON"}}],
        "serviceProvider": {"reference": "Organization/ORG-METRO"}
    }
    add(enc_ross_surv)

    obs_cea = {
        "resourceType": "Observation",
        "id": "OBS-ROSS-CEA-2025",
        "status": "final",
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "2039-6", "display": "Carcinoembryonic Ag [Mass/volume] in Serum or Plasma"}],
            "text": "Carcinoembryonic Antigen (CEA)"
        },
        "subject": {"reference": "Patient/PAT-ROSS-04"},
        "encounter": {"reference": "Encounter/ENC-ROSS-2025-01"},
        "effectiveDateTime": "2025-01-14T09:15:00Z",
        "valueQuantity": {"value": 1.8, "unit": "ng/mL", "system": "http://unitsofmeasure.org", "code": "ng/mL"},
        "referenceRange": [{"high": {"value": 3.0, "unit": "ng/mL"}}],
        "interpretation": [{"text": "Normal / Undetectable Recurrence"}]
    }
    add(obs_cea)

    dr_ct_chest = {
        "resourceType": "DiagnosticReport",
        "id": "DR-ROSS-CT-SURV",
        "status": "final",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0074", "code": "RAD"}]}],
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "24627-2", "display": "CT Chest and Abdomen and Pelvis with IV contrast"}],
            "text": "Surveillance CT Chest/Abdomen/Pelvis"
        },
        "subject": {"reference": "Patient/PAT-ROSS-04"},
        "encounter": {"reference": "Encounter/ENC-ROSS-2025-01"},
        "effectiveDateTime": "2025-01-12T11:00:00Z",
        "result": [{"reference": "Observation/OBS-ROSS-CEA-2025"}],
        "conclusion": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical appearance."
    }
    add(dr_ct_chest)

    # =========================================================================
    # 7. PATIENT 5: INTENTIONAL DATA QUALITY ANOMALY COHORT ("PAT-ANOMALY-05")
    # Real-world data systems suffer from broken integrity, missing fields,
    # dangling pointers, and temporal clashes. These are deliberately engineered
    # so HealthGraph's data quality auditor can mathematically prove issues.
    # =========================================================================
    pat_anomaly = {
        "resourceType": "Patient",
        "id": "PAT-ANOMALY-05",
        "active": True,
        "identifier": [{
            "system": "http://metrohealth.example.org/mrn",
            "value": "MRN-ANOMALY-999"
        }],
        "name": [{
            "use": "temp",
            "family": "Subject-Unresolved",
            "given": ["Alex"]
        }],
        "gender": "unknown",
        # INTENTIONAL ISSUE 1: Missing birthDate (mandatory in many clinical validation profiles)
        "birthDate": None,
        "managingOrganization": {"reference": "Organization/ORG-METRO"}
    }
    add(pat_anomaly)

    enc_anomaly = {
        "resourceType": "Encounter",
        "id": "ENC-ANOMALY-01",
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB"},
        "subject": {"reference": "Patient/PAT-ANOMALY-05"},
        # Period: 2025-02-10 to 2025-02-10
        "period": {"start": "2025-02-10T10:00:00Z", "end": "2025-02-10T11:00:00Z"}
    }
    add(enc_anomaly)

    # INTENTIONAL ISSUE 2: Dangling reference to non-existent Practitioner/PRAC-99999
    med_dangling = {
        "resourceType": "MedicationRequest",
        "id": "MED-ANOMALY-DANGLING-PRAC",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "197361", "display": "Amlodipine 5 MG Oral Tablet"}],
            "text": "Amlodipine 5 mg Oral Tablet"
        },
        "subject": {"reference": "Patient/PAT-ANOMALY-05"},
        "encounter": {"reference": "Encounter/ENC-ANOMALY-01"},
        "authoredOn": "2025-02-10T10:30:00Z",
        "requester": {"reference": "Practitioner/PRAC-99999", "display": "Dr. Ghost Practitioner (Unresolved Reference)"}
    }
    add(med_dangling)

    # INTENTIONAL ISSUE 3: Orphan Resource (Observation without subject reference)
    obs_orphan = {
        "resourceType": "Observation",
        "id": "OBS-ANOMALY-ORPHAN",
        "status": "final",
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}],
            "text": "Heart rate measurement disconnected from any patient"
        },
        # subject and encounter are deliberately omitted (Orphan)
        "subject": None,
        "encounter": None,
        "effectiveDateTime": "2025-02-10T10:15:00Z",
        "valueQuantity": {"value": 78, "unit": "/min", "system": "http://unitsofmeasure.org", "code": "/min"}
    }
    add(obs_orphan)

    # INTENTIONAL ISSUE 4: Temporal Inconsistency
    # Observation timestamp is 2025-01-15, but associated Encounter period is 2025-02-10 (26 days prior!)
    obs_temporal_clash = {
        "resourceType": "Observation",
        "id": "OBS-ANOMALY-TEMPORAL-CLASH",
        "status": "final",
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "2951-2", "display": "Sodium [Moles/volume] in Serum or Plasma"}],
            "text": "Serum Sodium"
        },
        "subject": {"reference": "Patient/PAT-ANOMALY-05"},
        "encounter": {"reference": "Encounter/ENC-ANOMALY-01"},
        "effectiveDateTime": "2025-01-15T08:00:00Z",  # Temporal contradiction with Encounter period!
        "valueQuantity": {"value": 140, "unit": "mmol/L", "system": "http://unitsofmeasure.org", "code": "mmol/L"}
    }
    add(obs_temporal_clash)

    # INTENTIONAL ISSUE 5: Duplicate Resource ID with conflicting payload
    obs_duplicate = {
        "resourceType": "Observation",
        "id": "OBS-ANOMALY-TEMPORAL-CLASH",  # Exact duplicate ID!
        "status": "preliminary",
        "code": {
            "coding": [{"system": "http://loinc.org", "code": "2951-2", "display": "Sodium [Moles/volume] in Serum or Plasma"}],
            "text": "Serum Sodium (Conflicting Ingestion Copy)"
        },
        "subject": {"reference": "Patient/PAT-ANOMALY-05"},
        "encounter": {"reference": "Encounter/ENC-ANOMALY-01"},
        "effectiveDateTime": "2025-01-15T08:05:00Z",
        "valueQuantity": {"value": 144, "unit": "mmol/L", "system": "http://unitsofmeasure.org", "code": "mmol/L"}
    }
    add(obs_duplicate)

    # INTENTIONAL ISSUE 6: Missing required clinicalStatus on Condition
    cond_invalid_status = {
        "resourceType": "Condition",
        "id": "COND-ANOMALY-MISSING-STATUS",
        # clinicalStatus is omitted!
        "clinicalStatus": None,
        "verificationStatus": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]
        },
        "code": {
            "coding": [{"system": "http://snomed.info/sct", "code": "386661006", "display": "Fever"}],
            "text": "Pyrexia of unknown origin"
        },
        "subject": {"reference": "Patient/PAT-ANOMALY-05"}
    }
    add(cond_invalid_status)

    bundle = {
        "resourceType": "Bundle",
        "id": "HEALTHGRAPH-SYNTHETIC-R4-BUNDLE",
        "type": "collection",
        "timestamp": "2026-03-01T00:00:00Z",
        "total": len(entries),
        "entry": entries
    }

    return bundle


def save_bundle_to_file(filepath: str) -> None:
    bundle = generate_synthetic_bundle()
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2)
    print(f"Saved {bundle['total']} FHIR resources to {filepath}")


if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "synthetic_bundle.json")
    save_bundle_to_file(out_path)

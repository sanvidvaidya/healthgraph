"""
HealthGraph Curated Terminology Explorer & Cross-Terminology Mapping Engine.

Demonstrates representative healthcare terminologies:
- LOINC (Observational laboratory tests & vital signs)
- SNOMED CT (Comprehensive clinical concepts, procedures, findings)
- ICD-10-CM (Epidemiological diagnostic & reimbursement classification)
- RxNorm (Standardized clinical drug ingredients, strengths, and dose forms)

Educates on why structural FHIR validity does not guarantee semantic interoperability
when terminology systems diverge.
"""

from typing import Dict, Any, List


CURATED_TERMINOLOGY_CATALOG: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # LOINC (Logical Observation Identifiers Names and Codes)
    # -------------------------------------------------------------------------
    {
        "system": "http://loinc.org",
        "systemName": "LOINC",
        "code": "4548-4",
        "display": "Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "Laboratory",
        "usedInResource": "Observation",
        "usedInField": "code",
        "clinicalMeaning": "Measures the percentage of glycated hemoglobin in whole blood, providing a 3-month retrospective average of glycemic control.",
        "interopChallenge": "Local hospital systems frequently code this test as 'GLYC_HGB' or 'HBA1C_TEST'. Without standard LOINC 4548-4, receiving systems cannot aggregate diabetes registries across care networks."
    },
    {
        "system": "http://loinc.org",
        "systemName": "LOINC",
        "code": "33914-3",
        "display": "Glomerular filtration rate/1.73 sq M.predicted",
        "category": "Laboratory",
        "usedInResource": "Observation",
        "usedInField": "code",
        "clinicalMeaning": "Calculated rate of kidney filtration per body surface area, crucial for staging chronic kidney disease and adjusting renal drug clearance.",
        "interopChallenge": "Different labs use older MDRD equations vs. modern CKD-EPI 2021 equations. If the LOINC code or method is unstandardized, medication dosing calculators cannot safely parse the value."
    },
    {
        "system": "http://loinc.org",
        "systemName": "LOINC",
        "code": "49563-0",
        "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method",
        "category": "Laboratory",
        "usedInResource": "Observation",
        "usedInField": "code",
        "clinicalMeaning": "Sensitive biomarker for myocardial injury and necrosis; indispensable for rapid triaging of acute myocardial infarction.",
        "interopChallenge": "Standard vs. high-sensitivity troponin assays have different reference ranges (ng/mL vs. ng/L). Failure to standardize LOINC codes can lead to misinterpretation of abnormal thresholds."
    },
    {
        "system": "http://loinc.org",
        "systemName": "LOINC",
        "code": "85354-9",
        "display": "Blood pressure panel with all children optional",
        "category": "Vital Signs",
        "usedInResource": "Observation",
        "usedInField": "code",
        "clinicalMeaning": "Container code representing paired systolic and diastolic arterial blood pressure measurements.",
        "interopChallenge": "If a clinic records BP as free text '120/80' inside a valueString instead of nested systolic (8480-6) and diastolic (8462-4) quantitative components, CDS engines cannot trigger hypertension protocols."
    },
    {
        "system": "http://loinc.org",
        "systemName": "LOINC",
        "code": "20150-9",
        "display": "FEV1",
        "category": "Pulmonary Function",
        "usedInResource": "Observation",
        "usedInField": "code",
        "clinicalMeaning": "Forced Expiratory Volume in 1 second during maximal spirometric exhalation.",
        "interopChallenge": "Must be standardized with both absolute liters and percent of predicted value for pediatric asthma monitoring."
    },

    # -------------------------------------------------------------------------
    # SNOMED CT (Systematized Nomenclature of Medicine -- Clinical Terms)
    # -------------------------------------------------------------------------
    {
        "system": "http://snomed.info/sct",
        "systemName": "SNOMED CT",
        "code": "44054006",
        "display": "Type 2 diabetes mellitus",
        "category": "Clinical Condition",
        "usedInResource": "Condition",
        "usedInField": "code",
        "clinicalMeaning": "Polygenic metabolic disorder characterized by peripheral insulin resistance and progressive pancreatic beta-cell dysfunction.",
        "interopChallenge": "SNOMED CT provides polyhierarchical relationships (e.g. is-a 'Diabetes mellitus', is-a 'Endocrine disease'), enabling rich semantic querying that flat classification systems cannot match."
    },
    {
        "system": "http://snomed.info/sct",
        "systemName": "SNOMED CT",
        "code": "401303003",
        "display": "Acute ST segment elevation myocardial infarction",
        "category": "Clinical Condition",
        "usedInResource": "Condition",
        "usedInField": "code",
        "clinicalMeaning": "Acute transmural cardiac ischemia resulting in characteristic ECG ST-elevation requiring emergent revascularization.",
        "interopChallenge": "Clinical decision support systems rely on precise SNOMED concepts to distinguish between NSTEMI and STEMI for urgent catheterization lab activation."
    },
    {
        "system": "http://snomed.info/sct",
        "systemName": "SNOMED CT",
        "code": "232717009",
        "display": "Coronary artery bypass grafting",
        "category": "Procedure",
        "usedInResource": "Procedure",
        "usedInField": "code",
        "clinicalMeaning": "Surgical procedure where autologous venous or arterial conduits are grafted to bypass occluded coronary arteries.",
        "interopChallenge": "Hospital surgical billing systems often use CPT codes (e.g. 33533) while electronic clinical records use SNOMED CT. Interoperability requires bidirectional mapping."
    },

    # -------------------------------------------------------------------------
    # ICD-10-CM (International Classification of Diseases, 10th Revision)
    # -------------------------------------------------------------------------
    {
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "systemName": "ICD-10-CM",
        "code": "E11.9",
        "display": "Type 2 diabetes mellitus without complications",
        "category": "Diagnosis / Classification",
        "usedInResource": "Condition",
        "usedInField": "code",
        "clinicalMeaning": "Standard diagnostic billing classification for adult-onset diabetes mellitus without specified acute or chronic microvascular manifestations.",
        "interopChallenge": "ICD-10-CM is optimized for statistical reporting and reimbursement rather than clinical granular documentation. Combining it with SNOMED CT in FHIR CodeableConcepts bridges billing and clinical care."
    },
    {
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "systemName": "ICD-10-CM",
        "code": "N18.31",
        "display": "Chronic kidney disease, stage 3a",
        "category": "Diagnosis / Classification",
        "usedInResource": "Condition",
        "usedInField": "code",
        "clinicalMeaning": "Moderate reduction in glomerular filtration rate (eGFR 45-59 mL/min/1.73 m2).",
        "interopChallenge": "Earlier ICD-9 codes lacked stage-specific precision (e.g. separating Stage 3 into 3a and 3b), causing historical longitudinal gaps during EHR data migrations."
    },
    {
        "system": "http://hl7.org/fhir/sid/icd-10-cm",
        "systemName": "ICD-10-CM",
        "code": "I21.09",
        "display": "ST elevation myocardial infarction involving anterior wall",
        "category": "Diagnosis / Classification",
        "usedInResource": "Condition",
        "usedInField": "code",
        "clinicalMeaning": "Anatomically localized acute coronary thrombosis of the left anterior descending artery.",
        "interopChallenge": "Administrative claims data often contain this code months after discharge, whereas real-time clinical exchange requires immediate FHIR Encounter and Condition messaging."
    },

    # -------------------------------------------------------------------------
    # RxNorm (Standardized Clinical Drug Naming)
    # -------------------------------------------------------------------------
    {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "systemName": "RxNorm",
        "code": "860975",
        "display": "Metformin hydrochloride 1000 MG Extended Release Oral Tablet",
        "category": "Medication Clinical Drug",
        "usedInResource": "MedicationRequest",
        "usedInField": "medicationCodeableConcept",
        "clinicalMeaning": "Biguanide oral antidiabetic drug in extended-release tablet form with precise 1000 mg active ingredient formulation.",
        "interopChallenge": "National Drug Codes (NDCs) change whenever packaging or manufacturer changes (thousands of NDCs exist for Metformin). RxNorm normalizes all NDC variants into a single clinical concept."
    },
    {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "systemName": "RxNorm",
        "code": "314076",
        "display": "Lisinopril 20 MG Oral Tablet",
        "category": "Medication Clinical Drug",
        "usedInResource": "MedicationRequest",
        "usedInField": "medicationCodeableConcept",
        "clinicalMeaning": "Angiotensin-converting enzyme (ACE) inhibitor for treatment of hypertension and renal protection in diabetic nephropathy.",
        "interopChallenge": "Pharmacy dispensing systems and hospital formularies often use brand aliases (Prinivil, Zestril). RxNorm enables universal automated cross-allergy checks."
    },
    {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "systemName": "RxNorm",
        "code": "1545653",
        "display": "Empagliflozin 25 MG Oral Tablet",
        "category": "Medication Clinical Drug",
        "usedInResource": "MedicationRequest",
        "usedInField": "medicationCodeableConcept",
        "clinicalMeaning": "Sodium-glucose co-transporter 2 (SGLT2) inhibitor with documented cardiorenal mortality reduction in diabetic chronic kidney disease.",
        "interopChallenge": "Ensures seamless transmission across ambulatory e-prescribing networks to community retail pharmacies."
    }
]


def get_terminology_catalog() -> List[Dict[str, Any]]:
    """Returns curated synthetic terminology subset."""
    return CURATED_TERMINOLOGY_CATALOG


def get_interoperability_lesson() -> Dict[str, Any]:
    """Educational breakdown of why terminology standardization is foundational."""
    return {
        "thesis": "FHIR structures healthcare information into resources and references; terminology systems provide unambiguous, computable meaning to clinical concepts.",
        "problemStatement": (
            "A FHIR resource can be 100% syntactically valid JSON and pass all schema validators while still failing "
            "completely at interoperability. For instance, an Observation with code: {text: 'A1C'} and no system/code "
            "cannot be computed by an external clinical decision support algorithm or quality registry."
        ),
        "theFourSystems": [
            {
                "system": "LOINC",
                "authority": "Regenstrief Institute",
                "role": "Questions & Observations (Labs, Vitals, Survey Instruments)",
                "example": "4548-4 -> HbA1c in Blood"
            },
            {
                "system": "SNOMED CT",
                "authority": "SNOMED International",
                "role": "Clinical Findings, Diseases, Anatomical Sites, Surgical Procedures",
                "example": "44054006 -> Type 2 diabetes mellitus"
            },
            {
                "system": "ICD-10-CM",
                "authority": "WHO / CDC NCHS",
                "role": "Mortality, Morbidity Classification & Administrative Billing",
                "example": "E11.9 -> Type 2 diabetes mellitus without complications"
            },
            {
                "system": "RxNorm",
                "authority": "U.S. National Library of Medicine",
                "role": "Normalized Clinical Drugs (Ingredient + Strength + Dose Form)",
                "example": "860975 -> Metformin HCl 1000 MG ER Tablet"
            }
        ]
    }

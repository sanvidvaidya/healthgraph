# HealthGraph Methodology & System Boundaries

## 1. Pedagogical Methodology

HealthGraph was conceived to develop authentic domain understanding in:
- Healthcare information architectures
- HL7 FHIR Release 4 specification mechanics
- Clinical data modeling and terminology binding
- Referential integrity in distributed health networks
- Longitudinal patient record synthesis
- Systems thinking across clinical workflows

---

## 2. Synthetic Patient Cohort Design

All patient records within HealthGraph are 100% synthetic, crafted deterministically to illustrate authentic longitudinal trajectories without using real protected health information (PHI).

### Patient Cohort Profiles
1. **Eleanor Vance (`PAT-VANCE-01`)**:
   - **Archetype**: Chronic complex multi-morbidity (Type 2 Diabetes, Diabetic Nephropathy Stage 3a, Essential Hypertension).
   - **Longitudinal Breadth**: 5 care encounters across 3 years (2023-2025).
   - **Clinical Data**: 18 observations tracking HbA1c trajectory (improving from 9.4% down to 7.0%), eGFR trends, urine microalbumin, bilateral renal ultrasound diagnostic report, and prescriptions for Metformin, Lisinopril, and Empagliflozin.
2. **Marcus Thorne (`PAT-THORNE-02`)**:
   - **Archetype**: Acute coronary emergency & surgical revascularization.
   - **Longitudinal Breadth**: Inpatient acute admission for anteroseptal STEMI, triple CABG surgical procedure, post-op echocardiogram report, and cardiology ambulatory follow-up.
   - **Clinical Data**: High-sensitivity Troponin I elevation curve (1.45 → 18.20 → 8.40 → 0.85 ng/mL), Atorvastatin and Metoprolol requests.
3. **Sofia Chen (`PAT-CHEN-03`)**:
   - **Archetype**: Pediatric respiratory care & allergy management.
   - **Clinical Data**: Moderate persistent asthma, spirometric pulmonary function testing (FEV1 1.78 L, 76% predicted), Albuterol HFA metered dose inhaler.
4. **David Ross (`PAT-ROSS-04`)**:
   - **Archetype**: Oncology remission & longitudinal surveillance.
   - **Clinical Data**: History of ascending colon adenocarcinoma (complete remission), surveillance CT Chest/Abdomen report, normal CEA tumor biomarker.

---

## 3. Preserved Real-World Intentional Anomalies (`PAT-ANOMALY-05`)

To test information systems authentically, HealthGraph engineers calibrated data flaws into the synthetic dataset:

| Issue Code | Severity | Affected Resource | Clinical Finding & Impact |
| :--- | :--- | :--- | :--- |
| `dangling-reference` | `ERROR` | `MedicationRequest/MED-ANOMALY-DANGLING-PRAC` | References non-existent `Practitioner/PRAC-99999`. Provider attribution broken. |
| `orphan-resource` | `WARNING` | `Observation/OBS-ANOMALY-ORPHAN` | Heart rate measurement lacks `subject` pointer. Finding unlinked to any patient. |
| `temporal-clash` | `WARNING` | `Observation/OBS-ANOMALY-TEMPORAL-CLASH` | Observation dated 2025-01-15, but parent encounter starts 2025-02-10 (26 days prior). |
| `duplicate-id` | `ERROR` | `Observation/OBS-ANOMALY-TEMPORAL-CLASH` | Conflicting observation sharing duplicate logical ID with different sodium values. |
| `missing-clinical-status`| `ERROR` | `Condition/COND-ANOMALY-MISSING-STATUS` | Condition missing required `clinicalStatus` code. |
| `missing-birthdate` | `INFORMATION` | `Patient/PAT-ANOMALY-05` | Patient record lacks `birthDate` (optional in base FHIR, mandated in US Core). |

---

## 4. What HealthGraph Is NOT (System Boundaries)

To maintain intellectual credibility and avoid overclaiming, HealthGraph defines explicit scope boundaries:

- **NOT a Production Electronic Health Record (EHR)**: Does not provide order entry, provider scheduling, medical billing, or clinical notes.
- **NOT an AI Doctor or Diagnostic Tool**: Provides zero diagnoses, medical advice, or clinical decision support.
- **NOT a HIPAA-Compliant Production Environment**: Operates purely on local synthetic data with zero real patient information.
- **NOT a Complete FHIR Server**: Implements an educational profile-aware subset of 10 primary FHIR R4 resources.
- **NOT a Complete Terminology Server**: Provides a curated educational subset of LOINC, SNOMED CT, ICD-10-CM, and RxNorm concepts.
- **NOT an AI Wrapper or Chatbot**: The entire core system (ingestion, validation, resolution, graph, timeline, quality metrics) operates on deterministic algorithms and pure Python libraries.

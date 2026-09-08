# HealthGraph Clinical Data Model

## 1. Overview

HealthGraph implements an educational subset of **HL7® FHIR® Release 4 (R4)** foundational clinical and administrative resources using **Pydantic v2** models.

The architecture enforces strict separation between:
1. **Raw FHIR Representations**: Standard FHIR JSON payloads strictly matching official element names (`resourceType`, `identifier`, `code`, `subject`, `encounter`, etc.).
2. **Normalized Internal Models**: Relational structures and graph representations used for high-speed indexed lookups, topological traversals, and longitudinal timelines.

---

## 2. Core Supported FHIR R4 Resources

### 2.1 Patient (Demographics & Care Governance)
Demographic and administrative identity for individuals receiving care:
- `id`: Logical resource identifier (`PAT-VANCE-01`, `PAT-THORNE-02`, etc.)
- `identifier`: Business identifiers, notably Medical Record Numbers (MRN) under system `http://metrohealth.example.org/mrn`
- `name`: HumanName array with `given`, `family`, and `prefix`
- `telecom`: ContactPoint array (phone, email)
- `gender`: `female` | `male` | `other` | `unknown`
- `birthDate`: String formatted as `YYYY-MM-DD`
- `address`: Address array (home line, city, state, postalCode)
- `generalPractitioner`: References to primary governing clinicians (`Practitioner/PRAC-JENKINS-01`)
- `managingOrganization`: Reference to custodian health system (`Organization/ORG-METRO`)

### 2.2 Encounter (Clinical Context & Containers)
Interactions between a patient and healthcare providers:
- `status`: `planned` | `arrived` | `triaged` | `in-progress` | `onleave` | `finished` | `cancelled`
- `class`: Coding under `http://terminology.hl7.org/CodeSystem/v3-ActCode` (`AMB` for ambulatory, `IMP` for inpatient, `EMER` for emergency)
- `type`: CodeableConcept array detailing service (e.g. "Endocrinology Comprehensive Review")
- `subject`: Mandatory Reference to `Patient`
- `participant`: Array of healthcare professionals involved (`Practitioner`)
- `period`: Period with `start` and `end` timestamps
- `reasonCode`: Clinical justification for encounter
- `diagnosis`: Linked diagnoses pointing to `Condition` resources
- `serviceProvider`: Reference to `Organization`

### 2.3 Observation (Measurements & Biomarkers)
Quantitative lab measurements, vital signs, and diagnostic assertions:
- `status`: `registered` | `preliminary` | `final` | `amended`
- `category`: CodeableConcept array (`vital-signs` or `laboratory`)
- `code`: CodeableConcept with standard LOINC coding (`4548-4`, `33914-3`, etc.)
- `subject`: Reference to `Patient`
- `encounter`: Reference to parent `Encounter`
- `effectiveDateTime`: Clinical observation timestamp
- `performer`: Reference to lab or provider (`Organization/ORG-PRECISION-LAB`)
- `valueQuantity`: Quantitative measurement with `value`, `unit`, and UCUM `system` (`http://unitsofmeasure.org`)
- `referenceRange`: Low and high reference thresholds
- `interpretation`: ObservationInterpretation code (`N` for normal, `H` for high)

### 2.4 Condition (Problem List & Diagnoses)
Clinical conditions, problems, diagnoses, and illnesses:
- `clinicalStatus`: CodeableConcept under `http://terminology.hl7.org/CodeSystem/condition-clinical` (`active` | `recurrence` | `relapse` | `inactive` | `remission` | `resolved`)
- `verificationStatus`: `confirmed` | `provisional` | `refuted`
- `code`: CodeableConcept with paired ICD-10-CM and SNOMED CT codings
- `subject`: Mandatory Reference to `Patient`
- `onsetDateTime`: Onset date of condition

### 2.5 Procedure (Clinical Interventions)
Actions performed on or for a patient:
- `status`: `preparation` | `in-progress` | `completed` | `stopped`
- `code`: CodeableConcept with CPT or SNOMED CT coding (`232717009` for CABG)
- `subject`: Reference to `Patient`
- `encounter`: Reference to parent `Encounter`
- `performedDateTime`: Timestamp of surgical or clinical execution
- `performer`: Clinicians executing procedure (`Practitioner/PRAC-ROSTOVA-03`)
- `outcome`: Clinical narrative of procedural outcome

### 2.6 DiagnosticReport (Diagnostic Findings & Summaries)
Structured findings and narrative interpretation of diagnostic tests:
- `status`: `registered` | `preliminary` | `final`
- `category`: Coding under `http://terminology.hl7.org/CodeSystem/v2-0074` (`RAD` for radiology, `MB` for cardiology)
- `code`: LOINC code defining study type (`24748-6` for Renal Ultrasound)
- `subject`: Reference to `Patient`
- `encounter`: Reference to `Encounter`
- `result`: Array of References to constituent `Observation` resources
- `conclusion`: Radiologist or cardiologist narrative impression

### 2.7 MedicationRequest (Prescription Orders)
Orders for supply and administration of medications:
- `status`: `active` | `on-hold` | `cancelled` | `completed` | `stopped`
- `intent`: `order` | `plan` | `proposal`
- `medicationCodeableConcept`: Standard RxNorm clinical drug concept
- `subject`: Reference to `Patient`
- `encounter`: Reference to `Encounter`
- `authoredOn`: Prescription order timestamp
- `requester`: Reference to ordering `Practitioner`
- `dosageInstruction`: Structured and narrative administration instructions

### 2.8 Practitioner & Organization (Administrative Actors)
Healthcare providers and institutional entities:
- **Practitioner**: Healthcare professionals with NPI identifier, HumanName, and SNOMED CT specialty qualifications. Note that in FHIR R4, Practitioner utilizes an `active` boolean rather than a `status` string.
- **Organization**: Hospital systems, academic medical centers, and reference laboratories with address, telecom, and organization type.

---

## 3. Reference Mechanics & Pointer Parsing

All inter-resource references follow standard FHIR relative format:
- `ResourceName/logical-id` (e.g. `Patient/PAT-VANCE-01`, `Encounter/ENC-VANCE-2023-03`)
- Reference Resolver splits references via `reference.split("/")` to isolate `(resource_type, id)`.
- When an outbound reference targets an ID absent from the repository, the engine designates it as a **Dangling Reference** and logs a finding under the **Referential Integrity** quality dimension.

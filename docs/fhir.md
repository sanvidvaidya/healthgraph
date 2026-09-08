# HL7® FHIR® R4 Standards & Profiling Concepts

## 1. The HL7 FHIR Framework

**Fast Healthcare Interoperability Resources (FHIR®)**, developed by Health Level Seven International (HL7®), is the global open standard for electronic healthcare information exchange.

FHIR Release 4 (R4) represents the first normative release of the standard, establishing stable core data models for healthcare data exchange across APIs.

---

## 2. The 80/20 Architectural Rule

One of FHIR's most foundational design decisions is the **80/20 rule**:
> The core international FHIR specification defines only those elements and attributes that are implemented in at least 80% of healthcare systems globally.

The remaining 20% of specialized requirements (such as regional race/ethnicity demographics, specialized military veteran statuses, complex clinical research protocols, or country-specific billing codes) are handled through FHIR's formal extension mechanism.

---

## 3. The Hierarchy: Base FHIR → Profiles → Implementation Guides

A common misconception in healthcare technology is that a system being "FHIR compliant" guarantees automatic out-of-the-box interoperability.

In reality, interoperability operates across hierarchical layers:

```
┌───────────────────────────────────────────────────────────┐
│                    Base FHIR R4 Core                      │
│  - Broad international standard                           │
│  - High optionality (e.g. birthDate is optional)          │
│  - Permissive terminology bindings                        │
└─────────────────────────────┬─────────────────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Profiles & Implementation Guides             │
│  - National/jurisdictional constraints (e.g. US Core)     │
│  - Enforces mandatory elements (e.g. birthDate mandatory) │
│  - Restricts coding systems (e.g. must use RxNorm)        │
└─────────────────────────────┬─────────────────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────┐
│                   HealthGraph Ingestion                   │
│  - 3-Layer Profile-Aware Validation                       │
│  - Resolves cross-resource references                     │
│  - Audits referential and temporal consistency            │
└───────────────────────────────────────────────────────────┘
```

### 3.1 Base FHIR R4
The base standard intentionally maximizes flexibility. For example:
- `Patient.birthDate` is optional in base FHIR R4 because anonymous emergency admissions or disaster response records may lack dates of birth.
- `Observation.subject` is technically optional in base FHIR to allow environmental measurements (e.g. hospital water testing).

### 3.2 FHIR Profiles & Implementation Guides (e.g. US Core)
When healthcare networks actually exchange patient data, national or organizational Implementation Guides constrain the base resources:
- **US Core Patient Profile**: Mandates `birthDate`, `name`, and requires at least one identifier with system and value.
- **US Core Laboratory Observation Profile**: Mandates `status`, `category` of `laboratory`, standard LOINC coding, and a mandatory `subject` pointing to a Patient.

### 3.3 HealthGraph Implementation Layer
HealthGraph's validator operates at this intermediate profile-aware layer. It validates base schema syntax while flagging clinical omissions (e.g., missing birthDate) as informational or warning findings rather than fatal syntax crashes.

---

## 4. CapabilityStatement (Conformance Metadata)

Under FHIR REST rules, every compliant FHIR server must expose a `CapabilityStatement` at the well-known endpoint:
```
GET /fhir/metadata
```

HealthGraph's CapabilityStatement explicitly declares:
- FHIR Version: `4.0.1`
- Supported Resource Types: `Patient`, `Encounter`, `Observation`, `Condition`, `Procedure`, `DiagnosticReport`, `MedicationRequest`, `Practitioner`, `Organization`
- Scope: Educational subset focusing on reference graphs and longitudinal modeling.

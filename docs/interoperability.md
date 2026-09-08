# Healthcare Interoperability & Conformance

## 1. The Four Levels of Healthcare Conformance

A central pedagogical goal of HealthGraph is disproving the idea that "valid JSON equals interoperable data."

HealthGraph explicitly distinguishes four discrete levels of conformance:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Syntactic Validity                                       │
│    - Valid JSON payload per RFC 8259                        │
│    - Balanced brackets, correct commas, valid scalar types  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Structural / Resource Validity                           │
│    - Declared resourceType exists in FHIR R4                │
│    - Fields conform to expected primitive or complex types  │
│    - Resource-specific required fields are present          │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Referential Integrity                                    │
│    - Foreign pointers ('Patient/123') target extant entities │
│    - Absence of dangling foreign keys                       │
│    - Inbound and outbound dependency resolution             │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Semantic & Interoperability Usefulness                   │
│    - Concepts coded in canonical terminologies              │
│    - Temporal consistency across clinical episodes          │
│    - Sufficient clinical context for clinical exchange      │
└─────────────────────────────────────────────────────────────┘
```

A resource can pass Level 1 and Level 2 with zero schema errors while completely failing Level 3 (e.g. referencing a non-existent clinician) and Level 4 (e.g. using proprietary local lab text instead of LOINC).

---

## 2. Terminology Divergence as an Interoperability Barrier

Healthcare interoperability requires two separate technologies:
1. **Structure (FHIR)**: Defines the containers, entities, and relationship pointers.
2. **Semantics (Terminology)**: Defines the medical meaning of codes inside those containers.

### The Problem in Practice
Consider two hospital networks exchanging a fasting blood glucose observation:
- **Hospital A** exports:
  ```json
  {
    "resourceType": "Observation",
    "code": {
      "text": "FBS_LAB",
      "coding": [{"system": "http://hospital-a.local/lab-codes", "code": "GLUC-FAST"}]
    },
    "valueQuantity": {"value": 115, "unit": "mg/dL"}
  }
  ```
- **Hospital B's Clinical Decision Support Engine** searches for:
  ```
  code = "http://loinc.org|1558-6" (Fasting Glucose)
  ```

Because Hospital A did not map its internal lab mnemonic to standard LOINC `1558-6`, Hospital B's system cannot compute the value. The data arrived, parsed without error, yet completely failed to interoperate.

### The Four Standard Pillars in HealthGraph
- **LOINC**: Laboratory tests, vital signs, and survey instruments (e.g. `4548-4` for HbA1c).
- **SNOMED CT**: Comprehensive clinical terms, diseases, anatomical sites, and procedures (e.g. `44054006` for Type 2 Diabetes).
- **ICD-10-CM**: Diagnostic and epidemiological classification for billing and mortality statistics (e.g. `E11.9`).
- **RxNorm**: Standardized clinical drug formulations normalized across thousands of manufacturer NDCs (e.g. `860975` for Metformin ER 1000 mg).

---

## 3. Clinical Provenance

In multi-institutional healthcare networks, data consumer systems must answer:
> *"Where did this information originate, who authored it, and when was it imported?"*

HealthGraph models lightweight provenance metadata:
- **Source System**: Originating EHR or LIMS instance (e.g. "Metropolitan Health Epic EHR")
- **Source Organization**: Institutional custodian (e.g. "Metropolitan Academic Health System")
- **Recorded Time**: Timestamp recorded by the clinical source
- **Imported Time**: Timestamp when HealthGraph ingested and normalized the record
- **Activity**: "Ingestion, Validation, and Relational Graph Construction"
- **Agent Practitioner**: Clinician or provider executing the order or observation

---

## 4. Operational Transfer Readiness

HealthGraph bridges data quality and operational decisions through its **Transfer Readiness Analyzer**:
- Assesses whether a longitudinal record contains the demographic, encounter, and referential integrity required for safe outbound transfer.
- Outputs an operational status:
  - `TRANSFER READY`: All required identity, encounter context, prescriber attribution, and referential pointers verified.
  - `REVIEW REQUIRED`: Non-critical warnings detected (e.g. temporal discrepancy).
  - `TRANSFER BLOCKED`: Critical failure (e.g. dangling prescriber pointer or missing demographic identity).

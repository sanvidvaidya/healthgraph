# HealthGraph Systems Architecture

## 1. Executive Summary

HealthGraph is an educational healthcare information system explorer architected to demonstrate how structured clinical data is represented, connected, validated, and interpreted as a longitudinal patient record.

Rather than acting as a static document viewer or an AI chatbot, HealthGraph functions as a deterministic clinical informatics instrument and developer inspection tool.

---

## 2. System-of-Systems Topology

Healthcare information does not originate in a single centralized database; it is distributed across disparate operational systems:

```
┌────────────────────────────────────────────────┐     ┌────────────────────────────────────────────────┐
│           Hospital Inpatient EHR               │     │       Commercial Diagnostic Reference Lab      │
│  - System: Epic Inpatient / Hyperspace         │     │  - System: High-Throughput Chemistry LIMS      │
│  - Emits: Patient Demographics, Encounters,    │     │  - Emits: Observation Results (HbA1c, eGFR,    │
│           Surgical Procedures, Conditions      │     │           Troponin I) with Standard LOINC      │
└───────────────────────┬────────────────────────┘     └───────────────────────┬────────────────────────┘
                        │ FHIR R4 Bundle                                       │ FHIR Observation Feed
                        ▼                                                      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                HEALTHGRAPH LOCAL INGESTION GATEWAY                                    │
│  - Decoupled in-memory ingestion buffer                                                               │
│  - Lightweight Provenance Tracker (captures source organization, practitioner, and timestamps)        │
└──────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             3-LAYER PROFILE-AWARE VALIDATION ENGINE                                   │
│  Layer 1: Structural Validation (JSON syntax, resourceType, id, scalar type conformance)              │
│  Layer 2: Resource-Specific Constraints (rules tailored per resource type; no false status assumption)│
│  Layer 3: Interoperability Conformance (canonical terminology URIs, temporal consistency)             │
│  Taxonomy Classification: ERROR | WARNING | INFORMATION | UNKNOWN                                     │
└──────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REFERENCE RESOLUTION & GRAPH ENGINE                                   │
│  - Reference Resolver: Parses relative pointers ('Patient/pat-1'), matches targets, flags dangling   │
│  - SQLite Relational Cache: Indexed tables for fast query by resource_type, patient_id, encounter_id │
│  - NetworkX Graph: MultiDiGraph modeling topological knowledge network, ego-networks, and centrality  │
└──────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               LONGITUDINAL & OPERATIONAL SERVICE LAYER                                │
│  - Longitudinal Engine: Chronological event sorting and biomarker sparkline trajectory extraction    │
│  - Quality Auditor: Multidimensional metrics (Referential, Structural, Temporal, Completeness)        │
│  - Transfer Readiness Analyzer: Information -> System State -> Operational Transfer Decision          │
│  - Starlette REST API: Serves standard FHIR endpoints and educational explorer services              │
└──────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  BESPOKE USER INTERFACE LAYER                                         │
│  - Single-Page Web Shell (Vanilla HTML5 / CSS3 / ES6, Zero external CDN dependencies)                 │
│  - 12 First-Class Views: Home, Interop Lab, Patients, Resources, Relationships, Timeline,            │
│    Data Quality, Terminology, API, Architecture, Method, Import/Export                                │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Storage & Relational Caching (SQLite)

HealthGraph maintains a local SQLite relational index to decouple raw JSON representations from query execution:

### 3.1 Primary Schema
- `resources`:
  - `resource_type` (`TEXT`): FHIR resourceType (e.g. `Patient`, `Observation`)
  - `id` (`TEXT`): Logical resource identifier
  - `patient_id` (`TEXT`): Foreign subject identifier for accelerated patient scoping
  - `encounter_id` (`TEXT`): Clinical episode identifier
  - `status` (`TEXT`): Resource-specific status or clinicalStatus
  - `title` (`TEXT`): Human-readable concept display or name
  - `date_recorded` (`TEXT`): ISO 8601 timestamp for temporal sequencing
  - `raw_json` (`TEXT`): Full unmodified FHIR R4 JSON document
  - `PRIMARY KEY (resource_type, id)`

### 3.2 Indexes
- `idx_res_type` on `resources(resource_type)`
- `idx_res_patient` on `resources(patient_id)`
- `idx_res_encounter` on `resources(encounter_id)`
- `idx_res_date` on `resources(date_recorded)`

---

## 4. Knowledge Graph Topology (NetworkX)

The relationship graph models clinical entities as nodes and structural references as directed edges:
- **Nodes**: Each resource is assigned a node key `f"{resourceType}/{id}"` with attributes for type, label, date, status, and patient association. Ghost nodes are dynamically injected for dangling references to make broken integrity visually evident.
- **Edges**: Directed relationships carry semantic predicates derived from the FHIR reference path:
  - `subject`: Clinical finding or order anchored to patient
  - `context`: Clinical event occurring during an encounter
  - `performer`: Clinician or organization executing a procedure or lab
  - `prescriber`: Authorized practitioner ordering medication
  - `diagnosis`: Encounter justified by clinical condition
  - `result`: Diagnostic report containing constituent observations

---

## 5. Technology Stack & Lightweight Principles

1. **Python 3.14**: Modern, strict type-annotated core.
2. **Pydantic v2**: High-performance schema definitions and validation.
3. **SQLite3**: In-process, zero-configuration relational indexing.
4. **NetworkX 3.6**: Pure-Python graph analysis, ego-network extraction, and centrality computation.
5. **Starlette & Uvicorn**: Asynchronous ASGI server delivering standard FHIR responses and static assets.
6. **Bespoke UI Shell**: Zero npm build steps, zero node_modules, zero external CDNs. Completely self-contained and operable offline.

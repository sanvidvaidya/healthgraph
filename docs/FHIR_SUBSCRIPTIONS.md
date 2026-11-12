# Real-Time FHIR R4 Subscriptions & REST Hooks

HealthGraph implements the **HL7 FHIR R4 Subscription** specification (`Subscription` and `SubscriptionStatus` resource models) to deliver real-time, deterministic clinical surveillance. When connected Electronic Health Records (EHRs) stream vitals, laboratory results, or medication orders, HealthGraph evaluates criteria, runs clinical safety checks, and fires authenticated REST hooks.

---

## 1. Overview & Architecture

```
   Connected EHR / Device Streams
                │
                ▼ (POST /api/subscriptions/notify)
   ┌───────────────────────────────────────────────┐
   │             HealthGraph Ingress               │
   │  - HMAC SHA-256 Signature Verification       │
   │  - Repository Ingestion & Reference Indexing   │
   └──────────────────────┬────────────────────────┘
                          │
                          ▼
   ┌───────────────────────────────────────────────┐
   │      FHIR R4 Subscription Criteria Matcher    │
   │  - LOINC observation codes (eGFR, HbA1c)      │
   │  - Active RxNorm prescriptions & status       │
   │  - Patient identifier & USCDI clinical classes │
   └──────────────────────┬────────────────────────┘
                          │
                          ▼
   ┌───────────────────────────────────────────────┐
   │    Deterministic CDS Safety Engine            │
   │  - Rule 1: Renal Metformin Safety Gate        │
   │  - Rule 2: Glycemic Target ADA Surveillance    │
   │  - Rule 3: Referential Practitioner Authorship│
   └──────────────────────┬────────────────────────┘
                          │
                          ▼
   ┌───────────────────────────────────────────────┐
   │       Signed REST Hook Dispatch Engine        │
   │  - Bundle type: history / event-notification   │
   │  - Header: X-HealthGraph-Signature (HMAC-SHA256│
   │  - Audit Ledger: In-memory & Persistent Trail │
   └───────────────────────────────────────────────┘
```

---

## 2. Supported Endpoints

### Standard FHIR R4 Subscription Endpoints
- `GET /fhir/Subscription` — Returns a searchset `Bundle` of registered subscriptions. Supports `?status=active` filtering.
- `GET /fhir/Subscription/{id}` — Retrieves an individual subscription by identifier.
- `POST /fhir/Subscription` — Registers a new subscription. Returns `201 Created` with a `Location` header.
- `PUT /fhir/Subscription/{id}` — Updates subscription status or criteria.
- `DELETE /fhir/Subscription/{id}` — Removes or deactivates a subscription (`204 No Content`).

### Real-Time Ingress & Clinical Simulation
- `POST /api/subscriptions/notify` — Ingress endpoint for EHR updates. Ingests the resource, evaluates criteria, executes CDS safety rules, and generates signed notifications.
- `GET /api/subscriptions/audit-log` — Returns the real-time event notification ledger and delivery statuses.
- `POST /api/subscriptions/simulate` — Point-of-care simulator supporting:
  - `renal_drop`: Acute drop in eGFR (e.g. 22 mL/min) triggering critical Metformin contraindication (`CDS-RENAL-METFORMIN-CRIT`).
  - `glycemic_spike`: Surge in HbA1c (e.g. 9.2%) triggering chronic disease management warning (`CDS-GLYCEMIC-CONTROL-WARN`).
  - `metformin_order`: New Metformin prescription for CKD patient.
  - `unresolved_provider_order`: Prescription with dangling practitioner foreign key (`CDS-INTEGRITY-MISSING-PRAC`).

---

## 3. Seeded Surveillance Subscriptions

| Subscription ID | Criteria | Channel | Clinical Rationale |
|---|---|---|---|
| `sub-renal-metformin-guard` | `Observation?code=33914-3,48642-3,48643-1,62238-1` | `rest-hook` | Halts Metformin lactic acidosis risks when eGFR drops < 30 mL/min/1.73m2 |
| `sub-glycemic-trajectory-watch` | `Observation?code=4548-4,17856-6` | `rest-hook` | Flags persistent glycemic elevations above ADA 7.0% clinical target |
| `sub-pharmacotherapy-safety-gate` | `MedicationRequest?status=active` | `rest-hook` | Verifies prescriber attribution, NPI validity, and contraindications |

---

## 4. HMAC-SHA256 Signature Verification

Dispatched REST hook notifications include an authentication signature in the `X-HealthGraph-Signature` header:

```python
import hmac
import hashlib

expected_sig = "sha256=" + hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(received_sig, expected_sig)
```

This guarantees message authenticity and payload integrity between HealthGraph and recipient EHR endpoints.

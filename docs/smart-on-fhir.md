# HealthGraph SMART-on-FHIR App Launch Protocol

> Specification, Security Architecture, and Integration Guide for live EHR connectivity.

---

## 1. Overview & Standard Alignment

HealthGraph implements the **HL7 SMART App Launch Framework (v1.0.0 & v2.0.0)** with mandatory **RFC 7636 Proof Key for Code Exchange (PKCE)** using `S256` SHA-256 challenges.

This allows HealthGraph to function either as an embedded clinical sidebar application launched from within an Electronic Health Record (EHR) session, or as a standalone clinical intelligence portal that hydrates longitudinal patient records directly from external FHIR R4 servers.

---

## 2. Launch Modes

### A. EHR Launch Sequence
1. The EHR launches HealthGraph with contextual URL parameters:
   ```
   GET https://healthgraph.app/smart/launch?iss=https://ehr.hospital.org/fhir&launch=XYZ123
   ```
2. HealthGraph queries `GET {iss}/.well-known/smart-configuration` to discover the `authorization_endpoint` and `token_endpoint`.
3. HealthGraph generates a cryptographically random `code_verifier` (min 43 characters) and computes the S256 `code_challenge`.
4. The user is redirected to the EHR authorization endpoint with:
   - `response_type=code`
   - `client_id=healthgraph_smart_client`
   - `redirect_uri=https://healthgraph.app/smart/callback`
   - `launch={launch}`
   - `scope=launch/patient patient/Patient.read patient/Condition.read patient/Observation.read patient/MedicationRequest.read patient/Encounter.read openid fhirUser`
   - `code_challenge={challenge}`
   - `code_challenge_method=S256`
   - `aud={iss}`

### B. Standalone Launch Sequence
1. The clinician selects a sandbox preset (e.g. SMART Health IT Open Sandbox or HAPI FHIR) or enters a custom FHIR R4 endpoint URL.
2. HealthGraph initiates discovery and prompts the user through the authorization and patient selection picker.

---

## 3. Token Exchange & Live Ingestion Pipeline

Upon redirect back to `/smart/callback` with authorization `code`:
1. HealthGraph calls `POST {token_endpoint}` with:
   - `grant_type=authorization_code`
   - `code={code}`
   - `code_verifier={verifier}`
   - `redirect_uri={redirect_uri}`
   - `client_id={client_id}`
2. The EHR returns `access_token` and the contextual `patient` ID.
3. HealthGraph's `SmartFhirEngine` hydrates the active patient bundle:
   - `GET /Patient/{id}`
   - `GET /Condition?patient={id}&_count=50`
   - `GET /Observation?patient={id}&_count=50`
   - `GET /MedicationRequest?patient={id}&_count=50`
   - `GET /Encounter?patient={id}&_count=50`
4. The live bundle is ingested into HealthGraph's local `FHIRRepository`, triggering an atomic rebuild of:
   - `ReferenceResolver` (cross-resource pointer resolution)
   - `GraphEngine` (relational graph topology)
   - `LongitudinalEngine` (time-series clinical timeline)
   - `Clinical Decision Support` (contraindications, renal thresholds, glycemic flags)
   - `QualityAuditor` (syntactic & semantic data health)

---

## 4. API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/smart/presets` | `GET` | Returns preconfigured public test sandboxes (SMART Health IT, HAPI FHIR). |
| `/api/smart/discover?iss={url}` | `GET` | Performs `.well-known/smart-configuration` discovery and returns PKCE challenge pair. |
| `/api/smart/exchange` | `POST` | Exchanges authorization code + PKCE verifier for bearer token & patient context. |
| `/api/smart/ingest` | `POST` | Hydrates patient records from live FHIR server and re-indexes all local engines. |

---

## 5. Testing with SMART Health IT Sandbox

To test end-to-end against the public SMART Health IT launcher:
1. Open [launch.smarthealthit.org](https://launch.smarthealthit.org/).
2. Select **FHIR Version: R4**, **Launch Type: EHR Launch**.
3. Choose any sample patient (e.g. adult diabetic with chronic kidney disease).
4. Set App Launch URL to: `https://<your-healthgraph-domain>/smart/launch`.
5. Observe HealthGraph extract the patient's real-time medications and lab observations, immediately triggering renal/glycemic CDS contraindications.

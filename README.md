# HealthGraph: Longitudinal FHIR Healthcare Information System Explorer

> **Core Research Question:**
> *How can distributed, structured healthcare records be validated, interconnected, and interpreted as a cohesive longitudinal clinical system?*

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FHIR R4](https://img.shields.io/badge/FHIR-Release%204-firebrick.svg)](https://hl7.org/fhir/R4/)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/tests-22%20passed-emerald.svg)](tests/)

---

## 1. Overview and Problem Statement

Healthcare information is inherently fragmented across siloed systems. A single patient frequently receives care across independent primary clinics, hospital systems, outpatient laboratories, and community pharmacies. Each organization generates discrete clinical resources such as laboratory observations, encounter summaries, condition diagnoses, and medication orders.

Standard data interchange formats like HL7 FHIR R4 define standardized data schemas, yet syntactic validity does not guarantee clinical coherence. A medication order may validate cleanly against standard FHIR schemas while pointing to an unknown prescriber identifier. An observational laboratory measurement may arrive weeks before the recorded encounter date, or an active prescription may present severe renal safety contraindications against the patient latest recorded eGFR.

**HealthGraph** solves this challenge by reconstructing relational connections from raw FHIR bundles. It provides an educational, deterministic clinical intelligence platform that validates schemas, resolves references, highlights clinical safety risks, and visualizes patient histories as unified longitudinal narratives.

HealthGraph operates on a **100% deterministic local Python core**. It does not rely on external cloud dependencies, non-deterministic language models, or paid commercial APIs.

---

## 2. Dual Deployment Surfaces

HealthGraph provides two complementary presentation surfaces driven by the same deterministic Python service:

1. **Cinematic Web Application (React 19, Vite, Tailwind CSS, GSAP, Three.js)**:
   - Kinetic scroll narrative walking users through the healthcare data journey across five visual chapters.
   - Global Clinician Command Palette activated with `Ctrl+K` or `Cmd+K`.
   - Comprehensive Patient Dossier with integrated Clinical Decision Support alerts.
   - Interactive SVG and 3D relational knowledge graph explorer.
   - 9-stage Interoperability Lab and Multidimensional Conformance Quality Ledger.

2. **Streamlit Clinical Workbench (`streamlit_app.py`)**:
   - Ready for instant deployment on Streamlit Community Cloud.
   - Zero JavaScript toolchain required, pure Python clinical analysis.
   - Patient dossier inspection with live CDS alerts and laboratory trajectories.
   - Direct interactive bundle upload and validation reporting.

---

## 3. Core Architecture and Features

### Clinical Decision Support (CDS) Rules Engine
Located in `healthgraph/core/cds.py`, the CDS engine evaluates deterministic clinical rules against aggregated patient graphs:
- **Metformin Renal Safety Rule**: Evaluates eGFR levels against active Metformin therapy. Triggers critical contraindication warnings if eGFR drops below 30 mL/min/1.73m2 and dosage alerts when eGFR is between 30 and 45.
- **Glycemic Target Assessment**: Compares the most recent HbA1c measurement against standard clinical targets of 7.0 percent for adults with diabetes.
- **Referential Integrity Guards**: Flags broken practitioner or encounter references in active prescriptions.
- **Nephropathy Surveillance**: Checks for annual microalbuminuria screening intervals in diabetic cohorts.

### Global Clinician Command Palette
Available anywhere in the React web workspace via `Ctrl+K` or `Cmd+K`:
- Instant fuzzy navigation across all synthetic patients.
- Quick switching between clinical tools (Graph Inspector, Interoperability Lab, Quality Ledger, Terminology Crosswalk).
- Direct lookups for clinical terminology codes (such as LOINC `4548-4` for HbA1c or SNOMED `44054006` for Type 2 Diabetes).
- One-click trigger for synthetic bundle uploading.

### Interactive Capability Showcase Dock
Embedded directly into Chapter 5 of the home narrative:
- Interactive tabbed dock previewing all major clinical analysis workspaces.
- Real-time clinical metrics displaying patient counts, resolved edges, and conformance dimensions.
- Direct one-click launching into specialized workspaces.

### 3-Layer Profile-Aware Validation Engine
- **Layer 1 (Structural)**: JSON schema correctness, required data types, and root attributes.
- **Layer 2 (Resource-Specific)**: Enforces rules tailored per resource type without false universal assumptions.
- **Layer 3 (Interoperability)**: Validates canonical terminology URIs, temporal consistency, and required clinical context.

### Multidimensional Data Quality Ledger
Evaluates bundles across six independent dimensions rather than relying on a misleading single score:
- **Referential Integrity**: Measures resolved internal pointers versus dangling ghost references.
- **Structural Validity**: Rate of schema-compliant resources.
- **Temporal Consistency**: Checks chronological alignment between observations and parent encounters.
- **Completeness**: Presence of core clinical attributes.
- **Terminology Standards**: Adherence to standard LOINC, SNOMED CT, RxNorm, and ICD-10 systems.
- **Identity Uniqueness**: Absence of conflicting resource identifiers.

### Synthetic Patient Cohorts
- **Eleanor Vance (`PAT-VANCE-01`)**: Longitudinal management of Type 2 Diabetes, Stage 3a Diabetic Nephropathy, and Hypertension across five clinical encounters over three years.
- **Marcus Thorne (`PAT-THORNE-02`)**: Acute coronary syndrome presentation, emergency triple CABG surgery, and serial Troponin I recovery monitoring.
- **Sofia Chen (`PAT-CHEN-03`)**: Pediatric asthma surveillance, spirometry testing, and inhaler prescription management.
- **David Ross (`PAT-ROSS-04`)**: Colorectal oncology post-resection follow-up with CEA biomarker surveillance.
- **Anomaly Cohort (`PAT-ANOMALY-05`)**: Curated real-world data imperfections for student and clinician training, including dangling references, temporal inversions, and missing mandatory attributes.

---

## 4. Deployment Guide

### Option A: Streamlit Community Cloud (Fastest Free Hosting)
1. Fork or push this repository to your GitHub account.
2. Visit [share.streamlit.io](https://share.streamlit.io) and click **New app**.
3. Select your repository, choose the `main` branch, and set `streamlit_app.py` as the main file path.
4. Click **Deploy**. Streamlit Cloud will automatically install dependencies from `requirements.txt` and launch the application.

### Option B: Vercel (Frontend Single Page Application)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. The root `vercel.json` automatically configures the build settings:
   - Root directory: `.`
   - Build command: `cd frontend && npm install && npm run build`
   - Output directory: `frontend/dist`
4. Deploy. The modern React application will be live globally on Vercel edge network.

### Option C: Render, Railway, or Google Cloud Run (Containerized Backend)
A production-ready `Dockerfile` and `render.yaml` blueprint are included in the repository root:
1. Connect your repository to [Render](https://render.com) or [Railway](https://railway.app).
2. For Render, select **Blueprint** to read `render.yaml` automatically, or choose **Web Service** with the Docker runtime.
3. The multi-stage Docker build installs Python dependencies and serves the complete ASGI application with pre-compiled frontend assets on port 8000.

### Option D: Local Development Setup

#### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (only required if modifying the frontend source code)

#### Backend Quickstart
```bash
# Clone the repository
git clone https://github.com/your-username/healthgraph.git
cd healthgraph

# Install dependencies
pip install -r requirements.txt

# Start the Starlette ASGI server
python app.py
```
Open your browser to `http://127.0.0.1:8000` to interact with the full web application.

#### Frontend Development (Optional)
If you wish to edit React components or modify styles:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs on `http://127.0.0.1:5173` with instant hot module replacement and proxies API requests to the Python backend on port 8000.

---

## 5. Automated Verification and Tests

HealthGraph includes a comprehensive automated test suite covering schema validation, reference graph reconstruction, clinical decision support rules, quality audits, and REST API endpoints.

Run all tests from the repository root:
```bash
python -m unittest discover -s tests -p "test_*.py"
```

Expected output:
```text
Ran 22 tests in 0.09s
OK
```

---

## 6. Project Boundaries and Scope

HealthGraph is designed as an educational clinical information system explorer and reference implementation:
- It is **not** an electronic medical record system for live patient charting or billing.
- It is **not** an automated diagnostic engine; all clinical decision support rules are deterministic educational demonstrations based on published clinical guidelines.
- It operates exclusively on synthetic patient data and does not store protected health information.

---

## 7. License

Distributed under the MIT License. See `LICENSE` for details.

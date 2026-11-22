# 🩺 HealthGraph: Longitudinal FHIR Healthcare Intelligence Platform

> **The Core Mission:**  
> *Transform fragmented, siloed medical records into a coherent, connected, and mathematically verifiable clinical safety graph — with zero black-box AI hallucinations.*

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FHIR R4](https://img.shields.io/badge/FHIR-Release%204-firebrick.svg)](https://hl7.org/fhir/R4/)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/tests-66%20passed-emerald.svg)](tests/)
[![Live Production Web App](https://img.shields.io/badge/deployment-live%20on%20vercel-black.svg)](https://healthgraph-8exr.vercel.app)

---

## 💡 Explain It To Me Like I'm Five: How I Created This & What It Does

Imagine you visit three different doctors this year: your family doctor, an urgent care clinic, and an outpatient lab for bloodwork.
- Doctor A writes a prescription for blood pressure.
- The lab discovers your kidneys are functioning at 30% capacity (low eGFR).
- Doctor B at urgent care prescribes an antibiotic that is toxic to weak kidneys.

Because their computer systems don't talk to each other in a smart way, **nobody connects the dots**. The antibiotic gets filled, and you end up in the emergency room with acute kidney damage.

### How I Built HealthGraph to Solve This
I built **HealthGraph** as a deterministic medical translator and safety engine:
1. **The Language:** It speaks **HL7® FHIR® R4** (Fast Healthcare Interoperability Resources) — the official global digital standard for medical data.
2. **The Graph:** Instead of treating your medical history as isolated flat files or messy PDFs, HealthGraph ingests records as an interconnected **knowledge graph**. It connects Patients ➔ Encounters ➔ Laboratory Observations ➔ Diagnoses ➔ Active Medications.
3. **The Brain (100% Deterministic Python):** When a doctor looks at a patient or prescribes a drug, HealthGraph runs hardcoded clinical safety rules (contraindications, dosage caps, kidney function thresholds, and genetic drug-gene interactions). It **never guesses or hallucinates** using generative AI. If a drug is unsafe, it points to the exact lab value and clinical guideline explaining why.
4. **The Interface:** A dual-surface experience featuring a cinematic React 19 web application with interactive 3D relational visualizers, plus a pure Python Streamlit clinical workbench.

---

## 💼 The Real Business Reason Why This Exists

Medical fragmentation isn't just an engineering inconvenience — it is a catastrophic economic and human crisis:

1. **Adverse Drug Events (ADEs) Cost $30B+ Annually:** In the United States alone, preventable medication errors and uncoordinated prescribing cause hundreds of thousands of avoidable hospitalizations each year.
2. **Federal Regulatory Mandates (ONC Cures Act § 170.315):** The 21st Century Cures Act legally mandates that hospitals and health systems provide patients and third-party apps with secure, standardized API access (SMART on FHIR and Bulk Data Export) or face severe "information blocking" civil penalties.
3. **Health Equity & Value-Based Care Reimbursement:** Insurance payers (CMS, Medicare, Medicaid) increasingly tie hospital reimbursements to **Social Determinants of Health (SDOH)**. If a clinic discharges a diabetic patient without knowing they are food-insecure or lack transportation to pick up insulin, the patient will inevitably be readmitted — and the hospital absorbs the financial penalty. HealthGraph incorporates the **HL7 Gravity Project** to screen, code (ICD-10 Z-codes), and trigger closed-loop community referrals.
4. **Precision Medicine Efficiency:** Prescribing blood thinners like Clopidogrel without checking if the patient has a loss-of-function `CYP2C19` genetic variant leads to preventable strokes. HealthGraph embeds CPIC guidelines directly into the point of care.

---

## 🌟 What's New: The Groundbreaking Expansion

We've supercharged HealthGraph with six major clinical interoperability engines:

| Feature Engine | Standards / Code Systems | What It Solves |
| :--- | :--- | :--- |
| **ONC Bulk Data Access (`$export`)** | ONC § 170.315(g)(10), SMART Bulk IG v2.0 | Asynchronous HTTP 202 job kicks that export millions of patient records into streaming line-delimited NDJSON files for population health analytics. |
| **HL7 Gravity Project SDOH Engine** | LOINC (`88121-9`, `93030-5`), ICD-10-CM (`Z59.41`, `Z59.82`) | Screens for food insecurity and transportation barriers, automatically generates diagnostic Z-codes, and tracks closed-loop community organization referrals. |
| **SMART-on-FHIR v2 App Launch** | OAuth 2.0 + PKCE S256, HL7 SMART IG | Allows clinicians to launch HealthGraph directly inside major EHRs (Epic, Cerner) with zero-trust token exchange and scoped patient authorization. |
| **Pharmacogenomics (PGx) Precision Dosing** | CPIC Levels A/B, PharmGKB, Star Alleles | Analyzes patient genetic variants (`CYP2D6`, `CYP2C19`, `SLCO1B1`) to warn of toxic drug metabolism or therapeutic failure before dispensing. |
| **FHIR R4 Subscriptions & REST Hooks** | FHIR Subscriptions R4 Topic-Based | Real-time webhook alerting that pushes notifications to hospital servers the second critical lab thresholds (e.g. Troponin > 0.04 ng/mL) are breached. |
| **Dual Presentation Surfaces** | React 19 + GSAP + Three.js & Streamlit | A kinetic web app with interactive graph topology and clinical dossiers, paired with a lightweight zero-JS Python workbench. |

---

## 🏗️ Technical Architecture

```text
                               ┌──────────────────────────────────────────────┐
                               │       EHR / Health Data Ecosystem            │
                               │   (Epic, Cerner, Public Health, LabCorp)     │
                               └──────────────────────┬───────────────────────┘
                                                      │  SMART v2 OAuth / REST
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                HEALTHGRAPH ENGINE (Python 3.10+)                            │
│                                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │   FHIR R4 Ingestion   │   │ Relational Knowledge  │   │  Deterministic Decision Rules │  │
│  │   & Schema Validator  │──▶│     Graph Engine      │──▶│  - Renal / eGFR Safety Checks │  │
│  │  (Patient, Obs, Rx)   │   │  (Graph Inversion)    │   │  - CPIC PGx Drug-Gene Dosing  │  │
│  └───────────────────────┘   └───────────────────────┘   │  - Gravity Project SDOH (Z)   │  │
│                                                          └───────────────┬───────────────┘  │
│                                                                          │                  │
│  ┌───────────────────────┐   ┌───────────────────────┐                   │                  │
│  │  ONC Bulk Data Export │   │  R4 Subscription Hub  │                   │                  │
│  │  ($export / NDJSON)   │   │  (Event REST Hooks)   │                   │                  │
│  └───────────────────────┘   └───────────────────────┘                   │                  │
└──────────────────────────────────────────────┬───────────────────────────┴──────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION SURFACES                                     │
│                                                                                             │
│  ┌──────────────────────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ React 19 / Vite / Tailwind Web App               │  │ Streamlit Clinical Workbench    │  │
│  │ - Kinetic Narrative & 3D Knowledge Graph         │  │ - Zero-JS pure Python analysis  │  │
│  │ - Integrated Patient Dossier & PGx/SDOH Badges   │  │ - Instant local execution       │  │
│  │ - Interop Lab with Bulk Data Export Console      │  │ - Interactive bundle uploader   │  │
│  └──────────────────────────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Run the Python Backend & Streamlit Workbench
```bash
# Clone the repository
git clone https://github.com/sanvidvaidya/healthgraph.git
cd healthgraph

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scriptsctivate

# Install dependencies
pip install -r requirements.txt

# Run the complete test suite (66 tests)
pytest

# Launch the Streamlit Clinical Workbench
streamlit run streamlit_app.py
```

### 2. Run the React 19 Web App
```bash
cd frontend
npm install
npm run dev
# Web application will be live at http://localhost:5173
```

---

## 🧪 Comprehensive Verification & Quality Assurance

HealthGraph is thoroughly tested with **66 passing unit and integration tests** verifying:
- ✅ FHIR R4 schema parsing, resource validation, and referential integrity.
- ✅ Renal function and medication contraindication clinical safety logic.
- ✅ SMART on FHIR OAuth token exchange with PKCE verification.
- ✅ Asynchronous Bulk Data `$export` status polling and NDJSON stream generation.
- ✅ HL7 Gravity Project SDOH questionnaire scoring, Z-code generation, and referral states.
- ✅ Pharmacogenomic CPIC dosing interpretation and contraindication alerts.

---

## 📜 Regulatory Disclaimer

*HealthGraph is an educational and analytical research demonstration platform. It operates deterministically on synthetic, de-identified clinical test bundles. It is not an ONC-certified EHR technology, medical device, or medical diagnostic tool. Clinical decisions must always be made by licensed healthcare professionals.*

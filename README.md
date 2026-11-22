# HealthGraph

Hi, I am Sanvid and I built HealthGraph to solve a dangerous problem in healthcare: patient medical records are scattered across different clinics, and doctors cannot easily see when a new prescription will hurt a patient.

---

## The Simple Explanation: What This Is and How I Built It

Imagine you visit three different healthcare providers this year:
- Your family doctor prescribes blood pressure pills.
- An outpatient lab runs bloodwork and discovers your kidneys are functioning at only 30% capacity.
- An urgent care clinic prescribes an antibiotic that is known to damage weak kidneys.

Because these clinics use different software systems that do not share data cleanly, nobody connects the dots. You take the antibiotic and end up in the emergency room with acute kidney injury.

### How I built HealthGraph to fix that
I built HealthGraph as a connected medical record system and automated safety checker:

1. **A common clinical language:** It uses HL7 FHIR Release 4 (Fast Healthcare Interoperability Resources), which is the standard data format used by modern hospital systems worldwide.
2. **A connected graph of patient history:** Instead of keeping records in separate PDFs or flat files, HealthGraph organizes data into a connected graph. It links Patients to Encounters, Lab Observations, Diagnoses, and Active Medications.
3. **Safety rules with zero guessing:** The safety engine runs in pure Python. When a clinician views a patient profile or enters a medication, HealthGraph checks drug-drug interactions, maximum safe doses, kidney function thresholds, and genetic drug-gene risks. It does not use generative AI or machine learning models that can make up answers. When a drug is unsafe, it displays the exact lab result, medication name, and clinical guideline that triggered the alert.
4. **Two interfaces:** A web application built with React and interactive visual graphs, alongside a Python Streamlit workbench designed for clinical reviews.

---

## The Business and Clinical Problem: Why This Matters

Fragmented medical records create serious financial and clinical problems for health systems:

- **Adverse drug reactions cost billions:** Uncoordinated prescriptions and preventable medication errors cause hundreds of thousands of avoidable hospital admissions every year in the United States alone.
- **Federal interoperability rules:** Under the 21st Century Cures Act, hospitals and electronic health record vendors face penalties if they block patient data access. They are required to support open API standards like SMART on FHIR and Bulk Data Export.
- **Social factors and hospital readmission penalties:** Health insurance programs increasingly tie hospital payments to patient outcomes. If a hospital discharges a patient without knowing they cannot afford food or do not have a car to pick up insulin, the patient ends up back in the hospital within weeks. HealthGraph includes screening tools from the HL7 Gravity Project to record food insecurity and transportation barriers, generate standard diagnosis codes (like ICD-10 Z59), and track community referrals.
- **Genetic drug compatibility:** Giving blood thinners like clopidogrel to a patient who carries a non-functional CYP2C19 gene variant can lead to treatment failure and preventable strokes. HealthGraph checks genetic test results against CPIC guidelines before a clinician signs the order.

---

## What We Added in the Latest Version

Here are the main capabilities in this release:

- **Bulk Data Export (`$export`):** Implements the FHIR Bulk Data specification to export patient cohorts into line-delimited NDJSON files for analytics and reporting.
- **Social Determinants of Health (Gravity Project):** Structured screening assessments for food insecurity and transportation needs, mapping answers directly to LOINC codes, ICD-10 Z-codes, and referral tasks.
- **SMART on FHIR v2 App Launch:** Implements the SMART on FHIR v2 specification (OAuth 2.0 with PKCE) with an embedded EHR launch simulator, demonstrating how clinical decision support tools integrate into hospital workflows without proprietary EHR lock-in.
- **Pharmacogenomics (PGx) Precision Dosing:** Evaluates genetic alleles (such as CYP2D6, CYP2C19, and SLCO1B1) against CPIC clinical guidelines to prevent adverse drug reactions.
- **Real-Time FHIR Subscriptions:** Webhook notifications that alert hospital systems when critical lab results (such as elevated cardiac troponin) are entered.
- **Dual Working Surfaces:** A React web application with visual relationship graphs and a dedicated Python Streamlit application for clinical review.

---

## Architecture Overview

```text
  CLINICAL DATA SOURCES
  EHR Records (HL7 FHIR R4) | Lab Feeds | Genomic Test Data | SDOH Screenings
                                   │
                                   ▼
  HEALTHGRAPH ENGINE (Python)
  ┌────────────────────────────────────────────────────────┐
  │ - FHIR R4 Resource Ingestion & Knowledge Graph         │
  │ - Deterministic Contraindication & Renal Dose Rules    │
  │ - CPIC Pharmacogenomic (PGx) Gene-Drug Matching        │
  │ - Gravity Project Social Determinant Referral Engine   │
  │ - SMART-on-FHIR v2 OAuth/PKCE Security Emulator        │
  │ - Async Bulk Data Export Generator ($export)           │
  └──────────────────────────┬─────────────────────────────┘
                             │
                             ▼
  USER INTERFACES
  React Web Application (Interactive Graph) | Streamlit Clinical Workbench
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/sanvidvaidya/healthgraph.git
cd healthgraph
```

### 2. Set up the Python environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the tests
```bash
pytest
```

### 4. Launch the application
To run the Streamlit clinical app:
```bash
streamlit run app.py
```

To run the React frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## Notice

This repository is an educational prototype and software demonstration that runs on synthetic patient data. It is not an ONC-certified health IT product, is not a certified medical device, and is not intended to provide clinical diagnoses or direct patient treatment.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

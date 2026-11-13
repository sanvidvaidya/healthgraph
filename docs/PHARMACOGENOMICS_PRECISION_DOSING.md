# Pharmacogenomic (PGx) Variant Interpretation & CPIC Precision Dosing

## 1. Clinical Rationale & Overview

Standard pharmacotherapy assumes average drug metabolism across populations. However, genetic polymorphism in cytochrome P450 enzymes (`CYP2D6`, `CYP2C19`, `CYP2C9`), membrane transport proteins (`SLCO1B1`), immune receptors (`HLA-B*57:01`), and metabolic clearing enzymes (`DPYD`) profoundly alters drug bioactivation, efficacy, and toxicity.

HealthGraph's **Pharmacogenomics Engine** (`healthgraph/core/pharmacogenomics.py`) provides deterministic variant interpretation and point-of-care Clinical Decision Support (CDS) based on:
- **CPIC (Clinical Pharmacogenetics Implementation Consortium)** Level A & B Guidelines
- **FDA Table of Pharmacogenomic Biomarkers in Drug Labeling** (including Black Box Warnings)
- **HL7 FHIR Genomics Reporting Implementation Guide**

---

## 2. Core Gene-Drug Safety Rules Catalog

| Gene | Diplotype / Phenotype | Target Drug | CPIC Level | Clinical Mechanism & Risk | Actionable Recommendation |
|---|---|---|---|---|---|
| **`CYP2C19`** | `*2/*2` (Poor Metabolizer) | **Clopidogrel (Plavix)** | **Level A** | Defective bioactivation of prodrug to active thiol metabolite; high residual platelet reactivity and stent thrombosis risk. | **Avoid clopidogrel.** Prescribe alternative P2Y12 inhibitor (Ticagrelor 90mg BID or Prasugrel 10mg daily). |
| **`CYP2D6`** | `*1/*1xN` (Ultrarapid) | **Codeine / Tramadol** | **Level A** | Massive supratherapeutic morphine conversion leading to severe respiratory depression and fatal opioid overdose. | **Avoid codeine/tramadol.** High risk of fatal toxicity even at standard doses. Prescribe non-CYP2D6 analgesics. |
| **`CYP2D6`** | `*4/*4` (Poor Metabolizer) | **Codeine / Tramadol** | **Level A** | Complete lack of morphine bioactivation; total failure of analgesia. | **Avoid codeine.** Prescribe non-opioid or alternative analgesic. |
| **`SLCO1B1`** | `*5/*5` (Poor Function) | **Simvastatin / Atorvastatin** | **Level A** | Impaired OATP1B1 hepatic uptake elevates systemic statin exposure, causing statin-induced rhabdomyolysis and acute renal failure. | **Avoid high-dose simvastatin (40/80mg).** Switch to low-dose pravastatin, rosuvastatin, or reduce dose by 50%. |
| **`HLA-B*57:01`** | `Positive` | **Abacavir (Ziagen)** | **Level A** | Presentation within antigen-binding cleft triggers acute systemic hypersensitivity syndrome, anaphylactic shock, and death. | **Abacavir is strictly contraindicated.** Rechallenge causes life-threatening shock. Prescribe TDF or TAF. |
| **`DPYD`** | `*2A` (Poor Metabolizer) | **Fluorouracil (5-FU) / Capecitabine** | **Level A** | Severe DPD enzyme deficiency prevents 5-FU clearance, leading to fatal myelosuppression and Grade 4 neurotoxicity. | **Avoid 5-FU and capecitabine completely.** Evaluate alternative non-fluoropyrimidine chemotherapy. |

---

## 3. REST API Specifications

### `GET /api/pgx/guidelines`
Returns the complete CPIC rule catalog, gene definitions, and evidence citations.

### `GET /api/pgx/profile/{patient_id}`
Returns the patient's parsed genomic profile with star alleles, metabolizer phenotypes, and LOINC codes.

### `POST /api/pgx/evaluate`
Evaluates active medication orders against the patient's genomic profile and returns structured safety alerts.

### `POST /api/pgx/pre-order-check`
Point-of-care CDS hook simulation fired during medication order selection.
```json
{
  "patient_id": "PAT-VANCE-01",
  "drug_name": "Clopidogrel 75mg",
  "rxnorm_code": "32968"
}
```
**Response:**
```json
{
  "patient_id": "PAT-VANCE-01",
  "drug_order": "Clopidogrel 75mg",
  "safety_status": "CONTRAINDICATED",
  "allow_order": false,
  "alert_count": 1,
  "alerts": [
    {
      "id": "PGX-CYP2C19-CLOPIDOGREL",
      "severity": "CRITICAL",
      "cpic_level": "Level A",
      "gene": "CYP2C19",
      "phenotype": "Poor Metabolizer",
      "clinical_risk": "Severely reduced formation of active thiol metabolite. High residual platelet reactivity with markedly elevated risk of acute stent thrombosis, recurrent MI, and ischemic stroke.",
      "recommendation": "Avoid clopidogrel. Prescribe alternative P2Y12 inhibitor that does not rely on CYP2C19 bioactivation.",
      "alternative_medications": ["Ticagrelor (90mg BID)", "Prasugrel (10mg daily if no prior TIA/stroke)"],
      "fda_black_box_warning": true
    }
  ]
}
```

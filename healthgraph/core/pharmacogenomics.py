"""
HealthGraph Pharmacogenomic (PGx) Variant Interpreter & CPIC Precision Dosing Engine.

Evaluates patient genomic variant profiles (diplotypes, star alleles, metabolizer phenotypes)
against CPIC (Clinical Pharmacogenetics Implementation Consortium) Level A/B guidelines
and FDA Table of Pharmacogenomic Biomarkers in Drug Labeling.
"""

from dataclasses import dataclass, field
import datetime
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class GenePhenotype:
    gene: str
    diplotype: str
    phenotype: str  # Ultrarapid, Normal, Intermediate, Poor, Positive, Negative
    activity_score: Optional[float] = None
    loinc_code: Optional[str] = None


@dataclass
class PGxAlert:
    id: str
    severity: str  # CRITICAL, WARNING, INFO
    cpic_level: str  # Level A, Level B
    gene: str
    drug_name: str
    rxnorm_code: Optional[str]
    phenotype: str
    diplotype: str
    clinical_risk: str
    recommendation: str
    alternative_medications: List[str]
    dosage_adjustment_percent: Optional[int]
    fda_black_box_warning: bool
    evidence_citations: List[Dict[str, str]]


# -----------------------------------------------------------------------------
# CPIC Guideline Rules Catalog
# -----------------------------------------------------------------------------
CPIC_RULES = {
    "CYP2D6": {
        "drugs": {
            "codeine": {"rxnorm": "2670", "class": "Opioid Prodrug"},
            "tramadol": {"rxnorm": "10689", "class": "Opioid Prodrug"},
            "tamoxifen": {"rxnorm": "10324", "class": "Selective Estrogen Receptor Modulator"}
        },
        "phenotype_actions": {
            "Ultrarapid Metabolizer": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Marked increase in bioactivation to active morphine metabolite. Substantially elevated risk of fatal respiratory depression and supratherapeutic opioid toxicity.",
                "recommendation": "Avoid codeine/tramadol. High risk of fatal opioid overdose even at standard doses. Prescribe non-CYP2D6 analgesics.",
                "alternatives": ["Morphine", "Hydromorphone", "Fentanyl", "Acetaminophen/NSAIDs"],
                "dose_adj": -100,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Codeine/CYP2D6", "url": "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"},
                    {"source": "FDA Drug Safety Communication: Codeine in Ultra-rapid Metabolizers", "pmid": "22995968"}
                ]
            },
            "Poor Metabolizer": {
                "severity": "WARNING",
                "cpic_level": "Level A",
                "clinical_risk": "Greatly reduced bioactivation of codeine to morphine. Lack of therapeutic efficacy and persistent uncontrolled pain.",
                "recommendation": "Avoid codeine and tramadol due to lack of efficacy. Prescribe alternative analgesic not metabolized by CYP2D6.",
                "alternatives": ["Morphine", "Hydromorphone", "Oxycodone (with monitoring)", "NSAIDs"],
                "dose_adj": None,
                "fda_black_box": False,
                "citations": [
                    {"source": "CPIC Guideline for CYP2D6 and Codeine", "url": "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"}
                ]
            }
        }
    },
    "CYP2C19": {
        "drugs": {
            "clopidogrel": {"rxnorm": "32968", "class": "Antiplatelet P2Y12 Inhibitor Prodrug"},
            "citalopram": {"rxnorm": "2556", "class": "SSRI"},
            "escitalopram": {"rxnorm": "32937", "class": "SSRI"},
            "voriconazole": {"rxnorm": "121243", "class": "Antifungal"}
        },
        "phenotype_actions": {
            "Poor Metabolizer": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Severely reduced formation of active thiol metabolite. High residual platelet reactivity with markedly elevated risk of acute stent thrombosis, recurrent MI, and ischemic stroke.",
                "recommendation": "Avoid clopidogrel. Prescribe alternative P2Y12 inhibitor that does not rely on CYP2C19 bioactivation.",
                "alternatives": ["Ticagrelor (90mg BID)", "Prasugrel (10mg daily if no prior TIA/stroke)"],
                "dose_adj": -100,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Clopidogrel and CYP2C19", "url": "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"},
                    {"source": "FDA Boxed Warning: Plavix Reduced Effectiveness in Poor Metabolizers", "pmid": "23698643"}
                ]
            },
            "Intermediate Metabolizer": {
                "severity": "WARNING",
                "cpic_level": "Level A",
                "clinical_risk": "Suboptimal conversion to active antiplatelet metabolite with increased ischemic event risk following percutaneous coronary intervention (PCI).",
                "recommendation": "Consider alternative antiplatelet agent (Ticagrelor or Prasugrel) especially in acute coronary syndrome (ACS).",
                "alternatives": ["Ticagrelor", "Prasugrel"],
                "dose_adj": None,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Clopidogrel Guideline", "url": "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"}
                ]
            }
        }
    },
    "CYP2C9_VKORC1": {
        "drugs": {
            "warfarin": {"rxnorm": "11289", "class": "Vitamin K Antagonist"}
        },
        "phenotype_actions": {
            "Poor Metabolizer / High Sensitivity": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Impaired S-warfarin clearance and increased vitamin K epoxide reductase sensitivity. Drastically increased risk of supra-therapeutic INR and fatal major hemorrhage.",
                "recommendation": "Reduce starting warfarin dose by 50% to 75% under strict INR monitoring, or switch to Direct Oral Anticoagulant (DOAC).",
                "alternatives": ["Apixaban (Eliquis)", "Rivaroxaban (Xarelto)", "Dabigatran (Pradaxa)"],
                "dose_adj": -60,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Warfarin/CYP2C9/VKORC1", "url": "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"}
                ]
            }
        }
    },
    "SLCO1B1": {
        "drugs": {
            "simvastatin": {"rxnorm": "36567", "class": "HMG-CoA Reductase Inhibitor"},
            "atorvastatin": {"rxnorm": "83367", "class": "HMG-CoA Reductase Inhibitor"}
        },
        "phenotype_actions": {
            "Poor Function": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Defective OATP1B1 hepatic influx transporter (*5 allele) leads to elevated systemic statin concentrations. Markedly increased risk of severe myopathy and rhabdomyolysis.",
                "recommendation": "Avoid high-dose simvastatin (40mg/80mg). Prescribe an alternative statin with lower OATP1B1 dependence or limit simvastatin dose to <=20mg.",
                "alternatives": ["Pravastatin", "Rosuvastatin", "Pitavastatin"],
                "dose_adj": -50,
                "fda_black_box": False,
                "citations": [
                    {"source": "CPIC Guideline for Statins and SLCO1B1", "url": "https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/"}
                ]
            },
            "Intermediate Function": {
                "severity": "WARNING",
                "cpic_level": "Level A",
                "clinical_risk": "Moderate elevation in systemic statin exposure; increased risk of statin-associated musculoskeletal symptoms.",
                "recommendation": "Avoid simvastatin 80mg dose; consider alternative statin or monitor creatine kinase (CK).",
                "alternatives": ["Rosuvastatin", "Atorvastatin (standard dose)", "Pravastatin"],
                "dose_adj": -25,
                "fda_black_box": False,
                "citations": [
                    {"source": "CPIC Guideline for Statins", "url": "https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/"}
                ]
            }
        }
    },
    "HLA-B*57:01": {
        "drugs": {
            "abacavir": {"rxnorm": "190521", "class": "Antiretroviral NRTI"}
        },
        "phenotype_actions": {
            "Positive": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Direct presentation of abacavir within antigen-binding cleft of HLA-B*57:01 triggers severe multi-system hypersensitivity reaction, acute hypotension, and death upon rechallenge.",
                "recommendation": "Abacavir is strictly contraindicated. Rechallenge can cause fatal anaphylactoid shock.",
                "alternatives": ["Tenofovir disoproxil fumarate (TDF)", "Tenofovir alafenamide (TAF)", "Zidovudine"],
                "dose_adj": -100,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Abacavir and HLA-B", "url": "https://cpicpgx.org/guidelines/guideline-for-abacavir-and-hla-b/"},
                    {"source": "FDA Black Box Warning for Ziagen (abacavir)", "pmid": "18307314"}
                ]
            }
        }
    },
    "DPYD": {
        "drugs": {
            "fluorouracil": {"rxnorm": "4492", "class": "Antimetabolite Fluoropyrimidine Chemotherapy"},
            "capecitabine": {"rxnorm": "72733", "class": "Oral Fluoropyrimidine Prodrug"}
        },
        "phenotype_actions": {
            "Poor Metabolizer": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Complete or near-complete lack of DPD enzyme clearance leads to lethal systemic accumulation of 5-FU, causing profound myelosuppression, pancytopenia, and fatal neurotoxicity.",
                "recommendation": "Avoid 5-FU and capecitabine completely. Choose alternative non-fluoropyrimidine antineoplastic regimen.",
                "alternatives": ["Oxaliplatin-based alternative", "Irinotecan-based alternative"],
                "dose_adj": -100,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Fluoropyrimidines and DPYD", "url": "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"}
                ]
            },
            "Intermediate Metabolizer": {
                "severity": "CRITICAL",
                "cpic_level": "Level A",
                "clinical_risk": "Significantly reduced DPD clearance; high risk of Grade 4 mucositis, neutropenia, and diarrhea.",
                "recommendation": "Reduce starting dose of 5-FU / capecitabine by 50% with therapeutic drug monitoring (TDM).",
                "alternatives": ["Dose-reduced 5-FU", "Dose-reduced Capecitabine"],
                "dose_adj": -50,
                "fda_black_box": True,
                "citations": [
                    {"source": "CPIC Guideline for Fluoropyrimidines and DPYD", "url": "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"}
                ]
            }
        }
    }
}


# Synthetic Genomic Profiles Catalog for Testing and Simulation
DEFAULT_PATIENT_GENOMIC_PROFILES: Dict[str, List[GenePhenotype]] = {
    # Eleanor Vance: Severe Plavix non-responder (*2/*2 Poor Metabolizer)
    "PAT-VANCE-01": [
        GenePhenotype(gene="CYP2C19", diplotype="*2/*2", phenotype="Poor Metabolizer", activity_score=0.0, loinc_code="92841-6"),
        GenePhenotype(gene="CYP2D6", diplotype="*1/*1", phenotype="Normal Metabolizer", activity_score=2.0, loinc_code="92842-4"),
        GenePhenotype(gene="SLCO1B1", diplotype="*1/*1", phenotype="Normal Function", activity_score=2.0, loinc_code="92845-7"),
        GenePhenotype(gene="HLA-B*57:01", diplotype="Negative", phenotype="Negative", activity_score=None, loinc_code="49683-6"),
    ],
    "pat-eleanor-vance": [
        GenePhenotype(gene="CYP2C19", diplotype="*2/*2", phenotype="Poor Metabolizer", activity_score=0.0, loinc_code="92841-6"),
        GenePhenotype(gene="CYP2D6", diplotype="*1/*1", phenotype="Normal Metabolizer", activity_score=2.0, loinc_code="92842-4"),
        GenePhenotype(gene="SLCO1B1", diplotype="*1/*1", phenotype="Normal Function", activity_score=2.0, loinc_code="92845-7"),
        GenePhenotype(gene="HLA-B*57:01", diplotype="Negative", phenotype="Negative", activity_score=None, loinc_code="49683-6"),
    ],
    # Marcus Thorne: CYP2D6 Ultrarapid Metabolizer & SLCO1B1 Poor Function & HLA-B*57:01 Positive
    "PAT-THORNE-02": [
        GenePhenotype(gene="SLCO1B1", diplotype="*5/*5", phenotype="Poor Function", activity_score=0.0, loinc_code="92845-7"),
        GenePhenotype(gene="CYP2D6", diplotype="*1/*1xN", phenotype="Ultrarapid Metabolizer", activity_score=3.0, loinc_code="92842-4"),
        GenePhenotype(gene="CYP2C19", diplotype="*1/*1", phenotype="Normal Metabolizer", activity_score=2.0, loinc_code="92841-6"),
        GenePhenotype(gene="HLA-B*57:01", diplotype="Positive", phenotype="Positive", activity_score=None, loinc_code="49683-6"),
    ],
    "pat-marcus-thorne": [
        GenePhenotype(gene="SLCO1B1", diplotype="*5/*5", phenotype="Poor Function", activity_score=0.0, loinc_code="92845-7"),
        GenePhenotype(gene="CYP2D6", diplotype="*1/*1xN", phenotype="Ultrarapid Metabolizer", activity_score=3.0, loinc_code="92842-4"),
        GenePhenotype(gene="CYP2C19", diplotype="*1/*1", phenotype="Normal Metabolizer", activity_score=2.0, loinc_code="92841-6"),
        GenePhenotype(gene="HLA-B*57:01", diplotype="Positive", phenotype="Positive", activity_score=None, loinc_code="49683-6"),
    ]
}


class PharmacogenomicsEngine:
    """Interprets genomic variants and evaluates CPIC pharmacotherapy rules."""

    def __init__(self, repository=None):
        self.repository = repository
        self.in_memory_profiles: Dict[str, List[GenePhenotype]] = dict(DEFAULT_PATIENT_GENOMIC_PROFILES)

    def register_patient_profile(self, patient_id: str, phenotypes: List[GenePhenotype]):
        """Store or update genomic phenotypes for a patient."""
        self.in_memory_profiles[patient_id] = phenotypes

    def extract_patient_pgx_profile(self, patient_id: str) -> List[GenePhenotype]:
        """Extract genetic profile from repository FHIR Observations or registered memory."""
        # 1. Check in-memory store
        if patient_id in self.in_memory_profiles:
            return self.in_memory_profiles[patient_id]

        # 2. Check FHIR repository if available
        if self.repository:
            observations = self.repository.list_resources(resource_type="Observation", patient_id=patient_id)
            extracted: List[GenePhenotype] = []
            for obs in observations:
                code_concept = obs.get("code", {})
                codings = code_concept.get("coding", [])
                codes = [c.get("code", "") for c in codings]
                text = (code_concept.get("text") or "").upper()

                gene = None
                if "92842-4" in codes or "CYP2D6" in text:
                    gene = "CYP2D6"
                elif "92841-6" in codes or "CYP2C19" in text:
                    gene = "CYP2C19"
                elif "92840-8" in codes or "CYP2C9" in text:
                    gene = "CYP2C9_VKORC1"
                elif "92845-7" in codes or "SLCO1B1" in text:
                    gene = "SLCO1B1"
                elif "49683-6" in codes or "HLA-B" in text:
                    gene = "HLA-B*57:01"
                elif "92847-3" in codes or "DPYD" in text:
                    gene = "DPYD"

                if gene:
                    val_str = obs.get("valueString") or obs.get("valueCodeableConcept", {}).get("text") or "Normal Metabolizer"
                    diplo = obs.get("interpretation", [{}])[0].get("text", "*1/*1")
                    extracted.append(GenePhenotype(gene=gene, diplotype=diplo, phenotype=val_str))

            if extracted:
                return extracted

        # Fallback empty profile
        return []

    def evaluate_pgx_safety(
        self,
        patient_id: str,
        medications: Optional[List[Dict[str, Any]]] = None,
        profile_override: Optional[List[GenePhenotype]] = None
    ) -> List[PGxAlert]:
        """
        Evaluate CPIC Level A/B guidelines against current or proposed medications and patient genomics.
        """
        alerts: List[PGxAlert] = []
        profile = profile_override if profile_override is not None else self.extract_patient_pgx_profile(patient_id)
        if not profile:
            return alerts

        # Map gene to phenotype
        gene_map: Dict[str, GenePhenotype] = {gp.gene: gp for gp in profile}

        # Resolve medications list
        med_list = medications
        if med_list is None and self.repository:
            med_list = self.repository.list_resources(resource_type="MedicationRequest", patient_id=patient_id)
        if not med_list:
            med_list = []

        # Evaluate each medication against CPIC catalog
        for med in med_list:
            med_concept = med.get("medicationCodeableConcept", {})
            med_text = (med_concept.get("text") or "").lower()
            codings = med_concept.get("coding", [])
            rx_codes = [c.get("code", "") for c in codings]
            displays = [(c.get("display") or "").lower() for c in codings]

            # Cross-check against CPIC rules
            for gene_name, gene_def in CPIC_RULES.items():
                if gene_name not in gene_map:
                    continue
                patient_gene = gene_map[gene_name]

                for drug_key, drug_info in gene_def["drugs"].items():
                    drug_match = (
                        drug_key in med_text
                        or drug_info["rxnorm"] in rx_codes
                        or any(drug_key in d for d in displays)
                    )
                    if not drug_match:
                        continue

                    # Check if patient phenotype triggers an alert
                    actions = gene_def.get("phenotype_actions", {})
                    matched_action = None
                    # Exact or partial match on phenotype
                    for p_key, action_obj in actions.items():
                        if p_key.lower() in patient_gene.phenotype.lower() or patient_gene.phenotype.lower() in p_key.lower():
                            matched_action = action_obj
                            break

                    if matched_action:
                        alerts.append(
                            PGxAlert(
                                id=f"PGX-{gene_name}-{drug_key.upper()}",
                                severity=matched_action["severity"],
                                cpic_level=matched_action["cpic_level"],
                                gene=gene_name,
                                drug_name=drug_key.capitalize(),
                                rxnorm_code=drug_info["rxnorm"],
                                phenotype=patient_gene.phenotype,
                                diplotype=patient_gene.diplotype,
                                clinical_risk=matched_action["clinical_risk"],
                                recommendation=matched_action["recommendation"],
                                alternative_medications=matched_action["alternatives"],
                                dosage_adjustment_percent=matched_action["dose_adj"],
                                fda_black_box_warning=matched_action["fda_black_box"],
                                evidence_citations=matched_action["citations"],
                            )
                        )

        return alerts

    def pre_order_cds_check(
        self,
        patient_id: str,
        drug_name: str,
        rxnorm_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate a point-of-care EHR CDS hook order-select event before a drug order is signed.
        """
        mock_med = {
            "medicationCodeableConcept": {
                "text": drug_name,
                "coding": [{"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": rxnorm_code}] if rxnorm_code else []
            }
        }
        alerts = self.evaluate_pgx_safety(patient_id=patient_id, medications=[mock_med])
        has_critical = any(a.severity == "CRITICAL" for a in alerts)
        return {
            "patient_id": patient_id,
            "drug_order": drug_name,
            "safety_status": "CONTRAINDICATED" if has_critical else ("WARNING" if alerts else "PASSED"),
            "allow_order": not has_critical,
            "alert_count": len(alerts),
            "alerts": [
                {
                    "id": a.id,
                    "severity": a.severity,
                    "cpic_level": a.cpic_level,
                    "gene": a.gene,
                    "phenotype": a.phenotype,
                    "clinical_risk": a.clinical_risk,
                    "recommendation": a.recommendation,
                    "alternative_medications": a.alternative_medications,
                    "fda_black_box_warning": a.fda_black_box_warning,
                }
                for a in alerts
            ]
        }

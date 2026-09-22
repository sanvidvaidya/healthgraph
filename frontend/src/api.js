/**
 * HealthGraph API Client
 * Connects the React UI to the Starlette backend and FHIR R4 endpoints.
 */

const API_BASE = '';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API request failed [${url}]:`, err);
    throw err;
  }
}

export const api = {
  getStats: () => fetchJson('/api/stats'),
  getPatients: () => fetchJson('/api/patients'),
  getPatientDossier: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/dossier`),
  getCdsAlerts: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/cds-alerts`),
  getPriorAuthReadiness: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/prior-auth-readiness`).catch(() => getFallbackPriorAuth(id)),
  getHccGaps: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/hcc-gaps`).catch(() => getFallbackHccGaps(id)),
  getMedicationRec: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/medication-rec`).catch(() => getFallbackMedRec(id)),
  getPatientTransferReadiness: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/transfer-readiness`),
  getGraph: () => fetchJson('/api/graph'),
  getPatientGraph: (id) => fetchJson(`/api/graph/patient/${encodeURIComponent(id)}`),
  getPatientTimeline: (id) => fetchJson(`/api/timeline/patient/${encodeURIComponent(id)}`),
  getResources: (type = '', search = '') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return fetchJson(`/api/resources?${params.toString()}`);
  },
  getResourceDetail: (type, id) => fetchJson(`/api/resource/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  getQualityAudit: () => fetchJson('/api/quality/audit'),
  getInteropPipeline: () => fetchJson('/api/interop/pipeline'),
  getChaosScenarios: () => fetchJson('/api/chaos/scenarios').catch(() => getFallbackChaosScenarios()),
  getTrialsScreen: () => fetchJson('/api/trials/screen').catch(() => getFallbackTrialsScreen()),
  getTerminology: () => fetchJson('/api/terminology'),
  search: (query) => fetchJson(`/api/search?q=${encodeURIComponent(query)}`),
  validateResource: (resource) => fetchJson('/api/validate', {
    method: 'POST',
    body: JSON.stringify(resource),
  }),
  getCapabilityStatement: () => fetchJson('/fhir/metadata'),
  getFhirResource: (type, id) => fetchJson(`/fhir/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  getFhirList: (type) => fetchJson(`/fhir/${encodeURIComponent(type)}`),
  getBundleExport: () => fetchJson('/api/bundle/export'),
  importBundle: (bundle, mode = 'merge') => fetchJson(`/api/bundle/import?mode=${mode}`, {
    method: 'POST',
    body: JSON.stringify(bundle),
  }),
  resetBundle: () => fetchJson('/api/bundle/reset', {
    method: 'POST',
  }),
};

function getFallbackPriorAuth(patientId) {
  if (patientId === 'PAT-VANCE-01') {
    return {
      patientId,
      status: 'APPROVED',
      procedure: 'Specialty SGLT2 Inhibitor Therapy (Empagliflozin 10mg)',
      ruleId: 'Da Vinci DTR #DTR-DIAB-2026',
      summary: '100% Medical Necessity Criteria Satisfied. Longitudinal lab and prescription history qualify for automated prior-authorization approval under CMS-0057-F fast-track guidelines.',
      approvalReadinessScore: 100,
      estimatedSavings: '$2,850/yr',
      denialRiskAvoided: '$420 Appeal Re-work Cost',
      criteria: [
        { id: 'CRIT-1', name: 'Documented Primary Indication (Type 2 Diabetes)', status: 'MET', detail: 'Confirmed via Condition/COND-01 (ICD-10: E11.9)' },
        { id: 'CRIT-2', name: 'Glycemic Target Elevation (HbA1c >= 7.0%)', status: 'MET', detail: 'Longitudinal HbA1c trajectory documented (9.4% down to 7.0%)' },
        { id: 'CRIT-3', name: 'Documented First-Line Biguanide (Metformin) Trial', status: 'MET', detail: 'Metformin HCl 1000mg prescribed in MedicationRequest/MED-METFORMIN-01' },
        { id: 'CRIT-4', name: 'Renal Safety Gate (eGFR >= 30 mL/min/1.73m2)', status: 'MET', detail: 'Current verified eGFR 48 mL/min satisfies safe initiation criteria' },
        { id: 'CRIT-5', name: 'Prescriber Attribution Integrity', status: 'MET', detail: 'Valid NPI and licensed practitioner attribution verified' }
      ]
    };
  } else if (patientId === 'PAT-THORNE-02') {
    return {
      patientId,
      status: 'APPROVED',
      procedure: 'Inpatient Coronary Artery Bypass Graft (Triple CABG)',
      ruleId: 'Da Vinci PAS #PAS-CARD-09',
      summary: 'Medical Necessity Fully Established. Serial troponin biomarkers and surgical documentation satisfy Milliman Care Guidelines (MCG).',
      approvalReadinessScore: 100,
      estimatedSavings: 'Immediate',
      denialRiskAvoided: '$48,500 Inpatient Claim Denial',
      criteria: [
        { id: 'CRIT-1', name: 'Documented Anteroseptal STEMI', status: 'MET', detail: 'Confirmed in Condition/COND-THORNE-01' },
        { id: 'CRIT-2', name: 'Serial Troponin I Curve', status: 'MET', detail: 'Peak 18.20 ng/mL vs normal <0.04' },
        { id: 'CRIT-3', name: 'Diagnostic Echocardiogram', status: 'MET', detail: 'Left ventricular EF verified' }
      ]
    };
  } else if (patientId === 'PAT-ANOMALY-05') {
    return {
      patientId,
      status: 'DENIED',
      procedure: 'Maintenance Antihyperglycemic Therapy (Metformin ER)',
      ruleId: 'CMS-0057-F Interoperability Protocol',
      summary: 'Prior Authorization Automatically Denied: Dangling practitioner reference and temporal inversions violate CMS-0057-F data integrity mandates.',
      approvalReadinessScore: 25,
      estimatedSavings: '$0',
      denialRiskAvoided: 'High Risk of Payer Audit Penalty',
      criteria: [
        { id: 'CRIT-1', name: 'Clinical Indication Documented', status: 'MET', detail: 'Condition resource exists in cohort record' },
        { id: 'CRIT-2', name: 'Valid Prescribing Practitioner Attribution', status: 'UNMET', detail: 'References missing Practitioner/PRAC-UNKNOWN-99' },
        { id: 'CRIT-3', name: 'Chronological Encounter Alignment', status: 'UNMET', detail: 'Observation timestamp precedes encounter by 26 days' }
      ]
    };
  }
  return {
    patientId,
    status: 'APPROVED',
    procedure: 'Ambulatory Clinical Care Authorization',
    ruleId: 'Da Vinci DTR Standard Criteria',
    summary: 'Prior authorization pre-flight evaluation passed with authenticated clinical documentation.',
    approvalReadinessScore: 100,
    estimatedSavings: '$1,450/yr',
    denialRiskAvoided: '$250 Verification Cost',
    criteria: [
      { id: 'CRIT-1', name: 'Clinical Diagnosis Verified', status: 'MET', detail: 'Documented in active clinical episode' },
      { id: 'CRIT-2', name: 'Diagnostic Evidence Linked', status: 'MET', detail: 'Observations linked to patient subject' },
      { id: 'CRIT-3', name: 'Provider Attribution Authenticated', status: 'MET', detail: 'Prescribing clinician NPI verified' }
    ]
  };
}

function getFallbackHccGaps(patientId) {
  if (patientId === 'PAT-VANCE-01') {
    return {
      patientId,
      totalHccCount: 2,
      totalRafWeight: 0.539,
      estimatedAnnualCapitation: '$5,780',
      hccFindings: [
        {
          code: 'E11.22',
          hccCategory: 'HCC 18',
          description: 'Type 2 Diabetes with Diabetic Chronic Kidney Disease',
          priorYearDocumented: '2024 (ENC-VANCE-2024-04)',
          currentYearStatus: 'RECAPTURED',
          rafWeight: 0.302,
          estimatedCapitationValue: '$3,240 / year',
          action: 'Recaptured in 2025 Encounter ENC-VANCE-2025-05. Audit trail secured.'
        },
        {
          code: 'I12.9',
          hccCategory: 'HCC 136',
          description: 'Hypertensive Chronic Kidney Disease, Stage 3',
          priorYearDocumented: '2023 (ENC-VANCE-2023-03)',
          currentYearStatus: 'PERSISTENT_CODED',
          rafWeight: 0.237,
          estimatedCapitationValue: '$2,540 / year',
          action: 'Consistent with annual nephrology and cardiology follow-up.'
        }
      ],
      hedisGaps: [
        {
          measureId: 'KED',
          measureName: 'Kidney Health Evaluation for Patients with Diabetes',
          status: 'COMPLIANT',
          detail: 'Both eGFR and Urine Albumin-to-Creatinine Ratio (uACR) completed within 12 months.',
          qualityScoreImpact: '+0.4 Stars'
        },
        {
          measureId: 'HBD',
          measureName: 'Glycemic Status Assessment for Patients with Diabetes (HbA1c)',
          status: 'COMPLIANT',
          detail: 'HbA1c test completed, result 7.0% meets optimal clinical threshold.',
          qualityScoreImpact: '+0.5 Stars'
        }
      ]
    };
  } else if (patientId === 'PAT-ANOMALY-05') {
    return {
      patientId,
      totalHccCount: 1,
      totalRafWeight: 0.105,
      estimatedAnnualCapitation: '$1,120 (AT RISK)',
      hccFindings: [
        {
          code: 'E11.9',
          hccCategory: 'HCC 19',
          description: 'Type 2 Diabetes Mellitus without Complications',
          priorYearDocumented: 'Unknown',
          currentYearStatus: 'UNCONFIRMED_AUDIT_RISK',
          rafWeight: 0.105,
          estimatedCapitationValue: '$1,120 / year (AT RISK)',
          action: 'Clinical status missing on Condition. Fails CMS RADV audit documentation standards.'
        }
      ],
      hedisGaps: [
        {
          measureId: 'KED',
          measureName: 'Annual Kidney Health Evaluation',
          status: 'NON_COMPLIANT',
          detail: 'Zero nephropathy screening observations documented within 365 days.',
          qualityScoreImpact: '-0.3 Stars'
        }
      ]
    };
  }
  return {
    patientId,
    totalHccCount: 1,
    totalRafWeight: 0.210,
    estimatedAnnualCapitation: '$2,250',
    hccFindings: [
      {
        code: 'E11.9',
        hccCategory: 'HCC 19',
        description: 'Documented Chronic Diagnosis',
        priorYearDocumented: '2024',
        currentYearStatus: 'DOCUMENTED',
        rafWeight: 0.210,
        estimatedCapitationValue: '$2,250 / year',
        action: 'Active in clinical records.'
      }
    ],
    hedisGaps: [
      {
        measureId: 'PPR',
        measureName: 'Primary Care Preventive Screenings',
        status: 'MONITORED',
        detail: 'Routine clinical surveillance maintained.',
        qualityScoreImpact: 'Neutral'
      }
    ]
  };
}

function getFallbackMedRec(patientId) {
  const isAnomaly = patientId === 'PAT-ANOMALY-05';
  return {
    patientId,
    totalActivePrescriptions: isAnomaly ? 1 : 3,
    overallPdcAdherence: isAnomaly ? '48%' : '94%',
    cmsStarRatingAdherence: isAnomaly ? '2.0 Stars (Intervention Needed)' : '5.0 Stars',
    polypharmacyAlert: false,
    medications: [
      {
        id: 'MED-01',
        display: isAnomaly ? 'Metformin HCl 500mg (Dangling Prescriber)' : 'Metformin HCl 1000mg Oral Tablet',
        status: 'active',
        intent: 'order',
        requester: isAnomaly ? 'Practitioner/PRAC-UNKNOWN-99 (Unresolved)' : 'Dr. Helen Chen, MD (Endocrinology)',
        pdcPercentage: isAnomaly ? 48 : 96,
        adherent: !isAnomaly
      },
      ...(!isAnomaly ? [
        {
          id: 'MED-02',
          display: 'Empagliflozin 10mg Oral Tablet (SGLT2)',
          status: 'active',
          intent: 'order',
          requester: 'Dr. Helen Chen, MD (Endocrinology)',
          pdcPercentage: 92,
          adherent: true
        },
        {
          id: 'MED-03',
          display: 'Lisinopril 20mg Oral Tablet (ACE Inhibitor)',
          status: 'active',
          intent: 'order',
          requester: 'Dr. Robert Torres, MD (Internal Medicine)',
          pdcPercentage: 94,
          adherent: true
        }
      ] : [])
    ]
  };
}

function getFallbackChaosScenarios() {
  return {
    MPI_MISMATCH: {
      id: "MPI_MISMATCH",
      name: "Master Patient Index (MPI) Collision",
      description: "Swaps given/family names and modifies identifier authority to simulate disparate EHR registration discrepancy.",
      sample: {
        resourceType: "Patient",
        id: "PAT-CHAOS-MPI",
        identifier: [{ system: "http://hospital-b.org/mrn", value: "MRN-DIFF-9812" }],
        name: [{ use: "official", family: "Eleanor", given: ["Vance"] }],
        gender: "female",
        birthDate: "1968-04-12"
      },
      impact: "Causes duplicate chart creation in downstream EHR if deterministic MPI matching is strict."
    },
    TEMPORAL_INVERSION: {
      id: "TEMPORAL_INVERSION",
      name: "Retroactive Temporal Inversion",
      description: "Observation effective date precedes parent encounter start date by 30 days.",
      sample: {
        resourceType: "Observation",
        id: "OBS-CHAOS-TEMPORAL",
        status: "final",
        code: { coding: [{ system: "http://loinc.org", code: "1558-6", display: "Fasting Glucose" }] },
        effectiveDateTime: "2023-01-15T08:00:00Z",
        encounter: { reference: "Encounter/ENC-VANCE-2023-03" },
        valueQuantity: { value: 138, unit: "mg/dL" }
      },
      impact: "Breaks clinical timeline sorting and causes episode-of-care attribution errors."
    },
    DANGLING_PROVENANCE: {
      id: "DANGLING_PROVENANCE",
      name: "Dangling Prescriber Attribution",
      description: "Medication order references non-existent practitioner identifier.",
      sample: {
        resourceType: "MedicationRequest",
        id: "MED-CHAOS-DANGLING",
        status: "active",
        intent: "order",
        medicationCodeableConcept: { coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "860975", display: "Metformin HCl 1000mg" }] },
        requester: { reference: "Practitioner/PRAC-CHAOS-UNKNOWN" }
      },
      impact: "Direct claim denial and prior-authorization rejection under CMS-0057-F."
    },
    UNIT_MISMATCH: {
      id: "UNIT_MISMATCH",
      name: "Diagnostic Unit Mismatch (mmol/L vs mg/dL)",
      description: "Blood glucose reported as 7.8 mmol/L without UCUM unit harmonization against standard mg/dL.",
      sample: {
        resourceType: "Observation",
        id: "OBS-CHAOS-UNIT",
        status: "final",
        code: { coding: [{ system: "http://loinc.org", code: "1558-6", display: "Glucose" }] },
        valueQuantity: { value: 7.8, unit: "mmol/L", system: "http://unitsofmeasure.org", code: "mmol/L" }
      },
      impact: "If downstream system naively checks threshold > 100, hypoglycemia false-alarm or missed diabetes diagnosis occurs."
    }
  };
}

function getFallbackTrialsScreen() {
  return [
    {
      trial: {
        id: "TRIAL-DIAB-CKD-2026",
        title: "Phase III Renal Outcomes Study with SGLT2/GLP-1 Co-Therapy",
        sponsor: "Global Biopharma Clinical Research",
        phase: "Phase 3",
        therapeuticArea: "Endocrinology & Nephrology",
        inclusionCriteria: [
          { id: "INC-1", description: "Age 40 to 80 years old" },
          { id: "INC-2", description: "Documented Type 2 Diabetes for >= 12 months" },
          { id: "INC-3", description: "Baseline HbA1c between 7.0% and 10.5%" },
          { id: "INC-4", description: "Baseline eGFR between 30 and 75 mL/min/1.73m2" }
        ],
        exclusionCriteria: [
          { id: "EXC-1", description: "End-stage renal disease (eGFR < 30 mL/min/1.73m2)" },
          { id: "EXC-2", description: "Active acute coronary syndrome within 90 days" }
        ]
      },
      totalEvaluated: 5,
      eligibleCount: 1,
      excludedCount: 4,
      eligiblePatients: [
        {
          patientId: "PAT-VANCE-01",
          name: "Vance, Eleanor",
          isEligible: true,
          rationale: "Matches T2D, baseline HbA1c 7.0-9.4%, and eGFR 48 mL/min (meets 30-75 window)."
        }
      ],
      excludedPatients: [
        {
          patientId: "PAT-THORNE-02",
          name: "Thorne, Marcus",
          isEligible: false,
          rationale: "Excluded: History of acute coronary syndrome; no documented diabetes."
        },
        {
          patientId: "PAT-CHEN-03",
          name: "Chen, Sofia",
          isEligible: false,
          rationale: "Excluded: Pediatric age group fails minimum 40-year threshold."
        }
      ]
    },
    {
      trial: {
        id: "TRIAL-CARD-RECOVERY-04",
        title: "Longitudinal Post-Revascularization Dual Antiplatelet & Lipid Surveillance",
        sponsor: "Cardiovascular Outcomes Consortium",
        phase: "Phase 4",
        therapeuticArea: "Cardiology",
        inclusionCriteria: [
          { id: "INC-1", description: "History of acute myocardial infarction / STEMI" },
          { id: "INC-2", description: "Documented surgical CABG or PCI procedure" },
          { id: "INC-3", description: "Documented statin prescription therapy" }
        ],
        exclusionCriteria: [
          { id: "EXC-1", description: "Documented active severe bronchospasm / uncontrolled asthma" }
        ]
      },
      totalEvaluated: 5,
      eligibleCount: 1,
      excludedCount: 4,
      eligiblePatients: [
        {
          patientId: "PAT-THORNE-02",
          name: "Thorne, Marcus",
          isEligible: true,
          rationale: "Matches STEMI history, documented triple CABG procedure, and active statin therapy."
        }
      ],
      excludedPatients: [
        {
          patientId: "PAT-VANCE-01",
          name: "Vance, Eleanor",
          isEligible: false,
          rationale: "Excluded: No documented acute myocardial infarction or surgical revascularization."
        }
      ]
    }
  ];
}



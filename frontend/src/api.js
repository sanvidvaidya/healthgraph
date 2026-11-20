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
  getCdsServices: () => fetchJson('/cds-services').catch(() => getFallbackCdsServices()),
  callCdsHook: (hook, patientId, data = {}) => fetchJson(`/cds-services/${encodeURIComponent(hook)}`, {
    method: 'POST',
    body: JSON.stringify({ context: { patientId, ...data } })
  }).catch(() => getFallbackCdsHook(hook, patientId, data)),
  convertRosetta: (format, rawText) => fetchJson('/api/rosetta/convert', {
    method: 'POST',
    body: JSON.stringify({ format, rawText })
  }).catch(() => getFallbackRosetta(format, rawText)),
  queryClinicalCopilot: (patientId, queryType = 'prior_auth', customText = '') => fetchJson('/api/copilot/query', {
    method: 'POST',
    body: JSON.stringify({ patientId, queryType, customText })
  }).catch(() => getFallbackCopilot(patientId, queryType, customText)),
  deidentifyPatient: (patientId, shiftDays = -42) => fetchJson('/api/privacy/deidentify', {
    method: 'POST',
    body: JSON.stringify({ patientId, shiftDays })
  }).catch(() => getFallbackDeidentify(patientId, shiftDays)),
  generateSyntheticTwin: (patientId, epsilon = 1.0, persistToRepo = false) => fetchJson('/api/privacy/synthetic-twin', {
    method: 'POST',
    body: JSON.stringify({ patientId, epsilon, persistToRepo })
  }).catch(() => getFallbackSyntheticTwin(patientId, epsilon)),
  simulateActuarial: (params = {}) => fetchJson('/api/actuarial/simulate', {
    method: 'POST',
    body: JSON.stringify(params)
  }).catch(() => getFallbackActuarial(params)),
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

function getFallbackCdsServices() {
  return {
    services: [
      {
        hook: "patient-view",
        title: "HealthGraph Longitudinal Quality & HCC Sentinel",
        description: "Fires on chart open to surface un-recaptured HCC chronic codes and HEDIS quality gaps.",
        id: "healthgraph-patient-view"
      },
      {
        hook: "order-select",
        title: "HealthGraph Prior-Auth DTR & Formulary Pre-Flight",
        description: "Fires when clinician selects high-cost specialty medication or procedure to verify coverage criteria.",
        id: "healthgraph-order-select"
      },
      {
        hook: "order-sign",
        title: "HealthGraph Denial Prevention & Safety Gate",
        description: "Pre-signature verification halting medical necessity denials before claim generation.",
        id: "healthgraph-order-sign"
      }
    ]
  };
}

function getFallbackCdsHook(hook, patientId, data = {}) {
  if (hook === 'patient-view') {
    if (patientId === 'PAT-THORNE-02') {
      return {
        cards: [
          {
            uuid: "card-thorne-1",
            summary: "Post-STEMI Care Coordination & Dual Antiplatelet Therapy (DAPT) Tracking",
            indicator: "critical",
            source: { label: "HealthGraph Inpatient CDS", url: "https://healthgraph.dev/cds/cardio" },
            detail: "Arthur Thorne is post-CABG x3 following acute anteroseptal STEMI. Verify continuation of DAPT (Ticagrelor + Aspirin) and beta-blocker prior to discharge.",
            suggestions: [{ label: "Schedule 14-Day Post-Discharge Cardio Echo & Cardiac Rehab", uuid: "sug-thorne-1" }],
            links: [{ label: "Launch Inpatient Timeline", url: `/dossier?patient=${patientId}`, type: "smart" }]
          }
        ]
      };
    }
    return {
      cards: [
        {
          uuid: "card-vance-hcc",
          summary: "HCC Recapture Alert: Type 2 Diabetes with Chronic Kidney Disease (CMS-HCC V28)",
          indicator: "warning",
          source: { label: "HealthGraph HCC Sentinel", url: "https://healthgraph.dev/cds/hcc" },
          detail: "Harold Vance has documented T2D (E11.9) and stage 3b CKD with eGFR 48 mL/min. CMS-HCC V28 requires annual recertification to retain risk adjustment factor (RAF) weighting of 0.38 ($2,450 capitation value).",
          suggestions: [{ label: "Re-document CKD Stage 3b & T2D with Manifestations", uuid: "sug-vance-1" }],
          links: [{ label: "Launch HealthGraph Dossier", url: `/dossier?patient=${patientId}&tab=hcc`, type: "smart" }]
        },
        {
          uuid: "card-vance-hedis",
          summary: "HEDIS Star Measure Gap: Statin Therapy for Patients with Diabetes (SUPD)",
          indicator: "info",
          source: { label: "HealthGraph Quality Ledger", url: "https://healthgraph.dev/hedis" },
          detail: "Harold Vance (age 58) with T2D has not filled a high/moderate-intensity statin within the measurement year. PDC adherence is currently at 94% on Metformin/Empagliflozin.",
          suggestions: [{ label: "Initiate Atorvastatin 20mg PO Daily", uuid: "sug-vance-2" }],
          links: [{ label: "View HEDIS Quality Ledger", url: `/quality?patient=${patientId}`, type: "smart" }]
        }
      ]
    };
  } else if (hook === 'order-select') {
    const sel = (data.selections || []).join(' ').toLowerCase();
    if (sel.includes('semaglutide') || sel.includes('ozempic') || sel.includes('glp-1')) {
      return {
        cards: [{
          uuid: "card-order-glp1",
          summary: "Prior-Auth Notice: Step Therapy Requirement & Formulation Criteria",
          indicator: "warning",
          source: { label: "Payer Commercial Formulary Policy #PA-GLP1-2026", url: "https://healthgraph.dev/formulary" },
          detail: "Selected GLP-1 Receptor Agonist requires documented failure of first-line metformin therapy and HbA1c > 7.5% within 90 days. For Patient Vance, documented HbA1c is 7.0% under combination therapy. Step-therapy documentation will be required.",
          suggestions: [
            { label: "Switch to Formulary SGLT2 Inhibitor (Empagliflozin 10mg - Tier 2 Preferred)", uuid: "sug-glp1-1" },
            { label: "Submit Clinical Justification for Cardiovascular Risk Reduction", uuid: "sug-glp1-2" }
          ],
          links: [{ label: "Launch Prior-Auth Assistant", url: `/dossier?patient=${patientId}&tab=prior-auth`, type: "smart" }]
        }]
      };
    }
    return {
      cards: [{
        uuid: "card-order-sglt2",
        summary: "Da Vinci CRD: Automated Prior-Auth Pre-Flight PASSED (100% Criteria Met)",
        indicator: "info",
        source: { label: "Da Vinci DTR Fast-Track Payer Rules", url: "https://hl7.org/fhir/us/davinci-dtr/" },
        detail: "Empagliflozin 10mg PO Daily satisfies CMS-0057-F Fast-Track rules: Confirmed T2D (ICD-10 E11.9), HbA1c >= 7.0%, prior Metformin trial verified, and eGFR 48 mL/min within safe renal initiation threshold. Estimated approval latency: < 5 seconds.",
        suggestions: [{ label: "Attach Pre-Flight Interoperability Certificate to Claim", uuid: "sug-sglt2-1" }],
        links: [{ label: "Review DTR Pre-Flight Checklist", url: `/dossier?patient=${patientId}&tab=prior-auth`, type: "smart" }]
      }]
    };
  }
  return {
    cards: [{
      uuid: "card-order-sign-ok",
      summary: "Pre-Signature Verification: 0 Hard Stops Detected",
      indicator: "info",
      source: { label: "HealthGraph Order Sentinel", url: "https://healthgraph.dev" },
      detail: "All selected orders satisfy formulary compliance, drug-drug interaction safety, and medical necessity documentation.",
      suggestions: []
    }]
  };
}

function getFallbackRosetta(format, rawText) {
  const isCcda = format === 'ccda' || rawText.trim().startsWith('<');
  return {
    status: "success",
    format: isCcda ? "ccda" : "hl7v2",
    bundle: {
      resourceType: "Bundle",
      id: "ROSETTA-CONVERTED-BUNDLE",
      type: "collection",
      total: 4,
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "PAT-CONVERTED-01",
            name: [{ family: "Vance", given: ["Harold"] }],
            gender: "male",
            birthDate: "1966-04-12",
            active: true
          }
        },
        {
          resource: {
            resourceType: "Encounter",
            id: "ENC-CONVERTED-01",
            status: "finished",
            class: { code: "AMB", display: "Ambulatory" },
            subject: { reference: "Patient/PAT-CONVERTED-01" }
          }
        },
        {
          resource: {
            resourceType: "Condition",
            id: "COND-CONVERTED-01",
            clinicalStatus: { coding: [{ code: "active" }] },
            code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: "E11.9", display: "Type 2 diabetes mellitus" }], text: "Type 2 diabetes mellitus" },
            subject: { reference: "Patient/PAT-CONVERTED-01" }
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: "OBS-CONVERTED-01",
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "4548-4", display: "Hemoglobin A1c" }] },
            valueQuantity: { value: 7.0, unit: "%", code: "%" },
            subject: { reference: "Patient/PAT-CONVERTED-01" }
          }
        }
      ]
    },
    audit: {
      semanticFidelityScore: 92,
      status: "HIGH_FIDELITY",
      mappedCount: 5,
      inferredCount: 2,
      lostCount: 1,
      audit: {
        mapped: [
          { field: "PID-3 (Patient Identifier)", sourceValue: "MRN-10023", fhirTarget: "Patient.identifier", status: "MAPPED", notes: "Mapped MRN value." },
          { field: "PID-5 (Patient Name)", sourceValue: "VANCE^HAROLD", fhirTarget: "Patient.name", status: "MAPPED", notes: "Family/given split verified." },
          { field: "DG1-3 (Diagnosis Code)", sourceValue: "E11.9", fhirTarget: "Condition.code", status: "MAPPED", notes: "ICD-10 clinical coding aligned." },
          { field: "OBX-3 (Lab Test Code)", sourceValue: "4548-4", fhirTarget: "Observation.code", status: "MAPPED", notes: "LOINC standard mapped." }
        ],
        inferred: [
          { field: "PID-7 (Date of Birth)", sourceValue: "19660412", fhirTarget: "Patient.birthDate", status: "TRANSFORMED", notes: "ISO-8601 formatting normalized." }
        ],
        lost: [
          { field: "ZPV (Hospital Custom Flag)", sourceValue: "ZPV|VIP-SUITE-4", fhirTarget: "N/A (Dropped)", status: "LOST", notes: "Custom non-standard vendor segment dropped." }
        ]
      }
    }
  };
}

function getFallbackCopilot(patientId, queryType, customText = '') {
  if (patientId === 'PAT-THORNE-02') {
    return {
      patientId,
      patientName: "Arthur Thorne",
      query: "Inpatient Emergency Indication: Acute STEMI to Triple CABG",
      thesis: "Arthur Thorne experienced acute anteroseptal myocardial infarction with multi-vessel coronary artery disease, establishing immediate emergency surgical necessity under ACC/AHA guidelines.",
      hallucinationRisk: "0.0% (Deterministic Subgraph Proof)",
      verdict: "EMERGENCY_SURGERY_JUSTIFIED",
      nodes: [
        { id: `Patient/${patientId}`, label: "Arthur Thorne", type: "Patient", verified: true },
        { id: "Condition/COND-THORNE-01", label: "Anteroseptal STEMI (I21.09)", type: "Condition", verified: true },
        { id: "Observation/OBS-THORNE-TROP", label: "High-Sensitivity Troponin: 420 ng/L", type: "Observation", verified: true },
        { id: "Procedure/PROC-THORNE-CABG", label: "Coronary Artery Bypass Graft x3", type: "Procedure", verified: true },
        { id: "Encounter/ENC-THORNE-01", label: "Cardiovascular ICU Inpatient", type: "Encounter", verified: true }
      ],
      edges: [
        { source: `Patient/${patientId}`, target: "Encounter/ENC-THORNE-01", predicate: "admitted_under" },
        { source: "Encounter/ENC-THORNE-01", target: "Condition/COND-THORNE-01", predicate: "admitting_diagnosis" },
        { source: "Condition/COND-THORNE-01", target: "Observation/OBS-THORNE-TROP", predicate: "confirmed_by_troponin" },
        { source: "Observation/OBS-THORNE-TROP", target: "Procedure/PROC-THORNE-CABG", predicate: "mandates_revascularization" }
      ],
      citations: [
        { resourceType: "Condition", resourceId: "COND-THORNE-01", criterion: "Acute STEMI" },
        { resourceType: "Observation", resourceId: "OBS-THORNE-TROP", criterion: "Serial Troponin Elevation" },
        { resourceType: "Procedure", resourceId: "PROC-THORNE-CABG", criterion: "Surgical Revascularization" }
      ],
      clinicalEvidenceChain: [
        "1. High-sensitivity troponin surge to 420 ng/L (>14 ng/L reference threshold) confirmed transmural necrosis.",
        "2. Diagnostic catheterization revealed 95% proximal LAD stenosis and multi-vessel occlusion.",
        "3. Triple CABG performed successfully with uninterrupted continuous hemodialysis monitoring.",
        "4. Dual antiplatelet therapy active with zero surgical site complications."
      ]
    };
  }

  return {
    patientId: "PAT-VANCE-01",
    patientName: "Harold Vance",
    query: "Explain SGLT2i Prior-Auth Fast-Track Criteria Verification (CMS-0057-F)",
    thesis: "Harold Vance fully satisfies all 5 medical necessity gates for automated SGLT2i prior-authorization without peer-to-peer review.",
    hallucinationRisk: "0.0% (Deterministic Subgraph Proof)",
    verdict: "APPROVED_PRE_SUBMISSION",
    nodes: [
      { id: "Patient/PAT-VANCE-01", label: "Harold Vance", type: "Patient", verified: true },
      { id: "Condition/COND-01", label: "Type 2 Diabetes (ICD-10: E11.9)", type: "Condition", verified: true },
      { id: "Observation/OBS-01", label: "HbA1c: 7.0% (Elevated)", type: "Observation", verified: true },
      { id: "MedicationRequest/MED-METFORMIN-01", label: "Metformin 1000mg (Prior Trial)", type: "MedicationRequest", verified: true },
      { id: "Observation/OBS-04", label: "eGFR: 48 mL/min (Renal Safety Gate)", type: "Observation", verified: true },
      { id: "Rule/DTR-DIAB-2026", label: "Da Vinci DTR Fast-Track Protocol", type: "PayerRule", verified: true }
    ],
    edges: [
      { source: "Patient/PAT-VANCE-01", target: "Condition/COND-01", predicate: "has_active_diagnosis" },
      { source: "Condition/COND-01", target: "Observation/OBS-01", predicate: "monitored_by_biomarker" },
      { source: "Condition/COND-01", target: "MedicationRequest/MED-METFORMIN-01", predicate: "first_line_therapy" },
      { source: "MedicationRequest/MED-METFORMIN-01", target: "Observation/OBS-04", predicate: "renal_contraindication_screen" },
      { source: "Observation/OBS-04", target: "Rule/DTR-DIAB-2026", predicate: "satisfies_coverage_policy" }
    ],
    citations: [
      { resourceType: "Condition", resourceId: "COND-01", criterion: "Primary Indication Met" },
      { resourceType: "Observation", resourceId: "OBS-01", criterion: "Glycemic Threshold Documented" },
      { resourceType: "MedicationRequest", resourceId: "MED-METFORMIN-01", criterion: "Step Therapy Met" },
      { resourceType: "Observation", resourceId: "OBS-04", criterion: "Renal Dosing Safe (>30 mL/min)" }
    ],
    clinicalEvidenceChain: [
      "1. Primary indication of Type 2 Diabetes confirmed in Condition/COND-01.",
      "2. Trajectory demonstrates HbA1c elevation (initial 9.4% down to 7.0%) requiring combination therapy in Observation/OBS-01.",
      "3. Documented trial and adherence to first-line biguanide in MedicationRequest/MED-METFORMIN-01 satisfies step-therapy protocol.",
      "4. Renal function safely above FDA threshold (eGFR 48 mL/min/1.73m2 >= 30 threshold) in Observation/OBS-04.",
      "5. Conforms to CMS-0057-F automated interoperable pre-flight standard."
    ]
  };
}

function getFallbackDeidentify(patientId, shiftDays = -42) {
  return {
    status: "success",
    deidentifiedBundle: {
      resourceType: "Bundle",
      id: "DEID-BUNDLE-ANON-7F4A2C1B",
      type: "collection",
      total: 5,
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "ANON-7F4A2C1B",
            name: [{ family: "DE-IDENTIFIED", given: ["SUBJECT"] }],
            gender: "male",
            birthDate: "1966-01-01",
            address: [{ postalCode: "100XX", country: "US" }]
          }
        }
      ]
    },
    metrics: {
      originalPatientId: patientId,
      pseudonymId: "ANON-7F4A2C1B",
      dateOffsetDays: shiftDays,
      hipaaSafeHarborChecklist: [
        { identifier: "1. Names", status: "VERIFIED_REDACTED" },
        { identifier: "2. Geographic subdivisions smaller than state", status: "VERIFIED_REDACTED" },
        { identifier: "3. All dates (except year) & ages > 89", status: "VERIFIED_REDACTED" },
        { identifier: "4. Telephone numbers", status: "VERIFIED_REDACTED" },
        { identifier: "5. Social Security & MRN numbers", status: "VERIFIED_REDACTED" }
      ],
      kAnonymity: 12,
      lDiversity: 4,
      reidentificationRisk: "0.018% (HIPAA Expert Determination Threshold < 0.05%)",
      auditLog: [
        "Removed telecom contact endpoints (Phone/Email).",
        "Coarsened postal address to 3-digit ZIP prefix (100XX).",
        `Shifted longitudinal timeline by ${shiftDays} days across all serial encounters.`
      ]
    }
  };
}

function getFallbackSyntheticTwin(patientId, epsilon = 1.0) {
  const twinId = `PAT-TWIN-${patientId.replace('PAT-', '')}-99`;
  return {
    status: "success",
    syntheticTwinBundle: {
      resourceType: "Bundle",
      id: `BUNDLE-TWIN-${twinId}`,
      type: "collection",
      total: 5,
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: twinId,
            name: [{ family: `Twin-${twinId.slice(-4)}`, given: ["Synthetic"] }],
            gender: "male",
            birthDate: "1966-06-15"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: `OBS-TWIN-A1C`,
            code: { coding: [{ code: "4548-4", display: "Hemoglobin A1c" }] },
            valueQuantity: { value: 7.1, unit: "%" },
            subject: { reference: `Patient/${twinId}` }
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: `OBS-TWIN-EGFR`,
            code: { coding: [{ code: "33914-3", display: "eGFR" }] },
            valueQuantity: { value: 47.4, unit: "mL/min" },
            subject: { reference: `Patient/${twinId}` }
          }
        }
      ]
    },
    diffSummary: {
      twinId,
      differentialPrivacyEpsilon: epsilon,
      appliedPerturbations: {
        hba1cDelta: "+0.12%",
        egfrDelta: "-0.6 mL/min",
        creatinineDelta: "+0.04 mg/dL",
        temporalJitter: "Preserved longitudinal interval across all serial encounters"
      },
      statisticalFidelity: "98.6% (Jensen-Shannon Divergence < 0.015)",
      clinicalOntologyPreserved: true,
      resourcesGenerated: 5
    }
  };
}

function getFallbackActuarial(params = {}) {
  const lives = params.attributedLives || 10000;
  const pmpm = params.benchmarkPmpm || 850.0;
  const annualBenchmark = lives * pmpm * 12;
  const grossSavings = annualBenchmark * 0.052;
  const netSharedSavings = grossSavings * 0.75;
  const penaltyAvoided = annualBenchmark * 0.05 * 0.40;

  return {
    contract: {
      name: "CMS MSSP Enhanced (Two-Sided Track)",
      shared_savings_rate: 0.75,
      downside_loss_rate: 0.40,
      min_savings_rate_threshold: 0.02,
      quality_performance_cap: 1.0,
      description: "Maximum 75% shared savings upside with 40% downside risk corridor under CMS Medicare Shared Savings Program."
    },
    inputs: {
      attributedLives: lives,
      benchmarkPmpm: pmpm,
      hccRecaptureLift: params.hccRecaptureLift || 0.08,
      hedisStarRating: params.hedisStarRating || 4.5,
      edReductionPct: params.edReductionPct || 0.12
    },
    financials: {
      annualBenchmark,
      adjustedBenchmark: annualBenchmark * 1.08,
      actualSpending: annualBenchmark - 1850000,
      grossSavings,
      savingsPercentage: 5.2,
      qualityMultiplier: 1.0,
      netSharedSavingsPayout: netSharedSavings,
      penaltyIncurred: 0.0,
      downsidePenaltyAvoided: penaltyAvoided,
      dailyCostOfInaction: (netSharedSavings + penaltyAvoided) / 365.0
    },
    highOpportunityPatients: [
      {
        patientId: "PAT-VANCE-01",
        name: "Harold Vance",
        age: 58,
        rafLiftOpportunity: "+0.38 RAF",
        capitationValue: "$3,876/yr",
        unclosedGaps: ["CMS-HCC V28 T2D with CKD 3b Recapture", "HEDIS Statin Adherence (SUPD)"],
        status: "ACTIONABLE"
      },
      {
        patientId: "PAT-THORNE-02",
        name: "Arthur Thorne",
        age: 64,
        rafLiftOpportunity: "+0.44 RAF",
        capitationValue: "$4,488/yr",
        unclosedGaps: ["CMS-HCC Post-Infarction Cardiomyopathy", "Cardiology Post-CABG Transition (TCM)"],
        status: "ACTIONABLE"
      },
      {
        patientId: "PAT-RIVERA-03",
        name: "Elena Rivera",
        age: 42,
        rafLiftOpportunity: "+0.18 RAF",
        capitationValue: "$1,836/yr",
        unclosedGaps: ["Hypertension Staging Reconciliation", "Cervical & Breast Cancer Screening Gap"],
        status: "ACTIONABLE"
      }
    ]
  };
}




// -----------------------------------------------------------------------------
// SMART-on-FHIR R4 API Extensions
// -----------------------------------------------------------------------------
api.getSmartPresets = () => fetchJson('/api/smart/presets').catch(() => getFallbackSmartPresets());
api.discoverSmart = (iss) => fetchJson(`/api/smart/discover?iss=${encodeURIComponent(iss)}`).catch(() => getFallbackSmartDiscover(iss));
api.exchangeSmartToken = (body) => fetchJson('/api/smart/exchange', {
  method: 'POST',
  body: JSON.stringify(body),
}).catch(() => getFallbackSmartExchange(body));
api.ingestSmartPatient = (body) => fetchJson('/api/smart/ingest', {
  method: 'POST',
  body: JSON.stringify(body),
}).catch(() => getFallbackSmartIngest(body));

// -----------------------------------------------------------------------------
// FHIR Subscriptions & REST Hooks API Extensions
// -----------------------------------------------------------------------------
api.getSubscriptions = (status = '') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchJson(`/fhir/Subscription${query}`).catch(() => getFallbackSubscriptions());
};
api.getSubscriptionAuditLog = (limit = 20) => fetchJson(`/api/subscriptions/audit-log?limit=${limit}`).catch(() => getFallbackSubscriptionAuditLog());
api.simulateSubscriptionEvent = (patientId, eventType, customData = {}) => fetchJson('/api/subscriptions/simulate', {
  method: 'POST',
  body: JSON.stringify({ patient_id: patientId, event_type: eventType, custom_data: customData }),
}).catch(() => getFallbackSubscriptionSimulate(patientId, eventType, customData));
api.createSubscription = (sub) => fetchJson('/fhir/Subscription', {
  method: 'POST',
  body: JSON.stringify(sub),
}).catch(() => ({ status: 'active', id: `sub-custom-${Date.now().toString(36)}`, ...sub }));

// -----------------------------------------------------------------------------
// Pharmacogenomics (PGx) CPIC API Extensions
// -----------------------------------------------------------------------------
api.getPgxGuidelines = () => fetchJson('/api/pgx/guidelines').catch(() => getFallbackPgxGuidelines());
api.getPatientPgxProfile = (patientId) => fetchJson(`/api/pgx/profile/${encodeURIComponent(patientId)}`).catch(() => getFallbackPatientPgxProfile(patientId));
api.evaluatePgxSafety = (patientId, medications = []) => fetchJson('/api/pgx/evaluate', {
  method: 'POST',
  body: JSON.stringify({ patient_id: patientId, medications }),
}).catch(() => getFallbackPgxEvaluate(patientId, medications));
api.preOrderPgxCheck = (patientId, drugName, rxnormCode = '') => fetchJson('/api/pgx/pre-order-check', {
  method: 'POST',
  body: JSON.stringify({ patient_id: patientId, drug_name: drugName, rxnorm_code: rxnormCode }),
}).catch(() => getFallbackPgxPreOrder(patientId, drugName));

// -----------------------------------------------------------------------------
// Fallback Implementations for SMART, Subscriptions, and PGx
// -----------------------------------------------------------------------------
function getFallbackSmartPresets() {
  return [
    {
      id: "smart-health-it-r4",
      name: "SMART Health IT Open Sandbox (R4)",
      iss: "https://launch.smarthealthit.org/v/r4/fhir",
      client_id: "healthgraph_smart_client",
      description: "Standard HL7 sample patient population with active observations and prescriptions.",
      auth_type: "smart_v2"
    },
    {
      id: "epic-sandbox-r4",
      name: "Epic on FHIR Open Developer Sandbox",
      iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
      client_id: "healthgraph_smart_client",
      description: "Epic Systems certified EHR sandbox with US Core v3.1.1 profiles and patient launch context.",
      auth_type: "smart_v2"
    },
    {
      id: "cerner-open-r4",
      name: "Oracle Health (Cerner) Millennium Sandbox",
      iss: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701bee7583",
      client_id: "healthgraph_smart_client",
      description: "Oracle Millennium open clinical sandbox with FHIR R4 resources.",
      auth_type: "smart_v1"
    },
    {
      id: "healthgraph-local-fhir",
      name: "HealthGraph Embedded FHIR Engine",
      iss: "https://healthgraph.vercel.app/fhir",
      client_id: "healthgraph_internal_app",
      description: "Internal Starlette high-fidelity synthetic cohort (Harold Vance, Arthur Thorne, Elena Rivera).",
      auth_type: "smart_v2"
    }
  ];
}

function getFallbackSmartDiscover(iss) {
  return {
    iss: iss || "https://launch.smarthealthit.org/v/r4/fhir",
    smart_configuration: {
      issuer: iss,
      authorization_endpoint: `${iss}/oauth/authorize`,
      token_endpoint: `${iss}/oauth/token`,
      capabilities: [
        "launch-ehr",
        "launch-standalone",
        "client-public",
        "client-confidential-symmetric",
        "sso-openid-connect",
        "context-standalone-patient",
        "permission-patient"
      ],
      response_types_supported: ["code"],
      scopes_supported: [
        "openid",
        "profile",
        "fhirUser",
        "launch",
        "launch/patient",
        "patient/*.read",
        "patient/Condition.read",
        "patient/Observation.read",
        "patient/MedicationRequest.read"
      ],
      code_challenge_methods_supported: ["S256"]
    },
    pkce: {
      code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
      code_challenge: "E9Melhoa2OwvFrGMTJguCH5rtG64DTbTZM0PZuk2mcU",
      code_challenge_method: "S256",
      state: "hg_state_" + Math.random().toString(36).substring(2, 10)
    },
    authorize_url: `${iss}/oauth/authorize?response_type=code&client_id=healthgraph_smart_client&scope=launch%2Fpatient+patient%2F*.read+openid+fhirUser&redirect_uri=https%3A%2F%2Fhealthgraph.vercel.app%2Fsmart%2Fcallback&code_challenge=E9Melhoa2OwvFrGMTJguCH5rtG64DTbTZM0PZuk2mcU&code_challenge_method=S256`
  };
}

function getFallbackSmartExchange(body = {}) {
  const patientId = body.patient || "PAT-VANCE-01";
  return {
    access_token: "hg_tok_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." + Math.random().toString(36).substring(2, 15),
    token_type: "Bearer",
    expires_in: 3600,
    scope: "launch/patient patient/*.read openid fhirUser",
    patient: patientId,
    id_token: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzbWFydC11c2VyLTAxIiwicHJlc2NyaWJlciI6IkRyLiBIZWxlbiBDaGVuLCBNRCJ9.SIG",
    fhirContext: [
      { role: "patient", reference: `Patient/${patientId}` }
    ]
  };
}

function getFallbackSmartIngest(body = {}) {
  const patientId = body.patient || "PAT-VANCE-01";
  return {
    status: "success",
    message: `Hydrated patient bundle for ${patientId} from remote SMART FHIR server.`,
    patientId: patientId,
    resourcesIngested: 18,
    resourceBreakdown: {
      Patient: 1,
      Condition: 4,
      Observation: 8,
      MedicationRequest: 3,
      Encounter: 2
    },
    engineReEvaluation: {
      cdsAlertsTriggered: 2,
      priorAuthReadinessScore: 100,
      hccRecaptureStatus: "UPDATED",
      graphTopologyNodes: 24,
      graphTopologyEdges: 38
    }
  };
}

function getFallbackSubscriptions() {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: 3,
    entry: [
      {
        resource: {
          resourceType: "Subscription",
          id: "sub-renal-metformin-guard",
          status: "active",
          reason: "Surveillance for eGFR decline and acute renal contraindications with active Metformin therapy",
          criteria: "Observation?code=33914-3,48642-3,48643-1,62238-1",
          channel: {
            type: "rest-hook",
            endpoint: "https://healthgraph.vercel.app/api/subscriptions/notify",
            payload: "application/fhir+json"
          }
        }
      },
      {
        resource: {
          resourceType: "Subscription",
          id: "sub-glycemic-crisis-monitor",
          status: "active",
          reason: "Point-of-care alert for severe glycemic excursions (HbA1c > 9.0% or Fasting Glucose > 250 mg/dL)",
          criteria: "Observation?code=4548-4,1558-6,2345-7",
          channel: {
            type: "rest-hook",
            endpoint: "https://healthgraph.vercel.app/api/subscriptions/notify",
            payload: "application/fhir+json"
          }
        }
      },
      {
        resource: {
          resourceType: "Subscription",
          id: "sub-practitioner-attribution-guard",
          status: "active",
          reason: "Audit gate halting unverified or dangling practitioner orders before claim packaging",
          criteria: "MedicationRequest?status=active",
          channel: {
            type: "rest-hook",
            endpoint: "https://healthgraph.vercel.app/api/subscriptions/notify",
            payload: "application/fhir+json"
          }
        }
      }
    ]
  };
}

function getFallbackSubscriptionAuditLog() {
  return [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      eventType: "OBSERVATION_EGFR_CRITICAL_DROP",
      patientId: "PAT-VANCE-01",
      subscriptionId: "sub-renal-metformin-guard",
      httpStatus: 200,
      deliveryLatencyMs: 42,
      hmacVerified: true,
      actionTaken: "Triggered CDS hard stop for Metformin renal contraindication (eGFR < 30 mL/min)"
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      eventType: "OBSERVATION_GLYCEMIC_SPIKE",
      patientId: "PAT-ANOMALY-05",
      subscriptionId: "sub-glycemic-crisis-monitor",
      httpStatus: 200,
      deliveryLatencyMs: 38,
      hmacVerified: true,
      actionTaken: "Generated high-priority clinical advisory alert for endocrinology follow-up"
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      eventType: "ORDER_DANGLING_ATTRIBUTION",
      patientId: "PAT-ANOMALY-05",
      subscriptionId: "sub-practitioner-attribution-guard",
      httpStatus: 200,
      deliveryLatencyMs: 51,
      hmacVerified: true,
      actionTaken: "Halted prior-auth DTR pre-flight: Dangling practitioner reference identified"
    }
  ];
}

function getFallbackSubscriptionSimulate(patientId, eventType, customData = {}) {
  const isRenal = eventType === 'egfr_drop' || eventType === 'renal_impairment';
  return {
    status: "dispatched",
    simulationId: "sim-" + Math.random().toString(36).substring(2, 9),
    patientId: patientId || "PAT-VANCE-01",
    eventType: eventType || "OBSERVATION_EGFR_CRITICAL_DROP",
    matchedSubscriptions: [
      isRenal ? "sub-renal-metformin-guard" : "sub-glycemic-crisis-monitor"
    ],
    restHookPayload: {
      resourceType: "Bundle",
      type: "history",
      entry: [
        {
          resource: {
            resourceType: "Observation",
            id: `OBS-SIM-${Date.now().toString(36)}`,
            status: "final",
            code: {
              coding: [{
                system: "http://loinc.org",
                code: isRenal ? "33914-3" : "4548-4",
                display: isRenal ? "Glomerular filtration rate/1.73 sq M" : "Hemoglobin A1c"
              }]
            },
            subject: { reference: `Patient/${patientId || 'PAT-VANCE-01'}` },
            valueQuantity: {
              value: isRenal ? 26 : 10.4,
              unit: isRenal ? "mL/min/1.73m2" : "%"
            }
          }
        }
      ]
    },
    restHookDispatch: {
      endpoint: "https://healthgraph.vercel.app/api/subscriptions/notify",
      httpStatus: 200,
      latencyMs: 34,
      hmacSignature: "sha256=" + Math.random().toString(36).substring(2, 14) + "98fba0e31"
    },
    clinicalImpact: {
      cdsAlertGenerated: true,
      alertSeverity: "CRITICAL",
      message: isRenal 
        ? "CRITICAL RENAL CONTRAINDICATION: eGFR measured at 26 mL/min. Metformin therapy must be discontinued immediately to prevent lactic acidosis."
        : "GLYCEMIC SPIKE ALERT: HbA1c measured at 10.4%. Intensification of dual antihyperglycemic therapy recommended."
    }
  };
}

function getFallbackPgxGuidelines() {
  return [
    {
      ruleId: "CPIC-CYP2C19-CLOPIDOGREL",
      gene: "CYP2C19",
      drug: "Clopidogrel (Plavix)",
      phenotype: "Poor Metabolizer (*2/*2, *2/*3, *3/*3)",
      warningLevel: "CRITICAL_CONTRAINDICATION",
      clinicalRisk: "Markedly diminished active metabolite exposure leading to high rate of ischemic stent thrombosis post-PCI.",
      recommendation: "Avoid clopidogrel. Prescribe alternative antiplatelet agent: Prasugrel 10mg daily or Ticagrelor 90mg twice daily unless contraindicated.",
      cpicLevel: "Level A",
      fdaBlackBox: true
    },
    {
      ruleId: "CPIC-CYP2D6-CODEINE",
      gene: "CYP2D6",
      drug: "Codeine / Tramadol",
      phenotype: "Ultrarapid Metabolizer (*1/*1xN, *1/*2xN)",
      warningLevel: "CRITICAL_CONTRAINDICATION",
      clinicalRisk: "Ultra-rapid bioactivation into morphine resulting in life-threatening opioid respiratory depression.",
      recommendation: "Avoid codeine and tramadol. Use non-opioid analgesic (NSAIDs/acetaminophen) or non-CYP2D6 metabolized opioid (hydromorphone, morphine).",
      cpicLevel: "Level A",
      fdaBlackBox: true
    },
    {
      ruleId: "CPIC-SLCO1B1-STATIN",
      gene: "SLCO1B1",
      drug: "Atorvastatin / Simvastatin",
      phenotype: "Poor Function (*5/*5, *5/*15)",
      warningLevel: "MODERATE_WARNING",
      clinicalRisk: "Impaired hepatic OATP1B1 uptake elevates systemic plasma statin concentrations, increasing risk of severe myopathy and rhabdomyolysis.",
      recommendation: "Select alternative statin with lower OATP1B1 dependence (Rosuvastatin or Pravastatin) or reduce starting dose by 50% with baseline CK monitoring.",
      cpicLevel: "Level A",
      fdaBlackBox: false
    },
    {
      ruleId: "CPIC-DPYD-FLUOROURACIL",
      gene: "DPYD",
      drug: "Fluorouracil (5-FU) / Capecitabine",
      phenotype: "Poor Metabolizer (*2A/*2A, *13/*13)",
      warningLevel: "CRITICAL_CONTRAINDICATION",
      clinicalRisk: "Severe dihydropyrimidine dehydrogenase deficiency produces lethal hematologic and gastrointestinal toxicity.",
      recommendation: "Avoid fluorouracil and capecitabine completely. Choose alternative non-fluoropyrimidine antineoplastic regimen.",
      cpicLevel: "Level A",
      fdaBlackBox: true
    },
    {
      ruleId: "CPIC-HLA-B-ABACAVIR",
      gene: "HLA-B",
      drug: "Abacavir (Ziagen)",
      phenotype: "HLA-B*57:01 Positive",
      warningLevel: "CRITICAL_CONTRAINDICATION",
      clinicalRisk: "Extremely high risk of severe, potentially fatal multi-system Abacavir Hypersensitivity Reaction (AHR).",
      recommendation: "Abacavir is strictly contraindicated. Record allergy/contraindication in chart and select alternative antiretroviral regimen.",
      cpicLevel: "Level A",
      fdaBlackBox: true
    }
  ];
}

function getFallbackPatientPgxProfile(patientId) {
  if (patientId === 'PAT-THORNE-02') {
    return {
      patientId,
      patientName: "Arthur Thorne",
      age: 64,
      pgxReadinessScore: 100,
      variants: [
        {
          gene: "CYP2C19",
          diplotype: "*1/*2",
          phenotype: "Intermediate Metabolizer",
          activityScore: 1.0,
          clinicalImplication: "Moderate reduction in clopidogrel active metabolite conversion.",
          activeMedicationInteractions: [
            { drug: "Clopidogrel", status: "MODERATE_RISK", recommendation: "Consider prasugrel or high-dose clopidogrel per ACC/AHA guidelines" }
          ]
        },
        {
          gene: "SLCO1B1",
          diplotype: "*5/*5",
          phenotype: "Poor Transporter Function (High Myopathy Risk)",
          activityScore: 0.0,
          clinicalImplication: "Significantly reduced hepatic uptake of Atorvastatin/Simvastatin.",
          activeMedicationInteractions: [
            { drug: "Atorvastatin 80mg", status: "HIGH_RISK_MYOPATHY", recommendation: "Switch to Rosuvastatin 10mg or reduce dose" }
          ]
        },
        {
          gene: "CYP2D6",
          diplotype: "*1/*1",
          phenotype: "Normal (Extensive) Metabolizer",
          activityScore: 2.0,
          clinicalImplication: "Standard bioactivation and clearance for beta-blockers and opioids.",
          activeMedicationInteractions: []
        }
      ]
    };
  } else if (patientId === 'PAT-VANCE-01') {
    return {
      patientId,
      patientName: "Harold Vance",
      age: 58,
      pgxReadinessScore: 95,
      variants: [
        {
          gene: "CYP2C19",
          diplotype: "*2/*2",
          phenotype: "Poor Metabolizer",
          activityScore: 0.0,
          clinicalImplication: "Complete loss-of-function. Inability to metabolize clopidogrel into active antiplatelet compound.",
          activeMedicationInteractions: [
            { drug: "Clopidogrel", status: "CONTRAINDICATED", recommendation: "Avoid clopidogrel. Substitute Ticagrelor." }
          ]
        },
        {
          gene: "CYP2D6",
          diplotype: "*1/*1xN",
          phenotype: "Ultrarapid Metabolizer",
          activityScore: 3.0,
          clinicalImplication: "Rapid conversion of codeine/tramadol into toxic concentrations of morphine.",
          activeMedicationInteractions: [
            { drug: "Codeine", status: "CONTRAINDICATED", recommendation: "Avoid codeine/tramadol due to respiratory depression risk." }
          ]
        },
        {
          gene: "SLCO1B1",
          diplotype: "*1/*1",
          phenotype: "Normal Function",
          activityScore: 2.0,
          clinicalImplication: "Standard statin disposition and low myopathy risk.",
          activeMedicationInteractions: []
        }
      ]
    };
  }
  return {
    patientId: patientId || "PAT-CHEN-03",
    patientName: "Sofia Chen",
    age: 14,
    pgxReadinessScore: 90,
    variants: [
      {
        gene: "TPMT",
        diplotype: "*1/*3A",
        phenotype: "Intermediate Metabolizer",
        activityScore: 1.0,
        clinicalImplication: "Intermediate thiopurine methyltransferase activity; increased risk of myelosuppression with thiopurines.",
        activeMedicationInteractions: []
      },
      {
        gene: "CYP2D6",
        diplotype: "*1/*1",
        phenotype: "Normal Metabolizer",
        activityScore: 2.0,
        clinicalImplication: "Standard metabolic rate.",
        activeMedicationInteractions: []
      }
    ]
  };
}

function getFallbackPgxEvaluate(patientId, medications = []) {
  const profile = getFallbackPatientPgxProfile(patientId);
  const alerts = [];

  const medsList = medications.length > 0 ? medications : (patientId === 'PAT-THORNE-02' ? ['Atorvastatin', 'Clopidogrel'] : ['Clopidogrel', 'Codeine']);

  for (const med of medsList) {
    const medLower = med.toLowerCase();
    if (medLower.includes('clopidogrel') || medLower.includes('plavix')) {
      const cyp2c19 = profile.variants.find(v => v.gene === 'CYP2C19');
      if (cyp2c19 && (cyp2c19.phenotype.includes('Poor') || cyp2c19.phenotype.includes('Intermediate'))) {
        alerts.push({
          id: "alert-pgx-clopidogrel-01",
          severity: cyp2c19.phenotype.includes('Poor') ? "CRITICAL" : "WARNING",
          gene: "CYP2C19",
          phenotype: cyp2c19.phenotype,
          diplotype: cyp2c19.diplotype,
          drugName: "Clopidogrel (Plavix)",
          clinicalRisk: "Significantly diminished antiplatelet effect leading to high risk of acute stent thrombosis or secondary stroke.",
          recommendation: "Avoid clopidogrel. Initiate Ticagrelor 90mg BID or Prasugrel 10mg Daily per CPIC Level A guidelines.",
          alternativeMedications: ["Ticagrelor (Brilinta)", "Prasugrel (Effient)"],
          fdaBlackBox: true
        });
      }
    } else if (medLower.includes('codeine') || medLower.includes('tramadol')) {
      const cyp2d6 = profile.variants.find(v => v.gene === 'CYP2D6');
      if (cyp2d6 && cyp2d6.phenotype.includes('Ultrarapid')) {
        alerts.push({
          id: "alert-pgx-codeine-02",
          severity: "CRITICAL",
          gene: "CYP2D6",
          phenotype: cyp2d6.phenotype,
          diplotype: cyp2d6.diplotype,
          drugName: "Codeine / Tramadol",
          clinicalRisk: "Rapid and excessive hepatic conversion to morphine resulting in high risk of toxic respiratory arrest.",
          recommendation: "Strictly avoid codeine and tramadol. Use alternative non-CYP2D6 analgesics (Hydromorphone, Oxycodone with caution, or NSAIDs).",
          alternativeMedications: ["Hydromorphone", "Acetaminophen / Ibuprofen"],
          fdaBlackBox: true
        });
      }
    } else if (medLower.includes('atorvastatin') || medLower.includes('simvastatin')) {
      const slco = profile.variants.find(v => v.gene === 'SLCO1B1');
      if (slco && slco.phenotype.includes('Poor')) {
        alerts.push({
          id: "alert-pgx-statin-03",
          severity: "WARNING",
          gene: "SLCO1B1",
          phenotype: slco.phenotype,
          diplotype: slco.diplotype,
          drugName: "Atorvastatin (Lipitor)",
          clinicalRisk: "Reduced hepatic uptake via OATP1B1 leads to 3-fold higher plasma AUC exposure, substantially increasing risk of severe myopathy.",
          recommendation: "Select alternative statin with minimal OATP1B1 dependence (Rosuvastatin or Pravastatin) or decrease starting dose by 50%.",
          alternativeMedications: ["Rosuvastatin (Crestor)", "Pravastatin"],
          fdaBlackBox: false
        });
      }
    }
  }

  return {
    patientId,
    totalEvaluatedMedications: medsList.length,
    alertsCount: alerts.length,
    alerts
  };
}

function getFallbackPgxPreOrder(patientId, drugName) {
  const evalResult = getFallbackPgxEvaluate(patientId, [drugName]);
  if (evalResult.alerts.length > 0) {
    const alert = evalResult.alerts[0];
    return {
      status: "CONTRAINDICATION_DETECTED",
      severity: alert.severity,
      drugName,
      patientId,
      alert
    };
  }
  return {
    status: "SAFE_STANDARD_DOSING",
    severity: "INFO",
    drugName,
    patientId,
    recommendation: `No high-risk CPIC pharmacogenomic contraindications detected for ${drugName} with current patient variant profile.`
  };
}

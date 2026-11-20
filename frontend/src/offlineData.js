/**
 * HealthGraph Deterministic Offline / Static Fallback Dataset
 * Extracted from FHIR R4 Synthetic Clinical Repository for resilient Vercel SPA operation.
 */

export const FALLBACK_STATS = {
  "totalResources": 65,
  "countsByType": {
    "Observation": 24,
    "Encounter": 10,
    "Condition": 8,
    "MedicationRequest": 6,
    "Patient": 5,
    "Practitioner": 5,
    "DiagnosticReport": 3,
    "Organization": 2,
    "Procedure": 2
  },
  "patientCount": 5,
  "danglingReferencesCount": 1,
  "orphanResourcesCount": 1,
  "fhirVersion": "4.0.1 (R4)"
};

export const FALLBACK_PATIENTS = [
  {
    "id": "PAT-CHEN-03",
    "name": "Sofia Mei Chen",
    "mrn": "MRN-330194",
    "gender": "female",
    "birthDate": "2013-07-22",
    "active": true,
    "managingOrg": "Metropolitan Health",
    "counts": {
      "encounters": 1,
      "conditions": 1,
      "observations": 1,
      "medications": 1,
      "total": 5
    },
    "transferStatus": "TRANSFER READY",
    "transferReady": true
  },
  {
    "id": "PAT-ROSS-04",
    "name": "David Edward Ross",
    "mrn": "MRN-512093",
    "gender": "male",
    "birthDate": "1972-02-14",
    "active": true,
    "managingOrg": "Metropolitan Health",
    "counts": {
      "encounters": 1,
      "conditions": 1,
      "observations": 1,
      "medications": 0,
      "total": 5
    },
    "transferStatus": "TRANSFER READY",
    "transferReady": true
  },
  {
    "id": "PAT-THORNE-02",
    "name": "Marcus Anthony Thorne",
    "mrn": "MRN-602931",
    "gender": "male",
    "birthDate": "1966-11-28",
    "active": true,
    "managingOrg": "Metropolitan Health",
    "counts": {
      "encounters": 2,
      "conditions": 2,
      "observations": 4,
      "medications": 1,
      "total": 12
    },
    "transferStatus": "TRANSFER READY",
    "transferReady": true
  },
  {
    "id": "PAT-VANCE-01",
    "name": "Eleanor Rose Vance",
    "mrn": "MRN-849201",
    "gender": "female",
    "birthDate": "1958-04-12",
    "active": true,
    "managingOrg": "Metropolitan Academic Health System",
    "counts": {
      "encounters": 5,
      "conditions": 3,
      "observations": 16,
      "medications": 3,
      "total": 30
    },
    "transferStatus": "TRANSFER READY",
    "transferReady": true
  },
  {
    "id": "PAT-ANOMALY-05",
    "name": "Alex Subject-Unresolved",
    "mrn": "MRN-ANOMALY-999",
    "gender": "unknown",
    "birthDate": "Not Recorded",
    "active": true,
    "managingOrg": "Metropolitan Health",
    "counts": {
      "encounters": 1,
      "conditions": 1,
      "observations": 1,
      "medications": 1,
      "total": 5
    },
    "transferStatus": "TRANSFER BLOCKED",
    "transferReady": false
  }
];

export const FALLBACK_DOSSIERS = {
  "PAT-CHEN-03": {
    "patient": {
      "resourceType": "Patient",
      "id": "PAT-CHEN-03",
      "active": true,
      "identifier": [
        {
          "use": "usual",
          "system": "http://metrohealth.example.org/mrn",
          "value": "MRN-330194"
        }
      ],
      "name": [
        {
          "use": "official",
          "family": "Chen",
          "given": [
            "Sofia",
            "Mei"
          ]
        }
      ],
      "gender": "female",
      "birthDate": "2013-07-22",
      "address": [
        {
          "line": [
            "88 Harvard Street"
          ],
          "city": "Brookline",
          "state": "MA",
          "postalCode": "02446",
          "country": "USA"
        }
      ],
      "generalPractitioner": [
        {
          "reference": "Practitioner/PRAC-WALSH-05",
          "display": "Dr. Amy Walsh"
        }
      ],
      "managingOrganization": {
        "reference": "Organization/ORG-METRO"
      }
    },
    "resourcesByType": {
      "MedicationRequest": [
        {
          "resourceType": "MedicationRequest",
          "id": "MED-CHEN-ALBUTEROL",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "745679",
                "display": "Albuterol 0.09 MG/ACTUAT Inhalant Metered Dose Inhaler"
              }
            ],
            "text": "Albuterol HFA Inhaler 90 mcg/actuation"
          },
          "subject": {
            "reference": "Patient/PAT-CHEN-03"
          },
          "encounter": {
            "reference": "Encounter/ENC-CHEN-2024-09"
          },
          "authoredOn": "2024-09-04T15:30:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-WALSH-05"
          },
          "dosageInstruction": [
            {
              "text": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing"
            }
          ]
        }
      ],
      "Observation": [
        {
          "resourceType": "Observation",
          "id": "OBS-CHEN-FEV1",
          "status": "final",
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "20150-9",
                "display": "FEV1"
              }
            ],
            "text": "Forced Expiratory Volume in 1 Second (FEV1)"
          },
          "subject": {
            "reference": "Patient/PAT-CHEN-03"
          },
          "encounter": {
            "reference": "Encounter/ENC-CHEN-2024-09"
          },
          "effectiveDateTime": "2024-09-04T15:15:00Z",
          "valueQuantity": {
            "value": 1.78,
            "unit": "L",
            "system": "http://unitsofmeasure.org",
            "code": "L"
          },
          "referenceRange": [
            {
              "low": {
                "value": 2.1,
                "unit": "L"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Mild Obstructive Defect (76% Predicted)"
            }
          ]
        }
      ],
      "Encounter": [
        {
          "resourceType": "Encounter",
          "id": "ENC-CHEN-2024-09",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB"
          },
          "type": [
            {
              "text": "Pediatric Pulmonary Care & Spirometry Testing"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-CHEN-03"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-WALSH-05"
              }
            }
          ],
          "period": {
            "start": "2024-09-04T15:00:00Z",
            "end": "2024-09-04T15:45:00Z"
          },
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ],
      "Condition": [
        {
          "resourceType": "Condition",
          "id": "COND-CHEN-ASTHMA",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "J45.40",
                "display": "Moderate persistent asthma, uncomplicated"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "195967001",
                "display": "Asthma"
              }
            ],
            "text": "Moderate Persistent Allergic Asthma"
          },
          "subject": {
            "reference": "Patient/PAT-CHEN-03"
          },
          "onsetDateTime": "2020-05-18"
        }
      ],
      "Patient": [
        {
          "resourceType": "Patient",
          "id": "PAT-CHEN-03",
          "active": true,
          "identifier": [
            {
              "use": "usual",
              "system": "http://metrohealth.example.org/mrn",
              "value": "MRN-330194"
            }
          ],
          "name": [
            {
              "use": "official",
              "family": "Chen",
              "given": [
                "Sofia",
                "Mei"
              ]
            }
          ],
          "gender": "female",
          "birthDate": "2013-07-22",
          "address": [
            {
              "line": [
                "88 Harvard Street"
              ],
              "city": "Brookline",
              "state": "MA",
              "postalCode": "02446",
              "country": "USA"
            }
          ],
          "generalPractitioner": [
            {
              "reference": "Practitioner/PRAC-WALSH-05",
              "display": "Dr. Amy Walsh"
            }
          ],
          "managingOrganization": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ]
    },
    "totalResources": 5,
    "timeline": {
      "patientId": "PAT-CHEN-03",
      "totalEvents": 5,
      "events": [
        {
          "resourceType": "Patient",
          "resourceId": "PAT-CHEN-03",
          "resourceKey": "Patient/PAT-CHEN-03",
          "timestamp": "2013-07-22T00:00:00Z",
          "dateOnly": "2013-07-22",
          "title": "Patient Birth Date",
          "category": "demographic",
          "status": "recorded",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Recorded date of birth",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-CHEN-ASTHMA",
          "resourceKey": "Condition/COND-CHEN-ASTHMA",
          "timestamp": "2020-05-18T00:00:00Z",
          "dateOnly": "2020-05-18",
          "title": "Condition Diagnosed: Moderate Persistent Allergic Asthma",
          "category": "condition",
          "status": "active",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Active",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-CHEN-2024-09",
          "resourceKey": "Encounter/ENC-CHEN-2024-09",
          "timestamp": "2024-09-04T15:00:00Z",
          "dateOnly": "2024-09-04",
          "title": "Ambulatory Encounter: Pediatric Pulmonary Care & Spirometry Testing",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-CHEN-2024-09",
          "valueDisplay": null,
          "summary": "Encounter duration: 2024-09-04 to 2024-09-04",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-CHEN-FEV1",
          "resourceKey": "Observation/OBS-CHEN-FEV1",
          "timestamp": "2024-09-04T15:15:00Z",
          "dateOnly": "2024-09-04",
          "title": "Measurement: Forced Expiratory Volume in 1 Second (FEV1)",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-CHEN-2024-09",
          "valueDisplay": "1.78 L",
          "summary": "Observed value: 1.78 L",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-CHEN-ALBUTEROL",
          "resourceKey": "MedicationRequest/MED-CHEN-ALBUTEROL",
          "timestamp": "2024-09-04T15:30:00Z",
          "dateOnly": "2024-09-04",
          "title": "Rx Order: Albuterol HFA Inhaler 90 mcg/actuation",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-CHEN-2024-09",
          "valueDisplay": null,
          "summary": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing",
          "details": {}
        }
      ],
      "encounterGroups": [
        {
          "encounterId": "ENC-CHEN-2024-09",
          "title": "Pediatric Pulmonary Care & Spirometry Testing",
          "class": "Ambulatory",
          "start": "2024-09-04T15:00:00Z",
          "end": "2024-09-04T15:45:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-CHEN-2024-09",
              "resourceKey": "Encounter/ENC-CHEN-2024-09",
              "timestamp": "2024-09-04T15:00:00Z",
              "dateOnly": "2024-09-04",
              "title": "Ambulatory Encounter: Pediatric Pulmonary Care & Spirometry Testing",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-CHEN-2024-09",
              "valueDisplay": null,
              "summary": "Encounter duration: 2024-09-04 to 2024-09-04",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-CHEN-FEV1",
              "resourceKey": "Observation/OBS-CHEN-FEV1",
              "timestamp": "2024-09-04T15:15:00Z",
              "dateOnly": "2024-09-04",
              "title": "Measurement: Forced Expiratory Volume in 1 Second (FEV1)",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-CHEN-2024-09",
              "valueDisplay": "1.78 L",
              "summary": "Observed value: 1.78 L",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-CHEN-ALBUTEROL",
              "resourceKey": "MedicationRequest/MED-CHEN-ALBUTEROL",
              "timestamp": "2024-09-04T15:30:00Z",
              "dateOnly": "2024-09-04",
              "title": "Rx Order: Albuterol HFA Inhaler 90 mcg/actuation",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-CHEN-2024-09",
              "valueDisplay": null,
              "summary": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing",
              "details": {}
            }
          ]
        }
      ],
      "series": {
        "Forced Expiratory Volume in 1 Second (FEV1)": [
          {
            "timestamp": "2024-09-04T15:15:00Z",
            "date": "2024-09-04",
            "value": 1.78,
            "unit": "L",
            "observationId": "OBS-CHEN-FEV1",
            "status": "final"
          }
        ]
      }
    },
    "subgraph": {
      "patientId": "PAT-CHEN-03",
      "nodes": [
        {
          "id": "Observation/OBS-CHEN-FEV1",
          "resourceId": "OBS-CHEN-FEV1",
          "resourceType": "Observation",
          "title": "Forced Expiratory Volume in 1 Second (FEV1)",
          "status": "final",
          "date": "2024-09-04T15:15:00Z",
          "patientId": "PAT-CHEN-03",
          "degree": 2
        },
        {
          "id": "MedicationRequest/MED-CHEN-ALBUTEROL",
          "resourceId": "MED-CHEN-ALBUTEROL",
          "resourceType": "MedicationRequest",
          "title": "Albuterol HFA Inhaler 90 mcg/actuation",
          "status": "active",
          "date": "2024-09-04T15:30:00Z",
          "patientId": "PAT-CHEN-03",
          "degree": 3
        },
        {
          "id": "Encounter/ENC-CHEN-2024-09",
          "resourceId": "ENC-CHEN-2024-09",
          "resourceType": "Encounter",
          "title": "Encounter ENC-CHEN-2024-09",
          "status": "finished",
          "date": "2024-09-04T15:00:00Z",
          "patientId": "PAT-CHEN-03",
          "degree": 5
        },
        {
          "id": "Practitioner/PRAC-WALSH-05",
          "resourceId": "PRAC-WALSH-05",
          "resourceType": "Practitioner",
          "title": "Dr. Amy L. Walsh",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 3
        },
        {
          "id": "Patient/PAT-CHEN-03",
          "resourceId": "PAT-CHEN-03",
          "resourceType": "Patient",
          "title": "Sofia Mei Chen",
          "status": "recorded",
          "date": "2013-07-22",
          "patientId": "PAT-CHEN-03",
          "degree": 6
        },
        {
          "id": "Organization/ORG-METRO",
          "resourceId": "ORG-METRO",
          "resourceType": "Organization",
          "title": "Metropolitan Academic Health System",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 2
        },
        {
          "id": "Condition/COND-CHEN-ASTHMA",
          "resourceId": "COND-CHEN-ASTHMA",
          "resourceType": "Condition",
          "title": "Moderate Persistent Allergic Asthma",
          "status": "active",
          "date": "2020-05-18",
          "patientId": "PAT-CHEN-03",
          "degree": 1
        }
      ],
      "edges": [
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-CHEN-FEV1",
          "target": "Patient/PAT-CHEN-03"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-CHEN-FEV1",
          "target": "Encounter/ENC-CHEN-2024-09"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
          "target": "Patient/PAT-CHEN-03"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
          "target": "Encounter/ENC-CHEN-2024-09"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": true,
          "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
          "target": "Practitioner/PRAC-WALSH-05"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-CHEN-2024-09",
          "target": "Patient/PAT-CHEN-03"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-CHEN-2024-09",
          "target": "Practitioner/PRAC-WALSH-05"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-CHEN-2024-09",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "generalPractitioner[0]",
          "label": "primary care",
          "isResolved": true,
          "source": "Patient/PAT-CHEN-03",
          "target": "Practitioner/PRAC-WALSH-05"
        },
        {
          "path": "managingOrganization",
          "label": "organization",
          "isResolved": true,
          "source": "Patient/PAT-CHEN-03",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-CHEN-ASTHMA",
          "target": "Patient/PAT-CHEN-03"
        }
      ],
      "nodeCount": 7,
      "edgeCount": 11
    },
    "transferReadiness": {
      "patientId": "PAT-CHEN-03",
      "transferStatus": "TRANSFER READY",
      "isReady": true,
      "checks": [
        {
          "dimension": "Patient Demographics & Identity",
          "passed": true,
          "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
        },
        {
          "dimension": "Encounter Episode Context",
          "passed": true,
          "details": "1 Encounters verified with class & duration."
        },
        {
          "dimension": "Medication Prescriber Attribution",
          "passed": true,
          "details": "1 Medication orders verified against provider registry."
        },
        {
          "dimension": "Referential Completeness",
          "passed": true,
          "details": "0 unresolved reference(s) found in patient sub-graph."
        }
      ],
      "reasons": [
        "All essential clinical and referential transfer prerequisites satisfied."
      ],
      "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
    }
  },
  "PAT-ROSS-04": {
    "patient": {
      "resourceType": "Patient",
      "id": "PAT-ROSS-04",
      "active": true,
      "identifier": [
        {
          "use": "usual",
          "system": "http://metrohealth.example.org/mrn",
          "value": "MRN-512093"
        }
      ],
      "name": [
        {
          "use": "official",
          "family": "Ross",
          "given": [
            "David",
            "Edward"
          ]
        }
      ],
      "gender": "male",
      "birthDate": "1972-02-14",
      "address": [
        {
          "line": [
            "210 Commonwealth Avenue"
          ],
          "city": "Boston",
          "state": "MA",
          "postalCode": "02116",
          "country": "USA"
        }
      ],
      "managingOrganization": {
        "reference": "Organization/ORG-METRO"
      }
    },
    "resourcesByType": {
      "Observation": [
        {
          "resourceType": "Observation",
          "id": "OBS-ROSS-CEA-2025",
          "status": "final",
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "2039-6",
                "display": "Carcinoembryonic Ag [Mass/volume] in Serum or Plasma"
              }
            ],
            "text": "Carcinoembryonic Antigen (CEA)"
          },
          "subject": {
            "reference": "Patient/PAT-ROSS-04"
          },
          "encounter": {
            "reference": "Encounter/ENC-ROSS-2025-01"
          },
          "effectiveDateTime": "2025-01-14T09:15:00Z",
          "valueQuantity": {
            "value": 1.8,
            "unit": "ng/mL",
            "system": "http://unitsofmeasure.org",
            "code": "ng/mL"
          },
          "referenceRange": [
            {
              "high": {
                "value": 3.0,
                "unit": "ng/mL"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Normal / Undetectable Recurrence"
            }
          ]
        }
      ],
      "Encounter": [
        {
          "resourceType": "Encounter",
          "id": "ENC-ROSS-2025-01",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB"
          },
          "type": [
            {
              "text": "Medical Oncology 3-Year Post-Treatment Surveillance"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-ROSS-04"
          },
          "period": {
            "start": "2025-01-14T09:00:00Z",
            "end": "2025-01-14T09:40:00Z"
          },
          "diagnosis": [
            {
              "condition": {
                "reference": "Condition/COND-ROSS-COLON"
              }
            }
          ],
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ],
      "DiagnosticReport": [
        {
          "resourceType": "DiagnosticReport",
          "id": "DR-ROSS-CT-SURV",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                  "code": "RAD"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "24627-2",
                "display": "CT Chest and Abdomen and Pelvis with IV contrast"
              }
            ],
            "text": "Surveillance CT Chest/Abdomen/Pelvis"
          },
          "subject": {
            "reference": "Patient/PAT-ROSS-04"
          },
          "encounter": {
            "reference": "Encounter/ENC-ROSS-2025-01"
          },
          "effectiveDateTime": "2025-01-12T11:00:00Z",
          "result": [
            {
              "reference": "Observation/OBS-ROSS-CEA-2025"
            }
          ],
          "conclusion": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical appearance."
        }
      ],
      "Condition": [
        {
          "resourceType": "Condition",
          "id": "COND-ROSS-COLON",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "remission",
                "display": "Remission"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "C18.2",
                "display": "Malignant neoplasm of ascending colon"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "363406005",
                "display": "Malignant tumor of colon"
              }
            ],
            "text": "Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)"
          },
          "subject": {
            "reference": "Patient/PAT-ROSS-04"
          },
          "onsetDateTime": "2021-10-10"
        }
      ],
      "Patient": [
        {
          "resourceType": "Patient",
          "id": "PAT-ROSS-04",
          "active": true,
          "identifier": [
            {
              "use": "usual",
              "system": "http://metrohealth.example.org/mrn",
              "value": "MRN-512093"
            }
          ],
          "name": [
            {
              "use": "official",
              "family": "Ross",
              "given": [
                "David",
                "Edward"
              ]
            }
          ],
          "gender": "male",
          "birthDate": "1972-02-14",
          "address": [
            {
              "line": [
                "210 Commonwealth Avenue"
              ],
              "city": "Boston",
              "state": "MA",
              "postalCode": "02116",
              "country": "USA"
            }
          ],
          "managingOrganization": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ]
    },
    "totalResources": 5,
    "timeline": {
      "patientId": "PAT-ROSS-04",
      "totalEvents": 5,
      "events": [
        {
          "resourceType": "Patient",
          "resourceId": "PAT-ROSS-04",
          "resourceKey": "Patient/PAT-ROSS-04",
          "timestamp": "1972-02-14T00:00:00Z",
          "dateOnly": "1972-02-14",
          "title": "Patient Birth Date",
          "category": "demographic",
          "status": "recorded",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Recorded date of birth",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-ROSS-COLON",
          "resourceKey": "Condition/COND-ROSS-COLON",
          "timestamp": "2021-10-10T00:00:00Z",
          "dateOnly": "2021-10-10",
          "title": "Condition Diagnosed: Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)",
          "category": "condition",
          "status": "remission",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Remission",
          "details": {}
        },
        {
          "resourceType": "DiagnosticReport",
          "resourceId": "DR-ROSS-CT-SURV",
          "resourceKey": "DiagnosticReport/DR-ROSS-CT-SURV",
          "timestamp": "2025-01-12T11:00:00Z",
          "dateOnly": "2025-01-12",
          "title": "Diagnostic Report: Surveillance CT Chest/Abdomen/Pelvis",
          "category": "report",
          "status": "final",
          "encounterId": "ENC-ROSS-2025-01",
          "valueDisplay": null,
          "summary": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical...",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-ROSS-2025-01",
          "resourceKey": "Encounter/ENC-ROSS-2025-01",
          "timestamp": "2025-01-14T09:00:00Z",
          "dateOnly": "2025-01-14",
          "title": "Ambulatory Encounter: Medical Oncology 3-Year Post-Treatment Surveillance",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-ROSS-2025-01",
          "valueDisplay": null,
          "summary": "Encounter duration: 2025-01-14 to 2025-01-14",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-ROSS-CEA-2025",
          "resourceKey": "Observation/OBS-ROSS-CEA-2025",
          "timestamp": "2025-01-14T09:15:00Z",
          "dateOnly": "2025-01-14",
          "title": "Measurement: Carcinoembryonic Antigen (CEA)",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-ROSS-2025-01",
          "valueDisplay": "1.8 ng/mL",
          "summary": "Observed value: 1.8 ng/mL",
          "details": {}
        }
      ],
      "encounterGroups": [
        {
          "encounterId": "ENC-ROSS-2025-01",
          "title": "Medical Oncology 3-Year Post-Treatment Surveillance",
          "class": "Ambulatory",
          "start": "2025-01-14T09:00:00Z",
          "end": "2025-01-14T09:40:00Z",
          "events": [
            {
              "resourceType": "DiagnosticReport",
              "resourceId": "DR-ROSS-CT-SURV",
              "resourceKey": "DiagnosticReport/DR-ROSS-CT-SURV",
              "timestamp": "2025-01-12T11:00:00Z",
              "dateOnly": "2025-01-12",
              "title": "Diagnostic Report: Surveillance CT Chest/Abdomen/Pelvis",
              "category": "report",
              "status": "final",
              "encounterId": "ENC-ROSS-2025-01",
              "valueDisplay": null,
              "summary": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical...",
              "details": {}
            },
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-ROSS-2025-01",
              "resourceKey": "Encounter/ENC-ROSS-2025-01",
              "timestamp": "2025-01-14T09:00:00Z",
              "dateOnly": "2025-01-14",
              "title": "Ambulatory Encounter: Medical Oncology 3-Year Post-Treatment Surveillance",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-ROSS-2025-01",
              "valueDisplay": null,
              "summary": "Encounter duration: 2025-01-14 to 2025-01-14",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-ROSS-CEA-2025",
              "resourceKey": "Observation/OBS-ROSS-CEA-2025",
              "timestamp": "2025-01-14T09:15:00Z",
              "dateOnly": "2025-01-14",
              "title": "Measurement: Carcinoembryonic Antigen (CEA)",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-ROSS-2025-01",
              "valueDisplay": "1.8 ng/mL",
              "summary": "Observed value: 1.8 ng/mL",
              "details": {}
            }
          ]
        }
      ],
      "series": {
        "Carcinoembryonic Antigen (CEA)": [
          {
            "timestamp": "2025-01-14T09:15:00Z",
            "date": "2025-01-14",
            "value": 1.8,
            "unit": "ng/mL",
            "observationId": "OBS-ROSS-CEA-2025",
            "status": "final"
          }
        ]
      }
    },
    "subgraph": {
      "patientId": "PAT-ROSS-04",
      "nodes": [
        {
          "id": "DiagnosticReport/DR-ROSS-CT-SURV",
          "resourceId": "DR-ROSS-CT-SURV",
          "resourceType": "DiagnosticReport",
          "title": "Surveillance CT Chest/Abdomen/Pelvis",
          "status": "final",
          "date": "2025-01-12T11:00:00Z",
          "patientId": "PAT-ROSS-04",
          "degree": 3
        },
        {
          "id": "Observation/OBS-ROSS-CEA-2025",
          "resourceId": "OBS-ROSS-CEA-2025",
          "resourceType": "Observation",
          "title": "Carcinoembryonic Antigen (CEA)",
          "status": "final",
          "date": "2025-01-14T09:15:00Z",
          "patientId": "PAT-ROSS-04",
          "degree": 3
        },
        {
          "id": "Condition/COND-ROSS-COLON",
          "resourceId": "COND-ROSS-COLON",
          "resourceType": "Condition",
          "title": "Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)",
          "status": "active",
          "date": "2021-10-10",
          "patientId": "PAT-ROSS-04",
          "degree": 2
        },
        {
          "id": "Organization/ORG-METRO",
          "resourceId": "ORG-METRO",
          "resourceType": "Organization",
          "title": "Metropolitan Academic Health System",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 2
        },
        {
          "id": "Encounter/ENC-ROSS-2025-01",
          "resourceId": "ENC-ROSS-2025-01",
          "resourceType": "Encounter",
          "title": "Encounter ENC-ROSS-2025-01",
          "status": "finished",
          "date": "2025-01-14T09:00:00Z",
          "patientId": "PAT-ROSS-04",
          "degree": 5
        },
        {
          "id": "Patient/PAT-ROSS-04",
          "resourceId": "PAT-ROSS-04",
          "resourceType": "Patient",
          "title": "David Edward Ross",
          "status": "recorded",
          "date": "1972-02-14",
          "patientId": "PAT-ROSS-04",
          "degree": 5
        }
      ],
      "edges": [
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "DiagnosticReport/DR-ROSS-CT-SURV",
          "target": "Patient/PAT-ROSS-04"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "DiagnosticReport/DR-ROSS-CT-SURV",
          "target": "Encounter/ENC-ROSS-2025-01"
        },
        {
          "path": "result[0]",
          "label": "result",
          "isResolved": true,
          "source": "DiagnosticReport/DR-ROSS-CT-SURV",
          "target": "Observation/OBS-ROSS-CEA-2025"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-ROSS-CEA-2025",
          "target": "Patient/PAT-ROSS-04"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-ROSS-CEA-2025",
          "target": "Encounter/ENC-ROSS-2025-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-ROSS-COLON",
          "target": "Patient/PAT-ROSS-04"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-ROSS-2025-01",
          "target": "Patient/PAT-ROSS-04"
        },
        {
          "path": "diagnosis[0].condition",
          "label": "diagnosis",
          "isResolved": true,
          "source": "Encounter/ENC-ROSS-2025-01",
          "target": "Condition/COND-ROSS-COLON"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-ROSS-2025-01",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "managingOrganization",
          "label": "organization",
          "isResolved": true,
          "source": "Patient/PAT-ROSS-04",
          "target": "Organization/ORG-METRO"
        }
      ],
      "nodeCount": 6,
      "edgeCount": 10
    },
    "transferReadiness": {
      "patientId": "PAT-ROSS-04",
      "transferStatus": "TRANSFER READY",
      "isReady": true,
      "checks": [
        {
          "dimension": "Patient Demographics & Identity",
          "passed": true,
          "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
        },
        {
          "dimension": "Encounter Episode Context",
          "passed": true,
          "details": "1 Encounters verified with class & duration."
        },
        {
          "dimension": "Medication Prescriber Attribution",
          "passed": true,
          "details": "0 Medication orders verified against provider registry."
        },
        {
          "dimension": "Referential Completeness",
          "passed": true,
          "details": "0 unresolved reference(s) found in patient sub-graph."
        }
      ],
      "reasons": [
        "All essential clinical and referential transfer prerequisites satisfied."
      ],
      "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
    }
  },
  "PAT-THORNE-02": {
    "patient": {
      "resourceType": "Patient",
      "id": "PAT-THORNE-02",
      "active": true,
      "identifier": [
        {
          "use": "usual",
          "system": "http://metrohealth.example.org/mrn",
          "value": "MRN-602931"
        }
      ],
      "name": [
        {
          "use": "official",
          "family": "Thorne",
          "given": [
            "Marcus",
            "Anthony"
          ]
        }
      ],
      "gender": "male",
      "birthDate": "1966-11-28",
      "address": [
        {
          "line": [
            "15 Chestnut Hill Road"
          ],
          "city": "Newton",
          "state": "MA",
          "postalCode": "02467",
          "country": "USA"
        }
      ],
      "managingOrganization": {
        "reference": "Organization/ORG-METRO"
      }
    },
    "resourcesByType": {
      "MedicationRequest": [
        {
          "resourceType": "MedicationRequest",
          "id": "MED-THORNE-ATORVASTATIN",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "617312",
                "display": "Atorvastatin 80 MG Oral Tablet"
              }
            ],
            "text": "Atorvastatin 80 mg Oral Tablet"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-10"
          },
          "authoredOn": "2024-10-15T14:00:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-BRODY-04"
          },
          "dosageInstruction": [
            {
              "text": "Take 1 tablet by mouth daily at bedtime"
            }
          ]
        }
      ],
      "Encounter": [
        {
          "resourceType": "Encounter",
          "id": "ENC-THORNE-2024-10",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB"
          },
          "type": [
            {
              "text": "Outpatient Cardiology 6-Month Post-Surgical Follow-up"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-THORNE-02"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-BRODY-04"
              }
            }
          ],
          "period": {
            "start": "2024-10-15T13:30:00Z",
            "end": "2024-10-15T14:15:00Z"
          },
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        },
        {
          "resourceType": "Encounter",
          "id": "ENC-THORNE-2024-04",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "IMP",
            "display": "inpatient encounter"
          },
          "type": [
            {
              "text": "Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-ROSTOVA-03",
                "display": "Dr. Elena Rostova"
              }
            },
            {
              "individual": {
                "reference": "Practitioner/PRAC-BRODY-04",
                "display": "Dr. Marcus Brody"
              }
            }
          ],
          "period": {
            "start": "2024-04-03T06:00:00Z",
            "end": "2024-04-10T12:00:00Z"
          },
          "diagnosis": [
            {
              "condition": {
                "reference": "Condition/COND-THORNE-STEMI"
              }
            }
          ],
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ],
      "DiagnosticReport": [
        {
          "resourceType": "DiagnosticReport",
          "id": "DR-THORNE-ECHO",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                  "code": "MB",
                  "display": "Cardiology"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "88062-5",
                "display": "Transthoracic echocardiogram panel"
              }
            ],
            "text": "Post-Operative Transthoracic Echocardiogram"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "effectiveDateTime": "2024-04-08T10:00:00Z",
          "performer": [
            {
              "reference": "Practitioner/PRAC-BRODY-04"
            }
          ],
          "result": [
            {
              "reference": "Observation/OBS-THORNE-TROP-4"
            }
          ],
          "conclusion": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contractility. Grafts patent."
        }
      ],
      "Observation": [
        {
          "resourceType": "Observation",
          "id": "OBS-THORNE-TROP-4",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "49563-0",
                "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method"
              }
            ],
            "text": "High Sensitivity Cardiac Troponin I"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "effectiveDateTime": "2024-04-08T08:00:00Z",
          "valueQuantity": {
            "value": 0.85,
            "unit": "ng/mL",
            "system": "http://unitsofmeasure.org",
            "code": "ng/mL"
          },
          "referenceRange": [
            {
              "high": {
                "value": 0.04,
                "unit": "ng/mL"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Abnormal Elevation / Myocardial Necrosis"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-THORNE-TROP-3",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "49563-0",
                "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method"
              }
            ],
            "text": "High Sensitivity Cardiac Troponin I"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "effectiveDateTime": "2024-04-04T06:00:00Z",
          "valueQuantity": {
            "value": 8.4,
            "unit": "ng/mL",
            "system": "http://unitsofmeasure.org",
            "code": "ng/mL"
          },
          "referenceRange": [
            {
              "high": {
                "value": 0.04,
                "unit": "ng/mL"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Abnormal Elevation / Myocardial Necrosis"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-THORNE-TROP-2",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "49563-0",
                "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method"
              }
            ],
            "text": "High Sensitivity Cardiac Troponin I"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "effectiveDateTime": "2024-04-03T12:00:00Z",
          "valueQuantity": {
            "value": 18.2,
            "unit": "ng/mL",
            "system": "http://unitsofmeasure.org",
            "code": "ng/mL"
          },
          "referenceRange": [
            {
              "high": {
                "value": 0.04,
                "unit": "ng/mL"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Abnormal Elevation / Myocardial Necrosis"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-THORNE-TROP-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "49563-0",
                "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method"
              }
            ],
            "text": "High Sensitivity Cardiac Troponin I"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "effectiveDateTime": "2024-04-03T06:30:00Z",
          "valueQuantity": {
            "value": 1.45,
            "unit": "ng/mL",
            "system": "http://unitsofmeasure.org",
            "code": "ng/mL"
          },
          "referenceRange": [
            {
              "high": {
                "value": 0.04,
                "unit": "ng/mL"
              }
            }
          ],
          "interpretation": [
            {
              "text": "Abnormal Elevation / Myocardial Necrosis"
            }
          ]
        }
      ],
      "Procedure": [
        {
          "resourceType": "Procedure",
          "id": "PROC-THORNE-CABG",
          "status": "completed",
          "code": {
            "coding": [
              {
                "system": "http://www.ama-assn.org/go/cpt",
                "code": "33533",
                "display": "Coronary artery bypass, using arterial graft(s); single arterial graft"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "232717009",
                "display": "Coronary artery bypass grafting"
              }
            ],
            "text": "Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "encounter": {
            "reference": "Encounter/ENC-THORNE-2024-04"
          },
          "performedDateTime": "2024-04-04T07:30:00Z",
          "performer": [
            {
              "actor": {
                "reference": "Practitioner/PRAC-ROSTOVA-03",
                "display": "Dr. Elena Rostova"
              }
            }
          ],
          "outcome": {
            "text": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass."
          }
        }
      ],
      "Condition": [
        {
          "resourceType": "Condition",
          "id": "COND-THORNE-STEMI",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "resolved",
                "display": "Resolved"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "I21.09",
                "display": "ST elevation myocardial infarction involving anterior wall"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "401303003",
                "display": "Acute ST segment elevation myocardial infarction"
              }
            ],
            "text": "Acute Anteroseptal ST-Elevation Myocardial Infarction"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02",
            "display": "Marcus Thorne"
          },
          "onsetDateTime": "2024-04-03T05:15:00Z"
        },
        {
          "resourceType": "Condition",
          "id": "COND-THORNE-CAD",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "I25.10",
                "display": "Atherosclerotic heart disease of native coronary artery"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "53741008",
                "display": "Coronary arteriosclerosis"
              }
            ],
            "text": "Severe Triple Vessel Coronary Artery Disease"
          },
          "subject": {
            "reference": "Patient/PAT-THORNE-02"
          },
          "onsetDateTime": "2024-04-03"
        }
      ],
      "Patient": [
        {
          "resourceType": "Patient",
          "id": "PAT-THORNE-02",
          "active": true,
          "identifier": [
            {
              "use": "usual",
              "system": "http://metrohealth.example.org/mrn",
              "value": "MRN-602931"
            }
          ],
          "name": [
            {
              "use": "official",
              "family": "Thorne",
              "given": [
                "Marcus",
                "Anthony"
              ]
            }
          ],
          "gender": "male",
          "birthDate": "1966-11-28",
          "address": [
            {
              "line": [
                "15 Chestnut Hill Road"
              ],
              "city": "Newton",
              "state": "MA",
              "postalCode": "02467",
              "country": "USA"
            }
          ],
          "managingOrganization": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ]
    },
    "totalResources": 12,
    "timeline": {
      "patientId": "PAT-THORNE-02",
      "totalEvents": 12,
      "events": [
        {
          "resourceType": "Patient",
          "resourceId": "PAT-THORNE-02",
          "resourceKey": "Patient/PAT-THORNE-02",
          "timestamp": "1966-11-28T00:00:00Z",
          "dateOnly": "1966-11-28",
          "title": "Patient Birth Date",
          "category": "demographic",
          "status": "recorded",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Recorded date of birth",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-THORNE-CAD",
          "resourceKey": "Condition/COND-THORNE-CAD",
          "timestamp": "2024-04-03T00:00:00Z",
          "dateOnly": "2024-04-03",
          "title": "Condition Diagnosed: Severe Triple Vessel Coronary Artery Disease",
          "category": "condition",
          "status": "active",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Active",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-THORNE-STEMI",
          "resourceKey": "Condition/COND-THORNE-STEMI",
          "timestamp": "2024-04-03T05:15:00Z",
          "dateOnly": "2024-04-03",
          "title": "Condition Diagnosed: Acute Anteroseptal ST-Elevation Myocardial Infarction",
          "category": "condition",
          "status": "resolved",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Resolved",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-THORNE-2024-04",
          "resourceKey": "Encounter/ENC-THORNE-2024-04",
          "timestamp": "2024-04-03T06:00:00Z",
          "dateOnly": "2024-04-03",
          "title": "Inpatient encounter Encounter: Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": null,
          "summary": "Encounter duration: 2024-04-03 to 2024-04-10",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-THORNE-TROP-1",
          "resourceKey": "Observation/OBS-THORNE-TROP-1",
          "timestamp": "2024-04-03T06:30:00Z",
          "dateOnly": "2024-04-03",
          "title": "Measurement: High Sensitivity Cardiac Troponin I",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": "1.45 ng/mL",
          "summary": "Observed value: 1.45 ng/mL",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-THORNE-TROP-2",
          "resourceKey": "Observation/OBS-THORNE-TROP-2",
          "timestamp": "2024-04-03T12:00:00Z",
          "dateOnly": "2024-04-03",
          "title": "Measurement: High Sensitivity Cardiac Troponin I",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": "18.2 ng/mL",
          "summary": "Observed value: 18.2 ng/mL",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-THORNE-TROP-3",
          "resourceKey": "Observation/OBS-THORNE-TROP-3",
          "timestamp": "2024-04-04T06:00:00Z",
          "dateOnly": "2024-04-04",
          "title": "Measurement: High Sensitivity Cardiac Troponin I",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": "8.4 ng/mL",
          "summary": "Observed value: 8.4 ng/mL",
          "details": {}
        },
        {
          "resourceType": "Procedure",
          "resourceId": "PROC-THORNE-CABG",
          "resourceKey": "Procedure/PROC-THORNE-CABG",
          "timestamp": "2024-04-04T07:30:00Z",
          "dateOnly": "2024-04-04",
          "title": "Procedure: Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
          "category": "procedure",
          "status": "completed",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": null,
          "summary": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass.",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-THORNE-TROP-4",
          "resourceKey": "Observation/OBS-THORNE-TROP-4",
          "timestamp": "2024-04-08T08:00:00Z",
          "dateOnly": "2024-04-08",
          "title": "Measurement: High Sensitivity Cardiac Troponin I",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": "0.85 ng/mL",
          "summary": "Observed value: 0.85 ng/mL",
          "details": {}
        },
        {
          "resourceType": "DiagnosticReport",
          "resourceId": "DR-THORNE-ECHO",
          "resourceKey": "DiagnosticReport/DR-THORNE-ECHO",
          "timestamp": "2024-04-08T10:00:00Z",
          "dateOnly": "2024-04-08",
          "title": "Diagnostic Report: Post-Operative Transthoracic Echocardiogram",
          "category": "report",
          "status": "final",
          "encounterId": "ENC-THORNE-2024-04",
          "valueDisplay": null,
          "summary": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contra...",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-THORNE-2024-10",
          "resourceKey": "Encounter/ENC-THORNE-2024-10",
          "timestamp": "2024-10-15T13:30:00Z",
          "dateOnly": "2024-10-15",
          "title": "Ambulatory Encounter: Outpatient Cardiology 6-Month Post-Surgical Follow-up",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-THORNE-2024-10",
          "valueDisplay": null,
          "summary": "Encounter duration: 2024-10-15 to 2024-10-15",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-THORNE-ATORVASTATIN",
          "resourceKey": "MedicationRequest/MED-THORNE-ATORVASTATIN",
          "timestamp": "2024-10-15T14:00:00Z",
          "dateOnly": "2024-10-15",
          "title": "Rx Order: Atorvastatin 80 mg Oral Tablet",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-THORNE-2024-10",
          "valueDisplay": null,
          "summary": "Take 1 tablet by mouth daily at bedtime",
          "details": {}
        }
      ],
      "encounterGroups": [
        {
          "encounterId": "ENC-THORNE-2024-10",
          "title": "Outpatient Cardiology 6-Month Post-Surgical Follow-up",
          "class": "Ambulatory",
          "start": "2024-10-15T13:30:00Z",
          "end": "2024-10-15T14:15:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-THORNE-2024-10",
              "resourceKey": "Encounter/ENC-THORNE-2024-10",
              "timestamp": "2024-10-15T13:30:00Z",
              "dateOnly": "2024-10-15",
              "title": "Ambulatory Encounter: Outpatient Cardiology 6-Month Post-Surgical Follow-up",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-THORNE-2024-10",
              "valueDisplay": null,
              "summary": "Encounter duration: 2024-10-15 to 2024-10-15",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-THORNE-ATORVASTATIN",
              "resourceKey": "MedicationRequest/MED-THORNE-ATORVASTATIN",
              "timestamp": "2024-10-15T14:00:00Z",
              "dateOnly": "2024-10-15",
              "title": "Rx Order: Atorvastatin 80 mg Oral Tablet",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-THORNE-2024-10",
              "valueDisplay": null,
              "summary": "Take 1 tablet by mouth daily at bedtime",
              "details": {}
            }
          ]
        },
        {
          "encounterId": "ENC-THORNE-2024-04",
          "title": "Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
          "class": "inpatient encounter",
          "start": "2024-04-03T06:00:00Z",
          "end": "2024-04-10T12:00:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-THORNE-2024-04",
              "resourceKey": "Encounter/ENC-THORNE-2024-04",
              "timestamp": "2024-04-03T06:00:00Z",
              "dateOnly": "2024-04-03",
              "title": "Inpatient encounter Encounter: Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": null,
              "summary": "Encounter duration: 2024-04-03 to 2024-04-10",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-THORNE-TROP-1",
              "resourceKey": "Observation/OBS-THORNE-TROP-1",
              "timestamp": "2024-04-03T06:30:00Z",
              "dateOnly": "2024-04-03",
              "title": "Measurement: High Sensitivity Cardiac Troponin I",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": "1.45 ng/mL",
              "summary": "Observed value: 1.45 ng/mL",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-THORNE-TROP-2",
              "resourceKey": "Observation/OBS-THORNE-TROP-2",
              "timestamp": "2024-04-03T12:00:00Z",
              "dateOnly": "2024-04-03",
              "title": "Measurement: High Sensitivity Cardiac Troponin I",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": "18.2 ng/mL",
              "summary": "Observed value: 18.2 ng/mL",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-THORNE-TROP-3",
              "resourceKey": "Observation/OBS-THORNE-TROP-3",
              "timestamp": "2024-04-04T06:00:00Z",
              "dateOnly": "2024-04-04",
              "title": "Measurement: High Sensitivity Cardiac Troponin I",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": "8.4 ng/mL",
              "summary": "Observed value: 8.4 ng/mL",
              "details": {}
            },
            {
              "resourceType": "Procedure",
              "resourceId": "PROC-THORNE-CABG",
              "resourceKey": "Procedure/PROC-THORNE-CABG",
              "timestamp": "2024-04-04T07:30:00Z",
              "dateOnly": "2024-04-04",
              "title": "Procedure: Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
              "category": "procedure",
              "status": "completed",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": null,
              "summary": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass.",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-THORNE-TROP-4",
              "resourceKey": "Observation/OBS-THORNE-TROP-4",
              "timestamp": "2024-04-08T08:00:00Z",
              "dateOnly": "2024-04-08",
              "title": "Measurement: High Sensitivity Cardiac Troponin I",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": "0.85 ng/mL",
              "summary": "Observed value: 0.85 ng/mL",
              "details": {}
            },
            {
              "resourceType": "DiagnosticReport",
              "resourceId": "DR-THORNE-ECHO",
              "resourceKey": "DiagnosticReport/DR-THORNE-ECHO",
              "timestamp": "2024-04-08T10:00:00Z",
              "dateOnly": "2024-04-08",
              "title": "Diagnostic Report: Post-Operative Transthoracic Echocardiogram",
              "category": "report",
              "status": "final",
              "encounterId": "ENC-THORNE-2024-04",
              "valueDisplay": null,
              "summary": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contra...",
              "details": {}
            }
          ]
        }
      ],
      "series": {
        "High Sensitivity Cardiac Troponin I": [
          {
            "timestamp": "2024-04-03T06:30:00Z",
            "date": "2024-04-03",
            "value": 1.45,
            "unit": "ng/mL",
            "observationId": "OBS-THORNE-TROP-1",
            "status": "final"
          },
          {
            "timestamp": "2024-04-03T12:00:00Z",
            "date": "2024-04-03",
            "value": 18.2,
            "unit": "ng/mL",
            "observationId": "OBS-THORNE-TROP-2",
            "status": "final"
          },
          {
            "timestamp": "2024-04-04T06:00:00Z",
            "date": "2024-04-04",
            "value": 8.4,
            "unit": "ng/mL",
            "observationId": "OBS-THORNE-TROP-3",
            "status": "final"
          },
          {
            "timestamp": "2024-04-08T08:00:00Z",
            "date": "2024-04-08",
            "value": 0.85,
            "unit": "ng/mL",
            "observationId": "OBS-THORNE-TROP-4",
            "status": "final"
          }
        ]
      }
    },
    "subgraph": {
      "patientId": "PAT-THORNE-02",
      "nodes": [
        {
          "id": "Observation/OBS-THORNE-TROP-2",
          "resourceId": "OBS-THORNE-TROP-2",
          "resourceType": "Observation",
          "title": "High Sensitivity Cardiac Troponin I",
          "status": "final",
          "date": "2024-04-03T12:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 2
        },
        {
          "id": "DiagnosticReport/DR-THORNE-ECHO",
          "resourceId": "DR-THORNE-ECHO",
          "resourceType": "DiagnosticReport",
          "title": "Post-Operative Transthoracic Echocardiogram",
          "status": "final",
          "date": "2024-04-08T10:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 4
        },
        {
          "id": "Encounter/ENC-THORNE-2024-10",
          "resourceId": "ENC-THORNE-2024-10",
          "resourceType": "Encounter",
          "title": "Encounter ENC-THORNE-2024-10",
          "status": "finished",
          "date": "2024-10-15T13:30:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 4
        },
        {
          "id": "Observation/OBS-THORNE-TROP-1",
          "resourceId": "OBS-THORNE-TROP-1",
          "resourceType": "Observation",
          "title": "High Sensitivity Cardiac Troponin I",
          "status": "final",
          "date": "2024-04-03T06:30:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 2
        },
        {
          "id": "Condition/COND-THORNE-CAD",
          "resourceId": "COND-THORNE-CAD",
          "resourceType": "Condition",
          "title": "Severe Triple Vessel Coronary Artery Disease",
          "status": "active",
          "date": "2024-04-03",
          "patientId": "PAT-THORNE-02",
          "degree": 1
        },
        {
          "id": "Patient/PAT-THORNE-02",
          "resourceId": "PAT-THORNE-02",
          "resourceType": "Patient",
          "title": "Marcus Anthony Thorne",
          "status": "recorded",
          "date": "1966-11-28",
          "patientId": "PAT-THORNE-02",
          "degree": 12
        },
        {
          "id": "Encounter/ENC-THORNE-2024-04",
          "resourceId": "ENC-THORNE-2024-04",
          "resourceType": "Encounter",
          "title": "Encounter ENC-THORNE-2024-04",
          "status": "finished",
          "date": "2024-04-03T06:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 11
        },
        {
          "id": "Procedure/PROC-THORNE-CABG",
          "resourceId": "PROC-THORNE-CABG",
          "resourceType": "Procedure",
          "title": "Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
          "status": "completed",
          "date": "2024-04-04T07:30:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 3
        },
        {
          "id": "Observation/OBS-THORNE-TROP-4",
          "resourceId": "OBS-THORNE-TROP-4",
          "resourceType": "Observation",
          "title": "High Sensitivity Cardiac Troponin I",
          "status": "final",
          "date": "2024-04-08T08:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 3
        },
        {
          "id": "MedicationRequest/MED-THORNE-ATORVASTATIN",
          "resourceId": "MED-THORNE-ATORVASTATIN",
          "resourceType": "MedicationRequest",
          "title": "Atorvastatin 80 mg Oral Tablet",
          "status": "active",
          "date": "2024-10-15T14:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 3
        },
        {
          "id": "Condition/COND-THORNE-STEMI",
          "resourceId": "COND-THORNE-STEMI",
          "resourceType": "Condition",
          "title": "Acute Anteroseptal ST-Elevation Myocardial Infarction",
          "status": "active",
          "date": "2024-04-03T05:15:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 2
        },
        {
          "id": "Observation/OBS-THORNE-TROP-3",
          "resourceId": "OBS-THORNE-TROP-3",
          "resourceType": "Observation",
          "title": "High Sensitivity Cardiac Troponin I",
          "status": "final",
          "date": "2024-04-04T06:00:00Z",
          "patientId": "PAT-THORNE-02",
          "degree": 2
        },
        {
          "id": "Organization/ORG-METRO",
          "resourceId": "ORG-METRO",
          "resourceType": "Organization",
          "title": "Metropolitan Academic Health System",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 3
        },
        {
          "id": "Practitioner/PRAC-BRODY-04",
          "resourceId": "PRAC-BRODY-04",
          "resourceType": "Practitioner",
          "title": "Dr. Marcus Brody",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 4
        },
        {
          "id": "Practitioner/PRAC-ROSTOVA-03",
          "resourceId": "PRAC-ROSTOVA-03",
          "resourceType": "Practitioner",
          "title": "Dr. Elena Rostova",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 2
        }
      ],
      "edges": [
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-2",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-2",
          "target": "Encounter/ENC-THORNE-2024-04"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "DiagnosticReport/DR-THORNE-ECHO",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "DiagnosticReport/DR-THORNE-ECHO",
          "target": "Encounter/ENC-THORNE-2024-04"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "DiagnosticReport/DR-THORNE-ECHO",
          "target": "Practitioner/PRAC-BRODY-04"
        },
        {
          "path": "result[0]",
          "label": "result",
          "isResolved": true,
          "source": "DiagnosticReport/DR-THORNE-ECHO",
          "target": "Observation/OBS-THORNE-TROP-4"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-10",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-10",
          "target": "Practitioner/PRAC-BRODY-04"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-10",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-1",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-1",
          "target": "Encounter/ENC-THORNE-2024-04"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-THORNE-CAD",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "managingOrganization",
          "label": "organization",
          "isResolved": true,
          "source": "Patient/PAT-THORNE-02",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-04",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-04",
          "target": "Practitioner/PRAC-ROSTOVA-03"
        },
        {
          "path": "participant[1].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-04",
          "target": "Practitioner/PRAC-BRODY-04"
        },
        {
          "path": "diagnosis[0].condition",
          "label": "diagnosis",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-04",
          "target": "Condition/COND-THORNE-STEMI"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-THORNE-2024-04",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Procedure/PROC-THORNE-CABG",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Procedure/PROC-THORNE-CABG",
          "target": "Encounter/ENC-THORNE-2024-04"
        },
        {
          "path": "performer[0].actor",
          "label": "performer",
          "isResolved": true,
          "source": "Procedure/PROC-THORNE-CABG",
          "target": "Practitioner/PRAC-ROSTOVA-03"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-4",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-4",
          "target": "Encounter/ENC-THORNE-2024-04"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
          "target": "Encounter/ENC-THORNE-2024-10"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": true,
          "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
          "target": "Practitioner/PRAC-BRODY-04"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-THORNE-STEMI",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-3",
          "target": "Patient/PAT-THORNE-02"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-THORNE-TROP-3",
          "target": "Encounter/ENC-THORNE-2024-04"
        }
      ],
      "nodeCount": 15,
      "edgeCount": 29
    },
    "transferReadiness": {
      "patientId": "PAT-THORNE-02",
      "transferStatus": "TRANSFER READY",
      "isReady": true,
      "checks": [
        {
          "dimension": "Patient Demographics & Identity",
          "passed": true,
          "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
        },
        {
          "dimension": "Encounter Episode Context",
          "passed": true,
          "details": "2 Encounters verified with class & duration."
        },
        {
          "dimension": "Medication Prescriber Attribution",
          "passed": true,
          "details": "1 Medication orders verified against provider registry."
        },
        {
          "dimension": "Referential Completeness",
          "passed": true,
          "details": "0 unresolved reference(s) found in patient sub-graph."
        }
      ],
      "reasons": [
        "All essential clinical and referential transfer prerequisites satisfied."
      ],
      "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
    }
  },
  "PAT-VANCE-01": {
    "patient": {
      "resourceType": "Patient",
      "id": "PAT-VANCE-01",
      "active": true,
      "identifier": [
        {
          "use": "usual",
          "type": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                "code": "MR"
              }
            ],
            "text": "Medical Record Number"
          },
          "system": "http://metrohealth.example.org/mrn",
          "value": "MRN-849201"
        }
      ],
      "name": [
        {
          "use": "official",
          "prefix": [
            "Ms."
          ],
          "family": "Vance",
          "given": [
            "Eleanor",
            "Rose"
          ]
        }
      ],
      "telecom": [
        {
          "system": "phone",
          "value": "+1-617-555-0142",
          "use": "home"
        },
        {
          "system": "email",
          "value": "e.vance@example.org",
          "use": "home"
        }
      ],
      "gender": "female",
      "birthDate": "1958-04-12",
      "address": [
        {
          "use": "home",
          "line": [
            "42 Beacon Street",
            "Apt 3B"
          ],
          "city": "Boston",
          "state": "MA",
          "postalCode": "02108",
          "country": "USA"
        }
      ],
      "generalPractitioner": [
        {
          "reference": "Practitioner/PRAC-JENKINS-01",
          "display": "Dr. Sarah Jenkins"
        }
      ],
      "managingOrganization": {
        "reference": "Organization/ORG-METRO",
        "display": "Metropolitan Academic Health System"
      }
    },
    "resourcesByType": {
      "Observation": [
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-5",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2025-05"
          },
          "effectiveDateTime": "2025-05-10T10:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 7.0,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "N"
                }
              ],
              "text": "Normal"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-EGFR-4",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "33914-3",
                "display": "Glomerular filtration rate/1.73 sq M.predicted"
              }
            ],
            "text": "Glomerular filtration rate/1.73 sq M.predicted"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2025-05"
          },
          "effectiveDateTime": "2025-05-10T10:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 57.0,
            "unit": "mL/min/1.73m2",
            "system": "http://unitsofmeasure.org",
            "code": "mL/min/1.73m2"
          },
          "referenceRange": [
            {
              "low": {
                "value": 60.0,
                "unit": "mL/min/1.73m2"
              },
              "high": {
                "value": 120.0,
                "unit": "mL/min/1.73m2"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "Low"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-BP-4",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "vital-signs"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "85354-9",
                "display": "Systolic Blood Pressure"
              }
            ],
            "text": "Systolic Blood Pressure"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2025-05"
          },
          "effectiveDateTime": "2025-05-10T10:05:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 126.0,
            "unit": "mmHg",
            "system": "http://unitsofmeasure.org",
            "code": "mmHg"
          },
          "referenceRange": [
            {
              "low": {
                "value": 90.0,
                "unit": "mmHg"
              },
              "high": {
                "value": 120.0,
                "unit": "mmHg"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "N"
                }
              ],
              "text": "Normal"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-4",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "effectiveDateTime": "2024-08-22T11:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 7.6,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-ALB-CREAT",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "14959-1",
                "display": "Microalbumin/Creatinine in Urine"
              }
            ],
            "text": "Microalbumin/Creatinine in Urine"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "effectiveDateTime": "2024-08-22T11:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 185.0,
            "unit": "mg/g",
            "system": "http://unitsofmeasure.org",
            "code": "mg/g"
          },
          "referenceRange": [
            {
              "low": {
                "value": 0.0,
                "unit": "mg/g"
              },
              "high": {
                "value": 30.0,
                "unit": "mg/g"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-EGFR-3",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "33914-3",
                "display": "Glomerular filtration rate/1.73 sq M.predicted"
              }
            ],
            "text": "Glomerular filtration rate/1.73 sq M.predicted"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "effectiveDateTime": "2024-08-22T11:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 54.0,
            "unit": "mL/min/1.73m2",
            "system": "http://unitsofmeasure.org",
            "code": "mL/min/1.73m2"
          },
          "referenceRange": [
            {
              "low": {
                "value": 60.0,
                "unit": "mL/min/1.73m2"
              },
              "high": {
                "value": 120.0,
                "unit": "mL/min/1.73m2"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "Low"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-3",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-02"
          },
          "effectiveDateTime": "2024-02-11T20:30:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 8.8,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-GLUC-EMER",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "2345-7",
                "display": "Glucose [Mass/volume] in Serum or Plasma"
              }
            ],
            "text": "Glucose [Mass/volume] in Serum or Plasma"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-02"
          },
          "effectiveDateTime": "2024-02-11T20:30:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 342.0,
            "unit": "mg/dL",
            "system": "http://unitsofmeasure.org",
            "code": "mg/dL"
          },
          "referenceRange": [
            {
              "low": {
                "value": 70.0,
                "unit": "mg/dL"
              },
              "high": {
                "value": 99.0,
                "unit": "mg/dL"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "Critical High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-BP-3",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "vital-signs"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "85354-9",
                "display": "Systolic Blood Pressure"
              }
            ],
            "text": "Systolic Blood Pressure"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-02"
          },
          "effectiveDateTime": "2024-02-11T20:20:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 154.0,
            "unit": "mmHg",
            "system": "http://unitsofmeasure.org",
            "code": "mmHg"
          },
          "referenceRange": [
            {
              "low": {
                "value": 90.0,
                "unit": "mmHg"
              },
              "high": {
                "value": 120.0,
                "unit": "mmHg"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-2",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-09"
          },
          "effectiveDateTime": "2023-09-18T14:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 8.3,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-EGFR-2",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "33914-3",
                "display": "Glomerular filtration rate/1.73 sq M.predicted"
              }
            ],
            "text": "Glomerular filtration rate/1.73 sq M.predicted"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-09"
          },
          "effectiveDateTime": "2023-09-18T14:15:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 56.0,
            "unit": "mL/min/1.73m2",
            "system": "http://unitsofmeasure.org",
            "code": "mL/min/1.73m2"
          },
          "referenceRange": [
            {
              "low": {
                "value": 60.0,
                "unit": "mL/min/1.73m2"
              },
              "high": {
                "value": 120.0,
                "unit": "mL/min/1.73m2"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "Low"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-BP-2",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "vital-signs"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "85354-9",
                "display": "Systolic Blood Pressure"
              }
            ],
            "text": "Systolic Blood Pressure"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-09"
          },
          "effectiveDateTime": "2023-09-18T14:05:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 138.0,
            "unit": "mmHg",
            "system": "http://unitsofmeasure.org",
            "code": "mmHg"
          },
          "referenceRange": [
            {
              "low": {
                "value": 90.0,
                "unit": "mmHg"
              },
              "high": {
                "value": 120.0,
                "unit": "mmHg"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "effectiveDateTime": "2023-03-14T09:45:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 9.4,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-CREAT-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "2160-0",
                "display": "Creatinine [Mass/volume] in Serum or Plasma"
              }
            ],
            "text": "Creatinine [Mass/volume] in Serum or Plasma"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "effectiveDateTime": "2023-03-14T09:45:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 1.32,
            "unit": "mg/dL",
            "system": "http://unitsofmeasure.org",
            "code": "mg/dL"
          },
          "referenceRange": [
            {
              "low": {
                "value": 0.5,
                "unit": "mg/dL"
              },
              "high": {
                "value": 1.1,
                "unit": "mg/dL"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-EGFR-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "33914-3",
                "display": "Glomerular filtration rate/1.73 sq M.predicted"
              }
            ],
            "text": "Glomerular filtration rate/1.73 sq M.predicted"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "effectiveDateTime": "2023-03-14T09:45:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 58.0,
            "unit": "mL/min/1.73m2",
            "system": "http://unitsofmeasure.org",
            "code": "mL/min/1.73m2"
          },
          "referenceRange": [
            {
              "low": {
                "value": 60.0,
                "unit": "mL/min/1.73m2"
              },
              "high": {
                "value": 120.0,
                "unit": "mL/min/1.73m2"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "Low"
            }
          ]
        },
        {
          "resourceType": "Observation",
          "id": "OBS-VANCE-BP-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "vital-signs"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "85354-9",
                "display": "Systolic Blood Pressure"
              }
            ],
            "text": "Systolic Blood Pressure"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "effectiveDateTime": "2023-03-14T09:35:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 148.0,
            "unit": "mmHg",
            "system": "http://unitsofmeasure.org",
            "code": "mmHg"
          },
          "referenceRange": [
            {
              "low": {
                "value": 90.0,
                "unit": "mmHg"
              },
              "high": {
                "value": 120.0,
                "unit": "mmHg"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        }
      ],
      "Encounter": [
        {
          "resourceType": "Encounter",
          "id": "ENC-VANCE-2025-05",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
          },
          "type": [
            {
              "text": "Annual Longitudinal Care Plan Review"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-JENKINS-01"
              }
            }
          ],
          "period": {
            "start": "2025-05-10T10:00:00Z",
            "end": "2025-05-10T10:45:00Z"
          },
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        },
        {
          "resourceType": "Encounter",
          "id": "ENC-VANCE-2024-08",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
          },
          "type": [
            {
              "text": "Nephrology Consultation & Renal Staging"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-CHEN-02",
                "display": "Dr. Robert Chen"
              }
            }
          ],
          "period": {
            "start": "2024-08-22T11:00:00Z",
            "end": "2024-08-22T11:50:00Z"
          },
          "diagnosis": [
            {
              "condition": {
                "reference": "Condition/COND-VANCE-CKD"
              }
            }
          ],
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        },
        {
          "resourceType": "Encounter",
          "id": "ENC-VANCE-2024-02",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "EMER",
            "display": "emergency"
          },
          "type": [
            {
              "coding": [
                {
                  "system": "http://snomed.info/sct",
                  "code": "4525004",
                  "display": "Emergency department visit"
                }
              ],
              "text": "Emergency Department Acute Hyperglycemia Evaluation"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "period": {
            "start": "2024-02-11T20:15:00Z",
            "end": "2024-02-12T04:30:00Z"
          },
          "reasonCode": [
            {
              "text": "Severe symptomatic hyperglycemia with nausea and dehydration"
            }
          ],
          "diagnosis": [
            {
              "condition": {
                "reference": "Condition/COND-VANCE-T2D"
              }
            }
          ],
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        },
        {
          "resourceType": "Encounter",
          "id": "ENC-VANCE-2023-09",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
          },
          "type": [
            {
              "text": "Endocrinology 6-Month Treatment Assessment"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-JENKINS-01"
              }
            }
          ],
          "period": {
            "start": "2023-09-18T14:00:00Z",
            "end": "2023-09-18T14:40:00Z"
          },
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        },
        {
          "resourceType": "Encounter",
          "id": "ENC-VANCE-2023-03",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
          },
          "type": [
            {
              "coding": [
                {
                  "system": "http://snomed.info/sct",
                  "code": "308335008",
                  "display": "Patient encounter with doctor"
                }
              ],
              "text": "Endocrinology Comprehensive Initial Review"
            }
          ],
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "participant": [
            {
              "individual": {
                "reference": "Practitioner/PRAC-JENKINS-01",
                "display": "Dr. Sarah Jenkins"
              }
            }
          ],
          "period": {
            "start": "2023-03-14T09:30:00Z",
            "end": "2023-03-14T10:45:00Z"
          },
          "reasonCode": [
            {
              "text": "Elevated uncontrolled fasting glucose and microalbuminuria"
            }
          ],
          "diagnosis": [
            {
              "condition": {
                "reference": "Condition/COND-VANCE-T2D"
              }
            }
          ],
          "serviceProvider": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ],
      "Procedure": [
        {
          "resourceType": "Procedure",
          "id": "PROC-VANCE-EYE-EXAM",
          "status": "completed",
          "code": {
            "coding": [
              {
                "system": "http://snomed.info/sct",
                "code": "171231001",
                "display": "Diabetic eye examination"
              }
            ],
            "text": "Comprehensive Dilated Diabetic Eye Examination"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "performedDateTime": "2024-08-25T13:30:00Z",
          "performer": [
            {
              "actor": {
                "reference": "Practitioner/PRAC-JENKINS-01"
              }
            }
          ],
          "outcome": {
            "text": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema."
          }
        }
      ],
      "DiagnosticReport": [
        {
          "resourceType": "DiagnosticReport",
          "id": "DR-VANCE-RENAL-US",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                  "code": "RAD",
                  "display": "Radiology"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "24748-6",
                "display": "Ultrasonography of kidney"
              }
            ],
            "text": "Renal Ultrasound Bilateral"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "effectiveDateTime": "2024-08-23T09:00:00Z",
          "issued": "2024-08-23T14:30:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-METRO"
            }
          ],
          "result": [
            {
              "reference": "Observation/OBS-VANCE-EGFR-3"
            },
            {
              "reference": "Observation/OBS-VANCE-ALB-CREAT"
            }
          ],
          "conclusion": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronephrosis or discrete calculi."
        }
      ],
      "MedicationRequest": [
        {
          "resourceType": "MedicationRequest",
          "id": "MED-VANCE-EMPAGLIFLOZIN",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "1545653",
                "display": "Empagliflozin 25 MG Oral Tablet"
              }
            ],
            "text": "Jardiance (Empagliflozin) 25 mg Oral Tablet"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2024-08"
          },
          "authoredOn": "2024-08-22T11:45:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-CHEN-02"
          },
          "reasonReference": [
            {
              "reference": "Condition/COND-VANCE-CKD"
            }
          ],
          "dosageInstruction": [
            {
              "text": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
              "doseAndRate": [
                {
                  "doseQuantity": {
                    "value": 25,
                    "unit": "mg"
                  }
                }
              ]
            }
          ]
        },
        {
          "resourceType": "MedicationRequest",
          "id": "MED-VANCE-LISINOPRIL",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "314076",
                "display": "Lisinopril 20 MG Oral Tablet"
              }
            ],
            "text": "Lisinopril 20 mg Oral Tablet"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "authoredOn": "2023-03-14T10:35:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-JENKINS-01"
          },
          "reasonReference": [
            {
              "reference": "Condition/COND-VANCE-HTN"
            },
            {
              "reference": "Condition/COND-VANCE-CKD"
            }
          ],
          "dosageInstruction": [
            {
              "text": "Take 1 tablet by mouth daily in the morning",
              "doseAndRate": [
                {
                  "doseQuantity": {
                    "value": 20,
                    "unit": "mg"
                  }
                }
              ]
            }
          ]
        },
        {
          "resourceType": "MedicationRequest",
          "id": "MED-VANCE-METFORMIN",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "860975",
                "display": "Metformin hydrochloride 1000 MG Extended Release Oral Tablet"
              }
            ],
            "text": "Metformin ER 1000 mg Oral Tablet"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "authoredOn": "2023-03-14T10:30:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-JENKINS-01"
          },
          "reasonReference": [
            {
              "reference": "Condition/COND-VANCE-T2D"
            }
          ],
          "dosageInstruction": [
            {
              "text": "Take 1 tablet by mouth twice daily with meals",
              "doseAndRate": [
                {
                  "doseQuantity": {
                    "value": 1000,
                    "unit": "mg"
                  }
                }
              ]
            }
          ]
        }
      ],
      "Condition": [
        {
          "resourceType": "Condition",
          "id": "COND-VANCE-CKD",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "N18.31",
                "display": "Chronic kidney disease, stage 3a"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "709044004",
                "display": "Chronic kidney disease stage 3"
              }
            ],
            "text": "Diabetic Chronic Kidney Disease, Stage 3a"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "onsetDateTime": "2023-01-20"
        },
        {
          "resourceType": "Condition",
          "id": "COND-VANCE-HTN",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "I10",
                "display": "Essential (primary) hypertension"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "38341003",
                "display": "Hypertension"
              }
            ],
            "text": "Essential Hypertension"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "onsetDateTime": "2019-03-10"
        },
        {
          "resourceType": "Condition",
          "id": "COND-VANCE-T2D",
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
              }
            ]
          },
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                  "code": "problem-list-item",
                  "display": "Problem List Item"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/sid/icd-10-cm",
                "code": "E11.9",
                "display": "Type 2 diabetes mellitus without complications"
              },
              {
                "system": "http://snomed.info/sct",
                "code": "44054006",
                "display": "Type 2 diabetes mellitus"
              }
            ],
            "text": "Type 2 Diabetes Mellitus"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "onsetDateTime": "2018-09-15"
        }
      ],
      "Patient": [
        {
          "resourceType": "Patient",
          "id": "PAT-VANCE-01",
          "active": true,
          "identifier": [
            {
              "use": "usual",
              "type": {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                    "code": "MR"
                  }
                ],
                "text": "Medical Record Number"
              },
              "system": "http://metrohealth.example.org/mrn",
              "value": "MRN-849201"
            }
          ],
          "name": [
            {
              "use": "official",
              "prefix": [
                "Ms."
              ],
              "family": "Vance",
              "given": [
                "Eleanor",
                "Rose"
              ]
            }
          ],
          "telecom": [
            {
              "system": "phone",
              "value": "+1-617-555-0142",
              "use": "home"
            },
            {
              "system": "email",
              "value": "e.vance@example.org",
              "use": "home"
            }
          ],
          "gender": "female",
          "birthDate": "1958-04-12",
          "address": [
            {
              "use": "home",
              "line": [
                "42 Beacon Street",
                "Apt 3B"
              ],
              "city": "Boston",
              "state": "MA",
              "postalCode": "02108",
              "country": "USA"
            }
          ],
          "generalPractitioner": [
            {
              "reference": "Practitioner/PRAC-JENKINS-01",
              "display": "Dr. Sarah Jenkins"
            }
          ],
          "managingOrganization": {
            "reference": "Organization/ORG-METRO",
            "display": "Metropolitan Academic Health System"
          }
        }
      ]
    },
    "totalResources": 30,
    "timeline": {
      "patientId": "PAT-VANCE-01",
      "totalEvents": 30,
      "events": [
        {
          "resourceType": "Patient",
          "resourceId": "PAT-VANCE-01",
          "resourceKey": "Patient/PAT-VANCE-01",
          "timestamp": "1958-04-12T00:00:00Z",
          "dateOnly": "1958-04-12",
          "title": "Patient Birth Date",
          "category": "demographic",
          "status": "recorded",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Recorded date of birth",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-VANCE-T2D",
          "resourceKey": "Condition/COND-VANCE-T2D",
          "timestamp": "2018-09-15T00:00:00Z",
          "dateOnly": "2018-09-15",
          "title": "Condition Diagnosed: Type 2 Diabetes Mellitus",
          "category": "condition",
          "status": "active",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Active",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-VANCE-HTN",
          "resourceKey": "Condition/COND-VANCE-HTN",
          "timestamp": "2019-03-10T00:00:00Z",
          "dateOnly": "2019-03-10",
          "title": "Condition Diagnosed: Essential Hypertension",
          "category": "condition",
          "status": "active",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Active",
          "details": {}
        },
        {
          "resourceType": "Condition",
          "resourceId": "COND-VANCE-CKD",
          "resourceKey": "Condition/COND-VANCE-CKD",
          "timestamp": "2023-01-20T00:00:00Z",
          "dateOnly": "2023-01-20",
          "title": "Condition Diagnosed: Diabetic Chronic Kidney Disease, Stage 3a",
          "category": "condition",
          "status": "active",
          "encounterId": null,
          "valueDisplay": null,
          "summary": "Clinical Status: Active",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-VANCE-2023-03",
          "resourceKey": "Encounter/ENC-VANCE-2023-03",
          "timestamp": "2023-03-14T09:30:00Z",
          "dateOnly": "2023-03-14",
          "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": null,
          "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-BP-1",
          "resourceKey": "Observation/OBS-VANCE-BP-1",
          "timestamp": "2023-03-14T09:35:00Z",
          "dateOnly": "2023-03-14",
          "title": "Measurement: Systolic Blood Pressure",
          "category": "vital-signs",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": "148.0 mmHg",
          "summary": "Observed value: 148.0 mmHg",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-A1C-1",
          "resourceKey": "Observation/OBS-VANCE-A1C-1",
          "timestamp": "2023-03-14T09:45:00Z",
          "dateOnly": "2023-03-14",
          "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": "9.4 %",
          "summary": "Observed value: 9.4 %",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-EGFR-1",
          "resourceKey": "Observation/OBS-VANCE-EGFR-1",
          "timestamp": "2023-03-14T09:45:00Z",
          "dateOnly": "2023-03-14",
          "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": "58.0 mL/min/1.73m2",
          "summary": "Observed value: 58.0 mL/min/1.73m2",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-CREAT-1",
          "resourceKey": "Observation/OBS-VANCE-CREAT-1",
          "timestamp": "2023-03-14T09:45:00Z",
          "dateOnly": "2023-03-14",
          "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": "1.32 mg/dL",
          "summary": "Observed value: 1.32 mg/dL",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-VANCE-METFORMIN",
          "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
          "timestamp": "2023-03-14T10:30:00Z",
          "dateOnly": "2023-03-14",
          "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": null,
          "summary": "Take 1 tablet by mouth twice daily with meals",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-VANCE-LISINOPRIL",
          "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "timestamp": "2023-03-14T10:35:00Z",
          "dateOnly": "2023-03-14",
          "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-VANCE-2023-03",
          "valueDisplay": null,
          "summary": "Take 1 tablet by mouth daily in the morning",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-VANCE-2023-09",
          "resourceKey": "Encounter/ENC-VANCE-2023-09",
          "timestamp": "2023-09-18T14:00:00Z",
          "dateOnly": "2023-09-18",
          "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-VANCE-2023-09",
          "valueDisplay": null,
          "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-BP-2",
          "resourceKey": "Observation/OBS-VANCE-BP-2",
          "timestamp": "2023-09-18T14:05:00Z",
          "dateOnly": "2023-09-18",
          "title": "Measurement: Systolic Blood Pressure",
          "category": "vital-signs",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-09",
          "valueDisplay": "138.0 mmHg",
          "summary": "Observed value: 138.0 mmHg",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-A1C-2",
          "resourceKey": "Observation/OBS-VANCE-A1C-2",
          "timestamp": "2023-09-18T14:15:00Z",
          "dateOnly": "2023-09-18",
          "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-09",
          "valueDisplay": "8.3 %",
          "summary": "Observed value: 8.3 %",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-EGFR-2",
          "resourceKey": "Observation/OBS-VANCE-EGFR-2",
          "timestamp": "2023-09-18T14:15:00Z",
          "dateOnly": "2023-09-18",
          "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2023-09",
          "valueDisplay": "56.0 mL/min/1.73m2",
          "summary": "Observed value: 56.0 mL/min/1.73m2",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-VANCE-2024-02",
          "resourceKey": "Encounter/ENC-VANCE-2024-02",
          "timestamp": "2024-02-11T20:15:00Z",
          "dateOnly": "2024-02-11",
          "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-VANCE-2024-02",
          "valueDisplay": null,
          "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-BP-3",
          "resourceKey": "Observation/OBS-VANCE-BP-3",
          "timestamp": "2024-02-11T20:20:00Z",
          "dateOnly": "2024-02-11",
          "title": "Measurement: Systolic Blood Pressure",
          "category": "vital-signs",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-02",
          "valueDisplay": "154.0 mmHg",
          "summary": "Observed value: 154.0 mmHg",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-GLUC-EMER",
          "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
          "timestamp": "2024-02-11T20:30:00Z",
          "dateOnly": "2024-02-11",
          "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-02",
          "valueDisplay": "342.0 mg/dL",
          "summary": "Observed value: 342.0 mg/dL",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-A1C-3",
          "resourceKey": "Observation/OBS-VANCE-A1C-3",
          "timestamp": "2024-02-11T20:30:00Z",
          "dateOnly": "2024-02-11",
          "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-02",
          "valueDisplay": "8.8 %",
          "summary": "Observed value: 8.8 %",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-VANCE-2024-08",
          "resourceKey": "Encounter/ENC-VANCE-2024-08",
          "timestamp": "2024-08-22T11:00:00Z",
          "dateOnly": "2024-08-22",
          "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": null,
          "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-EGFR-3",
          "resourceKey": "Observation/OBS-VANCE-EGFR-3",
          "timestamp": "2024-08-22T11:15:00Z",
          "dateOnly": "2024-08-22",
          "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": "54.0 mL/min/1.73m2",
          "summary": "Observed value: 54.0 mL/min/1.73m2",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-ALB-CREAT",
          "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
          "timestamp": "2024-08-22T11:15:00Z",
          "dateOnly": "2024-08-22",
          "title": "Measurement: Microalbumin/Creatinine in Urine",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": "185.0 mg/g",
          "summary": "Observed value: 185.0 mg/g",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-A1C-4",
          "resourceKey": "Observation/OBS-VANCE-A1C-4",
          "timestamp": "2024-08-22T11:15:00Z",
          "dateOnly": "2024-08-22",
          "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": "7.6 %",
          "summary": "Observed value: 7.6 %",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
          "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "timestamp": "2024-08-22T11:45:00Z",
          "dateOnly": "2024-08-22",
          "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": null,
          "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
          "details": {}
        },
        {
          "resourceType": "DiagnosticReport",
          "resourceId": "DR-VANCE-RENAL-US",
          "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
          "timestamp": "2024-08-23T09:00:00Z",
          "dateOnly": "2024-08-23",
          "title": "Diagnostic Report: Renal Ultrasound Bilateral",
          "category": "report",
          "status": "final",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": null,
          "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
          "details": {}
        },
        {
          "resourceType": "Procedure",
          "resourceId": "PROC-VANCE-EYE-EXAM",
          "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
          "timestamp": "2024-08-25T13:30:00Z",
          "dateOnly": "2024-08-25",
          "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
          "category": "procedure",
          "status": "completed",
          "encounterId": "ENC-VANCE-2024-08",
          "valueDisplay": null,
          "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-VANCE-2025-05",
          "resourceKey": "Encounter/ENC-VANCE-2025-05",
          "timestamp": "2025-05-10T10:00:00Z",
          "dateOnly": "2025-05-10",
          "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-VANCE-2025-05",
          "valueDisplay": null,
          "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-BP-4",
          "resourceKey": "Observation/OBS-VANCE-BP-4",
          "timestamp": "2025-05-10T10:05:00Z",
          "dateOnly": "2025-05-10",
          "title": "Measurement: Systolic Blood Pressure",
          "category": "vital-signs",
          "status": "final",
          "encounterId": "ENC-VANCE-2025-05",
          "valueDisplay": "126.0 mmHg",
          "summary": "Observed value: 126.0 mmHg",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-A1C-5",
          "resourceKey": "Observation/OBS-VANCE-A1C-5",
          "timestamp": "2025-05-10T10:15:00Z",
          "dateOnly": "2025-05-10",
          "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2025-05",
          "valueDisplay": "7.0 %",
          "summary": "Observed value: 7.0 %",
          "details": {}
        },
        {
          "resourceType": "Observation",
          "resourceId": "OBS-VANCE-EGFR-4",
          "resourceKey": "Observation/OBS-VANCE-EGFR-4",
          "timestamp": "2025-05-10T10:15:00Z",
          "dateOnly": "2025-05-10",
          "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
          "category": "laboratory",
          "status": "final",
          "encounterId": "ENC-VANCE-2025-05",
          "valueDisplay": "57.0 mL/min/1.73m2",
          "summary": "Observed value: 57.0 mL/min/1.73m2",
          "details": {}
        }
      ],
      "encounterGroups": [
        {
          "encounterId": "ENC-VANCE-2025-05",
          "title": "Annual Longitudinal Care Plan Review",
          "class": "ambulatory",
          "start": "2025-05-10T10:00:00Z",
          "end": "2025-05-10T10:45:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-VANCE-2025-05",
              "resourceKey": "Encounter/ENC-VANCE-2025-05",
              "timestamp": "2025-05-10T10:00:00Z",
              "dateOnly": "2025-05-10",
              "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-VANCE-2025-05",
              "valueDisplay": null,
              "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-BP-4",
              "resourceKey": "Observation/OBS-VANCE-BP-4",
              "timestamp": "2025-05-10T10:05:00Z",
              "dateOnly": "2025-05-10",
              "title": "Measurement: Systolic Blood Pressure",
              "category": "vital-signs",
              "status": "final",
              "encounterId": "ENC-VANCE-2025-05",
              "valueDisplay": "126.0 mmHg",
              "summary": "Observed value: 126.0 mmHg",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-A1C-5",
              "resourceKey": "Observation/OBS-VANCE-A1C-5",
              "timestamp": "2025-05-10T10:15:00Z",
              "dateOnly": "2025-05-10",
              "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2025-05",
              "valueDisplay": "7.0 %",
              "summary": "Observed value: 7.0 %",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-EGFR-4",
              "resourceKey": "Observation/OBS-VANCE-EGFR-4",
              "timestamp": "2025-05-10T10:15:00Z",
              "dateOnly": "2025-05-10",
              "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2025-05",
              "valueDisplay": "57.0 mL/min/1.73m2",
              "summary": "Observed value: 57.0 mL/min/1.73m2",
              "details": {}
            }
          ]
        },
        {
          "encounterId": "ENC-VANCE-2024-08",
          "title": "Nephrology Consultation & Renal Staging",
          "class": "ambulatory",
          "start": "2024-08-22T11:00:00Z",
          "end": "2024-08-22T11:50:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-VANCE-2024-08",
              "resourceKey": "Encounter/ENC-VANCE-2024-08",
              "timestamp": "2024-08-22T11:00:00Z",
              "dateOnly": "2024-08-22",
              "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": null,
              "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-EGFR-3",
              "resourceKey": "Observation/OBS-VANCE-EGFR-3",
              "timestamp": "2024-08-22T11:15:00Z",
              "dateOnly": "2024-08-22",
              "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": "54.0 mL/min/1.73m2",
              "summary": "Observed value: 54.0 mL/min/1.73m2",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-ALB-CREAT",
              "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
              "timestamp": "2024-08-22T11:15:00Z",
              "dateOnly": "2024-08-22",
              "title": "Measurement: Microalbumin/Creatinine in Urine",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": "185.0 mg/g",
              "summary": "Observed value: 185.0 mg/g",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-A1C-4",
              "resourceKey": "Observation/OBS-VANCE-A1C-4",
              "timestamp": "2024-08-22T11:15:00Z",
              "dateOnly": "2024-08-22",
              "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": "7.6 %",
              "summary": "Observed value: 7.6 %",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
              "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
              "timestamp": "2024-08-22T11:45:00Z",
              "dateOnly": "2024-08-22",
              "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": null,
              "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
              "details": {}
            },
            {
              "resourceType": "DiagnosticReport",
              "resourceId": "DR-VANCE-RENAL-US",
              "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
              "timestamp": "2024-08-23T09:00:00Z",
              "dateOnly": "2024-08-23",
              "title": "Diagnostic Report: Renal Ultrasound Bilateral",
              "category": "report",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": null,
              "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
              "details": {}
            },
            {
              "resourceType": "Procedure",
              "resourceId": "PROC-VANCE-EYE-EXAM",
              "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
              "timestamp": "2024-08-25T13:30:00Z",
              "dateOnly": "2024-08-25",
              "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
              "category": "procedure",
              "status": "completed",
              "encounterId": "ENC-VANCE-2024-08",
              "valueDisplay": null,
              "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
              "details": {}
            }
          ]
        },
        {
          "encounterId": "ENC-VANCE-2024-02",
          "title": "Emergency Department Acute Hyperglycemia Evaluation",
          "class": "emergency",
          "start": "2024-02-11T20:15:00Z",
          "end": "2024-02-12T04:30:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-VANCE-2024-02",
              "resourceKey": "Encounter/ENC-VANCE-2024-02",
              "timestamp": "2024-02-11T20:15:00Z",
              "dateOnly": "2024-02-11",
              "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-VANCE-2024-02",
              "valueDisplay": null,
              "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-BP-3",
              "resourceKey": "Observation/OBS-VANCE-BP-3",
              "timestamp": "2024-02-11T20:20:00Z",
              "dateOnly": "2024-02-11",
              "title": "Measurement: Systolic Blood Pressure",
              "category": "vital-signs",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-02",
              "valueDisplay": "154.0 mmHg",
              "summary": "Observed value: 154.0 mmHg",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-GLUC-EMER",
              "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
              "timestamp": "2024-02-11T20:30:00Z",
              "dateOnly": "2024-02-11",
              "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-02",
              "valueDisplay": "342.0 mg/dL",
              "summary": "Observed value: 342.0 mg/dL",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-A1C-3",
              "resourceKey": "Observation/OBS-VANCE-A1C-3",
              "timestamp": "2024-02-11T20:30:00Z",
              "dateOnly": "2024-02-11",
              "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2024-02",
              "valueDisplay": "8.8 %",
              "summary": "Observed value: 8.8 %",
              "details": {}
            }
          ]
        },
        {
          "encounterId": "ENC-VANCE-2023-09",
          "title": "Endocrinology 6-Month Treatment Assessment",
          "class": "ambulatory",
          "start": "2023-09-18T14:00:00Z",
          "end": "2023-09-18T14:40:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-VANCE-2023-09",
              "resourceKey": "Encounter/ENC-VANCE-2023-09",
              "timestamp": "2023-09-18T14:00:00Z",
              "dateOnly": "2023-09-18",
              "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-VANCE-2023-09",
              "valueDisplay": null,
              "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-BP-2",
              "resourceKey": "Observation/OBS-VANCE-BP-2",
              "timestamp": "2023-09-18T14:05:00Z",
              "dateOnly": "2023-09-18",
              "title": "Measurement: Systolic Blood Pressure",
              "category": "vital-signs",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-09",
              "valueDisplay": "138.0 mmHg",
              "summary": "Observed value: 138.0 mmHg",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-A1C-2",
              "resourceKey": "Observation/OBS-VANCE-A1C-2",
              "timestamp": "2023-09-18T14:15:00Z",
              "dateOnly": "2023-09-18",
              "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-09",
              "valueDisplay": "8.3 %",
              "summary": "Observed value: 8.3 %",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-EGFR-2",
              "resourceKey": "Observation/OBS-VANCE-EGFR-2",
              "timestamp": "2023-09-18T14:15:00Z",
              "dateOnly": "2023-09-18",
              "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-09",
              "valueDisplay": "56.0 mL/min/1.73m2",
              "summary": "Observed value: 56.0 mL/min/1.73m2",
              "details": {}
            }
          ]
        },
        {
          "encounterId": "ENC-VANCE-2023-03",
          "title": "Endocrinology Comprehensive Initial Review",
          "class": "ambulatory",
          "start": "2023-03-14T09:30:00Z",
          "end": "2023-03-14T10:45:00Z",
          "events": [
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-VANCE-2023-03",
              "resourceKey": "Encounter/ENC-VANCE-2023-03",
              "timestamp": "2023-03-14T09:30:00Z",
              "dateOnly": "2023-03-14",
              "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": null,
              "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-BP-1",
              "resourceKey": "Observation/OBS-VANCE-BP-1",
              "timestamp": "2023-03-14T09:35:00Z",
              "dateOnly": "2023-03-14",
              "title": "Measurement: Systolic Blood Pressure",
              "category": "vital-signs",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": "148.0 mmHg",
              "summary": "Observed value: 148.0 mmHg",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-A1C-1",
              "resourceKey": "Observation/OBS-VANCE-A1C-1",
              "timestamp": "2023-03-14T09:45:00Z",
              "dateOnly": "2023-03-14",
              "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": "9.4 %",
              "summary": "Observed value: 9.4 %",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-EGFR-1",
              "resourceKey": "Observation/OBS-VANCE-EGFR-1",
              "timestamp": "2023-03-14T09:45:00Z",
              "dateOnly": "2023-03-14",
              "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": "58.0 mL/min/1.73m2",
              "summary": "Observed value: 58.0 mL/min/1.73m2",
              "details": {}
            },
            {
              "resourceType": "Observation",
              "resourceId": "OBS-VANCE-CREAT-1",
              "resourceKey": "Observation/OBS-VANCE-CREAT-1",
              "timestamp": "2023-03-14T09:45:00Z",
              "dateOnly": "2023-03-14",
              "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
              "category": "laboratory",
              "status": "final",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": "1.32 mg/dL",
              "summary": "Observed value: 1.32 mg/dL",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-VANCE-METFORMIN",
              "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
              "timestamp": "2023-03-14T10:30:00Z",
              "dateOnly": "2023-03-14",
              "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": null,
              "summary": "Take 1 tablet by mouth twice daily with meals",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-VANCE-LISINOPRIL",
              "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
              "timestamp": "2023-03-14T10:35:00Z",
              "dateOnly": "2023-03-14",
              "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-VANCE-2023-03",
              "valueDisplay": null,
              "summary": "Take 1 tablet by mouth daily in the morning",
              "details": {}
            }
          ]
        }
      ],
      "series": {
        "Hemoglobin A1c/Hemoglobin.total in Blood": [
          {
            "timestamp": "2023-03-14T09:45:00Z",
            "date": "2023-03-14",
            "value": 9.4,
            "unit": "%",
            "observationId": "OBS-VANCE-A1C-1",
            "status": "final"
          },
          {
            "timestamp": "2023-09-18T14:15:00Z",
            "date": "2023-09-18",
            "value": 8.3,
            "unit": "%",
            "observationId": "OBS-VANCE-A1C-2",
            "status": "final"
          },
          {
            "timestamp": "2024-02-11T20:30:00Z",
            "date": "2024-02-11",
            "value": 8.8,
            "unit": "%",
            "observationId": "OBS-VANCE-A1C-3",
            "status": "final"
          },
          {
            "timestamp": "2024-08-22T11:15:00Z",
            "date": "2024-08-22",
            "value": 7.6,
            "unit": "%",
            "observationId": "OBS-VANCE-A1C-4",
            "status": "final"
          },
          {
            "timestamp": "2025-05-10T10:15:00Z",
            "date": "2025-05-10",
            "value": 7.0,
            "unit": "%",
            "observationId": "OBS-VANCE-A1C-5",
            "status": "final"
          }
        ],
        "Glomerular filtration rate/1.73 sq M.predicted": [
          {
            "timestamp": "2023-03-14T09:45:00Z",
            "date": "2023-03-14",
            "value": 58.0,
            "unit": "mL/min/1.73m2",
            "observationId": "OBS-VANCE-EGFR-1",
            "status": "final"
          },
          {
            "timestamp": "2023-09-18T14:15:00Z",
            "date": "2023-09-18",
            "value": 56.0,
            "unit": "mL/min/1.73m2",
            "observationId": "OBS-VANCE-EGFR-2",
            "status": "final"
          },
          {
            "timestamp": "2024-08-22T11:15:00Z",
            "date": "2024-08-22",
            "value": 54.0,
            "unit": "mL/min/1.73m2",
            "observationId": "OBS-VANCE-EGFR-3",
            "status": "final"
          },
          {
            "timestamp": "2025-05-10T10:15:00Z",
            "date": "2025-05-10",
            "value": 57.0,
            "unit": "mL/min/1.73m2",
            "observationId": "OBS-VANCE-EGFR-4",
            "status": "final"
          }
        ],
        "Systolic Blood Pressure": [
          {
            "timestamp": "2023-03-14T09:35:00Z",
            "date": "2023-03-14",
            "value": 148.0,
            "unit": "mmHg",
            "observationId": "OBS-VANCE-BP-1",
            "status": "final"
          },
          {
            "timestamp": "2023-09-18T14:05:00Z",
            "date": "2023-09-18",
            "value": 138.0,
            "unit": "mmHg",
            "observationId": "OBS-VANCE-BP-2",
            "status": "final"
          },
          {
            "timestamp": "2024-02-11T20:20:00Z",
            "date": "2024-02-11",
            "value": 154.0,
            "unit": "mmHg",
            "observationId": "OBS-VANCE-BP-3",
            "status": "final"
          },
          {
            "timestamp": "2025-05-10T10:05:00Z",
            "date": "2025-05-10",
            "value": 126.0,
            "unit": "mmHg",
            "observationId": "OBS-VANCE-BP-4",
            "status": "final"
          }
        ],
        "Creatinine [Mass/volume] in Serum or Plasma": [
          {
            "timestamp": "2023-03-14T09:45:00Z",
            "date": "2023-03-14",
            "value": 1.32,
            "unit": "mg/dL",
            "observationId": "OBS-VANCE-CREAT-1",
            "status": "final"
          }
        ],
        "Glucose [Mass/volume] in Serum or Plasma": [
          {
            "timestamp": "2024-02-11T20:30:00Z",
            "date": "2024-02-11",
            "value": 342.0,
            "unit": "mg/dL",
            "observationId": "OBS-VANCE-GLUC-EMER",
            "status": "final"
          }
        ],
        "Microalbumin/Creatinine in Urine": [
          {
            "timestamp": "2024-08-22T11:15:00Z",
            "date": "2024-08-22",
            "value": 185.0,
            "unit": "mg/g",
            "observationId": "OBS-VANCE-ALB-CREAT",
            "status": "final"
          }
        ]
      }
    },
    "subgraph": {
      "patientId": "PAT-VANCE-01",
      "nodes": [
        {
          "id": "Organization/ORG-METRO",
          "resourceId": "ORG-METRO",
          "resourceType": "Organization",
          "title": "Metropolitan Academic Health System",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 7
        },
        {
          "id": "Organization/ORG-PRECISION-LAB",
          "resourceId": "ORG-PRECISION-LAB",
          "resourceType": "Organization",
          "title": "Precision Diagnostic Laboratories",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 16
        },
        {
          "id": "Practitioner/PRAC-JENKINS-01",
          "resourceId": "PRAC-JENKINS-01",
          "resourceType": "Practitioner",
          "title": "Dr. Sarah Jenkins",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 7
        },
        {
          "id": "Practitioner/PRAC-CHEN-02",
          "resourceId": "PRAC-CHEN-02",
          "resourceType": "Practitioner",
          "title": "Dr. Robert K. Chen",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 2
        },
        {
          "id": "Patient/PAT-VANCE-01",
          "resourceId": "PAT-VANCE-01",
          "resourceType": "Patient",
          "title": "Eleanor Rose Vance",
          "status": "recorded",
          "date": "1958-04-12",
          "patientId": "PAT-VANCE-01",
          "degree": 31
        },
        {
          "id": "Condition/COND-VANCE-T2D",
          "resourceId": "COND-VANCE-T2D",
          "resourceType": "Condition",
          "title": "Type 2 Diabetes Mellitus",
          "status": "active",
          "date": "2018-09-15",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        },
        {
          "id": "Condition/COND-VANCE-CKD",
          "resourceId": "COND-VANCE-CKD",
          "resourceType": "Condition",
          "title": "Diabetic Chronic Kidney Disease, Stage 3a",
          "status": "active",
          "date": "2023-01-20",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        },
        {
          "id": "Condition/COND-VANCE-HTN",
          "resourceId": "COND-VANCE-HTN",
          "resourceType": "Condition",
          "title": "Essential Hypertension",
          "status": "active",
          "date": "2019-03-10",
          "patientId": "PAT-VANCE-01",
          "degree": 2
        },
        {
          "id": "Encounter/ENC-VANCE-2023-03",
          "resourceId": "ENC-VANCE-2023-03",
          "resourceType": "Encounter",
          "title": "Encounter ENC-VANCE-2023-03",
          "status": "finished",
          "date": "2023-03-14T09:30:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 10
        },
        {
          "id": "Encounter/ENC-VANCE-2023-09",
          "resourceId": "ENC-VANCE-2023-09",
          "resourceType": "Encounter",
          "title": "Encounter ENC-VANCE-2023-09",
          "status": "finished",
          "date": "2023-09-18T14:00:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 6
        },
        {
          "id": "Encounter/ENC-VANCE-2024-02",
          "resourceId": "ENC-VANCE-2024-02",
          "resourceType": "Encounter",
          "title": "Encounter ENC-VANCE-2024-02",
          "status": "finished",
          "date": "2024-02-11T20:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 6
        },
        {
          "id": "Encounter/ENC-VANCE-2024-08",
          "resourceId": "ENC-VANCE-2024-08",
          "resourceType": "Encounter",
          "title": "Encounter ENC-VANCE-2024-08",
          "status": "finished",
          "date": "2024-08-22T11:00:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 10
        },
        {
          "id": "Encounter/ENC-VANCE-2025-05",
          "resourceId": "ENC-VANCE-2025-05",
          "resourceType": "Encounter",
          "title": "Encounter ENC-VANCE-2025-05",
          "status": "finished",
          "date": "2025-05-10T10:00:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 6
        },
        {
          "id": "Observation/OBS-VANCE-A1C-1",
          "resourceId": "OBS-VANCE-A1C-1",
          "resourceType": "Observation",
          "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
          "status": "final",
          "date": "2023-03-14T09:45:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-EGFR-1",
          "resourceId": "OBS-VANCE-EGFR-1",
          "resourceType": "Observation",
          "title": "Glomerular filtration rate/1.73 sq M.predicted",
          "status": "final",
          "date": "2023-03-14T09:45:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-BP-1",
          "resourceId": "OBS-VANCE-BP-1",
          "resourceType": "Observation",
          "title": "Systolic Blood Pressure",
          "status": "final",
          "date": "2023-03-14T09:35:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-CREAT-1",
          "resourceId": "OBS-VANCE-CREAT-1",
          "resourceType": "Observation",
          "title": "Creatinine [Mass/volume] in Serum or Plasma",
          "status": "final",
          "date": "2023-03-14T09:45:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-A1C-2",
          "resourceId": "OBS-VANCE-A1C-2",
          "resourceType": "Observation",
          "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
          "status": "final",
          "date": "2023-09-18T14:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-EGFR-2",
          "resourceId": "OBS-VANCE-EGFR-2",
          "resourceType": "Observation",
          "title": "Glomerular filtration rate/1.73 sq M.predicted",
          "status": "final",
          "date": "2023-09-18T14:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-BP-2",
          "resourceId": "OBS-VANCE-BP-2",
          "resourceType": "Observation",
          "title": "Systolic Blood Pressure",
          "status": "final",
          "date": "2023-09-18T14:05:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-GLUC-EMER",
          "resourceId": "OBS-VANCE-GLUC-EMER",
          "resourceType": "Observation",
          "title": "Glucose [Mass/volume] in Serum or Plasma",
          "status": "final",
          "date": "2024-02-11T20:30:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-A1C-3",
          "resourceId": "OBS-VANCE-A1C-3",
          "resourceType": "Observation",
          "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
          "status": "final",
          "date": "2024-02-11T20:30:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-BP-3",
          "resourceId": "OBS-VANCE-BP-3",
          "resourceType": "Observation",
          "title": "Systolic Blood Pressure",
          "status": "final",
          "date": "2024-02-11T20:20:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-EGFR-3",
          "resourceId": "OBS-VANCE-EGFR-3",
          "resourceType": "Observation",
          "title": "Glomerular filtration rate/1.73 sq M.predicted",
          "status": "final",
          "date": "2024-08-22T11:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        },
        {
          "id": "Observation/OBS-VANCE-ALB-CREAT",
          "resourceId": "OBS-VANCE-ALB-CREAT",
          "resourceType": "Observation",
          "title": "Microalbumin/Creatinine in Urine",
          "status": "final",
          "date": "2024-08-22T11:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        },
        {
          "id": "Observation/OBS-VANCE-A1C-4",
          "resourceId": "OBS-VANCE-A1C-4",
          "resourceType": "Observation",
          "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
          "status": "final",
          "date": "2024-08-22T11:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-A1C-5",
          "resourceId": "OBS-VANCE-A1C-5",
          "resourceType": "Observation",
          "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
          "status": "final",
          "date": "2025-05-10T10:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-EGFR-4",
          "resourceId": "OBS-VANCE-EGFR-4",
          "resourceType": "Observation",
          "title": "Glomerular filtration rate/1.73 sq M.predicted",
          "status": "final",
          "date": "2025-05-10T10:15:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "Observation/OBS-VANCE-BP-4",
          "resourceId": "OBS-VANCE-BP-4",
          "resourceType": "Observation",
          "title": "Systolic Blood Pressure",
          "status": "final",
          "date": "2025-05-10T10:05:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "DiagnosticReport/DR-VANCE-RENAL-US",
          "resourceId": "DR-VANCE-RENAL-US",
          "resourceType": "DiagnosticReport",
          "title": "Renal Ultrasound Bilateral",
          "status": "final",
          "date": "2024-08-23T09:00:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 5
        },
        {
          "id": "Procedure/PROC-VANCE-EYE-EXAM",
          "resourceId": "PROC-VANCE-EYE-EXAM",
          "resourceType": "Procedure",
          "title": "Comprehensive Dilated Diabetic Eye Examination",
          "status": "completed",
          "date": "2024-08-25T13:30:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 3
        },
        {
          "id": "MedicationRequest/MED-VANCE-METFORMIN",
          "resourceId": "MED-VANCE-METFORMIN",
          "resourceType": "MedicationRequest",
          "title": "Metformin ER 1000 mg Oral Tablet",
          "status": "active",
          "date": "2023-03-14T10:30:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        },
        {
          "id": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "resourceId": "MED-VANCE-LISINOPRIL",
          "resourceType": "MedicationRequest",
          "title": "Lisinopril 20 mg Oral Tablet",
          "status": "active",
          "date": "2023-03-14T10:35:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 5
        },
        {
          "id": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
          "resourceType": "MedicationRequest",
          "title": "Jardiance (Empagliflozin) 25 mg Oral Tablet",
          "status": "active",
          "date": "2024-08-22T11:45:00Z",
          "patientId": "PAT-VANCE-01",
          "degree": 4
        }
      ],
      "edges": [
        {
          "path": "generalPractitioner[0]",
          "label": "primary care",
          "isResolved": true,
          "source": "Patient/PAT-VANCE-01",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "managingOrganization",
          "label": "organization",
          "isResolved": true,
          "source": "Patient/PAT-VANCE-01",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-VANCE-T2D",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-VANCE-CKD",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-VANCE-HTN",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-03",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-03",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "diagnosis[0].condition",
          "label": "diagnosis",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-03",
          "target": "Condition/COND-VANCE-T2D"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-03",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-09",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-09",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2023-09",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-02",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "diagnosis[0].condition",
          "label": "diagnosis",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-02",
          "target": "Condition/COND-VANCE-T2D"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-02",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-08",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-08",
          "target": "Practitioner/PRAC-CHEN-02"
        },
        {
          "path": "diagnosis[0].condition",
          "label": "diagnosis",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-08",
          "target": "Condition/COND-VANCE-CKD"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2024-08",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2025-05",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "participant[0].individual",
          "label": "references",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2025-05",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "serviceProvider",
          "label": "organization",
          "isResolved": true,
          "source": "Encounter/ENC-VANCE-2025-05",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-1",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-1",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-1",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-1",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-1",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-1",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-1",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-1",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-1",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-CREAT-1",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-CREAT-1",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-CREAT-1",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-2",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-2",
          "target": "Encounter/ENC-VANCE-2023-09"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-2",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-2",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-2",
          "target": "Encounter/ENC-VANCE-2023-09"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-2",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-2",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-2",
          "target": "Encounter/ENC-VANCE-2023-09"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-2",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-GLUC-EMER",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-GLUC-EMER",
          "target": "Encounter/ENC-VANCE-2024-02"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-GLUC-EMER",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-3",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-3",
          "target": "Encounter/ENC-VANCE-2024-02"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-3",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-3",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-3",
          "target": "Encounter/ENC-VANCE-2024-02"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-3",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-3",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-3",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-3",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-ALB-CREAT",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-ALB-CREAT",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-ALB-CREAT",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-4",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-4",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-4",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-5",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-5",
          "target": "Encounter/ENC-VANCE-2025-05"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-A1C-5",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-4",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-4",
          "target": "Encounter/ENC-VANCE-2025-05"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-EGFR-4",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-4",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-4",
          "target": "Encounter/ENC-VANCE-2025-05"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "Observation/OBS-VANCE-BP-4",
          "target": "Organization/ORG-PRECISION-LAB"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "DiagnosticReport/DR-VANCE-RENAL-US",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "DiagnosticReport/DR-VANCE-RENAL-US",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "performer[0]",
          "label": "performer",
          "isResolved": true,
          "source": "DiagnosticReport/DR-VANCE-RENAL-US",
          "target": "Organization/ORG-METRO"
        },
        {
          "path": "result[0]",
          "label": "result",
          "isResolved": true,
          "source": "DiagnosticReport/DR-VANCE-RENAL-US",
          "target": "Observation/OBS-VANCE-EGFR-3"
        },
        {
          "path": "result[1]",
          "label": "result",
          "isResolved": true,
          "source": "DiagnosticReport/DR-VANCE-RENAL-US",
          "target": "Observation/OBS-VANCE-ALB-CREAT"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Procedure/PROC-VANCE-EYE-EXAM",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Procedure/PROC-VANCE-EYE-EXAM",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "performer[0].actor",
          "label": "performer",
          "isResolved": true,
          "source": "Procedure/PROC-VANCE-EYE-EXAM",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-METFORMIN",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-METFORMIN",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-METFORMIN",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "reasonReference[0]",
          "label": "justification",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-METFORMIN",
          "target": "Condition/COND-VANCE-T2D"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "target": "Encounter/ENC-VANCE-2023-03"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "target": "Practitioner/PRAC-JENKINS-01"
        },
        {
          "path": "reasonReference[0]",
          "label": "justification",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "target": "Condition/COND-VANCE-HTN"
        },
        {
          "path": "reasonReference[1]",
          "label": "justification",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
          "target": "Condition/COND-VANCE-CKD"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "target": "Patient/PAT-VANCE-01"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "target": "Encounter/ENC-VANCE-2024-08"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "target": "Practitioner/PRAC-CHEN-02"
        },
        {
          "path": "reasonReference[0]",
          "label": "justification",
          "isResolved": true,
          "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
          "target": "Condition/COND-VANCE-CKD"
        }
      ],
      "nodeCount": 34,
      "edgeCount": 91
    },
    "transferReadiness": {
      "patientId": "PAT-VANCE-01",
      "transferStatus": "TRANSFER READY",
      "isReady": true,
      "checks": [
        {
          "dimension": "Patient Demographics & Identity",
          "passed": true,
          "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
        },
        {
          "dimension": "Encounter Episode Context",
          "passed": true,
          "details": "5 Encounters verified with class & duration."
        },
        {
          "dimension": "Medication Prescriber Attribution",
          "passed": true,
          "details": "3 Medication orders verified against provider registry."
        },
        {
          "dimension": "Referential Completeness",
          "passed": true,
          "details": "0 unresolved reference(s) found in patient sub-graph."
        }
      ],
      "reasons": [
        "All essential clinical and referential transfer prerequisites satisfied."
      ],
      "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
    }
  },
  "PAT-ANOMALY-05": {
    "patient": {
      "resourceType": "Patient",
      "id": "PAT-ANOMALY-05",
      "active": true,
      "identifier": [
        {
          "system": "http://metrohealth.example.org/mrn",
          "value": "MRN-ANOMALY-999"
        }
      ],
      "name": [
        {
          "use": "temp",
          "family": "Subject-Unresolved",
          "given": [
            "Alex"
          ]
        }
      ],
      "gender": "unknown",
      "birthDate": null,
      "managingOrganization": {
        "reference": "Organization/ORG-METRO"
      }
    },
    "resourcesByType": {
      "MedicationRequest": [
        {
          "resourceType": "MedicationRequest",
          "id": "MED-ANOMALY-DANGLING-PRAC",
          "status": "active",
          "intent": "order",
          "medicationCodeableConcept": {
            "coding": [
              {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": "197361",
                "display": "Amlodipine 5 MG Oral Tablet"
              }
            ],
            "text": "Amlodipine 5 mg Oral Tablet"
          },
          "subject": {
            "reference": "Patient/PAT-ANOMALY-05"
          },
          "encounter": {
            "reference": "Encounter/ENC-ANOMALY-01"
          },
          "authoredOn": "2025-02-10T10:30:00Z",
          "requester": {
            "reference": "Practitioner/PRAC-99999",
            "display": "Dr. Ghost Practitioner (Unresolved Reference)"
          }
        }
      ],
      "Encounter": [
        {
          "resourceType": "Encounter",
          "id": "ENC-ANOMALY-01",
          "status": "finished",
          "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB"
          },
          "subject": {
            "reference": "Patient/PAT-ANOMALY-05"
          },
          "period": {
            "start": "2025-02-10T10:00:00Z",
            "end": "2025-02-10T11:00:00Z"
          }
        }
      ],
      "Observation": [
        {
          "resourceType": "Observation",
          "id": "OBS-ANOMALY-TEMPORAL-CLASH",
          "status": "preliminary",
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "2951-2",
                "display": "Sodium [Moles/volume] in Serum or Plasma"
              }
            ],
            "text": "Serum Sodium (Conflicting Ingestion Copy)"
          },
          "subject": {
            "reference": "Patient/PAT-ANOMALY-05"
          },
          "encounter": {
            "reference": "Encounter/ENC-ANOMALY-01"
          },
          "effectiveDateTime": "2025-01-15T08:05:00Z",
          "valueQuantity": {
            "value": 144,
            "unit": "mmol/L",
            "system": "http://unitsofmeasure.org",
            "code": "mmol/L"
          }
        }
      ],
      "Condition": [
        {
          "resourceType": "Condition",
          "id": "COND-ANOMALY-MISSING-STATUS",
          "clinicalStatus": null,
          "verificationStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://snomed.info/sct",
                "code": "386661006",
                "display": "Fever"
              }
            ],
            "text": "Pyrexia of unknown origin"
          },
          "subject": {
            "reference": "Patient/PAT-ANOMALY-05"
          }
        }
      ],
      "Patient": [
        {
          "resourceType": "Patient",
          "id": "PAT-ANOMALY-05",
          "active": true,
          "identifier": [
            {
              "system": "http://metrohealth.example.org/mrn",
              "value": "MRN-ANOMALY-999"
            }
          ],
          "name": [
            {
              "use": "temp",
              "family": "Subject-Unresolved",
              "given": [
                "Alex"
              ]
            }
          ],
          "gender": "unknown",
          "birthDate": null,
          "managingOrganization": {
            "reference": "Organization/ORG-METRO"
          }
        }
      ]
    },
    "totalResources": 5,
    "timeline": {
      "patientId": "PAT-ANOMALY-05",
      "totalEvents": 3,
      "events": [
        {
          "resourceType": "Observation",
          "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
          "resourceKey": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
          "timestamp": "2025-01-15T08:05:00Z",
          "dateOnly": "2025-01-15",
          "title": "Measurement: Serum Sodium (Conflicting Ingestion Copy)",
          "category": "laboratory",
          "status": "preliminary",
          "encounterId": "ENC-ANOMALY-01",
          "valueDisplay": "144 mmol/L",
          "summary": "Observed value: 144 mmol/L",
          "details": {}
        },
        {
          "resourceType": "Encounter",
          "resourceId": "ENC-ANOMALY-01",
          "resourceKey": "Encounter/ENC-ANOMALY-01",
          "timestamp": "2025-02-10T10:00:00Z",
          "dateOnly": "2025-02-10",
          "title": "Ambulatory Encounter: Encounter",
          "category": "encounter",
          "status": "finished",
          "encounterId": "ENC-ANOMALY-01",
          "valueDisplay": null,
          "summary": "Encounter duration: 2025-02-10 to 2025-02-10",
          "details": {}
        },
        {
          "resourceType": "MedicationRequest",
          "resourceId": "MED-ANOMALY-DANGLING-PRAC",
          "resourceKey": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
          "timestamp": "2025-02-10T10:30:00Z",
          "dateOnly": "2025-02-10",
          "title": "Rx Order: Amlodipine 5 mg Oral Tablet",
          "category": "medication",
          "status": "active",
          "encounterId": "ENC-ANOMALY-01",
          "valueDisplay": null,
          "summary": "Status: active",
          "details": {}
        }
      ],
      "encounterGroups": [
        {
          "encounterId": "ENC-ANOMALY-01",
          "title": "Encounter ENC-ANOMALY-01",
          "class": "Ambulatory",
          "start": "2025-02-10T10:00:00Z",
          "end": "2025-02-10T11:00:00Z",
          "events": [
            {
              "resourceType": "Observation",
              "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
              "resourceKey": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
              "timestamp": "2025-01-15T08:05:00Z",
              "dateOnly": "2025-01-15",
              "title": "Measurement: Serum Sodium (Conflicting Ingestion Copy)",
              "category": "laboratory",
              "status": "preliminary",
              "encounterId": "ENC-ANOMALY-01",
              "valueDisplay": "144 mmol/L",
              "summary": "Observed value: 144 mmol/L",
              "details": {}
            },
            {
              "resourceType": "Encounter",
              "resourceId": "ENC-ANOMALY-01",
              "resourceKey": "Encounter/ENC-ANOMALY-01",
              "timestamp": "2025-02-10T10:00:00Z",
              "dateOnly": "2025-02-10",
              "title": "Ambulatory Encounter: Encounter",
              "category": "encounter",
              "status": "finished",
              "encounterId": "ENC-ANOMALY-01",
              "valueDisplay": null,
              "summary": "Encounter duration: 2025-02-10 to 2025-02-10",
              "details": {}
            },
            {
              "resourceType": "MedicationRequest",
              "resourceId": "MED-ANOMALY-DANGLING-PRAC",
              "resourceKey": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
              "timestamp": "2025-02-10T10:30:00Z",
              "dateOnly": "2025-02-10",
              "title": "Rx Order: Amlodipine 5 mg Oral Tablet",
              "category": "medication",
              "status": "active",
              "encounterId": "ENC-ANOMALY-01",
              "valueDisplay": null,
              "summary": "Status: active",
              "details": {}
            }
          ]
        }
      ],
      "series": {
        "Serum Sodium (Conflicting Ingestion Copy)": [
          {
            "timestamp": "2025-01-15T08:05:00Z",
            "date": "2025-01-15",
            "value": 144,
            "unit": "mmol/L",
            "observationId": "OBS-ANOMALY-TEMPORAL-CLASH",
            "status": "preliminary"
          }
        ]
      }
    },
    "subgraph": {
      "patientId": "PAT-ANOMALY-05",
      "nodes": [
        {
          "id": "Practitioner/PRAC-99999",
          "resourceId": "PRAC-99999",
          "resourceType": "Practitioner",
          "title": "Dr. Ghost Practitioner (Unresolved Reference)",
          "status": "unresolved",
          "date": null,
          "patientId": null,
          "isDangling": true,
          "degree": 1
        },
        {
          "id": "Encounter/ENC-ANOMALY-01",
          "resourceId": "ENC-ANOMALY-01",
          "resourceType": "Encounter",
          "title": "Encounter ENC-ANOMALY-01",
          "status": "finished",
          "date": "2025-02-10T10:00:00Z",
          "patientId": "PAT-ANOMALY-05",
          "degree": 3
        },
        {
          "id": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
          "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
          "resourceType": "Observation",
          "title": "Serum Sodium (Conflicting Ingestion Copy)",
          "status": "preliminary",
          "date": "2025-01-15T08:05:00Z",
          "patientId": "PAT-ANOMALY-05",
          "degree": 2
        },
        {
          "id": "Condition/COND-ANOMALY-MISSING-STATUS",
          "resourceId": "COND-ANOMALY-MISSING-STATUS",
          "resourceType": "Condition",
          "title": "Pyrexia of unknown origin",
          "status": "recorded",
          "date": null,
          "patientId": "PAT-ANOMALY-05",
          "degree": 1
        },
        {
          "id": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
          "resourceId": "MED-ANOMALY-DANGLING-PRAC",
          "resourceType": "MedicationRequest",
          "title": "Amlodipine 5 mg Oral Tablet",
          "status": "active",
          "date": "2025-02-10T10:30:00Z",
          "patientId": "PAT-ANOMALY-05",
          "degree": 3
        },
        {
          "id": "Organization/ORG-METRO",
          "resourceId": "ORG-METRO",
          "resourceType": "Organization",
          "title": "Metropolitan Academic Health System",
          "status": "recorded",
          "date": null,
          "patientId": null,
          "degree": 1
        },
        {
          "id": "Patient/PAT-ANOMALY-05",
          "resourceId": "PAT-ANOMALY-05",
          "resourceType": "Patient",
          "title": "Alex Subject-Unresolved",
          "status": "recorded",
          "date": null,
          "patientId": "PAT-ANOMALY-05",
          "degree": 5
        }
      ],
      "edges": [
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Encounter/ENC-ANOMALY-01",
          "target": "Patient/PAT-ANOMALY-05"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
          "target": "Patient/PAT-ANOMALY-05"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
          "target": "Encounter/ENC-ANOMALY-01"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "Condition/COND-ANOMALY-MISSING-STATUS",
          "target": "Patient/PAT-ANOMALY-05"
        },
        {
          "path": "subject",
          "label": "subject",
          "isResolved": true,
          "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
          "target": "Patient/PAT-ANOMALY-05"
        },
        {
          "path": "encounter",
          "label": "context",
          "isResolved": true,
          "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
          "target": "Encounter/ENC-ANOMALY-01"
        },
        {
          "path": "requester",
          "label": "prescriber",
          "isResolved": false,
          "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
          "target": "Practitioner/PRAC-99999"
        },
        {
          "path": "managingOrganization",
          "label": "organization",
          "isResolved": true,
          "source": "Patient/PAT-ANOMALY-05",
          "target": "Organization/ORG-METRO"
        }
      ],
      "nodeCount": 7,
      "edgeCount": 8
    },
    "transferReadiness": {
      "patientId": "PAT-ANOMALY-05",
      "transferStatus": "TRANSFER BLOCKED",
      "isReady": false,
      "checks": [
        {
          "dimension": "Patient Demographics & Identity",
          "passed": false,
          "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2715"
        },
        {
          "dimension": "Encounter Episode Context",
          "passed": true,
          "details": "1 Encounters verified with class & duration."
        },
        {
          "dimension": "Medication Prescriber Attribution",
          "passed": false,
          "details": "1 Medication orders verified against provider registry."
        },
        {
          "dimension": "Referential Completeness",
          "passed": false,
          "details": "1 unresolved reference(s) found in patient sub-graph."
        }
      ],
      "reasons": [
        "Incomplete demographic identity attributes (missing MRN, name, or birthDate).",
        "Medication 'MED-ANOMALY-DANGLING-PRAC' references unverified prescriber 'Practitioner/PRAC-99999'.",
        "Contains 1 broken cross-resource pointers."
      ],
      "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
    }
  }
};

export const FALLBACK_ALERTS = {
  "PAT-CHEN-03": {
    "patientId": "PAT-CHEN-03",
    "totalAlerts": 0,
    "criticalCount": 0,
    "warningCount": 0,
    "infoCount": 0,
    "alerts": []
  },
  "PAT-ROSS-04": {
    "patientId": "PAT-ROSS-04",
    "totalAlerts": 0,
    "criticalCount": 0,
    "warningCount": 0,
    "infoCount": 0,
    "alerts": []
  },
  "PAT-THORNE-02": {
    "patientId": "PAT-THORNE-02",
    "totalAlerts": 1,
    "criticalCount": 1,
    "warningCount": 0,
    "infoCount": 0,
    "alerts": [
      {
        "id": "PGX-SLCO1B1-ATORVASTATIN",
        "severity": "CRITICAL",
        "category": "Pharmacogenomics (CPIC Level A)",
        "title": "PGx Safety Alert: SLCO1B1 (Poor Function) + Atorvastatin",
        "summary": "Defective OATP1B1 hepatic influx transporter (*5 allele) leads to elevated systemic statin concentrations. Markedly increased risk of severe myopathy and rhabdomyolysis.",
        "recommendation": "Avoid high-dose simvastatin (40mg/80mg). Prescribe an alternative statin with lower OATP1B1 dependence or limit simvastatin dose to <=20mg.",
        "guideline": "CPIC Level A Precision Dosing Guideline",
        "target_resources": [
          {
            "resourceType": "MedicationRequest",
            "id": "83367",
            "display": "Atorvastatin (RxNorm: 83367)"
          }
        ],
        "fda_black_box": false,
        "alternative_medications": [
          "Pravastatin",
          "Rosuvastatin",
          "Pitavastatin"
        ]
      }
    ]
  },
  "PAT-VANCE-01": {
    "patientId": "PAT-VANCE-01",
    "totalAlerts": 2,
    "criticalCount": 0,
    "warningCount": 1,
    "infoCount": 1,
    "alerts": [
      {
        "id": "CDS-RENAL-METFORMIN-SURVEILLANCE",
        "severity": "WARNING",
        "category": "Renal Surveillance",
        "title": "Stage 3a CKD Metformin Surveillance",
        "summary": "Patient eGFR is 57.0 mL/min/1.73m2 (Stage 3a CKD). Metformin use is permissible with scheduled renal monitoring.",
        "recommendation": "Maintain renal function surveillance every 3 to 6 months. Withhold temporarily prior to iodinated radiocontrast procedures.",
        "guideline": "KDIGO 2024 Clinical Practice Guideline and ADA Standards of Care",
        "target_resources": [
          {
            "resourceType": "MedicationRequest",
            "id": "MED-VANCE-METFORMIN",
            "display": "Metformin Prescription"
          },
          {
            "resourceType": "Observation",
            "id": "OBS-VANCE-EGFR-4",
            "display": "eGFR: 57.0 mL/min"
          }
        ]
      },
      {
        "id": "CDS-GLYCEMIC-CONTROL-TARGET",
        "severity": "INFO",
        "category": "Therapeutic Milestone",
        "title": "Glycemic Target Attained",
        "summary": "Latest HbA1c of 7.0% meets the ADA clinical target threshold of 7.0%.",
        "recommendation": "Continue current antihyperglycemic regimen and schedule routine 6-month surveillance.",
        "guideline": "ADA Clinical Practice Recommendations for Glycemic Control",
        "target_resources": [
          {
            "resourceType": "Observation",
            "id": "OBS-VANCE-A1C-5",
            "display": "HbA1c: 7.0%"
          }
        ]
      }
    ]
  },
  "PAT-ANOMALY-05": {
    "patientId": "PAT-ANOMALY-05",
    "totalAlerts": 1,
    "criticalCount": 1,
    "warningCount": 0,
    "infoCount": 0,
    "alerts": [
      {
        "id": "CDS-INTEGRITY-MISSING-PRAC-MED-ANOMALY-DANGLING-PRAC",
        "severity": "CRITICAL",
        "category": "Data Conformance & Safety",
        "title": "Unresolved Prescribing Practitioner Reference",
        "summary": "Medication order references missing provider Practitioner/PRAC-99999. Clinical authorship cannot be authenticated.",
        "recommendation": "Reconcile practitioner registry identifier before transmitting clinical transfer bundle.",
        "guideline": "HL7 FHIR R4 US Core Implementation Guide (Author Attribution)",
        "target_resources": [
          {
            "resourceType": "MedicationRequest",
            "id": "MED-ANOMALY-DANGLING-PRAC",
            "display": "Active Medication Order"
          }
        ]
      }
    ]
  }
};

export const FALLBACK_TRANSFER = {
  "PAT-CHEN-03": {
    "patientId": "PAT-CHEN-03",
    "transferStatus": "TRANSFER READY",
    "isReady": true,
    "checks": [
      {
        "dimension": "Patient Demographics & Identity",
        "passed": true,
        "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
      },
      {
        "dimension": "Encounter Episode Context",
        "passed": true,
        "details": "1 Encounters verified with class & duration."
      },
      {
        "dimension": "Medication Prescriber Attribution",
        "passed": true,
        "details": "1 Medication orders verified against provider registry."
      },
      {
        "dimension": "Referential Completeness",
        "passed": true,
        "details": "0 unresolved reference(s) found in patient sub-graph."
      }
    ],
    "reasons": [
      "All essential clinical and referential transfer prerequisites satisfied."
    ],
    "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
  },
  "PAT-ROSS-04": {
    "patientId": "PAT-ROSS-04",
    "transferStatus": "TRANSFER READY",
    "isReady": true,
    "checks": [
      {
        "dimension": "Patient Demographics & Identity",
        "passed": true,
        "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
      },
      {
        "dimension": "Encounter Episode Context",
        "passed": true,
        "details": "1 Encounters verified with class & duration."
      },
      {
        "dimension": "Medication Prescriber Attribution",
        "passed": true,
        "details": "0 Medication orders verified against provider registry."
      },
      {
        "dimension": "Referential Completeness",
        "passed": true,
        "details": "0 unresolved reference(s) found in patient sub-graph."
      }
    ],
    "reasons": [
      "All essential clinical and referential transfer prerequisites satisfied."
    ],
    "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
  },
  "PAT-THORNE-02": {
    "patientId": "PAT-THORNE-02",
    "transferStatus": "TRANSFER READY",
    "isReady": true,
    "checks": [
      {
        "dimension": "Patient Demographics & Identity",
        "passed": true,
        "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
      },
      {
        "dimension": "Encounter Episode Context",
        "passed": true,
        "details": "2 Encounters verified with class & duration."
      },
      {
        "dimension": "Medication Prescriber Attribution",
        "passed": true,
        "details": "1 Medication orders verified against provider registry."
      },
      {
        "dimension": "Referential Completeness",
        "passed": true,
        "details": "0 unresolved reference(s) found in patient sub-graph."
      }
    ],
    "reasons": [
      "All essential clinical and referential transfer prerequisites satisfied."
    ],
    "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
  },
  "PAT-VANCE-01": {
    "patientId": "PAT-VANCE-01",
    "transferStatus": "TRANSFER READY",
    "isReady": true,
    "checks": [
      {
        "dimension": "Patient Demographics & Identity",
        "passed": true,
        "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
      },
      {
        "dimension": "Encounter Episode Context",
        "passed": true,
        "details": "5 Encounters verified with class & duration."
      },
      {
        "dimension": "Medication Prescriber Attribution",
        "passed": true,
        "details": "3 Medication orders verified against provider registry."
      },
      {
        "dimension": "Referential Completeness",
        "passed": true,
        "details": "0 unresolved reference(s) found in patient sub-graph."
      }
    ],
    "reasons": [
      "All essential clinical and referential transfer prerequisites satisfied."
    ],
    "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
  },
  "PAT-ANOMALY-05": {
    "patientId": "PAT-ANOMALY-05",
    "transferStatus": "TRANSFER BLOCKED",
    "isReady": false,
    "checks": [
      {
        "dimension": "Patient Demographics & Identity",
        "passed": false,
        "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2715"
      },
      {
        "dimension": "Encounter Episode Context",
        "passed": true,
        "details": "1 Encounters verified with class & duration."
      },
      {
        "dimension": "Medication Prescriber Attribution",
        "passed": false,
        "details": "1 Medication orders verified against provider registry."
      },
      {
        "dimension": "Referential Completeness",
        "passed": false,
        "details": "1 unresolved reference(s) found in patient sub-graph."
      }
    ],
    "reasons": [
      "Incomplete demographic identity attributes (missing MRN, name, or birthDate).",
      "Medication 'MED-ANOMALY-DANGLING-PRAC' references unverified prescriber 'Practitioner/PRAC-99999'.",
      "Contains 1 broken cross-resource pointers."
    ],
    "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
  }
};

export const FALLBACK_TIMELINES = {
  "PAT-CHEN-03": {
    "patientId": "PAT-CHEN-03",
    "totalEvents": 5,
    "events": [
      {
        "resourceType": "Patient",
        "resourceId": "PAT-CHEN-03",
        "resourceKey": "Patient/PAT-CHEN-03",
        "timestamp": "2013-07-22T00:00:00Z",
        "dateOnly": "2013-07-22",
        "title": "Patient Birth Date",
        "category": "demographic",
        "status": "recorded",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Recorded date of birth",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-CHEN-ASTHMA",
        "resourceKey": "Condition/COND-CHEN-ASTHMA",
        "timestamp": "2020-05-18T00:00:00Z",
        "dateOnly": "2020-05-18",
        "title": "Condition Diagnosed: Moderate Persistent Allergic Asthma",
        "category": "condition",
        "status": "active",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Active",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-CHEN-2024-09",
        "resourceKey": "Encounter/ENC-CHEN-2024-09",
        "timestamp": "2024-09-04T15:00:00Z",
        "dateOnly": "2024-09-04",
        "title": "Ambulatory Encounter: Pediatric Pulmonary Care & Spirometry Testing",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-CHEN-2024-09",
        "valueDisplay": null,
        "summary": "Encounter duration: 2024-09-04 to 2024-09-04",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-CHEN-FEV1",
        "resourceKey": "Observation/OBS-CHEN-FEV1",
        "timestamp": "2024-09-04T15:15:00Z",
        "dateOnly": "2024-09-04",
        "title": "Measurement: Forced Expiratory Volume in 1 Second (FEV1)",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-CHEN-2024-09",
        "valueDisplay": "1.78 L",
        "summary": "Observed value: 1.78 L",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-CHEN-ALBUTEROL",
        "resourceKey": "MedicationRequest/MED-CHEN-ALBUTEROL",
        "timestamp": "2024-09-04T15:30:00Z",
        "dateOnly": "2024-09-04",
        "title": "Rx Order: Albuterol HFA Inhaler 90 mcg/actuation",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-CHEN-2024-09",
        "valueDisplay": null,
        "summary": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing",
        "details": {}
      }
    ],
    "encounterGroups": [
      {
        "encounterId": "ENC-CHEN-2024-09",
        "title": "Pediatric Pulmonary Care & Spirometry Testing",
        "class": "Ambulatory",
        "start": "2024-09-04T15:00:00Z",
        "end": "2024-09-04T15:45:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-CHEN-2024-09",
            "resourceKey": "Encounter/ENC-CHEN-2024-09",
            "timestamp": "2024-09-04T15:00:00Z",
            "dateOnly": "2024-09-04",
            "title": "Ambulatory Encounter: Pediatric Pulmonary Care & Spirometry Testing",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-CHEN-2024-09",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-09-04 to 2024-09-04",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-CHEN-FEV1",
            "resourceKey": "Observation/OBS-CHEN-FEV1",
            "timestamp": "2024-09-04T15:15:00Z",
            "dateOnly": "2024-09-04",
            "title": "Measurement: Forced Expiratory Volume in 1 Second (FEV1)",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-CHEN-2024-09",
            "valueDisplay": "1.78 L",
            "summary": "Observed value: 1.78 L",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-CHEN-ALBUTEROL",
            "resourceKey": "MedicationRequest/MED-CHEN-ALBUTEROL",
            "timestamp": "2024-09-04T15:30:00Z",
            "dateOnly": "2024-09-04",
            "title": "Rx Order: Albuterol HFA Inhaler 90 mcg/actuation",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-CHEN-2024-09",
            "valueDisplay": null,
            "summary": "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing",
            "details": {}
          }
        ]
      }
    ],
    "series": {
      "Forced Expiratory Volume in 1 Second (FEV1)": [
        {
          "timestamp": "2024-09-04T15:15:00Z",
          "date": "2024-09-04",
          "value": 1.78,
          "unit": "L",
          "observationId": "OBS-CHEN-FEV1",
          "status": "final"
        }
      ]
    }
  },
  "PAT-ROSS-04": {
    "patientId": "PAT-ROSS-04",
    "totalEvents": 5,
    "events": [
      {
        "resourceType": "Patient",
        "resourceId": "PAT-ROSS-04",
        "resourceKey": "Patient/PAT-ROSS-04",
        "timestamp": "1972-02-14T00:00:00Z",
        "dateOnly": "1972-02-14",
        "title": "Patient Birth Date",
        "category": "demographic",
        "status": "recorded",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Recorded date of birth",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-ROSS-COLON",
        "resourceKey": "Condition/COND-ROSS-COLON",
        "timestamp": "2021-10-10T00:00:00Z",
        "dateOnly": "2021-10-10",
        "title": "Condition Diagnosed: Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)",
        "category": "condition",
        "status": "remission",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Remission",
        "details": {}
      },
      {
        "resourceType": "DiagnosticReport",
        "resourceId": "DR-ROSS-CT-SURV",
        "resourceKey": "DiagnosticReport/DR-ROSS-CT-SURV",
        "timestamp": "2025-01-12T11:00:00Z",
        "dateOnly": "2025-01-12",
        "title": "Diagnostic Report: Surveillance CT Chest/Abdomen/Pelvis",
        "category": "report",
        "status": "final",
        "encounterId": "ENC-ROSS-2025-01",
        "valueDisplay": null,
        "summary": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical...",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-ROSS-2025-01",
        "resourceKey": "Encounter/ENC-ROSS-2025-01",
        "timestamp": "2025-01-14T09:00:00Z",
        "dateOnly": "2025-01-14",
        "title": "Ambulatory Encounter: Medical Oncology 3-Year Post-Treatment Surveillance",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-ROSS-2025-01",
        "valueDisplay": null,
        "summary": "Encounter duration: 2025-01-14 to 2025-01-14",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-ROSS-CEA-2025",
        "resourceKey": "Observation/OBS-ROSS-CEA-2025",
        "timestamp": "2025-01-14T09:15:00Z",
        "dateOnly": "2025-01-14",
        "title": "Measurement: Carcinoembryonic Antigen (CEA)",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-ROSS-2025-01",
        "valueDisplay": "1.8 ng/mL",
        "summary": "Observed value: 1.8 ng/mL",
        "details": {}
      }
    ],
    "encounterGroups": [
      {
        "encounterId": "ENC-ROSS-2025-01",
        "title": "Medical Oncology 3-Year Post-Treatment Surveillance",
        "class": "Ambulatory",
        "start": "2025-01-14T09:00:00Z",
        "end": "2025-01-14T09:40:00Z",
        "events": [
          {
            "resourceType": "DiagnosticReport",
            "resourceId": "DR-ROSS-CT-SURV",
            "resourceKey": "DiagnosticReport/DR-ROSS-CT-SURV",
            "timestamp": "2025-01-12T11:00:00Z",
            "dateOnly": "2025-01-12",
            "title": "Diagnostic Report: Surveillance CT Chest/Abdomen/Pelvis",
            "category": "report",
            "status": "final",
            "encounterId": "ENC-ROSS-2025-01",
            "valueDisplay": null,
            "summary": "No evidence of local recurrence, metastatic lymphadenopathy, hepatic lesions, or pulmonary nodules. Stable post-surgical...",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-ROSS-2025-01",
            "resourceKey": "Encounter/ENC-ROSS-2025-01",
            "timestamp": "2025-01-14T09:00:00Z",
            "dateOnly": "2025-01-14",
            "title": "Ambulatory Encounter: Medical Oncology 3-Year Post-Treatment Surveillance",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-ROSS-2025-01",
            "valueDisplay": null,
            "summary": "Encounter duration: 2025-01-14 to 2025-01-14",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-ROSS-CEA-2025",
            "resourceKey": "Observation/OBS-ROSS-CEA-2025",
            "timestamp": "2025-01-14T09:15:00Z",
            "dateOnly": "2025-01-14",
            "title": "Measurement: Carcinoembryonic Antigen (CEA)",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-ROSS-2025-01",
            "valueDisplay": "1.8 ng/mL",
            "summary": "Observed value: 1.8 ng/mL",
            "details": {}
          }
        ]
      }
    ],
    "series": {
      "Carcinoembryonic Antigen (CEA)": [
        {
          "timestamp": "2025-01-14T09:15:00Z",
          "date": "2025-01-14",
          "value": 1.8,
          "unit": "ng/mL",
          "observationId": "OBS-ROSS-CEA-2025",
          "status": "final"
        }
      ]
    }
  },
  "PAT-THORNE-02": {
    "patientId": "PAT-THORNE-02",
    "totalEvents": 12,
    "events": [
      {
        "resourceType": "Patient",
        "resourceId": "PAT-THORNE-02",
        "resourceKey": "Patient/PAT-THORNE-02",
        "timestamp": "1966-11-28T00:00:00Z",
        "dateOnly": "1966-11-28",
        "title": "Patient Birth Date",
        "category": "demographic",
        "status": "recorded",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Recorded date of birth",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-THORNE-CAD",
        "resourceKey": "Condition/COND-THORNE-CAD",
        "timestamp": "2024-04-03T00:00:00Z",
        "dateOnly": "2024-04-03",
        "title": "Condition Diagnosed: Severe Triple Vessel Coronary Artery Disease",
        "category": "condition",
        "status": "active",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Active",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-THORNE-STEMI",
        "resourceKey": "Condition/COND-THORNE-STEMI",
        "timestamp": "2024-04-03T05:15:00Z",
        "dateOnly": "2024-04-03",
        "title": "Condition Diagnosed: Acute Anteroseptal ST-Elevation Myocardial Infarction",
        "category": "condition",
        "status": "resolved",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Resolved",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-THORNE-2024-04",
        "resourceKey": "Encounter/ENC-THORNE-2024-04",
        "timestamp": "2024-04-03T06:00:00Z",
        "dateOnly": "2024-04-03",
        "title": "Inpatient encounter Encounter: Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": null,
        "summary": "Encounter duration: 2024-04-03 to 2024-04-10",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-THORNE-TROP-1",
        "resourceKey": "Observation/OBS-THORNE-TROP-1",
        "timestamp": "2024-04-03T06:30:00Z",
        "dateOnly": "2024-04-03",
        "title": "Measurement: High Sensitivity Cardiac Troponin I",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": "1.45 ng/mL",
        "summary": "Observed value: 1.45 ng/mL",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-THORNE-TROP-2",
        "resourceKey": "Observation/OBS-THORNE-TROP-2",
        "timestamp": "2024-04-03T12:00:00Z",
        "dateOnly": "2024-04-03",
        "title": "Measurement: High Sensitivity Cardiac Troponin I",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": "18.2 ng/mL",
        "summary": "Observed value: 18.2 ng/mL",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-THORNE-TROP-3",
        "resourceKey": "Observation/OBS-THORNE-TROP-3",
        "timestamp": "2024-04-04T06:00:00Z",
        "dateOnly": "2024-04-04",
        "title": "Measurement: High Sensitivity Cardiac Troponin I",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": "8.4 ng/mL",
        "summary": "Observed value: 8.4 ng/mL",
        "details": {}
      },
      {
        "resourceType": "Procedure",
        "resourceId": "PROC-THORNE-CABG",
        "resourceKey": "Procedure/PROC-THORNE-CABG",
        "timestamp": "2024-04-04T07:30:00Z",
        "dateOnly": "2024-04-04",
        "title": "Procedure: Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
        "category": "procedure",
        "status": "completed",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": null,
        "summary": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass.",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-THORNE-TROP-4",
        "resourceKey": "Observation/OBS-THORNE-TROP-4",
        "timestamp": "2024-04-08T08:00:00Z",
        "dateOnly": "2024-04-08",
        "title": "Measurement: High Sensitivity Cardiac Troponin I",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": "0.85 ng/mL",
        "summary": "Observed value: 0.85 ng/mL",
        "details": {}
      },
      {
        "resourceType": "DiagnosticReport",
        "resourceId": "DR-THORNE-ECHO",
        "resourceKey": "DiagnosticReport/DR-THORNE-ECHO",
        "timestamp": "2024-04-08T10:00:00Z",
        "dateOnly": "2024-04-08",
        "title": "Diagnostic Report: Post-Operative Transthoracic Echocardiogram",
        "category": "report",
        "status": "final",
        "encounterId": "ENC-THORNE-2024-04",
        "valueDisplay": null,
        "summary": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contra...",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-THORNE-2024-10",
        "resourceKey": "Encounter/ENC-THORNE-2024-10",
        "timestamp": "2024-10-15T13:30:00Z",
        "dateOnly": "2024-10-15",
        "title": "Ambulatory Encounter: Outpatient Cardiology 6-Month Post-Surgical Follow-up",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-THORNE-2024-10",
        "valueDisplay": null,
        "summary": "Encounter duration: 2024-10-15 to 2024-10-15",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-THORNE-ATORVASTATIN",
        "resourceKey": "MedicationRequest/MED-THORNE-ATORVASTATIN",
        "timestamp": "2024-10-15T14:00:00Z",
        "dateOnly": "2024-10-15",
        "title": "Rx Order: Atorvastatin 80 mg Oral Tablet",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-THORNE-2024-10",
        "valueDisplay": null,
        "summary": "Take 1 tablet by mouth daily at bedtime",
        "details": {}
      }
    ],
    "encounterGroups": [
      {
        "encounterId": "ENC-THORNE-2024-10",
        "title": "Outpatient Cardiology 6-Month Post-Surgical Follow-up",
        "class": "Ambulatory",
        "start": "2024-10-15T13:30:00Z",
        "end": "2024-10-15T14:15:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-THORNE-2024-10",
            "resourceKey": "Encounter/ENC-THORNE-2024-10",
            "timestamp": "2024-10-15T13:30:00Z",
            "dateOnly": "2024-10-15",
            "title": "Ambulatory Encounter: Outpatient Cardiology 6-Month Post-Surgical Follow-up",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-THORNE-2024-10",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-10-15 to 2024-10-15",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-THORNE-ATORVASTATIN",
            "resourceKey": "MedicationRequest/MED-THORNE-ATORVASTATIN",
            "timestamp": "2024-10-15T14:00:00Z",
            "dateOnly": "2024-10-15",
            "title": "Rx Order: Atorvastatin 80 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-THORNE-2024-10",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth daily at bedtime",
            "details": {}
          }
        ]
      },
      {
        "encounterId": "ENC-THORNE-2024-04",
        "title": "Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
        "class": "inpatient encounter",
        "start": "2024-04-03T06:00:00Z",
        "end": "2024-04-10T12:00:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-THORNE-2024-04",
            "resourceKey": "Encounter/ENC-THORNE-2024-04",
            "timestamp": "2024-04-03T06:00:00Z",
            "dateOnly": "2024-04-03",
            "title": "Inpatient encounter Encounter: Emergency Inpatient Admission for STEMI and Urgent Surgical Revascularization",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-04-03 to 2024-04-10",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-THORNE-TROP-1",
            "resourceKey": "Observation/OBS-THORNE-TROP-1",
            "timestamp": "2024-04-03T06:30:00Z",
            "dateOnly": "2024-04-03",
            "title": "Measurement: High Sensitivity Cardiac Troponin I",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": "1.45 ng/mL",
            "summary": "Observed value: 1.45 ng/mL",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-THORNE-TROP-2",
            "resourceKey": "Observation/OBS-THORNE-TROP-2",
            "timestamp": "2024-04-03T12:00:00Z",
            "dateOnly": "2024-04-03",
            "title": "Measurement: High Sensitivity Cardiac Troponin I",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": "18.2 ng/mL",
            "summary": "Observed value: 18.2 ng/mL",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-THORNE-TROP-3",
            "resourceKey": "Observation/OBS-THORNE-TROP-3",
            "timestamp": "2024-04-04T06:00:00Z",
            "dateOnly": "2024-04-04",
            "title": "Measurement: High Sensitivity Cardiac Troponin I",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": "8.4 ng/mL",
            "summary": "Observed value: 8.4 ng/mL",
            "details": {}
          },
          {
            "resourceType": "Procedure",
            "resourceId": "PROC-THORNE-CABG",
            "resourceKey": "Procedure/PROC-THORNE-CABG",
            "timestamp": "2024-04-04T07:30:00Z",
            "dateOnly": "2024-04-04",
            "title": "Procedure: Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
            "category": "procedure",
            "status": "completed",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": null,
            "summary": "Successful triple revascularization. Uncomplicated weaning from cardiopulmonary bypass.",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-THORNE-TROP-4",
            "resourceKey": "Observation/OBS-THORNE-TROP-4",
            "timestamp": "2024-04-08T08:00:00Z",
            "dateOnly": "2024-04-08",
            "title": "Measurement: High Sensitivity Cardiac Troponin I",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": "0.85 ng/mL",
            "summary": "Observed value: 0.85 ng/mL",
            "details": {}
          },
          {
            "resourceType": "DiagnosticReport",
            "resourceId": "DR-THORNE-ECHO",
            "resourceKey": "DiagnosticReport/DR-THORNE-ECHO",
            "timestamp": "2024-04-08T10:00:00Z",
            "dateOnly": "2024-04-08",
            "title": "Diagnostic Report: Post-Operative Transthoracic Echocardiogram",
            "category": "report",
            "status": "final",
            "encounterId": "ENC-THORNE-2024-04",
            "valueDisplay": null,
            "summary": "Left ventricular ejection fraction estimated at 48%. Akinesis of apical anterior wall with good basal and lateral contra...",
            "details": {}
          }
        ]
      }
    ],
    "series": {
      "High Sensitivity Cardiac Troponin I": [
        {
          "timestamp": "2024-04-03T06:30:00Z",
          "date": "2024-04-03",
          "value": 1.45,
          "unit": "ng/mL",
          "observationId": "OBS-THORNE-TROP-1",
          "status": "final"
        },
        {
          "timestamp": "2024-04-03T12:00:00Z",
          "date": "2024-04-03",
          "value": 18.2,
          "unit": "ng/mL",
          "observationId": "OBS-THORNE-TROP-2",
          "status": "final"
        },
        {
          "timestamp": "2024-04-04T06:00:00Z",
          "date": "2024-04-04",
          "value": 8.4,
          "unit": "ng/mL",
          "observationId": "OBS-THORNE-TROP-3",
          "status": "final"
        },
        {
          "timestamp": "2024-04-08T08:00:00Z",
          "date": "2024-04-08",
          "value": 0.85,
          "unit": "ng/mL",
          "observationId": "OBS-THORNE-TROP-4",
          "status": "final"
        }
      ]
    }
  },
  "PAT-VANCE-01": {
    "patientId": "PAT-VANCE-01",
    "totalEvents": 30,
    "events": [
      {
        "resourceType": "Patient",
        "resourceId": "PAT-VANCE-01",
        "resourceKey": "Patient/PAT-VANCE-01",
        "timestamp": "1958-04-12T00:00:00Z",
        "dateOnly": "1958-04-12",
        "title": "Patient Birth Date",
        "category": "demographic",
        "status": "recorded",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Recorded date of birth",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-VANCE-T2D",
        "resourceKey": "Condition/COND-VANCE-T2D",
        "timestamp": "2018-09-15T00:00:00Z",
        "dateOnly": "2018-09-15",
        "title": "Condition Diagnosed: Type 2 Diabetes Mellitus",
        "category": "condition",
        "status": "active",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Active",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-VANCE-HTN",
        "resourceKey": "Condition/COND-VANCE-HTN",
        "timestamp": "2019-03-10T00:00:00Z",
        "dateOnly": "2019-03-10",
        "title": "Condition Diagnosed: Essential Hypertension",
        "category": "condition",
        "status": "active",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Active",
        "details": {}
      },
      {
        "resourceType": "Condition",
        "resourceId": "COND-VANCE-CKD",
        "resourceKey": "Condition/COND-VANCE-CKD",
        "timestamp": "2023-01-20T00:00:00Z",
        "dateOnly": "2023-01-20",
        "title": "Condition Diagnosed: Diabetic Chronic Kidney Disease, Stage 3a",
        "category": "condition",
        "status": "active",
        "encounterId": null,
        "valueDisplay": null,
        "summary": "Clinical Status: Active",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-VANCE-2023-03",
        "resourceKey": "Encounter/ENC-VANCE-2023-03",
        "timestamp": "2023-03-14T09:30:00Z",
        "dateOnly": "2023-03-14",
        "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": null,
        "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-BP-1",
        "resourceKey": "Observation/OBS-VANCE-BP-1",
        "timestamp": "2023-03-14T09:35:00Z",
        "dateOnly": "2023-03-14",
        "title": "Measurement: Systolic Blood Pressure",
        "category": "vital-signs",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": "148.0 mmHg",
        "summary": "Observed value: 148.0 mmHg",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-A1C-1",
        "resourceKey": "Observation/OBS-VANCE-A1C-1",
        "timestamp": "2023-03-14T09:45:00Z",
        "dateOnly": "2023-03-14",
        "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": "9.4 %",
        "summary": "Observed value: 9.4 %",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-EGFR-1",
        "resourceKey": "Observation/OBS-VANCE-EGFR-1",
        "timestamp": "2023-03-14T09:45:00Z",
        "dateOnly": "2023-03-14",
        "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": "58.0 mL/min/1.73m2",
        "summary": "Observed value: 58.0 mL/min/1.73m2",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-CREAT-1",
        "resourceKey": "Observation/OBS-VANCE-CREAT-1",
        "timestamp": "2023-03-14T09:45:00Z",
        "dateOnly": "2023-03-14",
        "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": "1.32 mg/dL",
        "summary": "Observed value: 1.32 mg/dL",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-VANCE-METFORMIN",
        "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
        "timestamp": "2023-03-14T10:30:00Z",
        "dateOnly": "2023-03-14",
        "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": null,
        "summary": "Take 1 tablet by mouth twice daily with meals",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-VANCE-LISINOPRIL",
        "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
        "timestamp": "2023-03-14T10:35:00Z",
        "dateOnly": "2023-03-14",
        "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-VANCE-2023-03",
        "valueDisplay": null,
        "summary": "Take 1 tablet by mouth daily in the morning",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-VANCE-2023-09",
        "resourceKey": "Encounter/ENC-VANCE-2023-09",
        "timestamp": "2023-09-18T14:00:00Z",
        "dateOnly": "2023-09-18",
        "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-VANCE-2023-09",
        "valueDisplay": null,
        "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-BP-2",
        "resourceKey": "Observation/OBS-VANCE-BP-2",
        "timestamp": "2023-09-18T14:05:00Z",
        "dateOnly": "2023-09-18",
        "title": "Measurement: Systolic Blood Pressure",
        "category": "vital-signs",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-09",
        "valueDisplay": "138.0 mmHg",
        "summary": "Observed value: 138.0 mmHg",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-A1C-2",
        "resourceKey": "Observation/OBS-VANCE-A1C-2",
        "timestamp": "2023-09-18T14:15:00Z",
        "dateOnly": "2023-09-18",
        "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-09",
        "valueDisplay": "8.3 %",
        "summary": "Observed value: 8.3 %",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-EGFR-2",
        "resourceKey": "Observation/OBS-VANCE-EGFR-2",
        "timestamp": "2023-09-18T14:15:00Z",
        "dateOnly": "2023-09-18",
        "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2023-09",
        "valueDisplay": "56.0 mL/min/1.73m2",
        "summary": "Observed value: 56.0 mL/min/1.73m2",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-VANCE-2024-02",
        "resourceKey": "Encounter/ENC-VANCE-2024-02",
        "timestamp": "2024-02-11T20:15:00Z",
        "dateOnly": "2024-02-11",
        "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-VANCE-2024-02",
        "valueDisplay": null,
        "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-BP-3",
        "resourceKey": "Observation/OBS-VANCE-BP-3",
        "timestamp": "2024-02-11T20:20:00Z",
        "dateOnly": "2024-02-11",
        "title": "Measurement: Systolic Blood Pressure",
        "category": "vital-signs",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-02",
        "valueDisplay": "154.0 mmHg",
        "summary": "Observed value: 154.0 mmHg",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-GLUC-EMER",
        "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
        "timestamp": "2024-02-11T20:30:00Z",
        "dateOnly": "2024-02-11",
        "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-02",
        "valueDisplay": "342.0 mg/dL",
        "summary": "Observed value: 342.0 mg/dL",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-A1C-3",
        "resourceKey": "Observation/OBS-VANCE-A1C-3",
        "timestamp": "2024-02-11T20:30:00Z",
        "dateOnly": "2024-02-11",
        "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-02",
        "valueDisplay": "8.8 %",
        "summary": "Observed value: 8.8 %",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-VANCE-2024-08",
        "resourceKey": "Encounter/ENC-VANCE-2024-08",
        "timestamp": "2024-08-22T11:00:00Z",
        "dateOnly": "2024-08-22",
        "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": null,
        "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-EGFR-3",
        "resourceKey": "Observation/OBS-VANCE-EGFR-3",
        "timestamp": "2024-08-22T11:15:00Z",
        "dateOnly": "2024-08-22",
        "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": "54.0 mL/min/1.73m2",
        "summary": "Observed value: 54.0 mL/min/1.73m2",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-ALB-CREAT",
        "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
        "timestamp": "2024-08-22T11:15:00Z",
        "dateOnly": "2024-08-22",
        "title": "Measurement: Microalbumin/Creatinine in Urine",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": "185.0 mg/g",
        "summary": "Observed value: 185.0 mg/g",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-A1C-4",
        "resourceKey": "Observation/OBS-VANCE-A1C-4",
        "timestamp": "2024-08-22T11:15:00Z",
        "dateOnly": "2024-08-22",
        "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": "7.6 %",
        "summary": "Observed value: 7.6 %",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
        "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
        "timestamp": "2024-08-22T11:45:00Z",
        "dateOnly": "2024-08-22",
        "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": null,
        "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
        "details": {}
      },
      {
        "resourceType": "DiagnosticReport",
        "resourceId": "DR-VANCE-RENAL-US",
        "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
        "timestamp": "2024-08-23T09:00:00Z",
        "dateOnly": "2024-08-23",
        "title": "Diagnostic Report: Renal Ultrasound Bilateral",
        "category": "report",
        "status": "final",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": null,
        "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
        "details": {}
      },
      {
        "resourceType": "Procedure",
        "resourceId": "PROC-VANCE-EYE-EXAM",
        "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
        "timestamp": "2024-08-25T13:30:00Z",
        "dateOnly": "2024-08-25",
        "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
        "category": "procedure",
        "status": "completed",
        "encounterId": "ENC-VANCE-2024-08",
        "valueDisplay": null,
        "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-VANCE-2025-05",
        "resourceKey": "Encounter/ENC-VANCE-2025-05",
        "timestamp": "2025-05-10T10:00:00Z",
        "dateOnly": "2025-05-10",
        "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-VANCE-2025-05",
        "valueDisplay": null,
        "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-BP-4",
        "resourceKey": "Observation/OBS-VANCE-BP-4",
        "timestamp": "2025-05-10T10:05:00Z",
        "dateOnly": "2025-05-10",
        "title": "Measurement: Systolic Blood Pressure",
        "category": "vital-signs",
        "status": "final",
        "encounterId": "ENC-VANCE-2025-05",
        "valueDisplay": "126.0 mmHg",
        "summary": "Observed value: 126.0 mmHg",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-A1C-5",
        "resourceKey": "Observation/OBS-VANCE-A1C-5",
        "timestamp": "2025-05-10T10:15:00Z",
        "dateOnly": "2025-05-10",
        "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2025-05",
        "valueDisplay": "7.0 %",
        "summary": "Observed value: 7.0 %",
        "details": {}
      },
      {
        "resourceType": "Observation",
        "resourceId": "OBS-VANCE-EGFR-4",
        "resourceKey": "Observation/OBS-VANCE-EGFR-4",
        "timestamp": "2025-05-10T10:15:00Z",
        "dateOnly": "2025-05-10",
        "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
        "category": "laboratory",
        "status": "final",
        "encounterId": "ENC-VANCE-2025-05",
        "valueDisplay": "57.0 mL/min/1.73m2",
        "summary": "Observed value: 57.0 mL/min/1.73m2",
        "details": {}
      }
    ],
    "encounterGroups": [
      {
        "encounterId": "ENC-VANCE-2025-05",
        "title": "Annual Longitudinal Care Plan Review",
        "class": "ambulatory",
        "start": "2025-05-10T10:00:00Z",
        "end": "2025-05-10T10:45:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2025-05",
            "resourceKey": "Encounter/ENC-VANCE-2025-05",
            "timestamp": "2025-05-10T10:00:00Z",
            "dateOnly": "2025-05-10",
            "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": null,
            "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-4",
            "resourceKey": "Observation/OBS-VANCE-BP-4",
            "timestamp": "2025-05-10T10:05:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "126.0 mmHg",
            "summary": "Observed value: 126.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-5",
            "resourceKey": "Observation/OBS-VANCE-A1C-5",
            "timestamp": "2025-05-10T10:15:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "7.0 %",
            "summary": "Observed value: 7.0 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-4",
            "resourceKey": "Observation/OBS-VANCE-EGFR-4",
            "timestamp": "2025-05-10T10:15:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "57.0 mL/min/1.73m2",
            "summary": "Observed value: 57.0 mL/min/1.73m2",
            "details": {}
          }
        ]
      },
      {
        "encounterId": "ENC-VANCE-2024-08",
        "title": "Nephrology Consultation & Renal Staging",
        "class": "ambulatory",
        "start": "2024-08-22T11:00:00Z",
        "end": "2024-08-22T11:50:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2024-08",
            "resourceKey": "Encounter/ENC-VANCE-2024-08",
            "timestamp": "2024-08-22T11:00:00Z",
            "dateOnly": "2024-08-22",
            "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-3",
            "resourceKey": "Observation/OBS-VANCE-EGFR-3",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "54.0 mL/min/1.73m2",
            "summary": "Observed value: 54.0 mL/min/1.73m2",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-ALB-CREAT",
            "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Microalbumin/Creatinine in Urine",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "185.0 mg/g",
            "summary": "Observed value: 185.0 mg/g",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-4",
            "resourceKey": "Observation/OBS-VANCE-A1C-4",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "7.6 %",
            "summary": "Observed value: 7.6 %",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
            "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
            "timestamp": "2024-08-22T11:45:00Z",
            "dateOnly": "2024-08-22",
            "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
            "details": {}
          },
          {
            "resourceType": "DiagnosticReport",
            "resourceId": "DR-VANCE-RENAL-US",
            "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
            "timestamp": "2024-08-23T09:00:00Z",
            "dateOnly": "2024-08-23",
            "title": "Diagnostic Report: Renal Ultrasound Bilateral",
            "category": "report",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
            "details": {}
          },
          {
            "resourceType": "Procedure",
            "resourceId": "PROC-VANCE-EYE-EXAM",
            "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
            "timestamp": "2024-08-25T13:30:00Z",
            "dateOnly": "2024-08-25",
            "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
            "category": "procedure",
            "status": "completed",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
            "details": {}
          }
        ]
      },
      {
        "encounterId": "ENC-VANCE-2024-02",
        "title": "Emergency Department Acute Hyperglycemia Evaluation",
        "class": "emergency",
        "start": "2024-02-11T20:15:00Z",
        "end": "2024-02-12T04:30:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2024-02",
            "resourceKey": "Encounter/ENC-VANCE-2024-02",
            "timestamp": "2024-02-11T20:15:00Z",
            "dateOnly": "2024-02-11",
            "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-3",
            "resourceKey": "Observation/OBS-VANCE-BP-3",
            "timestamp": "2024-02-11T20:20:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "154.0 mmHg",
            "summary": "Observed value: 154.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-GLUC-EMER",
            "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
            "timestamp": "2024-02-11T20:30:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "342.0 mg/dL",
            "summary": "Observed value: 342.0 mg/dL",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-3",
            "resourceKey": "Observation/OBS-VANCE-A1C-3",
            "timestamp": "2024-02-11T20:30:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "8.8 %",
            "summary": "Observed value: 8.8 %",
            "details": {}
          }
        ]
      },
      {
        "encounterId": "ENC-VANCE-2023-09",
        "title": "Endocrinology 6-Month Treatment Assessment",
        "class": "ambulatory",
        "start": "2023-09-18T14:00:00Z",
        "end": "2023-09-18T14:40:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2023-09",
            "resourceKey": "Encounter/ENC-VANCE-2023-09",
            "timestamp": "2023-09-18T14:00:00Z",
            "dateOnly": "2023-09-18",
            "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": null,
            "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-2",
            "resourceKey": "Observation/OBS-VANCE-BP-2",
            "timestamp": "2023-09-18T14:05:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "138.0 mmHg",
            "summary": "Observed value: 138.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-2",
            "resourceKey": "Observation/OBS-VANCE-A1C-2",
            "timestamp": "2023-09-18T14:15:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "8.3 %",
            "summary": "Observed value: 8.3 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-2",
            "resourceKey": "Observation/OBS-VANCE-EGFR-2",
            "timestamp": "2023-09-18T14:15:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "56.0 mL/min/1.73m2",
            "summary": "Observed value: 56.0 mL/min/1.73m2",
            "details": {}
          }
        ]
      },
      {
        "encounterId": "ENC-VANCE-2023-03",
        "title": "Endocrinology Comprehensive Initial Review",
        "class": "ambulatory",
        "start": "2023-03-14T09:30:00Z",
        "end": "2023-03-14T10:45:00Z",
        "events": [
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2023-03",
            "resourceKey": "Encounter/ENC-VANCE-2023-03",
            "timestamp": "2023-03-14T09:30:00Z",
            "dateOnly": "2023-03-14",
            "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-1",
            "resourceKey": "Observation/OBS-VANCE-BP-1",
            "timestamp": "2023-03-14T09:35:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "148.0 mmHg",
            "summary": "Observed value: 148.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-1",
            "resourceKey": "Observation/OBS-VANCE-A1C-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "9.4 %",
            "summary": "Observed value: 9.4 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-1",
            "resourceKey": "Observation/OBS-VANCE-EGFR-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "58.0 mL/min/1.73m2",
            "summary": "Observed value: 58.0 mL/min/1.73m2",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-CREAT-1",
            "resourceKey": "Observation/OBS-VANCE-CREAT-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "1.32 mg/dL",
            "summary": "Observed value: 1.32 mg/dL",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-METFORMIN",
            "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
            "timestamp": "2023-03-14T10:30:00Z",
            "dateOnly": "2023-03-14",
            "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth twice daily with meals",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-LISINOPRIL",
            "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
            "timestamp": "2023-03-14T10:35:00Z",
            "dateOnly": "2023-03-14",
            "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth daily in the morning",
            "details": {}
          }
        ]
      }
    ],
    "series": {
      "Hemoglobin A1c/Hemoglobin.total in Blood": [
        {
          "timestamp": "2023-03-14T09:45:00Z",
          "date": "2023-03-14",
          "value": 9.4,
          "unit": "%",
          "observationId": "OBS-VANCE-A1C-1",
          "status": "final"
        },
        {
          "timestamp": "2023-09-18T14:15:00Z",
          "date": "2023-09-18",
          "value": 8.3,
          "unit": "%",
          "observationId": "OBS-VANCE-A1C-2",
          "status": "final"
        },
        {
          "timestamp": "2024-02-11T20:30:00Z",
          "date": "2024-02-11",
          "value": 8.8,
          "unit": "%",
          "observationId": "OBS-VANCE-A1C-3",
          "status": "final"
        },
        {
          "timestamp": "2024-08-22T11:15:00Z",
          "date": "2024-08-22",
          "value": 7.6,
          "unit": "%",
          "observationId": "OBS-VANCE-A1C-4",
          "status": "final"
        },
        {
          "timestamp": "2025-05-10T10:15:00Z",
          "date": "2025-05-10",
          "value": 7.0,
          "unit": "%",
          "observationId": "OBS-VANCE-A1C-5",
          "status": "final"
        }
      ],
      "Glomerular filtration rate/1.73 sq M.predicted": [
        {
          "timestamp": "2023-03-14T09:45:00Z",
          "date": "2023-03-14",
          "value": 58.0,
          "unit": "mL/min/1.73m2",
          "observationId": "OBS-VANCE-EGFR-1",
          "status": "final"
        },
        {
          "timestamp": "2023-09-18T14:15:00Z",
          "date": "2023-09-18",
          "value": 56.0,
          "unit": "mL/min/1.73m2",
          "observationId": "OBS-VANCE-EGFR-2",
          "status": "final"
        },
        {
          "timestamp": "2024-08-22T11:15:00Z",
          "date": "2024-08-22",
          "value": 54.0,
          "unit": "mL/min/1.73m2",
          "observationId": "OBS-VANCE-EGFR-3",
          "status": "final"
        },
        {
          "timestamp": "2025-05-10T10:15:00Z",
          "date": "2025-05-10",
          "value": 57.0,
          "unit": "mL/min/1.73m2",
          "observationId": "OBS-VANCE-EGFR-4",
          "status": "final"
        }
      ],
      "Systolic Blood Pressure": [
        {
          "timestamp": "2023-03-14T09:35:00Z",
          "date": "2023-03-14",
          "value": 148.0,
          "unit": "mmHg",
          "observationId": "OBS-VANCE-BP-1",
          "status": "final"
        },
        {
          "timestamp": "2023-09-18T14:05:00Z",
          "date": "2023-09-18",
          "value": 138.0,
          "unit": "mmHg",
          "observationId": "OBS-VANCE-BP-2",
          "status": "final"
        },
        {
          "timestamp": "2024-02-11T20:20:00Z",
          "date": "2024-02-11",
          "value": 154.0,
          "unit": "mmHg",
          "observationId": "OBS-VANCE-BP-3",
          "status": "final"
        },
        {
          "timestamp": "2025-05-10T10:05:00Z",
          "date": "2025-05-10",
          "value": 126.0,
          "unit": "mmHg",
          "observationId": "OBS-VANCE-BP-4",
          "status": "final"
        }
      ],
      "Creatinine [Mass/volume] in Serum or Plasma": [
        {
          "timestamp": "2023-03-14T09:45:00Z",
          "date": "2023-03-14",
          "value": 1.32,
          "unit": "mg/dL",
          "observationId": "OBS-VANCE-CREAT-1",
          "status": "final"
        }
      ],
      "Glucose [Mass/volume] in Serum or Plasma": [
        {
          "timestamp": "2024-02-11T20:30:00Z",
          "date": "2024-02-11",
          "value": 342.0,
          "unit": "mg/dL",
          "observationId": "OBS-VANCE-GLUC-EMER",
          "status": "final"
        }
      ],
      "Microalbumin/Creatinine in Urine": [
        {
          "timestamp": "2024-08-22T11:15:00Z",
          "date": "2024-08-22",
          "value": 185.0,
          "unit": "mg/g",
          "observationId": "OBS-VANCE-ALB-CREAT",
          "status": "final"
        }
      ]
    }
  },
  "PAT-ANOMALY-05": {
    "patientId": "PAT-ANOMALY-05",
    "totalEvents": 3,
    "events": [
      {
        "resourceType": "Observation",
        "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
        "resourceKey": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
        "timestamp": "2025-01-15T08:05:00Z",
        "dateOnly": "2025-01-15",
        "title": "Measurement: Serum Sodium (Conflicting Ingestion Copy)",
        "category": "laboratory",
        "status": "preliminary",
        "encounterId": "ENC-ANOMALY-01",
        "valueDisplay": "144 mmol/L",
        "summary": "Observed value: 144 mmol/L",
        "details": {}
      },
      {
        "resourceType": "Encounter",
        "resourceId": "ENC-ANOMALY-01",
        "resourceKey": "Encounter/ENC-ANOMALY-01",
        "timestamp": "2025-02-10T10:00:00Z",
        "dateOnly": "2025-02-10",
        "title": "Ambulatory Encounter: Encounter",
        "category": "encounter",
        "status": "finished",
        "encounterId": "ENC-ANOMALY-01",
        "valueDisplay": null,
        "summary": "Encounter duration: 2025-02-10 to 2025-02-10",
        "details": {}
      },
      {
        "resourceType": "MedicationRequest",
        "resourceId": "MED-ANOMALY-DANGLING-PRAC",
        "resourceKey": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
        "timestamp": "2025-02-10T10:30:00Z",
        "dateOnly": "2025-02-10",
        "title": "Rx Order: Amlodipine 5 mg Oral Tablet",
        "category": "medication",
        "status": "active",
        "encounterId": "ENC-ANOMALY-01",
        "valueDisplay": null,
        "summary": "Status: active",
        "details": {}
      }
    ],
    "encounterGroups": [
      {
        "encounterId": "ENC-ANOMALY-01",
        "title": "Encounter ENC-ANOMALY-01",
        "class": "Ambulatory",
        "start": "2025-02-10T10:00:00Z",
        "end": "2025-02-10T11:00:00Z",
        "events": [
          {
            "resourceType": "Observation",
            "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
            "resourceKey": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
            "timestamp": "2025-01-15T08:05:00Z",
            "dateOnly": "2025-01-15",
            "title": "Measurement: Serum Sodium (Conflicting Ingestion Copy)",
            "category": "laboratory",
            "status": "preliminary",
            "encounterId": "ENC-ANOMALY-01",
            "valueDisplay": "144 mmol/L",
            "summary": "Observed value: 144 mmol/L",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-ANOMALY-01",
            "resourceKey": "Encounter/ENC-ANOMALY-01",
            "timestamp": "2025-02-10T10:00:00Z",
            "dateOnly": "2025-02-10",
            "title": "Ambulatory Encounter: Encounter",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-ANOMALY-01",
            "valueDisplay": null,
            "summary": "Encounter duration: 2025-02-10 to 2025-02-10",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-ANOMALY-DANGLING-PRAC",
            "resourceKey": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
            "timestamp": "2025-02-10T10:30:00Z",
            "dateOnly": "2025-02-10",
            "title": "Rx Order: Amlodipine 5 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-ANOMALY-01",
            "valueDisplay": null,
            "summary": "Status: active",
            "details": {}
          }
        ]
      }
    ],
    "series": {
      "Serum Sodium (Conflicting Ingestion Copy)": [
        {
          "timestamp": "2025-01-15T08:05:00Z",
          "date": "2025-01-15",
          "value": 144,
          "unit": "mmol/L",
          "observationId": "OBS-ANOMALY-TEMPORAL-CLASH",
          "status": "preliminary"
        }
      ]
    }
  }
};

export const FALLBACK_GRAPH = {
  "nodes": [
    {
      "id": "Organization/ORG-METRO",
      "resourceId": "ORG-METRO",
      "resourceType": "Organization",
      "title": "Metropolitan Academic Health System",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 15,
      "inDegree": 15,
      "outDegree": 0
    },
    {
      "id": "Organization/ORG-PRECISION-LAB",
      "resourceId": "ORG-PRECISION-LAB",
      "resourceType": "Organization",
      "title": "Precision Diagnostic Laboratories",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 16,
      "inDegree": 16,
      "outDegree": 0
    },
    {
      "id": "Practitioner/PRAC-JENKINS-01",
      "resourceId": "PRAC-JENKINS-01",
      "resourceType": "Practitioner",
      "title": "Dr. Sarah Jenkins",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 7,
      "inDegree": 7,
      "outDegree": 0
    },
    {
      "id": "Practitioner/PRAC-CHEN-02",
      "resourceId": "PRAC-CHEN-02",
      "resourceType": "Practitioner",
      "title": "Dr. Robert K. Chen",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 2,
      "inDegree": 2,
      "outDegree": 0
    },
    {
      "id": "Practitioner/PRAC-ROSTOVA-03",
      "resourceId": "PRAC-ROSTOVA-03",
      "resourceType": "Practitioner",
      "title": "Dr. Elena Rostova",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 2,
      "inDegree": 2,
      "outDegree": 0
    },
    {
      "id": "Practitioner/PRAC-BRODY-04",
      "resourceId": "PRAC-BRODY-04",
      "resourceType": "Practitioner",
      "title": "Dr. Marcus Brody",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 4,
      "inDegree": 4,
      "outDegree": 0
    },
    {
      "id": "Practitioner/PRAC-WALSH-05",
      "resourceId": "PRAC-WALSH-05",
      "resourceType": "Practitioner",
      "title": "Dr. Amy L. Walsh",
      "status": "recorded",
      "date": null,
      "patientId": null,
      "degree": 3,
      "inDegree": 3,
      "outDegree": 0
    },
    {
      "id": "Patient/PAT-VANCE-01",
      "resourceId": "PAT-VANCE-01",
      "resourceType": "Patient",
      "title": "Eleanor Rose Vance",
      "status": "recorded",
      "date": "1958-04-12",
      "patientId": "PAT-VANCE-01",
      "degree": 31,
      "inDegree": 29,
      "outDegree": 2
    },
    {
      "id": "Condition/COND-VANCE-T2D",
      "resourceId": "COND-VANCE-T2D",
      "resourceType": "Condition",
      "title": "Type 2 Diabetes Mellitus",
      "status": "active",
      "date": "2018-09-15",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 3,
      "outDegree": 1
    },
    {
      "id": "Condition/COND-VANCE-CKD",
      "resourceId": "COND-VANCE-CKD",
      "resourceType": "Condition",
      "title": "Diabetic Chronic Kidney Disease, Stage 3a",
      "status": "active",
      "date": "2023-01-20",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 3,
      "outDegree": 1
    },
    {
      "id": "Condition/COND-VANCE-HTN",
      "resourceId": "COND-VANCE-HTN",
      "resourceType": "Condition",
      "title": "Essential Hypertension",
      "status": "active",
      "date": "2019-03-10",
      "patientId": "PAT-VANCE-01",
      "degree": 2,
      "inDegree": 1,
      "outDegree": 1
    },
    {
      "id": "Encounter/ENC-VANCE-2023-03",
      "resourceId": "ENC-VANCE-2023-03",
      "resourceType": "Encounter",
      "title": "Encounter ENC-VANCE-2023-03",
      "status": "finished",
      "date": "2023-03-14T09:30:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 10,
      "inDegree": 6,
      "outDegree": 4
    },
    {
      "id": "Encounter/ENC-VANCE-2023-09",
      "resourceId": "ENC-VANCE-2023-09",
      "resourceType": "Encounter",
      "title": "Encounter ENC-VANCE-2023-09",
      "status": "finished",
      "date": "2023-09-18T14:00:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 6,
      "inDegree": 3,
      "outDegree": 3
    },
    {
      "id": "Encounter/ENC-VANCE-2024-02",
      "resourceId": "ENC-VANCE-2024-02",
      "resourceType": "Encounter",
      "title": "Encounter ENC-VANCE-2024-02",
      "status": "finished",
      "date": "2024-02-11T20:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 6,
      "inDegree": 3,
      "outDegree": 3
    },
    {
      "id": "Encounter/ENC-VANCE-2024-08",
      "resourceId": "ENC-VANCE-2024-08",
      "resourceType": "Encounter",
      "title": "Encounter ENC-VANCE-2024-08",
      "status": "finished",
      "date": "2024-08-22T11:00:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 10,
      "inDegree": 6,
      "outDegree": 4
    },
    {
      "id": "Encounter/ENC-VANCE-2025-05",
      "resourceId": "ENC-VANCE-2025-05",
      "resourceType": "Encounter",
      "title": "Encounter ENC-VANCE-2025-05",
      "status": "finished",
      "date": "2025-05-10T10:00:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 6,
      "inDegree": 3,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-A1C-1",
      "resourceId": "OBS-VANCE-A1C-1",
      "resourceType": "Observation",
      "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "status": "final",
      "date": "2023-03-14T09:45:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-EGFR-1",
      "resourceId": "OBS-VANCE-EGFR-1",
      "resourceType": "Observation",
      "title": "Glomerular filtration rate/1.73 sq M.predicted",
      "status": "final",
      "date": "2023-03-14T09:45:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-BP-1",
      "resourceId": "OBS-VANCE-BP-1",
      "resourceType": "Observation",
      "title": "Systolic Blood Pressure",
      "status": "final",
      "date": "2023-03-14T09:35:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-CREAT-1",
      "resourceId": "OBS-VANCE-CREAT-1",
      "resourceType": "Observation",
      "title": "Creatinine [Mass/volume] in Serum or Plasma",
      "status": "final",
      "date": "2023-03-14T09:45:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-A1C-2",
      "resourceId": "OBS-VANCE-A1C-2",
      "resourceType": "Observation",
      "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "status": "final",
      "date": "2023-09-18T14:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-EGFR-2",
      "resourceId": "OBS-VANCE-EGFR-2",
      "resourceType": "Observation",
      "title": "Glomerular filtration rate/1.73 sq M.predicted",
      "status": "final",
      "date": "2023-09-18T14:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-BP-2",
      "resourceId": "OBS-VANCE-BP-2",
      "resourceType": "Observation",
      "title": "Systolic Blood Pressure",
      "status": "final",
      "date": "2023-09-18T14:05:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-GLUC-EMER",
      "resourceId": "OBS-VANCE-GLUC-EMER",
      "resourceType": "Observation",
      "title": "Glucose [Mass/volume] in Serum or Plasma",
      "status": "final",
      "date": "2024-02-11T20:30:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-A1C-3",
      "resourceId": "OBS-VANCE-A1C-3",
      "resourceType": "Observation",
      "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "status": "final",
      "date": "2024-02-11T20:30:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-BP-3",
      "resourceId": "OBS-VANCE-BP-3",
      "resourceType": "Observation",
      "title": "Systolic Blood Pressure",
      "status": "final",
      "date": "2024-02-11T20:20:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-EGFR-3",
      "resourceId": "OBS-VANCE-EGFR-3",
      "resourceType": "Observation",
      "title": "Glomerular filtration rate/1.73 sq M.predicted",
      "status": "final",
      "date": "2024-08-22T11:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 1,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-ALB-CREAT",
      "resourceId": "OBS-VANCE-ALB-CREAT",
      "resourceType": "Observation",
      "title": "Microalbumin/Creatinine in Urine",
      "status": "final",
      "date": "2024-08-22T11:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 1,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-A1C-4",
      "resourceId": "OBS-VANCE-A1C-4",
      "resourceType": "Observation",
      "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "status": "final",
      "date": "2024-08-22T11:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-A1C-5",
      "resourceId": "OBS-VANCE-A1C-5",
      "resourceType": "Observation",
      "title": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "status": "final",
      "date": "2025-05-10T10:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-EGFR-4",
      "resourceId": "OBS-VANCE-EGFR-4",
      "resourceType": "Observation",
      "title": "Glomerular filtration rate/1.73 sq M.predicted",
      "status": "final",
      "date": "2025-05-10T10:15:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-VANCE-BP-4",
      "resourceId": "OBS-VANCE-BP-4",
      "resourceType": "Observation",
      "title": "Systolic Blood Pressure",
      "status": "final",
      "date": "2025-05-10T10:05:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "DiagnosticReport/DR-VANCE-RENAL-US",
      "resourceId": "DR-VANCE-RENAL-US",
      "resourceType": "DiagnosticReport",
      "title": "Renal Ultrasound Bilateral",
      "status": "final",
      "date": "2024-08-23T09:00:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 5,
      "inDegree": 0,
      "outDegree": 5
    },
    {
      "id": "Procedure/PROC-VANCE-EYE-EXAM",
      "resourceId": "PROC-VANCE-EYE-EXAM",
      "resourceType": "Procedure",
      "title": "Comprehensive Dilated Diabetic Eye Examination",
      "status": "completed",
      "date": "2024-08-25T13:30:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "MedicationRequest/MED-VANCE-METFORMIN",
      "resourceId": "MED-VANCE-METFORMIN",
      "resourceType": "MedicationRequest",
      "title": "Metformin ER 1000 mg Oral Tablet",
      "status": "active",
      "date": "2023-03-14T10:30:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 0,
      "outDegree": 4
    },
    {
      "id": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "resourceId": "MED-VANCE-LISINOPRIL",
      "resourceType": "MedicationRequest",
      "title": "Lisinopril 20 mg Oral Tablet",
      "status": "active",
      "date": "2023-03-14T10:35:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 5,
      "inDegree": 0,
      "outDegree": 5
    },
    {
      "id": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
      "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
      "resourceType": "MedicationRequest",
      "title": "Jardiance (Empagliflozin) 25 mg Oral Tablet",
      "status": "active",
      "date": "2024-08-22T11:45:00Z",
      "patientId": "PAT-VANCE-01",
      "degree": 4,
      "inDegree": 0,
      "outDegree": 4
    },
    {
      "id": "Patient/PAT-THORNE-02",
      "resourceId": "PAT-THORNE-02",
      "resourceType": "Patient",
      "title": "Marcus Anthony Thorne",
      "status": "recorded",
      "date": "1966-11-28",
      "patientId": "PAT-THORNE-02",
      "degree": 12,
      "inDegree": 11,
      "outDegree": 1
    },
    {
      "id": "Condition/COND-THORNE-STEMI",
      "resourceId": "COND-THORNE-STEMI",
      "resourceType": "Condition",
      "title": "Acute Anteroseptal ST-Elevation Myocardial Infarction",
      "status": "active",
      "date": "2024-04-03T05:15:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 2,
      "inDegree": 1,
      "outDegree": 1
    },
    {
      "id": "Condition/COND-THORNE-CAD",
      "resourceId": "COND-THORNE-CAD",
      "resourceType": "Condition",
      "title": "Severe Triple Vessel Coronary Artery Disease",
      "status": "active",
      "date": "2024-04-03",
      "patientId": "PAT-THORNE-02",
      "degree": 1,
      "inDegree": 0,
      "outDegree": 1
    },
    {
      "id": "Encounter/ENC-THORNE-2024-04",
      "resourceId": "ENC-THORNE-2024-04",
      "resourceType": "Encounter",
      "title": "Encounter ENC-THORNE-2024-04",
      "status": "finished",
      "date": "2024-04-03T06:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 11,
      "inDegree": 6,
      "outDegree": 5
    },
    {
      "id": "Procedure/PROC-THORNE-CABG",
      "resourceId": "PROC-THORNE-CABG",
      "resourceType": "Procedure",
      "title": "Coronary Artery Bypass Grafting x 3 (LIMA-LAD, SVG-OM1, SVG-PDA)",
      "status": "completed",
      "date": "2024-04-04T07:30:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-THORNE-TROP-1",
      "resourceId": "OBS-THORNE-TROP-1",
      "resourceType": "Observation",
      "title": "High Sensitivity Cardiac Troponin I",
      "status": "final",
      "date": "2024-04-03T06:30:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 2,
      "inDegree": 0,
      "outDegree": 2
    },
    {
      "id": "Observation/OBS-THORNE-TROP-2",
      "resourceId": "OBS-THORNE-TROP-2",
      "resourceType": "Observation",
      "title": "High Sensitivity Cardiac Troponin I",
      "status": "final",
      "date": "2024-04-03T12:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 2,
      "inDegree": 0,
      "outDegree": 2
    },
    {
      "id": "Observation/OBS-THORNE-TROP-3",
      "resourceId": "OBS-THORNE-TROP-3",
      "resourceType": "Observation",
      "title": "High Sensitivity Cardiac Troponin I",
      "status": "final",
      "date": "2024-04-04T06:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 2,
      "inDegree": 0,
      "outDegree": 2
    },
    {
      "id": "Observation/OBS-THORNE-TROP-4",
      "resourceId": "OBS-THORNE-TROP-4",
      "resourceType": "Observation",
      "title": "High Sensitivity Cardiac Troponin I",
      "status": "final",
      "date": "2024-04-08T08:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 3,
      "inDegree": 1,
      "outDegree": 2
    },
    {
      "id": "DiagnosticReport/DR-THORNE-ECHO",
      "resourceId": "DR-THORNE-ECHO",
      "resourceType": "DiagnosticReport",
      "title": "Post-Operative Transthoracic Echocardiogram",
      "status": "final",
      "date": "2024-04-08T10:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 4,
      "inDegree": 0,
      "outDegree": 4
    },
    {
      "id": "Encounter/ENC-THORNE-2024-10",
      "resourceId": "ENC-THORNE-2024-10",
      "resourceType": "Encounter",
      "title": "Encounter ENC-THORNE-2024-10",
      "status": "finished",
      "date": "2024-10-15T13:30:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 4,
      "inDegree": 1,
      "outDegree": 3
    },
    {
      "id": "MedicationRequest/MED-THORNE-ATORVASTATIN",
      "resourceId": "MED-THORNE-ATORVASTATIN",
      "resourceType": "MedicationRequest",
      "title": "Atorvastatin 80 mg Oral Tablet",
      "status": "active",
      "date": "2024-10-15T14:00:00Z",
      "patientId": "PAT-THORNE-02",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Patient/PAT-CHEN-03",
      "resourceId": "PAT-CHEN-03",
      "resourceType": "Patient",
      "title": "Sofia Mei Chen",
      "status": "recorded",
      "date": "2013-07-22",
      "patientId": "PAT-CHEN-03",
      "degree": 6,
      "inDegree": 4,
      "outDegree": 2
    },
    {
      "id": "Condition/COND-CHEN-ASTHMA",
      "resourceId": "COND-CHEN-ASTHMA",
      "resourceType": "Condition",
      "title": "Moderate Persistent Allergic Asthma",
      "status": "active",
      "date": "2020-05-18",
      "patientId": "PAT-CHEN-03",
      "degree": 1,
      "inDegree": 0,
      "outDegree": 1
    },
    {
      "id": "Encounter/ENC-CHEN-2024-09",
      "resourceId": "ENC-CHEN-2024-09",
      "resourceType": "Encounter",
      "title": "Encounter ENC-CHEN-2024-09",
      "status": "finished",
      "date": "2024-09-04T15:00:00Z",
      "patientId": "PAT-CHEN-03",
      "degree": 5,
      "inDegree": 2,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-CHEN-FEV1",
      "resourceId": "OBS-CHEN-FEV1",
      "resourceType": "Observation",
      "title": "Forced Expiratory Volume in 1 Second (FEV1)",
      "status": "final",
      "date": "2024-09-04T15:15:00Z",
      "patientId": "PAT-CHEN-03",
      "degree": 2,
      "inDegree": 0,
      "outDegree": 2
    },
    {
      "id": "MedicationRequest/MED-CHEN-ALBUTEROL",
      "resourceId": "MED-CHEN-ALBUTEROL",
      "resourceType": "MedicationRequest",
      "title": "Albuterol HFA Inhaler 90 mcg/actuation",
      "status": "active",
      "date": "2024-09-04T15:30:00Z",
      "patientId": "PAT-CHEN-03",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Patient/PAT-ROSS-04",
      "resourceId": "PAT-ROSS-04",
      "resourceType": "Patient",
      "title": "David Edward Ross",
      "status": "recorded",
      "date": "1972-02-14",
      "patientId": "PAT-ROSS-04",
      "degree": 5,
      "inDegree": 4,
      "outDegree": 1
    },
    {
      "id": "Condition/COND-ROSS-COLON",
      "resourceId": "COND-ROSS-COLON",
      "resourceType": "Condition",
      "title": "Adenocarcinoma of Ascending Colon (Status Post Hemicolectomy, Complete Remission)",
      "status": "active",
      "date": "2021-10-10",
      "patientId": "PAT-ROSS-04",
      "degree": 2,
      "inDegree": 1,
      "outDegree": 1
    },
    {
      "id": "Encounter/ENC-ROSS-2025-01",
      "resourceId": "ENC-ROSS-2025-01",
      "resourceType": "Encounter",
      "title": "Encounter ENC-ROSS-2025-01",
      "status": "finished",
      "date": "2025-01-14T09:00:00Z",
      "patientId": "PAT-ROSS-04",
      "degree": 5,
      "inDegree": 2,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-ROSS-CEA-2025",
      "resourceId": "OBS-ROSS-CEA-2025",
      "resourceType": "Observation",
      "title": "Carcinoembryonic Antigen (CEA)",
      "status": "final",
      "date": "2025-01-14T09:15:00Z",
      "patientId": "PAT-ROSS-04",
      "degree": 3,
      "inDegree": 1,
      "outDegree": 2
    },
    {
      "id": "DiagnosticReport/DR-ROSS-CT-SURV",
      "resourceId": "DR-ROSS-CT-SURV",
      "resourceType": "DiagnosticReport",
      "title": "Surveillance CT Chest/Abdomen/Pelvis",
      "status": "final",
      "date": "2025-01-12T11:00:00Z",
      "patientId": "PAT-ROSS-04",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Patient/PAT-ANOMALY-05",
      "resourceId": "PAT-ANOMALY-05",
      "resourceType": "Patient",
      "title": "Alex Subject-Unresolved",
      "status": "recorded",
      "date": null,
      "patientId": "PAT-ANOMALY-05",
      "degree": 5,
      "inDegree": 4,
      "outDegree": 1
    },
    {
      "id": "Encounter/ENC-ANOMALY-01",
      "resourceId": "ENC-ANOMALY-01",
      "resourceType": "Encounter",
      "title": "Encounter ENC-ANOMALY-01",
      "status": "finished",
      "date": "2025-02-10T10:00:00Z",
      "patientId": "PAT-ANOMALY-05",
      "degree": 3,
      "inDegree": 2,
      "outDegree": 1
    },
    {
      "id": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
      "resourceId": "MED-ANOMALY-DANGLING-PRAC",
      "resourceType": "MedicationRequest",
      "title": "Amlodipine 5 mg Oral Tablet",
      "status": "active",
      "date": "2025-02-10T10:30:00Z",
      "patientId": "PAT-ANOMALY-05",
      "degree": 3,
      "inDegree": 0,
      "outDegree": 3
    },
    {
      "id": "Observation/OBS-ANOMALY-ORPHAN",
      "resourceId": "OBS-ANOMALY-ORPHAN",
      "resourceType": "Observation",
      "title": "Heart rate measurement disconnected from any patient",
      "status": "final",
      "date": "2025-02-10T10:15:00Z",
      "patientId": null,
      "degree": 0,
      "inDegree": 0,
      "outDegree": 0
    },
    {
      "id": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
      "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
      "resourceType": "Observation",
      "title": "Serum Sodium (Conflicting Ingestion Copy)",
      "status": "preliminary",
      "date": "2025-01-15T08:05:00Z",
      "patientId": "PAT-ANOMALY-05",
      "degree": 2,
      "inDegree": 0,
      "outDegree": 2
    },
    {
      "id": "Condition/COND-ANOMALY-MISSING-STATUS",
      "resourceId": "COND-ANOMALY-MISSING-STATUS",
      "resourceType": "Condition",
      "title": "Pyrexia of unknown origin",
      "status": "recorded",
      "date": null,
      "patientId": "PAT-ANOMALY-05",
      "degree": 1,
      "inDegree": 0,
      "outDegree": 1
    },
    {
      "id": "Practitioner/PRAC-99999",
      "resourceId": "PRAC-99999",
      "resourceType": "Practitioner",
      "title": "Dr. Ghost Practitioner (Unresolved Reference)",
      "status": "unresolved",
      "date": null,
      "patientId": null,
      "isDangling": true,
      "degree": 1,
      "inDegree": 1,
      "outDegree": 0
    }
  ],
  "edges": [
    {
      "path": "generalPractitioner[0]",
      "label": "primary care",
      "isResolved": true,
      "source": "Patient/PAT-VANCE-01",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "managingOrganization",
      "label": "organization",
      "isResolved": true,
      "source": "Patient/PAT-VANCE-01",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-VANCE-T2D",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-VANCE-CKD",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-VANCE-HTN",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-03",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-03",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "diagnosis[0].condition",
      "label": "diagnosis",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-03",
      "target": "Condition/COND-VANCE-T2D"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-03",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-09",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-09",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2023-09",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-02",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "diagnosis[0].condition",
      "label": "diagnosis",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-02",
      "target": "Condition/COND-VANCE-T2D"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-02",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-08",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-08",
      "target": "Practitioner/PRAC-CHEN-02"
    },
    {
      "path": "diagnosis[0].condition",
      "label": "diagnosis",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-08",
      "target": "Condition/COND-VANCE-CKD"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2024-08",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2025-05",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2025-05",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-VANCE-2025-05",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-1",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-1",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-1",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-1",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-1",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-1",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-1",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-1",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-1",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-CREAT-1",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-CREAT-1",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-CREAT-1",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-2",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-2",
      "target": "Encounter/ENC-VANCE-2023-09"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-2",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-2",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-2",
      "target": "Encounter/ENC-VANCE-2023-09"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-2",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-2",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-2",
      "target": "Encounter/ENC-VANCE-2023-09"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-2",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-GLUC-EMER",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-GLUC-EMER",
      "target": "Encounter/ENC-VANCE-2024-02"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-GLUC-EMER",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-3",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-3",
      "target": "Encounter/ENC-VANCE-2024-02"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-3",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-3",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-3",
      "target": "Encounter/ENC-VANCE-2024-02"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-3",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-3",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-3",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-3",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-ALB-CREAT",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-ALB-CREAT",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-ALB-CREAT",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-4",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-4",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-4",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-5",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-5",
      "target": "Encounter/ENC-VANCE-2025-05"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-A1C-5",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-4",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-4",
      "target": "Encounter/ENC-VANCE-2025-05"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-EGFR-4",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-4",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-4",
      "target": "Encounter/ENC-VANCE-2025-05"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "Observation/OBS-VANCE-BP-4",
      "target": "Organization/ORG-PRECISION-LAB"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "DiagnosticReport/DR-VANCE-RENAL-US",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "DiagnosticReport/DR-VANCE-RENAL-US",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "DiagnosticReport/DR-VANCE-RENAL-US",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "result[0]",
      "label": "result",
      "isResolved": true,
      "source": "DiagnosticReport/DR-VANCE-RENAL-US",
      "target": "Observation/OBS-VANCE-EGFR-3"
    },
    {
      "path": "result[1]",
      "label": "result",
      "isResolved": true,
      "source": "DiagnosticReport/DR-VANCE-RENAL-US",
      "target": "Observation/OBS-VANCE-ALB-CREAT"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Procedure/PROC-VANCE-EYE-EXAM",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Procedure/PROC-VANCE-EYE-EXAM",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "performer[0].actor",
      "label": "performer",
      "isResolved": true,
      "source": "Procedure/PROC-VANCE-EYE-EXAM",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-METFORMIN",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-METFORMIN",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-METFORMIN",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "reasonReference[0]",
      "label": "justification",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-METFORMIN",
      "target": "Condition/COND-VANCE-T2D"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "target": "Encounter/ENC-VANCE-2023-03"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "target": "Practitioner/PRAC-JENKINS-01"
    },
    {
      "path": "reasonReference[0]",
      "label": "justification",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "target": "Condition/COND-VANCE-HTN"
    },
    {
      "path": "reasonReference[1]",
      "label": "justification",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-LISINOPRIL",
      "target": "Condition/COND-VANCE-CKD"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
      "target": "Patient/PAT-VANCE-01"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
      "target": "Encounter/ENC-VANCE-2024-08"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
      "target": "Practitioner/PRAC-CHEN-02"
    },
    {
      "path": "reasonReference[0]",
      "label": "justification",
      "isResolved": true,
      "source": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
      "target": "Condition/COND-VANCE-CKD"
    },
    {
      "path": "managingOrganization",
      "label": "organization",
      "isResolved": true,
      "source": "Patient/PAT-THORNE-02",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-THORNE-STEMI",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-THORNE-CAD",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-04",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-04",
      "target": "Practitioner/PRAC-ROSTOVA-03"
    },
    {
      "path": "participant[1].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-04",
      "target": "Practitioner/PRAC-BRODY-04"
    },
    {
      "path": "diagnosis[0].condition",
      "label": "diagnosis",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-04",
      "target": "Condition/COND-THORNE-STEMI"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-04",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Procedure/PROC-THORNE-CABG",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Procedure/PROC-THORNE-CABG",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "performer[0].actor",
      "label": "performer",
      "isResolved": true,
      "source": "Procedure/PROC-THORNE-CABG",
      "target": "Practitioner/PRAC-ROSTOVA-03"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-1",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-1",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-2",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-2",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-3",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-3",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-4",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-THORNE-TROP-4",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "DiagnosticReport/DR-THORNE-ECHO",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "DiagnosticReport/DR-THORNE-ECHO",
      "target": "Encounter/ENC-THORNE-2024-04"
    },
    {
      "path": "performer[0]",
      "label": "performer",
      "isResolved": true,
      "source": "DiagnosticReport/DR-THORNE-ECHO",
      "target": "Practitioner/PRAC-BRODY-04"
    },
    {
      "path": "result[0]",
      "label": "result",
      "isResolved": true,
      "source": "DiagnosticReport/DR-THORNE-ECHO",
      "target": "Observation/OBS-THORNE-TROP-4"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-10",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-10",
      "target": "Practitioner/PRAC-BRODY-04"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-THORNE-2024-10",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
      "target": "Patient/PAT-THORNE-02"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
      "target": "Encounter/ENC-THORNE-2024-10"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": true,
      "source": "MedicationRequest/MED-THORNE-ATORVASTATIN",
      "target": "Practitioner/PRAC-BRODY-04"
    },
    {
      "path": "generalPractitioner[0]",
      "label": "primary care",
      "isResolved": true,
      "source": "Patient/PAT-CHEN-03",
      "target": "Practitioner/PRAC-WALSH-05"
    },
    {
      "path": "managingOrganization",
      "label": "organization",
      "isResolved": true,
      "source": "Patient/PAT-CHEN-03",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-CHEN-ASTHMA",
      "target": "Patient/PAT-CHEN-03"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-CHEN-2024-09",
      "target": "Patient/PAT-CHEN-03"
    },
    {
      "path": "participant[0].individual",
      "label": "references",
      "isResolved": true,
      "source": "Encounter/ENC-CHEN-2024-09",
      "target": "Practitioner/PRAC-WALSH-05"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-CHEN-2024-09",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-CHEN-FEV1",
      "target": "Patient/PAT-CHEN-03"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-CHEN-FEV1",
      "target": "Encounter/ENC-CHEN-2024-09"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
      "target": "Patient/PAT-CHEN-03"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
      "target": "Encounter/ENC-CHEN-2024-09"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": true,
      "source": "MedicationRequest/MED-CHEN-ALBUTEROL",
      "target": "Practitioner/PRAC-WALSH-05"
    },
    {
      "path": "managingOrganization",
      "label": "organization",
      "isResolved": true,
      "source": "Patient/PAT-ROSS-04",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-ROSS-COLON",
      "target": "Patient/PAT-ROSS-04"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-ROSS-2025-01",
      "target": "Patient/PAT-ROSS-04"
    },
    {
      "path": "diagnosis[0].condition",
      "label": "diagnosis",
      "isResolved": true,
      "source": "Encounter/ENC-ROSS-2025-01",
      "target": "Condition/COND-ROSS-COLON"
    },
    {
      "path": "serviceProvider",
      "label": "organization",
      "isResolved": true,
      "source": "Encounter/ENC-ROSS-2025-01",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-ROSS-CEA-2025",
      "target": "Patient/PAT-ROSS-04"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-ROSS-CEA-2025",
      "target": "Encounter/ENC-ROSS-2025-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "DiagnosticReport/DR-ROSS-CT-SURV",
      "target": "Patient/PAT-ROSS-04"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "DiagnosticReport/DR-ROSS-CT-SURV",
      "target": "Encounter/ENC-ROSS-2025-01"
    },
    {
      "path": "result[0]",
      "label": "result",
      "isResolved": true,
      "source": "DiagnosticReport/DR-ROSS-CT-SURV",
      "target": "Observation/OBS-ROSS-CEA-2025"
    },
    {
      "path": "managingOrganization",
      "label": "organization",
      "isResolved": true,
      "source": "Patient/PAT-ANOMALY-05",
      "target": "Organization/ORG-METRO"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Encounter/ENC-ANOMALY-01",
      "target": "Patient/PAT-ANOMALY-05"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
      "target": "Patient/PAT-ANOMALY-05"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
      "target": "Encounter/ENC-ANOMALY-01"
    },
    {
      "path": "requester",
      "label": "prescriber",
      "isResolved": false,
      "source": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
      "target": "Practitioner/PRAC-99999"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
      "target": "Patient/PAT-ANOMALY-05"
    },
    {
      "path": "encounter",
      "label": "context",
      "isResolved": true,
      "source": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
      "target": "Encounter/ENC-ANOMALY-01"
    },
    {
      "path": "subject",
      "label": "subject",
      "isResolved": true,
      "source": "Condition/COND-ANOMALY-MISSING-STATUS",
      "target": "Patient/PAT-ANOMALY-05"
    }
  ],
  "metrics": {
    "totalNodes": 66,
    "totalEdges": 149,
    "topHubs": [
      {
        "node": "Patient/PAT-VANCE-01",
        "degree": 31,
        "type": "Patient",
        "title": "Eleanor Rose Vance"
      },
      {
        "node": "Organization/ORG-PRECISION-LAB",
        "degree": 16,
        "type": "Organization",
        "title": "Precision Diagnostic Laboratories"
      },
      {
        "node": "Organization/ORG-METRO",
        "degree": 15,
        "type": "Organization",
        "title": "Metropolitan Academic Health System"
      },
      {
        "node": "Patient/PAT-THORNE-02",
        "degree": 12,
        "type": "Patient",
        "title": "Marcus Anthony Thorne"
      },
      {
        "node": "Encounter/ENC-THORNE-2024-04",
        "degree": 11,
        "type": "Encounter",
        "title": "Encounter ENC-THORNE-2024-04"
      }
    ],
    "density": 0.0347
  }
};

export const FALLBACK_QUALITY = {
  "dimensions": {
    "referentialIntegrity": {
      "dimension": "Referential Integrity",
      "totalReferences": 149,
      "resolvedReferences": 148,
      "danglingReferences": 1,
      "percentage": 99.3,
      "status": "WARNING"
    },
    "structuralValidity": {
      "dimension": "Structural Validity",
      "totalResources": 65,
      "validResources": 64,
      "invalidResources": 1,
      "percentage": 98.5,
      "status": "ERROR"
    },
    "temporalConsistency": {
      "dimension": "Temporal Consistency",
      "totalAudited": 65,
      "clashes": 1,
      "percentage": 98.5,
      "status": "WARNING"
    },
    "completeness": {
      "dimension": "Information Completeness",
      "totalAudited": 65,
      "omissions": 2,
      "percentage": 96.9,
      "status": "WARNING"
    },
    "terminologyQuality": {
      "dimension": "Terminology Standards",
      "totalCodedElements": 149,
      "standardCodedElements": 131,
      "percentage": 87.9,
      "status": "WARNING"
    },
    "identityUniqueness": {
      "dimension": "Identity Uniqueness",
      "collisionCount": 0,
      "status": "PASSED"
    }
  },
  "heuristicReadinessIndicator": {
    "score": 97.4,
    "label": "HealthGraph Heuristic Readiness Indicator",
    "disclaimer": "This indicator is an educational composite heuristic, not an official clinical or regulatory readiness standard.",
    "weights": "Referential 35%, Structural 25%, Completeness 20%, Temporal 10%, Terminology 10%"
  },
  "summaryCounts": {
    "ERROR": 2,
    "WARNING": 3,
    "INFORMATION": 1,
    "UNKNOWN": 0
  },
  "countsByDimension": {
    "Referential Integrity": 2,
    "Temporal Consistency": 1,
    "Completeness": 3
  },
  "findings": [
    {
      "dimension": "Referential Integrity",
      "severity": "ERROR",
      "resourceKey": "MedicationRequest/MED-ANOMALY-DANGLING-PRAC",
      "resourceType": "MedicationRequest",
      "resourceId": "MED-ANOMALY-DANGLING-PRAC",
      "summary": "Dangling reference: field 'requester' targets non-existent resource 'Practitioner/PRAC-99999'.",
      "clinicalImpact": "Breaks provider/patient attribution; clinical provenance cannot be verified across systems.",
      "remediation": "Ingest missing target entity 'Practitioner/PRAC-99999' or update source pointer with valid registered identifier.",
      "rawEvidence": {
        "path": "requester",
        "targetKey": "Practitioner/PRAC-99999",
        "display": "Dr. Ghost Practitioner (Unresolved Reference)"
      }
    },
    {
      "dimension": "Referential Integrity",
      "severity": "WARNING",
      "resourceKey": "Observation/OBS-ANOMALY-ORPHAN",
      "resourceType": "Observation",
      "resourceId": "OBS-ANOMALY-ORPHAN",
      "summary": "Orphan clinical Observation has no subject pointer referencing an identifiable Patient.",
      "clinicalImpact": "Clinical finding exists in vacuum without patient ownership, preventing safety reviews.",
      "remediation": "Attach valid subject: {'reference': 'Patient/<id>'} before promoting to patient record.",
      "rawEvidence": {
        "status": "final",
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "8867-4",
              "display": "Heart rate"
            }
          ],
          "text": "Heart rate measurement disconnected from any patient"
        }
      }
    },
    {
      "dimension": "Temporal Consistency",
      "severity": "WARNING",
      "resourceKey": "Observation/OBS-ANOMALY-TEMPORAL-CLASH",
      "resourceType": "Observation",
      "resourceId": "OBS-ANOMALY-TEMPORAL-CLASH",
      "summary": "Observation timestamp (2025-01-15T08:05:00Z) precedes associated encounter start (2025-02-10T10:00:00Z) by multiple days.",
      "clinicalImpact": "Distorts longitudinal timeline; prior outpatient findings appear misattributed to encounter episode.",
      "remediation": "Adjust observation timestamp or link observation to the prior ambulatory encounter.",
      "rawEvidence": {
        "observationTime": "2025-01-15T08:05:00Z",
        "encounterPeriod": {
          "start": "2025-02-10T10:00:00Z",
          "end": "2025-02-10T11:00:00Z"
        }
      }
    },
    {
      "dimension": "Completeness",
      "severity": "INFORMATION",
      "resourceKey": "Patient/PAT-ANOMALY-05",
      "resourceType": "Patient",
      "resourceId": "PAT-ANOMALY-05",
      "summary": "Patient lacks 'birthDate'. (Optional in base FHIR R4, but required in US Core).",
      "clinicalImpact": "Missing clinical status or mandatory domain attributes restricts clinical utility.",
      "remediation": "Add birthDate (YYYY-MM-DD) to support pediatric dosing and demographic matching.",
      "rawEvidence": {
        "path": "birthDate",
        "code": "missing-birthdate"
      }
    },
    {
      "dimension": "Completeness",
      "severity": "WARNING",
      "resourceKey": "Observation/OBS-ANOMALY-ORPHAN",
      "resourceType": "Observation",
      "resourceId": "OBS-ANOMALY-ORPHAN",
      "summary": "Clinical Observation lacks subject pointer. While optional in raw FHIR, clinical context is lost.",
      "clinicalImpact": "Missing clinical status or mandatory domain attributes restricts clinical utility.",
      "remediation": "Supply mandatory clinical attributes per resource specification.",
      "rawEvidence": {
        "path": "subject",
        "code": "missing-observation-subject"
      }
    },
    {
      "dimension": "Completeness",
      "severity": "ERROR",
      "resourceKey": "Condition/COND-ANOMALY-MISSING-STATUS",
      "resourceType": "Condition",
      "resourceId": "COND-ANOMALY-MISSING-STATUS",
      "summary": "Condition requires 'clinicalStatus' unless verificationStatus is entered-in-error.",
      "clinicalImpact": "Missing clinical status or mandatory domain attributes restricts clinical utility.",
      "remediation": "Supply clinicalStatus (active | recurrence | relapse | inactive | remission | resolved).",
      "rawEvidence": {
        "path": "clinicalStatus",
        "code": "missing-clinical-status"
      }
    }
  ]
};

export const FALLBACK_PIPELINE = {
  "pipelineTitle": "HealthGraph Information Pipeline Architecture",
  "stages": [
    {
      "stageNumber": 1,
      "title": "Originating Source Systems",
      "description": "Clinical data originates across disparate EHR systems, commercial labs, and clinics.",
      "artifacts": [
        {
          "name": "Metropolitan Health Epic EHR",
          "type": "Inpatient / Ambulatory EHR",
          "emits": "Patient, Encounter, Condition, MedicationRequest"
        },
        {
          "name": "Precision Diagnostic Laboratories LIMS",
          "type": "Laboratory Information System",
          "emits": "Observation (HbA1c, eGFR, Troponin) with LOINC codes"
        }
      ]
    },
    {
      "stageNumber": 2,
      "title": "Raw FHIR Bundle Packaging",
      "description": "Systems serialize records into a FHIR R4 Bundle for transport.",
      "sampleJson": {
        "resourceType": "Bundle",
        "id": "HEALTHGRAPH-SYNTHETIC-R4-BUNDLE",
        "type": "collection",
        "total": 65,
        "sampleEntry": {
          "resourceType": "Observation",
          "id": "OBS-VANCE-A1C-1",
          "status": "final",
          "category": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                  "code": "laboratory"
                }
              ]
            }
          ],
          "code": {
            "coding": [
              {
                "system": "http://loinc.org",
                "code": "4548-4",
                "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
              }
            ],
            "text": "Hemoglobin A1c/Hemoglobin.total in Blood"
          },
          "subject": {
            "reference": "Patient/PAT-VANCE-01",
            "display": "Eleanor Vance"
          },
          "encounter": {
            "reference": "Encounter/ENC-VANCE-2023-03"
          },
          "effectiveDateTime": "2023-03-14T09:45:00Z",
          "performer": [
            {
              "reference": "Organization/ORG-PRECISION-LAB"
            }
          ],
          "valueQuantity": {
            "value": 9.4,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
          },
          "referenceRange": [
            {
              "low": {
                "value": 4.0,
                "unit": "%"
              },
              "high": {
                "value": 5.6,
                "unit": "%"
              }
            }
          ],
          "interpretation": [
            {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  "code": "H"
                }
              ],
              "text": "High"
            }
          ]
        }
      }
    },
    {
      "stageNumber": 3,
      "title": "3-Layer Validation Execution",
      "description": "Evaluates Structural (Layer 1), Resource-Specific (Layer 2), and Interoperability (Layer 3) conformance.",
      "sampleValidReport": {
        "resourceType": "Observation",
        "id": "OBS-VANCE-A1C-1",
        "isValid": true,
        "errorCount": 0,
        "warningCount": 0,
        "infoCount": 1,
        "unknownCount": 0,
        "findings": [
          {
            "layer": 3,
            "layerName": "Layer 3: Interoperability",
            "severity": "INFORMATION",
            "code": "non-standard-terminology",
            "path": "interpretation[0].coding[0].system",
            "message": "Coding system 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation' is a local or proprietary terminology system.",
            "recommendation": null
          }
        ],
        "layerSummary": {
          "layer1_structural": true,
          "layer2_resource": true,
          "layer3_interop": true
        }
      },
      "sampleIssueReport": {
        "resourceType": "MedicationRequest",
        "id": "MED-ANOMALY-DANGLING-PRAC",
        "isValid": true,
        "errorCount": 0,
        "warningCount": 0,
        "infoCount": 0,
        "unknownCount": 0,
        "findings": [],
        "layerSummary": {
          "layer1_structural": true,
          "layer2_resource": true,
          "layer3_interop": true
        }
      }
    },
    {
      "stageNumber": 4,
      "title": "Provenance & Attribution Attachment",
      "description": "Attaches metadata identifying source organization, recording clinician, and ingestion event.",
      "provenanceRecord": {
        "resourceKey": "Observation/OBS-VANCE-A1C-1",
        "sourceSystem": "Lab Information Management System (LIMS Synthetic Feed)",
        "sourceOrganization": "Precision Diagnostic Laboratories",
        "recordedTime": "2023-03-14T09:45:00Z",
        "importedTime": "2026-03-01T00:00:00Z",
        "originatingBundle": "HEALTHGRAPH-SYNTHETIC-R4-BUNDLE",
        "activity": "Ingestion, Validation, and Relational Graph Construction",
        "agentPractitioner": "Organization/ORG-PRECISION-LAB"
      }
    },
    {
      "stageNumber": 5,
      "title": "Reference Resolution & Link Indexing",
      "description": "Matches relative pointers ('Patient/pat-1') to target entities, detects dangling foreign keys.",
      "metrics": {
        "totalReferences": 57,
        "danglingCount": 1,
        "orphanCount": 1
      }
    },
    {
      "stageNumber": 6,
      "title": "Normalization & Relational Caching",
      "description": "Stores normalized records in SQLite with indexes on resourceType, patientId, encounterId, and date.",
      "tableCounts": {
        "Observation": 24,
        "Encounter": 10,
        "Condition": 8,
        "MedicationRequest": 6,
        "Patient": 5,
        "Practitioner": 5,
        "DiagnosticReport": 3,
        "Organization": 2,
        "Procedure": 2
      }
    },
    {
      "stageNumber": 7,
      "title": "Relationship Graph Reconstruction",
      "description": "Builds multi-directed knowledge graph in NetworkX with clinical predicate edges.",
      "metrics": {
        "totalNodes": 66,
        "totalEdges": 149,
        "topHubs": [
          {
            "node": "Patient/PAT-VANCE-01",
            "degree": 31,
            "type": "Patient",
            "title": "Eleanor Rose Vance"
          },
          {
            "node": "Organization/ORG-PRECISION-LAB",
            "degree": 16,
            "type": "Organization",
            "title": "Precision Diagnostic Laboratories"
          },
          {
            "node": "Organization/ORG-METRO",
            "degree": 15,
            "type": "Organization",
            "title": "Metropolitan Academic Health System"
          },
          {
            "node": "Patient/PAT-THORNE-02",
            "degree": 12,
            "type": "Patient",
            "title": "Marcus Anthony Thorne"
          },
          {
            "node": "Encounter/ENC-THORNE-2024-04",
            "degree": 11,
            "type": "Encounter",
            "title": "Encounter ENC-THORNE-2024-04"
          }
        ],
        "density": 0.0347
      }
    },
    {
      "stageNumber": 8,
      "title": "Longitudinal Patient Trajectory",
      "description": "Orders clinical events chronologically and extracts biomarker time-series (e.g. HbA1c progression).",
      "trajectory": {
        "patientId": "PAT-VANCE-01",
        "totalEvents": 30,
        "events": [
          {
            "resourceType": "Patient",
            "resourceId": "PAT-VANCE-01",
            "resourceKey": "Patient/PAT-VANCE-01",
            "timestamp": "1958-04-12T00:00:00Z",
            "dateOnly": "1958-04-12",
            "title": "Patient Birth Date",
            "category": "demographic",
            "status": "recorded",
            "encounterId": null,
            "valueDisplay": null,
            "summary": "Recorded date of birth",
            "details": {}
          },
          {
            "resourceType": "Condition",
            "resourceId": "COND-VANCE-T2D",
            "resourceKey": "Condition/COND-VANCE-T2D",
            "timestamp": "2018-09-15T00:00:00Z",
            "dateOnly": "2018-09-15",
            "title": "Condition Diagnosed: Type 2 Diabetes Mellitus",
            "category": "condition",
            "status": "active",
            "encounterId": null,
            "valueDisplay": null,
            "summary": "Clinical Status: Active",
            "details": {}
          },
          {
            "resourceType": "Condition",
            "resourceId": "COND-VANCE-HTN",
            "resourceKey": "Condition/COND-VANCE-HTN",
            "timestamp": "2019-03-10T00:00:00Z",
            "dateOnly": "2019-03-10",
            "title": "Condition Diagnosed: Essential Hypertension",
            "category": "condition",
            "status": "active",
            "encounterId": null,
            "valueDisplay": null,
            "summary": "Clinical Status: Active",
            "details": {}
          },
          {
            "resourceType": "Condition",
            "resourceId": "COND-VANCE-CKD",
            "resourceKey": "Condition/COND-VANCE-CKD",
            "timestamp": "2023-01-20T00:00:00Z",
            "dateOnly": "2023-01-20",
            "title": "Condition Diagnosed: Diabetic Chronic Kidney Disease, Stage 3a",
            "category": "condition",
            "status": "active",
            "encounterId": null,
            "valueDisplay": null,
            "summary": "Clinical Status: Active",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2023-03",
            "resourceKey": "Encounter/ENC-VANCE-2023-03",
            "timestamp": "2023-03-14T09:30:00Z",
            "dateOnly": "2023-03-14",
            "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-1",
            "resourceKey": "Observation/OBS-VANCE-BP-1",
            "timestamp": "2023-03-14T09:35:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "148.0 mmHg",
            "summary": "Observed value: 148.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-1",
            "resourceKey": "Observation/OBS-VANCE-A1C-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "9.4 %",
            "summary": "Observed value: 9.4 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-1",
            "resourceKey": "Observation/OBS-VANCE-EGFR-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "58.0 mL/min/1.73m2",
            "summary": "Observed value: 58.0 mL/min/1.73m2",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-CREAT-1",
            "resourceKey": "Observation/OBS-VANCE-CREAT-1",
            "timestamp": "2023-03-14T09:45:00Z",
            "dateOnly": "2023-03-14",
            "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": "1.32 mg/dL",
            "summary": "Observed value: 1.32 mg/dL",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-METFORMIN",
            "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
            "timestamp": "2023-03-14T10:30:00Z",
            "dateOnly": "2023-03-14",
            "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth twice daily with meals",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-LISINOPRIL",
            "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
            "timestamp": "2023-03-14T10:35:00Z",
            "dateOnly": "2023-03-14",
            "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2023-03",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth daily in the morning",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2023-09",
            "resourceKey": "Encounter/ENC-VANCE-2023-09",
            "timestamp": "2023-09-18T14:00:00Z",
            "dateOnly": "2023-09-18",
            "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": null,
            "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-2",
            "resourceKey": "Observation/OBS-VANCE-BP-2",
            "timestamp": "2023-09-18T14:05:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "138.0 mmHg",
            "summary": "Observed value: 138.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-2",
            "resourceKey": "Observation/OBS-VANCE-A1C-2",
            "timestamp": "2023-09-18T14:15:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "8.3 %",
            "summary": "Observed value: 8.3 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-2",
            "resourceKey": "Observation/OBS-VANCE-EGFR-2",
            "timestamp": "2023-09-18T14:15:00Z",
            "dateOnly": "2023-09-18",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2023-09",
            "valueDisplay": "56.0 mL/min/1.73m2",
            "summary": "Observed value: 56.0 mL/min/1.73m2",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2024-02",
            "resourceKey": "Encounter/ENC-VANCE-2024-02",
            "timestamp": "2024-02-11T20:15:00Z",
            "dateOnly": "2024-02-11",
            "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-3",
            "resourceKey": "Observation/OBS-VANCE-BP-3",
            "timestamp": "2024-02-11T20:20:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "154.0 mmHg",
            "summary": "Observed value: 154.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-GLUC-EMER",
            "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
            "timestamp": "2024-02-11T20:30:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "342.0 mg/dL",
            "summary": "Observed value: 342.0 mg/dL",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-3",
            "resourceKey": "Observation/OBS-VANCE-A1C-3",
            "timestamp": "2024-02-11T20:30:00Z",
            "dateOnly": "2024-02-11",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-02",
            "valueDisplay": "8.8 %",
            "summary": "Observed value: 8.8 %",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2024-08",
            "resourceKey": "Encounter/ENC-VANCE-2024-08",
            "timestamp": "2024-08-22T11:00:00Z",
            "dateOnly": "2024-08-22",
            "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-3",
            "resourceKey": "Observation/OBS-VANCE-EGFR-3",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "54.0 mL/min/1.73m2",
            "summary": "Observed value: 54.0 mL/min/1.73m2",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-ALB-CREAT",
            "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Microalbumin/Creatinine in Urine",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "185.0 mg/g",
            "summary": "Observed value: 185.0 mg/g",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-4",
            "resourceKey": "Observation/OBS-VANCE-A1C-4",
            "timestamp": "2024-08-22T11:15:00Z",
            "dateOnly": "2024-08-22",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": "7.6 %",
            "summary": "Observed value: 7.6 %",
            "details": {}
          },
          {
            "resourceType": "MedicationRequest",
            "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
            "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
            "timestamp": "2024-08-22T11:45:00Z",
            "dateOnly": "2024-08-22",
            "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
            "category": "medication",
            "status": "active",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
            "details": {}
          },
          {
            "resourceType": "DiagnosticReport",
            "resourceId": "DR-VANCE-RENAL-US",
            "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
            "timestamp": "2024-08-23T09:00:00Z",
            "dateOnly": "2024-08-23",
            "title": "Diagnostic Report: Renal Ultrasound Bilateral",
            "category": "report",
            "status": "final",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
            "details": {}
          },
          {
            "resourceType": "Procedure",
            "resourceId": "PROC-VANCE-EYE-EXAM",
            "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
            "timestamp": "2024-08-25T13:30:00Z",
            "dateOnly": "2024-08-25",
            "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
            "category": "procedure",
            "status": "completed",
            "encounterId": "ENC-VANCE-2024-08",
            "valueDisplay": null,
            "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
            "details": {}
          },
          {
            "resourceType": "Encounter",
            "resourceId": "ENC-VANCE-2025-05",
            "resourceKey": "Encounter/ENC-VANCE-2025-05",
            "timestamp": "2025-05-10T10:00:00Z",
            "dateOnly": "2025-05-10",
            "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
            "category": "encounter",
            "status": "finished",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": null,
            "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-BP-4",
            "resourceKey": "Observation/OBS-VANCE-BP-4",
            "timestamp": "2025-05-10T10:05:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Systolic Blood Pressure",
            "category": "vital-signs",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "126.0 mmHg",
            "summary": "Observed value: 126.0 mmHg",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-A1C-5",
            "resourceKey": "Observation/OBS-VANCE-A1C-5",
            "timestamp": "2025-05-10T10:15:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "7.0 %",
            "summary": "Observed value: 7.0 %",
            "details": {}
          },
          {
            "resourceType": "Observation",
            "resourceId": "OBS-VANCE-EGFR-4",
            "resourceKey": "Observation/OBS-VANCE-EGFR-4",
            "timestamp": "2025-05-10T10:15:00Z",
            "dateOnly": "2025-05-10",
            "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
            "category": "laboratory",
            "status": "final",
            "encounterId": "ENC-VANCE-2025-05",
            "valueDisplay": "57.0 mL/min/1.73m2",
            "summary": "Observed value: 57.0 mL/min/1.73m2",
            "details": {}
          }
        ],
        "encounterGroups": [
          {
            "encounterId": "ENC-VANCE-2025-05",
            "title": "Annual Longitudinal Care Plan Review",
            "class": "ambulatory",
            "start": "2025-05-10T10:00:00Z",
            "end": "2025-05-10T10:45:00Z",
            "events": [
              {
                "resourceType": "Encounter",
                "resourceId": "ENC-VANCE-2025-05",
                "resourceKey": "Encounter/ENC-VANCE-2025-05",
                "timestamp": "2025-05-10T10:00:00Z",
                "dateOnly": "2025-05-10",
                "title": "Ambulatory Encounter: Annual Longitudinal Care Plan Review",
                "category": "encounter",
                "status": "finished",
                "encounterId": "ENC-VANCE-2025-05",
                "valueDisplay": null,
                "summary": "Encounter duration: 2025-05-10 to 2025-05-10",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-BP-4",
                "resourceKey": "Observation/OBS-VANCE-BP-4",
                "timestamp": "2025-05-10T10:05:00Z",
                "dateOnly": "2025-05-10",
                "title": "Measurement: Systolic Blood Pressure",
                "category": "vital-signs",
                "status": "final",
                "encounterId": "ENC-VANCE-2025-05",
                "valueDisplay": "126.0 mmHg",
                "summary": "Observed value: 126.0 mmHg",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-A1C-5",
                "resourceKey": "Observation/OBS-VANCE-A1C-5",
                "timestamp": "2025-05-10T10:15:00Z",
                "dateOnly": "2025-05-10",
                "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2025-05",
                "valueDisplay": "7.0 %",
                "summary": "Observed value: 7.0 %",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-EGFR-4",
                "resourceKey": "Observation/OBS-VANCE-EGFR-4",
                "timestamp": "2025-05-10T10:15:00Z",
                "dateOnly": "2025-05-10",
                "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2025-05",
                "valueDisplay": "57.0 mL/min/1.73m2",
                "summary": "Observed value: 57.0 mL/min/1.73m2",
                "details": {}
              }
            ]
          },
          {
            "encounterId": "ENC-VANCE-2024-08",
            "title": "Nephrology Consultation & Renal Staging",
            "class": "ambulatory",
            "start": "2024-08-22T11:00:00Z",
            "end": "2024-08-22T11:50:00Z",
            "events": [
              {
                "resourceType": "Encounter",
                "resourceId": "ENC-VANCE-2024-08",
                "resourceKey": "Encounter/ENC-VANCE-2024-08",
                "timestamp": "2024-08-22T11:00:00Z",
                "dateOnly": "2024-08-22",
                "title": "Ambulatory Encounter: Nephrology Consultation & Renal Staging",
                "category": "encounter",
                "status": "finished",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": null,
                "summary": "Encounter duration: 2024-08-22 to 2024-08-22",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-EGFR-3",
                "resourceKey": "Observation/OBS-VANCE-EGFR-3",
                "timestamp": "2024-08-22T11:15:00Z",
                "dateOnly": "2024-08-22",
                "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": "54.0 mL/min/1.73m2",
                "summary": "Observed value: 54.0 mL/min/1.73m2",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-ALB-CREAT",
                "resourceKey": "Observation/OBS-VANCE-ALB-CREAT",
                "timestamp": "2024-08-22T11:15:00Z",
                "dateOnly": "2024-08-22",
                "title": "Measurement: Microalbumin/Creatinine in Urine",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": "185.0 mg/g",
                "summary": "Observed value: 185.0 mg/g",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-A1C-4",
                "resourceKey": "Observation/OBS-VANCE-A1C-4",
                "timestamp": "2024-08-22T11:15:00Z",
                "dateOnly": "2024-08-22",
                "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": "7.6 %",
                "summary": "Observed value: 7.6 %",
                "details": {}
              },
              {
                "resourceType": "MedicationRequest",
                "resourceId": "MED-VANCE-EMPAGLIFLOZIN",
                "resourceKey": "MedicationRequest/MED-VANCE-EMPAGLIFLOZIN",
                "timestamp": "2024-08-22T11:45:00Z",
                "dateOnly": "2024-08-22",
                "title": "Rx Order: Jardiance (Empagliflozin) 25 mg Oral Tablet",
                "category": "medication",
                "status": "active",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": null,
                "summary": "Take 1 tablet by mouth once daily in the morning for cardiorenal protection",
                "details": {}
              },
              {
                "resourceType": "DiagnosticReport",
                "resourceId": "DR-VANCE-RENAL-US",
                "resourceKey": "DiagnosticReport/DR-VANCE-RENAL-US",
                "timestamp": "2024-08-23T09:00:00Z",
                "dateOnly": "2024-08-23",
                "title": "Diagnostic Report: Renal Ultrasound Bilateral",
                "category": "report",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": null,
                "summary": "Bilateral kidneys demonstrate mild increased cortical echogenicity consistent with diabetic nephrosclerosis. No hydronep...",
                "details": {}
              },
              {
                "resourceType": "Procedure",
                "resourceId": "PROC-VANCE-EYE-EXAM",
                "resourceKey": "Procedure/PROC-VANCE-EYE-EXAM",
                "timestamp": "2024-08-25T13:30:00Z",
                "dateOnly": "2024-08-25",
                "title": "Procedure: Comprehensive Dilated Diabetic Eye Examination",
                "category": "procedure",
                "status": "completed",
                "encounterId": "ENC-VANCE-2024-08",
                "valueDisplay": null,
                "summary": "Mild non-proliferative diabetic retinopathy bilaterally without macular edema.",
                "details": {}
              }
            ]
          },
          {
            "encounterId": "ENC-VANCE-2024-02",
            "title": "Emergency Department Acute Hyperglycemia Evaluation",
            "class": "emergency",
            "start": "2024-02-11T20:15:00Z",
            "end": "2024-02-12T04:30:00Z",
            "events": [
              {
                "resourceType": "Encounter",
                "resourceId": "ENC-VANCE-2024-02",
                "resourceKey": "Encounter/ENC-VANCE-2024-02",
                "timestamp": "2024-02-11T20:15:00Z",
                "dateOnly": "2024-02-11",
                "title": "Emergency Encounter: Emergency Department Acute Hyperglycemia Evaluation",
                "category": "encounter",
                "status": "finished",
                "encounterId": "ENC-VANCE-2024-02",
                "valueDisplay": null,
                "summary": "Encounter duration: 2024-02-11 to 2024-02-12",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-BP-3",
                "resourceKey": "Observation/OBS-VANCE-BP-3",
                "timestamp": "2024-02-11T20:20:00Z",
                "dateOnly": "2024-02-11",
                "title": "Measurement: Systolic Blood Pressure",
                "category": "vital-signs",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-02",
                "valueDisplay": "154.0 mmHg",
                "summary": "Observed value: 154.0 mmHg",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-GLUC-EMER",
                "resourceKey": "Observation/OBS-VANCE-GLUC-EMER",
                "timestamp": "2024-02-11T20:30:00Z",
                "dateOnly": "2024-02-11",
                "title": "Measurement: Glucose [Mass/volume] in Serum or Plasma",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-02",
                "valueDisplay": "342.0 mg/dL",
                "summary": "Observed value: 342.0 mg/dL",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-A1C-3",
                "resourceKey": "Observation/OBS-VANCE-A1C-3",
                "timestamp": "2024-02-11T20:30:00Z",
                "dateOnly": "2024-02-11",
                "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2024-02",
                "valueDisplay": "8.8 %",
                "summary": "Observed value: 8.8 %",
                "details": {}
              }
            ]
          },
          {
            "encounterId": "ENC-VANCE-2023-09",
            "title": "Endocrinology 6-Month Treatment Assessment",
            "class": "ambulatory",
            "start": "2023-09-18T14:00:00Z",
            "end": "2023-09-18T14:40:00Z",
            "events": [
              {
                "resourceType": "Encounter",
                "resourceId": "ENC-VANCE-2023-09",
                "resourceKey": "Encounter/ENC-VANCE-2023-09",
                "timestamp": "2023-09-18T14:00:00Z",
                "dateOnly": "2023-09-18",
                "title": "Ambulatory Encounter: Endocrinology 6-Month Treatment Assessment",
                "category": "encounter",
                "status": "finished",
                "encounterId": "ENC-VANCE-2023-09",
                "valueDisplay": null,
                "summary": "Encounter duration: 2023-09-18 to 2023-09-18",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-BP-2",
                "resourceKey": "Observation/OBS-VANCE-BP-2",
                "timestamp": "2023-09-18T14:05:00Z",
                "dateOnly": "2023-09-18",
                "title": "Measurement: Systolic Blood Pressure",
                "category": "vital-signs",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-09",
                "valueDisplay": "138.0 mmHg",
                "summary": "Observed value: 138.0 mmHg",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-A1C-2",
                "resourceKey": "Observation/OBS-VANCE-A1C-2",
                "timestamp": "2023-09-18T14:15:00Z",
                "dateOnly": "2023-09-18",
                "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-09",
                "valueDisplay": "8.3 %",
                "summary": "Observed value: 8.3 %",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-EGFR-2",
                "resourceKey": "Observation/OBS-VANCE-EGFR-2",
                "timestamp": "2023-09-18T14:15:00Z",
                "dateOnly": "2023-09-18",
                "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-09",
                "valueDisplay": "56.0 mL/min/1.73m2",
                "summary": "Observed value: 56.0 mL/min/1.73m2",
                "details": {}
              }
            ]
          },
          {
            "encounterId": "ENC-VANCE-2023-03",
            "title": "Endocrinology Comprehensive Initial Review",
            "class": "ambulatory",
            "start": "2023-03-14T09:30:00Z",
            "end": "2023-03-14T10:45:00Z",
            "events": [
              {
                "resourceType": "Encounter",
                "resourceId": "ENC-VANCE-2023-03",
                "resourceKey": "Encounter/ENC-VANCE-2023-03",
                "timestamp": "2023-03-14T09:30:00Z",
                "dateOnly": "2023-03-14",
                "title": "Ambulatory Encounter: Endocrinology Comprehensive Initial Review",
                "category": "encounter",
                "status": "finished",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": null,
                "summary": "Encounter duration: 2023-03-14 to 2023-03-14",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-BP-1",
                "resourceKey": "Observation/OBS-VANCE-BP-1",
                "timestamp": "2023-03-14T09:35:00Z",
                "dateOnly": "2023-03-14",
                "title": "Measurement: Systolic Blood Pressure",
                "category": "vital-signs",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": "148.0 mmHg",
                "summary": "Observed value: 148.0 mmHg",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-A1C-1",
                "resourceKey": "Observation/OBS-VANCE-A1C-1",
                "timestamp": "2023-03-14T09:45:00Z",
                "dateOnly": "2023-03-14",
                "title": "Measurement: Hemoglobin A1c/Hemoglobin.total in Blood",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": "9.4 %",
                "summary": "Observed value: 9.4 %",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-EGFR-1",
                "resourceKey": "Observation/OBS-VANCE-EGFR-1",
                "timestamp": "2023-03-14T09:45:00Z",
                "dateOnly": "2023-03-14",
                "title": "Measurement: Glomerular filtration rate/1.73 sq M.predicted",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": "58.0 mL/min/1.73m2",
                "summary": "Observed value: 58.0 mL/min/1.73m2",
                "details": {}
              },
              {
                "resourceType": "Observation",
                "resourceId": "OBS-VANCE-CREAT-1",
                "resourceKey": "Observation/OBS-VANCE-CREAT-1",
                "timestamp": "2023-03-14T09:45:00Z",
                "dateOnly": "2023-03-14",
                "title": "Measurement: Creatinine [Mass/volume] in Serum or Plasma",
                "category": "laboratory",
                "status": "final",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": "1.32 mg/dL",
                "summary": "Observed value: 1.32 mg/dL",
                "details": {}
              },
              {
                "resourceType": "MedicationRequest",
                "resourceId": "MED-VANCE-METFORMIN",
                "resourceKey": "MedicationRequest/MED-VANCE-METFORMIN",
                "timestamp": "2023-03-14T10:30:00Z",
                "dateOnly": "2023-03-14",
                "title": "Rx Order: Metformin ER 1000 mg Oral Tablet",
                "category": "medication",
                "status": "active",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": null,
                "summary": "Take 1 tablet by mouth twice daily with meals",
                "details": {}
              },
              {
                "resourceType": "MedicationRequest",
                "resourceId": "MED-VANCE-LISINOPRIL",
                "resourceKey": "MedicationRequest/MED-VANCE-LISINOPRIL",
                "timestamp": "2023-03-14T10:35:00Z",
                "dateOnly": "2023-03-14",
                "title": "Rx Order: Lisinopril 20 mg Oral Tablet",
                "category": "medication",
                "status": "active",
                "encounterId": "ENC-VANCE-2023-03",
                "valueDisplay": null,
                "summary": "Take 1 tablet by mouth daily in the morning",
                "details": {}
              }
            ]
          }
        ],
        "series": {
          "Hemoglobin A1c/Hemoglobin.total in Blood": [
            {
              "timestamp": "2023-03-14T09:45:00Z",
              "date": "2023-03-14",
              "value": 9.4,
              "unit": "%",
              "observationId": "OBS-VANCE-A1C-1",
              "status": "final"
            },
            {
              "timestamp": "2023-09-18T14:15:00Z",
              "date": "2023-09-18",
              "value": 8.3,
              "unit": "%",
              "observationId": "OBS-VANCE-A1C-2",
              "status": "final"
            },
            {
              "timestamp": "2024-02-11T20:30:00Z",
              "date": "2024-02-11",
              "value": 8.8,
              "unit": "%",
              "observationId": "OBS-VANCE-A1C-3",
              "status": "final"
            },
            {
              "timestamp": "2024-08-22T11:15:00Z",
              "date": "2024-08-22",
              "value": 7.6,
              "unit": "%",
              "observationId": "OBS-VANCE-A1C-4",
              "status": "final"
            },
            {
              "timestamp": "2025-05-10T10:15:00Z",
              "date": "2025-05-10",
              "value": 7.0,
              "unit": "%",
              "observationId": "OBS-VANCE-A1C-5",
              "status": "final"
            }
          ],
          "Glomerular filtration rate/1.73 sq M.predicted": [
            {
              "timestamp": "2023-03-14T09:45:00Z",
              "date": "2023-03-14",
              "value": 58.0,
              "unit": "mL/min/1.73m2",
              "observationId": "OBS-VANCE-EGFR-1",
              "status": "final"
            },
            {
              "timestamp": "2023-09-18T14:15:00Z",
              "date": "2023-09-18",
              "value": 56.0,
              "unit": "mL/min/1.73m2",
              "observationId": "OBS-VANCE-EGFR-2",
              "status": "final"
            },
            {
              "timestamp": "2024-08-22T11:15:00Z",
              "date": "2024-08-22",
              "value": 54.0,
              "unit": "mL/min/1.73m2",
              "observationId": "OBS-VANCE-EGFR-3",
              "status": "final"
            },
            {
              "timestamp": "2025-05-10T10:15:00Z",
              "date": "2025-05-10",
              "value": 57.0,
              "unit": "mL/min/1.73m2",
              "observationId": "OBS-VANCE-EGFR-4",
              "status": "final"
            }
          ],
          "Systolic Blood Pressure": [
            {
              "timestamp": "2023-03-14T09:35:00Z",
              "date": "2023-03-14",
              "value": 148.0,
              "unit": "mmHg",
              "observationId": "OBS-VANCE-BP-1",
              "status": "final"
            },
            {
              "timestamp": "2023-09-18T14:05:00Z",
              "date": "2023-09-18",
              "value": 138.0,
              "unit": "mmHg",
              "observationId": "OBS-VANCE-BP-2",
              "status": "final"
            },
            {
              "timestamp": "2024-02-11T20:20:00Z",
              "date": "2024-02-11",
              "value": 154.0,
              "unit": "mmHg",
              "observationId": "OBS-VANCE-BP-3",
              "status": "final"
            },
            {
              "timestamp": "2025-05-10T10:05:00Z",
              "date": "2025-05-10",
              "value": 126.0,
              "unit": "mmHg",
              "observationId": "OBS-VANCE-BP-4",
              "status": "final"
            }
          ],
          "Creatinine [Mass/volume] in Serum or Plasma": [
            {
              "timestamp": "2023-03-14T09:45:00Z",
              "date": "2023-03-14",
              "value": 1.32,
              "unit": "mg/dL",
              "observationId": "OBS-VANCE-CREAT-1",
              "status": "final"
            }
          ],
          "Glucose [Mass/volume] in Serum or Plasma": [
            {
              "timestamp": "2024-02-11T20:30:00Z",
              "date": "2024-02-11",
              "value": 342.0,
              "unit": "mg/dL",
              "observationId": "OBS-VANCE-GLUC-EMER",
              "status": "final"
            }
          ],
          "Microalbumin/Creatinine in Urine": [
            {
              "timestamp": "2024-08-22T11:15:00Z",
              "date": "2024-08-22",
              "value": 185.0,
              "unit": "mg/g",
              "observationId": "OBS-VANCE-ALB-CREAT",
              "status": "final"
            }
          ]
        }
      }
    },
    {
      "stageNumber": 9,
      "title": "Operational Interoperability Decision",
      "description": "Assesses if longitudinal data is complete and referentially safe for outbound clinical transfer.",
      "transferAssessment": {
        "patientId": "PAT-VANCE-01",
        "transferStatus": "TRANSFER READY",
        "isReady": true,
        "checks": [
          {
            "dimension": "Patient Demographics & Identity",
            "passed": true,
            "details": "MRN: \u2713, Name: \u2713, BirthDate: \u2713"
          },
          {
            "dimension": "Encounter Episode Context",
            "passed": true,
            "details": "5 Encounters verified with class & duration."
          },
          {
            "dimension": "Medication Prescriber Attribution",
            "passed": true,
            "details": "3 Medication orders verified against provider registry."
          },
          {
            "dimension": "Referential Completeness",
            "passed": true,
            "details": "0 unresolved reference(s) found in patient sub-graph."
          }
        ],
        "reasons": [
          "All essential clinical and referential transfer prerequisites satisfied."
        ],
        "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
      }
    }
  ],
  "distinctionExplanation": {
    "syntacticValidity": "Valid JSON syntax and primitive structures.",
    "structuralValidity": "Valid FHIR R4 resourceType and schema elements.",
    "referentialIntegrity": "All target pointers resolve to actual existing entities.",
    "semanticUsefulness": "Standard terminologies, sensible timestamps, and complete clinical context."
  }
};

export const FALLBACK_TERMINOLOGY = {
  "catalog": [
    {
      "system": "http://loinc.org",
      "systemName": "LOINC",
      "code": "4548-4",
      "display": "Hemoglobin A1c/Hemoglobin.total in Blood",
      "category": "Laboratory",
      "usedInResource": "Observation",
      "usedInField": "code",
      "clinicalMeaning": "Measures the percentage of glycated hemoglobin in whole blood, providing a 3-month retrospective average of glycemic control.",
      "interopChallenge": "Local hospital systems frequently code this test as 'GLYC_HGB' or 'HBA1C_TEST'. Without standard LOINC 4548-4, receiving systems cannot aggregate diabetes registries across care networks."
    },
    {
      "system": "http://loinc.org",
      "systemName": "LOINC",
      "code": "33914-3",
      "display": "Glomerular filtration rate/1.73 sq M.predicted",
      "category": "Laboratory",
      "usedInResource": "Observation",
      "usedInField": "code",
      "clinicalMeaning": "Calculated rate of kidney filtration per body surface area, crucial for staging chronic kidney disease and adjusting renal drug clearance.",
      "interopChallenge": "Different labs use older MDRD equations vs. modern CKD-EPI 2021 equations. If the LOINC code or method is unstandardized, medication dosing calculators cannot safely parse the value."
    },
    {
      "system": "http://loinc.org",
      "systemName": "LOINC",
      "code": "49563-0",
      "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method",
      "category": "Laboratory",
      "usedInResource": "Observation",
      "usedInField": "code",
      "clinicalMeaning": "Sensitive biomarker for myocardial injury and necrosis; indispensable for rapid triaging of acute myocardial infarction.",
      "interopChallenge": "Standard vs. high-sensitivity troponin assays have different reference ranges (ng/mL vs. ng/L). Failure to standardize LOINC codes can lead to misinterpretation of abnormal thresholds."
    },
    {
      "system": "http://loinc.org",
      "systemName": "LOINC",
      "code": "85354-9",
      "display": "Blood pressure panel with all children optional",
      "category": "Vital Signs",
      "usedInResource": "Observation",
      "usedInField": "code",
      "clinicalMeaning": "Container code representing paired systolic and diastolic arterial blood pressure measurements.",
      "interopChallenge": "If a clinic records BP as free text '120/80' inside a valueString instead of nested systolic (8480-6) and diastolic (8462-4) quantitative components, CDS engines cannot trigger hypertension protocols."
    },
    {
      "system": "http://loinc.org",
      "systemName": "LOINC",
      "code": "20150-9",
      "display": "FEV1",
      "category": "Pulmonary Function",
      "usedInResource": "Observation",
      "usedInField": "code",
      "clinicalMeaning": "Forced Expiratory Volume in 1 second during maximal spirometric exhalation.",
      "interopChallenge": "Must be standardized with both absolute liters and percent of predicted value for pediatric asthma monitoring."
    },
    {
      "system": "http://snomed.info/sct",
      "systemName": "SNOMED CT",
      "code": "44054006",
      "display": "Type 2 diabetes mellitus",
      "category": "Clinical Condition",
      "usedInResource": "Condition",
      "usedInField": "code",
      "clinicalMeaning": "Polygenic metabolic disorder characterized by peripheral insulin resistance and progressive pancreatic beta-cell dysfunction.",
      "interopChallenge": "SNOMED CT provides polyhierarchical relationships (e.g. is-a 'Diabetes mellitus', is-a 'Endocrine disease'), enabling rich semantic querying that flat classification systems cannot match."
    },
    {
      "system": "http://snomed.info/sct",
      "systemName": "SNOMED CT",
      "code": "401303003",
      "display": "Acute ST segment elevation myocardial infarction",
      "category": "Clinical Condition",
      "usedInResource": "Condition",
      "usedInField": "code",
      "clinicalMeaning": "Acute transmural cardiac ischemia resulting in characteristic ECG ST-elevation requiring emergent revascularization.",
      "interopChallenge": "Clinical decision support systems rely on precise SNOMED concepts to distinguish between NSTEMI and STEMI for urgent catheterization lab activation."
    },
    {
      "system": "http://snomed.info/sct",
      "systemName": "SNOMED CT",
      "code": "232717009",
      "display": "Coronary artery bypass grafting",
      "category": "Procedure",
      "usedInResource": "Procedure",
      "usedInField": "code",
      "clinicalMeaning": "Surgical procedure where autologous venous or arterial conduits are grafted to bypass occluded coronary arteries.",
      "interopChallenge": "Hospital surgical billing systems often use CPT codes (e.g. 33533) while electronic clinical records use SNOMED CT. Interoperability requires bidirectional mapping."
    },
    {
      "system": "http://hl7.org/fhir/sid/icd-10-cm",
      "systemName": "ICD-10-CM",
      "code": "E11.9",
      "display": "Type 2 diabetes mellitus without complications",
      "category": "Diagnosis / Classification",
      "usedInResource": "Condition",
      "usedInField": "code",
      "clinicalMeaning": "Standard diagnostic billing classification for adult-onset diabetes mellitus without specified acute or chronic microvascular manifestations.",
      "interopChallenge": "ICD-10-CM is optimized for statistical reporting and reimbursement rather than clinical granular documentation. Combining it with SNOMED CT in FHIR CodeableConcepts bridges billing and clinical care."
    },
    {
      "system": "http://hl7.org/fhir/sid/icd-10-cm",
      "systemName": "ICD-10-CM",
      "code": "N18.31",
      "display": "Chronic kidney disease, stage 3a",
      "category": "Diagnosis / Classification",
      "usedInResource": "Condition",
      "usedInField": "code",
      "clinicalMeaning": "Moderate reduction in glomerular filtration rate (eGFR 45-59 mL/min/1.73 m2).",
      "interopChallenge": "Earlier ICD-9 codes lacked stage-specific precision (e.g. separating Stage 3 into 3a and 3b), causing historical longitudinal gaps during EHR data migrations."
    },
    {
      "system": "http://hl7.org/fhir/sid/icd-10-cm",
      "systemName": "ICD-10-CM",
      "code": "I21.09",
      "display": "ST elevation myocardial infarction involving anterior wall",
      "category": "Diagnosis / Classification",
      "usedInResource": "Condition",
      "usedInField": "code",
      "clinicalMeaning": "Anatomically localized acute coronary thrombosis of the left anterior descending artery.",
      "interopChallenge": "Administrative claims data often contain this code months after discharge, whereas real-time clinical exchange requires immediate FHIR Encounter and Condition messaging."
    },
    {
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "systemName": "RxNorm",
      "code": "860975",
      "display": "Metformin hydrochloride 1000 MG Extended Release Oral Tablet",
      "category": "Medication Clinical Drug",
      "usedInResource": "MedicationRequest",
      "usedInField": "medicationCodeableConcept",
      "clinicalMeaning": "Biguanide oral antidiabetic drug in extended-release tablet form with precise 1000 mg active ingredient formulation.",
      "interopChallenge": "National Drug Codes (NDCs) change whenever packaging or manufacturer changes (thousands of NDCs exist for Metformin). RxNorm normalizes all NDC variants into a single clinical concept."
    },
    {
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "systemName": "RxNorm",
      "code": "314076",
      "display": "Lisinopril 20 MG Oral Tablet",
      "category": "Medication Clinical Drug",
      "usedInResource": "MedicationRequest",
      "usedInField": "medicationCodeableConcept",
      "clinicalMeaning": "Angiotensin-converting enzyme (ACE) inhibitor for treatment of hypertension and renal protection in diabetic nephropathy.",
      "interopChallenge": "Pharmacy dispensing systems and hospital formularies often use brand aliases (Prinivil, Zestril). RxNorm enables universal automated cross-allergy checks."
    },
    {
      "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      "systemName": "RxNorm",
      "code": "1545653",
      "display": "Empagliflozin 25 MG Oral Tablet",
      "category": "Medication Clinical Drug",
      "usedInResource": "MedicationRequest",
      "usedInField": "medicationCodeableConcept",
      "clinicalMeaning": "Sodium-glucose co-transporter 2 (SGLT2) inhibitor with documented cardiorenal mortality reduction in diabetic chronic kidney disease.",
      "interopChallenge": "Ensures seamless transmission across ambulatory e-prescribing networks to community retail pharmacies."
    }
  ],
  "lesson": {
    "thesis": "FHIR structures healthcare information into resources and references; terminology systems provide unambiguous, computable meaning to clinical concepts.",
    "problemStatement": "A FHIR resource can be 100% syntactically valid JSON and pass all schema validators while still failing completely at interoperability. For instance, an Observation with code: {text: 'A1C'} and no system/code cannot be computed by an external clinical decision support algorithm or quality registry.",
    "theFourSystems": [
      {
        "system": "LOINC",
        "authority": "Regenstrief Institute",
        "role": "Questions & Observations (Labs, Vitals, Survey Instruments)",
        "example": "4548-4 -> HbA1c in Blood"
      },
      {
        "system": "SNOMED CT",
        "authority": "SNOMED International",
        "role": "Clinical Findings, Diseases, Anatomical Sites, Surgical Procedures",
        "example": "44054006 -> Type 2 diabetes mellitus"
      },
      {
        "system": "ICD-10-CM",
        "authority": "WHO / CDC NCHS",
        "role": "Mortality, Morbidity Classification & Administrative Billing",
        "example": "E11.9 -> Type 2 diabetes mellitus without complications"
      },
      {
        "system": "RxNorm",
        "authority": "U.S. National Library of Medicine",
        "role": "Normalized Clinical Drugs (Ingredient + Strength + Dose Form)",
        "example": "860975 -> Metformin HCl 1000 MG ER Tablet"
      }
    ]
  }
};

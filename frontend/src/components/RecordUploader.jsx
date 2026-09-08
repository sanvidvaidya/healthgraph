import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  X, 
  RotateCcw, 
  Activity, 
  FileCode, 
  Layers, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

const PRESETS = [
  {
    id: 'apple-health',
    title: 'Apple Health Vitals Export',
    patientName: 'Marcus Reed (44y Male)',
    description: 'Smartwatch resting heart rate, step count, and fasting glucose export.',
    badge: 'Wearable Data',
    bundle: {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "PAT-REED-01",
            identifier: [{ system: "https://apple.com/health", value: "APPL-98214" }],
            active: true,
            name: [{ family: "Reed", given: ["Marcus"] }],
            gender: "male",
            birthDate: "1980-06-22"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: "OBS-REED-HR-01",
            status: "final",
            category: [{ coding: [{ code: "vital-signs", display: "Vital Signs" }] }],
            code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
            subject: { reference: "Patient/PAT-REED-01" },
            effectiveDateTime: "2024-01-15T08:30:00Z",
            valueQuantity: { value: 68, unit: "beats/minute", code: "/min" }
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: "OBS-REED-GLUC-01",
            status: "final",
            category: [{ coding: [{ code: "laboratory", display: "Laboratory" }] }],
            code: { coding: [{ system: "http://loinc.org", code: "1558-6", display: "Fasting glucose" }] },
            subject: { reference: "Patient/PAT-REED-01" },
            effectiveDateTime: "2024-01-15T08:30:00Z",
            valueQuantity: { value: 92, unit: "mg/dL", code: "mg/dL" }
          }
        }
      ]
    }
  },
  {
    id: 'quest-labs',
    title: 'Quest Diagnostics Lab Panel',
    patientName: 'Sarah Miller (34y Female)',
    description: 'Comprehensive Metabolic Panel with standard LOINC codes and reference ranges.',
    badge: 'Laboratory Panel',
    bundle: {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "PAT-MILLER-02",
            name: [{ family: "Miller", given: ["Sarah", "J."] }],
            gender: "female",
            birthDate: "1990-11-04"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: "OBS-MILLER-A1C-01",
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "4548-4", display: "Hemoglobin A1c" }] },
            subject: { reference: "Patient/PAT-MILLER-02" },
            effectiveDateTime: "2024-02-10T11:00:00Z",
            valueQuantity: { value: 5.4, unit: "%", code: "%" }
          }
        },
        {
          resource: {
            resourceType: "Observation",
            id: "OBS-MILLER-EGFR-01",
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "33914-3", display: "Glomerular filtration rate" }] },
            subject: { reference: "Patient/PAT-MILLER-02" },
            effectiveDateTime: "2024-02-10T11:00:00Z",
            valueQuantity: { value: 98, unit: "mL/min", code: "mL/min" }
          }
        }
      ]
    }
  },
  {
    id: 'hospital-discharge',
    title: 'Hospital Discharge Record',
    patientName: 'David Kim (67y Male)',
    description: 'Inpatient cardiology admission, encounter anchor, and discharge prescriptions.',
    badge: 'Inpatient EHR',
    bundle: {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "PAT-KIM-03",
            name: [{ family: "Kim", given: ["David"] }],
            gender: "male",
            birthDate: "1957-03-19"
          }
        },
        {
          resource: {
            resourceType: "Encounter",
            id: "ENC-KIM-HOSP-01",
            status: "finished",
            class: { code: "IMP", display: "inpatient encounter" },
            subject: { reference: "Patient/PAT-KIM-03" },
            period: { start: "2024-03-01T06:00:00Z", end: "2024-03-04T14:00:00Z" }
          }
        },
        {
          resource: {
            resourceType: "MedicationRequest",
            id: "MED-KIM-ATORV-01",
            status: "active",
            intent: "order",
            medicationCodeableConcept: {
              coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "259255", display: "Atorvastatin 40 MG Oral Tablet" }]
            },
            subject: { reference: "Patient/PAT-KIM-03" },
            encounter: { reference: "Encounter/ENC-KIM-HOSP-01" }
          }
        }
      ]
    }
  },
  {
    id: 'fracture-test',
    title: 'Referential Anomaly Test File',
    patientName: 'Anomaly Subject (Broken Link)',
    description: 'Syntactically valid record with an unresolved practitioner foreign-key pointer.',
    badge: 'Integrity Test',
    bundle: {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "PAT-ANOMALY-99",
            name: [{ family: "Subject", given: ["Anomaly"] }],
            gender: "other",
            birthDate: "1985-01-01"
          }
        },
        {
          resource: {
            resourceType: "MedicationRequest",
            id: "MED-FRACTURE-99",
            status: "active",
            intent: "order",
            medicationCodeableConcept: {
              coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "860975", display: "Metformin 500mg" }]
            },
            subject: { reference: "Patient/PAT-ANOMALY-99" },
            requester: { reference: "Practitioner/PRAC-DOES-NOT-EXIST-404", display: "Missing Doctor" }
          }
        }
      ]
    }
  }
];

export default function RecordUploader({ isOpen, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'file' | 'raw'
  const [rawJson, setRawJson] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'

  if (!isOpen) return null;

  const handleIngest = async (bundleData) => {
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Validating FHIR R4 schema and indexing references...' });

    try {
      const res = await api.importBundle(bundleData, importMode);
      setStatusMsg({ 
        type: 'success', 
        text: `Successfully ingested ${res.totalResources} total resources. Live knowledge graph re-indexed.` 
      });

      setTimeout(() => {
        if (onImportSuccess) {
          onImportSuccess(res.importedPatientId);
        }
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Ingestion failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        handleIngest(parsed);
      } catch (err) {
        setStatusMsg({ type: 'error', text: `Failed to parse JSON file: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleRawSubmit = () => {
    if (!rawJson.trim()) return;
    try {
      const parsed = JSON.parse(rawJson);
      handleIngest(parsed);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Invalid JSON syntax: ${err.message}` });
    }
  };

  const handleResetCohort = async () => {
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Resetting to standard baseline cohort...' });
    try {
      await api.resetBundle();
      setStatusMsg({ type: 'success', text: 'Reset complete. Standard cohort restored.' });
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess('PAT-VANCE-01');
        onClose();
      }, 1000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Reset failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 9, 12, 0.78)',
      backdropFilter: 'blur(16px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="modal-surface-enter"
        style={{
          background: 'var(--surface-white)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          width: '100%',
          maxWidth: '720px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--canvas-bg)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} color="var(--spruce)" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                Import Health Records
              </h3>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>FHIR R4</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--ink-muted)' }}>
              Ingest patient bundles or individual resources to explore custom records in the live timeline and graph.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 22px',
          borderBottom: '1px solid var(--border-hairline)',
          background: 'var(--surface-white)'
        }}>
          <button
            onClick={() => setActiveTab('presets')}
            className="studio-mode-pill"
            style={{
              background: activeTab === 'presets' ? 'var(--spruce-light)' : 'transparent',
              color: activeTab === 'presets' ? 'var(--spruce)' : 'var(--ink-secondary)',
              borderColor: activeTab === 'presets' ? 'var(--spruce)' : 'transparent',
              fontWeight: activeTab === 'presets' ? 600 : 500
            }}
          >
            <Sparkles size={12} />
            <span>Sample Clinical Presets</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className="studio-mode-pill"
            style={{
              background: activeTab === 'file' ? 'var(--spruce-light)' : 'transparent',
              color: activeTab === 'file' ? 'var(--spruce)' : 'var(--ink-secondary)',
              borderColor: activeTab === 'file' ? 'var(--spruce)' : 'transparent',
              fontWeight: activeTab === 'file' ? 600 : 500
            }}
          >
            <Upload size={12} />
            <span>Upload JSON File</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className="studio-mode-pill"
            style={{
              background: activeTab === 'raw' ? 'var(--spruce-light)' : 'transparent',
              color: activeTab === 'raw' ? 'var(--spruce)' : 'var(--ink-secondary)',
              borderColor: activeTab === 'raw' ? 'var(--spruce)' : 'transparent',
              fontWeight: activeTab === 'raw' ? 600 : 500
            }}
          >
            <FileCode size={12} />
            <span>Paste Raw JSON</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: 1-CLICK CLINICAL PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => !isProcessing && handleIngest(p.bundle)}
                  style={{
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: isProcessing ? 'wait' : 'pointer',
                    background: 'var(--surface-white)',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--spruce)'; e.currentTarget.style.background = 'var(--spruce-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--surface-white)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--spruce)' }}>
                      {p.badge}
                    </span>
                    <ArrowRight size={12} color="var(--ink-muted)" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '2px' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 500, marginBottom: '4px' }}>
                    {p.patientName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                    {p.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'file' && (
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '8px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--canvas-bg)',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                id="file-upload-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload-input" style={{ cursor: 'pointer' }}>
                <Upload size={28} color="var(--spruce)" style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Click to browse or drop a FHIR JSON file here
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  Supports FHIR R4 Bundle or single resource JSON
                </div>
              </label>
            </div>
          )}

          {/* TAB 3: PASTE RAW JSON */}
          {activeTab === 'raw' && (
            <div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder='Paste FHIR R4 JSON here: {"resourceType": "Bundle", ...}'
                style={{
                  width: '100%',
                  height: '180px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  outline: 'none',
                  resize: 'vertical',
                  background: '#090D13',
                  color: '#E6EDF3'
                }}
              />
              <button
                onClick={handleRawSubmit}
                disabled={!rawJson.trim() || isProcessing}
                className="studio-control-btn active"
                style={{ marginTop: '10px', width: '100%', justifyContent: 'center', padding: '8px' }}
              >
                <span>Parse and Ingest JSON</span>
              </button>
            </div>
          )}

          {/* Status Alert */}
          {statusMsg && (
            <div style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: statusMsg.type === 'error' ? 'var(--crimson-light)' : statusMsg.type === 'success' ? 'var(--emerald-light)' : 'var(--spruce-light)',
              color: statusMsg.type === 'error' ? 'var(--crimson)' : statusMsg.type === 'success' ? 'var(--emerald)' : 'var(--spruce)',
              border: `1px solid ${statusMsg.type === 'error' ? 'var(--crimson)' : statusMsg.type === 'success' ? 'var(--emerald)' : 'var(--spruce)'}`
            }}>
              {statusMsg.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--border-hairline)',
          background: 'var(--canvas-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--ink-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Ingestion Mode:</span>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
                background: 'var(--surface-white)'
              }}
            >
              <option value="merge">Merge (Keep existing patients)</option>
              <option value="replace">Replace (Clean slate)</option>
            </select>
          </div>

          <button
            onClick={handleResetCohort}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-secondary)',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <RotateCcw size={11} />
            <span>Reset Default Cohort</span>
          </button>
        </div>
      </div>
    </div>
  );
}

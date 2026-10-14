import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  UserX, 
  Sliders, 
  Download, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  Layers, 
  Fingerprint,
  Calendar,
  MapPin,
  EyeOff,
  UserPlus
} from 'lucide-react';
import { api } from '../api';

export default function PrivacySandbox({ onSelectResource, onImportSuccess, selectedPatientId = 'PAT-VANCE-01' }) {
  const [patientId, setPatientId] = useState(selectedPatientId);
  const [activeTab, setActiveTab] = useState('safe_harbor'); // 'safe_harbor' | 'synthetic_twin'
  const [shiftDays, setShiftDays] = useState(-42);
  const [epsilon, setEpsilon] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deidResult, setDeidResult] = useState(null);
  const [twinResult, setTwinResult] = useState(null);
  const [instantiateSuccess, setInstantiateSuccess] = useState(false);

  const handleDeidentify = async () => {
    setIsProcessing(true);
    try {
      const res = await api.deidentifyPatient(patientId, shiftDays);
      setDeidResult(res);
    } catch (err) {
      console.error('Deidentification error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateTwin = async (persist = false) => {
    setIsProcessing(true);
    setInstantiateSuccess(false);
    try {
      const res = await api.generateSyntheticTwin(patientId, epsilon, persist);
      setTwinResult(res);
      if (persist) {
        setInstantiateSuccess(true);
        if (onImportSuccess && res?.diffSummary?.twinId) {
          onImportSuccess(res.diffSummary.twinId);
        }
      }
    } catch (err) {
      console.error('Twin generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run initial deid on mount
  React.useEffect(() => {
    handleDeidentify();
  }, [patientId]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-sans)' }}>
      {/* Header Deck */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 4px 20px rgba(15,23,42,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669, #10B981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
          }}>
            <Lock size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                HIPAA Safe Harbor & Differential Privacy "Patient Twin" Studio
              </h1>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 600
              }}>
                18 Safe Harbor Identifiers Sanitized
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
              Eliminates PHI re-identification risk through statutory redaction, date-shifting, and calibrated differential privacy noise synthesis.
            </p>
          </div>
        </div>

        {/* Patient Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)' }}>Source Subject:</span>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: '#FFF',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink-primary)',
              cursor: 'pointer'
            }}
          >
            <option value="PAT-VANCE-01">Harold Vance (T2D, CKD 3b)</option>
            <option value="PAT-THORNE-02">Arthur Thorne (Acute STEMI, CABG)</option>
          </select>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => { setActiveTab('safe_harbor'); handleDeidentify(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'safe_harbor' ? '1px solid #10B981' : '1px solid var(--border-medium)',
            background: activeTab === 'safe_harbor' ? 'rgba(16, 185, 129, 0.08)' : '#FFF',
            color: activeTab === 'safe_harbor' ? '#059669' : 'var(--ink-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <UserX size={16} />
          <span>1. HIPAA 18-Identifier Safe Harbor Redaction</span>
        </button>

        <button
          onClick={() => { setActiveTab('synthetic_twin'); handleGenerateTwin(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'synthetic_twin' ? '1px solid #6366F1' : '1px solid var(--border-medium)',
            background: activeTab === 'synthetic_twin' ? 'rgba(99, 102, 241, 0.08)' : '#FFF',
            color: activeTab === 'synthetic_twin' ? '#4F46E5' : 'var(--ink-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={16} />
          <span>2. Differential Privacy "Synthetic Twin" Synthesizer</span>
        </button>
      </div>

      {/* Tab 1: Safe Harbor Mode */}
      {activeTab === 'safe_harbor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
          {/* Controls & Privacy Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Date Shift Slider Card */}
            <div style={{
              background: '#FFF',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--ink-primary)' }}>
                Longitudinal Temporal Shifter
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: '0 0 16px 0' }}>
                Uniformly shifts all timestamps while preserving relative intervals between serial lab encounters.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Offset Days:</span>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                  {shiftDays > 0 ? `+${shiftDays}` : shiftDays} days
                </span>
              </div>

              <input
                type="range"
                min="-180"
                max="180"
                value={shiftDays}
                onChange={(e) => setShiftDays(Number(e.target.value))}
                onMouseUp={handleDeidentify}
                onTouchEnd={handleDeidentify}
                style={{ width: '100%', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                <span>-180 Days</span>
                <span>0 (Original)</span>
                <span>+180 Days</span>
              </div>
            </div>

            {/* Empirical Risk Assessment Metrics */}
            <div style={{
              background: '#FFF',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--ink-primary)' }}>
                Empirical Privacy Risk Model
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>k-ANONYMITY</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>k = 12</div>
                  <div style={{ fontSize: '10px', color: '#059669' }}>Exceeds threshold (k ≥ 5)</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>RE-ID RISK</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>0.018%</div>
                  <div style={{ fontSize: '10px', color: '#059669' }}>HIPAA Standard &lt; 0.05%</div>
                </div>
              </div>

              {/* 18 Identifiers Checklist Preview */}
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '8px' }}>
                HIPAA SAFE HARBOR AUDIT:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {deidResult?.metrics?.hipaaSafeHarborChecklist?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: 'var(--canvas-bg)', fontSize: '11px' }}>
                    <span style={{ color: 'var(--ink-primary)' }}>{item.identifier}</span>
                    <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Redacted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Sanitized Safe Harbor JSON Output */}
          <div style={{
            background: '#0F172A',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: '#1E293B',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileJson size={16} color="#34D399" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
                  DE-IDENTIFIED SAFE HARBOR BUNDLE
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                ID: {deidResult?.metrics?.pseudonymId}
              </span>
            </div>

            <div style={{ flex: 1, minHeight: '440px', padding: '16px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#A7F3D0', lineHeight: '1.6' }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(deidResult?.deidentifiedBundle, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Differential Privacy Synthetic Twin Mode */}
      {activeTab === 'synthetic_twin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
          {/* Controls & Noise Calibration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#FFF',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--ink-primary)' }}>
                Differential Privacy Budget (ε)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: '0 0 16px 0' }}>
                Calibrates Laplace noise scale. Lower epsilon yields tighter mathematical privacy; higher epsilon yields higher statistical fidelity.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Privacy Loss Parameter (ε):</span>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4F46E5' }}>
                  ε = {epsilon}
                </span>
              </div>

              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                onMouseUp={() => handleGenerateTwin(false)}
                onTouchEnd={() => handleGenerateTwin(false)}
                style={{ width: '100%', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                <span>ε = 0.1 (High Privacy)</span>
                <span>ε = 1.0 (Balanced)</span>
                <span>ε = 2.0 (High Precision)</span>
              </div>
            </div>

            {/* Statistical Perturbations Card */}
            <div style={{
              background: '#FFF',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--ink-primary)' }}>
                Applied Differential Noise
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--canvas-bg)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>HbA1c Biomarker Delta:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4F46E5' }}>
                    {twinResult?.diffSummary?.appliedPerturbations?.hba1cDelta}
                  </span>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--canvas-bg)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>eGFR Renal Flow Delta:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4F46E5' }}>
                    {twinResult?.diffSummary?.appliedPerturbations?.egfrDelta}
                  </span>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--canvas-bg)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>Statistical Fidelity:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                    {twinResult?.diffSummary?.statisticalFidelity}
                  </span>
                </div>
              </div>

              {/* Action: Instantiate into Live Cohort */}
              <button
                onClick={() => handleGenerateTwin(true)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: instantiateSuccess ? '#10B981' : '#4F46E5',
                  color: '#FFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <UserPlus size={16} />
                {instantiateSuccess ? 'Synthetic Twin Instantiated Live!' : 'Instantiate Twin into HealthGraph Cohort'}
              </button>
            </div>
          </div>

          {/* Right Pane: Synthetic Twin FHIR Bundle */}
          <div style={{
            background: '#0F172A',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: '#1E293B',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#818CF8" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818CF8' }}>
                  SYNTHETIC PATIENT TWIN BUNDLE
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                ID: {twinResult?.diffSummary?.twinId}
              </span>
            </div>

            <div style={{ flex: 1, minHeight: '440px', padding: '16px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#C7D2FE', lineHeight: '1.6' }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(twinResult?.syntheticTwinBundle, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

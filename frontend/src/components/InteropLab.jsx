import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import anime from 'animejs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  FileText, 
  GitBranch, 
  Database, 
  Clock, 
  Send,
  Code2,
  RefreshCw,
  Zap,
  Play,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function InteropLab({ onSelectResource }) {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(0);
  const [anomalyMode, setAnomalyMode] = useState(false);
  const [isSimulatingPacket, setIsSimulatingPacket] = useState(false);

  const [customPayload, setCustomPayload] = useState(JSON.stringify({
    "resourceType": "Observation",
    "id": "CUSTOM-OBS-01",
    "status": "final",
    "code": {
      "coding": [{ "system": "http://loinc.org", "code": "4548-4", "display": "HbA1c" }]
    },
    "subject": { "reference": "Patient/PAT-VANCE-01" },
    "valueQuantity": { "value": 7.5, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%" }
  }, null, 2));
  const [customValidationResult, setCustomValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const conduitSvgRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getInteropPipeline();
        setPipelineData(data);
      } catch (err) {
        console.error('Failed to load interop pipeline:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Anime.js: Animate SVG packet traveling through the pipeline conduit when stage changes
  useEffect(() => {
    if (conduitSvgRef.current) {
      const packet = conduitSvgRef.current.querySelector('#conduit-packet');
      if (packet) {
        anime({
          targets: packet,
          cx: 50 + (selectedStage * 110),
          duration: 500,
          easing: 'easeOutQuad'
        });
      }
    }
  }, [selectedStage]);

  // Anime.js: Animate full packet transit simulation
  const handleRunSimulation = () => {
    if (isSimulatingPacket || !conduitSvgRef.current) return;
    setIsSimulatingPacket(true);
    const packet = conduitSvgRef.current.querySelector('#conduit-packet');

    anime({
      targets: packet,
      cx: [50, 50 + (8 * 110)],
      duration: 2200,
      easing: 'easeInOutQuad',
      update: (anim) => {
        const stageIndex = Math.min(8, Math.floor((anim.progress / 100) * 9));
        setSelectedStage(stageIndex);
      },
      complete: () => {
        setIsSimulatingPacket(false);
      }
    });
  };

  const handleCustomValidate = async () => {
    setIsValidating(true);
    try {
      const parsed = JSON.parse(customPayload);
      const res = await api.validateResource(parsed);
      setCustomValidationResult(res);
    } catch (err) {
      setCustomValidationResult({
        isValid: false,
        summary: `JSON Parse Error: ${err.message}`,
        findings: [{ layer: 1, severity: 'ERROR', message: err.message, path: '$' }]
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
        <div>CONNECTING TO INTEROPERABILITY PIPELINE ENGINE...</div>
      </div>
    );
  }

  const stages = pipelineData?.stages || [];
  const curr = stages[selectedStage] || {};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header Strip & Real vs Conceptual Label */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-spruce">Information System Ingestion Pipeline</span>
            <span className="badge badge-conceptual">CONCEPTUAL CONDUIT + DETERMINISTIC ENGINE DATA</span>
          </div>

          {/* Anomaly Simulation Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-white)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>FLOW SIMULATION:</span>
            <button
              onClick={() => setAnomalyMode(false)}
              style={{
                padding: '3px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: !anomalyMode ? 600 : 400,
                background: !anomalyMode ? 'var(--spruce-light)' : 'transparent',
                color: !anomalyMode ? 'var(--spruce)' : 'var(--ink-secondary)',
                cursor: 'pointer'
              }}
            >
              Standard (Eleanor Vance)
            </button>
            <button
              onClick={() => {
                setAnomalyMode(true);
                setSelectedStage(4); // Jump to Reference Resolution to show failure
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: anomalyMode ? 600 : 400,
                background: anomalyMode ? 'var(--crimson-light)' : 'transparent',
                color: anomalyMode ? 'var(--crimson)' : 'var(--ink-secondary)',
                cursor: 'pointer'
              }}
            >
              Inject Dangling Ref Anomaly
            </button>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          The 9-Stage Interoperability Laboratory
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', maxWidth: '850px' }}>
          Healthcare interoperability is not simply displaying JSON. It is an active engineering pipeline:
          records are ingested from heterogeneous source formats, packaged into FHIR R4 bundles, audited across 3 validation layers,
          stamped with provenance, resolved across references, normalized into relational storage, mapped to a knowledge graph, and evaluated for transfer readiness.
        </p>

        {/* 4 Levels of Validity Spectrum Ribbon (Open Hairline Layout) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginTop: '24px',
          padding: '16px 0',
          borderTop: '1px solid var(--border-hairline)',
          borderBottom: '1px solid var(--border-hairline)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--spruce)' }}>
              01 SYNTACTIC VALIDITY
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Valid JSON grammar and primitive encodings. Syntactic validity guarantees parsing, but not clinical safety.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--spruce)' }}>
              02 STRUCTURAL CONFORMANCE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Conforms to FHIR R4 schema definitions, cardinalities, mandatory fields, and typed element arrays.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--spruce)' }}>
              03 REFERENTIAL INTEGRITY
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Every reference (<code style={{ fontSize: '11px' }}>Patient/PAT-01</code>) resolves forward to a real ingested entity.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--spruce)' }}>
              04 SEMANTIC GROUNDING
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              Grounds findings in standard ontologies (LOINC, SNOMED CT, RxNorm) with authoritative canonical URIs.
            </div>
          </div>
        </div>
      </div>

      {/* Continuous Visual Assembly Machine Across Canvas */}
      <div style={{
        background: 'var(--surface-white)',
        border: '1px solid var(--border-medium)',
        borderRadius: '8px',
        padding: '24px 20px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-subtle)',
        overflowX: 'auto'
      }}>
        <div style={{ minWidth: '960px' }}>
          {/* Machine Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulatingPacket}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: 'var(--spruce)',
                  color: '#FFF',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: isSimulatingPacket ? 'not-allowed' : 'pointer'
                }}
              >
                <Play size={12} />
                <span>{isSimulatingPacket ? 'Simulating Transit...' : 'Animate Full Machine Transit'}</span>
              </button>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                {anomalyMode ? '● ANOMALY INJECTION ACTIVE (Cohort 05)' : '● STANDARD INGESTION ACTIVE (Eleanor Vance)'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              <span>ACTIVE STATION: <strong>0{selectedStage + 1} / 09</strong></span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span>CLICK ANY STATION TO INSPECT</span>
            </div>
          </div>

          {/* Continuous Integrated SVG Pipeline Conduit Machine */}
          <div ref={conduitSvgRef} style={{ position: 'relative', width: '100%', padding: '10px 0' }}>
            <svg width="100%" height="90" viewBox="0 0 980 90" style={{ overflow: 'visible' }}>
              {/* Background Guideline Track */}
              <line x1="50" y1="45" x2="930" y2="45" stroke="var(--border-medium)" strokeWidth="2" strokeDasharray="4 4" />

              {/* Active Conduit Progress */}
              <line 
                x1="50" 
                y1="45" 
                x2={50 + (selectedStage * 110)} 
                y2="45" 
                stroke={anomalyMode && selectedStage >= 4 ? 'var(--crimson)' : 'var(--spruce)'} 
                strokeWidth="3" 
              />

              {/* Anomaly Fracture Effect (Between Station 4 and 5) */}
              {anomalyMode && (
                <g>
                  <path 
                    className="broken-edge"
                    d="M 470 45 L 485 36 L 495 54 L 510 45" 
                    fill="none" 
                    stroke="var(--crimson)" 
                    strokeWidth="3" 
                  />
                  <text x="490" y="24" fill="var(--crimson)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
                    ✕ REF FRACTURE (PRAC-UNKNOWN-99)
                  </text>
                </g>
              )}

              {/* 9 Machine Stations Positioned Directly On Conduit Track */}
              {stages.map((st, idx) => {
                const cx = 50 + (idx * 110);
                const cy = 45;
                const isSelected = selectedStage === idx;
                const isPassed = selectedStage > idx;
                const isBroken = anomalyMode && idx >= 4;

                const ringColor = isSelected 
                  ? (isBroken ? 'var(--crimson)' : 'var(--spruce)') 
                  : isPassed 
                    ? (isBroken ? 'var(--crimson)' : 'var(--emerald)') 
                    : 'var(--ink-muted)';

                const fillColor = isSelected
                  ? (isBroken ? 'var(--crimson-light)' : 'var(--spruce-light)')
                  : 'var(--surface-white)';

                return (
                  <g 
                    key={st.stageNumber} 
                    onClick={() => setSelectedStage(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer halo when selected */}
                    {isSelected && (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r="22" 
                        fill="none" 
                        stroke={ringColor} 
                        strokeWidth="1.5" 
                        strokeDasharray="4 2" 
                        opacity="0.8"
                      />
                    )}

                    {/* Station Node Disk */}
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="16" 
                      fill={fillColor} 
                      stroke={ringColor} 
                      strokeWidth={isSelected ? "2.5" : "2"} 
                    />

                    {/* Station Number Inside Disk */}
                    <text 
                      x={cx} 
                      y={cy + 4} 
                      textAnchor="middle" 
                      fontFamily="var(--font-mono)" 
                      fontSize="10" 
                      fontWeight="700" 
                      fill={ringColor}
                    >
                      0{st.stageNumber}
                    </text>

                    {/* Station Title Label Above/Below */}
                    <text 
                      x={cx} 
                      y={cy + 30} 
                      textAnchor="middle" 
                      fontFamily="var(--font-sans)" 
                      fontSize="11" 
                      fontWeight={isSelected ? "700" : "500"} 
                      fill={isSelected ? (isBroken ? 'var(--crimson)' : 'var(--spruce)') : 'var(--ink-primary)'}
                    >
                      {st.title.split(' ')[0]}
                    </text>

                    <text 
                      x={cx} 
                      y={cy - 22} 
                      textAnchor="middle" 
                      fontFamily="var(--font-mono)" 
                      fontSize="8" 
                      fontWeight="600" 
                      fill="var(--ink-muted)"
                      letterSpacing="0.04em"
                    >
                      {idx === 0 ? 'SOURCES' : idx === 8 ? (anomalyMode ? 'BLOCKED' : 'GATE') : `STATION`}
                    </text>
                  </g>
                );
              })}

              {/* Animated Floating Packet Object */}
              <circle
                id="conduit-packet"
                cx={50 + (selectedStage * 110)}
                cy="45"
                r="7"
                fill={anomalyMode && selectedStage >= 4 ? 'var(--crimson)' : 'var(--spruce)'}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Stage Deep-Dive Surface (Motion Layout Transition) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedStage}-${anomalyMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '28px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          {/* Stage Headline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${anomalyMode && selectedStage >= 4 ? 'badge-error' : 'badge-spruce'}`}>
                  Stage {curr.stageNumber} of 9
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-muted)' }}>
                  Active Pipeline Execution
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, marginTop: '6px' }}>
                {curr.title}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={selectedStage === 0}
                onClick={() => setSelectedStage(s => Math.max(0, s - 1))}
                className="badge badge-neutral"
                style={{ padding: '6px 12px', cursor: selectedStage === 0 ? 'not-allowed' : 'pointer', opacity: selectedStage === 0 ? 0.4 : 1 }}
              >
                Previous Stage
              </button>
              <button
                disabled={selectedStage === stages.length - 1}
                onClick={() => setSelectedStage(s => Math.min(stages.length - 1, s + 1))}
                className="badge badge-spruce"
                style={{ padding: '6px 12px', cursor: selectedStage === stages.length - 1 ? 'not-allowed' : 'pointer', opacity: selectedStage === stages.length - 1 ? 0.4 : 1 }}
              >
                Next Stage <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            {curr.description}
          </p>

          {/* Dynamic Content Per Stage */}
          {curr.stageNumber === 1 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                DISPARATE INSTITUTIONAL SOURCE SYSTEMS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(curr.artifacts || []).map((art, idx) => (
                  <div key={idx} style={{ padding: '16px', background: 'var(--surface-recessed)', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink-primary)' }}>{art.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--spruce)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{art.type}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '8px' }}>
                      <strong>Emitted Clinical Stream:</strong> {art.emits}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {curr.stageNumber === 2 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                FHIR R4 BUNDLE PACKAGING (COLLECTION TYPE)
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '16px', borderRadius: '6px', color: 'var(--ink-inverse)', fontFamily: 'var(--font-mono)', fontSize: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                <pre>{JSON.stringify(curr.sampleJson, null, 2)}</pre>
              </div>
            </div>
          )}

          {curr.stageNumber === 3 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Valid Observation */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <CheckCircle2 size={16} color="var(--emerald)" />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Valid Eleanor Vance HbA1c Observation</span>
                  </div>
                  <div style={{ background: 'var(--surface-recessed)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    <div><strong>Resource:</strong> Observation/OBS-VANCE-A1C-1</div>
                    <div><strong>Valid:</strong> {curr.sampleValidReport?.isValid ? 'TRUE (PASS)' : 'FALSE'}</div>
                    <div style={{ marginTop: '8px', color: 'var(--emerald)', fontWeight: 600 }}>All 3 layers pass without error.</div>
                    <button
                      onClick={() => onSelectResource('Observation', 'OBS-VANCE-A1C-1')}
                      style={{ color: 'var(--spruce)', textDecoration: 'underline', marginTop: '6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Inspect in Technical Drawer →
                    </button>
                  </div>
                </div>

                {/* Dangling Reference Warning */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} color="var(--amber)" />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Anomalous MedicationRequest with Dangling Ref</span>
                  </div>
                  <div style={{ background: 'var(--surface-recessed)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-hairline)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    <div><strong>Resource:</strong> MedicationRequest/MED-ANOMALY-DANGLING-PRAC</div>
                    <div><strong>Valid:</strong> {curr.sampleIssueReport?.isValid ? 'TRUE' : 'FALSE'}</div>
                    <div style={{ marginTop: '8px', color: 'var(--amber)', fontWeight: 600 }}>
                      Findings: {curr.sampleIssueReport?.findings?.length || 1} warning (Dangling practitioner ref).
                    </div>
                    <button
                      onClick={() => onSelectResource('MedicationRequest', 'MED-ANOMALY-DANGLING-PRAC')}
                      style={{ color: 'var(--amber)', textDecoration: 'underline', marginTop: '6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Inspect in Technical Drawer →
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Live Validator */}
              <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code2 size={16} color="var(--spruce)" />
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Interactive 3-Layer Payload Validator</span>
                  </div>
                  <button
                    onClick={handleCustomValidate}
                    disabled={isValidating}
                    className="badge badge-spruce"
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    {isValidating ? 'Validating...' : 'Execute 3-Layer Validation'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <textarea
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    style={{
                      width: '100%',
                      height: '180px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      padding: '10px',
                      borderRadius: '4px',
                      background: 'var(--surface-dark)',
                      color: '#E5E7EB',
                      border: '1px solid var(--border-dark)',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{
                    background: 'var(--surface-recessed)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-medium)',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    overflowY: 'auto',
                    height: '180px'
                  }}>
                    {customValidationResult ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className={`badge ${customValidationResult.isValid ? 'badge-ok' : 'badge-error'}`}>
                            {customValidationResult.isValid ? 'CONFORMS' : 'NON-CONFORMING'}
                          </span>
                          <span style={{ fontWeight: 600 }}>{customValidationResult.summary}</span>
                        </div>
                        {customValidationResult.findings?.map((f, fi) => (
                          <div key={fi} style={{ padding: '4px 0', borderBottom: '1px solid var(--border-hairline)', color: f.severity === 'ERROR' ? 'var(--crimson)' : 'var(--amber)' }}>
                            <strong>[L{f.layer} {f.severity}]</strong> {f.message} ({f.path})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--ink-muted)' }}>
                        Click "Execute 3-Layer Validation" to evaluate your custom JSON through Layer 1 (Structural), Layer 2 (Resource), and Layer 3 (Interoperability).
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {curr.stageNumber === 4 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                PROVENANCE AUDIT RECORD ATTACHED AT INGESTION
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '16px', borderRadius: '6px', color: 'var(--ink-inverse)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <pre>{JSON.stringify(curr.provenanceRecord, null, 2)}</pre>
              </div>
            </div>
          )}

          {curr.stageNumber === 5 && (
            <div>
              {anomalyMode ? (
                /* Anomaly Breakdown Visualization (First-Class Failure State) */
                <div style={{ padding: '20px', background: 'var(--crimson-light)', border: '1px solid rgba(153, 27, 27, 0.3)', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={18} color="var(--crimson)" />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--crimson)' }}>
                      Referential Integrity Failure Detected (Cohort 05)
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--crimson)', lineHeight: 1.5, marginBottom: '14px' }}>
                    <code>MedicationRequest/MED-ANOMALY-DANGLING-PRAC</code> targets <code>Practitioner/PRAC-UNKNOWN-99</code>. 
                    The Reference Resolver executed a database lookup, returned <strong>NOT FOUND</strong>, and marked the target pointer as an unresolved ghost reference.
                  </p>

                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px dashed var(--crimson)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--crimson)' }}>
                        Source: MedicationRequest/MED-ANOMALY-DANGLING-PRAC
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        Field: requester.reference → Practitioner/PRAC-UNKNOWN-99 [UNRESOLVED]
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectResource('MedicationRequest', 'MED-ANOMALY-DANGLING-PRAC')}
                      className="badge badge-error"
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                    >
                      Inspect Dangling Resource →
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Verified Resolution */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: 'var(--surface-recessed)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>TOTAL OUTBOUND REFERENCES</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--spruce)' }}>
                      {curr.metrics?.totalReferences || 49}
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--surface-recessed)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>RESOLVED REFERENCES</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--emerald)' }}>
                      {(curr.metrics?.totalReferences || 49) - (curr.metrics?.danglingCount || 1)}
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--surface-recessed)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>DANGLING REFERENCES (QA FLAG)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--amber)' }}>
                      {curr.metrics?.danglingCount || 1}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {curr.stageNumber === 6 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                NORMALIZED RELATIONAL REPOSITORY TABLE COUNTS (SQLITE)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {Object.entries(curr.tableCounts || {}).map(([type, count]) => (
                  <div key={type} style={{ padding: '12px', background: 'var(--surface-recessed)', borderRadius: '4px', border: '1px solid var(--border-hairline)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>{type}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--ink-primary)' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {curr.stageNumber === 7 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                NETWORKX MULTIDIGRAPH TOPOLOGY METRICS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', background: 'var(--surface-recessed)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>TOTAL NODES</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{curr.metrics?.nodes || 65}</div>
                </div>
                <div style={{ padding: '14px', background: 'var(--surface-recessed)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>DIRECTED EDGES</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{curr.metrics?.edges || 48}</div>
                </div>
                <div style={{ padding: '14px', background: 'var(--surface-recessed)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>DENSITY</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{curr.metrics?.density?.toFixed(4) || '0.0115'}</div>
                </div>
              </div>
            </div>
          )}

          {curr.stageNumber === 8 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                EXTRACTED LONGITUDINAL TRAJECTORY (PAT-VANCE-01)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {(curr.trajectory?.events || []).slice(0, 5).map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-recessed)', borderRadius: '4px', borderLeft: '3px solid var(--spruce)' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ marginRight: '8px' }}>{ev.date}</span>
                      <strong style={{ fontSize: '13px' }}>{ev.type}: {ev.title || ev.summary}</strong>
                    </div>
                    <button
                      onClick={() => onSelectResource(ev.type, ev.resource_id)}
                      style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--spruce)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {ev.resource_id}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {curr.stageNumber === 9 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--ink-muted)' }}>
                OUTBOUND INTEROPERABILITY &amp; TRANSFER READINESS DECISION
              </div>
              <div style={{ padding: '16px', background: 'var(--surface-recessed)', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span className={`badge ${anomalyMode ? 'badge-warn' : 'badge-ok'}`}>
                      STATUS: {anomalyMode ? 'TRANSFER REVIEW REQUIRED' : 'TRANSFER READY'}
                    </span>
                    <span style={{ marginLeft: '8px', fontWeight: 600 }}>Score: {anomalyMode ? '70%' : '95%'}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    TARGET: {anomalyMode ? 'PAT-ANOMALY-05' : 'PAT-VANCE-01'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
                  {anomalyMode 
                    ? '1 unresolved practitioner reference and 1 timestamp clash prevent automated transfer.'
                    : (curr.transferAssessment?.summary || 'All core clinical data complete. All patient references resolve with standard coding.')}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                  *Disclaimer: This evaluation assesses information-system interoperability readiness, NOT clinical transport or discharge safety.
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

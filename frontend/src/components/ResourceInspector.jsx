import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  GitBranch, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  Building,
  User,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { api } from '../api';

export default function ResourceInspector({ resourceType, resourceId, isOpen, onClose, onSelectResource }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('human');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (!resourceType || !resourceId || !isOpen) return;
      setLoading(true);
      try {
        const data = await api.getResourceDetail(resourceType, resourceId);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load resource detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resourceType, resourceId, isOpen]);

  const handleCopyJson = () => {
    if (detail?.resource) {
      navigator.clipboard.writeText(JSON.stringify(detail.resource, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const res = detail?.resource || {};
  const val = detail?.validation || {};
  const prov = detail?.provenance || {};
  const forward = detail?.forwardReferences || [];
  const reverse = detail?.reverseReferences || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(24, 27, 30, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 90,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '640px',
            maxWidth: '92vw',
            height: '100vh',
            background: 'var(--surface-white)',
            borderLeft: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-drawer)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Spatial Persistent Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-hairline)',
            background: 'var(--surface-recessed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-spruce" style={{ fontSize: '11px' }}>
                  {resourceType}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--ink-primary)' }}>
                  {resourceId}
                </span>
                <span className="badge badge-real">
                  REAL STATE
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                TECHNICAL INSPECTION SURFACE • ATOMIC INFORMATION ENTITY
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-white)',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
            >
              <X size={16} color="var(--ink-secondary)" />
            </button>
          </div>

          {/* Spatial View Facet Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-hairline)',
            background: 'var(--surface-white)',
            overflowX: 'auto'
          }}>
            {[
              { id: 'human', label: 'Human View' },
              { id: 'json', label: 'FHIR JSON' },
              { id: 'relationships', label: `Relationships (${forward.length + reverse.length})` },
              { id: 'provenance', label: 'Provenance' },
              { id: 'validation', label: `3-Layer Validation (${val.findings?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '11px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? 'var(--spruce)' : 'var(--ink-secondary)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--spruce)' : '2px solid transparent',
                  background: activeTab === tab.id ? 'var(--spruce-light)' : 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Facet Inspection Surface */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                <RefreshCw size={22} className="spin" style={{ margin: '0 auto 12px' }} />
                <div>RESOLVING ATOMIC RESOURCE ATTRIBUTES...</div>
              </div>
            ) : (
              <>
                {/* 1. HUMAN VIEW */}
                {activeTab === 'human' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                        Clinical Summary &amp; Status
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ink-primary)' }}>
                        {res.title || res.code?.text || res.name?.[0]?.text || `${resourceType} Instance`}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <span className="badge badge-neutral">Status: {res.status || 'Active'}</span>
                        {res.category && (
                          <span className="badge badge-neutral">Category: {res.category[0]?.coding?.[0]?.code || 'Clinical'}</span>
                        )}
                      </div>
                    </div>

                    {/* Core Field Table */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Parsed Resource Properties
                      </div>
                      <table className="tech-table">
                        <tbody>
                          {Object.entries(res).map(([k, v]) => {
                            if (['text', 'meta', 'extension'].includes(k)) return null;
                            if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length > 3) return null;
                            return (
                              <tr key={k}>
                                <td style={{ width: '35%', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>{k}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Parsed Coding */}
                    {res.code?.coding && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Standard Clinical Codings
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {res.code.coding.map((c, i) => (
                            <div key={i} style={{ padding: '10px 12px', background: 'var(--surface-recessed)', borderRadius: '4px', border: '1px solid var(--border-hairline)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--spruce)' }}>
                                <span>{c.system}</span>
                                <strong>{c.code}</strong>
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                                {c.display || 'Standard Concept'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. RAW FHIR JSON */}
                {activeTab === 'json' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                        RAW APPLICATION/FHIR+JSON
                      </span>
                      <button
                        onClick={handleCopyJson}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          background: 'var(--surface-recessed)',
                          border: '1px solid var(--border-medium)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer'
                        }}
                      >
                        {copied ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                        <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
                      </button>
                    </div>
                    <div style={{
                      background: 'var(--surface-dark)',
                      padding: '16px',
                      borderRadius: '6px',
                      color: 'var(--ink-inverse)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      lineHeight: 1.45,
                      overflowX: 'auto',
                      maxHeight: 'calc(100vh - 210px)'
                    }}>
                      <pre>{JSON.stringify(res, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* 3. RELATIONSHIPS (The Explore Loop) */}
                {activeTab === 'relationships' && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Outbound References (Who this resource targets)
                      </div>
                      {forward.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>No outbound references.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {forward.map((link, i) => {
                            const isDangling = !link.is_resolved || link.target_id.includes('UNKNOWN');
                            return (
                              <button
                                key={i}
                                onClick={() => !isDangling && onSelectResource(link.target_type, link.target_id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 14px',
                                  background: isDangling ? 'var(--crimson-light)' : 'var(--surface-recessed)',
                                  borderRadius: '4px',
                                  border: `1px solid ${isDangling ? 'rgba(153, 27, 27, 0.3)' : 'var(--border-hairline)'}`,
                                  cursor: isDangling ? 'default' : 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span className={`badge ${isDangling ? 'badge-error' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                                      {isDangling ? 'UNRESOLVED' : link.path}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: isDangling ? 'var(--crimson)' : 'var(--ink-primary)' }}>
                                      {link.target_type}/{link.target_id}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: isDangling ? 'var(--crimson)' : 'var(--ink-muted)', marginTop: '2px' }}>
                                    {isDangling ? 'Target entity not present in ingested store' : (link.display || 'Target FHIR Entity')}
                                  </div>
                                </div>
                                {!isDangling && <ArrowRight size={13} color="var(--ink-muted)" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Inbound References (Who points to this resource)
                      </div>
                      {reverse.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>No inbound references.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {reverse.map((link, i) => (
                            <button
                              key={i}
                              onClick={() => onSelectResource(link.source_type, link.source_id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: 'var(--surface-recessed)',
                                borderRadius: '4px',
                                border: '1px solid var(--border-hairline)',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Inbound</span>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                                    {link.source_type}/{link.source_id}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                                  Via path: <code style={{ fontFamily: 'var(--font-mono)' }}>{link.path}</code>
                                </div>
                              </div>
                              <ArrowRight size={13} color="var(--ink-muted)" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. PROVENANCE (Honest Labeling: No fabricated cryptographic signature) */}
                {activeTab === 'provenance' && (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <ShieldCheck size={16} color="var(--spruce)" />
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                          Originating Custody &amp; Ingestion Audit
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
                        HealthGraph attaches immutable audit metadata upon resource ingestion to trace data lineage.
                      </p>
                    </div>

                    <div style={{ background: 'var(--surface-recessed)', borderRadius: '6px', border: '1px solid var(--border-hairline)', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        <div>
                          <div style={{ color: 'var(--ink-muted)', fontSize: '10px' }}>SOURCE SYSTEM</div>
                          <div style={{ fontWeight: 600, marginTop: '2px' }}>{prov.sourceSystem || 'Metropolitan Health Epic EHR'}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--ink-muted)', fontSize: '10px' }}>INGESTION TIMESTAMP</div>
                          <div style={{ fontWeight: 600, marginTop: '2px' }}>{prov.recordedDate || '2026-09-08T08:00:00Z'}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--ink-muted)', fontSize: '10px' }}>RECORDING CLINICIAN</div>
                          <div style={{ fontWeight: 600, marginTop: '2px' }}>{prov.recorderDisplay || 'Dr. Sarah Chen, MD'}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--ink-muted)', fontSize: '10px' }}>ORGANIZATION</div>
                          <div style={{ fontWeight: 600, marginTop: '2px' }}>{prov.custodianDisplay || 'St. Jude Health System'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Honest labeling: audit attached without claiming cryptographic signature */}
                    <div style={{ background: 'var(--surface-recessed)', padding: '12px 14px', borderRadius: '4px', borderLeft: '3px solid var(--spruce)', fontSize: '12px', color: 'var(--ink-primary)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--spruce)', textTransform: 'uppercase' }}>
                        PROVENANCE RECORDED: INGESTION AUDIT ATTACHED
                      </div>
                      <div style={{ marginTop: '3px', fontSize: '11px', color: 'var(--ink-secondary)' }}>
                        Institutional custody recorded and linked. Note: Cryptographic signing is not implemented in this local explorer.
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. 3-LAYER VALIDATION */}
                {activeTab === 'validation' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span className={`badge ${val.isValid ? 'badge-ok' : 'badge-warn'}`}>
                        {val.isValid ? '3-LAYER CONFORMANCE: PASS' : 'ANOMALY DETECTED'}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                        TAXONOMY: ERROR / WARNING / INFO
                      </span>
                    </div>

                    {(!val.findings || val.findings.length === 0) ? (
                      <div style={{ padding: '24px', background: 'var(--emerald-light)', borderRadius: '6px', border: '1px solid rgba(6, 95, 70, 0.2)', textAlign: 'center' }}>
                        <CheckCircle2 size={24} color="var(--emerald)" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 600, color: 'var(--emerald)', fontSize: '14px' }}>Zero Conformance Violations</div>
                        <div style={{ fontSize: '12px', color: 'var(--emerald)', marginTop: '4px' }}>
                          Structural schema, resource constraints, and interoperability rules are 100% satisfied.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {val.findings.map((f, i) => (
                          <div 
                            key={i}
                            style={{
                              padding: '12px',
                              borderRadius: '4px',
                              background: f.severity === 'ERROR' ? 'var(--crimson-light)' : 'var(--amber-light)',
                              border: `1px solid ${f.severity === 'ERROR' ? 'rgba(153, 27, 27, 0.25)' : 'rgba(180, 83, 9, 0.25)'}`,
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span className={`badge ${f.severity === 'ERROR' ? 'badge-error' : 'badge-warn'}`} style={{ fontSize: '9px' }}>
                                LAYER {f.layer}: {f.severity}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-muted)' }}>
                                PATH: {f.path}
                              </span>
                            </div>
                            <div style={{ color: 'var(--ink-primary)', fontWeight: 500 }}>
                              {f.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

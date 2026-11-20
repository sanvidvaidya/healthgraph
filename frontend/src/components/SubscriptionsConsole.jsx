import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Terminal, 
  ArrowUpRight,
  Send,
  Sliders,
  Check,
  Copy
} from 'lucide-react';
import { api } from '../api';

export default function SubscriptionsConsole({ selectedPatientId = 'PAT-VANCE-01', setCurrentTab }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('egfr_drop');
  const [targetPatient, setTargetPatient] = useState(selectedPatientId);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulation, setLastSimulation] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const simulationEvents = [
    {
      id: 'egfr_drop',
      name: 'Critical eGFR Decline (< 30 mL/min)',
      desc: 'Simulates acute nephrotoxicity triggering Metformin lactic acidosis hard stop.',
      defaultPatient: 'PAT-VANCE-01',
      severity: 'CRITICAL'
    },
    {
      id: 'glycemic_spike',
      name: 'Severe Glycemic Excursion (HbA1c > 10%)',
      desc: 'Simulates outpatient lab spike requiring rapid regimen intensification.',
      defaultPatient: 'PAT-VANCE-01',
      severity: 'WARNING'
    },
    {
      id: 'dangling_practitioner',
      name: 'Dangling Prescriber Attribution',
      desc: 'Simulates unsigned/unattributed order violating CMS-0057-F prior-auth rules.',
      defaultPatient: 'PAT-ANOMALY-05',
      severity: 'AUDIT_RISK'
    }
  ];

  useEffect(() => {
    loadSubscriptionsAndAudit();
  }, []);

  const loadSubscriptionsAndAudit = async () => {
    try {
      const [subsBundle, audit] = await Promise.all([
        api.getSubscriptions(),
        api.getSubscriptionAuditLog(15)
      ]);
      const entries = subsBundle?.entry?.map(e => e.resource) || [];
      setSubscriptions(entries);
      setAuditLog(audit || []);
    } catch (err) {
      console.error('Failed to load subscriptions/audit:', err);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateSubscriptionEvent(targetPatient, selectedEvent);
      setLastSimulation(res);
      // Reload audit log
      const audit = await api.getSubscriptionAuditLog(15);
      setAuditLog(audit || []);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', color: 'var(--ink-primary)' }}>
      {/* Protocol Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        marginBottom: '24px', 
        paddingBottom: '20px', 
        borderBottom: '1px solid var(--border-hairline)' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--azure-light)',
              color: 'var(--azure)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <Radio size={12} />
              HL7 FHIR R4 Subscription & REST Hooks
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--mint-light)',
              color: 'var(--emerald)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <ShieldCheck size={12} />
              HMAC-SHA256 Signature Guard
            </span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '24px', 
            fontWeight: 700, 
            letterSpacing: '-0.03em', 
            margin: 0 
          }}>
            Real-Time FHIR Subscriptions & REST Hooks Console
          </h1>
          <p style={{ 
            margin: '6px 0 0', 
            fontSize: '13.5px', 
            color: 'var(--ink-secondary)', 
            maxWidth: '820px',
            lineHeight: 1.5 
          }}>
            Autonomous event surveillance engine evaluating point-of-care clinical mutations (biomarker shifts, orders, diagnoses). Automatically generates authenticated REST-hook webhooks and re-computes clinical contraindication graphs with zero polling latency.
          </p>
        </div>

        {/* Status Telemetry Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--surface-white)',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid var(--border-hairline)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }} className="pulse" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--emerald)' }}>
              Engine Live
            </span>
          </div>
          <span style={{ color: 'var(--border-hairline)' }}>|</span>
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-sans)', color: 'var(--ink-secondary)' }}>
            {subscriptions.length} Subscriptions Active
          </span>
        </div>
      </div>

      {/* Main Grid: Subscriptions Registry & Point-of-Care Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Registered Subscriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontFamily: 'var(--font-mono)', 
                fontWeight: 600, 
                color: 'var(--ink-muted)', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Registered FHIR Subscriptions
              </h3>
              <button 
                onClick={loadSubscriptionsAndAudit}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                title="Refresh Subscriptions"
              >
                <RefreshCw size={13} color="var(--ink-muted)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hairline)',
                    background: 'var(--canvas-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 600, 
                      color: 'var(--spruce)' 
                    }}>
                      {sub.id}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: sub.status === 'active' ? 'var(--mint-light)' : 'var(--amber-light)',
                      color: sub.status === 'active' ? 'var(--emerald)' : 'var(--amber)',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {sub.status}
                    </span>
                  </div>

                  <span style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                    {sub.reason}
                  </span>

                  <div style={{ 
                    marginTop: '4px',
                    padding: '4px 6px',
                    borderRadius: '3px',
                    background: 'rgba(0,0,0,0.03)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Criteria: {sub.criteria}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Simulation Trigger Card */}
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 600, 
              color: 'var(--ink-muted)', 
              margin: '0 0 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Simulate Clinical Event Mutation
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {simulationEvents.map((ev) => {
                const isSelected = selectedEvent === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev.id);
                      setTargetPatient(ev.defaultPatient);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? 'var(--azure)' : 'var(--border-hairline)'}`,
                      background: isSelected ? 'var(--azure-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--azure)' : 'var(--ink-primary)' }}>
                        {ev.name}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: ev.severity === 'CRITICAL' ? 'var(--crimson-light)' : 'var(--amber-light)',
                        color: ev.severity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)',
                        fontWeight: 700
                      }}>
                        {ev.severity}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.3 }}>
                      {ev.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>Target Subject:</span>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--spruce)' }}>
                {targetPatient}
              </span>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                borderRadius: '6px',
                background: 'var(--spruce)',
                color: '#FFF',
                border: 'none',
                fontSize: '12.5px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: isSimulating ? 'not-allowed' : 'pointer',
                opacity: isSimulating ? 0.7 : 1
              }}
            >
              {isSimulating ? <RefreshCw size={13} className="spin" /> : <Send size={13} />}
              <span>Dispatch Point-of-Care Event</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Webhook Dispatch Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {lastSimulation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'var(--surface-white)',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="var(--emerald)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 700 }}>
                    REST Hook Dispatch Successful: HTTP {lastSimulation.restHookDispatch?.httpStatus} OK
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    Latency: {lastSimulation.restHookDispatch?.latencyMs}ms
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    fontFamily: 'var(--font-mono)', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    background: 'var(--mint-light)',
                    color: 'var(--emerald)',
                    fontWeight: 700 
                  }}>
                    HMAC Verified
                  </span>
                </div>
              </div>

              {/* Clinical Impact Alert Box */}
              {lastSimulation.clinicalImpact && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  background: lastSimulation.clinicalImpact.alertSeverity === 'CRITICAL' ? 'var(--crimson-light)' : 'var(--amber-light)',
                  border: `1px solid ${lastSimulation.clinicalImpact.alertSeverity === 'CRITICAL' ? 'rgba(225, 29, 72, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`,
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={15} color={lastSimulation.clinicalImpact.alertSeverity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)'} style={{ marginTop: '2px' }} />
                    <div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        color: lastSimulation.clinicalImpact.alertSeverity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)',
                        display: 'block',
                        marginBottom: '2px'
                      }}>
                        AUTOMATED CLINICAL INTERVENTION FIRED
                      </span>
                      <span style={{ fontSize: '12.5px', color: 'var(--ink-primary)', lineHeight: 1.4, fontWeight: 500 }}>
                        {lastSimulation.clinicalImpact.message}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest Hook Headers & Signature */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--canvas-bg)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-hairline)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                      X-HealthGraph-Signature (HMAC SHA-256)
                    </span>
                    <button 
                      onClick={() => copyToClipboard(lastSimulation.restHookDispatch?.hmacSignature, 'hmac')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {copiedKey === 'hmac' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} color="var(--ink-muted)" />}
                    </button>
                  </div>
                  <code style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--spruce)' }}>
                    {lastSimulation.restHookDispatch?.hmacSignature}
                  </code>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    Dispatched FHIR Event Payload
                  </span>
                  <button
                    onClick={() => copyToClipboard(lastSimulation.restHookPayload, 'payload')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedKey === 'payload' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} />}
                    <span>{copiedKey === 'payload' ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>
                <pre style={{
                  margin: 0,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--surface-dark)',
                  color: 'var(--mint)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(lastSimulation.restHookPayload, null, 2)}
                </pre>
              </div>
            </motion.div>
          ) : (
            <div style={{
              background: 'var(--surface-white)',
              borderRadius: '8px',
              border: '1px dashed var(--border-medium)',
              padding: '36px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <BellRing size={28} color="var(--ink-faint)" />
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-secondary)' }}>
                No Point-of-Care Event Dispatched Yet
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)', maxWidth: '380px' }}>
                Select an event scenario on the left and click "Dispatch Point-of-Care Event" to simulate real-time REST-hook payload delivery and signature verification.
              </p>
            </div>
          )}

          {/* Audit Log Table */}
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="var(--ink-muted)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  Subscription Delivery & Audit Ledger
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                Immutable In-Memory Ledger
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-hairline)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
                    <th style={{ padding: '6px 8px' }}>Timestamp</th>
                    <th style={{ padding: '6px 8px' }}>Event Type</th>
                    <th style={{ padding: '6px 8px' }}>Subject</th>
                    <th style={{ padding: '6px 8px' }}>HTTP</th>
                    <th style={{ padding: '6px 8px' }}>Latency</th>
                    <th style={{ padding: '6px 8px' }}>Automated Action</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-hairline)', fontFamily: 'var(--font-mono)' }}>
                      <td style={{ padding: '8px', color: 'var(--ink-muted)', fontSize: '10.5px', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {log.eventType}
                      </td>
                      <td style={{ padding: '8px', color: 'var(--spruce)' }}>
                        {log.patientId}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: log.httpStatus === 200 ? 'var(--emerald)' : 'var(--crimson)', fontWeight: 600 }}>
                          {log.httpStatus}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--ink-secondary)' }}>
                        {log.deliveryLatencyMs}ms
                      </td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-sans)', color: 'var(--ink-secondary)', maxWidth: '280px' }}>
                        {log.actionTaken}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

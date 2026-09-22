import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import anime from 'animejs';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Stethoscope, 
  Building, 
  ArrowRight,
  Filter,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  GitBranch,
  FlaskConical
} from 'lucide-react';
import { api } from '../api';

export default function PatientDossier({ patientId, setPatientId, patients, onSelectResource, setCurrentTab, userPerspective = 'clinician' }) {
  const [dossier, setDossier] = useState(null);
  const [cdsData, setCdsData] = useState(null);
  const [priorAuthData, setPriorAuthData] = useState(null);
  const [hccData, setHccData] = useState(null);
  const [medRecData, setMedRecData] = useState(null);
  const [trialsData, setTrialsData] = useState(null);
  const [dossierViewMode, setDossierViewMode] = useState('timeline'); // 'timeline' | 'prior-auth' | 'hcc-risk' | 'med-rec' | 'trials'
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const sparklineSvgRef = useRef(null);

  useEffect(() => {
    async function loadDossier() {
      if (!patientId) return;
      setLoading(true);
      try {
        const [data, cdsAlerts, priorAuth, hcc, medRec, trials] = await Promise.all([
          api.getPatientDossier(patientId),
          api.getCdsAlerts(patientId).catch(() => null),
          api.getPriorAuthReadiness(patientId).catch(() => null),
          api.getHccGaps(patientId).catch(() => null),
          api.getMedicationRec(patientId).catch(() => null),
          api.getTrialsScreen().catch(() => null)
        ]);
        setDossier(data);
        setCdsData(cdsAlerts);
        setPriorAuthData(priorAuth);
        setHccData(hcc);
        setMedRecData(medRec);
        setTrialsData(trials);
      } catch (err) {
        console.error('Failed to load dossier:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDossier();
  }, [patientId]);

  // Anime.js: Self-drawing biomarker sparklines whenever dossier data changes
  useEffect(() => {
    if (sparklineSvgRef.current) {
      const paths = sparklineSvgRef.current.querySelectorAll('.sparkline-curve');
      if (paths.length > 0) {
        anime({
          targets: paths,
          strokeDashoffset: [anime.setDashoffset, 0],
          easing: 'easeOutQuad',
          duration: 1200,
          delay: anime.stagger(150),
        });
      }
      const circles = sparklineSvgRef.current.querySelectorAll('.sparkline-dot');
      if (circles.length > 0) {
        anime({
          targets: circles,
          scale: [0, 1],
          opacity: [0, 1],
          easing: 'easeOutBack',
          duration: 600,
          delay: anime.stagger(60, { start: 400 }),
        });
      }
    }
  }, [dossier]);

  if (loading || !dossier) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
        <div>Loading patient timeline records...</div>
      </div>
    );
  }

  const patient = dossier.patient || {};
  const timeline = dossier.timeline || {};
  const events = timeline.events || [];
  const series = timeline.series || {};
  const transfer = dossier.transferReadiness || {};

  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(e => {
        if (activeCategory === 'encounter') return e.resourceType === 'Encounter';
        if (activeCategory === 'observation') return e.resourceType === 'Observation';
        if (activeCategory === 'condition') return e.resourceType === 'Condition';
        if (activeCategory === 'medication') return e.resourceType === 'MedicationRequest';
        return true;
      });

  const getCategoryColor = (cat, type) => {
    if (type === 'Encounter') return 'var(--azure)';
    if (type === 'Observation') return 'var(--emerald)';
    if (type === 'Condition') return 'var(--amber)';
    if (type === 'MedicationRequest') return 'var(--purple)';
    if (type === 'Procedure') return 'var(--spruce)';
    return 'var(--ink-secondary)';
  };

  // Determine clear transfer decision label
  const isTransferReady = transfer.isReady;
  const transferDecisionLabel = isTransferReady ? 'TRANSFER READY' : 'TRANSFER REVIEW REQUIRED';

  // Count how many trials this patient is eligible for
  const eligibleTrialsCount = trialsData ? trialsData.filter(item => {
    const matched = item.eligiblePatients || item.matchedPatients || [];
    return matched.some(m => m.patientId === patientId);
  }).length : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Cohort Subject Switcher - Sleek Open Ribbon */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-hairline)',
        paddingBottom: '14px',
        marginBottom: '28px'
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase', marginRight: '6px', letterSpacing: '0.04em' }}>
          Cohort Subjects:
        </span>
        {patients.map((p) => {
          const isSelected = p.id === patientId;
          return (
            <button
              key={p.id}
              onClick={() => setPatientId(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: isSelected ? 'var(--spruce)' : 'var(--surface-white)',
                color: isSelected ? '#FFFFFF' : 'var(--ink-secondary)',
                border: isSelected ? '1px solid var(--spruce)' : '1px solid var(--border-medium)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isSelected ? '#FFFFFF' : 'var(--border-strong)'
              }} />
              <span>{p.name}</span>
              <span style={{ opacity: isSelected ? 0.85 : 0.5, fontSize: '10px' }}>({p.id})</span>
            </button>
          );
        })}
      </div>

      {/* Patient Profile Header Card */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '36px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border-hairline)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-spruce">Longitudinal Patient Dossier</span>
            <span className="badge badge-real">REAL APPLICATION DATA</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '38px',
            fontWeight: 400,
            letterSpacing: '-0.025em',
            color: 'var(--ink-primary)',
            lineHeight: 1.15,
            marginBottom: '8px'
          }}>
            {patient.name?.[0]?.text || `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--ink-secondary)' }}>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              {patient.gender?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span>DOB: <strong>{patient.birthDate}</strong></span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span>Identifier: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--spruce)' }}>{patient.id}</code></span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span>Total Records: <strong>{dossier.totalResources}</strong></span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span>Custodian: <strong>{patient.managingOrganization?.display || 'St. Jude Health System'}</strong></span>
          </div>
        </div>

        {/* Dual Decision Ribbons: Transfer Gate + Prior-Auth Pre-Flight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '280px' }}>
          {/* Transfer Readiness Decision */}
          <div style={{
            background: isTransferReady ? 'var(--emerald-light)' : 'var(--amber-light)',
            border: `1px solid ${isTransferReady ? 'rgba(6, 95, 70, 0.25)' : 'rgba(180, 83, 9, 0.25)'}`,
            borderRadius: '6px',
            padding: '10px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isTransferReady ? <CheckCircle2 size={15} color="var(--emerald)" /> : <AlertTriangle size={15} color="var(--amber)" />}
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: isTransferReady ? 'var(--emerald)' : 'var(--amber)' 
                }}>
                  {transferDecisionLabel}
                </span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '9px' }}>
                DETERMINISTIC
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-primary)', lineHeight: 1.35 }}>
              {transfer.summary}
            </div>
          </div>

          {/* Da Vinci Prior-Auth Decision Ribbon */}
          {priorAuthData && (
            <div style={{
              background: priorAuthData.status === 'APPROVED' ? 'rgba(45, 212, 191, 0.12)' : 'rgba(225, 29, 72, 0.12)',
              border: `1px solid ${priorAuthData.status === 'APPROVED' ? 'rgba(45, 212, 191, 0.35)' : 'rgba(225, 29, 72, 0.35)'}`,
              borderRadius: '6px',
              padding: '10px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {priorAuthData.status === 'APPROVED' ? (
                    <ShieldCheck size={15} color="var(--emerald)" />
                  ) : (
                    <AlertCircle size={15} color="var(--rose)" />
                  )}
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: priorAuthData.status === 'APPROVED' ? 'var(--emerald)' : 'var(--rose)' 
                  }}>
                    {priorAuthData.status === 'APPROVED' ? 'PRIOR-AUTH CLEAN' : 'PRIOR-AUTH REJECTED'}
                  </span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '9px' }}>
                  DA VINCI DTR
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-primary)', lineHeight: 1.35, fontWeight: 500 }}>
                {priorAuthData.procedure}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--ink-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Denial Risk Avoided: <strong>{priorAuthData.denialRiskAvoided}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Decision Support (CDS) Intelligence Panel */}
      {cdsData && cdsData.alerts && cdsData.alerts.length > 0 && (
        <div style={{
          marginBottom: '36px',
          background: 'var(--surface-white)',
          border: '1px solid var(--border-medium)',
          borderLeft: '4px solid var(--spruce)',
          borderRadius: '8px',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '14px', 
            flexWrap: 'wrap', 
            gap: '10px',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} color="var(--spruce)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--ink-primary)' }}>
                CLINICAL DECISION SUPPORT (CDS) INTELLIGENCE
              </span>
              <span className="badge badge-spruce" style={{ fontSize: '10px' }}>
                {cdsData.totalAlerts} {cdsData.totalAlerts === 1 ? 'Rule Evaluated' : 'Rules Evaluated'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {cdsData.criticalCount > 0 && (
                <span style={{ background: 'rgba(225, 29, 72, 0.12)', color: 'var(--rose)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {cdsData.criticalCount} Critical
                </span>
              )}
              {cdsData.warningCount > 0 && (
                <span style={{ background: 'rgba(217, 119, 6, 0.12)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {cdsData.warningCount} Warning
                </span>
              )}
              {cdsData.infoCount > 0 && (
                <span style={{ background: 'rgba(13, 148, 136, 0.12)', color: 'var(--spruce)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {cdsData.infoCount} Guideline
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cdsData.alerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';
              const borderColor = isCrit ? 'rgba(225, 29, 72, 0.35)' : isWarn ? 'rgba(217, 119, 6, 0.35)' : 'rgba(13, 148, 136, 0.35)';
              const bgTint = isCrit ? 'rgba(225, 29, 72, 0.04)' : isWarn ? 'rgba(217, 119, 6, 0.04)' : 'rgba(13, 148, 136, 0.04)';
              const badgeColor = isCrit ? 'var(--rose)' : isWarn ? 'var(--amber)' : 'var(--spruce)';
              const badgeBg = isCrit ? 'rgba(225, 29, 72, 0.15)' : isWarn ? 'rgba(217, 119, 6, 0.15)' : 'rgba(13, 148, 136, 0.15)';

              return (
                <div 
                  key={alert.ruleId}
                  style={{
                    background: bgTint,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                    padding: '14px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: badgeBg,
                        color: badgeColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        letterSpacing: '0.02em'
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>
                        {alert.title}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                      Rule: {alert.ruleId}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                    {alert.detail}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--ink-primary)', fontWeight: 500 }}>
                      <strong>Action:</strong> {alert.action}
                    </div>
                    {alert.resources && alert.resources.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--ink-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Sources:</span>
                        {alert.resources.map(resId => {
                          const [type, id] = resId.includes('/') ? resId.split('/') : ['Observation', resId];
                          return (
                            <button
                              key={resId}
                              onClick={() => onSelectResource(type, id)}
                              style={{
                                background: 'var(--surface-white)',
                                border: '1px solid var(--border-medium)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10.5px',
                                color: 'var(--spruce)',
                                cursor: 'pointer'
                              }}
                            >
                              {resId}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dossier Workspaces Sub-Nav */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-medium)',
        marginBottom: '32px',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setDossierViewMode('timeline')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: dossierViewMode === 'timeline' ? 'var(--surface-white)' : 'transparent',
            boxShadow: dossierViewMode === 'timeline' ? 'var(--shadow-card)' : 'none',
            color: dossierViewMode === 'timeline' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            fontWeight: dossierViewMode === 'timeline' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={15} color="var(--spruce)" />
          <span>Longitudinal Timeline &amp; Biomarkers</span>
        </button>

        <button
          onClick={() => setDossierViewMode('prior-auth')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: dossierViewMode === 'prior-auth' ? 'var(--surface-white)' : 'transparent',
            boxShadow: dossierViewMode === 'prior-auth' ? 'var(--shadow-card)' : 'none',
            color: dossierViewMode === 'prior-auth' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            fontWeight: dossierViewMode === 'prior-auth' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={15} color="var(--cyan)" />
          <span>Prior-Auth &amp; DTR Checklist</span>
          {priorAuthData && (
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '9999px',
              background: priorAuthData.status === 'APPROVED' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(225, 29, 72, 0.15)',
              color: priorAuthData.status === 'APPROVED' ? 'var(--emerald)' : 'var(--rose)'
            }}>
              {priorAuthData.status}
            </span>
          )}
        </button>

        <button
          onClick={() => setDossierViewMode('hcc-risk')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: dossierViewMode === 'hcc-risk' ? 'var(--surface-white)' : 'transparent',
            boxShadow: dossierViewMode === 'hcc-risk' ? 'var(--shadow-card)' : 'none',
            color: dossierViewMode === 'hcc-risk' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            fontWeight: dossierViewMode === 'hcc-risk' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap'
          }}
        >
          <TrendingUp size={15} color="var(--indigo)" />
          <span>HCC Recapture &amp; HEDIS</span>
          {hccData && (
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--indigo)'
            }}>
              RAF {hccData.currentRafScore}
            </span>
          )}
        </button>

        <button
          onClick={() => setDossierViewMode('med-rec')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: dossierViewMode === 'med-rec' ? 'var(--surface-white)' : 'transparent',
            boxShadow: dossierViewMode === 'med-rec' ? 'var(--shadow-card)' : 'none',
            color: dossierViewMode === 'med-rec' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            fontWeight: dossierViewMode === 'med-rec' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap'
          }}
        >
          <Pill size={15} color="var(--purple)" />
          <span>Medication Rec &amp; PDC Adherence</span>
          {medRecData && (
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '9999px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--purple)'
            }}>
              {medRecData.overallPdcAdherence}
            </span>
          )}
        </button>

        <button
          onClick={() => setDossierViewMode('trials')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: dossierViewMode === 'trials' ? 'var(--surface-white)' : 'transparent',
            boxShadow: dossierViewMode === 'trials' ? 'var(--shadow-card)' : 'none',
            color: dossierViewMode === 'trials' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
            fontWeight: dossierViewMode === 'trials' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap'
          }}
        >
          <FlaskConical size={15} color="var(--spruce)" />
          <span>Trial Eligibility &amp; Feasibility</span>
          {trialsData && (
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '9999px',
              background: 'rgba(13, 148, 136, 0.15)',
              color: 'var(--spruce)'
            }}>
              {eligibleTrialsCount} Matched
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: Longitudinal Timeline & Biomarkers */}
      {dossierViewMode === 'timeline' && (
        <>
          {/* Biomarker Trajectories: Self-Drawing Anime.js Sparkline Ribbons */}
          {Object.keys(series).length > 0 && (
            <div ref={sparklineSvgRef} style={{ marginBottom: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="var(--spruce)" />
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                    Longitudinal Biomarker Trajectories (2023 to 2025)
                  </h2>
                  <span className="badge badge-neutral" style={{ fontSize: '9px' }}>
                    Extracted from Observation Resources
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  CLICK OBSERVATION DOT TO INSPECT FHIR PAYLOAD
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(series).map(([testName, points]) => {
                  if (!points || points.length < 2) return null;
                  
                  const values = points.map(p => p.value);
                  const minVal = Math.min(...values);
                  const maxVal = Math.max(...values);
                  const range = maxVal - minVal || 1;
                  const unit = points[0]?.unit || '';

                  const width = 320;
                  const height = 80;
                  const padX = 24;
                  const padY = 16;

                  const coords = points.map((p, i) => {
                    const x = padX + (i / (points.length - 1)) * (width - 2 * padX);
                    const y = height - padY - ((p.value - minVal) / range) * (height - 2 * padY);
                    return { x, y, point: p };
                  });

                  const pathData = coords.reduce((acc, curr, i) => 
                    i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, ''
                  );

                  return (
                    <div 
                      key={testName}
                      style={{
                        background: 'var(--surface-white)',
                        padding: '16px 18px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-hairline)',
                        boxShadow: 'var(--shadow-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)' }}>{testName}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)', marginTop: '1px' }}>
                            Latest: <strong style={{ color: 'var(--spruce)' }}>{points[points.length - 1].value} {unit}</strong>
                          </div>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '9px' }}>
                          {points.length} readings
                        </span>
                      </div>

                      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--border-hairline)" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="var(--border-hairline)" strokeWidth="1" strokeDasharray="3 3" />
                        
                        <path
                          d={pathData}
                          fill="none"
                          stroke="var(--spruce)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="sparkline-curve"
                        />

                        {coords.map((c, idx) => (
                          <g key={idx} className="sparkline-dot" style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={hoveredPoint?.id === c.point.id ? "6" : "3.5"}
                              fill={hoveredPoint?.id === c.point.id ? "var(--spruce)" : "var(--surface-white)"}
                              stroke="var(--spruce)"
                              strokeWidth="2"
                              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                              onMouseEnter={() => setHoveredPoint(c.point)}
                              onMouseLeave={() => setHoveredPoint(null)}
                              onClick={() => onSelectResource('Observation', c.point.id)}
                            />
                          </g>
                        ))}
                      </svg>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>{points[0].date}</span>
                        <span>{points[points.length - 1].date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Longitudinal Event Stream Filter Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--spruce)" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                Longitudinal Clinical Event Stream ({filteredEvents.length})
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {['all', 'encounter', 'observation', 'condition', 'medication'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    background: activeCategory === cat ? 'var(--spruce)' : 'var(--surface-white)',
                    color: activeCategory === cat ? '#FFFFFF' : 'var(--ink-secondary)',
                    border: activeCategory === cat ? '1px solid var(--spruce)' : '1px solid var(--border-medium)',
                    fontWeight: activeCategory === cat ? 600 : 500
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Chronological Spine Node Sequence */}
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{
              position: 'absolute',
              left: '9px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: 'var(--border-medium)'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredEvents.map((ev, index) => {
                const borderTone = getCategoryColor(ev.category, ev.resourceType);

                return (
                  <div
                    key={`${ev.resourceId}-${index}`}
                    style={{
                      position: 'relative',
                      background: 'var(--surface-white)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '16px 20px',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = borderTone}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-hairline)'}
                  >
                    <div style={{
                      position: 'absolute',
                      left: '-29px',
                      top: '18px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: borderTone,
                      border: '3px solid var(--canvas-bg)',
                      boxShadow: '0 0 0 1px var(--border-hairline)'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {ev.dateOnly || ev.timestamp?.substring(0, 10)}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10px', color: borderTone, fontWeight: 600 }}>
                          {ev.resourceType}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectResource(ev.resourceType, ev.resourceId)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--spruce)',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Inspect {ev.resourceId}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink-primary)', marginBottom: '4px' }}>
                      {ev.title}
                    </div>

                    {ev.valueDisplay && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--spruce)', fontWeight: 600, marginBottom: '4px' }}>
                        Value: {ev.valueDisplay}
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                      {ev.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: Prior-Auth & DTR Checklist */}
      {dossierViewMode === 'prior-auth' && priorAuthData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderLeft: `5px solid ${priorAuthData.status === 'APPROVED' ? 'var(--emerald)' : 'var(--rose)'}`,
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
                    CMS-0057-F INTEROPERABILITY RULE
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    DA VINCI CRD / DTR SPECIFICATION
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 500, color: 'var(--ink-primary)', margin: 0 }}>
                  Pre-Flight Prior-Authorization Decision Engine
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: priorAuthData.status === 'APPROVED' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                  color: priorAuthData.status === 'APPROVED' ? 'var(--emerald)' : 'var(--rose)'
                }}>
                  {priorAuthData.status === 'APPROVED' ? 'CLEAN PASS' : 'REQUISITE EVIDENCE DEFICIT'}
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'var(--surface-recessed)',
              borderRadius: '6px',
              border: '1px solid var(--border-hairline)'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>PLANNED INTERVENTION</div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-primary)', marginTop: '2px' }}>
                  {priorAuthData.procedure}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>PAYER / HEALTH PLAN</div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-primary)', marginTop: '2px' }}>
                  {priorAuthData.payer}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>FINANCIAL DENIAL AVOIDANCE</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--emerald)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                  {priorAuthData.denialRiskAvoided}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '14px' }}>
              Clinical Criteria Satisfaction &amp; Evidence Audit
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {priorAuthData.criteria?.map((item) => (
                <div
                  key={item.rule}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '14px 16px',
                    borderRadius: '6px',
                    background: item.satisfied ? 'rgba(45, 212, 191, 0.04)' : 'rgba(225, 29, 72, 0.04)',
                    border: `1px solid ${item.satisfied ? 'rgba(45, 212, 191, 0.25)' : 'rgba(225, 29, 72, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {item.satisfied ? (
                      <CheckCircle2 size={18} color="var(--emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={18} color="var(--rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {item.rule}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '3px' }}>
                        Evidence: <strong>{item.evidence}</strong>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    background: item.satisfied ? 'rgba(45, 212, 191, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                    color: item.satisfied ? 'var(--emerald)' : 'var(--rose)'
                  }}>
                    {item.satisfied ? 'SATISFIED' : 'DEFICIT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HCC Risk Recapture & HEDIS Quality */}
      {dossierViewMode === 'hcc-risk' && hccData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderLeft: '5px solid var(--indigo)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
                    VALUE-BASED CARE SENTINEL
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    CMS-HCC RISK ADJUSTMENT VERSION 28
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 500, color: 'var(--ink-primary)', margin: 0 }}>
                  HCC Recapture &amp; Longitudinal HEDIS Gaps
                </h2>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'var(--surface-recessed)',
              borderRadius: '6px',
              border: '1px solid var(--border-hairline)'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>CURRENT RAF SCORE</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--indigo)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {hccData.currentRafScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>UNRECAPTURED REVENUE RISK</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--rose)', fontFamily: 'var(--font-sans)', marginTop: '4px' }}>
                  {hccData.unrecapturedRevenueRisk}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>HEDIS QUALITY GAPS</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginTop: '6px' }}>
                  {hccData.hedisGaps?.filter(g => g.status === 'ACTION_REQUIRED').length} Action Required
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '14px' }}>
              Hierarchical Condition Category (HCC) Recapture Status
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--ink-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>HCC / ICD-10</th>
                    <th style={{ padding: '8px 12px' }}>CONDITION</th>
                    <th style={{ padding: '8px 12px' }}>PRIOR YEAR</th>
                    <th style={{ padding: '8px 12px' }}>CURRENT STATUS</th>
                    <th style={{ padding: '8px 12px' }}>EST. CAPITATION</th>
                    <th style={{ padding: '8px 12px' }}>CLINICAL ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {hccData.hccCategories?.map((h) => (
                    <tr key={h.code} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--indigo)' }}>
                        {h.code} <span style={{ opacity: 0.7, fontSize: '10px' }}>({h.hccCategory})</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                        {h.description}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-secondary)', fontSize: '11.5px' }}>
                        {h.priorYearDocumented}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          background: h.currentYearStatus.includes('RISK') ? 'rgba(225, 29, 72, 0.12)' : 'rgba(45, 212, 191, 0.12)',
                          color: h.currentYearStatus.includes('RISK') ? 'var(--rose)' : 'var(--emerald)'
                        }}>
                          {h.currentYearStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--ink-primary)', fontFamily: 'var(--font-mono)' }}>
                        {h.estimatedCapitationValue}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-secondary)', fontSize: '11.5px' }}>
                        {h.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '14px' }}>
              HEDIS Clinical Quality Measures &amp; Star Ratings Impact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hccData.hedisGaps?.map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    background: g.status === 'COMPLIANT' ? 'rgba(45, 212, 191, 0.04)' : 'rgba(225, 29, 72, 0.04)',
                    border: `1px solid ${g.status === 'COMPLIANT' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(225, 29, 72, 0.2)'}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                        {g.measureId}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {g.measureName}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                      {g.detail}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: g.status === 'COMPLIANT' ? 'var(--emerald)' : 'var(--rose)'
                    }}>
                      {g.status}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--indigo)', fontWeight: 600, marginTop: '2px' }}>
                      {g.qualityScoreImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Medication Reconciliation & PDC Adherence */}
      {dossierViewMode === 'med-rec' && medRecData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderLeft: '5px solid var(--purple)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '10px', letterSpacing: '0.06em' }}>
                    CMS STAR RATINGS PHARMACY QUALITY
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    PROPORTION OF DAYS COVERED (PDC)
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 500, color: 'var(--ink-primary)', margin: 0 }}>
                  Longitudinal Medication Reconciliation &amp; Adherence
                </h2>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'var(--surface-recessed)',
              borderRadius: '6px',
              border: '1px solid var(--border-hairline)'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>OVERALL PDC ADHERENCE</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                  {medRecData.overallPdcAdherence}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>CMS STAR RATING IMPACT</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--emerald)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                  {medRecData.cmsStarRatingAdherence}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>POLYPHARMACY SURVEILLANCE</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: medRecData.polypharmacyAlert ? 'var(--amber)' : 'var(--emerald)', marginTop: '6px' }}>
                  {medRecData.polypharmacyAlert ? '⚠ 4+ Concurrent Therapies' : '✓ Standard Monitored Regimen'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '14px' }}>
              Reconciled Pharmacotherapy Matrix
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medRecData.medications?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '14px 18px',
                    borderRadius: '6px',
                    background: 'var(--surface-recessed)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={15} color="var(--purple)" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {m.display}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Requester: <strong>{m.requester}</strong> • Intent: {m.intent}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: m.adherent ? 'var(--emerald)' : 'var(--rose)', fontFamily: 'var(--font-mono)' }}>
                        {m.pdcPercentage}% PDC
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
                        {m.adherent ? 'Adherence Met' : 'Gap Detected'}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectResource('MedicationRequest', m.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: 'var(--surface-white)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--spruce)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Clinical Trial Protocol Eligibility & Cohort Screener */}
      {dossierViewMode === 'trials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FlaskConical size={20} color="var(--spruce)" />
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
                    Clinical Trial Protocol Feasibility &amp; Cohort Screener
                  </h2>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', maxWidth: '700px' }}>
                  Automated matching of EHR repository cohorts against trial Inclusion/Exclusion (I/E) criteria to determine protocol study feasibility and candidate recruitment readiness.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'right', borderRight: '1px solid var(--border-medium)', paddingRight: '16px' }}>
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>ACTIVE PROTOCOLS</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', fontFamily: 'var(--font-mono)' }}>
                    {trialsData ? trialsData.length : 0}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>PATIENT STATUS</div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: eligibleTrialsCount > 0 ? 'var(--emerald)' : 'var(--ink-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px'
                  }}>
                    {eligibleTrialsCount} ELIGIBLE
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trialsData?.map((item) => {
              const trial = item.trial || item;
              const matched = item.eligiblePatients || item.matchedPatients || [];
              const excluded = item.excludedPatients || [];
              const currentMatch = matched.find(m => m.patientId === patientId);
              const currentExclusion = excluded.find(e => e.patientId === patientId);
              const isCurrentEligible = !!currentMatch;
              const rationale = isCurrentEligible ? currentMatch.rationale : (currentExclusion?.rationale || 'Does not satisfy clinical inclusion criteria.');
              const feasibilityRate = trial.feasibilityRate || (item.totalEvaluated ? `${((item.eligibleCount / item.totalEvaluated) * 100).toFixed(1)}%` : '20.0%');

              return (
                <div
                  key={trial.id}
                  style={{
                    background: 'var(--surface-white)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--spruce)', fontWeight: 600 }}>
                          {trial.id}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          {trial.phase}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          {trial.therapeuticArea}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
                        {trial.title}
                      </h3>
                      <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '3px' }}>
                        Sponsor: {trial.sponsor}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                        COHORT FEASIBILITY
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--spruce)', fontFamily: 'var(--font-mono)' }}>
                        {feasibilityRate}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
                        {matched.length} of {matched.length + excluded.length} candidates
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '6px',
                    marginBottom: '18px',
                    background: isCurrentEligible ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-recessed)',
                    border: isCurrentEligible ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    {isCurrentEligible ? (
                      <CheckCircle2 size={18} color="var(--emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={18} color="var(--ink-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isCurrentEligible ? 'var(--emerald)' : 'var(--ink-secondary)',
                        marginBottom: '2px'
                      }}>
                        {isCurrentEligible ? `PATIENT ${patientId}: ELIGIBLE CANDIDATE` : `PATIENT ${patientId}: EXCLUDED FROM PROTOCOL`}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-primary)', lineHeight: 1.4 }}>
                        {rationale}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                    fontSize: '12px'
                  }}>
                    <div style={{ background: 'var(--surface-recessed)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)' }}></span>
                        Inclusion Criteria
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {trial.inclusionCriteria?.map(c => (
                          <li key={c.id}><strong>[{c.id}]</strong> {c.description}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: 'var(--surface-recessed)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rose)' }}></span>
                        Exclusion Criteria
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--ink-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {trial.exclusionCriteria?.map(c => (
                          <li key={c.id}><strong>[{c.id}]</strong> {c.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      CROSS-COHORT SCREENING RESULTS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[...matched, ...excluded].map((item) => {
                        const isCurrent = item.patientId === patientId;
                        return (
                          <button
                            key={item.patientId}
                            onClick={() => setPatientId(item.patientId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              border: isCurrent ? '2px solid var(--spruce)' : '1px solid var(--border-medium)',
                              background: item.isEligible ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-recessed)',
                              color: 'var(--ink-primary)',
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer'
                            }}
                            title={`${item.name} (${item.patientId}): ${item.rationale}`}
                          >
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: item.isEligible ? 'var(--emerald)' : 'var(--ink-muted)'
                            }}></span>
                            <span>{item.name || item.patientId}</span>
                            <span style={{ color: item.isEligible ? 'var(--emerald)' : 'var(--ink-muted)', fontWeight: 700, fontSize: '9.5px' }}>
                              {item.isEligible ? 'MATCHED' : 'EXCLUDED'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

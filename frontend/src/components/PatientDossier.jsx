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
  GitBranch
} from 'lucide-react';
import { api } from '../api';

export default function PatientDossier({ patientId, setPatientId, patients, onSelectResource, setCurrentTab, userPerspective = 'clinician' }) {
  const [dossier, setDossier] = useState(null);
  const [cdsData, setCdsData] = useState(null);
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
        const [data, cdsAlerts] = await Promise.all([
          api.getPatientDossier(patientId),
          api.getCdsAlerts(patientId).catch(() => null)
        ]);
        setDossier(data);
        setCdsData(cdsAlerts);
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
  const transferDecisionTone = isTransferReady ? 'ok' : 'warn';

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
                border: isSelected ? '1px solid var(--spruce)' : '1px solid var(--border-hairline)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{p.name}</span>
              <span style={{ opacity: 0.65, fontSize: '10px' }}>({p.id})</span>
            </button>
          );
        })}
      </div>

      {/* Patient Identity & Transfer Readiness Header (Open Editorial) */}
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

        {/* Floating Transfer Readiness Decision Ribbon */}
        <div style={{
          background: isTransferReady ? 'var(--emerald-light)' : 'var(--amber-light)',
          border: `1px solid ${isTransferReady ? 'rgba(6, 95, 70, 0.25)' : 'rgba(180, 83, 9, 0.25)'}`,
          borderRadius: '6px',
          padding: '12px 18px',
          minWidth: '260px'
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
                  key={alert.id}
                  style={{
                    background: bgTint,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '6px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '9.5px', 
                        fontWeight: 700, 
                        letterSpacing: '0.04em',
                        color: badgeColor,
                        background: badgeBg,
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        {alert.title}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-muted)' }}>
                      {alert.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                    {alert.summary}
                  </div>

                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--ink-primary)', 
                    background: 'rgba(255, 255, 255, 0.65)', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    borderLeft: `2px solid ${badgeColor}`,
                    lineHeight: 1.4
                  }}>
                    <strong>Clinical Action:</strong> {alert.recommendation}
                    <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Guideline: {alert.guideline}
                    </div>
                  </div>

                  {alert.target_resources && alert.target_resources.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-muted)' }}>
                        Linked Resources:
                      </span>
                      {alert.target_resources.map((tr) => (
                        <button
                          key={`${tr.resourceType}-${tr.id}`}
                          onClick={() => onSelectResource(tr.resourceType, tr.id)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10.5px',
                            background: 'var(--surface-white)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            color: 'var(--spruce)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{tr.resourceType}/{tr.id}</span>
                          <span style={{ color: 'var(--ink-muted)' }}>({tr.display})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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

                  {/* SVG Self-Drawing Sparkline (Anime.js) */}
                  <div style={{ position: 'relative' }}>
                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                      <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="var(--border-hairline)" strokeDasharray="3 3" />
                      
                      <path 
                        className="sparkline-curve"
                        d={pathData} 
                        fill="none" 
                        stroke="var(--spruce)" 
                        strokeWidth="2.5" 
                      />

                      {coords.map((c, idx) => (
                        <circle
                          key={idx}
                          className="sparkline-dot"
                          cx={c.x}
                          cy={c.y}
                          r={hoveredPoint?.observationId === c.point.observationId ? 6 : 4}
                          fill={hoveredPoint?.observationId === c.point.observationId ? 'var(--mint)' : 'var(--spruce)'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={() => setHoveredPoint(c.point)}
                          onClick={() => {
                            setSelectedPoint(c.point);
                            onSelectResource('Observation', c.point.observationId);
                          }}
                        />
                      ))}
                    </svg>

                    {/* Interactive Hover Callout */}
                    {hoveredPoint && (
                      <div style={{
                        marginTop: '4px',
                        padding: '5px 10px',
                        background: 'var(--surface-recessed)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-hairline)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{hoveredPoint.date}: <strong>{hoveredPoint.value} {hoveredPoint.unit}</strong></span>
                        <button 
                          onClick={() => onSelectResource('Observation', hoveredPoint.observationId)}
                          style={{ color: 'var(--spruce)', textDecoration: 'underline', cursor: 'pointer', fontSize: '10px' }}
                        >
                          Inspect ({hoveredPoint.observationId}) →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dominant Temporal Spine & Chronological Journey */}
      <div>
        {/* Timeline Header & Category Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '14px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--spruce)" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 500, color: 'var(--ink-primary)' }}>
              Longitudinal Care Timeline (2023 → 2025)
            </h2>
            <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
              {filteredEvents.length} Events
            </span>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="var(--ink-muted)" />
            {['all', 'encounter', 'observation', 'condition', 'medication'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  background: activeCategory === cat ? 'var(--spruce-light)' : 'transparent',
                  color: activeCategory === cat ? 'var(--spruce)' : 'var(--ink-secondary)',
                  border: activeCategory === cat ? '1px solid rgba(12, 90, 86, 0.3)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Temporal Spine */}
        <div style={{ position: 'relative', paddingLeft: '36px' }}>
          {/* Vertical Spine Line */}
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '4px',
            bottom: '4px',
            width: '2px',
            background: 'var(--border-hairline)'
          }} />

          {/* Chronological Event Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredEvents.map((ev, i) => {
              const borderTone = getCategoryColor(ev.category, ev.resourceType);
              return (
                <div 
                  key={`${ev.resourceKey}-${i}`}
                  style={{
                    position: 'relative',
                    background: 'var(--surface-white)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hairline)',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = borderTone}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-hairline)'}
                >
                  {/* Node Anchor on the Spine */}
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
      </div>
    </div>
  );
}

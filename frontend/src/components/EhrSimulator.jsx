import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  Plus, 
  FileText, 
  Pill, 
  Stethoscope, 
  Activity, 
  Code, 
  Play, 
  Layers,
  ArrowUpRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export default function EhrSimulator({ onSelectResource, setCurrentTab, selectedPatientId = 'PAT-VANCE-01' }) {
  const [patientId, setPatientId] = useState(selectedPatientId);
  const [ehrTheme, setEhrTheme] = useState('epic'); // 'epic' | 'cerner'
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'chart' | 'json'
  const [patientCards, setPatientCards] = useState([]);
  const [orderCards, setOrderCards] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(['Empagliflozin 10mg PO Daily']);
  const [signedState, setSignedState] = useState(false);
  const [loadingHook, setLoadingHook] = useState(false);
  const [activeCardView, setActiveCardView] = useState('formatted'); // 'formatted' | 'raw'

  const catalogOrders = [
    { id: 'empagliflozin', name: 'Empagliflozin 10mg PO Daily (Jardiance)', category: 'SGLT2 Inhibitor', tier: 'Tier 2 Preferred' },
    { id: 'semaglutide', name: 'Semaglutide 0.5mg SQ Weekly (Ozempic)', category: 'GLP-1 Receptor Agonist', tier: 'Non-Formulary / PA Req' },
    { id: 'cardiac_mri', name: 'Cardiac MRI with Contrast (Stress Perfusion)', category: 'Advanced Diagnostic', tier: 'AUC Pre-Auth Req' },
    { id: 'atorvastatin', name: 'Atorvastatin 40mg PO Daily (Lipitor)', category: 'HMG-CoA Reductase Inhibitor', tier: 'Tier 1 Generic' },
    { id: 'metformin', name: 'Metformin HCl 1000mg PO Twice Daily', category: 'Biguanide', tier: 'Tier 1 Generic' }
  ];

  // Trigger patient-view hook when patient changes
  useEffect(() => {
    async function triggerPatientView() {
      setLoadingHook(true);
      try {
        const res = await api.callCdsHook('patient-view', patientId);
        setPatientCards(res.cards || []);
      } catch (err) {
        console.error('Failed to trigger patient-view hook:', err);
      } finally {
        setLoadingHook(false);
      }
    }
    triggerPatientView();
  }, [patientId]);

  // Trigger order-select hook when order selections change
  useEffect(() => {
    async function triggerOrderSelect() {
      if (selectedOrders.length === 0) {
        setOrderCards([]);
        return;
      }
      try {
        const res = await api.callCdsHook('order-select', patientId, { selections: selectedOrders });
        setOrderCards(res.cards || []);
      } catch (err) {
        console.error('Failed to trigger order-select hook:', err);
      }
    }
    triggerOrderSelect();
  }, [selectedOrders, patientId]);

  const handleToggleOrder = (orderName) => {
    setSignedState(false);
    setSelectedOrders(prev => 
      prev.includes(orderName) 
        ? prev.filter(o => o !== orderName) 
        : [...prev, orderName]
    );
  };

  const handleSignOrders = async () => {
    setLoadingHook(true);
    try {
      const res = await api.callCdsHook('order-sign', patientId, { orders: selectedOrders });
      setSignedState(true);
    } catch (err) {
      console.error('Sign error:', err);
    } finally {
      setLoadingHook(false);
    }
  };

  const isEpic = ehrTheme === 'epic';

  const patientDemographics = patientId === 'PAT-THORNE-02' ? {
    name: 'Arthur Thorne',
    mrn: 'MRN-7840129',
    dob: '1960-03-24 (Age 64)',
    sex: 'Male',
    location: 'Cardiovascular ICU (Bed 4A)',
    attending: 'Dr. Sarah Lin, MD (Cardiothoracic Surgery)',
    allergies: 'Penicillin (Anaphylaxis)',
    code: 'FULL CODE'
  } : {
    name: 'Harold Vance',
    mrn: 'MRN-1002384',
    dob: '1966-04-12 (Age 58)',
    sex: 'Male',
    location: 'Endocrinology & Renal Ambulatory Clinic',
    attending: 'Dr. Evelyn Reed, MD (Internal Medicine)',
    allergies: 'No Known Drug Allergies (NKDA)',
    code: 'FULL CODE'
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-sans)' }}>
      {/* Top Banner & Control Deck */}
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
            background: isEpic ? '#4A0E4E' : '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: isEpic ? '0 0 16px rgba(74, 14, 78, 0.35)' : '0 0 16px rgba(2, 132, 199, 0.35)'
          }}>
            <Monitor size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Point-of-Care EHR Simulator & CDS Hooks 2.0 Studio
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
                HL7 CDS Hooks Active
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
              Simulates native clinician workflow inside Epic Hyperspace / Cerner Millennium with real-time pre-flight decision cards.
            </p>
          </div>
        </div>

        {/* Controls: Theme & Patient Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--canvas-recessed)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-hairline)' }}>
            <button
              onClick={() => setEhrTheme('epic')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: isEpic ? '#4A0E4E' : 'transparent',
                color: isEpic ? '#FFF' : 'var(--ink-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              Epic Hyperspace
            </button>
            <button
              onClick={() => setEhrTheme('cerner')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: !isEpic ? '#0284C7' : 'transparent',
                color: !isEpic ? '#FFF' : 'var(--ink-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              Cerner Millennium
            </button>
          </div>

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
            <option value="PAT-VANCE-01">Harold Vance (T2D + CKD 3b)</option>
            <option value="PAT-THORNE-02">Arthur Thorne (Post-STEMI CABG)</option>
          </select>
        </div>
      </div>

      {/* 3D Perspective Monitor Shell */}
      <div style={{
        perspective: '1200px',
        marginBottom: '32px'
      }}>
        <div style={{
          borderRadius: '14px',
          overflow: 'hidden',
          background: isEpic ? '#1E1B24' : '#0F172A',
          border: isEpic ? '2px solid rgba(147, 51, 234, 0.3)' : '2px solid rgba(56, 189, 248, 0.3)',
          boxShadow: isEpic 
            ? '0 24px 60px rgba(74, 14, 78, 0.25), 0 0 30px rgba(147, 51, 234, 0.1)' 
            : '0 24px 60px rgba(2, 132, 199, 0.25), 0 0 30px rgba(56, 189, 248, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* EHR Top Header Bar */}
          <div style={{
            background: isEpic ? '#2E1534' : '#1E293B',
            padding: '10px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-mono)',
                color: isEpic ? '#E879F9' : '#38BDF8'
              }}>
                {isEpic ? 'EPIC HYPERSPACE // PRODUCTION' : 'ORACLE CERNER MILLENNIUM // CLINICAL'}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>• Session: DR-REED-9041</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#34D399',
                background: 'rgba(52, 211, 153, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} />
                CDS Hooks Engine: ONLINE
              </span>
            </div>
          </div>

          {/* Patient Banner Bar */}
          <div style={{
            background: isEpic ? '#3B1D42' : '#334155',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px'
              }}>
                {patientDemographics.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>{patientDemographics.name}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>{patientDemographics.mrn}</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: '#DC2626',
                    color: '#FFF',
                    fontWeight: 700
                  }}>
                    {patientDemographics.code}
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.75, display: 'flex', gap: '12px', marginTop: '2px' }}>
                  <span>DOB: {patientDemographics.dob}</span>
                  <span>Sex: {patientDemographics.sex}</span>
                  <span>Loc: {patientDemographics.location}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', textAlign: 'right' }}>
              <div style={{ color: '#F87171', fontWeight: 600 }}>Allergies: {patientDemographics.allergies}</div>
              <div style={{ opacity: 0.8 }}>Attending: {patientDemographics.attending}</div>
            </div>
          </div>

          {/* Split-Screen Workspace */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(360px, 1fr)', minHeight: '620px' }}>
            {/* Left Column: Clinician Order Desk */}
            <div style={{
              background: isEpic ? '#18141F' : '#0B132B',
              padding: '20px',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Clinical Order Entry (CPOE)
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                  Select orders to trigger order-select hook
                </span>
              </div>

              {/* Order Selection Catalog */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catalogOrders.map(item => {
                  const isSelected = selectedOrders.includes(item.name);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleOrder(item.name)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: isSelected 
                          ? (isEpic ? 'rgba(168, 85, 247, 0.22)' : 'rgba(14, 165, 233, 0.22)')
                          : 'rgba(255,255,255,0.03)',
                        border: isSelected 
                          ? (isEpic ? '1px solid #C084FC' : '1px solid #38BDF8')
                          : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.3)',
                          background: isSelected ? (isEpic ? '#A855F7' : '#0284C7') : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {isSelected && '✓'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.category}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: item.tier.includes('Non-Formulary') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
                        color: item.tier.includes('Non-Formulary') ? '#FCA5A5' : '#CBD5E1',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {item.tier}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Sign Action Bar */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} queued for signature
                </div>
                <button
                  onClick={handleSignOrders}
                  disabled={selectedOrders.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    background: signedState 
                      ? '#10B981' 
                      : (isEpic ? 'linear-gradient(135deg, #A855F7, #7E22CE)' : 'linear-gradient(135deg, #0284C7, #0369A1)'),
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedOrders.length === 0 ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CheckCircle2 size={14} />
                  {signedState ? 'Orders Signed & Transmitted' : 'Review & Sign (order-sign)'}
                </button>
              </div>
            </div>

            {/* Right Column: Live CDS Hooks 2.0 Card Feed */}
            <div style={{
              background: isEpic ? '#130F1A' : '#080E1E',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="#38BDF8" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Active CDS Decision Cards
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setActiveCardView(activeCardView === 'formatted' ? 'raw' : 'formatted')}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      color: '#94A3B8',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    {activeCardView === 'formatted' ? '<> JSON Spec' : 'Formatted Cards'}
                  </button>
                </div>
              </div>

              {/* JSON Spec View */}
              {activeCardView === 'raw' ? (
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  padding: '14px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#A7F3D0',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <pre>{JSON.stringify({ patientViewCards: patientCards, orderSelectCards: orderCards }, null, 2)}</pre>
                </div>
              ) : (
                /* Formatted CDS Cards Feed */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Order-Select Cards */}
                  {orderCards.map(card => {
                    const isWarn = card.indicator === 'warning';
                    const isCrit = card.indicator === 'critical';
                    const accentColor = isCrit ? '#EF4444' : isWarn ? '#F59E0B' : '#10B981';
                    const bgGlow = isCrit ? 'rgba(239, 68, 68, 0.08)' : isWarn ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)';

                    return (
                      <motion.div
                        key={card.uuid || card.summary}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          borderRadius: '10px',
                          background: bgGlow,
                          border: `1px solid ${accentColor}40`,
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: `0 4px 16px ${accentColor}15`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCrit ? <ShieldAlert size={16} color={accentColor} /> : isWarn ? <AlertCircle size={16} color={accentColor} /> : <CheckCircle2 size={16} color={accentColor} />}
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
                              Hook: order-select • {card.indicator}
                            </span>
                          </div>
                          {card.source && (
                            <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                              Source: {card.source.label}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>
                          {card.summary}
                        </div>

                        <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5' }}>
                          {card.detail}
                        </div>

                        {/* Interactive Suggestions */}
                        {card.suggestions && card.suggestions.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                            {card.suggestions.map(sug => (
                              <button
                                key={sug.uuid || sug.label}
                                onClick={() => {
                                  if (sug.label.includes('Empagliflozin')) {
                                    setSelectedOrders(['Empagliflozin 10mg PO Daily (Jardiance)']);
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  color: '#FFF',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span>{sug.label}</span>
                                <Plus size={14} color="#38BDF8" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* SMART on FHIR Launch Links */}
                        {card.links && card.links.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {card.links.map(link => (
                              <button
                                key={link.label}
                                onClick={() => setCurrentTab && setCurrentTab('dossier')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: isEpic ? '#9333EA' : '#0284C7',
                                  color: '#FFF',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <ExternalLink size={12} />
                                {link.label} (SMART OAuth Launch)
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Patient-View Cards (HCC Recapture & Quality Gaps) */}
                  {patientCards.map(card => {
                    const isWarn = card.indicator === 'warning';
                    const isCrit = card.indicator === 'critical';
                    const accentColor = isCrit ? '#EF4444' : isWarn ? '#F59E0B' : '#38BDF8';
                    const bgGlow = isCrit ? 'rgba(239, 68, 68, 0.08)' : isWarn ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.08)';

                    return (
                      <motion.div
                        key={card.uuid || card.summary}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          borderRadius: '10px',
                          background: bgGlow,
                          border: `1px solid ${accentColor}40`,
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: `0 4px 16px ${accentColor}15`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} color={accentColor} />
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
                              Hook: patient-view • {card.indicator}
                            </span>
                          </div>
                          {card.source && (
                            <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                              Source: {card.source.label}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>
                          {card.summary}
                        </div>

                        <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5' }}>
                          {card.detail}
                        </div>

                        {card.suggestions && card.suggestions.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                            {card.suggestions.map(sug => (
                              <div
                                key={sug.uuid || sug.label}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#FFF',
                                  fontSize: '12px',
                                  fontWeight: 600
                                }}
                              >
                                <span>{sug.label}</span>
                                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34D399' }}>Actionable</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {card.links && card.links.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {card.links.map(link => (
                              <button
                                key={link.label}
                                onClick={() => setCurrentTab && setCurrentTab('dossier')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.12)',
                                  color: '#FFF',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  cursor: 'pointer'
                                }}
                              >
                                <ArrowUpRight size={12} />
                                {link.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

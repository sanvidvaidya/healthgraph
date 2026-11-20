import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Search, 
  ChevronRight, 
  Pill, 
  FileText, 
  Layers, 
  Sparkles,
  ArrowRight,
  Info,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

export default function PharmacogenomicsLab({ selectedPatientId = 'PAT-VANCE-01', onSelectResource, setCurrentTab }) {
  const [patientId, setPatientId] = useState(selectedPatientId);
  const [patientProfile, setPatientProfile] = useState(null);
  const [guidelines, setGuidelines] = useState([]);
  const [activeTab, setActiveTab] = useState('preorder'); // 'preorder' | 'profile' | 'guidelines'
  const [selectedDrug, setSelectedDrug] = useState('Clopidogrel (Plavix)');
  const [preOrderResult, setPreOrderResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const testMedications = [
    { name: 'Clopidogrel (Plavix)', category: 'Antiplatelet', geneTarget: 'CYP2C19' },
    { name: 'Codeine / Tramadol', category: 'Opioid Analgesic', geneTarget: 'CYP2D6' },
    { name: 'Atorvastatin (Lipitor)', category: 'Statin / HMG-CoA', geneTarget: 'SLCO1B1' },
    { name: 'Fluorouracil (5-FU)', category: 'Antineoplastic', geneTarget: 'DPYD' },
    { name: 'Abacavir (Ziagen)', category: 'Antiretroviral', geneTarget: 'HLA-B' }
  ];

  useEffect(() => {
    loadPgxData(patientId);
  }, [patientId]);

  const loadPgxData = async (id) => {
    try {
      const [profile, rules] = await Promise.all([
        api.getPatientPgxProfile(id),
        api.getPgxGuidelines()
      ]);
      setPatientProfile(profile);
      setGuidelines(rules || []);
      // Auto run pre-order check for initial drug
      runPreOrderCheck(id, selectedDrug);
    } catch (err) {
      console.error('Failed to load PGx data:', err);
    }
  };

  const runPreOrderCheck = async (pid, drug) => {
    setIsChecking(true);
    try {
      const res = await api.preOrderPgxCheck(pid, drug);
      setPreOrderResult(res);
    } catch (err) {
      console.error('Pre-order check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectDrug = (drugName) => {
    setSelectedDrug(drugName);
    runPreOrderCheck(patientId, drugName);
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
              background: 'var(--purple-light)',
              color: 'var(--purple)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <Dna size={12} />
              CPIC Level A Precision Dosing Protocol
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--spruce-light)',
              color: 'var(--spruce)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <FlaskConical size={12} />
              FDA Pharmacogenomic Biomarker Table Aligned
            </span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '24px', 
            fontWeight: 700, 
            letterSpacing: '-0.03em', 
            margin: 0 
          }}>
            Pharmacogenomics (PGx) CPIC Precision Dosing
          </h1>
          <p style={{ 
            margin: '6px 0 0', 
            fontSize: '13.5px', 
            color: 'var(--ink-secondary)', 
            maxWidth: '820px',
            lineHeight: 1.5 
          }}>
            Evaluates individual patient genomic variants (star alleles, diplotypes, metabolizer phenotypes) against CPIC Level A/B guidelines. Detects hazardous gene-drug contraindications and generates point-of-care precision dosage adjustments before order signature.
          </p>
        </div>

        {/* Navigation Tabs Pill */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-subtle)',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid var(--border-hairline)'
        }}>
          {[
            { id: 'preorder', label: 'Pre-Order CDS' },
            { id: 'profile', label: 'Patient Genomic Profile' },
            { id: 'guidelines', label: 'CPIC Rules Catalog' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--surface-white)' : 'transparent',
                color: activeTab === tab.id ? 'var(--spruce)' : 'var(--ink-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Context Banner */}
      <div style={{
        background: 'var(--surface-white)',
        borderRadius: '8px',
        border: '1px solid var(--border-hairline)',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Subject</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              {patientProfile?.patientName || 'Harold Vance'} ({patientProfile?.patientId || patientId})
            </span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-hairline)' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Genomic Readiness</span>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--emerald)' }}>
              {patientProfile?.pgxReadinessScore || 95}% Profiled
            </span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-hairline)' }} />
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Actionable Variants</span>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--purple)' }}>
              {patientProfile?.variants?.length || 3} Genes Profiled
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>Switch Cohort:</span>
          {['PAT-VANCE-01', 'PAT-THORNE-02', 'PAT-CHEN-03'].map(pid => (
            <button
              key={pid}
              onClick={() => {
                setPatientId(pid);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${patientId === pid ? 'var(--spruce)' : 'var(--border-hairline)'}`,
                background: patientId === pid ? 'var(--spruce-light)' : 'transparent',
                color: patientId === pid ? 'var(--spruce-hover)' : 'var(--ink-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {pid.replace('PAT-', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Point-of-Care Pre-Order Verification */}
      {activeTab === 'preorder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Drug Selection Panel */}
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '12.5px', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 600, 
              color: 'var(--ink-muted)', 
              margin: '0 0 12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Select Order Medication
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {testMedications.map(med => {
                const isSelected = selectedDrug === med.name;
                return (
                  <button
                    key={med.name}
                    onClick={() => handleSelectDrug(med.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? 'var(--purple)' : 'var(--border-hairline)'}`,
                      background: isSelected ? 'var(--purple-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '2px' }}>
                      <span style={{ 
                        fontSize: '12.5px', 
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 600, 
                        color: isSelected ? 'var(--purple)' : 'var(--ink-primary)' 
                      }}>
                        {med.name}
                      </span>
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontFamily: 'var(--font-mono)', 
                        padding: '2px 5px', 
                        borderRadius: '3px',
                        background: 'rgba(0,0,0,0.04)',
                        color: 'var(--ink-muted)'
                      }}>
                        {med.geneTarget}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                      {med.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-Order Verification CDS Result */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {preOrderResult?.alert ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--surface-white)',
                  borderRadius: '8px',
                  border: `1.5px solid ${preOrderResult.alert.severity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)'}`,
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: preOrderResult.alert.severity === 'CRITICAL' ? 'var(--crimson-light)' : 'var(--amber-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShieldAlert size={18} color={preOrderResult.alert.severity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)'} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: preOrderResult.alert.severity === 'CRITICAL' ? 'var(--crimson)' : 'var(--amber)'
                        }}>
                          {preOrderResult.alert.severity === 'CRITICAL' ? 'CRITICAL CPIC CONTRAINDICATION' : 'MODERATE PHARMACOGENOMIC WARNING'}
                        </span>
                        {preOrderResult.alert.fdaBlackBox && (
                          <span style={{
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 5px',
                            borderRadius: '2px',
                            background: '#000',
                            color: '#FFF',
                            fontWeight: 700
                          }}>
                            FDA BLACK BOX WARNING
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '2px 0 0', color: 'var(--ink-primary)' }}>
                        {preOrderResult.drugName}: Toxic or Ineffective for {preOrderResult.alert.gene} {preOrderResult.alert.phenotype}
                      </h2>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'var(--purple-light)',
                    color: 'var(--purple)',
                    fontWeight: 600
                  }}>
                    Diplotype: {preOrderResult.alert.diplotype}
                  </span>
                </div>

                {/* Clinical Risk Summary */}
                <div style={{
                  background: 'var(--canvas-bg)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  border: '1px solid var(--border-hairline)'
                }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Clinical Risk Mechanism
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                    {preOrderResult.alert.clinicalRisk}
                  </p>
                </div>

                {/* CPIC Clinical Recommendation */}
                <div style={{
                  background: 'var(--spruce-light)',
                  padding: '14px 16px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  border: '1px solid rgba(13, 148, 136, 0.2)'
                }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--spruce-hover)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    CPIC Actionable Recommendation
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.45 }}>
                    {preOrderResult.alert.recommendation}
                  </p>
                </div>

                {/* Alternative Medications */}
                {preOrderResult.alert.alternativeMedications && preOrderResult.alert.alternativeMedications.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block', marginBottom: '6px' }}>
                      Recommended Safe Therapeutic Alternatives:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {preOrderResult.alert.alternativeMedications.map(alt => (
                        <div
                          key={alt}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            background: 'var(--mint-light)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: 'var(--emerald)',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--mint-light)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <CheckCircle2 size={20} color="var(--emerald)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--emerald)' }}>
                    Safe for Point-of-Care Administration
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                  {preOrderResult?.recommendation || `No high-risk CPIC contraindications found for ${selectedDrug}. Patient genomic profile aligns with standard therapeutic dosing.`}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Patient Genomic Profile */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '13.5px', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 600, 
              color: 'var(--ink-muted)', 
              margin: '0 0 14px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Extracted Patient Diplotypes & Metabolizer Phenotypes
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {patientProfile?.variants?.map((v) => (
                <div
                  key={v.gene}
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-hairline)',
                    background: 'var(--canvas-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>
                      {v.gene}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)' }}>
                      Diplotype: {v.diplotype}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Phenotype</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      {v.phenotype}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                    {v.clinicalImplication}
                  </p>

                  {v.activeMedicationInteractions?.length > 0 && (
                    <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-hairline)' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--crimson)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        ACTIVE MEDICATION INTERACTION
                      </span>
                      {v.activeMedicationInteractions.map(inter => (
                        <div key={inter.drug} style={{ fontSize: '11px', color: 'var(--ink-primary)' }}>
                          <strong>{inter.drug}:</strong> {inter.recommendation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CPIC Guidelines Catalog */}
      {activeTab === 'guidelines' && (
        <div style={{
          background: 'var(--surface-white)',
          borderRadius: '8px',
          border: '1px solid var(--border-hairline)',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ 
            fontSize: '13.5px', 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 600, 
            color: 'var(--ink-muted)', 
            margin: '0 0 14px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            CPIC Level A Evidence Guidelines
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {guidelines.map(rule => (
              <div
                key={rule.ruleId}
                style={{
                  padding: '14px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--canvas-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--spruce)' }}>
                      {rule.gene} ↔ {rule.drug}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      background: 'var(--purple-light)',
                      color: 'var(--purple)',
                      fontWeight: 600
                    }}>
                      {rule.cpicLevel}
                    </span>
                    {rule.fdaBlackBox && (
                      <span style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: '2px',
                        background: '#000',
                        color: '#FFF',
                        fontWeight: 700
                      }}>
                        FDA BLACK BOX
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                    {rule.phenotype}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                  {rule.clinicalRisk}
                </p>

                <div style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: 'rgba(13, 148, 136, 0.08)',
                  fontSize: '11.5px',
                  color: 'var(--spruce-hover)',
                  fontWeight: 500
                }}>
                  <strong>Recommendation:</strong> {rule.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

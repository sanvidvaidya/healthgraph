import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Award, 
  ArrowUpRight, 
  Activity, 
  Sliders, 
  Zap,
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function ActuarialSandbox({ onSelectResource, setCurrentTab }) {
  const [contractType, setContractType] = useState('mssp_enhanced');
  const [attributedLives, setAttributedLives] = useState(10000);
  const [benchmarkPmpm, setBenchmarkPmpm] = useState(850.0);
  const [hccRecaptureLift, setHccRecaptureLift] = useState(0.08); // +0.08 RAF
  const [hedisStarRating, setHedisStarRating] = useState(4.5);
  const [edReductionPct, setEdReductionPct] = useState(0.12); // 12%

  const [simulation, setSimulation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await api.simulateActuarial({
        contractType,
        attributedLives,
        benchmarkPmpm,
        hccRecaptureLift,
        hedisStarRating,
        edReductionPct
      });
      setSimulation(res);
    } catch (err) {
      console.error('Actuarial simulation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [contractType, attributedLives, benchmarkPmpm, hccRecaptureLift, hedisStarRating, edReductionPct]);

  const fin = simulation?.financials;

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

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
            background: 'linear-gradient(135deg, #D97706, #B45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 0 20px rgba(217, 119, 6, 0.35)'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Value-Based Care (VBC) Actuarial Shared Savings & Risk Sandbox
              </h1>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(217, 119, 6, 0.12)',
                color: '#D97706',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                fontWeight: 600
              }}>
                Two-Sided Risk Corridor Modeling
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
              Models how closing clinical data quality gaps, recapturing CMS-HCC V28 conditions, and raising Star ratings translates into bottom-line shared savings.
            </p>
          </div>
        </div>

        {/* Live Cost of Inaction Ticker */}
        {fin && (
          <div style={{
            background: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Zap size={16} color="#E11D48" />
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#E11D48', fontWeight: 700 }}>
                DAILY COST OF INACTION
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#BE123C', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(fin.dailyCostOfInaction)} / day
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Cards */}
      {fin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Net Shared Savings Payout */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.04))',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                NET SHARED SAVINGS PAYOUT
              </span>
              <DollarSign size={16} color="#059669" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#047857', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
              {formatCurrency(fin.netSharedSavingsPayout)}
            </div>
            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '4px' }}>
              Check payable to provider organization (Savings: {fin.savingsPercentage}%)
            </div>
          </div>

          {/* Downside Penalty Avoidance */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.04))',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                DOWNSIDE PENALTY AVOIDED
              </span>
              <ShieldCheck size={16} color="#2563EB" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#1D4ED8', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
              {formatCurrency(fin.downsidePenaltyAvoided)}
            </div>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px' }}>
              Corridor loss protection under 2-sided contract terms
            </div>
          </div>

          {/* Benchmark vs Managed Delta */}
          <div style={{
            background: '#FFF',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                RISK-ADJUSTED BENCHMARK
              </span>
              <Activity size={16} color="var(--ink-muted)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(fin.adjustedBenchmark)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              Actual: {formatCurrency(fin.actualSpending)} (Gross Savings: {formatCurrency(fin.grossSavings)})
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & High Opportunity Cohort Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
        {/* Left Column: Contract Parameters Workbench */}
        <div style={{
          background: '#FFF',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#D97706" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
              Contract Parameters & Clinical Levers
            </h3>
          </div>

          {/* Contract Model Switcher */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: '6px' }}>
              Value-Based Risk Track:
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                background: 'var(--canvas-bg)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-primary)'
              }}
            >
              <option value="mssp_enhanced">CMS MSSP Enhanced (75% Upside / 40% Downside)</option>
              <option value="mssp_basic_e">CMS MSSP Basic Track E (50% Upside / 30% Downside)</option>
              <option value="ma_full_risk">Medicare Advantage Full Capitation (85% MLR Target)</option>
            </select>
          </div>

          {/* Slider 1: Attributed Lives */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Attributed Lives:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>
                {attributedLives.toLocaleString()} members
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={attributedLives}
              onChange={(e) => setAttributedLives(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 2: Baseline PMPM */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Baseline Benchmark PMPM:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>
                ${benchmarkPmpm} / member / month
              </span>
            </div>
            <input
              type="range"
              min="650"
              max="1300"
              step="25"
              value={benchmarkPmpm}
              onChange={(e) => setBenchmarkPmpm(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 3: HCC Recapture Lift */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>HCC Recapture Coding Lift (RAF):</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                +{hccRecaptureLift.toFixed(2)} RAF Delta
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.25"
              step="0.01"
              value={hccRecaptureLift}
              onChange={(e) => setHccRecaptureLift(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 4: HEDIS Star Rating */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>HEDIS Quality Star Rating:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#D97706' }}>
                {hedisStarRating.toFixed(1)} Stars (Multiplier: {fin?.qualityMultiplier * 100}%)
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.5"
              value={hedisStarRating}
              onChange={(e) => setHedisStarRating(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 5: Avoidable ED Utilization Reduction */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Avoidable ED Reduction Rate:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563EB' }}>
                {Math.round(edReductionPct * 100)}% Avoided
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.30"
              step="0.02"
              value={edReductionPct}
              onChange={(e) => setEdReductionPct(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right Column: High-Opportunity Patient Attribution Roster */}
        <div style={{
          background: '#FFF',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
                Attributed Member Opportunity Roster
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              Top Cohort Actionable Leads
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: 0 }}>
            Prioritized by un-recaptured chronic HCC conditions and active HEDIS Star measure quality gaps.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {simulation?.highOpportunityPatients?.map(patient => (
              <div
                key={patient.patientId}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'var(--canvas-bg)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(79, 70, 229, 0.12)',
                      color: '#4F46E5',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {patient.name} ({patient.age}y)
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                        {patient.patientId}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                      {patient.capitationValue}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
                      {patient.rafLiftOpportunity}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {patient.unclosedGaps.map((gap, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid rgba(217, 119, 6, 0.2)'
                      }}
                    >
                      {gap}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    onClick={() => setCurrentTab && setCurrentTab('dossier')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: '#FFF',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--ink-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Open Patient Dossier</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

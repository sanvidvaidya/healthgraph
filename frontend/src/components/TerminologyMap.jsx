import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  ExternalLink,
  Filter,
  RefreshCw,
  Play,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../api';

const MORPH_EXAMPLES = [
  {
    id: 'glucose',
    name: 'Fasting Serum Glucose',
    localCode: 'EPIC_GLUC_FAST_09',
    localSystem: 'Hospital Epic Lab Dictionary #88921',
    fhirField: 'Observation.code',
    loincCode: '1558-6',
    loincDisplay: 'Fasting glucose [Mass/volume] in Serum or Plasma',
    snomedCode: '44054006',
    snomedDisplay: 'Type 2 diabetes mellitus (finding)',
    unit: 'mg/dL (UCUM)',
    challenge: 'Local hospital string cannot be aggregated across regional health information exchanges without canonical LOINC mapping.'
  },
  {
    id: 'hba1c',
    name: 'Glycated Hemoglobin',
    localCode: 'CERNER_A1C_WHOLEBLD',
    localSystem: 'Cerner Millennium Order Catalog #4401',
    fhirField: 'Observation.code',
    loincCode: '4548-4',
    loincDisplay: 'Hemoglobin A1c/Hemoglobin.total in Blood',
    snomedCode: '43396009',
    snomedDisplay: 'Hemoglobin A1c measurement (procedure)',
    unit: '% (UCUM)',
    challenge: 'Assay calibration differences (IFCC vs NGSP) require explicit method coding to prevent erroneous diabetic control classification.'
  },
  {
    id: 'metformin',
    name: 'Metformin Hydrochloride',
    localCode: 'EPIC_RX_MET_500_TAB',
    localSystem: 'Hospital Pharmacy Formulary #RX-1029',
    fhirField: 'MedicationRequest.medicationCodeableConcept',
    loincCode: 'N/A (Clinical Drug)',
    loincDisplay: 'Managed under RxNorm authority',
    snomedCode: '372567009',
    snomedDisplay: 'Metformin (substance)',
    unit: '500 mg oral tablet (RxNorm: 860975)',
    challenge: 'Formulary substitutions (extended release vs immediate release) alter bioavailability and renal dosing contraindications.'
  }
];

export default function TerminologyMap({ onSelectResource }) {
  const [terminologyData, setTerminologyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState(MORPH_EXAMPLES[0]);
  const [morphStep, setMorphStep] = useState(0);
  const [isMorphing, setIsMorphing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getTerminology();
        setTerminologyData(data);
      } catch (err) {
        console.error('Failed to load terminology:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSimulateMorph = () => {
    setIsMorphing(true);
    setMorphStep(0);
    const intervals = [350, 800, 1300, 1800];
    intervals.forEach((delay, idx) => {
      setTimeout(() => {
        setMorphStep(idx + 1);
        if (idx === intervals.length - 1) {
          setIsMorphing(false);
        }
      }, delay);
    });
  };

  if (loading || !terminologyData) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', color: 'var(--spruce)' }} />
        <div style={{ color: 'var(--ink-secondary)', fontSize: '13px', letterSpacing: '0.05em' }}>
          RESOLVING CANONICAL TERMINOLOGY MAPPINGS...
        </div>
      </div>
    );
  }

  const catalog = terminologyData.catalog || [];
  const lesson = terminologyData.lesson || {};

  const filteredCatalog = catalog.filter((item) => {
    if (selectedSystem !== 'ALL' && item.systemName !== selectedSystem) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.display.toLowerCase().includes(q) ||
        item.clinicalMeaning.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 96px' }}>
      
      {/* 1. Canvas Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '10px', letterSpacing: '0.08em', fontWeight: 600 }}>
            SEMANTIC GROUNDING
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            STRUCTURE ≠ MEANING • CODE SYSTEM RESOLUTION
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '34px', 
              fontWeight: 400, 
              letterSpacing: '-0.02em', 
              color: 'var(--ink-primary)', 
              lineHeight: 1.15,
              margin: '0 0 8px 0'
            }}>
              Terminology Mapping &amp; Semantic Translation
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', maxWidth: '840px', margin: 0, lineHeight: 1.5 }}>
              FHIR structures healthcare information into resources and references; terminology systems provide unambiguous, 
              computable clinical semantics. Without standardized code systems, two health systems can exchange syntactically valid 
              FHIR documents while remaining completely unable to interpret laboratory findings or diagnoses.
            </p>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            background: 'var(--surface-recessed)',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-hairline)',
            color: 'var(--ink-muted)'
          }}>
            SYSTEMS: <strong style={{ color: 'var(--ink-primary)' }}>LOINC • SNOMED CT • RxNorm • ICD-10</strong>
          </div>
        </div>
      </div>

      {/* 2. Interactive Semantic Transformation Apparatus (Hero Canvas Instrument) */}
      <div style={{
        marginBottom: '40px',
        padding: '24px 28px',
        background: 'var(--surface-white)',
        border: '1px solid var(--border-medium)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {/* Machine Toolbar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px', 
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-hairline)',
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--spruce)" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 500, margin: 0, color: 'var(--ink-primary)' }}>
                Semantic Morphing Transformer
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Select a clinical concept and execute the step-by-step resolution from proprietary EHR code to globally computable standard.
            </div>
          </div>

          {/* Example Selector & Run Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MORPH_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setSelectedExample(ex);
                    setMorphStep(0);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    background: selectedExample.id === ex.id ? 'var(--spruce-light)' : 'var(--surface-recessed)',
                    color: selectedExample.id === ex.id ? 'var(--spruce)' : 'var(--ink-secondary)',
                    border: selectedExample.id === ex.id ? '1px solid var(--spruce)' : '1px solid var(--border-hairline)',
                    cursor: 'pointer',
                    fontWeight: selectedExample.id === ex.id ? 600 : 400
                  }}
                >
                  {ex.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulateMorph}
              disabled={isMorphing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'var(--spruce)',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                border: 'none',
                cursor: isMorphing ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={12} />
              <span>{isMorphing ? 'Morphing...' : 'Simulate Morph'}</span>
            </button>
          </div>
        </div>

        {/* 4-Stage Morph Conduit Assembly */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          position: 'relative'
        }}>
          {/* Stage 1: Proprietary Ingestion */}
          <div style={{
            padding: '16px',
            borderRadius: '6px',
            background: morphStep >= 1 ? 'rgba(238, 242, 255, 0.6)' : 'var(--surface-recessed)',
            border: `1px solid ${morphStep >= 1 ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-hairline)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Stage 1: Local Ingestion
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '9px' }}>PROPRIETARY</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)', marginTop: '4px' }}>
              {selectedExample.localCode}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px', lineHeight: 1.35 }}>
              {selectedExample.localSystem}
            </div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              ⚠ Incompatible outside source EHR
            </div>
          </div>

          {/* Stage 2: FHIR Structural Container */}
          <div style={{
            padding: '16px',
            borderRadius: '6px',
            background: morphStep >= 2 ? 'rgba(240, 253, 244, 0.7)' : 'var(--surface-recessed)',
            border: `1px solid ${morphStep >= 2 ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-hairline)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Stage 2: FHIR Framing
              </span>
              <span className="badge badge-ok" style={{ fontSize: '9px' }}>STRUCTURED</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--spruce)', marginTop: '4px' }}>
              {selectedExample.fhirField}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              CodeableConcept container binding system URI + code.
            </div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
              ✓ Schema conforms to FHIR R4
            </div>
          </div>

          {/* Stage 3: Canonical LOINC Resolution */}
          <div style={{
            padding: '16px',
            borderRadius: '6px',
            background: morphStep >= 3 ? 'rgba(236, 253, 245, 0.8)' : 'var(--surface-recessed)',
            border: `1px solid ${morphStep >= 3 ? 'var(--spruce)' : 'var(--border-hairline)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Stage 3: LOINC Standard
              </span>
              <span className="badge badge-spruce" style={{ fontSize: '9px' }}>OBSERVATION</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--spruce)', marginTop: '4px' }}>
              {selectedExample.loincCode}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              {selectedExample.loincDisplay}
            </div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--spruce)', fontFamily: 'var(--font-mono)' }}>
              URI: http://loinc.org
            </div>
          </div>

          {/* Stage 4: SNOMED CT Semantic & Unit Binding */}
          <div style={{
            padding: '16px',
            borderRadius: '6px',
            background: morphStep >= 4 ? 'rgba(240, 253, 244, 0.9)' : 'var(--surface-recessed)',
            border: `1px solid ${morphStep >= 4 ? 'var(--emerald)' : 'var(--border-hairline)'}`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Stage 4: SNOMED / UCUM
              </span>
              <span className="badge badge-ok" style={{ fontSize: '9px' }}>COMPUTABLE</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--emerald)', marginTop: '4px' }}>
              SCT: {selectedExample.snomedCode}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
              {selectedExample.snomedDisplay}
            </div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              Standard Unit: {selectedExample.unit}
            </div>
          </div>
        </div>

        {/* Semantic Challenge Footer */}
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'var(--surface-recessed)',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'var(--ink-secondary)',
          borderLeft: '3px solid var(--amber)',
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px'
        }}>
          <strong style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', flexShrink: 0 }}>
            INTEROP CHALLENGE:
          </strong>
          <span>{selectedExample.challenge}</span>
        </div>
      </div>

      {/* 3. Hairline 4-Authority Strip (Replaces separate card grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0',
        marginBottom: '36px',
        background: 'var(--surface-white)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {(lesson.theFourSystems || []).map((sys, idx) => (
          <div 
            key={idx}
            style={{ 
              padding: '16px 18px', 
              borderRight: idx < 3 ? '1px solid var(--border-hairline)' : 'none' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--spruce)' }}>
                {sys.system}
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                {sys.authority}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.4, minHeight: '34px' }}>
              {sys.role}
            </div>
            <div style={{ 
              marginTop: '8px', 
              padding: '4px 6px', 
              background: 'var(--surface-recessed)', 
              borderRadius: '3px', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '10px', 
              color: 'var(--ink-primary)' 
            }}>
              {sys.example}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Open Searchable Catalog (Canvas List) */}
      <div style={{ marginTop: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, margin: 0, color: 'var(--ink-primary)' }}>
                Standard Terminology Catalog
              </h2>
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {filteredCatalog.length} ENTRY{filteredCatalog.length !== 1 ? 'IES' : ''}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Curated local cross-walk records showing system canonical URIs, concepts, and interop challenges.
            </div>
          </div>

          {/* System Pills & Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'LOINC', 'SNOMED CT', 'ICD-10-CM', 'RxNorm'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSystem(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    background: selectedSystem === s ? 'var(--spruce-light)' : 'transparent',
                    color: selectedSystem === s ? 'var(--spruce)' : 'var(--ink-secondary)',
                    border: selectedSystem === s ? '1px solid var(--spruce)' : '1px solid var(--border-hairline)',
                    cursor: 'pointer',
                    fontWeight: selectedSystem === s ? 600 : 400
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: 'var(--surface-white)',
              borderRadius: '4px',
              border: '1px solid var(--border-hairline)',
              width: '220px'
            }}>
              <Search size={12} color="var(--ink-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, name..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '11px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <table className="open-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '180px' }}>SYSTEM &amp; URI</th>
              <th style={{ width: '140px' }}>CODE</th>
              <th style={{ width: '220px' }}>FHIR BINDING</th>
              <th>CLINICAL CONCEPT &amp; INTEROPERABILITY CHALLENGE</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalog.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  No terminology entries match the current query.
                </td>
              </tr>
            ) : (
              filteredCatalog.map((item, idx) => (
                <tr key={`${item.system}-${item.code}-${idx}`}>
                  <td style={{ verticalAlign: 'top', paddingTop: '14px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '9px', fontWeight: 600, display: 'inline-block', marginBottom: '3px' }}>
                      {item.systemName}
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--ink-muted)', wordBreak: 'break-all' }}>
                      {item.system}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '14px' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {item.code}
                    </code>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--spruce)' }}>
                      {item.usedInResource}.{item.usedInField}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '12px', paddingBottom: '14px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-primary)', marginBottom: '2px' }}>
                      {item.display}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                      {item.clinicalMeaning}
                    </div>
                    <div style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      background: 'var(--surface-recessed)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'var(--ink-secondary)',
                      borderLeft: '2px solid var(--amber)'
                    }}>
                      <strong style={{ color: 'var(--amber)', fontSize: '10px' }}>Interop Challenge: </strong>
                      {item.interopChallenge}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}


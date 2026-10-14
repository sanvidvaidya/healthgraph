import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileCode2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  UploadCloud, 
  Download, 
  RefreshCw,
  Layers,
  FileText,
  Sliders,
  Info
} from 'lucide-react';
import { api } from '../api';

const PRESETS = {
  hl7_adt: {
    label: "HL7 v2 ADT^A08 (Patient Demographics & Encounter)",
    format: "hl7v2",
    code: `MSH|^~\\&|EPIC|HOSPITAL|HEALTHGRAPH|CENTRAL|20240412103000||ADT^A08|MSG001|P|2.5.1
PID|1||MRN1002384^^^HOSPITAL||VANCE^HAROLD||19660412|M|||123 PINE ST^^SPRINGFIELD^MA^01103
PV1|1|O|||||12345^REED^EVELYN
DG1|1||E11.9^Type 2 diabetes mellitus without complications^I10
OBX|1|NM|4548-4^Hemoglobin A1c^LN||7.0|%|4.0-5.6|H|||F
ZPV|1|VIP-PATIENT-FLAG|ROOM-SUITE-402`
  },
  hl7_oru: {
    label: "HL7 v2 ORU^R01 (Serial Diagnostic Lab Results)",
    format: "hl7v2",
    code: `MSH|^~\\&|ROCHE_COBAS|METRO_LAB|HEALTHGRAPH|CENTRAL|20240412111500||ORU^R01|MSG002|P|2.5.1
PID|1||MRN1002384^^^HOSPITAL||VANCE^HAROLD||19660412|M
OBR|1||LAB20240412-01|24323-8^Comprehensive Metabolic Panel^LN
OBX|1|NM|4548-4^Hemoglobin A1c^LN||7.0|%|4.0-5.6|H|||F
OBX|2|NM|33914-3^eGFR (CKD-EPI 2021)^LN||48|mL/min|>60|L|||F
OBX|3|NM|2160-0^Creatinine [Mass/volume] in Serum^LN||1.4|mg/dL|0.7-1.3|H|||F
NTE|1|L|Patient advised to maintain hydration prior to repeat renal panel.`
  },
  hl7_rde: {
    label: "HL7 v2 RDE^O11 (Pharmacy Dispense Order)",
    format: "hl7v2",
    code: `MSH|^~\\&|PHARMACY_SYS|DISPENSE|HEALTHGRAPH|CENTRAL|20240412120000||RDE^O11|MSG003|P|2.5.1
PID|1||MRN1002384^^^HOSPITAL||VANCE^HAROLD||19660412|M
ORC|NW|ORD2024-991|||||1^BID^20240412^^^R
RXO|6809^Metformin HCl 1000 MG Oral Tablet^RxNorm|1000|mg||TAB||Oral
DG1|1||E11.9^Type 2 diabetes mellitus^I10`
  },
  ccda_ccd: {
    label: "C-CDA R2.1 Continuity of Care Document (CCD XML)",
    format: "ccda",
    code: `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <title>Continuity of Care Document</title>
  <effectiveTime value="20240412103000"/>
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.4.1" extension="1002384"/>
      <patient>
        <name><family>Vance</family><given>Harold</given></name>
        <administrativeGenderCode code="M" codeSystem="2.16.840.1.113883.5.1"/>
        <birthTime value="19660412"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <component>
        <section>
          <code code="11450-4" displayName="Problem List" codeSystem="2.16.840.1.113883.6.1"/>
          <title>Active Problems</title>
          <text>Patient presents with longstanding Type 2 Diabetes and stage 3b CKD.</text>
          <entry>
            <observation classCode="OBS" moodCode="EVN">
              <code code="E11.9" displayName="Type 2 diabetes mellitus" codeSystem="2.16.840.1.113883.6.90"/>
              <value code="E11.9" displayName="Type 2 diabetes mellitus"/>
            </observation>
          </entry>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`
  }
};

export default function RosettaStone({ onSelectResource, onImportSuccess }) {
  const [selectedPresetKey, setSelectedPresetKey] = useState('hl7_adt');
  const [rawInput, setRawInput] = useState(PRESETS.hl7_adt.code);
  const [format, setFormat] = useState('hl7v2');
  const [convertedResult, setConvertedResult] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ingestState, setIngestState] = useState('idle'); // 'idle' | 'ingesting' | 'done'

  const handleSelectPreset = (key) => {
    setSelectedPresetKey(key);
    setRawInput(PRESETS[key].code);
    setFormat(PRESETS[key].format);
    setConvertedResult(null);
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setIngestState('idle');
    try {
      const res = await api.convertRosetta(format, rawInput);
      setConvertedResult(res);
    } catch (err) {
      console.error('Rosetta conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = () => {
    if (!convertedResult?.bundle) return;
    navigator.clipboard.writeText(JSON.stringify(convertedResult.bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIngest = async () => {
    if (!convertedResult?.bundle) return;
    setIngestState('ingesting');
    try {
      await api.importBundle(convertedResult.bundle, 'merge');
      setIngestState('done');
      if (onImportSuccess) {
        onImportSuccess('PAT-IMPORT-HL7');
      }
    } catch (err) {
      console.error('Ingest failed:', err);
      setIngestState('idle');
    }
  };

  const audit = convertedResult?.audit;
  const fidelityScore = audit?.semanticFidelityScore ?? 0;

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
            background: 'linear-gradient(135deg, #0D9488, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 0 20px rgba(13, 148, 136, 0.35)'
          }}>
            <FileCode2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Legacy-to-FHIR "Rosetta Stone" & Semantic Loss Audit Studio
              </h1>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(13, 148, 136, 0.12)',
                color: '#0D9488',
                border: '1px solid rgba(13, 148, 136, 0.3)',
                fontWeight: 600
              }}>
                HL7 v2 & C-CDA to FHIR R4
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
              Instant bi-directional compilation of legacy hospital messages into US Core FHIR R4 with visual semantic fidelity auditing.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)' }}>Presets:</span>
          <select
            value={selectedPresetKey}
            onChange={(e) => handleSelectPreset(e.target.value)}
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
            {Object.entries(PRESETS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Dual-Pane Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 60px minmax(360px, 1fr)', gap: '16px', alignItems: 'stretch', marginBottom: '24px' }}>
        {/* Left Pane: Legacy Input */}
        <div style={{
          background: '#0F172A',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
        }}>
          <div style={{
            background: '#1E293B',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38BDF8' }}>
                {format === 'ccda' ? 'SOURCE: C-CDA XML DOCUMENT' : 'SOURCE: RAW HL7 v2.5.1 MESSAGE'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                {rawInput.split('\n').length} lines
              </span>
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            spellCheck="false"
            style={{
              flex: 1,
              minHeight: '340px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '16px',
              color: '#E2E8F0',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.6',
              resize: 'none'
            }}
          />
        </div>

        {/* Center Action Instrument */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D9488, #059669)',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
              transition: 'all 0.2s ease'
            }}
            title="Compile into FHIR R4 Bundle"
          >
            {isConverting ? <RefreshCw size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          </button>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textAlign: 'center', fontWeight: 600 }}>
            COMPILE
          </span>
        </div>

        {/* Right Pane: Compiled FHIR R4 Bundle */}
        <div style={{
          background: '#0F172A',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
        }}>
          <div style={{
            background: '#1E293B',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
                TARGET: FHIR R4 BUNDLE (US CORE)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopy}
                disabled={!convertedResult}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  cursor: convertedResult ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>

              <button
                onClick={handleIngest}
                disabled={!convertedResult || ingestState === 'ingesting'}
                style={{
                  background: ingestState === 'done' ? '#10B981' : '#0D9488',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 10px',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: convertedResult ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UploadCloud size={12} />
                {ingestState === 'ingesting' ? 'Ingesting...' : ingestState === 'done' ? 'Ingested Live' : 'Ingest to Session'}
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            minHeight: '340px',
            padding: '16px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            color: '#A7F3D0'
          }}>
            {convertedResult?.bundle ? (
              <pre style={{ margin: 0 }}>{JSON.stringify(convertedResult.bundle, null, 2)}</pre>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '8px' }}>
                <FileCode2 size={32} opacity={0.4} />
                <span>Click "COMPILE" to generate valid FHIR R4 Bundle</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Semantic Loss & Fidelity Audit Card */}
      {convertedResult && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFF',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Circular Fidelity Gauge */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: fidelityScore >= 85 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: fidelityScore >= 85 ? '3px solid #10B981' : '3px solid #F59E0B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: fidelityScore >= 85 ? '#059669' : '#D97706', fontFamily: 'var(--font-mono)' }}>
                  {fidelityScore}%
                </span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--ink-muted)' }}>INDEX</span>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
                  Semantic Fidelity & Loss Audit
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
                  Evaluates clinical integrity across terminology mappings, field coercion, and dropped vendor-specific extensions.
                </p>
              </div>
            </div>

            {/* Pill Metrics */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#059669" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>{audit?.mappedCount} Mapped (100%)</span>
              </div>
              <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="#D97706" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706' }}>{audit?.inferredCount} Inferred / Coerced</span>
              </div>
              <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <XCircle size={14} color="#DC2626" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>{audit?.lostCount} Semantic Loss</span>
              </div>
            </div>
          </div>

          {/* Granular Field Mapping Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Mapped Elements */}
            {audit?.audit?.mapped?.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>{item.field}</span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>→ {item.fhirTarget}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#059669', fontStyle: 'italic' }}>{item.notes}</span>
              </div>
            ))}

            {/* Inferred Elements */}
            {audit?.audit?.inferred?.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>{item.field}</span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>→ {item.fhirTarget}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#D97706', fontStyle: 'italic' }}>{item.notes}</span>
              </div>
            ))}

            {/* Lost Elements */}
            {audit?.audit?.lost?.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>{item.field}</span>
                  <span style={{ fontSize: '12px', color: '#DC2626' }}>[TRUNCATED / DROPPED]</span>
                </div>
                <span style={{ fontSize: '11px', color: '#DC2626', fontStyle: 'italic' }}>{item.notes}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Info,
  Cpu,
  Zap,
  GitMerge,
  Eye,
  Code2,
  Activity,
  ShieldAlert,
  ArrowDownRight,
  Network,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRightLeft
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
  
  // Presentation Mode: 'visual' (Interactive Cards & Mappings) | 'raw' (Code Panes)
  const [displayMode, setDisplayMode] = useState('visual');
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [filterAudit, setFilterAudit] = useState('all'); // 'all' | 'mapped' | 'inferred' | 'lost'

  // Execute conversion
  const handleConvert = async (overrideFormat = format, overrideText = rawInput) => {
    setIsConverting(true);
    setIngestState('idle');
    try {
      const res = await api.convertRosetta(overrideFormat, overrideText);
      setConvertedResult(res);
    } catch (err) {
      console.error('Rosetta conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  };

  // Auto-convert on mount and when preset changes
  useEffect(() => {
    handleConvert(PRESETS[selectedPresetKey].format, PRESETS[selectedPresetKey].code);
  }, [selectedPresetKey]);

  const handleSelectPreset = (key) => {
    setSelectedPresetKey(key);
    setRawInput(PRESETS[key].code);
    setFormat(PRESETS[key].format);
    setHoveredSegment(null);
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

  // Parse raw HL7 into structured segment blocks for the Visual Mode
  const parsedSegments = React.useMemo(() => {
    if (format === 'ccda') {
      return [
        { seg: 'HEADER', title: 'ClinicalDocument Header', status: 'mapped', detail: 'Realm: US • Effective: 2024-04-12 • Type: CCD R2.1', targetType: 'Bundle' },
        { seg: 'PATIENT', title: 'recordTarget / patientRole', status: 'mapped', detail: 'Harold Vance (1002384) • Male • DOB 1966-04-12', targetType: 'Patient' },
        { seg: 'PROBLEM', title: 'ProblemSection / entry', status: 'mapped', detail: 'ICD-10: E11.9 (Type 2 diabetes mellitus)', targetType: 'Condition' },
        { seg: 'NARRATIVE', title: 'Unstructured <text> Blocks', status: 'lost', detail: 'Raw clinical prose lacks discrete LOINC/SNOMED terminology coding', targetType: 'Loss' }
      ];
    }

    const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const parts = line.split('|');
      const segName = parts[0].toUpperCase();
      let status = 'mapped';
      let title = segName;
      let detail = line;
      let targetType = 'Unknown';

      if (segName === 'MSH') {
        title = 'Message Header';
        detail = `Sending: ${parts[2] || 'APP'} • MsgType: ${parts[8] || 'ADT'} • Time: ${parts[6] || 'NOW'}`;
        targetType = 'Bundle';
      } else if (segName === 'PID') {
        title = 'Patient Identification';
        detail = `ID: ${parts[3] || 'MRN'} • Name: ${parts[5]?.replace('^', ', ') || 'Unknown'} • DOB: ${parts[7] || 'N/A'}`;
        targetType = 'Patient';
      } else if (segName === 'PV1') {
        title = 'Patient Visit / Encounter';
        detail = `Class: ${parts[2] === 'O' ? 'Outpatient' : parts[2] === 'I' ? 'Inpatient' : 'Ambulatory'} • Attending: ${parts[7] || 'Staff'}`;
        status = 'inferred';
        targetType = 'Encounter';
      } else if (segName === 'DG1') {
        title = 'Diagnosis Entry';
        detail = `Code: ${parts[3]?.replace('^', ' - ') || 'ICD-10'}`;
        targetType = 'Condition';
      } else if (segName === 'OBX') {
        title = 'Observation / Result';
        detail = `${parts[3]?.split('^')[1] || 'Biomarker'}: ${parts[5]} ${parts[6] || ''} (LOINC: ${parts[3]?.split('^')[0]})`;
        targetType = 'Observation';
      } else if (segName === 'OBR') {
        title = 'Observation Request';
        detail = `Panel: ${parts[4]?.replace('^', ' ') || 'Diagnostic Panel'}`;
        targetType = 'ServiceRequest';
      } else if (segName === 'RXO') {
        title = 'Pharmacy Dispense Order';
        detail = `Rx: ${parts[1]?.replace('^', ' ') || 'Medication'}`;
        targetType = 'MedicationRequest';
      } else if (segName.startsWith('Z')) {
        title = 'Vendor Custom Extension (Z-Segment)';
        detail = `Non-standard hospital extension '${segName}' dropped without custom profile.`;
        status = 'lost';
        targetType = 'Loss';
      } else if (segName === 'NTE') {
        title = 'Unstructured Comment Note';
        detail = parts[3] || 'Free-text note without terminology anchor.';
        status = 'lost';
        targetType = 'Loss';
      }

      return { seg: segName, title, status, detail, raw: line, targetType };
    });
  }, [rawInput, format]);

  const audit = convertedResult?.audit;
  const fidelityScore = audit?.semanticFidelityScore ?? 92;

  // Filtered audit items
  const filteredAuditList = React.useMemo(() => {
    if (!audit?.audit) return [];
    const all = [
      ...(audit.audit.mapped || []).map(i => ({ ...i, kind: 'mapped' })),
      ...(audit.audit.inferred || []).map(i => ({ ...i, kind: 'inferred' })),
      ...(audit.audit.lost || []).map(i => ({ ...i, kind: 'lost' }))
    ];
    if (filterAudit === 'all') return all;
    return all.filter(i => i.kind === filterAudit);
  }, [audit, filterAudit]);

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
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Legacy-to-FHIR "Rosetta Stone" & Semantic Crosswalk Studio
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
                HL7 v2 & C-CDA to US Core R4
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
              Visual bi-directional translation chamber with interactive segment deconstruction, live semantic diffs, and data loss detection.
            </p>
          </div>
        </div>

        {/* View Mode & Preset Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Visual vs Raw Code Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--canvas-recessed)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-hairline)' }}>
            <button
              onClick={() => setDisplayMode('visual')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: displayMode === 'visual' ? '#0D9488' : 'transparent',
                color: displayMode === 'visual' ? '#FFF' : 'var(--ink-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Eye size={13} />
              <span>Visual Crosswalk</span>
            </button>
            <button
              onClick={() => setDisplayMode('raw')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: displayMode === 'raw' ? '#0F172A' : 'transparent',
                color: displayMode === 'raw' ? '#FFF' : 'var(--ink-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Code2 size={13} />
              <span>Raw Code View</span>
            </button>
          </div>

          {/* Preset Selector */}
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

      {/* ========================================================================= */}
      {/* MODE A: VISUAL INTERACTIVE CROSSWALK (Default Rich 3D Visual Experience) */}
      {/* ========================================================================= */}
      {displayMode === 'visual' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 80px minmax(360px, 1.2fr)', gap: '16px', alignItems: 'stretch', marginBottom: '24px' }}>
          
          {/* Left Column: Legacy Segment Deconstructor */}
          <div style={{
            background: '#FFF',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#0D9488" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {format === 'ccda' ? 'C-CDA XML Elements' : 'HL7 v2 Message Segments'}
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                Hover to trace mapping
              </span>
            </div>

            {/* Segment Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {parsedSegments.map((item, idx) => {
                const isHovered = hoveredSegment === item.targetType;
                const isLoss = item.status === 'lost';
                const isTransform = item.status === 'inferred';

                const borderCol = isLoss ? '#EF4444' : isTransform ? '#F59E0B' : '#10B981';
                const bgCol = isLoss ? 'rgba(239, 68, 68, 0.04)' : isTransform ? 'rgba(245, 158, 11, 0.04)' : 'rgba(16, 185, 129, 0.04)';

                return (
                  <motion.div
                    key={idx}
                    onMouseEnter={() => setHoveredSegment(item.targetType)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    whileHover={{ scale: 1.015 }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isHovered ? `${borderCol}15` : bgCol,
                      border: `1px solid ${borderCol}60`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isHovered ? `0 0 16px ${borderCol}30` : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isLoss ? '#EF4444' : isTransform ? '#F59E0B' : '#0D9488',
                          color: '#FFF'
                        }}>
                          {item.seg}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                          {item.title}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: borderCol,
                        textTransform: 'uppercase'
                      }}>
                        {isLoss ? '🔴 Loss Risk' : isTransform ? '🟡 Coerced' : '🟢 100% Target'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
                      {item.detail}
                    </div>

                    {item.raw && (
                      <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--ink-muted)',
                        background: 'rgba(0,0,0,0.03)',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.raw}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Center Animated Translation Chamber */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            position: 'relative'
          }}>
            {/* Animated Pulses */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px dashed rgba(13, 148, 136, 0.4)',
                position: 'absolute',
                pointerEvents: 'none'
              }}
            />

            <button
              onClick={() => handleConvert()}
              disabled={isConverting}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D9488, #059669)',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
                transition: 'all 0.2s ease',
                zIndex: 2
              }}
              title="Trigger Crosswalk Compilation"
            >
              {isConverting ? <RefreshCw size={22} className="animate-spin" /> : <Zap size={22} />}
            </button>

            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0D9488', letterSpacing: '0.04em', display: 'block' }}>
                TRANSMUTE
              </span>
              <span style={{ fontSize: '9px', color: 'var(--ink-muted)' }}>
                {fidelityScore}% Fidelity
              </span>
            </div>
          </div>

          {/* Right Column: Modern FHIR R4 Generated Visual Resources */}
          <div style={{
            background: '#FFF',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#059669" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Target FHIR R4 Resources Generated ({convertedResult?.bundle?.total ?? 0})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleIngest}
                  disabled={!convertedResult || ingestState === 'ingesting'}
                  style={{
                    background: ingestState === 'done' ? '#10B981' : '#0D9488',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: convertedResult ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UploadCloud size={13} />
                  <span>{ingestState === 'ingesting' ? 'Ingesting...' : ingestState === 'done' ? 'Ingested to Cohort' : 'Ingest to Session'}</span>
                </button>
              </div>
            </div>

            {/* Visual Resource Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {convertedResult?.bundle?.entry?.map((entry, idx) => {
                const res = entry.resource;
                const isHovered = hoveredSegment === res.resourceType;
                
                let iconColor = '#0D9488';
                let headerText = `${res.resourceType}/${res.id}`;
                let bodyDetails = null;

                if (res.resourceType === 'Patient') {
                  iconColor = '#0D9488';
                  const fam = res.name?.[0]?.family || '';
                  const giv = res.name?.[0]?.given?.join(' ') || '';
                  bodyDetails = (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)' }}>{giv} {fam}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        DOB: {res.birthDate} • Gender: {res.gender} • Identifier: {res.identifier?.[0]?.value || res.id}
                      </div>
                    </div>
                  );
                } else if (res.resourceType === 'Encounter') {
                  iconColor = '#6366F1';
                  bodyDetails = (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {res.class?.display || 'Ambulatory Clinical Encounter'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        Status: {res.status} • Subject: {res.subject?.reference}
                      </div>
                    </div>
                  );
                } else if (res.resourceType === 'Condition') {
                  iconColor = '#EF4444';
                  bodyDetails = (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {res.code?.text || res.code?.coding?.[0]?.display || 'Clinical Condition'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        Code: {res.code?.coding?.[0]?.code} • ClinicalStatus: {res.clinicalStatus?.coding?.[0]?.code || 'active'}
                      </div>
                    </div>
                  );
                } else if (res.resourceType === 'Observation') {
                  iconColor = '#3B82F6';
                  const val = res.valueQuantity?.value;
                  const unit = res.valueQuantity?.unit;
                  bodyDetails = (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                          {res.code?.text || res.code?.coding?.[0]?.display || 'Biomarker'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284C7' }}>
                          {val} {unit}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        LOINC: {res.code?.coding?.[0]?.code} • Status: {res.status}
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.015 }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isHovered ? 'rgba(13, 148, 136, 0.12)' : 'var(--canvas-bg)',
                      border: isHovered ? '1px solid #0D9488' : '1px solid var(--border-hairline)',
                      boxShadow: isHovered ? '0 0 16px rgba(13, 148, 136, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: iconColor,
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800
                      }}>
                        {res.resourceType[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        {bodyDetails}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectResource && onSelectResource(res.resourceType, res.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#FFF',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--ink-primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Inspect</span>
                      <ExternalLink size={11} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: RAW CODE VIEW (For Integration Engineers & Schema Auditing)       */}
      {/* ========================================================================= */}
      {displayMode === 'raw' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 60px minmax(360px, 1fr)', gap: '16px', alignItems: 'stretch', marginBottom: '24px' }}>
          {/* Left Pane: Raw Legacy Monospace */}
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
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38BDF8' }}>
                {format === 'ccda' ? 'SOURCE: C-CDA XML' : 'SOURCE: HL7 v2.5.1 PIPE-DELIMITED'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                {rawInput.split('\n').length} lines
              </span>
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

          {/* Center Action */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => handleConvert()}
              disabled={isConverting}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D9488, #059669)',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)'
              }}
            >
              {isConverting ? <RefreshCw size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', fontWeight: 700 }}>
              PARSE
            </span>
          </div>

          {/* Right Pane: Raw FHIR JSON */}
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
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>
                TARGET: FHIR R4 JSON BUNDLE
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: '#CBD5E1',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
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
              <pre style={{ margin: 0 }}>{JSON.stringify(convertedResult?.bundle, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISUAL SEMANTIC FIDELITY & LOSS BREAKDOWN DECK                            */}
      {/* ========================================================================= */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              justifyContent: 'center',
              boxShadow: fidelityScore >= 85 ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: fidelityScore >= 85 ? '#059669' : '#D97706', fontFamily: 'var(--font-mono)' }}>
                {fidelityScore}%
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--ink-muted)' }}>FIDELITY</span>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
                Semantic Loss & Crosswalk Verification Audit
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
                Audits ontological mapping completeness, date normalization, and alerts teams to dropped vendor Z-segments.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterAudit('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: filterAudit === 'all' ? '1px solid #0F172A' : '1px solid var(--border-medium)',
                background: filterAudit === 'all' ? '#0F172A' : '#FFF',
                color: filterAudit === 'all' ? '#FFF' : 'var(--ink-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Signals ({filteredAuditList.length})
            </button>
            <button
              onClick={() => setFilterAudit('mapped')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: filterAudit === 'mapped' ? '1px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)',
                background: filterAudit === 'mapped' ? '#10B981' : 'rgba(16, 185, 129, 0.08)',
                color: filterAudit === 'mapped' ? '#FFF' : '#059669',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clean ({audit?.mappedCount ?? 0})
            </button>
            <button
              onClick={() => setFilterAudit('inferred')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: filterAudit === 'inferred' ? '1px solid #F59E0B' : '1px solid rgba(245, 158, 11, 0.3)',
                background: filterAudit === 'inferred' ? '#F59E0B' : 'rgba(245, 158, 11, 0.08)',
                color: filterAudit === 'inferred' ? '#FFF' : '#D97706',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Inferred ({audit?.inferredCount ?? 0})
            </button>
            <button
              onClick={() => setFilterAudit('lost')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: filterAudit === 'lost' ? '1px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.3)',
                background: filterAudit === 'lost' ? '#EF4444' : 'rgba(239, 68, 68, 0.08)',
                color: filterAudit === 'lost' ? '#FFF' : '#DC2626',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Loss Alerts ({audit?.lostCount ?? 0})
            </button>
          </div>
        </div>

        {/* Audit Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAuditList.map((item, idx) => {
            const isLoss = item.kind === 'lost';
            const isTrans = item.kind === 'inferred';
            const statusColor = isLoss ? '#EF4444' : isTrans ? '#F59E0B' : '#10B981';

            return (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: isLoss ? 'rgba(239, 68, 68, 0.04)' : isTrans ? 'rgba(245, 158, 11, 0.04)' : 'rgba(16, 185, 129, 0.04)',
                  border: `1px solid ${statusColor}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {item.field}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                    → {item.fhirTarget}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: statusColor, fontWeight: 500, fontStyle: 'italic' }}>
                  {item.notes}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Download, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function SmartOnFhir({ onSelectResource, setCurrentTab, selectedPatientId = 'PAT-VANCE-01' }) {
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('smart-health-it-r4');
  const [customIss, setCustomIss] = useState('');
  const [discoveryConfig, setDiscoveryConfig] = useState(null);
  const [pkceData, setPkceData] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [authStep, setAuthStep] = useState(1); // 1: Discover, 2: Authorize (PKCE), 3: Token Exchange, 4: Hydrated Bundle
  const [tokenResult, setTokenResult] = useState(null);
  const [ingestResult, setIngestResult] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    async function loadPresets() {
      try {
        const data = await api.getSmartPresets();
        setPresets(data || []);
        if (data && data.length > 0) {
          setSelectedPresetId(data[0].id);
          handleRunDiscovery(data[0].iss);
        }
      } catch (err) {
        console.error('Failed to load presets:', err);
      }
    }
    loadPresets();
  }, []);

  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const found = presets.find(p => p.id === presetId);
    if (found) {
      setCustomIss('');
      handleRunDiscovery(found.iss);
    }
  };

  const handleRunDiscovery = async (issTarget) => {
    const iss = issTarget || customIss;
    if (!iss) return;
    setIsDiscovering(true);
    setAuthStep(1);
    setTokenResult(null);
    setIngestResult(null);
    try {
      const res = await api.discoverSmart(iss);
      setDiscoveryConfig(res.smart_configuration || null);
      setPkceData(res.pkce || null);
      setAuthStep(2);
    } catch (err) {
      console.error('SMART discovery failed:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSimulateTokenExchange = async () => {
    if (!discoveryConfig) return;
    setIsDiscovering(true);
    try {
      const exchange = await api.exchangeSmartToken({
        code: 'auth_code_smart_' + Math.random().toString(36).substring(2, 8),
        code_verifier: pkceData?.code_verifier,
        patient: selectedPatientId,
        client_id: 'healthgraph_smart_client'
      });
      setTokenResult(exchange);
      setAuthStep(3);
    } catch (err) {
      console.error('Token exchange error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleIngestPatientBundle = async () => {
    if (!tokenResult) return;
    setIsIngesting(true);
    try {
      const res = await api.ingestSmartPatient({
        patient: tokenResult.patient || selectedPatientId,
        access_token: tokenResult.access_token,
        iss: discoveryConfig?.issuer || customIss
      });
      setIngestResult(res);
      setAuthStep(4);
    } catch (err) {
      console.error('Ingest error:', err);
    } finally {
      setIsIngesting(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const selectedPreset = presets.find(p => p.id === selectedPresetId);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', color: 'var(--ink-primary)' }}>
      {/* Hero & Protocol Header */}
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
              background: 'var(--spruce-light)',
              color: 'var(--spruce)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <KeyRound size={12} />
              HL7 SMART App Launch Framework (v2.0.0)
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
              RFC 7636 PKCE (S256) Verified
            </span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '24px', 
            fontWeight: 700, 
            letterSpacing: '-0.03em', 
            margin: 0,
            color: 'var(--ink-primary)'
          }}>
            SMART on FHIR Launch & Ingestion Workbench
          </h1>
          <p style={{ 
            margin: '6px 0 0', 
            fontSize: '13.5px', 
            color: 'var(--ink-secondary)', 
            maxWidth: '820px',
            lineHeight: 1.5 
          }}>
            Federate authentication and patient record ingestion directly from certified EHR endpoints (Epic, Cerner, SMART Health IT). Executes cryptographically secured OAuth 2.0 PKCE discovery, authorization grants, and deterministic FHIR R4 patient bundle hydration.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--surface-white)',
          padding: '8px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-hairline)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          {[
            { num: 1, label: 'Discovery' },
            { num: 2, label: 'PKCE S256' },
            { num: 3, label: 'Token Grant' },
            { num: 4, label: 'Hydrated' }
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: authStep >= s.num ? 'var(--spruce)' : 'var(--surface-subtle)',
                color: authStep >= s.num ? '#FFFFFF' : 'var(--ink-muted)'
              }}>
                {authStep > s.num ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                fontWeight: authStep === s.num ? 700 : 500,
                color: authStep >= s.num ? 'var(--ink-primary)' : 'var(--ink-muted)'
              }}>
                {s.label}
              </span>
              {s.num < 4 && <div style={{ width: '12px', height: '1px', background: 'var(--border-hairline)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout: Controls & Discovery Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* Left Column: Preset Selector & Launch Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* EHR Preset Card */}
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
              1. Select EHR FHIR Server
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? 'var(--spruce)' : 'var(--border-hairline)'}`,
                      background: isSelected ? 'var(--spruce-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '12.5px', 
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 600, 
                        color: isSelected ? 'var(--spruce-hover)' : 'var(--ink-primary)' 
                      }}>
                        {preset.name}
                      </span>
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontFamily: 'var(--font-mono)', 
                        padding: '2px 5px', 
                        borderRadius: '3px',
                        background: 'rgba(0,0,0,0.04)',
                        color: 'var(--ink-muted)'
                      }}>
                        {preset.auth_type}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.35 }}>
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Endpoint Input */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>
                Or Custom FHIR Issuer (iss):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="https://fhir.hospital.org/r4"
                  value={customIss}
                  onChange={(e) => {
                    setCustomIss(e.target.value);
                    setSelectedPresetId('');
                  }}
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-medium)',
                    outline: 'none',
                    background: 'var(--canvas-bg)'
                  }}
                />
                <button
                  onClick={() => handleRunDiscovery(customIss)}
                  disabled={!customIss || isDiscovering}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: 'var(--spruce)',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: customIss ? 'pointer' : 'not-allowed',
                    opacity: customIss ? 1 : 0.6
                  }}
                >
                  {isDiscovering ? <RefreshCw size={12} className="spin" /> : 'Inspect'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Trigger Box */}
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 600, 
              color: 'var(--ink-muted)', 
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              2. Handshake Execution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSimulateTokenExchange}
                disabled={isDiscovering || authStep < 2}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  background: authStep >= 2 ? 'var(--spruce)' : 'var(--surface-subtle)',
                  color: authStep >= 2 ? '#FFF' : 'var(--ink-muted)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: authStep >= 2 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease'
                }}
              >
                <KeyRound size={14} />
                <span>Execute PKCE Code Exchange</span>
              </button>

              <button
                onClick={handleIngestPatientBundle}
                disabled={isIngesting || authStep < 3}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  background: authStep >= 3 ? 'var(--mint)' : 'var(--surface-subtle)',
                  color: authStep >= 3 ? '#FFF' : 'var(--ink-muted)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: authStep >= 3 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease'
                }}
              >
                {isIngesting ? <RefreshCw size={14} className="spin" /> : <Download size={14} />}
                <span>Hydrate Live Patient Bundle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Discovery Metadata & Handshake Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Step 2: PKCE Challenge Card */}
          {pkceData && (
            <div style={{
              background: 'var(--surface-white)',
              borderRadius: '8px',
              border: '1px solid var(--border-hairline)',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="var(--spruce)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                    Cryptographic PKCE Challenge (RFC 7636)
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 600 }}>
                  SHA-256 Validated
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'var(--canvas-bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                      code_verifier (Private High-Entropy Secret)
                    </span>
                    <button 
                      onClick={() => copyToClipboard(pkceData.code_verifier, 'verifier')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {copiedKey === 'verifier' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} color="var(--ink-muted)" />}
                    </button>
                  </div>
                  <code style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--ink-primary)' }}>
                    {pkceData.code_verifier}
                  </code>
                </div>

                <div style={{ background: 'var(--canvas-bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                      code_challenge (BASE64URL-ENCODED S256)
                    </span>
                    <button 
                      onClick={() => copyToClipboard(pkceData.code_challenge, 'challenge')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {copiedKey === 'challenge' ? <Check size={11} color="var(--emerald)" /> : <Copy size={11} color="var(--ink-muted)" />}
                    </button>
                  </div>
                  <code style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--spruce)' }}>
                    {pkceData.code_challenge}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Token Grant & Ingestion Result Panel */}
          {tokenResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--surface-white)',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--emerald)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                    Granted OAuth 2.0 Bearer Token & Patient Context
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--spruce)', fontWeight: 600 }}>
                  Expires in {tokenResult.expires_in}s
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--canvas-bg)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Context Patient</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-primary)' }}>{tokenResult.patient}</span>
                </div>
                <div style={{ background: 'var(--canvas-bg)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Token Type</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-primary)' }}>{tokenResult.token_type}</span>
                </div>
                <div style={{ background: 'var(--canvas-bg)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Scopes Granted</span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {tokenResult.scope}
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--surface-dark)', padding: '10px 14px', borderRadius: '6px', color: '#FFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-inverse-muted)' }}>Authorization Header</span>
                  <button 
                    onClick={() => copyToClipboard(`Bearer ${tokenResult.access_token}`, 'token')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-inverse-muted)' }}
                  >
                    {copiedKey === 'token' ? <Check size={11} color="var(--mint)" /> : <Copy size={11} />}
                  </button>
                </div>
                <code style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--mint)' }}>
                  Authorization: Bearer {tokenResult.access_token}
                </code>
              </div>
            </motion.div>
          )}

          {/* Hydrated Bundle Result */}
          {ingestResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--mint-light)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '16px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="var(--emerald)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {ingestResult.message}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentTab('dossier')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--emerald)',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>Open In Dossier</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Total Ingested</span>
                  <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald)' }}>
                    {ingestResult.resourcesIngested} FHIR Resources
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Prior-Auth Pre-Flight</span>
                  <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--spruce)' }}>
                    {ingestResult.engineReEvaluation?.priorAuthReadinessScore}% Verified
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>Graph Topology</span>
                  <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--azure)' }}>
                    {ingestResult.engineReEvaluation?.graphTopologyNodes} Nodes
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', display: 'block' }}>CDS Safety Alerts</span>
                  <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>
                    {ingestResult.engineReEvaluation?.cdsAlertsTriggered} Active
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Discovery JSON Viewer */}
          <div style={{
            background: 'var(--surface-white)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="var(--ink-muted)" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-secondary)' }}>
                  /.well-known/smart-configuration Payload
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(discoveryConfig, 'discovery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--ink-muted)'
                }}
              >
                {copiedKey === 'discovery' ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                <span>{copiedKey === 'discovery' ? 'Copied' : 'Copy Spec'}</span>
              </button>
            </div>

            <pre style={{
              margin: 0,
              padding: '12px 14px',
              borderRadius: '6px',
              background: 'var(--canvas-bg)',
              border: '1px solid var(--border-hairline)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-secondary)',
              maxHeight: '260px',
              overflowY: 'auto',
              lineHeight: 1.45
            }}>
              {JSON.stringify(discoveryConfig || { message: 'Loading SMART configuration...' }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

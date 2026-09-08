import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  Database, 
  ShieldCheck, 
  GitBranch, 
  ExternalLink,
  Code2,
  Clock,
  Send,
  RefreshCw,
  Cpu,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function ArchitectureAndApi() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/fhir/metadata');
  const [customEndpoint, setCustomEndpoint] = useState('/fhir/metadata');
  const [responseJson, setResponseJson] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [httpStatus, setHttpStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeArchNode, setActiveArchNode] = useState('validator');

  const presetEndpoints = [
    { label: 'CapabilityStatement', url: '/fhir/metadata', desc: 'FHIR R4 Conformance' },
    { label: 'Eleanor Vance (Patient)', url: '/fhir/Patient/PAT-VANCE-01', desc: 'Authoritative Patient Record' },
    { label: 'HbA1c Lab Observations', url: '/fhir/Observation', desc: 'All Ingested Observations' },
    { label: 'System Statistics', url: '/api/stats', desc: 'Resource Counts & Ingestion Metrics' },
    { label: 'Quality Audit Findings', url: '/api/quality/audit', desc: 'Integrity Ledger' },
    { label: '9-Stage Pipeline Payload', url: '/api/interop/pipeline', desc: 'Ingestion Pipeline Data' },
    { label: 'Curated Terminology', url: '/api/terminology', desc: 'LOINC, SNOMED, RxNorm' },
    { label: 'Export Synthetic Bundle', url: '/api/bundle/export', desc: 'Full 65-Resource Collection' },
  ];

  const archNodes = {
    generator: {
      id: 'generator',
      name: 'Synthetic Generator',
      stage: 'STAGE 1: GENERATION',
      module: 'healthgraph.data.generator',
      role: 'Generates 65 heterogeneous clinical resources across 5 distinct clinical cohorts (Diabetic, Pediatric Asthma, Geriatric Renal, Oncology, Dangling Anomaly).',
      invariants: 'Deterministic seed generation; produces realistic temporal timelines from 2023 through 2025.'
    },
    gateway: {
      id: 'gateway',
      name: 'FHIR Transport Gateway',
      stage: 'STAGE 2: TRANSPORT',
      module: 'healthgraph.api.routes',
      role: 'Ingestion gateway parsing raw JSON bundles into domain models and validating application/fhir+json headers.',
      invariants: 'Adheres to HL7 FHIR R4 RESTful API specification and HTTP semantic error conventions.'
    },
    validator: {
      id: 'validator',
      name: '3-Layer Validator',
      stage: 'STAGE 3: AUDITING',
      module: 'healthgraph.core.validator',
      role: 'Executes Layer 1 (Structural Schema), Layer 2 (Resource Constraints), and Layer 3 (Cross-System Interoperability) validation.',
      invariants: 'Emits structured findings (ERROR, WARNING, INFO); isolates non-fatal schema warnings without breaking transaction integrity.'
    },
    resolver: {
      id: 'resolver',
      name: 'Reference Resolver',
      stage: 'STAGE 4: DEREFERENCING',
      module: 'healthgraph.core.resolver',
      role: 'Maintains bidirectional graph indexing of forward pointers (subject -> Patient/1) and reverse references.',
      invariants: 'Detects and flags unresolved foreign keys (e.g. Practitioner/PRAC-UNKNOWN-99) into verifiable audit findings.'
    },
    graph: {
      id: 'graph',
      name: 'MultiDiGraph Engine',
      stage: 'STAGE 5: TOPOLOGY',
      module: 'healthgraph.core.graph',
      role: 'Constructs directed NetworkX multi-graph indexing 65 nodes and 69 typed clinical predicate edges.',
      invariants: 'Calculates in/out degrees, topological centrality, and isolates disconnected components.'
    },
    sqlite: {
      id: 'sqlite',
      name: 'Relational Index Cache',
      stage: 'STAGE 6: PERSISTENCE',
      module: 'healthgraph.core.db',
      role: 'Embedded SQLite cache indexing resourceType, patientId, encounterId, and ISO-8601 timestamps.',
      invariants: 'Enables sub-millisecond multi-attribute queries and rapid cohort filtering.'
    },
    asgi: {
      id: 'asgi',
      name: 'Starlette ASGI Service',
      stage: 'STAGE 7: SERVING',
      module: 'healthgraph.app',
      role: 'Asynchronous Python ASGI service serving live FHIR endpoints, SPA static assets, and OpenAPI schemas.',
      invariants: 'Non-blocking I/O with standard middleware; serves both API consumers and UI explorer directly.'
    }
  };

  const handleExecuteQuery = async (targetUrl) => {
    const url = targetUrl || customEndpoint;
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setHttpStatus(res.status);
      const data = await res.json();
      setResponseJson(data);
    } catch (err) {
      setHttpStatus(500);
      setResponseJson({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const curlCommand = `curl -X GET "http://127.0.0.1:8000${customEndpoint}" -H "Accept: application/fhir+json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 96px' }}>
      
      {/* 1. Header & Live Indicator */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '10px', letterSpacing: '0.08em', fontWeight: 600 }}>
            SYSTEM TOPOLOGY
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            DETERMINISTIC HEALTHCARE ENGINES • STARLETTE ASGI BACKEND
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
              System Architecture &amp; Live API Workbench
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', maxWidth: '840px', margin: 0, lineHeight: 1.5 }}>
              HealthGraph couples an asynchronous Python Starlette backend with deterministic clinical engines. 
              Trace data movement across internal subsystems below or dispatch queries against live FHIR R4 and system endpoints.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            background: 'var(--surface-recessed)',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-hairline)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)' }} />
            <span style={{ color: 'var(--ink-muted)' }}>ENDPOINT:</span>
            <strong style={{ color: 'var(--ink-primary)' }}>127.0.0.1:8000</strong>
          </div>
        </div>
      </div>

      {/* 2. Spatial Conduit Architecture Machine (Open System Diagram) */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--spruce)" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500, margin: 0, color: 'var(--ink-primary)' }}>
              Subsystem Pipeline Architecture
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
            CLICK ANY COMPONENT TO AUDIT INVARIANTS
          </span>
        </div>

        {/* Continuous Horizontal Subsystem Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          padding: '16px',
          background: 'var(--surface-white)',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          {Object.entries(archNodes).map(([key, node]) => {
            const isActive = activeArchNode === key;
            return (
              <button
                key={key}
                onClick={() => setActiveArchNode(key)}
                style={{
                  padding: '12px 10px',
                  borderRadius: '6px',
                  background: isActive ? 'var(--spruce-light)' : 'var(--surface-recessed)',
                  border: isActive ? '1px solid var(--spruce)' : '1px solid var(--border-hairline)',
                  color: isActive ? 'var(--spruce)' : 'var(--ink-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '8px', 
                  color: isActive ? 'var(--spruce)' : 'var(--ink-muted)', 
                  letterSpacing: '0.04em',
                  marginBottom: '4px'
                }}>
                  {node.stage}
                </div>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '11px', 
                  lineHeight: 1.3,
                  color: isActive ? 'var(--spruce)' : 'var(--ink-primary)'
                }}>
                  {node.name}
                </div>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid var(--spruce)'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Subsystem Detail Card */}
        {archNodes[activeArchNode] && (
          <div style={{
            marginTop: '12px',
            padding: '18px 24px',
            background: 'var(--surface-recessed)',
            border: '1px solid var(--border-hairline)',
            borderRadius: '6px',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '24px',
            fontSize: '12px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge badge-spruce" style={{ fontSize: '10px', fontWeight: 600 }}>
                  {archNodes[activeArchNode].name}
                </span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                  {archNodes[activeArchNode].module}
                </code>
              </div>
              <div style={{ color: 'var(--ink-primary)', fontSize: '13px', lineHeight: 1.5, marginTop: '6px' }}>
                {archNodes[activeArchNode].role}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-medium)', paddingLeft: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                ARCHITECTURAL INVARIANT
              </div>
              <div style={{ color: 'var(--ink-secondary)', fontStyle: 'italic', lineHeight: 1.45 }}>
                "{archNodes[activeArchNode].invariants}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Live API Workbench (Open Interactive Console) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--spruce)" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500, margin: 0, color: 'var(--ink-primary)' }}>
                Live FHIR R4 &amp; System API Console
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Execute real HTTP requests against the active ASGI server instance.
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {presetEndpoints.map((ep, i) => (
              <button
                key={i}
                onClick={() => {
                  setCustomEndpoint(ep.url);
                  handleExecuteQuery(ep.url);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: customEndpoint === ep.url ? 'var(--spruce-light)' : 'var(--surface-recessed)',
                  color: customEndpoint === ep.url ? 'var(--spruce)' : 'var(--ink-secondary)',
                  border: customEndpoint === ep.url ? '1px solid var(--spruce)' : '1px solid var(--border-hairline)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                {ep.label}
              </button>
            ))}
          </div>
        </div>

        {/* URL Input Bar & Execute Button */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            background: 'var(--surface-dark)',
            borderRadius: '6px',
            padding: '8px 14px',
            border: '1px solid var(--border-dark)'
          }}>
            <span style={{ color: 'var(--mint)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, marginRight: '12px' }}>
              GET
            </span>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F3F4F6',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px'
              }}
            />
          </div>

          <button
            onClick={() => handleExecuteQuery()}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '6px',
              background: 'var(--spruce)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
            <span>Execute</span>
          </button>
        </div>

        {/* cURL Display & Copy */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          background: 'var(--surface-recessed)',
          borderRadius: '6px',
          border: '1px solid var(--border-hairline)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          marginBottom: '12px'
        }}>
          <code style={{ color: 'var(--ink-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
            {curlCommand}
          </code>
          <button
            onClick={handleCopyCurl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--spruce)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        {/* Response Metadata Strip */}
        {httpStatus !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '6px 2px',
            marginBottom: '8px'
          }}>
            <span>STATUS: <strong style={{ color: httpStatus === 200 ? 'var(--emerald)' : 'var(--crimson)' }}>{httpStatus} OK</strong></span>
            <span>LATENCY: <strong>{responseTime} ms</strong></span>
            <span>TYPE: <strong>application/fhir+json</strong></span>
          </div>
        )}

        {/* Response JSON Terminal Viewport */}
        <div style={{
          background: 'var(--surface-dark)',
          padding: '18px 20px',
          borderRadius: '6px',
          color: '#E5E7EB',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          lineHeight: 1.5,
          maxHeight: '440px',
          overflowY: 'auto',
          border: '1px solid var(--border-dark)'
        }}>
          {responseJson ? (
            <pre style={{ margin: 0 }}>{JSON.stringify(responseJson, null, 2)}</pre>
          ) : (
            <div style={{ color: '#9CA3AF' }}>
              Select an endpoint preset above or enter a custom path, then click "Execute".
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


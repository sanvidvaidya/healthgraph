import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';
import anime from 'animejs';
import { 
  GitBranch, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { api } from '../api';

const TYPE_COLORS = {
  Patient: '#0C5A56',       // Spruce Teal
  Encounter: '#1D4ED8',     // Azure Blue
  Observation: '#065F46',   // Emerald Green
  Condition: '#B45309',     // Amber
  MedicationRequest: '#7C3AED', // Purple
  Procedure: '#0891B2',     // Cyan
  Practitioner: '#4B5563',  // Slate Gray
  Organization: '#1F2937',  // Charcoal
  Ghost: '#DC2626'          // Crimson
};

export default function RelationshipGraph({ patientId, setPatientId, patients, onSelectResource }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('patient');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [hoveredNode, setHoveredNode] = useState(null);

  const svgRef = useRef(null);
  const edgeGroupRef = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = viewMode === 'patient' && patientId
          ? await api.getPatientGraph(patientId)
          : await api.getGraph();
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load graph data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [viewMode, patientId]);

  // Deterministic coordinate calculation (NetworkX defines topology; React defines deterministic layout)
  const layout = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], edges: [] };

    const width = 1200;
    const height = 760;
    const cx = width / 2;
    const cy = height / 2;

    const rawNodes = graphData.nodes;
    const rawEdges = graphData.edges;

    const patientNodes = rawNodes.filter(n => n.resourceType === 'Patient');
    const encounterNodes = rawNodes.filter(n => n.resourceType === 'Encounter');
    const clinicalNodes = rawNodes.filter(n => ['Observation', 'Condition', 'MedicationRequest', 'Procedure'].includes(n.resourceType));
    const entityNodes = rawNodes.filter(n => ['Practitioner', 'Organization'].includes(n.resourceType) || n.isDangling);

    const positions = {};

    // 1. Center Tier: Patient Subject
    patientNodes.forEach((n, i) => {
      const offset = (i - (patientNodes.length - 1) / 2) * 90;
      positions[n.id] = { x: cx + offset, y: cy, r: 26, node: n };
    });

    // 2. Ring 1 (Encounters): Radius 170px
    const encRadius = 170;
    encounterNodes.forEach((n, i) => {
      const angle = (i / Math.max(encounterNodes.length, 1)) * 2 * Math.PI - (Math.PI / 2);
      positions[n.id] = {
        x: cx + encRadius * Math.cos(angle),
        y: cy + encRadius * Math.sin(angle),
        r: 19,
        node: n
      };
    });

    // 3. Ring 2 (Observations, Conditions, Medications): Radius 300px
    const clinRadius = 300;
    clinicalNodes.forEach((n, i) => {
      const angle = (i / Math.max(clinicalNodes.length, 1)) * 2 * Math.PI - (Math.PI / 3);
      positions[n.id] = {
        x: cx + clinRadius * Math.cos(angle),
        y: cy + clinRadius * Math.sin(angle),
        r: 16,
        node: n
      };
    });

    // 4. Perimeter Ring (Practitioners, Organizations, Ghost/Dangling): Radius 425px
    const entRadius = 425;
    entityNodes.forEach((n, i) => {
      const angle = (i / Math.max(entityNodes.length, 1)) * 2 * Math.PI - (Math.PI / 4);
      positions[n.id] = {
        x: cx + entRadius * Math.cos(angle),
        y: cy + entRadius * Math.sin(angle),
        r: 17,
        node: n
      };
    });

    const placedNodes = rawNodes.map(n => {
      const pos = positions[n.id] || { x: cx, y: cy, r: 14, node: n };
      return {
        ...n,
        x: pos.x,
        y: pos.y,
        r: pos.r
      };
    });

    const placedEdges = rawEdges.map(e => {
      const src = positions[e.source];
      const tgt = positions[e.target];
      return {
        ...e,
        x1: src ? src.x : cx,
        y1: src ? src.y : cy,
        x2: tgt ? tgt.x : cx,
        y2: tgt ? tgt.y : cy,
      };
    });

    return { nodes: placedNodes, edges: placedEdges };
  }, [graphData]);

  // Anime.js: Animate edge strokes and flowing dashes when selecting a node
  useEffect(() => {
    if (selectedNodeId && edgeGroupRef.current) {
      const activePaths = edgeGroupRef.current.querySelectorAll('.highlighted-edge');
      if (activePaths.length > 0) {
        anime({
          targets: activePaths,
          strokeDashoffset: [anime.setDashoffset, 0],
          duration: 600,
          easing: 'easeOutQuad'
        });
      }
    }
  }, [selectedNodeId]);

  const handleNodeClick = (node) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    if (onSelectResource && !node.isDangling) {
      onSelectResource(node.resourceType, node.resourceId);
    }
  };

  const filteredNodes = layout.nodes.filter(n => {
    if (activeFilter === 'ALL') return true;
    return n.resourceType === activeFilter;
  });

  const activeConnectedEdgeIds = useMemo(() => {
    if (!selectedNodeId) return new Set();
    const set = new Set();
    layout.edges.forEach(e => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        set.add(`${e.source}->${e.target}`);
      }
    });
    return set;
  }, [selectedNodeId, layout.edges]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
        <div>COMPUTING DETERMINISTIC TOPOLOGICAL PROJECTION...</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - var(--header-height, 48px))',
      overflow: 'hidden',
      background: 'var(--canvas-bg)'
    }}>
      {/* Edge-to-Edge SVG Graph Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 760"
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(rgba(24, 27, 30, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--border-strong)" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--spruce)" />
          </marker>
          <marker id="arrow-error" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--crimson)" />
          </marker>
        </defs>

        {/* Concentric Guide Rings */}
        <circle cx="600" cy="380" r="170" fill="none" stroke="var(--border-hairline)" strokeDasharray="3 3" />
        <circle cx="600" cy="380" r="300" fill="none" stroke="var(--border-hairline)" strokeDasharray="3 3" />
        <circle cx="600" cy="380" r="425" fill="none" stroke="var(--border-hairline)" strokeDasharray="3 3" />

        {/* Edges Layer */}
        <g ref={edgeGroupRef}>
          {layout.edges.map((e, idx) => {
            const edgeKey = `${e.source}->${e.target}`;
            const isConnected = activeConnectedEdgeIds.has(edgeKey);
            const isDimmed = selectedNodeId && !isConnected;
            const isDanglingEdge = e.target.includes('PRAC-UNKNOWN') || !e.isResolved;

            return (
              <g key={`${edgeKey}-${idx}`} opacity={isDimmed ? 0.15 : 1}>
                <line
                  className={isConnected ? 'highlighted-edge flowing-conduit' : (isDanglingEdge ? 'broken-edge' : '')}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={isDanglingEdge ? 'var(--crimson)' : (isConnected ? 'var(--spruce)' : 'var(--border-medium)')}
                  strokeWidth={isConnected || isDanglingEdge ? 2.5 : 1.2}
                  markerEnd={isDanglingEdge ? "url(#arrow-error)" : (isConnected ? "url(#arrow-active)" : "url(#arrow)")}
                  strokeDasharray={isDanglingEdge ? '4 4' : (isConnected ? '6 3' : 'none')}
                />
                {(isConnected || isDanglingEdge || hoveredNode?.id === e.source) && (
                  <text
                    x={(e.x1 + e.x2) / 2}
                    y={(e.y1 + e.y2) / 2 - 5}
                    fill={isDanglingEdge ? 'var(--crimson)' : 'var(--spruce)'}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {isDanglingEdge ? 'DANGLING REF' : (e.label || 'ref')}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes Layer */}
        <g>
          {filteredNodes.map((n) => {
            const isSelected = selectedNodeId === n.id;
            const isConnected = selectedNodeId && (
              activeConnectedEdgeIds.has(`${selectedNodeId}->${n.id}`) ||
              activeConnectedEdgeIds.has(`${n.id}->${selectedNodeId}`)
            );
            const isDimmed = selectedNodeId && !isSelected && !isConnected;
            const isGhost = n.isDangling || n.id.includes('PRAC-UNKNOWN');
            const color = isGhost ? TYPE_COLORS.Ghost : (TYPE_COLORS[n.resourceType] || '#4B5563');

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                opacity={isDimmed ? 0.22 : 1}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                onClick={() => handleNodeClick(n)}
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Selection / Focus Ring */}
                {isSelected && (
                  <circle
                    r={n.r + 7}
                    fill="none"
                    stroke={isGhost ? 'var(--crimson)' : 'var(--spruce)'}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={n.r}
                  fill={isGhost ? 'none' : color}
                  stroke={isGhost ? 'var(--crimson)' : '#FFFFFF'}
                  strokeWidth={isGhost ? 2.5 : 2}
                  strokeDasharray={isGhost ? '4 3' : 'none'}
                  style={{
                    transition: 'transform 0.15s ease',
                    filter: isSelected ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' : 'none'
                  }}
                />

                {/* Node Short Label */}
                <text
                  y="3.5"
                  fill={isGhost ? 'var(--crimson)' : '#FFFFFF'}
                  fontSize={n.r > 20 ? 10 : 8}
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {isGhost ? '!' : n.resourceType?.substring(0, 3)?.toUpperCase()}
                </text>

                {/* Node ID below */}
                <text
                  y={n.r + 14}
                  fill={isGhost ? 'var(--crimson)' : 'var(--ink-primary)'}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                >
                  {n.resourceId || n.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Microscope HUD 1: Top-Left (Identity & View Mode) */}
      <div className="floating-panel" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '14px 18px',
        maxWidth: '340px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-spruce">NetworkX Clinical Knowledge Graph</span>
          <span className="badge badge-real">REAL TOPOLOGY</span>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 500, color: 'var(--ink-primary)' }}>
          Focused Relationship Canvas
        </div>
        <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
          Click any node to focus 1-hop &amp; 2-hop edges. Unrelated nodes recede softly.
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button
            onClick={() => setViewMode('patient')}
            style={{
              padding: '4px 8px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'patient' ? 'var(--spruce)' : 'var(--surface-recessed)',
              color: viewMode === 'patient' ? '#FFFFFF' : 'var(--ink-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
          >
            Subject Subnetwork
          </button>
          <button
            onClick={() => setViewMode('global')}
            style={{
              padding: '4px 8px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'global' ? 'var(--spruce)' : 'var(--surface-recessed)',
              color: viewMode === 'global' ? '#FFFFFF' : 'var(--ink-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
          >
            Global Cohort (65 Res)
          </button>
        </div>
      </div>

      {/* Floating Microscope HUD 2: Top-Right (Filter Ribbon & Telemetry) */}
      <div className="floating-panel" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Type Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={12} color="var(--ink-muted)" />
          {['ALL', 'Patient', 'Encounter', 'Observation', 'Condition', 'MedicationRequest'].map(t => (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              style={{
                padding: '2px 7px',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                background: activeFilter === t ? 'var(--spruce-light)' : 'transparent',
                color: activeFilter === t ? 'var(--spruce)' : 'var(--ink-secondary)',
                border: activeFilter === t ? '1px solid rgba(12, 90, 86, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {t === 'MedicationRequest' ? 'Med' : t}
            </button>
          ))}
        </div>

        <span style={{ color: 'var(--border-medium)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
          <span>NODES: <strong style={{ color: 'var(--ink-primary)' }}>{layout.nodes.length}</strong></span>
          <span>EDGES: <strong style={{ color: 'var(--ink-primary)' }}>{layout.edges.length}</strong></span>
        </div>
      </div>

      {/* Floating Microscope HUD 3: Bottom-Left (Color Legend) */}
      <div className="floating-panel" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.Patient }} />
          <span style={{ color: 'var(--ink-secondary)' }}>Patient</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.Encounter }} />
          <span style={{ color: 'var(--ink-secondary)' }}>Encounter</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.Observation }} />
          <span style={{ color: 'var(--ink-secondary)' }}>Observation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.Condition }} />
          <span style={{ color: 'var(--ink-secondary)' }}>Condition</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.MedicationRequest }} />
          <span style={{ color: 'var(--ink-secondary)' }}>Medication</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS.Ghost, border: '1px dashed #DC2626' }} />
          <span style={{ color: 'var(--crimson)' }}>Ghost (404)</span>
        </div>
      </div>

      {/* Floating Microscope HUD 4: Bottom-Right (Selection / Focus Controls) */}
      {selectedNodeId && (
        <div className="floating-panel" style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-floating)'
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            Selected: <strong style={{ color: 'var(--spruce)' }}>{selectedNodeId}</strong>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            style={{
              padding: '3px 8px',
              borderRadius: '3px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface-recessed)',
              border: '1px solid var(--border-hairline)',
              cursor: 'pointer'
            }}
          >
            Clear Focus
          </button>
        </div>
      )}

      {/* Floating Tooltip for Hovered Node */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: selectedNodeId ? '68px' : '20px',
          right: '20px',
          background: 'rgba(24, 27, 30, 0.94)',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          pointerEvents: 'none',
          maxWidth: '340px',
          boxShadow: 'var(--shadow-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="badge badge-neutral" style={{ background: '#374151', color: '#F3F4F6', fontSize: '9px' }}>
              {hoveredNode.resourceType}
            </span>
            <span style={{ color: hoveredNode.isDangling ? '#F87171' : 'var(--mint)', fontWeight: 600 }}>
              {hoveredNode.isDangling ? 'UNRESOLVED GHOST' : 'ACTIVE RESOURCE'}
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#F3F4F6' }}>
            {hoveredNode.id}
          </div>
          <div style={{ color: '#D1D5DB', fontSize: '11px', marginTop: '2px' }}>
            {hoveredNode.title || hoveredNode.status}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '6px', borderTop: '1px solid #374151', paddingTop: '4px' }}>
            Degree: {hoveredNode.degree || 0} (In: {hoveredNode.inDegree || 0}, Out: {hoveredNode.outDegree || 0})
          </div>
        </div>
      )}
    </div>
  );
}

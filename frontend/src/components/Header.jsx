import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity,
  Upload, 
  GitBranch, 
  UserCheck, 
  Layers, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Terminal,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  selectedPatientId, 
  setSelectedPatientId, 
  patients, 
  stats,
  onSelectResource,
  userPerspective,
  setUserPerspective,
  onOpenUploader,
  onOpenCommandPalette
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.search(val);
      setSearchResults(res.results || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const navItems = [
    { id: 'narrative', label: 'Stream', icon: Activity, desc: 'Interactive Information Flow' },
    { id: 'pipeline', label: 'Interop Lab', icon: Layers, desc: '9-Stage Ingestion Pipeline' },
    { id: 'dossier', label: 'Patient Dossier', icon: UserCheck, desc: 'Longitudinal Clinical Timeline' },
    { id: 'graph', label: 'Relationship Graph', icon: GitBranch, desc: 'Interactive Resource Network' },
    { id: 'quality', label: 'Quality Ledger', icon: AlertTriangle, desc: 'Referential Integrity Audit' },
    { id: 'terminology', label: 'Terminology Map', icon: BookOpen, desc: 'LOINC and SNOMED Mappings' },
    { id: 'api', label: 'Architecture & API', icon: Terminal, desc: 'System Design and Endpoints' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: 'var(--header-height, 48px)',
      background: 'rgba(248, 250, 252, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-hairline)',
      boxShadow: '0 1px 2px rgba(21, 24, 27, 0.03)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      gap: '16px'
    }}>
      {/* Brand & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '210px' }}>
        <button 
          onClick={() => setCurrentTab('narrative')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'var(--spruce)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.02em'
          }}>
            HG
          </div>
          <span style={{ 
            fontFamily: 'var(--font-sans)', 
            fontWeight: 700, 
            fontSize: '14px', 
            letterSpacing: '-0.02em',
            color: 'var(--ink-primary)'
          }}>
            HealthGraph
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live ECG Cardiac Waveform */}
          <svg width="34" height="14" viewBox="0 0 34 14" style={{ overflow: 'visible' }} aria-hidden="true">
            <path
              d="M 0 7 L 8 7 L 11 2 L 14 12 L 17 4 L 19 9 L 23 7 L 34 7"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ecg-trace-live"
            />
          </svg>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '10px', 
            color: 'var(--ink-muted)',
            letterSpacing: '0.04em',
            fontWeight: 600
          }}>
            FHIR R4
          </span>
        </div>
      </div>

      {/* Navigation Tabs - Clean Hairline Pill Instrument */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--spruce)' : 'var(--ink-secondary)',
                background: isActive ? 'var(--spruce-light)' : 'transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              title={item.desc}
            >
              <Icon size={13} color={isActive ? 'var(--spruce)' : 'var(--ink-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Perspective + Import + Subject + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Role Perspective Lens */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          background: 'rgba(0,0,0,0.03)', 
          padding: '2px 6px', 
          borderRadius: '4px',
          border: '1px solid var(--border-hairline)'
        }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>Role:</span>
          <select
            value={userPerspective || 'clinician'}
            onChange={(e) => setUserPerspective && setUserPerspective(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              color: 'var(--spruce)',
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Switch between Clinician, Patient, and Informatics perspectives"
          >
            <option value="clinician">Clinician View</option>
            <option value="patient">Patient View</option>
            <option value="informatics">Informatics View</option>
          </select>
        </div>

        {/* Import Record Modal Trigger */}
        <button
          onClick={onOpenUploader}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            color: 'var(--ink-primary)',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Import custom FHIR records or select clinical presets"
        >
          <Upload size={12} color="var(--spruce)" />
          <span>Import</span>
        </button>
        {/* Patient Quick Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            fontSize: '10px', 
            fontFamily: 'var(--font-mono)', 
            color: 'var(--ink-muted)',
            textTransform: 'uppercase'
          }}>
            Subj:
          </span>
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '3px 6px',
              borderRadius: '4px',
              background: 'var(--surface-white)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--ink-primary)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>

        {/* Clinician Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            borderRadius: '4px',
            background: 'var(--surface-white)',
            border: '1px solid var(--border-medium)',
            fontSize: '11.5px',
            color: 'var(--ink-secondary)',
            cursor: 'pointer',
            transition: 'all var(--duration-ui) var(--ease-out)'
          }}
          title="Open Clinician Command Palette (Ctrl+K or Cmd+K)"
        >
          <Search size={12} color="var(--spruce)" />
          <span style={{ color: 'var(--ink-muted)' }}>Search...</span>
          <kbd style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            background: 'var(--surface-recessed)',
            border: '1px solid var(--border-hairline)',
            borderRadius: '3px',
            padding: '1px 5px',
            color: 'var(--ink-secondary)'
          }}>
            ⌘K
          </kbd>
        </button>

        {/* Telemetry Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 7px',
          background: 'var(--surface-subtle)',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--ink-secondary)'
        }}>
          <span>{stats?.totalResources || 65} res</span>
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>98.0% ref</span>
        </div>
      </div>
    </header>
  );
}


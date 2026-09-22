import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Layers, 
  Activity, 
  GitBranch, 
  ShieldAlert, 
  BookOpen, 
  Terminal, 
  UploadCloud, 
  CornerDownLeft, 
  X, 
  ArrowRight,
  Sparkles,
  Stethoscope,
  Heart,
  FlaskConical,
  Pill,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  setCurrentTab,
  setSelectedPatientId,
  patients = [],
  onOpenUploader,
  userPerspective,
  setUserPerspective,
  onSelectResource
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut listener (Cmd+K, Ctrl+K, Escape, /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else openPalette();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const openPalette = () => {
    // Handled in parent
  };

  // Build searchable items
  const items = [
    // Patients
    ...patients.map(p => ({
      category: 'Patient Records',
      id: `patient-${p.id}`,
      title: p.name,
      subtitle: `Patient ID: ${p.id} • ${p.gender || 'Verified Subject'}`,
      icon: User,
      action: () => {
        setSelectedPatientId(p.id);
        setCurrentTab('dossier');
        onClose();
      }
    })),

    // Clinical Workspaces
    {
      category: 'Clinical Workspaces',
      id: 'tool-pipeline',
      title: 'Interoperability Lab',
      subtitle: '9-stage ingestion, schema validation, and transfer readiness pipeline',
      icon: Layers,
      action: () => {
        setCurrentTab('pipeline');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-dossier',
      title: 'Longitudinal Patient Dossier',
      subtitle: 'Chronological event stream, self-drawing biomarker sparklines, and clinical decision support',
      icon: Activity,
      action: () => {
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-prior-auth',
      title: 'Da Vinci Prior-Auth & DTR Pre-Flight (CMS-0057-F)',
      subtitle: 'Automated clinical documentation checklist & financial denial avoidance',
      icon: ShieldCheck,
      action: () => {
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-hcc-recapture',
      title: 'HCC Risk Adjustment & HEDIS Care Gap Sentinel',
      subtitle: 'V28 Risk Adjustment Factor (RAF) calculation, recapture surveillance, and quality gaps',
      icon: TrendingUp,
      action: () => {
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-med-rec',
      title: 'Medication Reconciliation & PDC Adherence Tracker',
      subtitle: 'Longitudinal Proportion of Days Covered (PDC), CMS Star Ratings, and polypharmacy checks',
      icon: Pill,
      action: () => {
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-trials-screener',
      title: 'Clinical Trial Protocol Feasibility & Cohort Screener',
      subtitle: 'Automated cohort screening against trial Inclusion/Exclusion (I/E) criteria',
      icon: FlaskConical,
      action: () => {
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-chaos-suite',
      title: 'Healthcare Chaos Engineering Test Suite',
      subtitle: 'Inject MPI mismatches, temporal inversions, dangling provenance, and unit faults',
      icon: Zap,
      action: () => {
        setCurrentTab('pipeline');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-graph',
      title: 'Relational Knowledge Graph',
      subtitle: 'Interactive NetworkX topological graph of patients, encounters, and diagnoses',
      icon: GitBranch,
      action: () => {
        setCurrentTab('graph');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-quality',
      title: 'Conformance & Data Quality Ledger',
      subtitle: 'Multidimensional referential integrity checks and anomaly detection audit',
      icon: ShieldAlert,
      action: () => {
        setCurrentTab('quality');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-terminology',
      title: 'Curated Terminology Explorer',
      subtitle: 'LOINC, SNOMED CT, ICD-10-CM, and RxNorm crosswalk mappings',
      icon: BookOpen,
      action: () => {
        setCurrentTab('terminology');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-api',
      title: 'FHIR R4 REST API Sandbox',
      subtitle: 'CapabilityStatement metadata, searchset bundles, and live cURL snippets',
      icon: Terminal,
      action: () => {
        setCurrentTab('api');
        onClose();
      }
    },
    {
      category: 'Clinical Workspaces',
      id: 'tool-uploader',
      title: 'Synthetic Bundle Ingestion Engine',
      subtitle: 'Import custom FHIR bundles or single resources into the live graph',
      icon: UploadCloud,
      action: () => {
        onOpenUploader();
        onClose();
      }
    },

    // Clinical Concepts
    {
      category: 'Clinical Terminology Lookups',
      id: 'concept-glucose',
      title: 'Fasting Blood Glucose (LOINC 1558-6)',
      subtitle: 'Diagnostic laboratory marker for glycemic surveillance',
      icon: Sparkles,
      action: () => {
        setCurrentTab('terminology');
        onClose();
      }
    },
    {
      category: 'Clinical Terminology Lookups',
      id: 'concept-a1c',
      title: 'Hemoglobin A1c (LOINC 4548-4)',
      subtitle: 'Longitudinal marker for 90-day glycemic control evaluation',
      icon: Sparkles,
      action: () => {
        setCurrentTab('terminology');
        onClose();
      }
    },
    {
      category: 'Clinical Terminology Lookups',
      id: 'concept-egfr',
      title: 'Glomerular Filtration Rate eGFR (LOINC 33914-3)',
      subtitle: 'Renal function marker critical for Metformin contraindication checks',
      icon: Sparkles,
      action: () => {
        setCurrentTab('terminology');
        onClose();
      }
    },
    {
      category: 'Clinical Terminology Lookups',
      id: 'concept-metformin',
      title: 'Metformin Hydrochloride (RxNorm 860975)',
      subtitle: 'First-line biguanide oral antihyperglycemic medication',
      icon: Sparkles,
      action: () => {
        setCurrentTab('terminology');
        onClose();
      }
    },

    // Quick Actions
    {
      category: 'Perspective & Clinical Actions',
      id: 'action-perspective-patient',
      title: 'Switch to Patient Perspective',
      subtitle: 'Translates clinical parameters into plain English terms and actionable guidance',
      icon: Heart,
      action: () => {
        setUserPerspective('patient');
        setCurrentTab('dossier');
        onClose();
      }
    },
    {
      category: 'Perspective & Clinical Actions',
      id: 'action-perspective-clinician',
      title: 'Switch to Clinician Perspective',
      subtitle: 'Displays standard LOINC codes, SNOMED concepts, and referential validation metrics',
      icon: Stethoscope,
      action: () => {
        setUserPerspective('clinician');
        setCurrentTab('dossier');
        onClose();
      }
    }
  ];

  // Filter items based on query
  const filtered = query.trim() === '' 
    ? items 
    : items.filter(i => {
        const q = query.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) || 
          i.subtitle.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        );
      });

  // Handle arrow navigation
  const handleKeyNav = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 9, 14, 0.78)',
      backdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 'clamp(60px, 12vh, 140px)',
      paddingLeft: '16px',
      paddingRight: '16px'
    }}>
      <div 
        className="modal-surface-enter"
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'rgba(11, 15, 23, 0.95)',
          border: '1px solid rgba(45, 212, 191, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(13, 148, 136, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Search size={18} color="#2DD4BF" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNav}
            placeholder="Search patients, workspaces, LOINC/RxNorm codes, or actions..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              color: '#FFFFFF'
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#94A3B8',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No matches found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid transparent',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#2DD4BF' : '#94A3B8'
                    }}>
                      <Icon size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: isSelected ? '#99F6E4' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '9.5px', 
                      color: isSelected ? '#2DD4BF' : '#64748B',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={13} color="#2DD4BF" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(8, 12, 18, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#64748B',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><strong style={{ color: '#E2E8F0' }}>↑↓</strong> to navigate</span>
            <span><strong style={{ color: '#E2E8F0' }}>↵</strong> to select</span>
            <span><strong style={{ color: '#E2E8F0' }}>esc</strong> to dismiss</span>
          </div>
          <div>
            HL7 FHIR R4 Search Index
          </div>
        </div>
      </div>
    </div>
  );
}

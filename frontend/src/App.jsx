import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import HomeNarrative from './components/HomeNarrative';
import InteropLab from './components/InteropLab';
import PatientDossier from './components/PatientDossier';
import RelationshipGraph from './components/RelationshipGraph';
import QualityLedger from './components/QualityLedger';
import TerminologyMap from './components/TerminologyMap';
import ArchitectureAndApi from './components/ArchitectureAndApi';
import ResourceInspector from './components/ResourceInspector';
import RecordUploader from './components/RecordUploader';
import CommandPalette from './components/CommandPalette';
import { api } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('narrative');
  const [selectedPatientId, setSelectedPatientId] = useState('PAT-VANCE-01');
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [inspector, setInspector] = useState({
    isOpen: false,
    resourceType: '',
    resourceId: ''
  });
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [userPerspective, setUserPerspective] = useState('clinician');

  // Initial data load
  useEffect(() => {
    async function initData() {
      try {
        const [statsData, patientsData] = await Promise.all([
          api.getStats(),
          api.getPatients()
        ]);
        setStats(statsData);
        setPatients(patientsData);
        if (patientsData && patientsData.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patientsData[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial system data:', err);
      }
    }
    initData();
  }, []);

  const handleImportSuccess = async (importedPatientId) => {
    try {
      const [statsData, patientsData] = await Promise.all([
        api.getStats(),
        api.getPatients()
      ]);
      setStats(statsData);
      setPatients(patientsData);
      if (importedPatientId) {
        setSelectedPatientId(importedPatientId);
        setCurrentTab('dossier');
      }
    } catch (err) {
      console.error('Failed to reload data after import:', err);
    }
  };

  const handleSelectResource = (resourceType, resourceId) => {
    setInspector({
      isOpen: true,
      resourceType,
      resourceId
    });
  };

  const handleCloseInspector = () => {
    setInspector(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--canvas-bg)' }}>
      {/* Sticky Top Header Instrument */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedPatientId={selectedPatientId}
        setSelectedPatientId={setSelectedPatientId}
        patients={patients}
        stats={stats}
        onSelectResource={handleSelectResource}
        userPerspective={userPerspective}
        setUserPerspective={setUserPerspective}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main View Transition Container (Motion) */}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {currentTab === 'narrative' && (
            <motion.div
              key="narrative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomeNarrative
                setCurrentTab={setCurrentTab}
                setSelectedPatientId={setSelectedPatientId}
                onSelectResource={handleSelectResource}
                stats={stats}
              />
            </motion.div>
          )}

          {currentTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <InteropLab onSelectResource={handleSelectResource} />
            </motion.div>
          )}

          {currentTab === 'dossier' && (
            <motion.div
              key="dossier"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PatientDossier
                patientId={selectedPatientId}
                setPatientId={setSelectedPatientId}
                patients={patients}
                onSelectResource={handleSelectResource}
                setCurrentTab={setCurrentTab}
                userPerspective={userPerspective}
              />
            </motion.div>
          )}

          {currentTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <RelationshipGraph
                patientId={selectedPatientId}
                setPatientId={setSelectedPatientId}
                patients={patients}
                onSelectResource={handleSelectResource}
              />
            </motion.div>
          )}

          {currentTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <QualityLedger onSelectResource={handleSelectResource} />
            </motion.div>
          )}

          {currentTab === 'terminology' && (
            <motion.div
              key="terminology"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TerminologyMap onSelectResource={handleSelectResource} />
            </motion.div>
          )}

          {currentTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ArchitectureAndApi />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Technical Resource Inspection Surface Drawer (Motion) */}
      <ResourceInspector
        resourceType={inspector.resourceType}
        resourceId={inspector.resourceId}
        isOpen={inspector.isOpen}
        onClose={handleCloseInspector}
        onSelectResource={handleSelectResource}
      />

      {/* Synthetic Record Uploader Modal */}
      <RecordUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Global Clinician Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setCurrentTab={setCurrentTab}
        setSelectedPatientId={setSelectedPatientId}
        patients={patients}
        onOpenUploader={() => setIsUploaderOpen(true)}
        userPerspective={userPerspective}
        setUserPerspective={setUserPerspective}
        onSelectResource={handleSelectResource}
      />

      {/* Technical Instrument Footer */}
      <footer style={{
        background: 'var(--surface-recessed)',
        borderTop: '1px solid var(--border-medium)',
        padding: '24px 20px',
        fontSize: '12px',
        color: 'var(--ink-secondary)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}>
              HealthGraph Clinical Informatics Laboratory
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              HL7 FHIR R4 • Educational Subset • Deterministic Python 3 Core • Starlette ASGI
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            <span>65 RESOURCES</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span>5 SYNTHETIC COHORTS</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span style={{ color: 'var(--emerald)' }}>98.0% REFERENTIAL RESOLUTION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

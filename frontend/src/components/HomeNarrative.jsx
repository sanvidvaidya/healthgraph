import React, { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  Layers, 
  GitBranch, 
  Activity, 
  ChevronDown, 
  Sparkles, 
  Terminal,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  RefreshCw,
  X,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: 'monolith', num: '01', title: 'Where is the information?', tag: '01 Location' },
  { id: 'explode', num: '02', title: 'What did we receive?', tag: '02 Structure' },
  { id: 'resolve', num: '03', title: 'What belongs together?', tag: '03 Connections' },
  { id: 'anomaly', num: '04', title: 'What happens when a reference breaks?', tag: '04 Integrity' },
  { id: 'timeline', num: '05', title: 'Can we see the full story?', tag: '05 Timeline' }
];

const FHIR_SAMPLES = {
  patient: {
    resourceType: "Patient",
    id: "PAT-VANCE-01",
    identifier: [{ system: "urn:oid:1.2.840.114350", value: "9482104" }],
    active: true,
    name: [{ use: "official", family: "Vance", given: ["Eleanor"] }],
    gender: "female",
    birthDate: "1968-04-12",
    managingOrganization: { reference: "Organization/ORG-METRO-01", display: "Metropolitan Health" }
  },
  observation: {
    resourceType: "Observation",
    id: "OBS-GLUC-01",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "1558-6", display: "Fasting glucose [Mass/volume] in Serum or Plasma" }] },
    subject: { reference: "Patient/PAT-VANCE-01" },
    valueQuantity: { value: 142, unit: "mg/dL", system: "http://unitsofmeasure.org", code: "mg/dL" }
  },
  encounter: {
    resourceType: "Encounter",
    id: "ENC-2023-01",
    status: "finished",
    class: { code: "AMB", display: "ambulatory" },
    subject: { reference: "Patient/PAT-VANCE-01" },
    period: { start: "2023-03-14T09:30:00Z", end: "2023-03-14T10:15:00Z" }
  },
  medication: {
    resourceType: "MedicationRequest",
    id: "MED-ANOMALY-DANGLING-PRAC",
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "860975", display: "Metformin HCl 500mg Oral Tablet" }]
    },
    subject: { reference: "Patient/PAT-VANCE-01" },
    requester: { reference: "Practitioner/PRAC-UNKNOWN-99", display: "Unresolved Foreign Key" }
  },
  provenance: {
    resourceType: "Provenance",
    id: "PROV-01",
    target: [{ reference: "Patient/PAT-VANCE-01" }],
    activity: { code: "CREATE" },
    agent: [{ who: { reference: "Practitioner/PRAC-CHEN-01" } }]
  }
};

export default function HomeNarrative({ setCurrentTab, setSelectedPatientId, onSelectResource, stats }) {
  // DOM Refs
  const scrollTrackRef = useRef(null);
  const pinnedViewportRef = useRef(null);
  const scene3DRef = useRef(null);
  const plate1Ref = useRef(null);
  const plate2Ref = useRef(null);
  const plate3Ref = useRef(null);
  const plate4Ref = useRef(null);
  const plate5Ref = useRef(null);
  const ch1Ref = useRef(null);
  const ch2Ref = useRef(null);
  const ch3Ref = useRef(null);
  const ch4Ref = useRef(null);
  const ch5Ref = useRef(null);
  const laserConduitsRef = useRef(null);
  const fractureBeamRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressNumRef = useRef(null);

  // Engine Instances
  const lenisRef = useRef(null);
  const quickRotX = useRef(null);
  const quickRotY = useRef(null);
  const activeChapterRef = useRef(0);

  // UI States
  const [activeChapter, setActiveChapter] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState('dossier');
  const [studioMode, setStudioMode] = useState('story'); // 'story' | 'sandbox'
  const [sandboxExplosion, setSandboxExplosion] = useState(180);
  const [sandboxOrbit, setSandboxOrbit] = useState({ rx: 18, ry: -18, rz: 0 });
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [sandboxAnomaly, setSandboxAnomaly] = useState(false);
  const [inspectModal, setInspectModal] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [fps, setFps] = useState(60);

  // Real FPS calculation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId;

    const loop = (now) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // GSAP ScrollTrigger Master Timeline with Lenis
  useEffect(() => {
    if (studioMode !== 'story') return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Mouse tilt setup
    if (scene3DRef.current) {
      quickRotX.current = gsap.quickTo(scene3DRef.current, 'rotationX', { duration: 0.4, ease: 'power2.out' });
      quickRotY.current = gsap.quickTo(scene3DRef.current, 'rotationY', { duration: 0.4, ease: 'power2.out' });
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollTrackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: pinnedViewportRef.current,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${p * 100}%`;
            }
            if (progressNumRef.current) {
              progressNumRef.current.innerText = `${Math.round(p * 100)}%`;
            }

            const ch = p < 0.18 ? 0 : p < 0.42 ? 1 : p < 0.68 ? 2 : p < 0.86 ? 3 : 4;
            if (activeChapterRef.current !== ch) {
              activeChapterRef.current = ch;
              setActiveChapter(ch);
            }
          }
        }
      });

      // =======================================================================
      // CHOREOGRAPHY WITH ZERO COLLISION (SPATIAL SEPARATION)
      // =======================================================================

      // 1. Initial State: Scene starts lowered below hero text
      tl.to(ch1Ref.current, { opacity: 0, y: -60, scale: 0.95, duration: 1.5, ease: 'power1.in' }, 0);
      tl.fromTo(scene3DRef.current, 
        { y: 140, scale: 0.9, x: 0 }, 
        { y: 0, scale: 1, duration: 1.5, ease: 'power1.out' }, 
        0
      );

      // 2. Chapter 2 (1.4 -> 4.2): Deconstruction
      tl.fromTo(ch2Ref.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 1.4);
      tl.to(scene3DRef.current, { x: 220, rotateX: 18, rotateY: -22, rotateZ: 1, duration: 2.0, ease: 'power2.out' }, 1.4);

      // Explode the 5 sleek glass bars along Z & Y with clean vertical separation
      tl.to(plate1Ref.current, { y: -200, z: 100, x: -15, rotateX: 2, duration: 2.2, ease: 'power1.inOut' }, 1.5);
      tl.to(plate2Ref.current, { y: -100, z: 50, x: -30, rotateY: 2, duration: 2.2, ease: 'power1.inOut' }, 1.5);
      tl.to(plate4Ref.current, { y: 100, z: -50, x: 30, rotateY: -2, duration: 2.2, ease: 'power1.inOut' }, 1.5);
      tl.to(plate5Ref.current, { y: 200, z: -100, x: 15, rotateX: -2, duration: 2.2, ease: 'power1.inOut' }, 1.5);

      tl.to(ch2Ref.current, { opacity: 0, x: -40, duration: 0.6, ease: 'power2.in' }, 3.6);

      // 3. Chapter 3 (4.0 -> 6.8): Reference Resolution
      tl.to(scene3DRef.current, { x: -220, rotateX: 16, rotateY: -14, rotateZ: -1, duration: 2.0, ease: 'power2.inOut' }, 3.8);
      tl.fromTo(ch3Ref.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 4.1);
      tl.fromTo(laserConduitsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.2);

      tl.to(ch3Ref.current, { opacity: 0, x: 40, duration: 0.6, ease: 'power2.in' }, 6.2);

      // 4. Chapter 4 (6.6 -> 8.6): Silent Fracture
      tl.to(scene3DRef.current, { x: 220, rotateX: 20, rotateY: -24, rotateZ: 1, duration: 1.8, ease: 'power2.inOut' }, 6.4);
      tl.fromTo(ch4Ref.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 6.6);
      tl.fromTo(fractureBeamRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5 }, 6.8);
      tl.to(plate5Ref.current, { 
        borderColor: '#EF4444', 
        borderLeftColor: '#EF4444', 
        backgroundColor: 'rgba(239, 68, 68, 0.16)', 
        duration: 0.4 
      }, 6.8);

      tl.to(ch4Ref.current, { opacity: 0, x: -40, duration: 0.6, ease: 'power2.in' }, 8.2);

      // 5. Chapter 5 (8.4 -> 10.0): Launchpad
      tl.to(scene3DRef.current, { x: 0, scale: 0.55, opacity: 0.1, y: -60, duration: 1.2, ease: 'power2.inOut' }, 8.3);
      tl.to(laserConduitsRef.current, { opacity: 0, duration: 0.6 }, 8.3);
      tl.to(fractureBeamRef.current, { opacity: 0, duration: 0.6 }, 8.3);
      tl.fromTo(ch5Ref.current, { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out' }, 8.5);

    }, scrollTrackRef);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      ctx.revert();
    };
  }, [studioMode]);

  // Subtle Mouse Parallax
  const handleMouseMove = useCallback((e) => {
    if (studioMode === 'sandbox' || !quickRotX.current || !quickRotY.current) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 12;
    const ny = (e.clientY / window.innerHeight - 0.5) * -10;
    quickRotY.current(-18 + nx);
    quickRotX.current(18 + ny);
  }, [studioMode]);

  const jumpToChapter = (chapterIndex) => {
    if (!scrollTrackRef.current || !lenisRef.current) return;
    const trackHeight = scrollTrackRef.current.offsetHeight - window.innerHeight;
    const targets = [0, 0.28, 0.54, 0.76, 0.98];
    const targetScroll = scrollTrackRef.current.offsetTop + (targets[chapterIndex] * trackHeight);
    lenisRef.current.scrollTo(targetScroll, { duration: 1.2 });
  };

  const toggleAutoPlay = () => {
    if (!lenisRef.current || !scrollTrackRef.current) return;
    if (isAutoPlaying) {
      lenisRef.current.stop();
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      const trackHeight = scrollTrackRef.current.offsetHeight - window.innerHeight;
      lenisRef.current.scrollTo(trackHeight, {
        duration: 16,
        easing: (t) => t,
        onComplete: () => setIsAutoPlaying(false)
      });
    }
  };

  // Sandbox auto-orbit
  useEffect(() => {
    if (studioMode !== 'sandbox' || !autoOrbit) return;
    let animId;
    const loop = () => {
      setSandboxOrbit(prev => ({ ...prev, ry: (prev.ry + 0.6) % 360 }));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [studioMode, autoOrbit]);

  const handleCopyJSON = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div 
      ref={scrollTrackRef} 
      onMouseMove={handleMouseMove}
      style={{ 
        position: 'relative', 
        height: studioMode === 'story' ? '4600px' : '100vh', 
        background: '#07090C',
        overflow: studioMode === 'sandbox' ? 'hidden' : 'visible'
      }}
    >
      {/* Pinned Viewport */}
      <div 
        ref={pinnedViewportRef} 
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 40%, rgba(13, 148, 136, 0.18) 0%, rgba(7, 9, 12, 0.98) 72%)',
          userSelect: 'none'
        }}
      >
        {/* Subtle Spatial Mesh */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        {/* ULTRA-CLEAN FLOATING COMMAND PILL */}
        <div style={{
          position: 'absolute',
          top: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 18, 23, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '4px 10px',
          zIndex: 60,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Mode Switcher */}
          <button
            onClick={() => setStudioMode('story')}
            className={`studio-mode-pill ${studioMode === 'story' ? 'active' : ''}`}
            style={{ padding: '4px 12px', fontSize: '11px', border: 'none' }}
          >
            <Sparkles size={11} />
            <span>Story</span>
          </button>
          <button
            onClick={() => setStudioMode('sandbox')}
            className={`studio-mode-pill ${studioMode === 'sandbox' ? 'active' : ''}`}
            style={{ padding: '4px 12px', fontSize: '11px', border: 'none' }}
          >
            <Sliders size={11} />
            <span>Workbench</span>
          </button>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }}>|</span>

          {/* Telemetry Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#A1A1AA',
            paddingRight: '6px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
              <span>{fps} FPS</span>
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
            <span style={{ color: '#2DD4BF' }}>FHIR R4</span>
          </div>

          {/* Auto Reel Play/Pause */}
          {studioMode === 'story' && (
            <button
              onClick={toggleAutoPlay}
              className="studio-control-btn"
              style={{ padding: '3px 10px', fontSize: '10px', borderRadius: '9999px' }}
              title="Auto-play narrative"
            >
              {isAutoPlaying ? <Pause size={10} color="#2DD4BF" /> : <Play size={10} color="#2DD4BF" />}
              <span>{isAutoPlaying ? 'Pause' : 'Auto Reel'}</span>
            </button>
          )}
        </div>

        {/* WORKBENCH CONTROL BAR (Appears only in Sandbox Mode) */}
        {studioMode === 'sandbox' && (
          <div style={{
            position: 'absolute',
            top: '72px',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(13, 16, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(45, 212, 191, 0.25)',
            borderRadius: '9999px',
            padding: '8px 18px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>SPACING:</span>
              <input 
                type="range" 
                min="0" 
                max="260" 
                value={sandboxExplosion} 
                onChange={(e) => setSandboxExplosion(Number(e.target.value))}
                style={{ width: '90px', accentColor: '#2DD4BF', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2DD4BF', minWidth: '35px' }}>
                {sandboxExplosion}px
              </span>
            </div>

            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>

            <button
              onClick={() => setAutoOrbit(!autoOrbit)}
              className={`studio-control-btn ${autoOrbit ? 'active' : ''}`}
              style={{ borderRadius: '9999px', padding: '4px 10px' }}
            >
              <RefreshCw size={11} className={autoOrbit ? 'spin' : ''} />
              <span>Orbit 360°</span>
            </button>

            <button
              onClick={() => setSandboxAnomaly(!sandboxAnomaly)}
              className="studio-control-btn"
              style={{
                borderRadius: '9999px',
                padding: '4px 10px',
                borderColor: sandboxAnomaly ? '#EF4444' : 'rgba(255,255,255,0.12)',
                background: sandboxAnomaly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                color: sandboxAnomaly ? '#F87171' : '#E4E4E7'
              }}
            >
              <ShieldAlert size={11} color={sandboxAnomaly ? '#EF4444' : '#94A3B8'} />
              <span>{sandboxAnomaly ? '404 Fractured' : 'Inject 404'}</span>
            </button>

            <button
              onClick={() => {
                setSandboxExplosion(180);
                setSandboxOrbit({ rx: 18, ry: -18, rz: 0 });
                setAutoOrbit(false);
                setSandboxAnomaly(false);
              }}
              style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer' }}
              title="Reset"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {/* ====================================================================
            STORY TEXT OVERLAYS (PROGRESSIVE DISCLOSURE & HUMAN QUESTIONS)
            ==================================================================== */}
        {studioMode === 'story' && (
          <>
            {/* CHAPTER 1: CORE : Where is the information? */}
            <div 
              ref={ch1Ref}
              className="gpu-accel"
              style={{
                position: 'absolute',
                top: '16%',
                textAlign: 'center',
                maxWidth: '880px',
                padding: '0 24px',
                zIndex: 30,
                pointerEvents: activeChapter === 0 ? 'auto' : 'none'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#2DD4BF',
                marginBottom: '14px',
                background: 'rgba(45, 212, 191, 0.08)',
                padding: '4px 14px',
                borderRadius: '9999px',
                border: '1px solid rgba(45, 212, 191, 0.25)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2DD4BF', display: 'inline-block' }} />
                <span>01 · ENTERPRISE FHIR DATA QUALITY & OBSERVABILITY</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(28px, 3.8vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                margin: '0 auto 16px auto',
                maxWidth: '820px'
              }}>
                Unifying Fragmented Clinical Records into Actionable Intelligence<br />
                <span className="gradient-text-spruce" style={{ fontSize: 'clamp(17px, 2.1vw, 24px)', fontWeight: 500, display: 'block', marginTop: '10px', lineHeight: 1.35 }}>
                  Pre-flight referential integrity guards, USCDI v3 conformance, and automated Da Vinci prior-authorization readiness.
                </span>
              </h1>

              {/* Enterprise Compliance Strip */}
              <div style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <span style={{
                  padding: '3px 10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#A1A1AA',
                  fontFamily: 'var(--font-mono)'
                }}>
                  CMS-0057-F Ready
                </span>
                <span style={{
                  padding: '3px 10px',
                  background: 'rgba(45, 212, 191, 0.08)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#2DD4BF',
                  fontFamily: 'var(--font-mono)'
                }}>
                  USCDI v3 / v4 Aligned
                </span>
                <span style={{
                  padding: '3px 10px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#38BDF8',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Da Vinci CRD/DTR Prior-Auth
                </span>
                <span style={{
                  padding: '3px 10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#A1A1AA',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Deterministic Pre-Flight Gate
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <span>Scroll down to inspect enterprise pipeline layers</span>
                <ChevronDown size={13} className="bounce" />
              </div>
            </div>

            {/* CHAPTER 2: LAYERS : What did we actually receive? */}
            <div 
              ref={ch2Ref}
              className="gpu-accel"
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(32px, 7vw, 110px)',
                transform: 'translateY(-50%)',
                maxWidth: '360px',
                opacity: 0,
                zIndex: 30,
                pointerEvents: activeChapter === 1 ? 'auto' : 'none'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: '#38BDF8',
                marginBottom: '10px'
              }}>
                02 · WHAT DID WE RECEIVE?
              </div>
              <h2 style={{
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 12px 0'
              }}>
                Incoming records arrive from different source formats.<br />
                <span className="gradient-text-spruce" style={{ fontSize: '16px', fontWeight: 500, display: 'block', marginTop: '8px', lineHeight: 1.4 }}>
                  HealthGraph converts every piece into structured clinical building blocks.
                </span>
              </h2>
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span className="badge badge-neutral" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#E4E4E7', fontSize: '10px' }}>
                  Patient
                </span>
                <span className="badge badge-neutral" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#E4E4E7', fontSize: '10px' }}>
                  Observation
                </span>
                <span className="badge badge-neutral" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#E4E4E7', fontSize: '10px' }}>
                  Encounter
                </span>
                <span className="badge badge-neutral" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#E4E4E7', fontSize: '10px' }}>
                  Medication
                </span>
                <span className="badge badge-neutral" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#E4E4E7', fontSize: '10px' }}>
                  Provenance
                </span>
              </div>
            </div>

            {/* CHAPTER 3: LINKS : What belongs together? */}
            <div 
              ref={ch3Ref}
              className="gpu-accel"
              style={{
                position: 'absolute',
                top: '50%',
                right: 'clamp(32px, 7vw, 110px)',
                transform: 'translateY(-50%)',
                maxWidth: '360px',
                opacity: 0,
                zIndex: 30,
                textAlign: 'left',
                pointerEvents: activeChapter === 2 ? 'auto' : 'none'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: '#2DD4BF',
                marginBottom: '10px'
              }}>
                03 · WHAT BELONGS TOGETHER?
              </div>
              <h2 style={{
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 12px 0'
              }}>
                A lab result needs clinical context to be meaningful.<br />
                <span className="gradient-text-spruce" style={{ fontSize: '16px', fontWeight: 500, display: 'block', marginTop: '8px', lineHeight: 1.4 }}>
                  HealthGraph links each measurement to the patient, the clinical visit, and the prescribed treatment.
                </span>
              </h2>
              <div style={{
                marginTop: '14px',
                padding: '6px 12px',
                background: 'rgba(45, 212, 191, 0.08)',
                border: '1px solid rgba(45, 212, 191, 0.25)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#2DD4BF',
                display: 'inline-block'
              }}>
                ✓ 48 of 49 references resolved
              </div>
            </div>

            {/* CHAPTER 4: ANOMALY : What happens when something breaks? */}
            <div 
              ref={ch4Ref}
              className="gpu-accel"
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(32px, 7vw, 110px)',
                transform: 'translateY(-50%)',
                maxWidth: '360px',
                opacity: 0,
                zIndex: 30,
                pointerEvents: activeChapter === 3 ? 'auto' : 'none'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: '#F87171',
                marginBottom: '10px'
              }}>
                04 · WHAT HAPPENS WHEN A REFERENCE BREAKS?
              </div>
              <h2 style={{
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 12px 0'
              }}>
                A record can have valid syntax while missing its target clinician.<br />
                <span style={{ color: '#F87171', fontSize: '16px', fontWeight: 500, display: 'block', marginTop: '8px', lineHeight: 1.4 }}>
                  This prescription points to a doctor who does not exist in the local registry.
                </span>
              </h2>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.35)',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#FDA4AF',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 600, color: '#FECDD3' }}>MedicationRequest points to missing practitioner PRAC-UNKNOWN-99 (HTTP 404)</div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#FDA4AF', opacity: 0.9 }}>
                  ⚠ Payer Denial Impact: Violates CMS-0057-F provider attribution. Generates automated claim denial and $35+ manual appeal cost.
                </div>
              </div>
            </div>

            {/* CHAPTER 5: DOSSIER : Can we now see the patient's story? */}
            <div 
              ref={ch5Ref}
              className="gpu-accel"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px',
                textAlign: 'center',
                opacity: 0,
                zIndex: 35,
                pointerEvents: activeChapter === 4 ? 'auto' : 'none'
              }}
            >
              <div style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                color: '#2DD4BF',
                marginBottom: '10px',
                background: 'rgba(45, 212, 191, 0.08)',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(45, 212, 191, 0.2)'
              }}>
                05 · CAN WE SEE THE FULL STORY?
              </div>

              <h2 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(26px, 3.4vw, 44px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.2,
                maxWidth: '760px',
                margin: '0 auto 32px auto'
              }}>
                Connected records form a complete clinical picture.<br />
                <span className="gradient-text-spruce" style={{ fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 500, display: 'block', marginTop: '8px', lineHeight: 1.4 }}>
                  Visits, diagnostic measurements, and medications assemble into a single verified patient timeline.
                </span>
              </h2>

{/* Interactive Capability Showcase Dock */}
              <div style={{
                maxWidth: '960px',
                width: '100%',
                background: 'rgba(11, 15, 23, 0.92)',
                border: '1px solid rgba(45, 212, 191, 0.28)',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Capability Selector Tabs */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  background: 'rgba(8, 12, 18, 0.95)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  overflowX: 'auto'
                }}>
                  {[
                    { id: 'dossier', label: 'Longitudinal Dossier', icon: Activity },
                    { id: 'graph', label: 'Knowledge Graph', icon: GitBranch },
                    { id: 'pipeline', label: 'Interop Lab', icon: Layers },
                    { id: 'quality', label: 'Data Quality Ledger', icon: ShieldAlert },
                    { id: 'terminology', label: 'Terminology Maps', icon: BookOpen },
                  ].map((tab) => {
                    const isActive = showcaseTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setShowcaseTab(tab.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isActive ? 'rgba(45, 212, 191, 0.18)' : 'transparent',
                          border: isActive ? '1px solid rgba(45, 212, 191, 0.4)' : '1px solid transparent',
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={13} color={isActive ? '#2DD4BF' : '#94A3B8'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Capability Interactive Preview Body */}
                <div style={{ padding: '22px 24px' }}>
                  {showcaseTab === 'dossier' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '10px' }}>
                            CLINICAL TIMELINE
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
                            PAT-VANCE-01 • 56y Female
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                          Unified Longitudinal Patient Care Timeline
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                          Assembles disparate clinic visits, laboratory observations, diagnoses, and medication orders into an organized chronological narrative with self-drawing biomarker trajectories and real-time clinical decision support.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedPatientId('PAT-VANCE-01');
                            setCurrentTab('dossier');
                          }}
                          className="studio-control-btn active"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <span>Open Patient Dossier</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(9, 14, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}>
                        <div style={{ color: '#2DD4BF', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>BIOMARKER TRAJECTORY</span>
                          <span style={{ color: '#10B981' }}>HbA1c: 9.4% → 7.0%</span>
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Fasting Glucose: 142 mg/dL (Reference: 70-99 mg/dL)
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • eGFR: 57.0 mL/min/1.73m2 (Stage 3a CKD Surveillance)
                        </div>
                        <div style={{ color: '#F59E0B', marginBottom: '4px' }}>
                          • Prescription: Metformin ER 1000 mg Oral Tablet
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                          ✓ CDS Rule Verified: Renal Surveillance Active
                        </div>
                      </div>
                    </div>
                  )}

                  {showcaseTab === 'graph' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#C084FC', fontSize: '10px' }}>
                            GRAPH TOPOLOGY
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
                            NetworkX MultiDiGraph Core
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                          Interactive Clinical Knowledge Graph
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                          Maps every clinical relationship between patient demographics, encounters, laboratory results, conditions, and care providers. Unresolved references render with crimson glowing fracture indicators.
                        </p>
                        <button
                          onClick={() => setCurrentTab('graph')}
                          className="studio-control-btn active"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <span>Explore Knowledge Graph</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(9, 14, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}>
                        <div style={{ color: '#C084FC', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>NETWORK TOPOLOGY METRICS</span>
                          <span style={{ color: '#2DD4BF' }}>65 Nodes</span>
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Relational Edges: 84 Directed Predicates
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Subject Resolution: 100% Core Verification
                        </div>
                        <div style={{ color: '#EF4444', marginBottom: '4px' }}>
                          • Isolated Anomaly: 1 Dangling Practitioner Pointer
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                          Filter by Patient Ego-Network or Explore Global Cohort
                        </div>
                      </div>
                    </div>
                  )}

                  {showcaseTab === 'pipeline' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF', fontSize: '10px' }}>
                            INGESTION PIPELINE
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
                            9 Deterministic Stages
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                          Interoperability Pipeline Inspector
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                          Examine the complete transformation journey from raw source payloads to schema validation, provenance tracking, reference resolution, and final operational transfer readiness.
                        </p>
                        <button
                          onClick={() => setCurrentTab('pipeline')}
                          className="studio-control-btn active"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <span>Launch Interop Lab</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(9, 14, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}>
                        <div style={{ color: '#2DD4BF', fontWeight: 600, marginBottom: '8px' }}>
                          STAGE PIPELINE OVERVIEW
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '3px' }}>
                          1. Source Systems → 2. Raw FHIR Bundle
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '3px' }}>
                          3. Structural Validation → 4. Provenance Attachment
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '3px' }}>
                          5. Reference Resolution → 6. Normalization
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '3px' }}>
                          7. Graph Assembly → 8. Timeline → 9. Transfer Gate
                        </div>
                      </div>
                    </div>
                  )}

                  {showcaseTab === 'quality' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '10px' }}>
                            CONFORMANCE LEDGER
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
                            6 Quality Dimensions
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                          Multidimensional Data Quality Ledger
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                          Replaces opaque scores with measurable conformance dimensions: referential integrity, structural validity, temporal consistency, completeness, and terminology standardization.
                        </p>
                        <button
                          onClick={() => setCurrentTab('quality')}
                          className="studio-control-btn active"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <span>View Conformance Ledger</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(9, 14, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}>
                        <div style={{ color: '#F87171', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>AUDIT SUMMARY</span>
                          <span style={{ color: '#10B981' }}>98.0% Resolved</span>
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Structural Validity: 98.5% Pass Rate
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Temporal Consistency: 98.5% Valid Intervals
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • Terminology Binding: 100% Canonical URIs
                        </div>
                        <div style={{ color: '#EF4444', marginBottom: '4px' }}>
                          • Intentional Anomaly: PRAC-UNKNOWN-99 (HTTP 404)
                        </div>
                      </div>
                    </div>
                  )}

                  {showcaseTab === 'terminology' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '10px' }}>
                            TERMINOLOGY EXPLORER
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
                            LOINC • SNOMED • RxNorm • ICD-10
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                          Curated Clinical Terminology Crosswalks
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                          Inspect authoritative code mappings and learn why local non-standard codes cause semantic interoperability failures across hospitals even when FHIR schemas match.
                        </p>
                        <button
                          onClick={() => setCurrentTab('terminology')}
                          className="studio-control-btn active"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <span>Explore Terminology Maps</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(9, 14, 22, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textAlign: 'left'
                      }}>
                        <div style={{ color: '#10B981', fontWeight: 600, marginBottom: '8px' }}>
                          STANDARD TERMINOLOGY BINDINGS
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • LOINC: 1558-6 (Fasting Glucose), 4548-4 (HbA1c)
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • SNOMED CT: 44054006 (Type 2 Diabetes), 38341003 (HTN)
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • RxNorm: 860975 (Metformin ER), 314076 (Lisinopril)
                        </div>
                        <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                          • ICD-10-CM: E11.9 (Type 2 DM), I10 (Essential HTN)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====================================================================
            THE 3D GLASS MONOLITH (PROGRESSIVE DISCLOSURE MODULES)
            ==================================================================== */}
        <div 
          ref={scene3DRef}
          className="perspective-1200 preserve-3d gpu-accel"
          style={{
            position: 'absolute',
            width: '440px',
            height: '78px',
            top: '50%',
            left: '50%',
            marginTop: '-39px',
            marginLeft: '-220px',
            transform: studioMode === 'sandbox'
              ? `rotateX(${sandboxOrbit.rx}deg) rotateY(${sandboxOrbit.ry}deg) rotateZ(${sandboxOrbit.rz}deg)`
              : 'rotateX(18deg) rotateY(-18deg)',
            pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none',
            zIndex: 20
          }}
        >
          {/* Bio-Bus Laser Conduits (Flank Routing) */}
          <div 
            ref={laserConduitsRef} 
            className="gpu-accel"
            style={{
              position: 'absolute',
              top: '-221px',
              left: '-100px',
              width: '640px',
              height: '520px',
              pointerEvents: 'none',
              zIndex: 25,
              opacity: studioMode === 'sandbox' ? 1 : 0
            }}
          >
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Observation -> Patient (Left Flank Subject Connection) */}
              <path
                d="M 70 160 C 32 145, 42 75, 85 60"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="5 4"
                className="flowing-conduit"
                style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))' }}
              />
              <circle cx="70" cy="160" r="3" fill="#38BDF8" />
              <circle cx="85" cy="60" r="3" fill="#0D9488" />

              {/* Encounter -> Patient (Left Flank Subject Anchor) */}
              <path
                d="M 100 260 C 15 240, 20 75, 85 60"
                fill="none"
                stroke="#0D9488"
                strokeWidth="2"
                strokeDasharray="5 4"
                className="flowing-conduit"
                style={{ filter: 'drop-shadow(0 0 6px rgba(13, 148, 136, 0.8))' }}
              />
              <circle cx="100" cy="260" r="3" fill="#10B981" />

              {/* Medication -> Encounter (Left Flank Context Directive) */}
              <path
                d="M 130 360 C 60 345, 52 280, 100 260"
                fill="none"
                stroke="#C084FC"
                strokeWidth="2"
                strokeDasharray="5 4"
                className="flowing-conduit"
                style={{ filter: 'drop-shadow(0 0 6px rgba(192, 132, 252, 0.8))' }}
              />
              <circle cx="130" cy="360" r="3" fill="#C084FC" />

              {/* Medication -> Practitioner (Right Flank Requester Reference) */}
              {(!sandboxAnomaly || studioMode === 'story') && (
                <>
                  <path
                    d="M 570 360 C 615 375, 610 445, 555 460"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    className="flowing-conduit"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))' }}
                  />
                  <circle cx="570" cy="360" r="3" fill="#C084FC" />
                  <circle cx="555" cy="460" r="3" fill="#10B981" />
                </>
              )}
            </svg>
          </div>

          {/* Fracture Beam (Right Flank Unresolved Reference) */}
          <div 
            ref={fractureBeamRef}
            className="gpu-accel"
            style={{
              position: 'absolute',
              top: '-221px',
              left: '-100px',
              width: '640px',
              height: '520px',
              pointerEvents: 'none',
              zIndex: 26,
              opacity: studioMode === 'sandbox' && sandboxAnomaly ? 1 : 0
            }}
          >
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 570 360 L 600 395 L 590 415 L 618 455"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                className="broken-edge"
                style={{ filter: 'drop-shadow(0 0 8px #EF4444)' }}
              />
              <circle cx="618" cy="455" r="4.5" fill="#EF4444" style={{ filter: 'drop-shadow(0 0 8px #EF4444)' }} />
              <rect x="626" y="444" width="96" height="22" rx="4" fill="rgba(239, 68, 68, 0.18)" stroke="#EF4444" strokeWidth="1" />
              <text x="633" y="459" fill="#FCA5A5" fontSize="9.5" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.06em">
                404 BROKEN
              </text>
            </svg>
          </div>

          {/* PLATE 1: Patient Core */}
          <div 
            ref={plate1Ref}
            onClick={() => setInspectModal({ key: 'patient', title: 'FHIR Patient Resource', data: FHIR_SAMPLES.patient })}
            className="apple-glass-plate gpu-accel"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: studioMode === 'sandbox'
                ? `translate3d(-15px, ${-sandboxExplosion * 1.1}px, ${sandboxExplosion * 0.55}px)`
                : 'translate3d(0, 0, 0)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: '3.5px solid #0D9488',
              background: 'rgba(9, 14, 22, 0.92)',
              backdropFilter: 'blur(24px)',
              borderRadius: '10px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              cursor: studioMode === 'sandbox' ? 'pointer' : 'default',
              pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none'
            }}
          >
            <span className="flank-port port-left" style={{ background: '#0D9488', boxShadow: '0 0 8px #0D9488' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: '#0D9488', letterSpacing: '0.08em' }}>
                PATIENT RESOURCE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748B' }}>
                ID: PAT-VANCE-01 {studioMode === 'sandbox' && '🔍'}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#FFFFFF', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Eleanor Vance • 56y Female
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Primary demographics and longitudinal subject anchor
            </div>
          </div>

          {/* PLATE 2: Diagnostic Observations */}
          <div 
            ref={plate2Ref}
            onClick={() => setInspectModal({ key: 'observation', title: 'FHIR Observation Resource', data: FHIR_SAMPLES.observation })}
            className="apple-glass-plate gpu-accel"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: studioMode === 'sandbox'
                ? `translate3d(-30px, ${-sandboxExplosion * 0.55}px, ${sandboxExplosion * 0.28}px)`
                : 'translate3d(0, 0, 0)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: '3.5px solid #38BDF8',
              background: 'rgba(9, 14, 22, 0.92)',
              backdropFilter: 'blur(24px)',
              borderRadius: '10px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              cursor: studioMode === 'sandbox' ? 'pointer' : 'default',
              pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none'
            }}
          >
            <span className="flank-port port-left" style={{ background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.08em' }}>
                OBSERVATION RESOURCE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748B' }}>
                LOINC 1558-6
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#FFFFFF', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Fasting Glucose: 142 mg/dL &nbsp;<span style={{ color: '#F59E0B' }}>• HbA1c 8.2%</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Diagnostic lab values with verified clinical intervals
            </div>
          </div>

          {/* PLATE 3: Encounter Anchor */}
          <div 
            ref={plate3Ref}
            onClick={() => setInspectModal({ key: 'encounter', title: 'FHIR Encounter Resource', data: FHIR_SAMPLES.encounter })}
            className="apple-glass-plate gpu-accel"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: 'translate3d(0, 0, 0)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderLeft: '3.5px solid #10B981',
              background: 'rgba(12, 17, 26, 0.94)',
              backdropFilter: 'blur(24px)',
              borderRadius: '10px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
              cursor: studioMode === 'sandbox' ? 'pointer' : 'default',
              pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none'
            }}
          >
            <span className="flank-port port-left" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: '#10B981', letterSpacing: '0.08em' }}>
                ENCOUNTER ANCHOR
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748B' }}>
                ENC-2023-01
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#FFFFFF', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Endocrinology Consultation
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Ambulatory visit anchoring observations and orders in time
            </div>
          </div>

          {/* PLATE 4: Medication */}
          <div 
            ref={plate4Ref}
            onClick={() => setInspectModal({ key: 'medication', title: 'FHIR MedicationRequest Resource', data: FHIR_SAMPLES.medication })}
            className="apple-glass-plate gpu-accel"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: studioMode === 'sandbox'
                ? `translate3d(30px, ${sandboxExplosion * 0.55}px, ${-sandboxExplosion * 0.28}px)`
                : 'translate3d(0, 0, 0)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: '3.5px solid #C084FC',
              background: 'rgba(9, 14, 22, 0.92)',
              backdropFilter: 'blur(24px)',
              borderRadius: '10px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              cursor: studioMode === 'sandbox' ? 'pointer' : 'default',
              pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none'
            }}
          >
            <span className="flank-port port-left" style={{ background: '#C084FC', boxShadow: '0 0 8px #C084FC' }} />
            <span className="flank-port port-right" style={{ background: '#C084FC', boxShadow: '0 0 8px #C084FC' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: '#C084FC', letterSpacing: '0.08em' }}>
                MEDICATION REQUEST
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748B' }}>
                RXNORM 860975
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#FFFFFF', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Metformin panel 500mg Oral
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Prescription linked to lab evidence and consultation context
            </div>
          </div>

          {/* PLATE 5: Practitioner / Provenance */}
          <div 
            ref={plate5Ref}
            onClick={() => setInspectModal({ key: 'provenance', title: 'FHIR Provenance & Practitioner', data: FHIR_SAMPLES.provenance })}
            className="apple-glass-plate gpu-accel"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transform: studioMode === 'sandbox'
                ? `translate3d(15px, ${sandboxExplosion * 1.1}px, ${-sandboxExplosion * 0.55}px)`
                : 'translate3d(0, 0, 0)',
              border: (studioMode === 'sandbox' && sandboxAnomaly) ? '1px dashed #EF4444' : '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: (studioMode === 'sandbox' && sandboxAnomaly) ? '3.5px solid #EF4444' : '3.5px solid #64748B',
              background: (studioMode === 'sandbox' && sandboxAnomaly) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(9, 14, 22, 0.92)',
              backdropFilter: 'blur(24px)',
              borderRadius: '10px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              cursor: studioMode === 'sandbox' ? 'pointer' : 'default',
              pointerEvents: studioMode === 'sandbox' ? 'auto' : 'none'
            }}
          >
            <span className="flank-port port-right" style={{ 
              background: (studioMode === 'sandbox' && sandboxAnomaly) ? '#EF4444' : '#10B981', 
              boxShadow: (studioMode === 'sandbox' && sandboxAnomaly) ? '0 0 8px #EF4444' : '0 0 8px #10B981' 
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '9px', 
                fontWeight: 700, 
                color: (studioMode === 'sandbox' && sandboxAnomaly) ? '#EF4444' : '#94A3B8', 
                letterSpacing: '0.08em' 
              }}>
                {(studioMode === 'sandbox' && sandboxAnomaly) ? 'UNRESOLVED REFERENCE' : 'PROVENANCE & PRACTITIONER'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748B' }}>
                {(studioMode === 'sandbox' && sandboxAnomaly) ? 'PRAC-UNKNOWN-99' : 'PRAC-CHEN-01'}
              </span>
            </div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '14px', 
              color: (studioMode === 'sandbox' && sandboxAnomaly) ? '#FCA5A5' : '#FFFFFF',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis'
            }}>
              {(studioMode === 'sandbox' && sandboxAnomaly) ? 'Practitioner/PRAC-UNKNOWN-99' : 'Dr. Marcus Chen, MD (Endocrinology)'}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: (studioMode === 'sandbox' && sandboxAnomaly) ? '#EF4444' : '#94A3B8', 
              marginTop: '2px',
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis'
            }}>
              {(studioMode === 'sandbox' && sandboxAnomaly) 
                ? 'Dangling pointer: Prescribing doctor does not exist in local repository' 
                : 'Attributed care provider with verified institutional credentials'}
            </div>
          </div>
        </div>

        {/* RIGHT-SIDE COMPACT DOTS */}
        {studioMode === 'story' && (
          <div className="apple-vertical-scrubber">
            {CHAPTERS.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => jumpToChapter(idx)}
                className={`apple-dot ${activeChapter === idx ? 'active' : ''}`}
                title={`${ch.num}: ${ch.title}`}
              />
            ))}
          </div>
        )}

        {/* BOTTOM MINIMAL SCRUB DOCK */}
        {studioMode === 'story' && (
          <div className="apple-scrub-track" style={{ padding: '6px 14px', gap: '10px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#2DD4BF',
              fontWeight: 700
            }}>
              {CHAPTERS[activeChapter].num}
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</div>

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#FFFFFF',
              fontWeight: 500,
              minWidth: '150px'
            }}>
              {CHAPTERS[activeChapter].title}
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</div>

            {/* Compact Chapter Jump Pills */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => jumpToChapter(idx)}
                  className={`apple-chapter-pill ${activeChapter === idx ? 'active' : ''}`}
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                >
                  {ch.tag}
                </button>
              ))}
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</div>

            <div 
              ref={progressNumRef}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#71717A', width: '32px', textAlign: 'right' }}
            >
              0%
            </div>

            {/* Hairline Progress Indicator */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '16px',
              right: '16px',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div 
                ref={progressBarRef}
                style={{
                  height: '100%',
                  width: '0%',
                  background: 'linear-gradient(90deg, #2DD4BF, #38BDF8)',
                  transition: 'width 0.04s linear'
                }}
              />
            </div>
          </div>
        )}

        {/* RAW FHIR JSON MODAL (WORKBENCH) */}
        {inspectModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div 
              className="modal-surface-enter"
              style={{
                background: '#0D1117',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '640px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={15} color="#2DD4BF" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                    {inspectModal.title}
                  </span>
                  <span className="badge badge-neutral" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF', fontSize: '9px' }}>
                    JSON
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleCopyJSON(inspectModal.data)}
                    className="studio-control-btn"
                    style={{ padding: '3px 8px', fontSize: '10px' }}
                  >
                    {copiedKey ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => setInspectModal(null)}
                    style={{ background: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{
                padding: '16px 18px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                lineHeight: 1.5,
                color: '#E6EDF3',
                background: '#090D13'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(inspectModal.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

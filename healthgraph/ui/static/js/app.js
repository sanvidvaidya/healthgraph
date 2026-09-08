/**
 * HealthGraph Main Application Controller.
 * Manages view routing, state, API data fetching, and rendering for all 12 views.
 */

(function () {
  "use strict";

  const AppState = {
    currentView: "home",
    selectedPatientId: "PAT-VANCE-01",
    selectedResourceType: null,
    patients: [],
    stats: null,
    graphVisualizer: null,
    pipelineData: null,
    auditData: null
  };

  // -------------------------------------------------------------------------
  // INITIALIZATION & ROUTING
  // -------------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initDrawer();
    loadSystemStats();
    loadPatients();
    handleRoute(window.location.hash.replace("#", "") || "home");
  });

  function initNavigation() {
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = link.getAttribute("data-view");
        window.location.hash = targetView;
        handleRoute(targetView);
      });
    });

    window.addEventListener("hashchange", () => {
      const targetView = window.location.hash.replace("#", "") || "home";
      handleRoute(targetView);
    });
  }

  function handleRoute(viewName) {
    const validViews = [
      "home", "interop", "patients", "resources", "relationships",
      "timeline", "quality", "terminology", "api", "architecture",
      "method", "import_export"
    ];
    const view = validViews.includes(viewName) ? viewName : "home";
    AppState.currentView = view;

    // Update nav link active state
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("data-view") === view) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    // Update view container visibility
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });
    const activeSec = document.getElementById(`view-${view}`);
    if (activeSec) {
      activeSec.classList.add("active");
    }

    // Trigger view-specific data loader
    switch (view) {
      case "home":
        renderHomeView();
        break;
      case "interop":
        renderInteropLabView();
        break;
      case "patients":
        renderPatientsView();
        break;
      case "resources":
        renderResourcesView();
        break;
      case "relationships":
        renderRelationshipsView();
        break;
      case "timeline":
        renderTimelineView();
        break;
      case "quality":
        renderQualityView();
        break;
      case "terminology":
        renderTerminologyView();
        break;
      case "api":
        renderApiView();
        break;
      case "architecture":
        renderArchitectureView();
        break;
      case "method":
        renderMethodView();
        break;
      case "import_export":
        renderImportExportView();
        break;
    }
  }

  // -------------------------------------------------------------------------
  // GLOBAL DRAWER & MODAL MANAGEMENT
  // -------------------------------------------------------------------------

  function initDrawer() {
    const drawer = document.getElementById("resource-drawer");
    const overlay = document.getElementById("drawer-overlay");
    const closeBtn = document.getElementById("drawer-close-btn");

    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  function openDrawer(title, contentHtml) {
    const drawer = document.getElementById("resource-drawer");
    const overlay = document.getElementById("drawer-overlay");
    const titleEl = document.getElementById("drawer-title");
    const bodyEl = document.getElementById("drawer-body");

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;

    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
  }

  function closeDrawer() {
    const drawer = document.getElementById("resource-drawer");
    const overlay = document.getElementById("drawer-overlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    if (AppState.graphVisualizer) {
      AppState.graphVisualizer.clearSelection();
    }
  }

  // -------------------------------------------------------------------------
  // DATA LOADERS & API CALLS
  // -------------------------------------------------------------------------

  async function loadSystemStats() {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        AppState.stats = await res.json();
        updateHeaderStats();
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
    }
  }

  function updateHeaderStats() {
    if (!AppState.stats) return;
    const statEl = document.getElementById("header-quick-stats");
    if (statEl) {
      statEl.textContent = `${AppState.stats.totalResources} Resources • ${AppState.stats.patientCount} Patients`;
    }
  }

  async function loadPatients() {
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        AppState.patients = await res.json();
        populatePatientSelectors();
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }

  function populatePatientSelectors() {
    const selectors = document.querySelectorAll(".patient-selector-select");
    selectors.forEach(sel => {
      const currentVal = sel.value || AppState.selectedPatientId;
      sel.innerHTML = "";
      AppState.patients.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.mrn}) : ${p.transferStatus}`;
        if (p.id === currentVal) opt.selected = true;
        sel.appendChild(opt);
      });

      sel.onchange = (e) => {
        AppState.selectedPatientId = e.target.value;
        // Refresh active view
        handleRoute(AppState.currentView);
      };
    });
  }

  // -------------------------------------------------------------------------
  // 1. HOME VIEW
  // -------------------------------------------------------------------------

  function renderHomeView() {
    const container = document.getElementById("home-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>HealthGraph: Healthcare Information System Explorer</h1>
          <p>
            An educational, technically rigorous exploration of structured healthcare information,
            HL7® FHIR® R4 clinical modeling, referential integrity, and longitudinal patient representation.
          </p>
        </div>
        <div>
          <span class="banner-synthetic">Synthetic Data Only</span>
        </div>
      </div>

      <div class="grid-2col" style="margin-bottom: var(--space-xl);">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Central Thesis & Information Model</h2>
            <span class="badge badge-accent">Core Philosophy</span>
          </div>
          <p style="margin-bottom: var(--space-md); color: var(--text-secondary);">
            <strong>Healthcare information is structured, connected, layered, and consequential.</strong>
            Clinical events do not occur in isolation. Every lab observation, diagnosis, and prescription
            is anchored to an encounter, governed by an authorized clinician, attributed to a provider
            organization, and forms part of an evolving longitudinal narrative.
          </p>
          <div class="code-block" style="font-size: 11px; line-height: 1.6;">
Patient (Identity & Demographics)
  ├── Managing Organization (Attribution)
  ├── General Practitioner (Care Governance)
  └── Encounter (Temporal Clinical Container)
        ├── Condition (Diagnosis & Problem List)
        ├── Observation (Quantitative Labs & Vitals)
        ├── Procedure (Interventions & Outcomes)
        ├── DiagnosticReport (Radiology & Laboratory Findings)
        └── MedicationRequest (Prescription Orders & Attributions)
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">System Conformance Dimensions</h2>
            <span class="badge badge-info">Audited Metrics</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <div style="padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 13px;">1. Syntactic Validity</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Valid JSON syntax and primitive scalars according to RFC 8259.</div>
            </div>
            <div style="padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 13px;">2. Structural / Resource Validity</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Valid FHIR R4 schema conformance and resource-specific mandatory elements.</div>
            </div>
            <div style="padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 13px;">3. Referential Integrity</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Bidirectional foreign key pointers resolve to existing entities (detects dangling pointers).</div>
            </div>
            <div style="padding: 8px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 13px;">4. Semantic & Interoperability Usefulness</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Standardized with canonical terminologies (LOINC, SNOMED CT, RxNorm, ICD-10-CM).</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-bottom: var(--space-xl);">
        <div class="panel-header">
          <h2 class="panel-title">Explore HealthGraph by Capability</h2>
        </div>
        <div class="grid-3col">
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#interop" class="nav-link" style="padding:0; color:var(--accent-primary);">Interoperability Lab</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">Inspect each stage of an actual ingestion pipeline: source to validation, normalization, and transfer readiness.</div>
          </div>
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#patients" class="nav-link" style="padding:0; color:var(--accent-primary);">Patient Explorer</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">Inspect longitudinal patient records, encounter narratives, orders, and transfer readiness evaluations.</div>
          </div>
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#relationships" class="nav-link" style="padding:0; color:var(--accent-primary);">Relationship Graph</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">Explore an interactive topological knowledge graph of resources with pan, zoom, and node inspection.</div>
          </div>
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#quality" class="nav-link" style="padding:0; color:var(--accent-primary);">Data Quality Ledger</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">View transparent multidimensional quality metrics and audited findings with ERROR/WARNING taxonomy.</div>
          </div>
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#terminology" class="nav-link" style="padding:0; color:var(--accent-primary);">Terminology Explorer</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">Understand the distinct roles of LOINC, SNOMED CT, ICD-10-CM, and RxNorm in medical exchange.</div>
          </div>
          <div style="padding: var(--space-sm); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;"><a href="#api" class="nav-link" style="padding:0; color:var(--accent-primary);">Live FHIR API Sandbox</a></div>
            <div style="font-size: 12px; color: var(--text-secondary);">Execute live REST requests against standard endpoints and view compliant FHIR searchset bundles.</div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 2. INTEROPERABILITY LAB VIEW (P0)
  // -------------------------------------------------------------------------

  async function renderInteropLabView() {
    const container = document.getElementById("interop-content");
    if (!container) return;

    container.innerHTML = `<div style="padding: var(--space-xl); text-align: center; color: var(--text-muted);">Loading Interoperability Pipeline...</div>`;

    try {
      const res = await fetch("/api/interop/pipeline");
      if (!res.ok) throw new Error("Failed to load pipeline");
      AppState.pipelineData = await res.json();
    } catch (err) {
      container.innerHTML = `<div class="badge badge-err" style="padding: var(--space-md);">Failed to load Interoperability Pipeline: ${err.message}</div>`;
      return;
    }

    const p = AppState.pipelineData;
    let stepsHtml = "";

    p.stages.forEach(stage => {
      let stageDetail = "";
      if (stage.artifacts) {
        stageDetail = `
          <div style="display: flex; gap: var(--space-md); flex-wrap: wrap; margin-top: 8px;">
            ${stage.artifacts.map(a => `
              <div style="flex: 1; min-width: 240px; background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-weight: 600; font-size: 13px;">${escapeHtml(a.name)}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(a.type)}</div>
                <div style="font-size: 11px; margin-top: 4px; color: var(--text-secondary);">Emits: <code>${escapeHtml(a.emits)}</code></div>
              </div>
            `).join("")}
          </div>
        `;
      } else if (stage.sampleJson) {
        stageDetail = `
          <div style="margin-top: 8px;">
            <div class="code-header">
              <span>Sample FHIR Bundle Entry (Observation)</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-copy='${JSON.stringify(stage.sampleJson.sampleEntry)}'>Copy JSON</button>
            </div>
            <pre class="code-block">${formatJSON(stage.sampleJson.sampleEntry)}</pre>
          </div>
        `;
      } else if (stage.sampleValidReport) {
        stageDetail = `
          <div class="grid-2col" style="margin-top: 8px;">
            <div style="background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 12px; color: var(--status-ok-text); margin-bottom: 4px;">✓ Conforming Resource (Observation/OBS-VANCE-A1C-1)</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Passed Layer 1 Structural, Layer 2 Resource, and Layer 3 Interop with 0 errors.</div>
            </div>
            <div style="background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-weight: 600; font-size: 12px; color: var(--status-err-text); margin-bottom: 4px;">✕ Anomaly Resource (MedicationRequest/MED-ANOMALY-DANGLING-PRAC)</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Identified Dangling Reference pointing to non-existent Practitioner/PRAC-99999.</div>
            </div>
          </div>
        `;
      } else if (stage.provenanceRecord) {
        const pr = stage.provenanceRecord;
        stageDetail = `
          <div style="margin-top: 8px; background: var(--bg-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 12px;">
            <div><strong>Source System:</strong> ${escapeHtml(pr.sourceSystem)}</div>
            <div><strong>Originating Organization:</strong> ${escapeHtml(pr.sourceOrganization)}</div>
            <div><strong>Recorded Timestamp:</strong> <code>${escapeHtml(pr.recordedTime)}</code></div>
            <div><strong>Attributed Clinician:</strong> <code>${escapeHtml(pr.agentPractitioner || "None Recorded")}</code></div>
            <div><strong>Ingestion Event:</strong> ${escapeHtml(pr.activity)}</div>
          </div>
        `;
      } else if (stage.metrics) {
        stageDetail = `
          <div style="margin-top: 8px; display: flex; gap: var(--space-md); font-family: var(--font-mono); font-size: 12px;">
            <span class="badge badge-neutral">${stage.metrics.totalReferences} Total Reference Pointers</span>
            <span class="badge badge-err">${stage.metrics.danglingCount} Dangling References</span>
            <span class="badge badge-warn">${stage.metrics.orphanCount} Orphan Resources</span>
          </div>
        `;
      } else if (stage.tableCounts) {
        stageDetail = `
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            ${Object.entries(stage.tableCounts).map(([type, count]) => `
              <span class="badge badge-neutral">${type}: ${count}</span>
            `).join("")}
          </div>
        `;
      } else if (stage.transferAssessment) {
        const ta = stage.transferAssessment;
        const statusClass = ta.isReady ? "badge-ok" : "badge-err";
        stageDetail = `
          <div style="margin-top: 8px; font-size: 12px;">
            <span class="badge ${statusClass}">${ta.transferStatus}</span>
            <span style="margin-left: 8px; color: var(--text-secondary);">${escapeHtml(ta.reasons[0])}</span>
          </div>
        `;
      }

      stepsHtml += `
        <div class="pipeline-step">
          <div class="pipeline-step-header">
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <span class="step-number">Stage ${stage.stageNumber}</span>
              <h3 style="font-size: var(--type-headline); font-weight: 600;">${escapeHtml(stage.title)}</h3>
            </div>
          </div>
          <p style="font-size: var(--type-caption); color: var(--text-secondary);">${escapeHtml(stage.description)}</p>
          ${stageDetail}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Interoperability Lab: Information Pipeline Inspection</h1>
          <p>
            Healthcare interoperability is not simply displaying JSON; it is an active pipeline of
            ingestion, syntactic verification, structural validation, reference resolution, and operational readiness.
          </p>
        </div>
      </div>

      <div class="panel" style="margin-bottom: var(--space-lg); background: #FAF9F5; border-color: var(--accent-border);">
        <div style="font-weight: 600; font-size: 13px; color: var(--accent-primary); margin-bottom: 4px;">
          CRITICAL ARCHITECTURAL DISTINCTION:
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
          A resource can be 100% syntactically valid JSON and structurally conform to FHIR schemas while still
          failing referential integrity (e.g. broken foreign key) or being completely useless for clinical interoperability
          (e.g. missing canonical LOINC/SNOMED coding). HealthGraph makes that distinction visible below.
        </p>
      </div>

      <div class="pipeline-stepper">
        ${stepsHtml}
      </div>
    `;

    bindCopyButtons();
  }

  // -------------------------------------------------------------------------
  // 3. PATIENTS EXPLORER VIEW
  // -------------------------------------------------------------------------

  async function renderPatientsView() {
    const container = document.getElementById("patients-content");
    if (!container) return;

    container.innerHTML = `<div style="padding: var(--space-xl); text-align: center; color: var(--text-muted);">Loading Patient Dossier...</div>`;

    let dossier = null;
    try {
      const res = await fetch(`/api/patient/${AppState.selectedPatientId}/dossier`);
      if (!res.ok) throw new Error("Failed to load patient dossier");
      dossier = await res.json();
    } catch (err) {
      container.innerHTML = `<div class="badge badge-err" style="padding: var(--space-md);">Error: ${err.message}</div>`;
      return;
    }

    const p = dossier.patient;
    const name = p.name ? `${(p.name[0].given || []).join(" ")} ${p.name[0].family || ""}` : "Unknown Patient";
    const tr = dossier.transferReadiness;

    const bannerClass = tr.transferStatus === "TRANSFER READY" ? "ready" : (tr.transferStatus === "TRANSFER BLOCKED" ? "blocked" : "review");

    // Group encounters
    const encounters = dossier.resourcesByType.Encounter || [];
    const conditions = dossier.resourcesByType.Condition || [];
    const observations = dossier.resourcesByType.Observation || [];
    const medications = dossier.resourcesByType.MedicationRequest || [];
    const procedures = dossier.resourcesByType.Procedure || [];

    let encountersHtml = "";
    if (encounters.length === 0) {
      encountersHtml = `<div style="color: var(--text-muted); font-size: 12px;">No encounters recorded for this patient.</div>`;
    } else {
      encountersHtml = encounters.map(enc => {
        const encType = enc.type ? enc.type[0].text : "Clinical Encounter";
        const cls = enc.class ? enc.class.display : "Ambulatory";
        const period = enc.period || {};
        const start = period.start ? period.start.substring(0, 10) : "Undated";
        return `
          <div style="padding: 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px; background: var(--bg-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: 600; font-size: 13px;">${escapeHtml(encType)}</span>
              <span class="badge badge-neutral">${cls}</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              Date: ${start} • ID: <a href="javascript:void(0)" class="inspect-res-link" data-type="Encounter" data-id="${enc.id}">${enc.id}</a>
            </div>
          </div>
        `;
      }).join("");
    }

    let clinicalSummaryHtml = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <div>
          <h4 style="font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px;">
            Diagnoses & Problems (${conditions.length})
          </h4>
          ${conditions.map(c => `
            <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-weight: 500;">${escapeHtml(c.code ? c.code.text : "Condition")}</span>
              <span class="badge badge-neutral" style="margin-left: 6px; font-size: 10px;">${(c.clinicalStatus && c.clinicalStatus.coding) ? c.clinicalStatus.coding[0].code : "active"}</span>
            </div>
          `).join("") || "<div style='font-size:12px; color:var(--text-muted);'>None recorded</div>"}
        </div>
        <div>
          <h4 style="font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px;">
            Active Medications (${medications.length})
          </h4>
          ${medications.map(m => `
            <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-weight: 500;">${escapeHtml(m.medicationCodeableConcept ? m.medicationCodeableConcept.text : "Medication")}</span>
              <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(m.dosageInstruction ? (m.dosageInstruction[0].text || "") : "")}</div>
            </div>
          `).join("") || "<div style='font-size:12px; color:var(--text-muted);'>None recorded</div>"}
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Patient Dossier: Longitudinal Context</h1>
          <p>Structured longitudinal record connecting demographic identity to encounters, clinical observations, and medications.</p>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          <label class="form-label" for="pat-select-input" style="margin:0;">Select Patient:</label>
          <select id="pat-select-input" class="form-select patient-selector-select" style="min-width: 260px;"></select>
        </div>
      </div>

      <!-- Transfer Readiness Banner -->
      <div class="transfer-banner ${bannerClass}">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${tr.isReady ? 'badge-ok' : 'badge-err'}">${tr.transferStatus}</span>
            <strong style="font-size: 13px;">Interoperability Transfer Readiness Assessment</strong>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${tr.reasons.map(r => `• ${escapeHtml(r)}`).join(" ")}
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary" id="btn-view-patient-graph">View Patient Graph</button>
        </div>
      </div>

      <div class="grid-dossier">
        <!-- Identity Masthead -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Identity & Demographics</h2>
          </div>
          <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
            ${escapeHtml(name)}
          </div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-bottom: var(--space-md);">
            ID: ${p.id} • MRN: ${p.identifier ? p.identifier[0].value : "N/A"}
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
            <div><strong>Gender:</strong> ${escapeHtml(p.gender || "Unknown")}</div>
            <div><strong>Birth Date:</strong> <code>${escapeHtml(p.birthDate || "Not Recorded")}</code></div>
            <div><strong>Active Status:</strong> ${p.active ? "Active Record" : "Inactive"}</div>
            <div><strong>Managing Org:</strong> ${(p.managingOrganization && p.managingOrganization.display) || "Metropolitan Health"}</div>
            <div><strong>Primary Care:</strong> ${(p.generalPractitioner && p.generalPractitioner[0] && p.generalPractitioner[0].display) || "Not Assigned"}</div>
          </div>

          <div style="margin-top: var(--space-md); padding-top: var(--space-sm); border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-sm btn-secondary inspect-res-link" data-type="Patient" data-id="${p.id}" style="width: 100%;">Inspect Raw FHIR</button>
          </div>
        </div>

        <!-- Clinical Resources & Encounters -->
        <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">Clinical Care Encounters (${encounters.length})</h3>
            </div>
            ${encountersHtml}
          </div>

          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">Clinical Problems & Active Orders</h3>
            </div>
            ${clinicalSummaryHtml}
          </div>
        </div>
      </div>
    `;

    populatePatientSelectors();
    bindInspectLinks();

    const graphBtn = document.getElementById("btn-view-patient-graph");
    if (graphBtn) {
      graphBtn.addEventListener("click", () => {
        window.location.hash = "relationships";
        handleRoute("relationships");
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. RESOURCE CATALOG & SEARCH VIEW
  // -------------------------------------------------------------------------

  async function renderResourcesView() {
    const container = document.getElementById("resources-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Resource Explorer & Deterministic Search</h1>
          <p>Search, filter, and inspect structured FHIR resources across the synthetic clinical repository.</p>
        </div>
      </div>

      <div class="panel" style="margin-bottom: var(--space-md);">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: var(--space-sm); align-items: end;">
          <div class="form-group">
            <label class="form-label" for="res-search-q">Search by text, ID, or title:</label>
            <input type="text" id="res-search-q" class="form-input" placeholder="e.g. Troponin, Hemoglobin, Vance, E11.9...">
          </div>
          <div class="form-group">
            <label class="form-label" for="res-filter-type">Resource Type:</label>
            <select id="res-filter-type" class="form-select">
              <option value="">All Types</option>
              <option value="Patient">Patient</option>
              <option value="Encounter">Encounter</option>
              <option value="Observation">Observation</option>
              <option value="Condition">Condition</option>
              <option value="Procedure">Procedure</option>
              <option value="DiagnosticReport">DiagnosticReport</option>
              <option value="MedicationRequest">MedicationRequest</option>
              <option value="Practitioner">Practitioner</option>
              <option value="Organization">Organization</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="res-filter-patient">Patient:</label>
            <select id="res-filter-patient" class="form-select">
              <option value="">All Patients</option>
              <option value="PAT-VANCE-01">Eleanor Vance</option>
              <option value="PAT-THORNE-02">Marcus Thorne</option>
              <option value="PAT-CHEN-03">Sofia Chen</option>
              <option value="PAT-ROSS-04">David Ross</option>
              <option value="PAT-ANOMALY-05">Cohort-Anomaly-05</option>
            </select>
          </div>
          <button class="btn btn-primary" id="res-search-btn">Search</button>
        </div>
      </div>

      <div id="resource-table-container">
        <div style="padding: var(--space-md); text-align: center; color: var(--text-muted);">Loading resources...</div>
      </div>
    `;

    document.getElementById("res-search-btn").addEventListener("click", executeResourceSearch);
    document.getElementById("res-search-q").addEventListener("keydown", (e) => {
      if (e.key === "Enter") executeResourceSearch();
    });
    document.getElementById("res-filter-type").addEventListener("change", executeResourceSearch);
    document.getElementById("res-filter-patient").addEventListener("change", executeResourceSearch);

    executeResourceSearch();
  }

  async function executeResourceSearch() {
    const tableContainer = document.getElementById("resource-table-container");
    if (!tableContainer) return;

    const q = document.getElementById("res-search-q")?.value || "";
    const type = document.getElementById("res-filter-type")?.value || "";
    const patient = document.getElementById("res-filter-patient")?.value || "";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (patient) params.set("patient", patient);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search query failed");
      const data = await res.json();
      renderResourceTable(data.results);
    } catch (err) {
      tableContainer.innerHTML = `<div class="badge badge-err">Failed to fetch resources: ${err.message}</div>`;
    }
  }

  function renderResourceTable(results) {
    const tableContainer = document.getElementById("resource-table-container");
    if (!tableContainer) return;

    if (!results || results.length === 0) {
      tableContainer.innerHTML = `
        <div style="padding: var(--space-xl); text-align: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">No matching FHIR resources found</div>
          <div style="font-size: 12px; color: var(--text-muted);">Try broadening search criteria or removing filters.</div>
        </div>
      `;
      return;
    }

    let rowsHtml = results.map(r => {
      const date = r.dateRecorded ? r.dateRecorded.substring(0, 10) : "--";
      return `
        <tr>
          <td><span class="badge badge-neutral">${escapeHtml(r.resourceType)}</span></td>
          <td><code>${escapeHtml(r.id)}</code></td>
          <td style="font-weight: 500;">${escapeHtml(r.title || "--")}</td>
          <td>${r.patientId ? `<span style="font-family:var(--font-mono); font-size:11px;">${r.patientId}</span>` : "--"}</td>
          <td>${r.status ? `<span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(r.status)}</span>` : "--"}</td>
          <td><code>${date}</code></td>
          <td>
            <button class="btn btn-sm btn-secondary inspect-res-link" data-type="${r.resourceType}" data-id="${r.id}">Inspect</button>
          </td>
        </tr>
      `;
    }).join("");

    tableContainer.innerHTML = `
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px; font-family: var(--font-mono);">
        Showing ${results.length} resources
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Resource ID</th>
              <th>Display / Concept</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    bindInspectLinks();
  }

  // -------------------------------------------------------------------------
  // 5. RELATIONSHIP GRAPH VIEW
  // -------------------------------------------------------------------------

  async function renderRelationshipsView() {
    const container = document.getElementById("relationships-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Relationship Graph Explorer</h1>
          <p>Interactive topological knowledge network mapping patients, encounters, observations, conditions, and practitioners.</p>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          <label class="form-label" for="graph-patient-filter" style="margin:0;">Filter Ego-Network:</label>
          <select id="graph-patient-filter" class="form-select" style="min-width: 200px;">
            <option value="ALL">Entire Cohort Graph</option>
            <option value="PAT-VANCE-01" selected>Eleanor Vance Ego-Network</option>
            <option value="PAT-THORNE-02">Marcus Thorne Ego-Network</option>
            <option value="PAT-CHEN-03">Sofia Chen Ego-Network</option>
            <option value="PAT-ROSS-04">David Ross Ego-Network</option>
            <option value="PAT-ANOMALY-05">Cohort Anomaly (Dangling Node)</option>
          </select>
        </div>
      </div>

      <div class="graph-viewport-container" id="graph-canvas-container"></div>
    `;

    const filterSelect = document.getElementById("graph-patient-filter");
    filterSelect.addEventListener("change", (e) => {
      loadGraphData(e.target.value);
    });

    loadGraphData(filterSelect.value);
  }

  async function loadGraphData(target) {
    const url = target === "ALL" ? "/api/graph" : `/api/graph/patient/${target}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch graph data");
      const data = await res.json();

      if (!AppState.graphVisualizer) {
        AppState.graphVisualizer = new HealthGraphVisualizer("graph-canvas-container", {
          onNodeClick: (node) => {
            // Fetch detailed resource inspection
            inspectResource(node.resourceType, node.resourceId);
          }
        });
      }
      AppState.graphVisualizer.setData(data);
    } catch (err) {
      console.error("Failed to load graph:", err);
    }
  }

  // -------------------------------------------------------------------------
  // 6. LONGITUDINAL TIMELINE VIEW
  // -------------------------------------------------------------------------

  async function renderTimelineView() {
    const container = document.getElementById("timeline-content");
    if (!container) return;

    container.innerHTML = `<div style="padding: var(--space-xl); text-align: center; color: var(--text-muted);">Loading Longitudinal Timeline...</div>`;

    try {
      const res = await fetch(`/api/timeline/patient/${AppState.selectedPatientId}`);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      const data = await res.json();

      // Sparklines for lab trajectories (e.g. HbA1c, eGFR)
      let seriesHtml = "";
      if (data.series && Object.keys(data.series).length > 0) {
        seriesHtml = `
          <div class="panel" style="margin-bottom: var(--space-lg);">
            <div class="panel-header">
              <h2 class="panel-title">Biomarker Trajectories (Quantitative Lab Trends)</h2>
            </div>
            <div class="grid-2col">
              ${Object.entries(data.series).slice(0, 4).map(([name, points]) => {
                const values = points.map(p => p.value);
                const dates = points.map(p => p.date);
                const minVal = Math.min(...values);
                const maxVal = Math.max(...values);
                const range = (maxVal - minVal) || 1;
                const unit = points[0].unit || "";

                // Build SVG path
                const w = 360;
                const h = 50;
                const coords = points.map((p, i) => {
                  const x = 20 + (i / (points.length - 1 || 1)) * (w - 40);
                  const y = h - 10 - ((p.value - minVal) / range) * (h - 20);
                  return `${x},${y}`;
                });
                const pathD = `M ${coords.join(" L ")}`;

                return `
                  <div style="padding: 10px 14px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                      <strong style="font-size: 13px;">${escapeHtml(name)}</strong>
                      <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 600;">
                        Latest: ${values[values.length - 1]} ${unit}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
                      ${dates[0]} (${values[0]} ${unit}) → ${dates[dates.length - 1]} (${values[values.length - 1]} ${unit})
                    </div>
                    <svg class="sparkline-svg" viewBox="0 0 ${w} ${h}">
                      <path class="sparkline-line" d="${pathD}" />
                      ${coords.map((c, i) => `<circle class="sparkline-dot" cx="${c.split(',')[0]}" cy="${c.split(',')[1]}" r="4"><title>${dates[i]}: ${values[i]} ${unit}</title></circle>`).join("")}
                    </svg>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      }

      // Event stream
      let eventsHtml = "";
      if (data.events.length === 0) {
        eventsHtml = `<div style="color: var(--text-muted); padding: var(--space-lg); text-align: center;">No longitudinal events recorded for this subject.</div>`;
      } else {
        eventsHtml = data.events.map(ev => {
          const isEnc = ev.category === "encounter";
          return `
            <div class="timeline-event">
              <div class="timeline-dot ${isEnc ? 'encounter' : ''}"></div>
              <div class="timeline-card">
                <div class="timeline-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-neutral" style="font-size: 10px;">${escapeHtml(ev.category)}</span>
                    <span class="timeline-title">${escapeHtml(ev.title)}</span>
                  </div>
                  <span class="timeline-date">${escapeHtml(ev.timestamp)}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
                  ${escapeHtml(ev.summary || "")}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                    ${ev.resourceKey}
                  </span>
                  <button class="btn btn-sm btn-secondary inspect-res-link" data-type="${ev.resourceType}" data-id="${ev.resourceId}">Inspect</button>
                </div>
              </div>
            </div>
          `;
        }).join("");
      }

      container.innerHTML = `
        <div class="view-masthead">
          <div class="view-masthead-content">
            <h1>Longitudinal Patient Care Timeline</h1>
            <p>Unified chronological evolution of clinical encounters, diagnostic lab values, prescriptions, and procedures.</p>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <label class="form-label" for="timeline-patient-select" style="margin:0;">Select Patient:</label>
            <select id="timeline-patient-select" class="form-select patient-selector-select" style="min-width: 240px;"></select>
          </div>
        </div>

        ${seriesHtml}

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Chronological Event Stream (${data.totalEvents} Events)</h2>
          </div>
          <div class="timeline-stream">
            ${eventsHtml}
          </div>
        </div>
      `;

      populatePatientSelectors();
      bindInspectLinks();
    } catch (err) {
      container.innerHTML = `<div class="badge badge-err">Failed to load timeline: ${err.message}</div>`;
    }
  }

  // -------------------------------------------------------------------------
  // 7. DATA QUALITY VIEW (Multidimensional, Section 6 & 7)
  // -------------------------------------------------------------------------

  async function renderQualityView() {
    const container = document.getElementById("quality-content");
    if (!container) return;

    container.innerHTML = `<div style="padding: var(--space-xl); text-align: center; color: var(--text-muted);">Auditing Dataset Quality...</div>`;

    try {
      const res = await fetch("/api/quality/audit");
      if (!res.ok) throw new Error("Failed to audit dataset");
      AppState.auditData = await res.json();
    } catch (err) {
      container.innerHTML = `<div class="badge badge-err">Audit failed: ${err.message}</div>`;
      return;
    }

    const d = AppState.auditData.dimensions;
    const h = AppState.auditData.heuristicReadinessIndicator;
    const findings = AppState.auditData.findings;

    let findingsHtml = findings.map((f, i) => {
      const sevClass = f.severity === "ERROR" ? "badge-err" : (f.severity === "WARNING" ? "badge-warn" : "badge-info");
      return `
        <tr>
          <td><span class="badge ${sevClass}">${f.severity}</span></td>
          <td><span style="font-weight: 600; font-size: 12px;">${escapeHtml(f.dimension)}</span></td>
          <td><code>${escapeHtml(f.resourceKey)}</code></td>
          <td style="font-size: 12px;">${escapeHtml(f.summary)}</td>
          <td style="font-size: 11px; color: var(--text-secondary);">${escapeHtml(f.clinicalImpact)}</td>
          <td style="font-size: 11px; color: var(--accent-primary);">${escapeHtml(f.remediation)}</td>
          <td>
            <button class="btn btn-sm btn-secondary inspect-res-link" data-type="${f.resourceType}" data-id="${f.resourceId}">Inspect</button>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Multidimensional Data Quality Ledger</h1>
          <p>
            Healthcare data systems are inherently imperfect. Rather than relying on a single synthetic score,
            HealthGraph audits data across transparent, measurable dimensions using an ERROR / WARNING / INFORMATION taxonomy.
          </p>
        </div>
      </div>

      <!-- Dimension Cards Grid -->
      <div class="grid-3col" style="margin-bottom: var(--space-lg);">
        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Referential Integrity
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.referentialIntegrity.percentage}%</span>
            <span class="badge ${d.referentialIntegrity.status === 'PASSED' ? 'badge-ok' : 'badge-err'}">${d.referentialIntegrity.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${d.referentialIntegrity.resolvedReferences} / ${d.referentialIntegrity.totalReferences} pointers resolved (${d.referentialIntegrity.danglingReferences} dangling)
          </div>
        </div>

        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Structural Validity
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.structuralValidity.percentage}%</span>
            <span class="badge ${d.structuralValidity.status === 'PASSED' ? 'badge-ok' : 'badge-err'}">${d.structuralValidity.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${d.structuralValidity.validResources} / ${d.structuralValidity.totalResources} resources conform to schema
          </div>
        </div>

        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Temporal Consistency
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.temporalConsistency.percentage}%</span>
            <span class="badge ${d.temporalConsistency.status === 'PASSED' ? 'badge-ok' : 'badge-warn'}">${d.temporalConsistency.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${d.temporalConsistency.clashes} event timestamp contradiction(s) detected
          </div>
        </div>

        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Information Completeness
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.completeness.percentage}%</span>
            <span class="badge ${d.completeness.status === 'PASSED' ? 'badge-ok' : 'badge-warn'}">${d.completeness.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${d.completeness.omissions} mandatory attribute omission(s)
          </div>
        </div>

        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Terminology Standards
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.terminologyQuality.percentage}%</span>
            <span class="badge ${d.terminologyQuality.status === 'PASSED' ? 'badge-ok' : 'badge-warn'}">${d.terminologyQuality.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${d.terminologyQuality.standardCodedElements} / ${d.terminologyQuality.totalCodedElements} codings use canonical URIs
          </div>
        </div>

        <div class="panel">
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
            Identity Uniqueness
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${d.identityUniqueness.collisionCount === 0 ? 'Unique' : d.identityUniqueness.collisionCount + ' Collisions'}</span>
            <span class="badge ${d.identityUniqueness.status === 'PASSED' ? 'badge-ok' : 'badge-err'}">${d.identityUniqueness.status}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            Zero duplicate identifier collisions required for safe merges
          </div>
        </div>
      </div>

      <!-- Heuristic Indicator Note -->
      <div class="panel" style="margin-bottom: var(--space-lg); background: #FAF9F6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="font-size: 13px;">${escapeHtml(h.label)}: ${h.score} / 100</strong>
          <span class="badge badge-neutral">Heuristic Formula</span>
        </div>
        <p style="font-size: 11px; color: var(--text-muted);">
          Weights: ${escapeHtml(h.weights)} • <em>${escapeHtml(h.disclaimer)}</em>
        </p>
      </div>

      <!-- Audit Issue Ledger -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Audited Findings Ledger (${findings.length} Items)</h2>
          <div style="display: flex; gap: 6px;">
            <span class="badge badge-err">${AppState.auditData.summaryCounts.ERROR} Errors</span>
            <span class="badge badge-warn">${AppState.auditData.summaryCounts.WARNING} Warnings</span>
            <span class="badge badge-info">${AppState.auditData.summaryCounts.INFORMATION} Info</span>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Dimension</th>
                <th>Resource Key</th>
                <th>Summary Finding</th>
                <th>Clinical Risk / Impact</th>
                <th>Remediation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${findingsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    bindInspectLinks();
  }

  // -------------------------------------------------------------------------
  // 8. TERMINOLOGY EXPLORER VIEW (Section 4)
  // -------------------------------------------------------------------------

  async function renderTerminologyView() {
    const container = document.getElementById("terminology-content");
    if (!container) return;

    container.innerHTML = `<div style="padding: var(--space-xl); text-align: center; color: var(--text-muted);">Loading Terminology Catalog...</div>`;

    try {
      const res = await fetch("/api/terminology");
      if (!res.ok) throw new Error("Failed to load terminology");
      const data = await res.json();
      const catalog = data.catalog;
      const lesson = data.lesson;

      let cardsHtml = catalog.map(item => `
        <div class="panel" style="margin-bottom: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <div>
              <span class="badge badge-neutral" style="margin-right: 6px;">${escapeHtml(item.systemName)}</span>
              <strong style="font-family: var(--font-mono); font-size: 14px;">${escapeHtml(item.code)}</strong>
              <span style="margin-left: 8px; font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHtml(item.display)}</span>
            </div>
            <span class="badge badge-accent" style="font-size: 10px;">${escapeHtml(item.usedInResource)}.${escapeHtml(item.usedInField)}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
            <strong>Clinical Meaning:</strong> ${escapeHtml(item.clinicalMeaning)}
          </div>
          <div style="font-size: 12px; color: #7A4B00; background: #FEF7EC; padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid #F3CA8A;">
            <strong>Interoperability Challenge:</strong> ${escapeHtml(item.interopChallenge)}
          </div>
        </div>
      `).join("");

      container.innerHTML = `
        <div class="view-masthead">
          <div class="view-masthead-content">
            <h1>Terminology Explorer: Curated Standard Subset</h1>
            <p>${escapeHtml(lesson.thesis)}</p>
          </div>
        </div>

        <div class="panel" style="margin-bottom: var(--space-lg); background: #FAF9F6;">
          <div style="font-weight: 600; font-size: 13px; color: var(--accent-primary); margin-bottom: 4px;">
            Why Coded Terminologies Matter in Healthcare Information Systems:
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
            ${escapeHtml(lesson.problemStatement)}
          </p>
        </div>

        <div style="margin-bottom: var(--space-lg);">
          ${cardsHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="badge badge-err">Failed to fetch terminology: ${err.message}</div>`;
    }
  }

  // -------------------------------------------------------------------------
  // 9. LIVE FHIR API EXPLORER VIEW (Section 11)
  // -------------------------------------------------------------------------

  function renderApiView() {
    const container = document.getElementById("api-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Live Educational FHIR R4 API Sandbox</h1>
          <p>Execute real REST requests against HealthGraph's in-memory server and inspect standard FHIR JSON payloads.</p>
        </div>
      </div>

      <div class="grid-2col" style="margin-bottom: var(--space-lg);">
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Preset Educational Queries</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary api-preset-btn" data-url="/fhir/metadata" style="text-align: left; justify-content: flex-start;">
              <code>GET /fhir/metadata</code> : Conformance CapabilityStatement
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/fhir/Patient/PAT-VANCE-01" style="text-align: left; justify-content: flex-start;">
              <code>GET /fhir/Patient/PAT-VANCE-01</code> : Single Patient Instance
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/fhir/Observation?patient=PAT-VANCE-01" style="text-align: left; justify-content: flex-start;">
              <code>GET /fhir/Observation?patient=PAT-VANCE-01</code> : Patient Labs & Vitals
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/fhir/Encounter?patient=PAT-VANCE-01" style="text-align: left; justify-content: flex-start;">
              <code>GET /fhir/Encounter?patient=PAT-VANCE-01</code> : Longitudinal Encounters
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/fhir/Observation?code=4548-4" style="text-align: left; justify-content: flex-start;">
              <code>GET /fhir/Observation?code=4548-4</code> : Search by LOINC HbA1c
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/api/quality/audit" style="text-align: left; justify-content: flex-start;">
              <code>GET /api/quality/audit</code> : Multidimensional Quality Report
            </button>
            <button class="btn btn-secondary api-preset-btn" data-url="/api/interop/pipeline" style="text-align: left; justify-content: flex-start;">
              <code>GET /api/interop/pipeline</code> : 9-Stage Ingestion Pipeline
            </button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Request Console</h2>
          </div>
          <div class="form-group" style="margin-bottom: var(--space-sm);">
            <label class="form-label" for="api-url-input">Endpoint URL:</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="api-url-input" class="form-input" style="flex: 1; font-family: var(--font-mono);" value="/fhir/metadata">
              <button class="btn btn-primary" id="api-send-btn">Send</button>
            </div>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
            Supports standard GET requests with query parameters.
          </div>
          <div class="code-header">
            <span>Generated cURL Command</span>
            <button class="btn btn-sm btn-secondary copy-btn" id="api-copy-curl">Copy cURL</button>
          </div>
          <pre class="code-block" id="api-curl-box" style="margin-bottom: 0;">curl -X GET "http://127.0.0.1:8000/fhir/metadata" -H "Accept: application/fhir+json"</pre>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Server Response</h2>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="api-res-status" class="badge badge-neutral">--</span>
            <span id="api-res-time" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">-- ms</span>
            <button class="btn btn-sm btn-secondary copy-btn" id="api-copy-response">Copy JSON</button>
          </div>
        </div>
        <pre class="code-block" id="api-response-body" style="max-height: 480px; overflow-y: auto;">Click "Send" or select a preset to execute a query.</pre>
      </div>
    `;

    document.querySelectorAll(".api-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        document.getElementById("api-url-input").value = url;
        executeApiCall(url);
      });
    });

    document.getElementById("api-send-btn").addEventListener("click", () => {
      const url = document.getElementById("api-url-input").value;
      executeApiCall(url);
    });

    bindCopyButtons();
  }

  async function executeApiCall(url) {
    const statusEl = document.getElementById("api-res-status");
    const timeEl = document.getElementById("api-res-time");
    const bodyEl = document.getElementById("api-response-body");
    const curlEl = document.getElementById("api-curl-box");

    if (curlEl) {
      curlEl.textContent = `curl -X GET "http://127.0.0.1:8000${url}" -H "Accept: application/fhir+json"`;
    }

    bodyEl.textContent = "Executing request...";
    const t0 = performance.now();

    try {
      const res = await fetch(url);
      const t1 = performance.now();
      const duration = Math.round(t1 - t0);

      statusEl.textContent = `${res.status} ${res.statusText || "OK"}`;
      statusEl.className = `badge ${res.ok ? 'badge-ok' : 'badge-err'}`;
      timeEl.textContent = `${duration} ms`;

      const json = await res.json();
      bodyEl.innerHTML = formatJSON(json);
    } catch (err) {
      statusEl.textContent = "FAILED";
      statusEl.className = "badge badge-err";
      bodyEl.textContent = `Error: ${err.message}`;
    }
  }

  // -------------------------------------------------------------------------
  // 10. SYSTEM-OF-SYSTEMS & ARCHITECTURE VIEW (Section 13)
  // -------------------------------------------------------------------------

  function renderArchitectureView() {
    const container = document.getElementById("architecture-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>System-of-Systems Architecture</h1>
          <p>Visualizing how healthcare data flows between disparate institutional systems and is reconstructed into a living graph.</p>
        </div>
      </div>

      <div class="panel" style="margin-bottom: var(--space-xl);">
        <div class="panel-header">
          <h2 class="panel-title">Cross-Institutional Information Flow</h2>
        </div>
        <div class="code-block" style="line-height: 1.6; font-size: 12px;">
┌───────────────────────────────────┐        ┌───────────────────────────────────┐
│     Hospital Inpatient EHR        │        │    Commercial Reference Lab       │
│  - Patient Demographics           │        │  - Automated Chemistry Analyzers  │
│  - Emergency & Inpatient Visits   │        │  - Standard LOINC Coded Results   │
│  - Surgical Procedures (CABG)     │        │  - Reference Ranges & Flags       │
└─────────────────┬─────────────────┘        └─────────────────┬─────────────────┘
                  │ FHIR R4 Bundle                             │ FHIR Observations
                  ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                    HealthGraph Local Ingestion Gateway                         │
│  - Transport Decoupling & In-Memory Pipeline                                   │
│  - Provenance Extraction (Records source organization & emission timestamps)   │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│             Layered Validation & Reference Resolution Engines                  │
│  - Layer 1: Structural JSON Schema Invariant Checks                            │
│  - Layer 2: Resource-Specific Constraints (Patient, Encounter, Condition, etc.)│
│  - Layer 3: Application Interoperability (Terminology URIs, Temporal Clashes)  │
│  - Reference Resolver: Links relative pointers, detects dangling/orphan items  │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                       Normalized Data Storage & Graph                          │
│  - SQLite Relational Cache: Indexed by resource_type, patient_id, encounter_id │
│  - NetworkX Directed Graph: Multi-edge topological knowledge network           │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                     Consumer-Facing Exploration Systems                        │
│  - Longitudinal Patient Dossier & Biomarker Trajectory Charts                  │
│  - Multidimensional Quality Ledger & Error Taxonomy                            │
│  - Interactive SVG Relationship Graph with Ego-Network Filtering               │
│  - Live Educational FHIR REST API & CapabilityStatement                        │
└────────────────────────────────────────────────────────────────────────────────┘
        </div>
      </div>

      <div class="grid-2col">
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Technical Principles</h3>
          </div>
          <ul style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; padding-left: var(--space-md);">
            <li><strong>Deterministic Core:</strong> 100% of validation, resolution, graph construction, and quality analysis is mathematical and algorithmic. Zero reliance on non-deterministic LLMs.</li>
            <li><strong>Local-First:</strong> Runs entirely on the user's laptop using lightweight Python, SQLite, NetworkX, and Starlette. No paid cloud APIs or telemetry.</li>
            <li><strong>Layered Separation:</strong> Distinguishes raw FHIR representations from normalized relational and graph index models.</li>
          </ul>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Component Stack</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div><strong>Language:</strong> Python 3.14 (Standard library + Pydantic v2)</div>
            <div><strong>Storage:</strong> SQLite relational engine with composite primary keys</div>
            <div><strong>Graph Engine:</strong> NetworkX directed multi-graph</div>
            <div><strong>API Server:</strong> Starlette ASGI asynchronous web framework</div>
            <div><strong>Client Layer:</strong> Vanilla modern HTML5 / CSS3 / ES6 with bespoke SVG engine</div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 11. METHODOLOGY & "WHAT HEALTHGRAPH IS NOT" VIEW (Section 12)
  // -------------------------------------------------------------------------

  function renderMethodView() {
    const container = document.getElementById("method-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Methodology & System Boundaries</h1>
          <p>Intellectual foundation, FHIR design trade-offs, synthetic data provenance, and explicit scope limitations.</p>
        </div>
      </div>

      <!-- WHAT HEALTHGRAPH IS NOT (Section 12) -->
      <div class="panel" style="margin-bottom: var(--space-lg); border-left: 4px solid var(--status-err-border); background: #FFFDFD;">
        <div class="panel-header">
          <h2 class="panel-title" style="color: var(--status-err-text);">What HealthGraph Is NOT</h2>
          <span class="badge badge-err">Non-Goals & Scope Limits</span>
        </div>
        <div class="grid-2col" style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
          <div>
            <p><strong>• NOT a Production EHR:</strong> HealthGraph does not replace electronic health record systems (Epic, Cerner, MEDITECH) and does not handle clinical charting or billing.</p>
            <p style="margin-top: 6px;"><strong>• NOT an AI Doctor / Diagnostic Tool:</strong> HealthGraph provides zero medical diagnoses, treatment recommendations, or clinical decision support.</p>
            <p style="margin-top: 6px;"><strong>• NOT a HIPAA-Compliant Production Environment:</strong> Operates exclusively on synthetic data on localhost. It lacks production authorization, business associate agreements, and encrypted audit trails.</p>
          </div>
          <div>
            <p><strong>• NOT a Complete FHIR Server:</strong> Implements an educational subset of 10 primary FHIR R4 resource types, not the 140+ resources in full HL7 FHIR specifications.</p>
            <p style="margin-top: 6px;"><strong>• NOT a Universal Interoperability Platform:</strong> Demonstrates the foundational principles of reference resolution and terminology alignment without claiming enterprise integration capabilities.</p>
            <p style="margin-top: 6px;"><strong>• NOT a Consumer Health Tracker:</strong> Designed as an informatics research instrument and developer exploration environment, not a consumer fitness portal.</p>
          </div>
        </div>
      </div>

      <div class="grid-2col" style="margin-bottom: var(--space-lg);">
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">The 80/20 Rule of FHIR</h3>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            HL7 FHIR is deliberately architected around the "80/20 rule": the core specification only defines
            data elements that are present in at least 80% of existing healthcare systems.
            The remaining 20% of specialized, regional, or domain-specific data requirements are accommodated
            through <strong>Extensions</strong> and <strong>Profiles / Implementation Guides</strong> (e.g. US Core).
          </p>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Synthetic Data Provenance</h3>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            All data loaded into HealthGraph is 100% synthetic, generated deterministically to reflect authentic
            clinical longitudinal timelines (Type 2 Diabetes, Acute Coronary Syndrome, Pediatric Asthma) alongside
            calibrated real-world data flaws (dangling references, orphan resources, temporal clashes) to test information systems.
          </p>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 12. BUNDLE IMPORT & EXPORT VIEW (Section 9)
  // -------------------------------------------------------------------------

  function renderImportExportView() {
    const container = document.getElementById("import_export-content");
    if (!container) return;

    container.innerHTML = `
      <div class="view-masthead">
        <div class="view-masthead-content">
          <h1>Synthetic FHIR Bundle Import & Export</h1>
          <p>Upload custom synthetic FHIR Bundles to test the live pipeline, or export filtered datasets and quality audit reports.</p>
        </div>
      </div>

      <div class="grid-2col">
        <!-- Import Panel -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Import Synthetic Bundle</h2>
            <span class="badge badge-neutral">Pipeline Ingestion</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-md);">
            Upload a valid FHIR R4 Bundle JSON payload. The application will clear existing records, parse,
            execute 3-layer validation, re-index references, rebuild the relationship graph, and re-audit quality.
          </p>

          <div class="form-group" style="margin-bottom: var(--space-md);">
            <label class="form-label" for="bundle-file-input">Select JSON Bundle File:</label>
            <input type="file" id="bundle-file-input" class="form-input" accept=".json,application/json">
          </div>

          <div style="display: flex; gap: var(--space-sm);">
            <button class="btn btn-primary" id="btn-upload-bundle">Ingest Bundle</button>
            <button class="btn btn-secondary" id="btn-reset-synthetic">Reset to Standard Cohort</button>
          </div>

          <div id="import-status-box" style="margin-top: var(--space-md); display: none;"></div>
        </div>

        <!-- Export Panel -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Export Options</h2>
            <span class="badge badge-neutral">Dataset Extraction</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-md);">
            Download the active dataset in standard FHIR JSON format for external analysis or testing.
          </p>

          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <a href="/api/bundle/export" download class="btn btn-secondary" style="justify-content: flex-start;">
              <strong>Download Complete Synthetic Bundle (JSON)</strong>
            </a>
            <button class="btn btn-secondary" id="btn-export-vance" style="justify-content: flex-start;">
              Download Eleanor Vance Longitudinal Bundle (JSON)
            </button>
            <button class="btn btn-secondary" id="btn-export-quality" style="justify-content: flex-start;">
              Download Data Quality Audit Report (JSON)
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-upload-bundle").addEventListener("click", handleBundleUpload);
    document.getElementById("btn-reset-synthetic").addEventListener("click", resetSyntheticBundle);

    document.getElementById("btn-export-vance").addEventListener("click", () => {
      window.location.href = "/api/bundle/export?patient=PAT-VANCE-01";
    });

    document.getElementById("btn-export-quality").addEventListener("click", () => {
      window.location.href = "/api/quality/audit";
    });
  }

  async function handleBundleUpload() {
    const fileInput = document.getElementById("bundle-file-input");
    const statusBox = document.getElementById("import-status-box");
    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Please select a JSON file to upload.");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bundleJson = JSON.parse(e.target.result);
        statusBox.style.display = "block";
        statusBox.className = "badge badge-neutral";
        statusBox.textContent = "Ingesting and running validation pipeline...";

        const res = await fetch("/api/bundle/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bundleJson)
        });

        const result = await res.json();
        if (res.ok) {
          statusBox.className = "badge badge-ok";
          statusBox.textContent = result.message || "Successfully ingested bundle!";
          await loadSystemStats();
          await loadPatients();
        } else {
          statusBox.className = "badge badge-err";
          statusBox.textContent = result.error || "Failed to ingest bundle.";
        }
      } catch (err) {
        statusBox.style.display = "block";
        statusBox.className = "badge badge-err";
        statusBox.textContent = `JSON Parse Error: ${err.message}`;
      }
    };
    reader.readAsText(file);
  }

  async function resetSyntheticBundle() {
    if (!confirm("Reset repository to original calibrated synthetic bundle?")) return;
    try {
      const res = await fetch("/healthgraph/data/synthetic_bundle.json");
      // Or simply refresh page
      window.location.reload();
    } catch (err) {
      window.location.reload();
    }
  }

  // -------------------------------------------------------------------------
  // RESOURCE INSPECTION DRAWER DETAILS
  // -------------------------------------------------------------------------

  async function inspectResource(resType, resId) {
    openDrawer(`${resType} / ${resId}`, `<div style="padding: var(--space-md); color: var(--text-muted);">Loading resource inspection...</div>`);

    try {
      const res = await fetch(`/api/resource/${resType}/${resId}`);
      if (!res.ok) throw new Error("Failed to load resource detail");
      const data = await res.json();
      renderResourceDetailInDrawer(data);
    } catch (err) {
      openDrawer("Inspection Failed", `<div class="badge badge-err">${err.message}</div>`);
    }
  }

  function renderResourceDetailInDrawer(data) {
    const r = data.resource;
    const v = data.validation;
    const p = data.provenance;
    const fwd = data.forwardLinks || [];
    const rev = data.reverseLinks || [];

    const valBadge = v.isValid ? `<span class="badge badge-ok">Schema Valid</span>` : `<span class="badge badge-err">${v.errorCount} Schema Errors</span>`;

    let findingsHtml = "";
    if (v.findings && v.findings.length > 0) {
      findingsHtml = `
        <div style="margin-top: 8px; font-size: 11px;">
          ${v.findings.map(f => `
            <div style="padding: 4px 6px; background: ${f.severity === 'ERROR' ? '#FDF1F1' : '#FEF7EC'}; border-radius: 3px; margin-bottom: 4px;">
              <strong>[${f.severity}]</strong> ${escapeHtml(f.message)}
            </div>
          `).join("")}
        </div>
      `;
    }

    let linksHtml = `
      <div style="font-size: 12px; margin-top: 8px;">
        <div><strong>Outbound References (${fwd.length}):</strong></div>
        ${fwd.length === 0 ? "<div style='color:var(--text-muted); font-size:11px;'>No outgoing pointers</div>" : `
          <ul style="padding-left: 16px; font-size: 11px; margin-top: 2px;">
            ${fwd.map(l => `
              <li>
                <code>${escapeHtml(l.path)}</code> → 
                <a href="javascript:void(0)" class="inspect-res-link" data-type="${l.targetType}" data-id="${l.targetId}">${l.target}</a>
                ${l.isResolved ? "" : " <span class='badge badge-err' style='font-size:9px;'>Unresolved</span>"}
              </li>
            `).join("")}
          </ul>
        `}
        <div style="margin-top: 6px;"><strong>Inbound References (${rev.length}):</strong></div>
        ${rev.length === 0 ? "<div style='color:var(--text-muted); font-size:11px;'>No incoming pointers</div>" : `
          <ul style="padding-left: 16px; font-size: 11px; margin-top: 2px;">
            ${rev.map(l => `
              <li>
                <a href="javascript:void(0)" class="inspect-res-link" data-type="${l.source.split('/')[0]}" data-id="${l.source.split('/')[1]}">${l.source}</a>
                (via <code>${escapeHtml(l.path)}</code>)
              </li>
            `).join("")}
          </ul>
        `}
      </div>
    `;

    const html = `
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <!-- Validation Summary -->
        <div class="panel" style="padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 13px;">3-Layer Validation Status</strong>
            ${valBadge}
          </div>
          ${findingsHtml}
        </div>

        <!-- Provenance -->
        <div class="panel" style="padding: 10px; font-size: 12px;">
          <strong style="font-size: 13px; display: block; margin-bottom: 4px;">Clinical Provenance</strong>
          <div><strong>Source:</strong> ${escapeHtml(p.sourceSystem)}</div>
          <div><strong>Organization:</strong> ${escapeHtml(p.sourceOrganization)}</div>
          <div><strong>Recorded:</strong> <code>${escapeHtml(p.recordedTime)}</code></div>
        </div>

        <!-- Cross-Resource References -->
        <div class="panel" style="padding: 10px;">
          <strong style="font-size: 13px;">Referential Neighborhood</strong>
          ${linksHtml}
        </div>

        <!-- Raw JSON Payload -->
        <div>
          <div class="code-header">
            <span>Raw FHIR R4 JSON</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-copy='${JSON.stringify(r)}'>Copy JSON</button>
          </div>
          <pre class="code-block" style="max-height: 360px; overflow-y: auto;">${formatJSON(r)}</pre>
        </div>
      </div>
    `;

    openDrawer(`${data.resource.resourceType} / ${data.resource.id}`, html);
    bindInspectLinks();
    bindCopyButtons();
  }

  function bindInspectLinks() {
    document.querySelectorAll(".inspect-res-link").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const type = btn.getAttribute("data-type");
        const id = btn.getAttribute("data-id");
        if (type && id) {
          inspectResource(type, id);
        }
      });
    });
  }

  function bindCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const textToCopy = btn.getAttribute("data-copy") || (btn.previousElementSibling ? btn.previousElementSibling.textContent : "");
        if (btn.id === "api-copy-curl") {
          const curlText = document.getElementById("api-curl-box")?.textContent;
          if (curlText) copyToClipboard(curlText, btn);
          return;
        }
        if (btn.id === "api-copy-response") {
          const resText = document.getElementById("api-response-body")?.textContent;
          if (resText) copyToClipboard(resText, btn);
          return;
        }
        if (textToCopy) copyToClipboard(textToCopy, btn);
      });
    });
  }

  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = orig, 1800);
    });
  }

  // -------------------------------------------------------------------------
  // UTILITIES
  // -------------------------------------------------------------------------

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatJSON(json) {
    if (typeof json !== "string") {
      json = JSON.stringify(json, null, 2);
    }
    json = escapeHtml(json);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = "json-num";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-str";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-bool";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

})();

"""
HealthGraph: FHIR Healthcare Information System Explorer
Native Streamlit Cloud Application.

Provides an interactive clinical informatics interface powered directly
by HealthGraph deterministic Python core, NetworkX graph engine, and CDS rules.
"""

import streamlit as st
import json
import os
import pandas as pd
from healthgraph.api.routes import HealthGraphService
from healthgraph.core.cds import evaluate_cds_rules
from healthgraph.core.terminology import get_terminology_catalog

st.set_page_config(
    page_title="HealthGraph: FHIR Healthcare Information System",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Cool Clinical Palette)
st.markdown("""
<style>
    .main {
        background-color: #F8FAFC;
    }
    .stMetric {
        background-color: #FFFFFF;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #E2E8F0;
    }
    .alert-card-crit {
        background-color: #FFF1F2;
        border-left: 4px solid #E11D48;
        padding: 14px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
    .alert-card-warn {
        background-color: #FFFBEB;
        border-left: 4px solid #D97706;
        padding: 14px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
    .alert-card-info {
        background-color: #F0FDFA;
        border-left: 4px solid #0D9488;
        padding: 14px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def load_healthgraph_system():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    bundle_path = os.path.join(base_dir, "healthgraph", "data", "synthetic_bundle.json")
    service = HealthGraphService(bundle_path)
    return service


service = load_healthgraph_system()
repo = service.repo
graph = service.graph_engine
auditor = service.auditor
baseline_bundle = service.bundle

# Sidebar Navigation
st.sidebar.markdown("### 🩺 HealthGraph Core")
st.sidebar.caption("HL7 FHIR R4 Clinical Information System Explorer")

mode = st.sidebar.radio(
    "Clinical Workspaces",
    [
        "Patient Care Dossier & CDS",
        "Knowledge Graph Topology",
        "Referential Quality Audit",
        "Curated Terminology Maps",
        "Custom FHIR Bundle Ingestion"
    ]
)

st.sidebar.markdown("---")
st.sidebar.caption("Deterministic Python 3 Core • NetworkX • SQLite In-Memory")

# -----------------------------------------------------------------------------
# Workspace 1: Patient Care Dossier & CDS
# -----------------------------------------------------------------------------
if mode == "Patient Care Dossier & CDS":
    st.title("Longitudinal Patient Dossier & Decision Support")
    st.write(
        "Explore longitudinal patient trajectories, active conditions, pharmacotherapy, "
        "and point-of-care clinical decision support rules evaluated against the FHIR graph."
    )

    patients = repo.list_resources(resource_type="Patient")
    patient_options = {
        f"{p.get('name', [{}])[0].get('text', 'Patient')} ({p.get('id')})": p.get('id')
        for p in patients
    }

    selected_label = st.selectbox("Select Patient Subject", list(patient_options.keys()))
    selected_id = patient_options[selected_label]

    # Clinical Decision Support (CDS) Alerts
    alerts = evaluate_cds_rules(selected_id, repo)

    st.markdown("#### Clinical Decision Support (CDS) Intelligence")
    if not alerts:
        st.info("No active contraindications or clinical alerts detected for this patient.")
    else:
        for alert in alerts:
            sev = alert.get("severity")
            css_class = "alert-card-crit" if sev == "CRITICAL" else "alert-card-warn" if sev == "WARNING" else "alert-card-info"
            st.markdown(f"""
            <div class="{css_class}">
                <strong>[{alert.get('severity')}] {alert.get('title')}</strong><br/>
                <span style="color: #475569; font-size: 13px;">{alert.get('summary')}</span><br/>
                <div style="margin-top: 6px; font-size: 12px;">
                    <strong>Recommendation:</strong> {alert.get('recommendation')}<br/>
                    <em style="color: #64748B;">Guideline: {alert.get('guideline')}</em>
                </div>
            </div>
            """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    patient_res = repo.get_resource("Patient", selected_id)
    dob = patient_res.get("birthDate", "Unknown")
    gender = (patient_res.get("gender") or "Unknown").capitalize()

    col1.metric("Subject Identifier", selected_id)
    col2.metric("Date of Birth", dob)
    col3.metric("Gender", gender)

    st.markdown("---")

    # Biomarker Series
    st.markdown("#### Longitudinal Biomarker Series")
    obs_list = repo.list_resources(resource_type="Observation", patient_id=selected_id)
    series_data = {}
    for o in obs_list:
        code_text = o.get("code", {}).get("text") or "Laboratory Test"
        val = o.get("valueQuantity", {}).get("value")
        dt = o.get("effectiveDateTime", "")
        if val is not None and dt:
            series_data.setdefault(code_text, []).append({"Date": dt[:10], "Value": float(val)})

    if series_data:
        test_to_plot = st.selectbox("Select Biomarker Trajectory", list(series_data.keys()))
        df = pd.DataFrame(series_data[test_to_plot])
        df = df.sort_values("Date")
        st.line_chart(df.set_index("Date"))
    else:
        st.caption("No longitudinal biomarker observations recorded.")

    st.markdown("---")
    st.markdown("#### Active Prescriptions and Diagnoses")
    med_col, cond_col = st.columns(2)

    with med_col:
        st.caption("Active Medication Requests")
        meds = repo.list_resources(resource_type="MedicationRequest", patient_id=selected_id)
        for m in meds:
            text = m.get("medicationCodeableConcept", {}).get("text", "Prescription")
            st.markdown(f"- **{text}** (`{m.get('id')}`)")

    with cond_col:
        st.caption("Recorded Diagnoses (Conditions)")
        conds = repo.list_resources(resource_type="Condition", patient_id=selected_id)
        for c in conds:
            text = c.get("code", {}).get("text", "Condition")
            st.markdown(f"- **{text}** (`{c.get('id')}`)")

# -----------------------------------------------------------------------------
# Workspace 2: Knowledge Graph Topology
# -----------------------------------------------------------------------------
elif mode == "Knowledge Graph Topology":
    st.title("Relational Clinical Knowledge Graph")
    st.write(
        "HealthGraph reconstructs multi-directed relational networks where demographic, "
        "diagnostic, encounters, and therapeutic directives form interconnected edges."
    )

    metrics = graph.get_metrics()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Nodes", metrics.get("total_nodes"))
    c2.metric("Directed Edges", metrics.get("total_edges"))
    c3.metric("Graph Density", f"{metrics.get('density', 0):.4f}")
    c4.metric("Dangling References", len(metrics.get("dangling_targets", [])))

    st.markdown("#### Graph Neighborhood Inspector")
    node_types = ["Patient", "Encounter", "Observation", "Condition", "MedicationRequest"]
    sel_type = st.selectbox("Resource Type", node_types)
    resources = repo.list_resources(resource_type=sel_type)
    res_map = {f"{r.get('id')} ({r.get('title') or r.get('resourceType')})": r.get("id") for r in resources}
    if res_map:
        sel_res = st.selectbox("Select Resource Instance", list(res_map.keys()))
        res_id = res_map[sel_res]
        hood = graph.get_resource_neighborhood(sel_type, res_id)
        st.json(hood)

# -----------------------------------------------------------------------------
# Workspace 3: Referential Quality Audit
# -----------------------------------------------------------------------------
elif mode == "Referential Quality Audit":
    st.title("Multidimensional Data Quality Ledger")
    st.write(
        "Evaluate data quality across 6 measurable conformance dimensions: referential integrity, "
        "structural validity, temporal consistency, completeness, and terminology standardization."
    )

    audit = auditor.run_audit()
    dim_scores = audit.get("dimensionScores", {})

    cols = st.columns(len(dim_scores))
    for i, (dim, score) in enumerate(dim_scores.items()):
        cols[i].metric(dim.replace("_", " ").title(), f"{score:.1f}%")

    st.markdown("---")
    st.markdown("#### Intentional Quality Anomaly Ledger")
    issues = audit.get("issues", [])
    if issues:
        df_issues = pd.DataFrame(issues)
        st.dataframe(df_issues[["severity", "dimension", "resourceType", "resourceId", "message"]], use_container_width=True)
    else:
        st.success("No referential or structural anomalies detected.")

# -----------------------------------------------------------------------------
# Workspace 4: Curated Terminology Maps
# -----------------------------------------------------------------------------
elif mode == "Curated Terminology Maps":
    st.title("Standard Clinical Terminology Crosswalks")
    st.write(
        "Inspect standard code bindings across LOINC, SNOMED CT, RxNorm, and ICD-10-CM."
    )

    catalog = get_terminology_catalog()
    for domain, entries in catalog.items():
        st.markdown(f"#### {domain.replace('_', ' ').title()}")
        df_entries = pd.DataFrame(entries)
        st.dataframe(df_entries, use_container_width=True)

# -----------------------------------------------------------------------------
# Workspace 5: Custom FHIR Bundle Ingestion
# -----------------------------------------------------------------------------
elif mode == "Custom FHIR Bundle Ingestion":
    st.title("Synthetic FHIR Bundle Ingestion Engine")
    st.write(
        "Upload your own JSON FHIR bundle or patient records to trigger live schema validation, "
        "referential indexing, and graph reconstruction."
    )

    uploaded_file = st.file_uploader("Upload FHIR JSON File", type=["json"])
    if uploaded_file is not None:
        try:
            content = json.load(uploaded_file)
            if st.button("Ingest Payload into HealthGraph"):
                loaded = repo.load_bundle(content) if content.get("resourceType") == "Bundle" else repo.insert_resource(content)
                st.success(f"Successfully indexed resource payload into memory.")
        except Exception as e:
            st.error(f"Failed to parse JSON file: {str(e)}")

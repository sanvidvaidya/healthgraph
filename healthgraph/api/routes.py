"""
HealthGraph REST & FHIR R4 API Routes.

Exposes:
- Standard FHIR R4 endpoints (GET /fhir/metadata, GET /fhir/{type}, GET /fhir/{type}/{id})
- Dedicated Interoperability Lab pipeline endpoint (GET /api/interop/pipeline)
- Curated Terminology Explorer endpoint (GET /api/terminology)
- Deterministic Multi-attribute Search (GET /api/search)
- Transfer Readiness Analysis (GET /api/patient/{id}/transfer-readiness)
- Provenance Metadata inspection
- Synthetic Bundle Import & Export endpoints
"""

import json
from typing import Dict, Any, List, Optional
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from healthgraph.core.db import FHIRRepository
from healthgraph.core.resolver import ReferenceResolver
from healthgraph.core.graph import GraphEngine
from healthgraph.core.longitudinal import LongitudinalEngine
from healthgraph.core.quality import QualityAuditor
from healthgraph.core.validator import FHIRValidator
from healthgraph.core.provenance import ProvenanceEngine, TransferReadinessAnalyzer
from healthgraph.core.terminology import get_terminology_catalog, get_interoperability_lesson


def create_fhir_bundle_response(resources: List[Dict[str, Any]], total: Optional[int] = None) -> JSONResponse:
    """Wraps a list of resources into a compliant FHIR searchset Bundle."""
    entries = [{"fullUrl": f"urn:uuid:{r.get('resourceType')}-{r.get('id')}", "resource": r} for r in resources]
    bundle = {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(resources) if total is None else total,
        "entry": entries
    }
    return JSONResponse(bundle, headers={"Content-Type": "application/fhir+json; charset=utf-8"})


class HealthGraphService:
    """Stateful service orchestrating core engines, storage, and API handlers."""

    def __init__(self, bundle_path: str):
        self.bundle_path = bundle_path
        with open(bundle_path, "r", encoding="utf-8") as f:
            self.bundle = json.load(f)

        self.repo = FHIRRepository()
        self.repo.load_bundle(self.bundle)

        self.store: Dict[str, Dict[str, Any]] = {}
        self._sync_store_from_bundle()

        self.resolver = ReferenceResolver(self.store)
        self.resolver.rebuild_index()

        self.validator = FHIRValidator()
        self.graph_engine = GraphEngine(self.resolver)
        self.longitudinal_engine = LongitudinalEngine(self.store)
        self.auditor = QualityAuditor(self.store, self.resolver, self.validator)
        self.provenance_engine = ProvenanceEngine(self.store)
        self.transfer_analyzer = TransferReadinessAnalyzer(self.store, self.resolver._forward_links)

    def _sync_store_from_bundle(self):
        self.store.clear()
        for entry in self.bundle.get("entry", []):
            res = entry.get("resource")
            if res:
                self.store[f"{res['resourceType']}/{res['id']}"] = res

    def _rebuild_all_engines(self):
        """Re-initializes all core engines after a bundle import."""
        self._sync_store_from_bundle()
        self.resolver.set_store(self.store)
        self.graph_engine = GraphEngine(self.resolver)
        self.longitudinal_engine = LongitudinalEngine(self.store)
        self.auditor = QualityAuditor(self.store, self.resolver, self.validator)
        self.provenance_engine = ProvenanceEngine(self.store)
        self.transfer_analyzer = TransferReadinessAnalyzer(self.store, self.resolver._forward_links)

    # -------------------------------------------------------------------------
    # FHIR Standard Endpoints
    # -------------------------------------------------------------------------

    async def get_capability_statement(self, request: Request) -> JSONResponse:
        """GET /fhir/metadata - Conformance CapabilityStatement."""
        cs = {
            "resourceType": "CapabilityStatement",
            "id": "healthgraph-capability-statement",
            "status": "active",
            "date": "2026-03-01",
            "kind": "instance",
            "software": {
                "name": "HealthGraph Information Explorer",
                "version": "1.0.0",
                "releaseDate": "2026-03-01"
            },
            "implementation": {
                "description": "Educational subset of FHIR R4 focusing on reference graphs and longitudinal modeling."
            },
            "fhirVersion": "4.0.1",
            "format": ["application/fhir+json", "application/json"],
            "rest": [{
                "mode": "server",
                "documentation": "Educational FHIR R4 server demonstrating reference resolution, provenance, and data quality.",
                "security": {
                    "cors": True,
                    "description": "Educational synthetic demonstration. No credentials or authentication required."
                },
                "resource": [
                    {
                        "type": "Patient",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "name", "type": "string"}, {"name": "gender", "type": "token"}]
                    },
                    {
                        "type": "Encounter",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}, {"name": "status", "type": "token"}]
                    },
                    {
                        "type": "Observation",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}, {"name": "code", "type": "token"}]
                    },
                    {
                        "type": "Condition",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}]
                    },
                    {
                        "type": "Procedure",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}]
                    },
                    {
                        "type": "DiagnosticReport",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}]
                    },
                    {
                        "type": "MedicationRequest",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "patient", "type": "reference"}]
                    },
                    {
                        "type": "Practitioner",
                        "interaction": [{"code": "read"}, {"code": "search-type"}]
                    },
                    {
                        "type": "Organization",
                        "interaction": [{"code": "read"}, {"code": "search-type"}]
                    }
                ]
            }]
        }
        return JSONResponse(cs, headers={"Content-Type": "application/fhir+json; charset=utf-8"})

    async def get_fhir_resource_list(self, request: Request) -> JSONResponse:
        """GET /fhir/{resource_type} with standard search parameters."""
        res_type = request.path_params.get("resource_type")
        patient_param = request.query_params.get("patient") or request.query_params.get("subject")
        if patient_param and patient_param.startswith("Patient/"):
            patient_param = patient_param.split("Patient/")[1]

        name_param = request.query_params.get("name")
        code_param = request.query_params.get("code")

        results = self.repo.search_resources(
            resource_type=res_type,
            patient_id=patient_param,
            query=name_param,
            code=code_param
        )
        raw_list = [r["resource"] for r in results]
        return create_fhir_bundle_response(raw_list)

    async def get_fhir_resource_instance(self, request: Request) -> Response:
        """GET /fhir/{resource_type}/{id}."""
        res_type = request.path_params.get("resource_type")
        res_id = request.path_params.get("id")

        res = self.repo.get_resource(res_type, res_id)
        if not res:
            oo = {
                "resourceType": "OperationOutcome",
                "issue": [{
                    "severity": "error",
                    "code": "not-found",
                    "diagnostics": f"Resource {res_type}/{res_id} not found in repository."
                }]
            }
            return JSONResponse(oo, status_code=404, headers={"Content-Type": "application/fhir+json"})

        return JSONResponse(res, headers={"Content-Type": "application/fhir+json; charset=utf-8"})

    # -------------------------------------------------------------------------
    # Explorer Application Endpoints
    # -------------------------------------------------------------------------

    async def api_get_system_stats(self, request: Request) -> JSONResponse:
        """System statistics and high-level inventory."""
        counts = self.repo.count_by_type()
        patients = self.repo.get_all_patients()
        dangling = len(self.resolver.get_dangling_references())
        orphans = len(self.resolver.get_orphan_resources())

        return JSONResponse({
            "totalResources": sum(counts.values()),
            "countsByType": counts,
            "patientCount": len(patients),
            "danglingReferencesCount": dangling,
            "orphanResourcesCount": orphans,
            "fhirVersion": "4.0.1 (R4)"
        })

    async def api_list_patients(self, request: Request) -> JSONResponse:
        """Enhanced patient cohort list with summary demographics and counts."""
        patients = self.repo.get_all_patients()
        enriched = []
        for p in patients:
            pid = p.get("id")
            res_list = self.repo.list_resource_summaries(patient_id=pid)
            enc_count = sum(1 for r in res_list if r["resource_type"] == "Encounter")
            cond_count = sum(1 for r in res_list if r["resource_type"] == "Condition")
            obs_count = sum(1 for r in res_list if r["resource_type"] == "Observation")
            med_count = sum(1 for r in res_list if r["resource_type"] == "MedicationRequest")

            name = "Unknown Patient"
            if p.get("name"):
                n = p["name"][0]
                name = f"{' '.join(n.get('given', []))} {n.get('family', '')}".strip()

            mrn = None
            for ident in p.get("identifier", []):
                if ident.get("value"):
                    mrn = ident.get("value")
                    break

            # Transfer readiness quick status
            transfer_eval = self.transfer_analyzer.evaluate_patient(pid)

            enriched.append({
                "id": pid,
                "name": name,
                "mrn": mrn or "N/A",
                "gender": p.get("gender", "unknown"),
                "birthDate": p.get("birthDate") or "Not Recorded",
                "active": p.get("active", True),
                "managingOrg": (p.get("managingOrganization") or {}).get("display", "Metropolitan Health"),
                "counts": {
                    "encounters": enc_count,
                    "conditions": cond_count,
                    "observations": obs_count,
                    "medications": med_count,
                    "total": len(res_list)
                },
                "transferStatus": transfer_eval["transferStatus"],
                "transferReady": transfer_eval["isReady"]
            })

        return JSONResponse(enriched)

    async def api_get_patient_dossier(self, request: Request) -> JSONResponse:
        """Complete clinical longitudinal dossier for a single patient."""
        pid = request.path_params.get("id")
        patient_res = self.repo.get_resource("Patient", pid)
        if not patient_res:
            return JSONResponse({"error": f"Patient {pid} not found"}, status_code=404)

        all_patient_res = self.repo.list_resources(patient_id=pid)

        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for r in all_patient_res:
            rt = r["resourceType"]
            if rt not in grouped:
                grouped[rt] = []
            grouped[rt].append(r)

        timeline = self.longitudinal_engine.get_patient_timeline(pid)
        subgraph = self.graph_engine.get_patient_subgraph(pid)
        transfer_readiness = self.transfer_analyzer.evaluate_patient(pid)

        return JSONResponse({
            "patient": patient_res,
            "resourcesByType": grouped,
            "totalResources": len(all_patient_res),
            "timeline": timeline,
            "subgraph": subgraph,
            "transferReadiness": transfer_readiness
        })

    async def api_list_resources(self, request: Request) -> JSONResponse:
        """Facilitated catalog with search and facets."""
        res_type = request.query_params.get("type")
        patient_id = request.query_params.get("patient")
        summaries = self.repo.list_resource_summaries(resource_type=res_type, patient_id=patient_id)
        return JSONResponse(summaries)

    async def api_get_resource_detail(self, request: Request) -> JSONResponse:
        """Detailed resource inspection with validation, provenance, and neighborhood links."""
        res_type = request.path_params.get("resource_type")
        res_id = request.path_params.get("id")

        res = self.repo.get_resource(res_type, res_id)
        if not res:
            return JSONResponse({"error": "Resource not found"}, status_code=404)

        val_report = self.validator.validate_resource(res)
        neighborhood = self.graph_engine.get_resource_neighborhood(res_type, res_id)
        provenance = self.provenance_engine.get_provenance_for_resource(res_type, res_id)

        forward = [l.to_dict() for l in self.resolver.get_forward_links(res_type, res_id)]
        reverse = [l.to_dict() for l in self.resolver.get_reverse_links(res_type, res_id)]

        return JSONResponse({
            "resource": res,
            "validation": val_report.to_dict(),
            "provenance": provenance.to_dict(),
            "neighborhood": neighborhood,
            "forwardLinks": forward,
            "reverseLinks": reverse
        })

    async def api_get_graph(self, request: Request) -> JSONResponse:
        """GET /api/graph - Complete knowledge graph serialization."""
        data = self.graph_engine.get_full_graph_data()
        return JSONResponse(data)

    async def api_get_patient_graph(self, request: Request) -> JSONResponse:
        """GET /api/graph/patient/{id} - Patient-centric ego network."""
        pid = request.path_params.get("id")
        data = self.graph_engine.get_patient_subgraph(pid)
        return JSONResponse(data)

    async def api_get_patient_timeline(self, request: Request) -> JSONResponse:
        """GET /api/timeline/patient/{id} - Ordered timeline & biomarker series."""
        pid = request.path_params.get("id")
        data = self.longitudinal_engine.get_patient_timeline(pid)
        return JSONResponse(data)

    async def api_get_quality_audit(self, request: Request) -> JSONResponse:
        """GET /api/quality/audit - Multidimensional data quality report and issue ledger."""
        audit_data = self.auditor.run_audit()
        return JSONResponse(audit_data)

    async def api_get_terminology(self, request: Request) -> JSONResponse:
        """GET /api/terminology - Curated terminology catalog and educational lessons."""
        catalog = get_terminology_catalog()
        lesson = get_interoperability_lesson()
        return JSONResponse({"catalog": catalog, "lesson": lesson})

    async def api_get_search(self, request: Request) -> JSONResponse:
        """GET /api/search - Deterministic multi-criteria search."""
        query = request.query_params.get("q")
        res_type = request.query_params.get("type")
        patient_id = request.query_params.get("patient")
        code = request.query_params.get("code")
        status = request.query_params.get("status")

        results = self.repo.search_resources(
            query=query,
            resource_type=res_type,
            patient_id=patient_id,
            code=code,
            status=status
        )
        return JSONResponse({"totalMatches": len(results), "results": results})

    async def api_get_patient_transfer_readiness(self, request: Request) -> JSONResponse:
        """GET /api/patient/{id}/transfer-readiness."""
        pid = request.path_params.get("id")
        eval_res = self.transfer_analyzer.evaluate_patient(pid)
        return JSONResponse(eval_res)

    async def api_get_patient_cds_alerts(self, request: Request) -> JSONResponse:
        """GET /api/patient/{id}/cds-alerts - Evaluates real-time CDS rules."""
        pid = request.path_params.get("id")
        from healthgraph.core.cds import evaluate_cds_rules
        alerts = evaluate_cds_rules(pid, self.repo)
        return JSONResponse({
            "patientId": pid,
            "totalAlerts": len(alerts),
            "criticalCount": sum(1 for a in alerts if a.get("severity") == "CRITICAL"),
            "warningCount": sum(1 for a in alerts if a.get("severity") == "WARNING"),
            "infoCount": sum(1 for a in alerts if a.get("severity") == "INFO"),
            "alerts": alerts
        })

    async def api_get_patient_prior_auth_readiness(self, request: Request) -> JSONResponse:
        """GET /api/patient/{id}/prior-auth-readiness - Evaluates Da Vinci CRD/DTR prior auth."""
        pid = request.path_params.get("id")
        from healthgraph.core.cds import evaluate_prior_auth_readiness
        eval_result = evaluate_prior_auth_readiness(pid, self.repo)
        return JSONResponse(eval_result)

    async def api_get_patient_hcc_gaps(self, request: Request) -> JSONResponse:
        """GET /api/patient/{id}/hcc-gaps - Evaluates HCC Risk Adjustment & HEDIS gaps."""
        pid = request.path_params.get("id")
        from healthgraph.core.cds import evaluate_hcc_and_hedis_gaps
        eval_result = evaluate_hcc_and_hedis_gaps(pid, self.repo)
        return JSONResponse(eval_result)

    async def api_get_patient_medication_rec(self, request: Request) -> JSONResponse:
        """GET /api/patient/{id}/medication-rec - Evaluates Medication Rec and PDC adherence."""
        pid = request.path_params.get("id")
        from healthgraph.core.cds import evaluate_medication_reconciliation
        eval_result = evaluate_medication_reconciliation(pid, self.repo)
        return JSONResponse(eval_result)

    async def api_get_chaos_scenarios(self, request: Request) -> JSONResponse:
        """GET /api/chaos/scenarios - Returns catalog of real-world healthcare chaos scenarios."""
        from healthgraph.core.chaos import get_chaos_scenarios
        return JSONResponse(get_chaos_scenarios())

    async def api_get_trials_screen(self, request: Request) -> JSONResponse:
        """GET /api/trials/screen - Screens cohort against clinical trial protocols."""
        from healthgraph.core.trials import screen_cohort_for_trials
        return JSONResponse(screen_cohort_for_trials(self.repo))

    async def api_get_interop_pipeline(self, request: Request) -> JSONResponse:

        """
        GET /api/interop/pipeline - Step-by-step pipeline inspection data.
        Demonstrates: SOURCE -> BUNDLE -> INGESTION -> VALIDATION -> RESOLUTION ->
        NORMALIZATION -> RELATIONSHIPS -> LONGITUDINAL -> OPERATIONAL READINESS.
        """
        example_patient = "PAT-VANCE-01"
        vance_res = self.store.get(f"Patient/{example_patient}")
        vance_enc = self.store.get("Encounter/ENC-VANCE-2023-03")
        vance_obs = self.store.get("Observation/OBS-VANCE-A1C-1")
        dangling_med = self.store.get("MedicationRequest/MED-ANOMALY-DANGLING-PRAC")

        obs_val = self.validator.validate_resource(vance_obs)
        dangling_val = self.validator.validate_resource(dangling_med)

        stages = [
            {
                "stageNumber": 1,
                "title": "Originating Source Systems",
                "description": "Clinical data originates across disparate EHR systems, commercial labs, and clinics.",
                "artifacts": [
                    {
                        "name": "Metropolitan Health Epic EHR",
                        "type": "Inpatient / Ambulatory EHR",
                        "emits": "Patient, Encounter, Condition, MedicationRequest"
                    },
                    {
                        "name": "Precision Diagnostic Laboratories LIMS",
                        "type": "Laboratory Information System",
                        "emits": "Observation (HbA1c, eGFR, Troponin) with LOINC codes"
                    }
                ]
            },
            {
                "stageNumber": 2,
                "title": "Raw FHIR Bundle Packaging",
                "description": "Systems serialize records into a FHIR R4 Bundle for transport.",
                "sampleJson": {
                    "resourceType": "Bundle",
                    "id": "HEALTHGRAPH-SYNTHETIC-R4-BUNDLE",
                    "type": "collection",
                    "total": len(self.store),
                    "sampleEntry": vance_obs
                }
            },
            {
                "stageNumber": 3,
                "title": "3-Layer Validation Execution",
                "description": "Evaluates Structural (Layer 1), Resource-Specific (Layer 2), and Interoperability (Layer 3) conformance.",
                "sampleValidReport": obs_val.to_dict(),
                "sampleIssueReport": dangling_val.to_dict()
            },
            {
                "stageNumber": 4,
                "title": "Provenance & Attribution Attachment",
                "description": "Attaches metadata identifying source organization, recording clinician, and ingestion event.",
                "provenanceRecord": self.provenance_engine.get_provenance_for_resource("Observation", "OBS-VANCE-A1C-1").to_dict()
            },
            {
                "stageNumber": 5,
                "title": "Reference Resolution & Link Indexing",
                "description": "Matches relative pointers ('Patient/pat-1') to target entities, detects dangling foreign keys.",
                "metrics": {
                    "totalReferences": len(self.resolver._forward_links),
                    "danglingCount": len(self.resolver.get_dangling_references()),
                    "orphanCount": len(self.resolver.get_orphan_resources())
                }
            },
            {
                "stageNumber": 6,
                "title": "Normalization & Relational Caching",
                "description": "Stores normalized records in SQLite with indexes on resourceType, patientId, encounterId, and date.",
                "tableCounts": self.repo.count_by_type()
            },
            {
                "stageNumber": 7,
                "title": "Relationship Graph Reconstruction",
                "description": "Builds multi-directed knowledge graph in NetworkX with clinical predicate edges.",
                "metrics": self.graph_engine.get_metrics()
            },
            {
                "stageNumber": 8,
                "title": "Longitudinal Patient Trajectory",
                "description": "Orders clinical events chronologically and extracts biomarker time-series (e.g. HbA1c progression).",
                "trajectory": self.longitudinal_engine.get_patient_timeline("PAT-VANCE-01")
            },
            {
                "stageNumber": 9,
                "title": "Operational Interoperability Decision",
                "description": "Assesses if longitudinal data is complete and referentially safe for outbound clinical transfer.",
                "transferAssessment": self.transfer_analyzer.evaluate_patient("PAT-VANCE-01")
            }
        ]

        return JSONResponse({
            "pipelineTitle": "HealthGraph Information Pipeline Architecture",
            "stages": stages,
            "distinctionExplanation": {
                "syntacticValidity": "Valid JSON syntax and primitive structures.",
                "structuralValidity": "Valid FHIR R4 resourceType and schema elements.",
                "referentialIntegrity": "All target pointers resolve to actual existing entities.",
                "semanticUsefulness": "Standard terminologies, sensible timestamps, and complete clinical context."
            }
        })

    async def _read_capped_json(self, request: Request, max_bytes: int = 10 * 1024 * 1024):
        """Safely reads and decodes JSON body, preventing memory exhaustion attacks."""
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > max_bytes:
                    return None, JSONResponse({"error": "Payload too large. Maximum allowed size is 10 MB."}, status_code=413)
            except ValueError:
                return None, JSONResponse({"error": "Invalid Content-Length header."}, status_code=400)

        body_bytes = await request.body()
        if len(body_bytes) > max_bytes:
            return None, JSONResponse({"error": "Payload too large. Maximum allowed size is 10 MB."}, status_code=413)

        try:
            return json.loads(body_bytes.decode("utf-8")), None
        except Exception as e:
            return None, JSONResponse({"error": f"Invalid JSON syntax: {str(e)}"}, status_code=400)

    async def api_post_validate(self, request: Request) -> JSONResponse:
        """POST /api/validate - Custom FHIR JSON payload validation."""
        body, err = await self._read_capped_json(request)
        if err:
            return err

        report = self.validator.validate_resource(body)
        return JSONResponse(report.to_dict())

    async def api_post_bundle_import(self, request: Request) -> JSONResponse:
        """POST /api/bundle/import - Ingests a new synthetic or uploaded FHIR Bundle live."""
        body, err = await self._read_capped_json(request)
        if err:
            return err

        # Allow single resource or Bundle
        if isinstance(body, dict) and body.get("resourceType") != "Bundle":
            body = {
                "resourceType": "Bundle",
                "type": "collection",
                "entry": [{"resource": body}]
            }

        if not isinstance(body, dict) or body.get("resourceType") != "Bundle":
            return JSONResponse({"error": "Payload must be a FHIR Resource or Bundle"}, status_code=400)

        mode = request.query_params.get("mode", "merge")
        if mode == "replace":
            self.repo.clear_all()
            self.bundle = body
        else:
            # Merge into bundle
            existing_keys = {
                f"{e['resource']['resourceType']}/{e['resource']['id']}" 
                for e in self.bundle.get("entry", []) if "resource" in e
            }
            for e in body.get("entry", []):
                r = e.get("resource")
                if r:
                    key = f"{r.get('resourceType')}/{r.get('id')}"
                    if key not in existing_keys:
                        self.bundle.setdefault("entry", []).append({"resource": r})
                        existing_keys.add(key)

        loaded_count = self.repo.load_bundle(body)
        self._rebuild_all_engines()

        # Find newly imported patient ID if present
        imported_patients = [
            e["resource"]["id"] for e in body.get("entry", []) 
            if e.get("resource", {}).get("resourceType") == "Patient"
        ]

        return JSONResponse({
            "message": f"Successfully ingested {loaded_count} FHIR resources.",
            "totalResources": len(self.store),
            "importedPatientId": imported_patients[0] if imported_patients else None,
            "countsByType": self.repo.count_by_type(),
            "status": "success"
        })

    async def api_post_bundle_reset(self, request: Request) -> JSONResponse:
        """POST /api/bundle/reset - Restores the baseline synthetic bundle."""
        with open(self.bundle_path, "r", encoding="utf-8") as f:
            self.bundle = json.load(f)
        self.repo.clear_all()
        loaded_count = self.repo.load_bundle(self.bundle)
        self._rebuild_all_engines()
        return JSONResponse({
            "message": f"Reset to default cohort ({loaded_count} resources).",
            "totalResources": len(self.store),
            "status": "success"
        })

    async def api_get_bundle_export(self, request: Request) -> JSONResponse:
        """GET /api/bundle/export - Exports current synthetic bundle or filtered subset."""
        patient_id = request.query_params.get("patient")
        if patient_id:
            resources = self.repo.list_resources(patient_id=patient_id)
            bundle = {
                "resourceType": "Bundle",
                "id": f"EXPORT-PATIENT-{patient_id}",
                "type": "collection",
                "total": len(resources),
                "entry": [{"fullUrl": f"urn:uuid:{r.get('resourceType')}-{r.get('id')}", "resource": r} for r in resources]
            }
            return JSONResponse(bundle, headers={"Content-Disposition": f"attachment; filename=patient_{patient_id}_export.json"})

        return JSONResponse(self.bundle, headers={"Content-Disposition": "attachment; filename=healthgraph_synthetic_bundle.json"})

"""
HealthGraph Application Server & Entrypoint.

Starts the Starlette ASGI application serving the educational UI and FHIR R4 API.
"""

import os
import sys
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, FileResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

# Ensure healthgraph is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from healthgraph.api.routes import HealthGraphService

BUNDLE_PATH = os.path.join(BASE_DIR, "data", "synthetic_bundle.json")
UI_DIR = os.path.join(BASE_DIR, "ui")
STATIC_DIR = os.path.join(UI_DIR, "static")
DIST_DIR = os.path.join(PARENT_DIR, "frontend", "dist")
DIST_ASSETS = os.path.join(DIST_DIR, "assets")

service = HealthGraphService(BUNDLE_PATH)


async def serve_index(request):
    """Serves the single-page HealthGraph application shell (React SPA or fallback)."""
    dist_index = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(dist_index) and request.query_params.get("view") != "classic":
        with open(dist_index, "r", encoding="utf-8") as f:
            html = f.read()
        return HTMLResponse(html)

    classic_index = os.path.join(UI_DIR, "index.html")
    with open(classic_index, "r", encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(html)


routes = [
    # UI Shell & Assets
    Route("/", endpoint=serve_index),
    Mount("/static", app=StaticFiles(directory=STATIC_DIR), name="static"),
]

if os.path.exists(DIST_ASSETS):
    routes.append(Mount("/assets", app=StaticFiles(directory=DIST_ASSETS), name="assets"))

routes.extend([

    # FHIR Standard Endpoints
    Route("/fhir/metadata", endpoint=service.get_capability_statement, methods=["GET"]),
    Route("/fhir/{resource_type}", endpoint=service.get_fhir_resource_list, methods=["GET"]),
    Route("/fhir/{resource_type}/{id}", endpoint=service.get_fhir_resource_instance, methods=["GET"]),

    # Application Explorer Endpoints
    Route("/api/stats", endpoint=service.api_get_system_stats, methods=["GET"]),
    Route("/api/patients", endpoint=service.api_list_patients, methods=["GET"]),
    Route("/api/patient/{id}/dossier", endpoint=service.api_get_patient_dossier, methods=["GET"]),
    Route("/api/patient/{id}/cds-alerts", endpoint=service.api_get_patient_cds_alerts, methods=["GET"]),
    Route("/api/patients/{id}/cds-alerts", endpoint=service.api_get_patient_cds_alerts, methods=["GET"]),
    Route("/api/patient/{id}/transfer-readiness", endpoint=service.api_get_patient_transfer_readiness, methods=["GET"]),
    Route("/api/resources", endpoint=service.api_list_resources, methods=["GET"]),
    Route("/api/resource/{resource_type}/{id}", endpoint=service.api_get_resource_detail, methods=["GET"]),
    Route("/api/graph", endpoint=service.api_get_graph, methods=["GET"]),
    Route("/api/graph/patient/{id}", endpoint=service.api_get_patient_graph, methods=["GET"]),
    Route("/api/timeline/patient/{id}", endpoint=service.api_get_patient_timeline, methods=["GET"]),
    Route("/api/quality/audit", endpoint=service.api_get_quality_audit, methods=["GET"]),
    Route("/api/validate", endpoint=service.api_post_validate, methods=["POST"]),
    Route("/api/interop/pipeline", endpoint=service.api_get_interop_pipeline, methods=["GET"]),
    Route("/api/terminology", endpoint=service.api_get_terminology, methods=["GET"]),
    Route("/api/search", endpoint=service.api_get_search, methods=["GET"]),
    Route("/api/bundle/import", endpoint=service.api_post_bundle_import, methods=["POST"]),
    Route("/api/bundle/reset", endpoint=service.api_post_bundle_reset, methods=["POST"]),
    Route("/api/bundle/export", endpoint=service.api_get_bundle_export, methods=["GET"]),
])

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
]

app = Starlette(debug=True, routes=routes, middleware=middleware)


def run(host: str = "127.0.0.1", port: int = 8000):
    import uvicorn
    print("=" * 70)
    print("  HEALTHGRAPH: FHIR-Based Healthcare Information System Explorer")
    print("  Authoritative clinical data modeling, reference graph and timelines")
    print(f"  Server URL: http://{host}:{port}")
    print("=" * 70)
    uvicorn.run("healthgraph.app:app", host=host, port=port, log_level="info", reload=False)


if __name__ == "__main__":
    run()

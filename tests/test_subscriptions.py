"""
Tests for HealthGraph Real-time FHIR R4 Subscriptions & REST Hooks Engine.
Uses lightweight async requests without external test client dependencies.
"""

import json
import asyncio
import os
import pytest
from starlette.requests import Request

from healthgraph.api.routes import HealthGraphService
from healthgraph.core.db import FHIRRepository
from healthgraph.core.subscriptions import SubscriptionEngine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE_PATH = os.path.join(BASE_DIR, "healthgraph", "data", "synthetic_bundle.json")


def make_mock_request(
    path: str = "/",
    method: str = "GET",
    path_params: dict = None,
    query_params: dict = None,
    body: bytes = b"",
    headers: list = None
) -> Request:
    """Builds a lightweight Starlette Request object for unit testing."""
    hdr_list = [(b"host", b"localhost"), (b"content-type", b"application/json")]
    if headers:
        hdr_list.extend(headers)
    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "headers": hdr_list,
        "path_params": path_params or {},
        "query_string": "&".join(f"{k}={v}" for k, v in (query_params or {}).items()).encode("utf-8"),
    }
    async def receive():
        return {"type": "http.request", "body": body}
    req = Request(scope, receive)
    if path_params:
        req._path_params = path_params
    return req


@pytest.fixture
def standalone_engine():
    repo = FHIRRepository()
    store = {}
    return SubscriptionEngine(repo, store)


@pytest.fixture
def populated_engine():
    with open(BUNDLE_PATH, "r", encoding="utf-8") as f:
        bundle = json.load(f)
    repo = FHIRRepository()
    repo.load_bundle(bundle)
    store = {}
    for entry in bundle.get("entry", []):
        res = entry.get("resource")
        if res:
            store[f"{res['resourceType']}/{res['id']}"] = res
    return SubscriptionEngine(repo, store)


@pytest.fixture
def service():
    return HealthGraphService(BUNDLE_PATH)


def test_default_subscriptions_seeded(standalone_engine):
    subs = standalone_engine.list_subscriptions()
    sub_ids = [s["id"] for s in subs]
    assert "sub-renal-metformin-guard" in sub_ids
    assert "sub-glycemic-trajectory-watch" in sub_ids
    assert "sub-pharmacotherapy-safety-gate" in sub_ids
    # Verify private secret is not exposed in public list
    for s in subs:
        assert "_secret" not in s.get("channel", {})


def test_subscription_crud(standalone_engine):
    new_sub = {
        "id": "sub-custom-cardio",
        "status": "active",
        "reason": "Surveillance for troponin elevations post-CABG",
        "criteria": "Observation?code=10839-9",
        "channel": {
            "type": "rest-hook",
            "endpoint": "https://test.healthgraph.dev/hook",
            "secret": "test-secret-key"
        }
    }
    created = standalone_engine.create_subscription(new_sub)
    assert created["id"] == "sub-custom-cardio"
    assert created["status"] == "active"

    fetched = standalone_engine.get_subscription("sub-custom-cardio")
    assert fetched is not None
    assert fetched["reason"] == "Surveillance for troponin elevations post-CABG"

    # Update
    updated = standalone_engine.update_subscription("sub-custom-cardio", {"status": "off"})
    assert updated["status"] == "off"

    # Delete
    deleted = standalone_engine.delete_subscription("sub-custom-cardio")
    assert deleted is True
    assert standalone_engine.get_subscription("sub-custom-cardio") is None


def test_criteria_matching(standalone_engine):
    obs_egfr = {
        "resourceType": "Observation",
        "id": "obs-1",
        "code": {"coding": [{"system": "http://loinc.org", "code": "33914-3"}]},
        "subject": {"reference": "Patient/PAT-VANCE-01"},
        "status": "final"
    }

    # Matches code and patient
    assert standalone_engine.matches_criteria("Observation?code=33914-3", obs_egfr) is True
    assert standalone_engine.matches_criteria("Observation?code=33914-3,48642-3", obs_egfr) is True
    assert standalone_engine.matches_criteria("Observation?code=33914-3&patient=PAT-VANCE-01", obs_egfr) is True

    # Fails different resource type or code or patient
    assert standalone_engine.matches_criteria("MedicationRequest?status=active", obs_egfr) is False
    assert standalone_engine.matches_criteria("Observation?code=4548-4", obs_egfr) is False
    assert standalone_engine.matches_criteria("Observation?code=33914-3&patient=PAT-THORNE-02", obs_egfr) is False


def test_hmac_signature_verification():
    payload = b'{"event":"clinical_observation","patient":"PAT-VANCE-01"}'
    secret = "clinical-safety-secret"

    sig = SubscriptionEngine.compute_signature(payload, secret)
    assert sig.startswith("sha256=")

    # Valid
    assert SubscriptionEngine.verify_signature(payload, sig, secret) is True
    # Tampered payload
    assert SubscriptionEngine.verify_signature(b'{"event":"tampered"}', sig, secret) is False
    # Wrong secret
    assert SubscriptionEngine.verify_signature(payload, sig, "wrong-key") is False


def test_realtime_renal_contraindication_trigger(populated_engine):
    # Simulate acute eGFR drop for Eleanor Vance (who is on Metformin)
    res = populated_engine.simulate_clinical_event("PAT-VANCE-01", "renal_drop", {"egfr": 23.5})

    assert "sub-renal-metformin-guard" in res["matchedSubscriptions"]
    assert len(res["dispatches"]) >= 1

    crit_ids = [a["id"] for a in res["criticalAlerts"]]
    assert "CDS-RENAL-METFORMIN-CRIT" in crit_ids

    crit_alert = next(a for a in res["criticalAlerts"] if a["id"] == "CDS-RENAL-METFORMIN-CRIT")
    assert "23.5" in crit_alert["summary"]
    assert crit_alert["severity"] == "CRITICAL"
    assert "lactic acidosis" in crit_alert["summary"].lower()


def test_realtime_glycemic_spike_trigger(populated_engine):
    # Simulate HbA1c surge to 9.5%
    res = populated_engine.simulate_clinical_event("PAT-VANCE-01", "glycemic_spike", {"hba1c": 9.5})

    assert "sub-glycemic-trajectory-watch" in res["matchedSubscriptions"]
    warn_ids = [a["id"] for a in res["alerts"] if a.get("severity") == "WARNING"]
    assert "CDS-GLYCEMIC-CONTROL-WARN" in warn_ids


def test_realtime_unresolved_practitioner_trigger(populated_engine):
    # Simulate prescription with dangling practitioner reference
    res = populated_engine.simulate_clinical_event("PAT-VANCE-01", "unresolved_provider_order")

    assert "sub-pharmacotherapy-safety-gate" in res["matchedSubscriptions"]
    crit_ids = [a["id"] for a in res["criticalAlerts"]]
    assert any("CDS-INTEGRITY-MISSING-PRAC" in cid for cid in crit_ids)


def test_api_fhir_subscription_routes(service):
    async def run_async():
        # GET /fhir/Subscription
        req = make_mock_request(path="/fhir/Subscription", method="GET")
        resp = await service.get_fhir_subscriptions(req)
        assert resp.status_code == 200
        bundle = json.loads(resp.body.decode())
        assert bundle["resourceType"] == "Bundle"
        assert bundle["type"] == "searchset"
        assert bundle["total"] >= 3

        # GET /fhir/Subscription/sub-renal-metformin-guard
        req = make_mock_request(path="/fhir/Subscription/sub-renal-metformin-guard", method="GET", path_params={"id": "sub-renal-metformin-guard"})
        resp = await service.get_fhir_subscription_instance(req)
        assert resp.status_code == 200
        sub = json.loads(resp.body.decode())
        assert sub["id"] == "sub-renal-metformin-guard"
        assert sub["status"] == "active"

        # POST /fhir/Subscription
        new_sub = {
            "id": "sub-api-test",
            "status": "requested",
            "reason": "API endpoint test subscription",
            "criteria": "Observation?code=12345-6",
            "channel": {"type": "rest-hook", "endpoint": "https://api.test/webhook"}
        }
        req = make_mock_request(path="/fhir/Subscription", method="POST", body=json.dumps(new_sub).encode())
        resp = await service.post_fhir_subscription(req)
        assert resp.status_code == 201
        assert resp.headers["Location"] == "/fhir/Subscription/sub-api-test"

        # PUT /fhir/Subscription/sub-api-test
        req = make_mock_request(path="/fhir/Subscription/sub-api-test", method="PUT", path_params={"id": "sub-api-test"}, body=json.dumps({"status": "off"}).encode())
        resp = await service.put_fhir_subscription(req)
        assert resp.status_code == 200
        assert json.loads(resp.body.decode())["status"] == "off"

        # DELETE /fhir/Subscription/sub-api-test
        req = make_mock_request(path="/fhir/Subscription/sub-api-test", method="DELETE", path_params={"id": "sub-api-test"})
        resp = await service.delete_fhir_subscription(req)
        assert resp.status_code == 204

    asyncio.run(run_async())


def test_api_simulate_and_audit_routes(service):
    async def run_async():
        # POST /api/subscriptions/simulate
        sim_body = {
            "patient_id": "PAT-VANCE-01",
            "event_type": "renal_drop",
            "custom_data": {"egfr": 21.0}
        }
        req = make_mock_request(path="/api/subscriptions/simulate", method="POST", body=json.dumps(sim_body).encode())
        resp = await service.api_post_subscription_simulate(req)
        assert resp.status_code == 200
        sim_res = json.loads(resp.body.decode())
        assert "sub-renal-metformin-guard" in sim_res["matchedSubscriptions"]
        assert any(a["id"] == "CDS-RENAL-METFORMIN-CRIT" for a in sim_res["criticalAlerts"])

        # GET /api/subscriptions/audit-log
        req = make_mock_request(path="/api/subscriptions/audit-log", method="GET")
        resp = await service.api_get_subscription_audit_log(req)
        assert resp.status_code == 200
        audit = json.loads(resp.body.decode())
        assert audit["total"] >= 1
        assert len(audit["audit_entries"]) >= 1
        first_entry = audit["audit_entries"][0]
        assert first_entry["patientId"] == "PAT-VANCE-01"
        assert "sub-renal-metformin-guard" in first_entry["matchedSubscriptions"]

    asyncio.run(run_async())

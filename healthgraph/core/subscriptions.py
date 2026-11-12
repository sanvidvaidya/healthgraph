"""
HealthGraph Real-time FHIR R4 Subscriptions & REST Hooks Engine.

Implements the HL7 FHIR R4 Subscription specification:
- Subscription lifecycle (requested, active, error, off)
- Criteria parsing and matching for clinical event surveillance
- REST Hook payload construction and HMAC SHA-256 signature verification
- Real-time trigger evaluation: runs deterministic CDS safety and contraindication rules
  upon EHR updates (vitals, labs, medications)
- In-memory audit trail of clinical notifications and dispatches
"""

import hmac
import hashlib
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid

from healthgraph.core.cds import evaluate_cds_rules, evaluate_prior_auth_readiness, evaluate_medication_reconciliation


class SubscriptionEngine:
    """Manages FHIR R4 Subscriptions and dispatches REST Hooks on clinical updates."""

    def __init__(self, repo, store, rebuilder_callback=None):
        self.repo = repo
        self.store = store
        self.rebuilder_callback = rebuilder_callback
        self.subscriptions: Dict[str, Dict[str, Any]] = {}
        self.audit_log: List[Dict[str, Any]] = []
        self._seed_default_subscriptions()

    def _seed_default_subscriptions(self):
        """Seeds standard clinical safety and surveillance subscriptions."""
        default_subs = [
            {
                "resourceType": "Subscription",
                "id": "sub-renal-metformin-guard",
                "status": "active",
                "reason": "Surveillance for eGFR decline and acute renal contraindications with active Metformin therapy",
                "criteria": "Observation?code=33914-3,48642-3,48643-1,62238-1",
                "channel": {
                    "type": "rest-hook",
                    "endpoint": "https://ehr.healthgraph.dev/webhook/cds-renal",
                    "payload": "application/fhir+json",
                    "header": ["Authorization: Bearer test-renal-token-2026"],
                    "_secret": "healthgraph-renal-hmac-secret"
                }
            },
            {
                "resourceType": "Subscription",
                "id": "sub-glycemic-trajectory-watch",
                "status": "active",
                "reason": "Real-time surveillance for HbA1c elevations exceeding ADA clinical target thresholds",
                "criteria": "Observation?code=4548-4,17856-6",
                "channel": {
                    "type": "rest-hook",
                    "endpoint": "https://ehr.healthgraph.dev/webhook/cds-glycemic",
                    "payload": "application/fhir+json",
                    "header": ["Authorization: Bearer test-glycemic-token-2026"],
                    "_secret": "healthgraph-glycemic-hmac-secret"
                }
            },
            {
                "resourceType": "Subscription",
                "id": "sub-pharmacotherapy-safety-gate",
                "status": "active",
                "reason": "Prescription safety gate checking referential attribution and organ-system contraindications",
                "criteria": "MedicationRequest?status=active",
                "channel": {
                    "type": "rest-hook",
                    "endpoint": "https://ehr.healthgraph.dev/webhook/cds-pharmacy",
                    "payload": "application/fhir+json",
                    "header": ["Authorization: Bearer test-pharm-token-2026"],
                    "_secret": "healthgraph-pharm-hmac-secret"
                }
            }
        ]
        for sub in default_subs:
            self.subscriptions[sub["id"]] = sub

    def list_subscriptions(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns registered FHIR Subscription resources."""
        results = []
        for sub in self.subscriptions.values():
            if status is None or sub.get("status") == status:
                # Omit private internal secret from public FHIR output
                clean_sub = json.loads(json.dumps(sub))
                if "channel" in clean_sub and "_secret" in clean_sub["channel"]:
                    clean_sub["channel"]["_hasSecret"] = True
                    del clean_sub["channel"]["_secret"]
                results.append(clean_sub)
        return results

    def get_subscription(self, sub_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single subscription by logical identifier."""
        sub = self.subscriptions.get(sub_id)
        if not sub:
            return None
        clean_sub = json.loads(json.dumps(sub))
        if "channel" in clean_sub and "_secret" in clean_sub["channel"]:
            clean_sub["channel"]["_hasSecret"] = True
            del clean_sub["channel"]["_secret"]
        return clean_sub

    def create_subscription(self, sub_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates or registers a new FHIR R4 Subscription."""
        sub_id = sub_data.get("id") or f"sub-{uuid.uuid4().hex[:8]}"
        subscription = {
            "resourceType": "Subscription",
            "id": sub_id,
            "status": sub_data.get("status", "requested"),
            "reason": sub_data.get("reason", "Clinical surveillance hook"),
            "criteria": sub_data.get("criteria", ""),
            "channel": {
                "type": sub_data.get("channel", {}).get("type", "rest-hook"),
                "endpoint": sub_data.get("channel", {}).get("endpoint", ""),
                "payload": sub_data.get("channel", {}).get("payload", "application/fhir+json"),
                "header": sub_data.get("channel", {}).get("header", []),
            }
        }
        secret = sub_data.get("channel", {}).get("secret") or sub_data.get("channel", {}).get("_secret")
        if secret:
            subscription["channel"]["_secret"] = secret

        self.subscriptions[sub_id] = subscription
        return self.get_subscription(sub_id)

    def update_subscription(self, sub_id: str, patch_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates subscription status or configuration."""
        if sub_id not in self.subscriptions:
            return None
        sub = self.subscriptions[sub_id]
        if "status" in patch_data:
            sub["status"] = patch_data["status"]
        if "reason" in patch_data:
            sub["reason"] = patch_data["reason"]
        if "criteria" in patch_data:
            sub["criteria"] = patch_data["criteria"]
        if "channel" in patch_data:
            for k, v in patch_data["channel"].items():
                if k == "secret":
                    sub["channel"]["_secret"] = v
                else:
                    sub["channel"][k] = v
        return self.get_subscription(sub_id)

    def delete_subscription(self, sub_id: str) -> bool:
        """Removes or marks subscription as off."""
        if sub_id in self.subscriptions:
            del self.subscriptions[sub_id]
            return True
        return False

    @staticmethod
    def compute_signature(payload_bytes: bytes, secret: str) -> str:
        """Computes HMAC-SHA256 signature for REST hook delivery verification."""
        mac = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
        return f"sha256={mac}"

    @staticmethod
    def verify_signature(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
        """Verifies an incoming HMAC-SHA256 signature."""
        if not signature_header or not secret:
            return False
        expected = SubscriptionEngine.compute_signature(payload_bytes, secret)
        return hmac.compare_digest(signature_header.strip(), expected)

    def matches_criteria(self, criteria: str, resource: Dict[str, Any]) -> bool:
        """
        Evaluates whether a FHIR resource satisfies a subscription criteria query.
        Example criteria: 'Observation?code=33914-3,48642-3&patient=PAT-VANCE-01'
        """
        if not criteria:
            return False

        parts = criteria.split("?", 1)
        resource_type = parts[0].strip()
        if resource.get("resourceType") != resource_type:
            return False

        if len(parts) == 1:
            return True

        query_str = parts[1]
        params = [p.split("=", 1) for p in query_str.split("&") if "=" in p]

        for key, val in params:
            key = key.strip()
            val = val.strip()

            if key == "code":
                allowed_codes = [c.strip() for c in val.split(",")]
                res_concept = resource.get("code") or resource.get("medicationCodeableConcept") or {}
                codings = res_concept.get("coding", [])
                res_codes = [c.get("code", "") for c in codings]
                if not any(ac in res_codes for ac in allowed_codes):
                    return False

            elif key in ("patient", "subject"):
                target_pat = val.replace("Patient/", "").strip()
                res_sub = resource.get("subject", {}).get("reference") or resource.get("patient", {}).get("reference") or ""
                res_pat = res_sub.replace("Patient/", "").strip()
                if res_pat and res_pat != target_pat:
                    return False

            elif key == "status":
                if resource.get("status") != val:
                    return False

        return True

    def process_incoming_resource(
        self,
        resource: Dict[str, Any],
        caller_signature: Optional[str] = None,
        verify_secret: Optional[str] = None,
        simulate_dispatch: bool = True
    ) -> Dict[str, Any]:
        """
        Main ingress pipeline for incoming EHR events:
        1. Ingests or updates resource in FHIRRepository and store.
        2. Rebuilds resolver/graph indices.
        3. Identifies patient and matches active subscriptions.
        4. Runs deterministic clinical decision support rules.
        5. Dispatches REST hooks with HMAC signatures to matched endpoints.
        6. Logs execution to audit ledger.
        """
        res_type = resource.get("resourceType")
        res_id = resource.get("id")
        if not res_type or not res_id:
            raise ValueError("FHIR resource must specify 'resourceType' and 'id'.")

        # Extract patient ID from subject reference
        patient_ref = (
            resource.get("subject", {}).get("reference")
            or resource.get("patient", {}).get("reference")
            or resource.get("patientId")
            or ""
        )
        patient_id = patient_ref.replace("Patient/", "").strip()

        # Update repository and store
        self.repo.insert_resource(resource, overwrite=True)
        self.store[f"{res_type}/{res_id}"] = resource

        if self.rebuilder_callback:
            try:
                self.rebuilder_callback()
            except Exception:
                pass

        # Identify matching active subscriptions
        matched_subs = []
        for sub_id, sub in self.subscriptions.items():
            if sub.get("status") == "active":
                if self.matches_criteria(sub.get("criteria", ""), resource):
                    matched_subs.append(sub)

        # Evaluate deterministic clinical decision support
        alerts = []
        if patient_id:
            alerts = evaluate_cds_rules(patient_id, self.repo)

        # Filter alerts relevant to this clinical update
        critical_alerts = [a for a in alerts if a.get("severity") in ("CRITICAL", "WARNING")]

        # Prepare and dispatch notifications
        now_iso = datetime.now(timezone.utc).isoformat()
        dispatches = []

        for sub in matched_subs:
            endpoint = sub.get("channel", {}).get("endpoint", "")
            secret = sub.get("channel", {}).get("_secret", "")
            sub_id = sub.get("id")

            notification_payload = {
                "resourceType": "Bundle",
                "id": f"bundle-notify-{uuid.uuid4().hex[:8]}",
                "type": "history",
                "timestamp": now_iso,
                "entry": [
                    {
                        "fullUrl": f"urn:uuid:subscription-{sub_id}",
                        "resource": {
                            "resourceType": "SubscriptionStatus",
                            "status": "active",
                            "type": "event-notification",
                            "subscription": {"reference": f"Subscription/{sub_id}"},
                            "topic": sub.get("criteria"),
                            "notificationEvent": [
                                {
                                    "eventNumber": "1",
                                    "timestamp": now_iso,
                                    "focus": {"reference": f"{res_type}/{res_id}"}
                                }
                            ]
                        }
                    },
                    {
                        "fullUrl": f"urn:uuid:{res_type}-{res_id}",
                        "resource": resource
                    }
                ],
                "clinicalAlerts": alerts
            }

            payload_bytes = json.dumps(notification_payload, separators=(",", ":")).encode("utf-8")
            signature = self.compute_signature(payload_bytes, secret) if secret else None

            dispatch_record = {
                "subscriptionId": sub_id,
                "endpoint": endpoint,
                "timestamp": now_iso,
                "alertCount": len(alerts),
                "criticalCount": len(critical_alerts),
                "signature": signature,
                "status": "simulated_success" if simulate_dispatch or not endpoint.startswith("http") else "pending"
            }

            # If real HTTP dispatch requested and valid URL provided
            if not simulate_dispatch and endpoint.startswith(("http://", "https://")):
                try:
                    req = urllib.request.Request(
                        endpoint,
                        data=payload_bytes,
                        headers={
                            "Content-Type": "application/fhir+json",
                            "X-HealthGraph-Signature": signature or "",
                            "X-HealthGraph-Event": f"Subscription/{sub_id}"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=3.0) as resp:
                        dispatch_record["status"] = "delivered"
                        dispatch_record["statusCode"] = resp.status
                except Exception as ex:
                    dispatch_record["status"] = "failed"
                    dispatch_record["error"] = str(ex)

            dispatches.append(dispatch_record)

        # Audit log entry
        audit_entry = {
            "id": f"audit-{uuid.uuid4().hex[:8]}",
            "timestamp": now_iso,
            "resourceType": res_type,
            "resourceId": res_id,
            "patientId": patient_id,
            "matchedSubscriptions": [s.get("id") for s in matched_subs],
            "totalAlerts": len(alerts),
            "criticalAlerts": len(critical_alerts),
            "dispatches": dispatches
        }
        self.audit_log.insert(0, audit_entry)
        if len(self.audit_log) > 200:
            self.audit_log = self.audit_log[:200]

        return {
            "resourceId": f"{res_type}/{res_id}",
            "patientId": patient_id,
            "matchedSubscriptions": [s.get("id") for s in matched_subs],
            "alerts": alerts,
            "criticalAlerts": critical_alerts,
            "dispatches": dispatches,
            "auditId": audit_entry["id"]
        }

    def get_audit_log(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns the recent event notification audit log."""
        return self.audit_log[:limit]

    def simulate_clinical_event(self, patient_id: str, event_type: str, custom_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Simulates point-of-care EHR update events to verify subscription triggers:
        - 'renal_drop': eGFR drops to 24 mL/min/1.73m2 (severe impairment)
        - 'renal_recovery': eGFR normalizes to 65 mL/min/1.73m2
        - 'glycemic_spike': HbA1c surges to 9.2%
        - 'metformin_order': new active Metformin order
        - 'unresolved_provider_order': medication order referencing nonexistent practitioner
        """
        now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        event_resource = None

        if event_type == "renal_drop":
            val = (custom_data or {}).get("egfr", 24.0)
            event_resource = {
                "resourceType": "Observation",
                "id": f"obs-live-egfr-{uuid.uuid4().hex[:6]}",
                "status": "final",
                "code": {
                    "coding": [
                        {"system": "http://loinc.org", "code": "33914-3", "display": "Glomerular filtration rate/1.73 sq M.predicted"}
                    ],
                    "text": "eGFR (CKD-EPI 2021 equation)"
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "effectiveDateTime": f"{now_date}T09:30:00Z",
                "valueQuantity": {
                    "value": val,
                    "unit": "mL/min/1.73m2",
                    "system": "http://unitsofmeasure.org",
                    "code": "mL/min/1.73m2"
                }
            }

        elif event_type == "glycemic_spike":
            val = (custom_data or {}).get("hba1c", 9.2)
            event_resource = {
                "resourceType": "Observation",
                "id": f"obs-live-hba1c-{uuid.uuid4().hex[:6]}",
                "status": "final",
                "code": {
                    "coding": [
                        {"system": "http://loinc.org", "code": "4548-4", "display": "Hemoglobin A1c/Hemoglobin.total in Blood"}
                    ],
                    "text": "HbA1c Glycemic Panel"
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "effectiveDateTime": f"{now_date}T09:45:00Z",
                "valueQuantity": {
                    "value": val,
                    "unit": "%",
                    "system": "http://unitsofmeasure.org",
                    "code": "%"
                }
            }

        elif event_type == "metformin_order":
            event_resource = {
                "resourceType": "MedicationRequest",
                "id": f"med-live-metformin-{uuid.uuid4().hex[:6]}",
                "status": "active",
                "intent": "order",
                "medicationCodeableConcept": {
                    "coding": [
                        {"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "860975", "display": "Metformin hydrochloride 1000 MG Oral Tablet"}
                    ],
                    "text": "Metformin hydrochloride 1000 MG Oral Tablet"
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "authoredOn": now_date,
                "requester": {"reference": "Practitioner/PRAC-CHEN-01", "display": "Dr. Sarah Chen, MD"}
            }

        elif event_type == "unresolved_provider_order":
            event_resource = {
                "resourceType": "MedicationRequest",
                "id": f"med-live-dangling-{uuid.uuid4().hex[:6]}",
                "status": "active",
                "intent": "order",
                "medicationCodeableConcept": {
                    "coding": [
                        {"system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "314076", "display": "Lisinopril 20 MG Oral Tablet"}
                    ],
                    "text": "Lisinopril 20 MG Oral Tablet"
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "authoredOn": now_date,
                "requester": {"reference": "Practitioner/PRAC-GHOST-99", "display": "Unknown Unverified Clinician"}
            }

        elif custom_data and "resourceType" in custom_data:
            event_resource = custom_data

        else:
            raise ValueError(f"Unknown clinical simulation event type: '{event_type}'")

        return self.process_incoming_resource(event_resource, simulate_dispatch=True)

"""
HealthGraph SMART-on-FHIR OAuth2 Engine.

Implements HL7 SMART App Launch Framework (v1.0.0 / v2.0.0):
- Discovery (.well-known/smart-configuration and CapabilityStatement)
- RFC 7636 PKCE S256 code verifier & challenge generation
- Authorization URL construction with clinical scopes
- Authorization code to access token exchange
- Live patient bundle hydration ($everything / clinical resource aggregation)
"""

import base64
import hashlib
import json
import secrets
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple


class SmartFhirEngine:
    """Manages SMART-on-FHIR discovery, PKCE handshakes, and live bundle hydration."""

    DEFAULT_SCOPES = [
        "launch/patient",
        "patient/Patient.read",
        "patient/Condition.read",
        "patient/Observation.read",
        "patient/MedicationRequest.read",
        "patient/Encounter.read",
        "openid",
        "fhirUser",
    ]

    SANDBOX_PRESETS = [
        {
            "id": "smart-health-it-r4",
            "name": "SMART Health IT Open Sandbox (R4)",
            "iss": "https://launch.smarthealthit.org/v/r4/fhir",
            "client_id": "healthgraph_smart_client",
            "description": "Standard HL7 sample patient population with active observations and prescriptions.",
            "auth_type": "smart_v2",
        },
        {
            "id": "hapi-fhir-r4",
            "name": "HAPI FHIR Public Test Server (R4)",
            "iss": "https://hapi.fhir.org/baseR4",
            "client_id": "healthgraph_smart_client",
            "description": "Open public FHIR R4 server with direct resource querying.",
            "auth_type": "open",
        },
    ]

    @staticmethod
    def generate_pkce_pair() -> Tuple[str, str]:
        """Generates RFC 7636 code_verifier and S256 code_challenge."""
        verifier = secrets.token_urlsafe(64)[:128]
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
        return verifier, challenge

    @staticmethod
    def discover_smart_configuration(iss: str) -> Dict[str, Any]:
        """Discovers OAuth2 endpoints via .well-known/smart-configuration or CapabilityStatement."""
        well_known_url = f"{iss.rstrip('/')}/.well-known/smart-configuration"
        try:
            req = urllib.request.Request(well_known_url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            metadata_url = f"{iss.rstrip('/')}/metadata"
            req = urllib.request.Request(metadata_url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                metadata = json.loads(resp.read().decode("utf-8"))
                for rest in metadata.get("rest", []):
                    security = rest.get("security", {})
                    for ext in security.get("extension", []):
                        if "smart-configuration" in ext.get("url", ""):
                            return {sub["url"]: sub["valueUri"] for sub in ext.get("extension", [])}
                        if "oauth-uris" in ext.get("url", ""):
                            uris = {sub["url"]: sub["valueUri"] for sub in ext.get("extension", [])}
                            return {
                                "authorization_endpoint": uris.get("authorize"),
                                "token_endpoint": uris.get("token"),
                            }
        raise ValueError(f"Could not discover SMART configuration for FHIR endpoint: {iss}")

    @staticmethod
    def build_authorize_url(
        auth_endpoint: str,
        client_id: str,
        redirect_uri: str,
        aud: str,
        state: str,
        code_challenge: str,
        launch_id: Optional[str] = None,
        scopes: Optional[List[str]] = None,
    ) -> str:
        """Constructs the SMART authorization URL."""
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "aud": aud,
            "state": state,
            "scope": " ".join(scopes or SmartFhirEngine.DEFAULT_SCOPES),
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        if launch_id:
            params["launch"] = launch_id
        return f"{auth_endpoint}?{urllib.parse.urlencode(params)}"

    @staticmethod
    def exchange_token(
        token_endpoint: str,
        code: str,
        verifier: str,
        client_id: str,
        redirect_uri: str,
    ) -> Dict[str, Any]:
        """Exchanges authorization code for access token and patient context."""
        payload = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "code_verifier": verifier,
        }).encode("utf-8")

        req = urllib.request.Request(
            token_endpoint,
            data=payload,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))

    @staticmethod
    def hydrate_patient_bundle(iss: str, access_token: str, patient_id: str) -> Dict[str, Any]:
        """
        Pulls clinical records for patient from live FHIR server and bundles them.
        """
        headers = {"Accept": "application/json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        bundle_entries: List[Dict[str, Any]] = []

        patient_url = f"{iss.rstrip('/')}/Patient/{urllib.parse.quote(patient_id)}"
        try:
            req = urllib.request.Request(patient_url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                patient_res = json.loads(resp.read().decode("utf-8"))
                bundle_entries.append({"resource": patient_res})
        except Exception as e:
            # Fallback bare patient if read by id is restricted
            bundle_entries.append({
                "resource": {
                    "resourceType": "Patient",
                    "id": patient_id,
                    "name": [{"family": "External Patient", "given": [patient_id]}],
                }
            })

        resource_types = ["Condition", "Observation", "MedicationRequest", "Encounter"]
        for r_type in resource_types:
            search_url = f"{iss.rstrip('/')}/{r_type}?patient={urllib.parse.quote(patient_id)}&_count=50"
            try:
                req = urllib.request.Request(search_url, headers=headers)
                with urllib.request.urlopen(req, timeout=8) as resp:
                    search_bundle = json.loads(resp.read().decode("utf-8"))
                    for entry in search_bundle.get("entry", []):
                        if "resource" in entry:
                            bundle_entries.append(entry)
            except Exception:
                continue

        return {
            "resourceType": "Bundle",
            "type": "collection",
            "entry": bundle_entries,
        }

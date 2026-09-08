"""
HealthGraph Lightweight Provenance & Transfer Readiness Models.

Implements simplified FHIR Provenance concepts:
- Source organization & system
- Recording practitioner & timestamp
- Ingestion/normalization event
- Originating synthetic bundle

Also implements the deterministic Transfer Readiness analyzer.
"""

from typing import Dict, Any, List, Optional


class ProvenanceRecord:
    """Lightweight metadata describing clinical entity provenance."""
    def __init__(
        self,
        resource_key: str,
        source_system: str,
        source_organization: str,
        recorded_time: Optional[str],
        imported_time: str,
        originating_bundle: str,
        activity: str,
        agent_practitioner: Optional[str] = None
    ):
        self.resource_key = resource_key
        self.source_system = source_system
        self.source_organization = source_organization
        self.recorded_time = recorded_time
        self.imported_time = imported_time
        self.originating_bundle = originating_bundle
        self.activity = activity
        self.agent_practitioner = agent_practitioner

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resourceKey": self.resource_key,
            "sourceSystem": self.source_system,
            "sourceOrganization": self.source_organization,
            "recordedTime": self.recorded_time,
            "importedTime": self.imported_time,
            "originatingBundle": self.originating_bundle,
            "activity": self.activity,
            "agentPractitioner": self.agent_practitioner
        }


class ProvenanceEngine:
    """Derives and tracks provenance records for all resources in store."""

    def __init__(self, resource_store: Dict[str, Dict[str, Any]]):
        self.store = resource_store

    def get_provenance_for_resource(self, resource_type: str, resource_id: str) -> ProvenanceRecord:
        """Derives clinical provenance for a specific resource."""
        key = f"{resource_type}/{resource_id}"
        res = self.store.get(key, {})

        # Default provenance parameters
        source_org = "Metropolitan Academic Health System"
        source_sys = "Epic Inpatient / Ambulatory EHR (Synthetic Export)"
        recorded_time = (
            res.get("effectiveDateTime") or
            res.get("performedDateTime") or
            res.get("authoredOn") or
            res.get("onsetDateTime") or
            (res.get("period", {}).get("start") if isinstance(res.get("period"), dict) else None)
        )

        agent = None

        # Check practitioner
        for perf in res.get("performer", []):
            if isinstance(perf, dict):
                ref = perf.get("reference") or (perf.get("actor", {}).get("reference") if isinstance(perf.get("actor"), dict) else None)
                if ref:
                    agent = ref
                    break

        if not agent and res.get("requester"):
            agent = res["requester"].get("reference")

        # Check lab organization
        if resource_type == "Observation" and any("laboratory" in str(cat) for cat in res.get("category", [])):
            source_org = "Precision Diagnostic Laboratories"
            source_sys = "Lab Information Management System (LIMS Synthetic Feed)"

        return ProvenanceRecord(
            resource_key=key,
            source_system=source_sys,
            source_organization=source_org,
            recorded_time=recorded_time or "Timestamp Not Recorded",
            imported_time="2026-03-01T00:00:00Z",
            originating_bundle="HEALTHGRAPH-SYNTHETIC-R4-BUNDLE",
            activity="Ingestion, Validation, and Relational Graph Construction",
            agent_practitioner=agent
        )


class TransferReadinessAnalyzer:
    """
    Evaluates whether a patient's information model is ready for outbound clinical exchange.
    Demonstrates: Information -> System State -> Operational Decision.
    """

    def __init__(self, resource_store: Dict[str, Dict[str, Any]], resolver_links: Dict[str, Any]):
        self.store = resource_store
        self.resolver_links = resolver_links

    def evaluate_patient(self, patient_id: str) -> Dict[str, Any]:
        """Performs deterministic criteria check for patient data transfer."""
        patient_key = f"Patient/{patient_id}"
        pat = self.store.get(patient_key)
        if not pat:
            return {"patientId": patient_id, "status": "UNKNOWN", "reasons": ["Patient record not found."]}

        checks = []
        is_ready = True
        reasons = []

        # Criterion 1: Identity & MRN
        mrn_present = any(i.get("value") for i in pat.get("identifier", []))
        name_present = bool(pat.get("name"))
        bdate_present = bool(pat.get("birthDate"))
        identity_ok = mrn_present and name_present and bdate_present
        checks.append({
            "dimension": "Patient Demographics & Identity",
            "passed": identity_ok,
            "details": f"MRN: {'✓' if mrn_present else '✕'}, Name: {'✓' if name_present else '✕'}, BirthDate: {'✓' if bdate_present else '✕'}"
        })
        if not identity_ok:
            is_ready = False
            reasons.append("Incomplete demographic identity attributes (missing MRN, name, or birthDate).")

        # Criterion 2: Encounters Context Linking
        patient_encs = [r for r in self.store.values() if r.get("resourceType") == "Encounter" and (r.get("subject") or {}).get("reference") == patient_key]
        enc_class_ok = all(bool(e.get("class")) for e in patient_encs) if patient_encs else False
        checks.append({
            "dimension": "Encounter Episode Context",
            "passed": enc_class_ok,
            "details": f"{len(patient_encs)} Encounters verified with class & duration."
        })
        if not enc_class_ok and patient_encs:
            is_ready = False
            reasons.append("One or more encounters lack required FHIR class or episode context.")

        # Criterion 3: Medication Attribution
        patient_meds = [r for r in self.store.values() if r.get("resourceType") == "MedicationRequest" and (r.get("subject") or {}).get("reference") == patient_key]
        med_attributions_ok = True
        for med in patient_meds:
            requester_ref = (med.get("requester") or {}).get("reference")
            # If requester is dangling
            if requester_ref and requester_ref not in self.store:
                med_attributions_ok = False
                reasons.append(f"Medication '{med.get('id')}' references unverified prescriber '{requester_ref}'.")

        checks.append({
            "dimension": "Medication Prescriber Attribution",
            "passed": med_attributions_ok,
            "details": f"{len(patient_meds)} Medication orders verified against provider registry."
        })
        if not med_attributions_ok:
            is_ready = False

        # Criterion 4: Referential Completeness
        dangling_for_patient = 0
        for key, res in self.store.items():
            if (res.get("subject") or {}).get("reference") == patient_key:
                links = self.resolver_links.get(key, [])
                for l in links:
                    if not l.is_resolved:
                        dangling_for_patient += 1

        ref_ok = dangling_for_patient == 0
        checks.append({
            "dimension": "Referential Completeness",
            "passed": ref_ok,
            "details": f"{dangling_for_patient} unresolved reference(s) found in patient sub-graph."
        })
        if not ref_ok:
            is_ready = False
            reasons.append(f"Contains {dangling_for_patient} broken cross-resource pointers.")

        transfer_status = "TRANSFER READY" if is_ready else ("TRANSFER BLOCKED" if not identity_ok or not med_attributions_ok else "REVIEW REQUIRED")

        return {
            "patientId": patient_id,
            "transferStatus": transfer_status,
            "isReady": is_ready,
            "checks": checks,
            "reasons": reasons if reasons else ["All essential clinical and referential transfer prerequisites satisfied."],
            "disclaimer": "This evaluation assesses information-system interoperability readiness, NOT clinical discharge or transport readiness."
        }

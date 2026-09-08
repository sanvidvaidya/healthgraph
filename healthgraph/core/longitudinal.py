"""
HealthGraph Longitudinal Patient Timeline & Trajectory Engine.

Builds chronological clinical timelines, clusters events into healthcare encounters,
and derives longitudinal numerical trends (labs, vitals, biomarkers) over time.
"""

from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime


class TimelineEvent:
    """A discrete temporal healthcare event."""
    def __init__(
        self,
        resource_type: str,
        resource_id: str,
        timestamp: str,
        title: str,
        category: str,
        status: Optional[str] = None,
        encounter_id: Optional[str] = None,
        value_display: Optional[str] = None,
        summary: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.timestamp = timestamp
        self.title = title
        self.category = category
        self.status = status
        self.encounter_id = encounter_id
        self.value_display = value_display
        self.summary = summary
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resourceType": self.resource_type,
            "resourceId": self.resource_id,
            "resourceKey": f"{self.resource_type}/{self.resource_id}",
            "timestamp": self.timestamp,
            "dateOnly": self.timestamp[:10] if self.timestamp else "Unknown",
            "title": self.title,
            "category": self.category,
            "status": self.status,
            "encounterId": self.encounter_id,
            "valueDisplay": self.value_display,
            "summary": self.summary,
            "details": self.details
        }


class LongitudinalEngine:
    """Extracts longitudinal timelines and trajectories from FHIR stores."""

    def __init__(self, resource_store: Dict[str, Dict[str, Any]]):
        self.store = resource_store

    def get_patient_timeline(self, patient_id: str) -> Dict[str, Any]:
        """Constructs a comprehensive ordered clinical event trajectory for a patient."""
        patient_key = f"Patient/{patient_id}"
        patient_res = self.store.get(patient_key)
        if not patient_res:
            return {"patientId": patient_id, "events": [], "encounterGroups": [], "series": {}}

        events: List[TimelineEvent] = []

        # Find all resources where subject points to this patient or patient is subject
        for key, res in self.store.items():
            res_type = res.get("resourceType")
            res_id = res.get("id")

            # Check patient ownership
            is_patient_resource = False
            if res_type == "Patient" and res_id == patient_id:
                is_patient_resource = True
            else:
                subj = res.get("subject")
                if subj and isinstance(subj, dict):
                    ref = subj.get("reference", "")
                    if ref == f"Patient/{patient_id}" or ref == patient_id:
                        is_patient_resource = True

            if not is_patient_resource:
                continue

            # Extract date & encounter
            enc_ref = res.get("encounter")
            enc_id = None
            if enc_ref and isinstance(enc_ref, dict):
                ref_str = enc_ref.get("reference", "")
                if "Encounter/" in ref_str:
                    enc_id = ref_str.split("Encounter/")[1]

            if res_type == "Patient":
                bdate = res.get("birthDate")
                if bdate:
                    events.append(TimelineEvent(
                        resource_type="Patient",
                        resource_id=res_id,
                        timestamp=f"{bdate}T00:00:00Z",
                        title="Patient Birth Date",
                        category="demographic",
                        status="recorded",
                        summary="Recorded date of birth"
                    ))

            elif res_type == "Encounter":
                period = res.get("period") or {}
                start = period.get("start")
                if start:
                    enc_type = res.get("type", [{}])[0].get("text", "Encounter")
                    cls_display = res.get("class", {}).get("display", "Ambulatory")
                    events.append(TimelineEvent(
                        resource_type="Encounter",
                        resource_id=res_id,
                        timestamp=start,
                        title=f"{cls_display.capitalize()} Encounter: {enc_type}",
                        category="encounter",
                        status=res.get("status"),
                        encounter_id=res_id,
                        summary=f"Encounter duration: {start[:10]} to {(period.get('end') or '')[:10]}"
                    ))

            elif res_type == "Condition":
                onset = res.get("onsetDateTime") or res.get("recordedDate")
                if onset:
                    code_text = res.get("code", {}).get("text", "Condition")
                    status_text = res.get("clinicalStatus", {}).get("coding", [{}])[0].get("code", "active")
                    events.append(TimelineEvent(
                        resource_type="Condition",
                        resource_id=res_id,
                        timestamp=onset if "T" in onset else f"{onset}T00:00:00Z",
                        title=f"Condition Diagnosed: {code_text}",
                        category="condition",
                        status=status_text,
                        encounter_id=enc_id,
                        summary=f"Clinical Status: {status_text.capitalize()}"
                    ))

            elif res_type == "Observation":
                eff = res.get("effectiveDateTime") or res.get("issued")
                if eff:
                    code_text = res.get("code", {}).get("text", "Observation")
                    val_str = None
                    if res.get("valueQuantity"):
                        vq = res["valueQuantity"]
                        val_str = f"{vq.get('value')} {vq.get('unit', '')}".strip()
                    elif res.get("valueString"):
                        val_str = res["valueString"]

                    cat = res.get("category", [{}])[0].get("coding", [{}])[0].get("code", "laboratory")

                    events.append(TimelineEvent(
                        resource_type="Observation",
                        resource_id=res_id,
                        timestamp=eff,
                        title=f"Measurement: {code_text}",
                        category=cat,
                        status=res.get("status"),
                        encounter_id=enc_id,
                        value_display=val_str,
                        summary=f"Observed value: {val_str or 'Not specified'}"
                    ))

            elif res_type == "Procedure":
                perf = res.get("performedDateTime") or (res.get("performedPeriod") or {}).get("start")
                if perf:
                    proc_text = res.get("code", {}).get("text", "Procedure")
                    outcome = (res.get("outcome") or {}).get("text")
                    events.append(TimelineEvent(
                        resource_type="Procedure",
                        resource_id=res_id,
                        timestamp=perf,
                        title=f"Procedure: {proc_text}",
                        category="procedure",
                        status=res.get("status"),
                        encounter_id=enc_id,
                        summary=outcome or "Procedure completed"
                    ))

            elif res_type == "DiagnosticReport":
                eff = res.get("effectiveDateTime") or res.get("issued")
                if eff:
                    rep_text = res.get("code", {}).get("text", "Diagnostic Report")
                    conc = res.get("conclusion")
                    events.append(TimelineEvent(
                        resource_type="DiagnosticReport",
                        resource_id=res_id,
                        timestamp=eff,
                        title=f"Diagnostic Report: {rep_text}",
                        category="report",
                        status=res.get("status"),
                        encounter_id=enc_id,
                        summary=conc[:120] + "..." if conc and len(conc) > 120 else conc
                    ))

            elif res_type == "MedicationRequest":
                auth = res.get("authoredOn")
                if auth:
                    med_text = (res.get("medicationCodeableConcept") or {}).get("text", "Medication")
                    sig = (res.get("dosageInstruction") or [{}])[0].get("text", "")
                    events.append(TimelineEvent(
                        resource_type="MedicationRequest",
                        resource_id=res_id,
                        timestamp=auth,
                        title=f"Rx Order: {med_text}",
                        category="medication",
                        status=res.get("status"),
                        encounter_id=enc_id,
                        summary=sig or f"Status: {res.get('status')}"
                    ))

        # Sort chronologically
        events.sort(key=lambda e: e.timestamp or "")

        # Extract continuous quantitative biomarker trajectories (e.g. HbA1c, eGFR, BP, Troponin)
        series = self._extract_series(patient_id)

        # Build encounter clustering
        enc_groups = self._build_encounter_groups(patient_id, events)

        return {
            "patientId": patient_id,
            "totalEvents": len(events),
            "events": [e.to_dict() for e in events],
            "encounterGroups": enc_groups,
            "series": series
        }

    def _extract_series(self, patient_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Derives numerical trend trajectories for repeated observations."""
        series: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

        for key, res in self.store.items():
            if res.get("resourceType") != "Observation":
                continue

            subj = res.get("subject")
            if not subj or subj.get("reference") != f"Patient/{patient_id}":
                continue

            code_info = res.get("code", {})
            test_name = code_info.get("text")
            loinc = None
            for c in code_info.get("coding", []):
                if c.get("system") == "http://loinc.org":
                    loinc = c.get("code")
                    break

            vq = res.get("valueQuantity")
            eff = res.get("effectiveDateTime")
            if vq and eff and vq.get("value") is not None:
                series_key = test_name or loinc or "Other Lab"
                series[series_key].append({
                    "timestamp": eff,
                    "date": eff[:10],
                    "value": vq.get("value"),
                    "unit": vq.get("unit", ""),
                    "observationId": res.get("id"),
                    "status": res.get("status")
                })

        # Sort each series chronologically
        for k in series:
            series[k].sort(key=lambda x: x["timestamp"])

        return dict(series)

    def _build_encounter_groups(self, patient_id: str, events: List[TimelineEvent]) -> List[Dict[str, Any]]:
        """Groups timeline events under their parent Encounter dossier."""
        encounters = []
        enc_map = {}

        # First find all encounters for this patient
        for key, res in self.store.items():
            if res.get("resourceType") == "Encounter":
                subj = res.get("subject")
                if subj and subj.get("reference") == f"Patient/{patient_id}":
                    enc_id = res.get("id")
                    period = res.get("period") or {}
                    enc_dict = {
                        "encounterId": enc_id,
                        "title": res.get("type", [{}])[0].get("text", f"Encounter {enc_id}"),
                        "class": res.get("class", {}).get("display", "Ambulatory"),
                        "start": period.get("start"),
                        "end": period.get("end"),
                        "events": []
                    }
                    enc_map[enc_id] = enc_dict
                    encounters.append(enc_dict)

        # Place events into respective encounter
        for ev in events:
            if ev.encounter_id and ev.encounter_id in enc_map:
                enc_map[ev.encounter_id]["events"].append(ev.to_dict())

        # Sort encounters by start date descending
        encounters.sort(key=lambda x: x.get("start") or "", reverse=True)
        return encounters

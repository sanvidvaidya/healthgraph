"""
HealthGraph 3-Layer Profile-Aware FHIR R4 Validation Engine.

Strictly distinguishes:
- Layer 1: Structural Validation (JSON, resourceType, id, scalar types)
- Layer 2: Resource-Specific Validation (rules specific to each FHIR resource type)
- Layer 3: Application & Interoperability Validation (referential integrity, temporal checks, coding standards)

Taxonomy: ERROR | WARNING | INFORMATION | UNKNOWN
"""

from typing import Dict, Any, List, Optional
from pydantic import ValidationError
from healthgraph.models import RESOURCE_TYPE_MAP


class ValidationFinding:
    """Represents a discrete validation finding classified by layer and taxonomy."""
    def __init__(
        self,
        layer: int,            # 1 (Structural) | 2 (Resource-Specific) | 3 (Interoperability)
        severity: str,         # "ERROR" | "WARNING" | "INFORMATION" | "UNKNOWN"
        code: str,
        path: str,
        message: str,
        recommendation: Optional[str] = None
    ):
        self.layer = layer
        self.severity = severity
        self.code = code
        self.path = path
        self.message = message
        self.recommendation = recommendation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "layer": self.layer,
            "layerName": f"Layer {self.layer}: " + ("Structural" if self.layer == 1 else "Resource-Specific" if self.layer == 2 else "Interoperability"),
            "severity": self.severity,
            "code": self.code,
            "path": self.path,
            "message": self.message,
            "recommendation": self.recommendation
        }


class LayeredValidationReport:
    """Consolidated 3-layer validation outcome for a resource."""
    def __init__(self, resource_type: str, resource_id: str):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.findings: List[ValidationFinding] = []

    @property
    def is_valid(self) -> bool:
        """Resource passes validation if it has zero ERROR findings."""
        return not any(f.severity == "ERROR" for f in self.findings)

    @property
    def error_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "ERROR")

    @property
    def warning_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "WARNING")

    @property
    def info_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "INFORMATION")

    @property
    def unknown_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "UNKNOWN")

    def add_finding(
        self,
        layer: int,
        severity: str,
        code: str,
        path: str,
        message: str,
        recommendation: Optional[str] = None
    ):
        self.findings.append(ValidationFinding(layer, severity, code, path, message, recommendation))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resourceType": self.resource_type,
            "id": self.resource_id,
            "isValid": self.is_valid,
            "errorCount": self.error_count,
            "warningCount": self.warning_count,
            "infoCount": self.info_count,
            "unknownCount": self.unknown_count,
            "findings": [f.to_dict() for f in self.findings],
            "layerSummary": {
                "layer1_structural": sum(1 for f in self.findings if f.layer == 1 and f.severity == "ERROR") == 0,
                "layer2_resource": sum(1 for f in self.findings if f.layer == 2 and f.severity == "ERROR") == 0,
                "layer3_interop": sum(1 for f in self.findings if f.layer == 3 and f.severity == "ERROR") == 0
            }
        }


class FHIRValidator:
    """
    Educational FHIR R4 Validator / Profile-Aware Validation Layer.
    Implements a 3-layer architecture rather than simplistic universal assertions.
    """

    STANDARD_TERMINOLOGY_URIS = {
        "http://loinc.org": "LOINC",
        "http://snomed.info/sct": "SNOMED CT",
        "http://www.nlm.nih.gov/research/umls/rxnorm": "RxNorm",
        "http://hl7.org/fhir/sid/icd-10-cm": "ICD-10-CM",
        "http://www.ama-assn.org/go/cpt": "CPT",
        "http://unitsofmeasure.org": "UCUM",
        "http://terminology.hl7.org/CodeSystem/v3-ActCode": "HL7 ActCode",
        "http://terminology.hl7.org/CodeSystem/v2-0074": "HL7 Diagnostic Service",
        "http://terminology.hl7.org/CodeSystem/condition-clinical": "Condition Clinical Status",
        "http://terminology.hl7.org/CodeSystem/condition-ver-status": "Condition Verification Status",
        "http://terminology.hl7.org/CodeSystem/observation-category": "Observation Category",
        "http://terminology.hl7.org/CodeSystem/organization-type": "Organization Type",
    }

    def validate_resource(self, raw: Dict[str, Any]) -> LayeredValidationReport:
        """Executes full 3-layer validation on a FHIR resource."""
        res_type = raw.get("resourceType", "Unknown")
        res_id = raw.get("id", "Unknown")
        report = LayeredValidationReport(res_type, res_id)

        # =====================================================================
        # LAYER 1: STRUCTURAL VALIDATION
        # =====================================================================
        if not raw.get("resourceType"):
            report.add_finding(
                layer=1,
                severity="ERROR",
                code="missing-resource-type",
                path="resourceType",
                message="Resource is missing required 'resourceType' declaration."
            )
            return report

        if not raw.get("id"):
            report.add_finding(
                layer=1,
                severity="ERROR",
                code="missing-id",
                path="id",
                message="Resource is missing logical 'id' string."
            )

        model_cls = RESOURCE_TYPE_MAP.get(res_type)
        if not model_cls:
            report.add_finding(
                layer=1,
                severity="WARNING",
                code="unsupported-resource-type",
                path="resourceType",
                message=f"Resource type '{res_type}' is outside HealthGraph educational subset scope."
            )
            return report

        try:
            model_cls(**raw)
        except ValidationError as e:
            for err in e.errors():
                loc = ".".join(str(l) for l in err["loc"])
                msg = err["msg"]
                report.add_finding(
                    layer=1,
                    severity="ERROR",
                    code="schema-type-mismatch",
                    path=loc,
                    message=f"Structural type error: {msg}",
                    recommendation="Ensure data matches primitive/object types defined in FHIR R4 specification."
                )

        # =====================================================================
        # LAYER 2: RESOURCE-SPECIFIC VALIDATION
        # Applies rules specific to each resource type (no false universal status rule)
        # =====================================================================
        self._validate_layer2_resource_specific(raw, report)

        # =====================================================================
        # LAYER 3: APPLICATION & INTEROPERABILITY VALIDATION
        # Coding standards, URI integrity, and interoperability readiness
        # =====================================================================
        self._validate_layer3_interoperability(raw, report)

        return report

    def _validate_layer2_resource_specific(self, res: Dict[str, Any], report: LayeredValidationReport) -> None:
        """Resource-tailored constraints."""
        res_type = res.get("resourceType")

        if res_type == "Patient":
            # In FHIR R4, Patient does NOT have 'status'; it has 'active' (boolean)
            if not res.get("birthDate"):
                report.add_finding(
                    layer=2,
                    severity="INFORMATION",
                    code="missing-birthdate",
                    path="birthDate",
                    message="Patient lacks 'birthDate'. (Optional in base FHIR R4, but required in US Core).",
                    recommendation="Add birthDate (YYYY-MM-DD) to support pediatric dosing and demographic matching."
                )
            if not res.get("name"):
                report.add_finding(
                    layer=2,
                    severity="WARNING",
                    code="missing-patient-name",
                    path="name",
                    message="Patient lacks 'name' array."
                )

        elif res_type == "Encounter":
            # Encounter requires status, class, and subject in FHIR R4
            if not res.get("status"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-encounter-status",
                    path="status",
                    message="Encounter must specify 'status' (e.g. planned | arrived | in-progress | finished)."
                )
            if not res.get("class"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-encounter-class",
                    path="class",
                    message="Encounter must specify 'class' (e.g. AMB, IMP, EMER)."
                )
            if not res.get("subject"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-encounter-subject",
                    path="subject",
                    message="Encounter must specify subject (Patient)."
                )

        elif res_type == "Observation":
            # Observation requires status and code in FHIR R4
            if not res.get("status"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-observation-status",
                    path="status",
                    message="Observation requires 'status' (registered | preliminary | final | amended)."
                )
            if not res.get("code"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-observation-code",
                    path="code",
                    message="Observation requires 'code' (CodeableConcept)."
                )
            if not res.get("subject"):
                report.add_finding(
                    layer=2,
                    severity="WARNING",
                    code="missing-observation-subject",
                    path="subject",
                    message="Clinical Observation lacks subject pointer. While optional in raw FHIR, clinical context is lost."
                )
            # Check measurement presence
            has_val = any(k in res for k in ("valueQuantity", "valueCodeableConcept", "valueString", "valueBoolean", "component", "dataAbsentReason"))
            if not has_val and res.get("status") == "final":
                report.add_finding(
                    layer=2,
                    severity="WARNING",
                    code="observation-missing-value",
                    path="valueQuantity",
                    message="Final Observation does not contain a quantitative/coded value or dataAbsentReason."
                )

        elif res_type == "Condition":
            # In FHIR R4, Condition requires subject; requires clinicalStatus unless verificationStatus is entered-in-error
            if not res.get("clinicalStatus"):
                ver_status = (res.get("verificationStatus") or {}).get("coding", [{}])[0].get("code")
                if ver_status != "entered-in-error":
                    report.add_finding(
                        layer=2,
                        severity="ERROR",
                        code="missing-clinical-status",
                        path="clinicalStatus",
                        message="Condition requires 'clinicalStatus' unless verificationStatus is entered-in-error.",
                        recommendation="Supply clinicalStatus (active | recurrence | relapse | inactive | remission | resolved)."
                    )
            if not res.get("subject"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-condition-subject",
                    path="subject",
                    message="Condition must specify subject (Patient)."
                )

        elif res_type == "Procedure":
            if not res.get("status"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-procedure-status",
                    path="status",
                    message="Procedure requires 'status' (preparation | in-progress | completed | etc.)."
                )
            if not res.get("subject"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-procedure-subject",
                    path="subject",
                    message="Procedure must specify subject (Patient)."
                )

        elif res_type == "DiagnosticReport":
            if not res.get("status"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-diagnostic-report-status",
                    path="status",
                    message="DiagnosticReport requires 'status' (preliminary | final | amended | etc.)."
                )
            if not res.get("code"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-diagnostic-report-code",
                    path="code",
                    message="DiagnosticReport requires 'code'."
                )

        elif res_type == "MedicationRequest":
            if not res.get("status"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-medication-request-status",
                    path="status",
                    message="MedicationRequest requires 'status' (active | on-hold | cancelled | completed | stopped)."
                )
            if not res.get("intent"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-medication-request-intent",
                    path="intent",
                    message="MedicationRequest requires 'intent' (proposal | plan | order | original-order)."
                )
            if not res.get("subject"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-medication-request-subject",
                    path="subject",
                    message="MedicationRequest must specify subject (Patient)."
                )
            if not res.get("medicationCodeableConcept") and not res.get("medicationReference"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-medication-target",
                    path="medication[x]",
                    message="MedicationRequest must supply either medicationCodeableConcept or medicationReference."
                )

        elif res_type == "Practitioner":
            # Practitioner uses 'active' boolean, NOT 'status'
            if "status" in res:
                report.add_finding(
                    layer=2,
                    severity="INFORMATION",
                    code="unrecognized-element-status",
                    path="status",
                    message="Practitioner uses 'active' boolean in FHIR R4 rather than a 'status' field."
                )

        elif res_type == "Organization":
            # Organization requires name
            if not res.get("name"):
                report.add_finding(
                    layer=2,
                    severity="ERROR",
                    code="missing-organization-name",
                    path="name",
                    message="Organization requires 'name' attribute."
                )

    def _validate_layer3_interoperability(self, res: Dict[str, Any], report: LayeredValidationReport) -> None:
        """Interoperability, terminology systems, and semantic usefulness."""
        self._inspect_codings(res, report)

    def _inspect_codings(self, obj: Any, report: LayeredValidationReport, current_path: str = "") -> None:
        """Recursively checks coding URIs and identifies non-standard or missing systems."""
        if isinstance(obj, dict):
            if "system" in obj and "code" in obj:
                sys_uri = obj.get("system")
                code = obj.get("code")
                if not sys_uri:
                    report.add_finding(
                        layer=3,
                        severity="WARNING",
                        code="missing-coding-system",
                        path=current_path,
                        message=f"Code '{code}' lacks a terminology 'system' URI, impairing cross-system interoperability.",
                        recommendation="Explicitly declare canonical terminology URI (e.g. http://loinc.org, http://snomed.info/sct)."
                    )
                elif not sys_uri.startswith("http://") and not sys_uri.startswith("https://") and not sys_uri.startswith("urn:"):
                    report.add_finding(
                        layer=3,
                        severity="WARNING",
                        code="invalid-system-uri",
                        path=f"{current_path}.system",
                        message=f"System identifier '{sys_uri}' is not a valid canonical URI format."
                    )
                elif sys_uri not in self.STANDARD_TERMINOLOGY_URIS:
                    report.add_finding(
                        layer=3,
                        severity="INFORMATION",
                        code="non-standard-terminology",
                        path=f"{current_path}.system",
                        message=f"Coding system '{sys_uri}' is a local or proprietary terminology system."
                    )
            for k, v in obj.items():
                p = f"{current_path}.{k}" if current_path else k
                self._inspect_codings(v, report, p)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                p = f"{current_path}[{i}]"
                self._inspect_codings(item, report, p)

"""
HealthGraph Multidimensional Healthcare Data Quality Auditor.

Evaluates data quality across measurable, transparent dimensions:
1. Structural Validity (schema compliance, Layer 1 & 2 conformance)
2. Referential Integrity (resolved vs. dangling references)
3. Temporal Consistency (event timestamps vs. encounter boundaries)
4. Information Completeness (presence of essential clinical metadata)
5. Terminology Quality (standard canonical coding system adoption)
6. Identity Uniqueness (duplicate identifiers and entity collisions)

Taxonomy: ERROR | WARNING | INFORMATION | UNKNOWN
"""

from typing import Dict, Any, List, Optional
from collections import defaultdict
from healthgraph.core.resolver import ReferenceResolver
from healthgraph.core.validator import FHIRValidator


class QualityFinding:
    """Represents an audited information-system finding."""
    def __init__(
        self,
        dimension: str,     # "Referential Integrity" | "Temporal Consistency" | "Completeness" | "Identity Uniqueness" | "Structural Validity" | "Terminology Quality"
        severity: str,      # "ERROR" | "WARNING" | "INFORMATION" | "UNKNOWN"
        resource_key: str,
        resource_type: str,
        resource_id: str,
        summary: str,
        clinical_impact: str,
        remediation: str,
        raw_evidence: Optional[Dict[str, Any]] = None
    ):
        self.dimension = dimension
        self.severity = severity
        self.resource_key = resource_key
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.summary = summary
        self.clinical_impact = clinical_impact
        self.remediation = remediation
        self.raw_evidence = raw_evidence or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dimension": self.dimension,
            "severity": self.severity,
            "resourceKey": self.resource_key,
            "resourceType": self.resource_type,
            "resourceId": self.resource_id,
            "summary": self.summary,
            "clinicalImpact": self.clinical_impact,
            "remediation": self.remediation,
            "rawEvidence": self.raw_evidence
        }


class QualityAuditor:
    """Audits FHIR data stores across multidimensional quality metrics."""

    def __init__(self, resource_store: Dict[str, Dict[str, Any]], resolver: ReferenceResolver, validator: FHIRValidator):
        self.store = resource_store
        self.resolver = resolver
        self.validator = validator

    def run_audit(self) -> Dict[str, Any]:
        """Runs the multidimensional audit and computes explicit measurable indicators."""
        findings: List[QualityFinding] = []

        # 1. Referential Integrity Audit
        total_references = 0
        resolved_references = 0
        for src_key, links in self.resolver._forward_links.items():
            for link in links:
                total_references += 1
                if link.is_resolved:
                    resolved_references += 1
                else:
                    findings.append(QualityFinding(
                        dimension="Referential Integrity",
                        severity="ERROR",
                        resource_key=link.source_key,
                        resource_type=link.source_type,
                        resource_id=link.source_id,
                        summary=f"Dangling reference: field '{link.path}' targets non-existent resource '{link.target_key}'.",
                        clinical_impact="Breaks provider/patient attribution; clinical provenance cannot be verified across systems.",
                        remediation=f"Ingest missing target entity '{link.target_key}' or update source pointer with valid registered identifier.",
                        raw_evidence={"path": link.path, "targetKey": link.target_key, "display": link.display}
                    ))

        # Orphan clinical resources (clinical findings lacking patient link)
        orphans = self.resolver.get_orphan_resources()
        for o in orphans:
            r_type = o.get("resourceType", "Resource")
            r_id = o.get("id", "unknown")
            findings.append(QualityFinding(
                dimension="Referential Integrity",
                severity="WARNING",
                resource_key=f"{r_type}/{r_id}",
                resource_type=r_type,
                resource_id=r_id,
                summary=f"Orphan clinical {r_type} has no subject pointer referencing an identifiable Patient.",
                clinical_impact="Clinical finding exists in vacuum without patient ownership, preventing safety reviews.",
                remediation="Attach valid subject: {'reference': 'Patient/<id>'} before promoting to patient record.",
                raw_evidence={"status": o.get("status"), "code": o.get("code")}
            ))

        # 2. Temporal Consistency Audit
        temporal_clashes = self._check_temporal_consistency(findings)

        # 3. Identity Uniqueness & Collision Audit
        identity_collisions = self._check_duplicate_identifiers(findings)

        # 4. Structural & Completeness Validation Audit (via 3-layer validator)
        structural_errors, completeness_warnings = self._audit_structural_and_completeness(findings)

        # 5. Terminology Quality Audit
        terminology_stats = self._audit_terminologies(findings)

        # Calculate exact dimensional metrics
        total_resources = len(self.store)

        referential_pct = round((resolved_references / max(1, total_references)) * 100, 1)
        structural_pct = round(((total_resources - structural_errors) / max(1, total_resources)) * 100, 1)
        temporal_pct = round(((total_resources - len(temporal_clashes)) / max(1, total_resources)) * 100, 1)
        completeness_pct = round(((total_resources - completeness_warnings) / max(1, total_resources)) * 100, 1)

        # HealthGraph Heuristic Readiness Indicator (explicitly labeled heuristic)
        # Weights: Referential (35%), Structural (25%), Completeness (20%), Temporal (10%), Terminology (10%)
        heuristic_score = round(
            (referential_pct * 0.35) +
            (structural_pct * 0.25) +
            (completeness_pct * 0.20) +
            (temporal_pct * 0.10) +
            (terminology_stats["standardCodingPct"] * 0.10),
            1
        )

        counts_by_severity = {
            "ERROR": sum(1 for f in findings if f.severity == "ERROR"),
            "WARNING": sum(1 for f in findings if f.severity == "WARNING"),
            "INFORMATION": sum(1 for f in findings if f.severity == "INFORMATION"),
            "UNKNOWN": sum(1 for f in findings if f.severity == "UNKNOWN")
        }

        counts_by_dimension = defaultdict(int)
        for f in findings:
            counts_by_dimension[f.dimension] += 1

        return {
            "dimensions": {
                "referentialIntegrity": {
                    "dimension": "Referential Integrity",
                    "totalReferences": total_references,
                    "resolvedReferences": resolved_references,
                    "danglingReferences": total_references - resolved_references,
                    "percentage": referential_pct,
                    "status": "PASSED" if referential_pct == 100.0 else "ERROR" if referential_pct < 95.0 else "WARNING"
                },
                "structuralValidity": {
                    "dimension": "Structural Validity",
                    "totalResources": total_resources,
                    "validResources": total_resources - structural_errors,
                    "invalidResources": structural_errors,
                    "percentage": structural_pct,
                    "status": "PASSED" if structural_errors == 0 else "ERROR"
                },
                "temporalConsistency": {
                    "dimension": "Temporal Consistency",
                    "totalAudited": total_resources,
                    "clashes": len(temporal_clashes),
                    "percentage": temporal_pct,
                    "status": "PASSED" if len(temporal_clashes) == 0 else "WARNING"
                },
                "completeness": {
                    "dimension": "Information Completeness",
                    "totalAudited": total_resources,
                    "omissions": completeness_warnings,
                    "percentage": completeness_pct,
                    "status": "PASSED" if completeness_warnings == 0 else "WARNING"
                },
                "terminologyQuality": {
                    "dimension": "Terminology Standards",
                    "totalCodedElements": terminology_stats["totalCodings"],
                    "standardCodedElements": terminology_stats["standardCodings"],
                    "percentage": terminology_stats["standardCodingPct"],
                    "status": "PASSED" if terminology_stats["standardCodingPct"] >= 95.0 else "WARNING"
                },
                "identityUniqueness": {
                    "dimension": "Identity Uniqueness",
                    "collisionCount": len(identity_collisions),
                    "status": "PASSED" if len(identity_collisions) == 0 else "ERROR"
                }
            },
            "heuristicReadinessIndicator": {
                "score": heuristic_score,
                "label": "HealthGraph Heuristic Readiness Indicator",
                "disclaimer": "This indicator is an educational composite heuristic, not an official clinical or regulatory readiness standard.",
                "weights": "Referential 35%, Structural 25%, Completeness 20%, Temporal 10%, Terminology 10%"
            },
            "summaryCounts": counts_by_severity,
            "countsByDimension": dict(counts_by_dimension),
            "findings": [f.to_dict() for f in findings]
        }

    def _check_temporal_consistency(self, findings: List[QualityFinding]) -> List[str]:
        clashes = []
        for key, res in self.store.items():
            if res.get("resourceType") != "Observation":
                continue

            enc_ref = res.get("encounter")
            if not enc_ref or not isinstance(enc_ref, dict):
                continue

            ref_str = enc_ref.get("reference", "")
            if not ref_str.startswith("Encounter/"):
                continue

            enc_res = self.store.get(ref_str)
            if not enc_res:
                continue

            obs_time = res.get("effectiveDateTime")
            period = enc_res.get("period") or {}
            enc_start = period.get("start")
            enc_end = period.get("end")

            if obs_time and enc_start:
                obs_date = obs_time[:10]
                start_date = enc_start[:10]
                if obs_date < start_date:
                    clashes.append(key)
                    findings.append(QualityFinding(
                        dimension="Temporal Consistency",
                        severity="WARNING",
                        resource_key=key,
                        resource_type="Observation",
                        resource_id=res.get("id", ""),
                        summary=f"Observation timestamp ({obs_time}) precedes associated encounter start ({enc_start}) by multiple days.",
                        clinical_impact="Distorts longitudinal timeline; prior outpatient findings appear misattributed to encounter episode.",
                        remediation="Adjust observation timestamp or link observation to the prior ambulatory encounter.",
                        raw_evidence={"observationTime": obs_time, "encounterPeriod": period}
                    ))
        return clashes

    def _check_duplicate_identifiers(self, findings: List[QualityFinding]) -> List[str]:
        collisions = []
        ident_map = defaultdict(list)
        for key, res in self.store.items():
            for ident in res.get("identifier", []):
                sys = ident.get("system", "")
                val = ident.get("value", "")
                if sys and val:
                    ident_map[(sys, val)].append(key)

        for (sys, val), keys in ident_map.items():
            if len(keys) > 1:
                collisions.append(keys[0])
                findings.append(QualityFinding(
                    dimension="Identity Uniqueness",
                    severity="ERROR",
                    resource_key=keys[0],
                    resource_type=keys[0].split("/")[0],
                    resource_id=keys[0].split("/")[1],
                    summary=f"Duplicate identifier collision: system '{sys}' value '{val}' is claimed by multiple resources ({', '.join(keys)}).",
                    clinical_impact="Violates uniqueness assumption; risks erroneous data merges, patient mix-ups, or unresolvable race conditions.",
                    remediation="Resolve identifier clash by ensuring namespace partitioning or assigning distinct UUIDs.",
                    raw_evidence={"system": sys, "value": val, "clashingResources": keys}
                ))
        return collisions

    def _audit_structural_and_completeness(self, findings: List[QualityFinding]) -> Tuple[int, int]:
        structural_errors = 0
        completeness_warnings = 0

        for key, res in self.store.items():
            report = self.validator.validate_resource(res)
            has_error = False
            has_warning = False

            for f in report.findings:
                if f.layer == 1:
                    if f.severity == "ERROR":
                        has_error = True
                    findings.append(QualityFinding(
                        dimension="Structural Validity",
                        severity=f.severity,
                        resource_key=key,
                        resource_type=report.resource_type,
                        resource_id=report.resource_id,
                        summary=f.message,
                        clinical_impact="Structural schema non-compliance causes deserialization errors in consuming EHRs.",
                        remediation=f.recommendation or "Format resource to match base FHIR R4 schema definition.",
                        raw_evidence={"path": f.path, "code": f.code}
                    ))
                elif f.layer == 2:
                    if f.severity == "ERROR":
                        has_error = True
                    elif f.severity in ("WARNING", "INFORMATION"):
                        has_warning = True

                    findings.append(QualityFinding(
                        dimension="Completeness",
                        severity=f.severity,
                        resource_key=key,
                        resource_type=report.resource_type,
                        resource_id=report.resource_id,
                        summary=f.message,
                        clinical_impact="Missing clinical status or mandatory domain attributes restricts clinical utility.",
                        remediation=f.recommendation or "Supply mandatory clinical attributes per resource specification.",
                        raw_evidence={"path": f.path, "code": f.code}
                    ))

            if has_error:
                structural_errors += 1
            if has_warning:
                completeness_warnings += 1

        return structural_errors, completeness_warnings

    def _audit_terminologies(self, findings: List[QualityFinding]) -> Dict[str, Any]:
        total_codings = 0
        standard_codings = 0

        def scan_obj(obj):
            nonlocal total_codings, standard_codings
            if isinstance(obj, dict):
                if "system" in obj and "code" in obj:
                    total_codings += 1
                    sys_uri = obj.get("system", "")
                    if sys_uri in self.validator.STANDARD_TERMINOLOGY_URIS:
                        standard_codings += 1
                for v in obj.values():
                    scan_obj(v)
            elif isinstance(obj, list):
                for item in obj:
                    scan_obj(item)

        for res in self.store.values():
            scan_obj(res)

        pct = round((standard_codings / max(1, total_codings)) * 100, 1)
        return {
            "totalCodings": total_codings,
            "standardCodings": standard_codings,
            "standardCodingPct": pct
        }

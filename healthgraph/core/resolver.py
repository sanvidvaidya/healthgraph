"""
HealthGraph Reference Resolution Engine.

Resolves relative FHIR pointers ('Resource/id') across resources, constructs
bidirectional dependency links, identifies dangling references, and detects
orphan clinical entities.
"""

from typing import Dict, Any, List, Set, Tuple, Optional
from collections import defaultdict


class ResolvedReference:
    """Detailed resolution status for a single reference relationship."""
    def __init__(
        self,
        source_type: str,
        source_id: str,
        path: str,
        target_type: str,
        target_id: str,
        is_resolved: bool,
        target_title: Optional[str] = None,
        display: Optional[str] = None
    ):
        self.source_type = source_type
        self.source_id = source_id
        self.path = path
        self.target_type = target_type
        self.target_id = target_id
        self.is_resolved = is_resolved
        self.target_title = target_title
        self.display = display

    @property
    def source_key(self) -> str:
        return f"{self.source_type}/{self.source_id}"

    @property
    def target_key(self) -> str:
        return f"{self.target_type}/{self.target_id}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source_key,
            "path": self.path,
            "target": self.target_key,
            "targetType": self.target_type,
            "targetId": self.target_id,
            "isResolved": self.is_resolved,
            "targetTitle": self.target_title,
            "display": self.display
        }


class ReferenceResolver:
    """Indexes and resolves all cross-resource pointers."""

    def __init__(self, resource_store: Optional[Dict[str, Dict[str, Any]]] = None):
        # Store keyed by f"{resource_type}/{resource_id}" -> resource dict
        self._store: Dict[str, Dict[str, Any]] = resource_store or {}
        # Forward edges: source_key -> list of ResolvedReference
        self._forward_links: Dict[str, List[ResolvedReference]] = defaultdict(list)
        # Reverse edges: target_key -> list of ResolvedReference
        self._reverse_links: Dict[str, List[ResolvedReference]] = defaultdict(list)
        # Dangling references list
        self._dangling_references: List[ResolvedReference] = []

    def set_store(self, store: Dict[str, Dict[str, Any]]) -> None:
        self._store = store
        self.rebuild_index()

    def add_resource(self, resource: Dict[str, Any]) -> None:
        res_type = resource.get("resourceType")
        res_id = resource.get("id")
        if res_type and res_id:
            key = f"{res_type}/{res_id}"
            self._store[key] = resource

    def rebuild_index(self) -> None:
        """Parses and indexes references across all stored resources."""
        self._forward_links.clear()
        self._reverse_links.clear()
        self._dangling_references.clear()

        for key, res in self._store.items():
            refs = self._extract_references(res)
            for path, target_type, target_id, display in refs:
                target_key = f"{target_type}/{target_id}"
                target_res = self._store.get(target_key)
                is_resolved = target_res is not None

                target_title = None
                if target_res:
                    target_title = self._get_title(target_res)

                resolved = ResolvedReference(
                    source_type=res.get("resourceType", ""),
                    source_id=res.get("id", ""),
                    path=path,
                    target_type=target_type,
                    target_id=target_id,
                    is_resolved=is_resolved,
                    target_title=target_title,
                    display=display
                )

                self._forward_links[key].append(resolved)
                self._reverse_links[target_key].append(resolved)

                if not is_resolved:
                    self._dangling_references.append(resolved)

    def get_forward_links(self, resource_type: str, resource_id: str) -> List[ResolvedReference]:
        """Returns all outbound references made by this resource."""
        return self._forward_links.get(f"{resource_type}/{resource_id}", [])

    def get_reverse_links(self, resource_type: str, resource_id: str) -> List[ResolvedReference]:
        """Returns all inbound references pointing to this resource."""
        return self._reverse_links.get(f"{resource_type}/{resource_id}", [])

    def get_dangling_references(self) -> List[ResolvedReference]:
        """Returns all references whose target does not exist in the store."""
        return list(self._dangling_references)

    def get_orphan_resources(self) -> List[Dict[str, Any]]:
        """
        Finds clinical resources (Observation, Condition, Procedure, DiagnosticReport, MedicationRequest)
        that are not linked to any Patient.
        """
        clinical_types = {"Observation", "Condition", "Procedure", "DiagnosticReport", "MedicationRequest"}
        orphans = []

        for key, res in self._store.items():
            res_type = res.get("resourceType")
            if res_type in clinical_types:
                # Check if subject points to a known Patient
                forward = self._forward_links.get(key, [])
                has_patient_link = any(
                    r.path.endswith("subject") and r.target_type == "Patient" and r.is_resolved
                    for r in forward
                )
                if not has_patient_link:
                    orphans.append(res)

        return orphans

    def _extract_references(self, obj: Any, current_path: str = "") -> List[Tuple[str, str, str, Optional[str]]]:
        """Recursively discovers reference objects in the FHIR structure."""
        results: List[Tuple[str, str, str, Optional[str]]] = []

        if isinstance(obj, dict):
            if "reference" in obj and isinstance(obj["reference"], str):
                ref_str = obj["reference"].strip()
                display = obj.get("display")
                if "/" in ref_str:
                    parts = ref_str.split("/")
                    tgt_type = parts[0]
                    tgt_id = parts[1]
                    results.append((current_path or "reference", tgt_type, tgt_id, display))
            for k, v in obj.items():
                p = f"{current_path}.{k}" if current_path else k
                results.extend(self._extract_references(v, p))
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                p = f"{current_path}[{i}]"
                results.extend(self._extract_references(item, p))

        return results

    def _get_title(self, res: Dict[str, Any]) -> str:
        res_type = res.get("resourceType", "")
        if res_type == "Patient":
            names = res.get("name", [])
            if names:
                n = names[0]
                return f"{' '.join(n.get('given', []))} {n.get('family', '')}".strip()
        elif res_type == "Practitioner":
            names = res.get("name", [])
            if names:
                n = names[0]
                return f"{' '.join(n.get('prefix', []))} {' '.join(n.get('given', []))} {n.get('family', '')}".strip()
        elif res_type == "Organization":
            return res.get("name", "Organization")
        elif "code" in res and isinstance(res["code"], dict):
            return res["code"].get("text", res.get("id"))
        elif "medicationCodeableConcept" in res:
            return res["medicationCodeableConcept"].get("text", res.get("id"))
        return f"{res_type} {res.get('id')}"

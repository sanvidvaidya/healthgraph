"""
HealthGraph SQLite Repository & In-Memory Store.

Provides high-performance local relational indexing and raw JSON storage
for FHIR R4 resources. Supports query by resource type, ID, and patient subject.
"""

import sqlite3
import json
from typing import List, Dict, Any, Optional, Tuple


class FHIRRepository:
    """Manages SQLite storage and indexing of FHIR resources."""

    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        """Initializes normalized relational tables and index structures."""
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS resources (
                    resource_type TEXT NOT NULL,
                    id TEXT NOT NULL,
                    patient_id TEXT,
                    encounter_id TEXT,
                    status TEXT,
                    title TEXT,
                    date_recorded TEXT,
                    raw_json TEXT NOT NULL,
                    PRIMARY KEY (resource_type, id)
                );
            """)
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_res_type ON resources(resource_type);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_res_patient ON resources(patient_id);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_res_encounter ON resources(encounter_id);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_res_date ON resources(date_recorded);")

            # Reference graph edge table for fast join & topology queries
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS resource_references (
                    source_type TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    reference_path TEXT NOT NULL,
                    target_type TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    display TEXT
                );
            """)
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_ref_src ON resource_references(source_type, source_id);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_ref_tgt ON resource_references(target_type, target_id);")

    def insert_resource(self, resource: Dict[str, Any], overwrite: bool = True) -> bool:
        """Indexes and stores a FHIR resource."""
        res_type = resource.get("resourceType")
        res_id = resource.get("id")
        if not res_type or not res_id:
            return False

        # Extract patient reference if applicable
        patient_id = None
        subj = resource.get("subject")
        if subj and isinstance(subj, dict):
            ref = subj.get("reference", "")
            if "Patient/" in ref:
                patient_id = ref.split("Patient/")[1]
        elif res_type == "Patient":
            patient_id = res_id

        # Extract encounter reference if applicable
        encounter_id = None
        enc = resource.get("encounter")
        if enc and isinstance(enc, dict):
            ref = enc.get("reference", "")
            if "Encounter/" in ref:
                encounter_id = ref.split("Encounter/")[1]
        elif res_type == "Encounter":
            encounter_id = res_id

        # Extract date
        date_recorded = (
            resource.get("effectiveDateTime") or
            resource.get("performedDateTime") or
            resource.get("authoredOn") or
            resource.get("onsetDateTime") or
            (resource.get("period", {}).get("start") if isinstance(resource.get("period"), dict) else None) or
            resource.get("birthDate")
        )

        # Extract human readable title
        title = None
        if res_type == "Patient":
            names = resource.get("name", [])
            if names:
                n = names[0]
                given = " ".join(n.get("given", []))
                title = f"{given} {n.get('family', '')}".strip()
        elif res_type == "Observation" or res_type == "Condition" or res_type == "Procedure":
            code = resource.get("code")
            if isinstance(code, dict):
                title = code.get("text")
                if not title and code.get("coding"):
                    title = code["coding"][0].get("display")
        elif res_type == "MedicationRequest":
            med = resource.get("medicationCodeableConcept")
            if isinstance(med, dict):
                title = med.get("text")
        elif res_type == "Encounter":
            types = resource.get("type", [])
            if types and isinstance(types[0], dict):
                title = types[0].get("text")

        if not title:
            title = f"{res_type} {res_id}"

        status = resource.get("status")
        if not status and resource.get("clinicalStatus"):
            cs = resource["clinicalStatus"]
            status = cs.get("text") or (cs.get("coding", [{}])[0].get("code") if cs.get("coding") else None)

        raw_json_str = json.dumps(resource)

        with self.conn:
            if overwrite:
                self.conn.execute("""
                    INSERT OR REPLACE INTO resources 
                    (resource_type, id, patient_id, encounter_id, status, title, date_recorded, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (res_type, res_id, patient_id, encounter_id, status, title, date_recorded, raw_json_str))
            else:
                self.conn.execute("""
                    INSERT INTO resources 
                    (resource_type, id, patient_id, encounter_id, status, title, date_recorded, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (res_type, res_id, patient_id, encounter_id, status, title, date_recorded, raw_json_str))

        return True

    def load_bundle(self, bundle_dict: Dict[str, Any]) -> int:
        """Loads and indexes all resources from a FHIR Bundle."""
        entries = bundle_dict.get("entry", [])
        loaded = 0
        for entry in entries:
            res = entry.get("resource")
            if res:
                self.insert_resource(res, overwrite=True)
                loaded += 1
        return loaded

    def get_resource(self, resource_type: str, resource_id: str) -> Optional[Dict[str, Any]]:
        """Fetches a single resource by type and ID."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT raw_json FROM resources WHERE resource_type = ? AND id = ?", (resource_type, resource_id))
        row = cursor.fetchone()
        if row:
            return json.loads(row["raw_json"])
        return None

    def list_resources(self, resource_type: Optional[str] = None, patient_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves resources matching optional type and patient filters."""
        cursor = self.conn.cursor()
        query = "SELECT raw_json FROM resources WHERE 1=1"
        params: List[Any] = []
        if resource_type:
            query += " AND resource_type = ?"
            params.append(resource_type)
        if patient_id:
            query += " AND patient_id = ?"
            params.append(patient_id)
        query += " ORDER BY date_recorded DESC, id ASC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [json.loads(row["raw_json"]) for row in rows]

    def list_resource_summaries(self, resource_type: Optional[str] = None, patient_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves lightweight index metadata for high-speed table rendering."""
        cursor = self.conn.cursor()
        query = "SELECT resource_type, id, patient_id, encounter_id, status, title, date_recorded FROM resources WHERE 1=1"
        params: List[Any] = []
        if resource_type:
            query += " AND resource_type = ?"
            params.append(resource_type)
        if patient_id:
            query += " AND patient_id = ?"
            params.append(patient_id)
        query += " ORDER BY date_recorded DESC, id ASC"

        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    def count_by_type(self) -> Dict[str, int]:
        """Returns resource counts grouped by FHIR resource type."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT resource_type, COUNT(*) as cnt FROM resources GROUP BY resource_type ORDER BY cnt DESC")
        return {row["resource_type"]: row["cnt"] for row in cursor.fetchall()}

    def get_all_patients(self) -> List[Dict[str, Any]]:
        """Returns all Patient resources."""
        return self.list_resources(resource_type="Patient")

    def search_resources(
        self,
        query: Optional[str] = None,
        resource_type: Optional[str] = None,
        patient_id: Optional[str] = None,
        code: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Performs multi-criteria deterministic search across indexed FHIR resources."""
        cursor = self.conn.cursor()
        sql = "SELECT resource_type, id, patient_id, encounter_id, status, title, date_recorded, raw_json FROM resources WHERE 1=1"
        params: List[Any] = []

        if resource_type:
            sql += " AND resource_type = ?"
            params.append(resource_type)

        if patient_id:
            sql += " AND (patient_id = ? OR id = ?)"
            params.extend([patient_id, patient_id])

        if status:
            sql += " AND status LIKE ?"
            params.append(f"%{status}%")

        if code:
            sql += " AND raw_json LIKE ?"
            params.append(f"%{code}%")

        if query:
            q_clean = f"%{query.strip()}%"
            sql += " AND (title LIKE ? OR id LIKE ? OR raw_json LIKE ?)"
            params.extend([q_clean, q_clean, q_clean])

        sql += " ORDER BY date_recorded DESC, id ASC LIMIT ?"
        params.append(limit)

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        results = []
        for r in rows:
            results.append({
                "resourceType": r["resource_type"],
                "id": r["id"],
                "patientId": r["patient_id"],
                "encounterId": r["encounter_id"],
                "status": r["status"],
                "title": r["title"],
                "dateRecorded": r["date_recorded"],
                "resource": json.loads(r["raw_json"])
            })
        return results

    def clear_all(self) -> None:
        """Empties repository tables for fresh bundle import."""
        with self.conn:
            self.conn.execute("DELETE FROM resources;")
            self.conn.execute("DELETE FROM resource_references;")


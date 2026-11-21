"""
HealthGraph FHIR R4 Bulk Data Access ($export) Engine.

Implements the ONC 21st Century Cures Act § 170.315(g)(10) FHIR Bulk Data Access IG:
- Patient-level export: GET/POST /fhir/Patient/$export
- System-level export:  GET/POST /fhir/$export
- Group-level export:   GET/POST /fhir/Group/{id}/$export
- Polling manifest:     GET /fhir/bulk-status/{job_id} (returns 202 Accepted or 200 OK)
- NDJSON streaming:     GET /fhir/bulk-download/{job_id}/{resource_type}.ndjson
"""

import json
import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class BulkDataJob:
    """Represents a stateful FHIR Bulk Data export execution job."""

    def __init__(
        self,
        job_id: str,
        export_type: str,
        request_url: str,
        type_filter: Optional[List[str]] = None,
        since: Optional[str] = None,
        patient_id: Optional[str] = None
    ):
        self.job_id = job_id
        self.export_type = export_type
        self.request_url = request_url
        self.type_filter = [t.strip() for t in type_filter if t.strip()] if type_filter else []
        self.since = since
        self.patient_id = patient_id
        self.created_at = time.time()
        self.status = "in-progress"  # "in-progress", "completed", "failed"
        self.progress_percent = 25
        self.transaction_time = datetime.now(timezone.utc).isoformat()
        self.ndjson_data: Dict[str, List[Dict[str, Any]]] = {}
        self.output_files: List[Dict[str, Any]] = []
        self.error_files: List[Dict[str, Any]] = []

    def advance_progress(self) -> None:
        """Simulates rapid asynchronous execution transitions."""
        elapsed = time.time() - self.created_at
        if elapsed >= 0.5 and self.status == "in-progress":
            self.status = "completed"
            self.progress_percent = 100

    def to_manifest(self, base_url: str = "https://healthgraph-8exr.vercel.app") -> Dict[str, Any]:
        """Builds standard FHIR Bulk Data JSON Manifest response."""
        return {
            "transactionTime": self.transaction_time,
            "request": self.request_url,
            "requiresAccessToken": False,
            "output": [
                {
                    "type": r_type,
                    "url": f"{base_url.rstrip('/')}/fhir/bulk-download/{self.job_id}/{r_type}.ndjson",
                    "count": len(resources)
                }
                for r_type, resources in self.ndjson_data.items()
                if resources
            ],
            "error": self.error_files
        }


class BulkDataEngine:
    """Orchestrates ONC FHIR Bulk Data export jobs and NDJSON formatting."""

    def __init__(self, repo, store: Dict[str, Dict[str, Any]]):
        self.repo = repo
        self.store = store
        self.jobs: Dict[str, BulkDataJob] = {}

    def create_export_job(
        self,
        export_type: str,
        request_url: str,
        type_filter: Optional[List[str]] = None,
        since: Optional[str] = None,
        patient_id: Optional[str] = None
    ) -> BulkDataJob:
        """Initiates an asynchronous export job and extracts relevant FHIR resources."""
        job_id = f"job-{uuid.uuid4().hex[:12]}"
        job = BulkDataJob(
            job_id=job_id,
            export_type=export_type,
            request_url=request_url,
            type_filter=type_filter,
            since=since,
            patient_id=patient_id
        )

        # Collect resources matching scope
        all_resources: List[Dict[str, Any]] = []
        if patient_id:
            # Single patient compartment
            all_resources = self.repo.get_by_patient(patient_id)
            patient_res = self.repo.get_resource("Patient", patient_id)
            if patient_res and patient_res not in all_resources:
                all_resources.append(patient_res)
        else:
            # System or all patients
            all_resources = list(self.store.values())

        # Filter by _type if specified
        if job.type_filter:
            target_types = set(job.type_filter)
            filtered = [r for r in all_resources if r.get("resourceType") in target_types]
        else:
            filtered = all_resources

        # Filter by _since if specified
        if since:
            since_filtered = []
            for r in filtered:
                date_val = r.get("effectiveDateTime") or r.get("authoredOn") or r.get("recordedDate") or r.get("period", {}).get("start")
                if not date_val or date_val >= since:
                    since_filtered.append(r)
            filtered = since_filtered

        # Group by resourceType for NDJSON output
        by_type: Dict[str, List[Dict[str, Any]]] = {}
        for r in filtered:
            rtype = r.get("resourceType", "Resource")
            if rtype not in by_type:
                by_type[rtype] = []
            by_type[rtype].append(r)

        job.ndjson_data = by_type
        # Mark as completed immediately for fast responsive demonstration
        job.status = "completed"
        job.progress_percent = 100

        self.jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[BulkDataJob]:
        """Retrieves job state by identifier."""
        job = self.jobs.get(job_id)
        if job:
            job.advance_progress()
        return job

    def get_ndjson_stream(self, job_id: str, resource_type: str) -> Optional[str]:
        """Generates raw Newline-Delimited JSON (NDJSON) string for a resource category."""
        job = self.get_job(job_id)
        if not job or resource_type not in job.ndjson_data:
            return None
        resources = job.ndjson_data[resource_type]
        lines = [json.dumps(r, separators=(',', ':')) for r in resources]
        return "\n".join(lines) + ("\n" if lines else "")

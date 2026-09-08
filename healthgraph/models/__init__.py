"""
HealthGraph Resource Models Package.
"""

from typing import Dict, Type
from .base import (
    FHIRBaseModel, Coding, CodeableConcept, Identifier, Reference,
    Period, Quantity, HumanName, Address, ContactPoint
)
from .patient import Patient
from .encounter import Encounter, EncounterParticipant, EncounterDiagnosis
from .clinical import (
    Observation, ObservationReferenceRange, Condition, ConditionStage,
    Procedure, ProcedurePerformer, DiagnosticReport, DiagnosticReportMedia
)
from .medication import Medication, MedicationRequest, Dosage
from .administrative import Practitioner, Organization, Qualification
from .bundle import Bundle, BundleEntry

RESOURCE_TYPE_MAP: Dict[str, Type[FHIRBaseModel]] = {
    "Patient": Patient,
    "Encounter": Encounter,
    "Observation": Observation,
    "Condition": Condition,
    "Procedure": Procedure,
    "DiagnosticReport": DiagnosticReport,
    "Medication": Medication,
    "MedicationRequest": MedicationRequest,
    "Practitioner": Practitioner,
    "Organization": Organization,
    "Bundle": Bundle,
}

__all__ = [
    "FHIRBaseModel",
    "Coding",
    "CodeableConcept",
    "Identifier",
    "Reference",
    "Period",
    "Quantity",
    "HumanName",
    "Address",
    "ContactPoint",
    "Patient",
    "Encounter",
    "EncounterParticipant",
    "EncounterDiagnosis",
    "Observation",
    "ObservationReferenceRange",
    "Condition",
    "ConditionStage",
    "Procedure",
    "ProcedurePerformer",
    "DiagnosticReport",
    "DiagnosticReportMedia",
    "Medication",
    "MedicationRequest",
    "Dosage",
    "Practitioner",
    "Organization",
    "Qualification",
    "Bundle",
    "BundleEntry",
    "RESOURCE_TYPE_MAP",
]

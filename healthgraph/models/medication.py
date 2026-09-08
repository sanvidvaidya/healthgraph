"""
HealthGraph Medication Resource Models (FHIR R4).
Includes Medication and MedicationRequest.
"""

from typing import List, Optional, Literal, Any
from pydantic import Field
from .base import FHIRBaseModel, Identifier, CodeableConcept, Reference, Period, Quantity


class Dosage(FHIRBaseModel):
    """How the medication is/was taken or should be taken by the patient."""
    sequence: Optional[int] = None
    text: Optional[str] = None
    timing: Optional[Any] = None
    asNeededBoolean: Optional[bool] = None
    site: Optional[CodeableConcept] = None
    route: Optional[CodeableConcept] = None
    method: Optional[CodeableConcept] = None
    doseAndRate: List[dict] = Field(default_factory=list)


class Medication(FHIRBaseModel):
    """Definition of a medication."""
    resourceType: Literal["Medication"] = "Medication"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    code: Optional[CodeableConcept] = None
    status: Optional[str] = "active"
    manufacturer: Optional[Reference] = None
    form: Optional[CodeableConcept] = None
    amount: Optional[dict] = None


class MedicationRequest(FHIRBaseModel):
    """An order or request for both supply of the medication and the instructions for administration."""
    resourceType: Literal["MedicationRequest"] = "MedicationRequest"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    status: str  # active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown
    statusReason: Optional[CodeableConcept] = None
    intent: str  # proposal | plan | order | original-order | reflex-order | filler-order | instance-order | option
    category: List[CodeableConcept] = Field(default_factory=list)
    priority: Optional[str] = None  # routine | urgent | asap | stat
    doNotPerform: Optional[bool] = None
    medicationCodeableConcept: Optional[CodeableConcept] = None
    medicationReference: Optional[Reference] = None
    subject: Reference
    encounter: Optional[Reference] = None
    authoredOn: Optional[str] = None
    requester: Optional[Reference] = None
    performer: Optional[Reference] = None
    recorder: Optional[Reference] = None
    reasonCode: List[CodeableConcept] = Field(default_factory=list)
    reasonReference: List[Reference] = Field(default_factory=list)
    dosageInstruction: List[Dosage] = Field(default_factory=list)
    dispenseRequest: Optional[dict] = None

    @property
    def medication_name(self) -> str:
        """Returns the primary medication name."""
        if self.medicationCodeableConcept:
            return self.medicationCodeableConcept.primary_display
        if self.medicationReference and self.medicationReference.display:
            return self.medicationReference.display
        return "Unspecified Medication"

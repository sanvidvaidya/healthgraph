"""
HealthGraph Encounter Resource Model (FHIR R4).
"""

from typing import List, Optional, Literal
from pydantic import Field
from .base import FHIRBaseModel, Identifier, CodeableConcept, Coding, Reference, Period


class EncounterParticipant(FHIRBaseModel):
    """List of participants involved in the encounter."""
    type: List[CodeableConcept] = Field(default_factory=list)
    period: Optional[Period] = None
    individual: Optional[Reference] = None


class EncounterDiagnosis(FHIRBaseModel):
    """The list of diagnosis relevant to this encounter."""
    condition: Reference
    use: Optional[CodeableConcept] = None
    rank: Optional[int] = None


class Encounter(FHIRBaseModel):
    """An interaction between a patient and healthcare provider(s)."""
    resourceType: Literal["Encounter"] = "Encounter"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    status: str  # planned | arrived | triaged | in-progress | onleave | finished | cancelled
    class_: Coding = Field(..., alias="class")
    type: List[CodeableConcept] = Field(default_factory=list)
    serviceType: Optional[CodeableConcept] = None
    priority: Optional[CodeableConcept] = None
    subject: Reference
    participant: List[EncounterParticipant] = Field(default_factory=list)
    period: Optional[Period] = None
    reasonCode: List[CodeableConcept] = Field(default_factory=list)
    diagnosis: List[EncounterDiagnosis] = Field(default_factory=list)
    serviceProvider: Optional[Reference] = None

    @property
    def display_title(self) -> str:
        """Returns readable title for encounter."""
        if self.type:
            return self.type[0].primary_display
        if self.reasonCode:
            return self.reasonCode[0].primary_display
        if self.class_ and self.class_.display:
            return f"{self.class_.display} Encounter"
        return f"{self.class_.code.upper() if self.class_ and self.class_.code else 'General'} Encounter"

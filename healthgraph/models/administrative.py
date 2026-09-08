"""
HealthGraph Administrative Resource Models (FHIR R4).
Includes Practitioner and Organization.
"""

from typing import List, Optional, Literal, Any
from pydantic import Field
from .base import FHIRBaseModel, Identifier, HumanName, ContactPoint, Address, CodeableConcept, Reference


class Qualification(FHIRBaseModel):
    """Certification, licenses, or training pertaining to the provision of care."""
    identifier: List[Identifier] = Field(default_factory=list)
    code: CodeableConcept
    issuer: Optional[Reference] = None


class Practitioner(FHIRBaseModel):
    """A person who is directly or indirectly involved in the healthcare process."""
    resourceType: Literal["Practitioner"] = "Practitioner"
    id: str
    active: bool = True
    identifier: List[Identifier] = Field(default_factory=list)
    name: List[HumanName] = Field(default_factory=list)
    telecom: List[ContactPoint] = Field(default_factory=list)
    address: List[Address] = Field(default_factory=list)
    gender: Optional[str] = None
    birthDate: Optional[str] = None
    qualification: List[Qualification] = Field(default_factory=list)

    @property
    def display_name(self) -> str:
        if self.name:
            return self.name[0].full_name
        return "Unknown Practitioner"

    @property
    def specialty(self) -> str:
        for q in self.qualification:
            return q.code.primary_display
        return "General Practice"


class Organization(FHIRBaseModel):
    """A formally or informally recognized grouping of people or organizations formed for the purpose of achieving some form of collective action."""
    resourceType: Literal["Organization"] = "Organization"
    id: str
    active: bool = True
    type: List[CodeableConcept] = Field(default_factory=list)
    name: str
    alias: List[str] = Field(default_factory=list)
    telecom: List[ContactPoint] = Field(default_factory=list)
    address: List[Address] = Field(default_factory=list)
    partOf: Optional[Reference] = None

    @property
    def display_type(self) -> str:
        if self.type:
            return self.type[0].primary_display
        return "Healthcare Provider"

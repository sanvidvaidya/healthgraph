"""
HealthGraph Patient Resource Model (FHIR R4).
"""

from typing import List, Optional, Literal
from pydantic import Field
from .base import FHIRBaseModel, Identifier, HumanName, ContactPoint, Address, CodeableConcept, Reference


class Patient(FHIRBaseModel):
    """Demographics and administrative information about an individual receiving care."""
    resourceType: Literal["Patient"] = "Patient"
    id: str
    active: bool = True
    identifier: List[Identifier] = Field(default_factory=list)
    name: List[HumanName] = Field(default_factory=list)
    telecom: List[ContactPoint] = Field(default_factory=list)
    gender: Optional[str] = None  # male | female | other | unknown
    birthDate: Optional[str] = None  # YYYY, YYYY-MM, or YYYY-MM-DD
    deceasedBoolean: Optional[bool] = False
    address: List[Address] = Field(default_factory=list)
    maritalStatus: Optional[CodeableConcept] = None
    generalPractitioner: List[Reference] = Field(default_factory=list)
    managingOrganization: Optional[Reference] = None

    @property
    def primary_name(self) -> str:
        """Returns primary display name."""
        if not self.name:
            return "Unknown Patient"
        return self.name[0].full_name

    @property
    def primary_mrn(self) -> Optional[str]:
        """Returns medical record number if available."""
        for ident in self.identifier:
            if ident.type and ident.type.primary_code == "MR":
                return ident.value
            if ident.system and "mrn" in ident.system.lower():
                return ident.value
        if self.identifier and self.identifier[0].value:
            return self.identifier[0].value
        return None

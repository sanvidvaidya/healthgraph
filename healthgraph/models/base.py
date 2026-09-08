"""
HealthGraph Base FHIR R4 Data Types.
Implements official HL7 FHIR Release 4 foundational data types with Pydantic v2.
"""

from typing import List, Optional, Tuple, Any
from pydantic import BaseModel, ConfigDict, Field


class FHIRBaseModel(BaseModel):
    """Base model for all FHIR resources and complex types."""
    model_config = ConfigDict(
        populate_by_name=True,
        extra="allow",
        str_strip_whitespace=True,
    )


class Coding(FHIRBaseModel):
    """A reference to a code defined by a terminology system."""
    system: Optional[str] = None
    version: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = None
    userSelected: Optional[bool] = None


class CodeableConcept(FHIRBaseModel):
    """Concept represented by referring to one or more terminologies or text."""
    coding: List[Coding] = Field(default_factory=list)
    text: Optional[str] = None

    @property
    def primary_display(self) -> str:
        """Returns the most human-meaningful display name or text."""
        if self.text:
            return self.text
        for c in self.coding:
            if c.display:
                return c.display
            if c.code:
                return c.code
        return "Unknown Concept"

    @property
    def primary_code(self) -> Optional[str]:
        """Returns the primary code identifier."""
        for c in self.coding:
            if c.code:
                return c.code
        return None


class Identifier(FHIRBaseModel):
    """An identifier intended for computation (e.g. MRN, NPI, DL)."""
    use: Optional[str] = None  # usual | official | temp | secondary | old
    type: Optional[CodeableConcept] = None
    system: Optional[str] = None
    value: Optional[str] = None
    period: Optional[Any] = None


class Reference(FHIRBaseModel):
    """A reference from one resource to another."""
    reference: Optional[str] = None  # e.g. "Patient/pat-1" or "#temp"
    type: Optional[str] = None       # e.g. "Patient"
    identifier: Optional[Identifier] = None
    display: Optional[str] = None

    def parse(self) -> Tuple[Optional[str], Optional[str]]:
        """
        Parses relative reference string into (resource_type, id).
        Example: 'Patient/pat-1' -> ('Patient', 'pat-1')
        """
        if not self.reference:
            return (None, None)
        ref = self.reference.strip()
        if ref.startswith("#"):
            return ("Contained", ref[1:])
        parts = ref.split("/")
        if len(parts) == 2:
            return (parts[0], parts[1])
        if len(parts) > 2:
            return (parts[-2], parts[-1])
        return (self.type, ref)


class Period(FHIRBaseModel):
    """A time period defined by a start and optional end date/time."""
    start: Optional[str] = None
    end: Optional[str] = None


class Quantity(FHIRBaseModel):
    """A measured or countable amount."""
    value: Optional[float] = None
    comparator: Optional[str] = None  # < | <= | >= | >
    unit: Optional[str] = None
    system: Optional[str] = None
    code: Optional[str] = None

    def formatted(self) -> str:
        """Human-readable representation with unit."""
        if self.value is None:
            return "N/A"
        cmp = self.comparator or ""
        u = self.unit or self.code or ""
        return f"{cmp}{self.value} {u}".strip()


class HumanName(FHIRBaseModel):
    """Name of a human with text, family, and given parts."""
    use: Optional[str] = None  # usual | official | temp | nickname | anonymous | old | maiden
    text: Optional[str] = None
    family: Optional[str] = None
    given: List[str] = Field(default_factory=list)
    prefix: List[str] = Field(default_factory=list)
    suffix: List[str] = Field(default_factory=list)

    @property
    def full_name(self) -> str:
        """Produces canonical formatted human name."""
        if self.text:
            return self.text
        parts = []
        if self.prefix:
            parts.extend(self.prefix)
        if self.given:
            parts.extend(self.given)
        if self.family:
            parts.append(self.family)
        if self.suffix:
            parts.extend(self.suffix)
        return " ".join(parts) if parts else "Anonymous"


class Address(FHIRBaseModel):
    """An address expressed using postal conventions."""
    use: Optional[str] = None  # home | work | temp | old | billing
    type: Optional[str] = None # postal | physical | both
    text: Optional[str] = None
    line: List[str] = Field(default_factory=list)
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None

    @property
    def inline(self) -> str:
        parts = []
        if self.line:
            parts.append(", ".join(self.line))
        loc = [p for p in [self.city, self.state, self.postalCode] if p]
        if loc:
            parts.append(" ".join(loc))
        if self.country:
            parts.append(self.country)
        return ", ".join(parts) if parts else "No Address Recorded"


class ContactPoint(FHIRBaseModel):
    """Details for all kinds of technology-mediated contacts."""
    system: Optional[str] = None  # phone | fax | email | pager | url | sms | other
    value: Optional[str] = None
    use: Optional[str] = None     # home | work | temp | old | mobile
    rank: Optional[int] = None

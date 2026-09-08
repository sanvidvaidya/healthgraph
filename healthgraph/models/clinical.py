"""
HealthGraph Clinical Resource Models (FHIR R4).
Includes Observation, Condition, Procedure, and DiagnosticReport.
"""

from typing import List, Optional, Literal, Any
from pydantic import Field
from .base import FHIRBaseModel, Identifier, CodeableConcept, Reference, Period, Quantity


# -------------------------------------------------------------------------
# Observation
# -------------------------------------------------------------------------

class ObservationReferenceRange(FHIRBaseModel):
    """Provides guide for interpretation of result."""
    low: Optional[Quantity] = None
    high: Optional[Quantity] = None
    type: Optional[CodeableConcept] = None
    appliesTo: List[CodeableConcept] = Field(default_factory=list)
    age: Optional[Any] = None
    text: Optional[str] = None


class Observation(FHIRBaseModel):
    """Measurements and simple assertions made about a patient."""
    resourceType: Literal["Observation"] = "Observation"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    status: str  # registered | preliminary | final | amended +
    category: List[CodeableConcept] = Field(default_factory=list)
    code: CodeableConcept
    subject: Optional[Reference] = None
    encounter: Optional[Reference] = None
    effectiveDateTime: Optional[str] = None
    effectivePeriod: Optional[Period] = None
    issued: Optional[str] = None
    performer: List[Reference] = Field(default_factory=list)
    valueQuantity: Optional[Quantity] = None
    valueCodeableConcept: Optional[CodeableConcept] = None
    valueString: Optional[str] = None
    valueBoolean: Optional[bool] = None
    interpretation: List[CodeableConcept] = Field(default_factory=list)
    note: List[dict] = Field(default_factory=list)
    bodySite: Optional[CodeableConcept] = None
    method: Optional[CodeableConcept] = None
    referenceRange: List[ObservationReferenceRange] = Field(default_factory=list)
    hasMember: List[Reference] = Field(default_factory=list)
    derivedFrom: List[Reference] = Field(default_factory=list)

    @property
    def formatted_value(self) -> str:
        """Returns unified formatted clinical measurement."""
        if self.valueQuantity:
            return self.valueQuantity.formatted()
        if self.valueCodeableConcept:
            return self.valueCodeableConcept.primary_display
        if self.valueString:
            return self.valueString
        if self.valueBoolean is not None:
            return str(self.valueBoolean)
        return "Not Recorded"

    @property
    def category_code(self) -> str:
        for cat in self.category:
            for cod in cat.coding:
                if cod.code:
                    return cod.code
        return "clinical"


# -------------------------------------------------------------------------
# Condition
# -------------------------------------------------------------------------

class ConditionStage(FHIRBaseModel):
    """Stage/grade, usually assessed formally."""
    summary: Optional[CodeableConcept] = None
    assessment: List[Reference] = Field(default_factory=list)
    type: Optional[CodeableConcept] = None


class Condition(FHIRBaseModel):
    """A clinical condition, problem, diagnosis, or other event/situation."""
    resourceType: Literal["Condition"] = "Condition"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    clinicalStatus: Optional[CodeableConcept] = None  # active | recurrence | relapse | inactive | remission | resolved
    verificationStatus: Optional[CodeableConcept] = None  # unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    category: List[CodeableConcept] = Field(default_factory=list)
    severity: Optional[CodeableConcept] = None  # mild | moderate | severe
    code: Optional[CodeableConcept] = None
    bodySite: List[CodeableConcept] = Field(default_factory=list)
    subject: Reference
    encounter: Optional[Reference] = None
    onsetDateTime: Optional[str] = None
    onsetPeriod: Optional[Period] = None
    abatementDateTime: Optional[str] = None
    recordedDate: Optional[str] = None
    recorder: Optional[Reference] = None
    asserter: Optional[Reference] = None
    stage: List[ConditionStage] = Field(default_factory=list)

    @property
    def display_name(self) -> str:
        if self.code:
            return self.code.primary_display
        return "Unspecified Condition"

    @property
    def status_display(self) -> str:
        if self.clinicalStatus:
            return self.clinicalStatus.primary_display
        return "Unknown"


# -------------------------------------------------------------------------
# Procedure
# -------------------------------------------------------------------------

class ProcedurePerformer(FHIRBaseModel):
    """The people who performed the procedure."""
    function: Optional[CodeableConcept] = None
    actor: Reference
    onBehalfOf: Optional[Reference] = None


class Procedure(FHIRBaseModel):
    """An action that is or was performed on or for a patient."""
    resourceType: Literal["Procedure"] = "Procedure"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    status: str  # preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
    statusReason: Optional[CodeableConcept] = None
    category: Optional[CodeableConcept] = None
    code: Optional[CodeableConcept] = None
    subject: Reference
    encounter: Optional[Reference] = None
    performedDateTime: Optional[str] = None
    performedPeriod: Optional[Period] = None
    recorder: Optional[Reference] = None
    asserter: Optional[Reference] = None
    performer: List[ProcedurePerformer] = Field(default_factory=list)
    location: Optional[Reference] = None
    reasonCode: List[CodeableConcept] = Field(default_factory=list)
    bodySite: List[CodeableConcept] = Field(default_factory=list)
    outcome: Optional[CodeableConcept] = None
    report: List[Reference] = Field(default_factory=list)
    complication: List[CodeableConcept] = Field(default_factory=list)

    @property
    def display_name(self) -> str:
        if self.code:
            return self.code.primary_display
        return "Unspecified Procedure"


# -------------------------------------------------------------------------
# DiagnosticReport
# -------------------------------------------------------------------------

class DiagnosticReportMedia(FHIRBaseModel):
    """Key images associated with this report."""
    comment: Optional[str] = None
    link: Reference


class DiagnosticReport(FHIRBaseModel):
    """The findings and interpretation of diagnostic tests performed on patients."""
    resourceType: Literal["DiagnosticReport"] = "DiagnosticReport"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    basedOn: List[Reference] = Field(default_factory=list)
    status: str  # registered | partial | preliminary | final +
    category: List[CodeableConcept] = Field(default_factory=list)
    code: CodeableConcept
    subject: Optional[Reference] = None
    encounter: Optional[Reference] = None
    effectiveDateTime: Optional[str] = None
    effectivePeriod: Optional[Period] = None
    issued: Optional[str] = None
    performer: List[Reference] = Field(default_factory=list)
    resultsInterpreter: List[Reference] = Field(default_factory=list)
    result: List[Reference] = Field(default_factory=list)  # References to Observations
    imagingStudy: List[Reference] = Field(default_factory=list)
    media: List[DiagnosticReportMedia] = Field(default_factory=list)
    conclusion: Optional[str] = None
    conclusionCode: List[CodeableConcept] = Field(default_factory=list)

    @property
    def display_title(self) -> str:
        return self.code.primary_display

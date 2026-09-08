"""
HealthGraph Bundle Resource Model (FHIR R4).
"""

from typing import List, Optional, Literal, Any, Dict
from pydantic import Field
from .base import FHIRBaseModel, Identifier


class BundleLink(FHIRBaseModel):
    relation: str
    url: str


class BundleEntrySearch(FHIRBaseModel):
    mode: Optional[str] = None
    score: Optional[float] = None


class BundleEntryRequest(FHIRBaseModel):
    method: str
    url: str


class BundleEntryResponse(FHIRBaseModel):
    status: str
    location: Optional[str] = None


class BundleEntry(FHIRBaseModel):
    """Entry in the bundle."""
    fullUrl: Optional[str] = None
    resource: Dict[str, Any]
    search: Optional[BundleEntrySearch] = None
    request: Optional[BundleEntryRequest] = None
    response: Optional[BundleEntryResponse] = None


class Bundle(FHIRBaseModel):
    """A container for a collection of resources."""
    resourceType: Literal["Bundle"] = "Bundle"
    id: Optional[str] = None
    identifier: Optional[Identifier] = None
    type: str = "collection"  # document | message | transaction | transaction-response | batch | batch-response | history | searchset | collection
    timestamp: Optional[str] = None
    total: Optional[int] = None
    link: List[BundleLink] = Field(default_factory=list)
    entry: List[BundleEntry] = Field(default_factory=list)

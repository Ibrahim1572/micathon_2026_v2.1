from pydantic import BaseModel
from typing import Dict, List


class ParseRequest(BaseModel):
    receipt_text: str


class ParseResponse(BaseModel):
    categories: Dict[str, List[str]]


class SubstitutionsRequest(BaseModel):
    items: List[str]


class SubstitutionItem(BaseModel):
    id: int
    category: str
    imported_name: str
    imported_price: float
    local_name: str
    local_price: float
    savings: float


class SubstitutionsResponse(BaseModel):
    substitutions: List[SubstitutionItem]


class SurplusRequest(BaseModel):
    accepted_substitutions: List[SubstitutionItem]


class SurplusResponse(BaseModel):
    original_total: float
    new_total: float
    surplus: float

from fastapi import APIRouter

from models import SurplusRequest, SurplusResponse

router = APIRouter()


@router.post("/surplus", response_model=SurplusResponse)
def calculate_surplus(request: SurplusRequest):
    """
    Compute original basket total, new basket total, and the savings surplus.

    Input : { "accepted_substitutions": [{ SubstitutionItem }, ...] }
    Output: { "original_total": 5920.0, "new_total": 2030.0, "surplus": 3890.0 }

    Invariant guaranteed: original_total - new_total == surplus (to 2 decimal places)
    """
    original_total = sum(item.imported_price for item in request.accepted_substitutions)
    new_total = sum(item.local_price for item in request.accepted_substitutions)
    surplus = original_total - new_total

    return SurplusResponse(
        original_total=round(original_total, 2),
        new_total=round(new_total, 2),
        surplus=round(surplus, 2),
    )

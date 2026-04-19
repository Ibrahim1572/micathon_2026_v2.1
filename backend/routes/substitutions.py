import json
import os

from fastapi import APIRouter

from models import SubstitutionItem, SubstitutionsRequest, SubstitutionsResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Load substitutions.json ONCE at startup — shared in-memory reference.
# ---------------------------------------------------------------------------
_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "substitutions.json")

with open(_DATA_PATH, "r", encoding="utf-8") as _f:
    _SUBSTITUTIONS_DB = json.load(_f)


def _word_set(text):
    """
    Return a set of significant lowercase words (length > 3) from a string.
    Short words ('in', 'the', 'per') are ignored to reduce false-positive matches.
    """
    return {w for w in text.lower().split() if len(w) > 3}


def _matches(item_name, substitution):
    """
    Return True if the parsed item name overlaps meaningfully with either
    the imported_name or local_name of a substitution entry.
    """
    item_words = _word_set(item_name)
    imported_words = _word_set(substitution["imported_name"])
    local_words = _word_set(substitution["local_name"])

    # Any significant word intersection is sufficient for a match
    return bool(item_words & imported_words) or bool(item_words & local_words)


@router.post("/substitutions", response_model=SubstitutionsResponse)
def get_substitutions(request: SubstitutionsRequest):
    """
    Match a list of parsed item names against substitutions.json.

    Input : { "items": ["Lurpak Butter 200g", "Barilla Pasta 500g", ...] }
    Output: { "substitutions": [{ id, category, imported_name, imported_price,
                                   local_name, local_price, savings }, ...] }
    """
    matched = []
    seen_ids = set()

    for item_name in request.items:
        for sub in _SUBSTITUTIONS_DB:
            if sub["id"] in seen_ids:
                continue
            if _matches(item_name, sub):
                matched.append(
                    SubstitutionItem(
                        id=sub["id"],
                        category=sub["category"],
                        imported_name=sub["imported_name"],
                        imported_price=sub["imported_price"],
                        local_name=sub["local_name"],
                        local_price=sub["local_price"],
                        savings=sub["savings"],
                    )
                )
                seen_ids.add(sub["id"])

    return SubstitutionsResponse(substitutions=matched)

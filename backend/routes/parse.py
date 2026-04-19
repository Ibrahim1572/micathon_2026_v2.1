import json
import os
import re

from fastapi import APIRouter

from models import ParseRequest, ParseResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Load substitutions.json ONCE at startup to avoid repeated disk I/O.
# This is the only in-memory cache — intentional for hardware constraints.
# ---------------------------------------------------------------------------
_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "substitutions.json")

with open(_DATA_PATH, "r", encoding="utf-8") as _f:
    _SUBSTITUTIONS_DB = json.load(_f)

# Category keyword map built from the static data file (no hard-coding needed)
_CATEGORY_KEYWORDS = {
    "Dairy": [
        "milk", "butter", "cheese", "yogurt", "cream", "ghee", "brie",
        "anchor", "lurpak", "olper", "nurpur", "danone", "tarang",
        "philadelphia", "dairy queen", "adam"
    ],
    "Produce": [
        "apple", "banana", "kiwi", "tomato", "spinach", "avocado",
        "guava", "palak", "tamatar", "cherry", "amrood", "braeburn",
        "kashmiri", "fruit", "vegetable"
    ],
    "Grains": [
        "rice", "pasta", "oats", "flour", "cereal", "flakes", "wheat",
        "barilla", "quaker", "kolson", "uncle ben", "kellogg", "nayab",
        "sunridge", "bob's"
    ],
    "Protein": [
        "tuna", "chicken", "nuggets", "peanut", "beans", "luncheon",
        "spam", "skippy", "heinz", "young's", "k&n", "tyson", "taim",
        "mitchell"
    ],
    "Snacks": [
        "chips", "biscuit", "chocolate", "nutella", "cracker", "oreo",
        "pringles", "kitkat", "kit kat", "lays", "hilal", "bisconni",
        "ritz", "banjo", "cookie", "candi"
    ],
    "Beverages": [
        "juice", "water", "tea", "coffee", "energy", "drink", "cola",
        "tropicana", "shezan", "nestle", "lipton", "tapal", "nescafe",
        "red bull", "sting", "aquafina", "hania"
    ],
}


def _clean_line(line):
    """
    Strip prices, quantities, and filler characters from a single receipt line.
    Returns a cleaned item name string.
    """
    # Remove price patterns: Rs. 280  |  PKR 280  |  280.00
    line = re.sub(r"Rs\.?\s*[\d,]+(\.\d+)?", "", line, flags=re.IGNORECASE)
    line = re.sub(r"PKR\s*[\d,]+(\.\d+)?", "", line, flags=re.IGNORECASE)
    line = re.sub(r"\b\d+\.\d{2}\b", "", line)

    # Remove quantity patterns: x2  |  2x  |  Qty: 3
    line = re.sub(r"\bx\d+\b|\b\d+x\b|qty:\s*\d+", "", line, flags=re.IGNORECASE)

    # Remove dot leaders used in receipts: ..........
    line = re.sub(r"\.{2,}", "", line)

    # Remove dashes used as separators: -  |  —
    line = re.sub(r"\s[-—]+\s", " ", line)

    # Remove standalone numbers left behind
    line = re.sub(r"\s\d+\s", " ", line)

    return " ".join(line.split()).strip()


def _categorize(item_name):
    """
    Return the category for an item name using keyword matching.
    Returns 'Other' if no category matches.
    """
    lower = item_name.lower()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return category
    return "Other"


@router.post("/parse", response_model=ParseResponse)
def parse_receipt(request: ParseRequest):
    """
    Parse raw receipt text into categorized item lists.

    Input : { "receipt_text": "<multi-line receipt string>" }
    Output: { "categories": { "Dairy": [...], "Grains": [...], ... } }
    """
    lines = request.receipt_text.strip().split("\n")
    categories = {}
    seen = set()

    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue

        cleaned = _clean_line(line)
        if not cleaned or len(cleaned) < 3:
            continue

        # De-duplicate items within the same parse call
        if cleaned.lower() in seen:
            continue
        seen.add(cleaned.lower())

        category = _categorize(cleaned)
        if category not in categories:
            categories[category] = []
        categories[category].append(cleaned)

    return ParseResponse(categories=categories)

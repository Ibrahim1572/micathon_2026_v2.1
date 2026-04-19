from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.parse import router as parse_router
from routes.substitutions import router as substitutions_router
from routes.surplus import router as surplus_router

# ---------------------------------------------------------------------------
# Application setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Smart Saver API",
    description="Imported vs. Local grocery substitution engine.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow only the Vite dev origin to match hardcoded frontend config.
# Per error protocol: if CORS errors appear, verify these exact origins.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(parse_router, prefix="/api", tags=["Parse"])
app.include_router(substitutions_router, prefix="/api", tags=["Substitutions"])
app.include_router(surplus_router, prefix="/api", tags=["Surplus"])


# ---------------------------------------------------------------------------
# Root health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {"status": "Smart Saver API is running", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Sample receipt endpoint — used by Screen A "Load Sample" button in Phase 2.
# Returns a realistic Naheed-style receipt covering all 6 categories.
# ---------------------------------------------------------------------------
@app.get("/api/sample", tags=["Sample"])
def get_sample_receipt():
    sample = (
        "
        "Tropicana Orange Juice 1L........Rs. 580\n"
        "Lipton Yellow Label Tea 100g.....Rs. 680\n"
        "Nescafe Classic Coffee 100g......Rs. 1200\n"
        "Red Bull Energy Drink 250ml......Rs. 280"Lurpak Butter 200g...............Rs. 680\n"
        "Anchor Full Cream Milk 1L........Rs. 380\n"
        "President Brie Cheese 125g.......Rs. 1200\n"
        "Danone Natural Yogurt 400g.......Rs. 350\n"
        "Philadelphia Cream Cheese 200g...Rs. 950\n"
        "Kiwi Fruit (New Zealand) x4......Rs. 480\n"
        "Braeburn Apple (Imported) 1kg....Rs. 450\n"
        "Cherry Tomatoes (Imported) 250g..Rs. 320\n"
        "Baby Spinach (Imported) 200g.....Rs. 280\n"
        "Quaker Oats 500g.................Rs. 480\n"
        "Barilla Pasta Spaghetti 500g.....Rs. 650\n"
        "Uncle Ben's Basmati Rice 1kg.....Rs. 780\n"
        "Kellogg's Corn Flakes 500g.......Rs. 680\n"
        "Skippy Peanut Butter 500g........Rs. 920\n"
        "John West Tuna in Brine 185g.....Rs. 420\n"
        "Tyson Chicken Nuggets 500g.......Rs. 850\n"
        "Heinz Baked Beans 415g...........Rs. 480\n"
        "Pringles Original 165g...........Rs. 680\n"
        "Nutella Hazelnut Spread 400g.....Rs. 1200\n"
        "Oreo Original Cookies 154g.......Rs. 320\n"
    )
    return {"receipt_text": sample}

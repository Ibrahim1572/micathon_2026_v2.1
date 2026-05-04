# Smart Saver - Imported vs. Local Grocery Substitution Engine

Smart Saver is a web-based application designed to help consumers optimize their grocery spending by identifying imported products on their receipts and suggesting high-quality local alternatives. By leveraging AI-powered OCR and a curated substitution database, users can visualize potential savings and support local brands.

## 🚀 Tech Stack

- **Frontend:**
  - [React 19](https://reactjs.org/) - UI Framework
  - [Vite](https://vitejs.dev/) - Build Tool & Dev Server
  - [Recharts](https://recharts.org/) - Interactive Data Visualization
  - [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Custom Styling

- **Backend:**
  - [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python Web Framework
  - [Google Gemini API](https://ai.google.dev/) (gemini-2.5-flash) - Vision & OCR for receipt processing
  - [Pillow](https://python-pillow.org/) - Image processing
  - [Uvicorn](https://www.uvicorn.org/) - ASGI Server

- **Infrastructure:**
  - [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) - Containerization and Orchestration
  - [Vercel](https://vercel.com/) - Deployment Configuration

## 📁 Project Structure

```text
├── backend/                # FastAPI Application
│   ├── routes/             # API Endpoints (Parse, Substitutions, Surplus, Upload)
│   ├── main.py             # App entry point & Router config
│   ├── models.py           # Pydantic data models
│   ├── substitutions.json  # Database of imported vs local products
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/                # React components, hooks, and logic
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
├── compose.yml             # Docker Compose orchestration
├── Dockerfile.back         # Backend Docker image definition
├── Dockerfile.front        # Frontend Docker image definition
└── vercel.json             # Vercel deployment settings
```

## ⚙️ How it Works

1. **Receipt Input:** Users can upload a physical receipt image or "Load Sample" to see the engine in action.
2. **AI Extraction:** The backend uses **Google Gemini 2.5 Flash** to perform OCR on uploaded images, extracting item names, quantities, and prices.
3. **Smart Categorization:** Extracted items are categorized into groups (Dairy, Produce, Grains, Protein, Snacks, Beverages) using keyword-based logic.
4. **Substitution Logic:** The engine cross-references items against `substitutions.json` to identify imported brands and their local counterparts.
5. **Analytics & Savings:** A "Surplus" calculation determines how much money the user could have saved by choosing local alternatives, visualized through interactive charts.

## 🛠️ Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key

### Running with Docker (Recommended)
1. Clone the repository.
2. Create a `.env` file in the `backend/` directory with your Gemini API key:
   ```env
   api_key=YOUR_GEMINI_API_KEY
   ```
3. Run the following command in the root directory:
   ```bash
   docker compose up --build
   ```
4. Access the frontend at `http://localhost:5173` and the API docs at `http://localhost:8000/docs`.

### Manual Local Setup

#### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ✨ Features

- 📸 **AI-Powered OCR:** Upload receipt images for automatic item and price extraction.
- 🔁 **Local Substitutions:** Instant suggestions for local alternatives to expensive imported brands.
- 📊 **Savings Analytics:** Interactive charts showing cost comparisons and potential surplus.
- 📑 **Sample Loading:** Quick-start feature to demonstrate functionality without an actual receipt.
- 📱 **Responsive Design:** Clean, modern UI optimized for both desktop and mobile views.
- 🐳 **Containerized:** Easy deployment and local setup using Docker.

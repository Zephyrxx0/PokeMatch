# PKM // TEAM BUILDER

A Pokémon competitive team-building toolkit with data analysis, team recommendations, and personality insights. Built with Next.js and a Python Flask backend.

## Features

- **Build Team** — Choose a playstyle (balanced, hyper offense, stall, etc.), search across 1000+ Pokémon, and assemble a team of 6 with AI-powered recommendations.
- **Analyze** — Deep-dive into your team with a full type coverage matrix, stat radar charts, role breakdown, and a head-to-head matchup simulator.
- **Personality Test** — Pick 3 favourite Pokémon to discover your trainer archetype and nature via a custom personality engine.
- **3D Synergy Web** — Interactive 3D visualization of team synergy using React Three Fiber.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| 3D | React Three Fiber + Three.js |
| Backend | Python 3, Flask, Flask-CORS |
| Data | PokéAPI (fetched via script), pandas, numpy |

## Project Structure

```
app/               # Next.js app router pages & components
  build/           # Team builder page
  analyze/         # Team analysis page
  personality/     # Personality test page
  components/      # Shared UI components
  lib/             # Client-side logic (store, type effectiveness, etc.)
python/
  api/server.py    # Flask REST API (recommendations, predictions)
  models/          # Team recommender, usage predictor, playstyles
  scripts/         # Data fetching & processing scripts
data/
  raw/             # Raw PokéAPI data
  processed/       # Cleaned JSON used by the app
```

## Getting Started

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Set up the Python backend

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r app/api/requirements.txt
```

### 3. Fetch Pokémon data (first-time setup)

```bash
python python/scripts/fetch_pokeapi_data.py 1010
```

### 4. Start the Flask API

```bash
python python/api/server.py
```

### 5. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/playstyles` | List all playstyles |
| POST | `/api/recommend` | Get team recommendations for a playstyle |
| POST | `/api/predict-usage` | Predict competitive usage tier for a Pokémon |
| POST | `/api/analyze-team` | Full team analysis (coverage, weaknesses, roles) |

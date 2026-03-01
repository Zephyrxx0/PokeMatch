import os
import sys
import json

from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent dirs to path so we can import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from models.playstyles import get_playstyle, get_all_playstyles, PLAYSTYLES
from models.team_recommender import TeamRecommender
from models.usage_predictor import UsagePredictor

app = Flask(__name__)
CORS(app)

# Resolve data paths relative to project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

print("Loading data...")
with open(os.path.join(PROJECT_ROOT, "data", "processed", "pokemon_data.json"), "r") as f:
    pokemon_list = json.load(f)
with open(os.path.join(PROJECT_ROOT, "data", "processed", "type_effectiveness.json"), "r") as f:
    type_chart = json.load(f)

recommender = TeamRecommender(pokemon_list, type_chart)
predictor = UsagePredictor()
pokemon_by_id = {p["id"]: p for p in pokemon_list}
print(f"Loaded {len(pokemon_list)} Pokémon. Server ready!")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "pokemon_count": len(pokemon_list)})


@app.route("/api/playstyles", methods=["GET"])
def list_playstyles():
    return jsonify(get_all_playstyles())


@app.route("/api/recommend", methods=["POST"])
def recommend_team():
    data = request.get_json(force=True)
    playstyle_key = data.get("playstyle", "balanced")
    playstyle = get_playstyle(playstyle_key)
    result = recommender.recommend_team(playstyle)
    return jsonify(result)


@app.route("/api/predict-usage", methods=["POST"])
def predict_usage():
    data = request.get_json(force=True)
    pid = data.get("pokemon_id")
    if pid is None or pid not in pokemon_by_id:
        return jsonify({"error": "Invalid pokemon_id"}), 400
    pokemon = pokemon_by_id[pid]
    prediction = predictor.predict(pokemon)
    return jsonify({
        **prediction,
        "pokemon": {"id": pokemon["id"], "name": pokemon["name"]},
    })


@app.route("/api/recommend-fill", methods=["POST"])
def recommend_fill():
    data = request.get_json(force=True)
    partial_ids = data.get("partial_team_ids", [])
    playstyle_key = data.get("playstyle", "balanced")
    slots_needed = data.get("slots_needed", 1)
    slots_needed = max(1, min(slots_needed, 6))
    playstyle = get_playstyle(playstyle_key)
    picks = recommender.recommend_missing_slots(partial_ids, playstyle, slots_needed)
    return jsonify({"pokemon": picks})


@app.route("/api/analyze-team", methods=["POST"])
def analyze_team():
    data = request.get_json(force=True)
    team_ids = data.get("team", [])
    team = []
    for item in team_ids:
        pid = item.get("id") if isinstance(item, dict) else item
        if pid in pokemon_by_id:
            team.append(pokemon_by_id[pid])
    if not team:
        return jsonify({"error": "No valid Pokémon in team"}), 400

    synergy = recommender.calculate_synergy_score(team)
    coverage = recommender.calculate_team_coverage(team)
    weaknesses = recommender.calculate_team_weaknesses(team)
    return jsonify({
        "synergy_score": round(synergy, 2),
        "coverage": round(coverage, 2),
        "weaknesses": {k: v for k, v in weaknesses.items() if v >= 3},
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)

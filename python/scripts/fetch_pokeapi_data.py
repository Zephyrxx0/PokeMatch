"""
Fetch Pokémon data from PokéAPI.
Fetches base stats, types, and abilities for all Pokémon up to a given ID.
Outputs a JSON suitable for both the Python backend and the Next.js frontend.
"""
import requests
import json
import time
import sys


def fetch_pokemon(pid: int) -> dict | None:
    url = f"https://pokeapi.co/api/v2/pokemon/{pid}"
    try:
        r = requests.get(url, timeout=15)
        if r.status_code != 200:
            return None
        d = r.json()
        stats = {s["stat"]["name"]: s["base_stat"] for s in d["stats"]}
        return {
            "id": d["id"],
            "name": d["name"],
            "types": [t["type"]["name"] for t in d["types"]],
            "stats": {
                "hp": stats.get("hp", 0),
                "attack": stats.get("attack", 0),
                "defense": stats.get("defense", 0),
                "special_attack": stats.get("special-attack", 0),
                "special_defense": stats.get("special-defense", 0),
                "speed": stats.get("speed", 0),
            },
            "abilities": [a["ability"]["name"] for a in d["abilities"]],
            "height": d["height"],
            "weight": d["weight"],
            "sprite": d["sprites"]["front_default"],
        }
    except Exception as e:
        print(f"  Error fetching {pid}: {e}")
        return None


def assign_role(stats: dict) -> str:
    atk = stats["attack"]
    sp_atk = stats["special_attack"]
    defense = stats["defense"]
    sp_def = stats["special_defense"]
    speed = stats["speed"]
    hp = stats["hp"]
    if speed >= 100 and max(atk, sp_atk) >= 100:
        return "Sweeper"
    if hp >= 100 and min(defense, sp_def) >= 90:
        return "Tank"
    if defense >= 110 or sp_def >= 110:
        return "Wall"
    if max(atk, sp_atk) >= 90:
        return "Attacker"
    return "Support"


def speed_tier(speed: int) -> str:
    if speed >= 110:
        return "Very Fast"
    if speed >= 80:
        return "Fast"
    if speed >= 50:
        return "Medium"
    return "Slow"


def enrich(p: dict, type_chart: dict) -> dict:
    s = p["stats"]
    bst = sum(s.values())
    types = p["types"]

    # Offensive coverage score
    se_count = 0
    for atk_type in types:
        for def_type, mult in type_chart["chart"].get(atk_type, {}).items():
            if mult == 2.0:
                se_count += 1
    offensive_score = se_count / max(len(types), 1)

    # Defensive score
    resistances = 0
    weaknesses = 0
    for atk_type in type_chart["types"]:
        total = 1.0
        for def_type in types:
            total *= type_chart["chart"].get(atk_type, {}).get(def_type, 1.0)
        if total < 1.0:
            resistances += 1
        elif total > 1.0:
            weaknesses += 1

    # Simulated usage percent (based on BST tier)
    if bst >= 600:
        usage = round(15 + (bst - 600) * 0.1, 2)
    elif bst >= 500:
        usage = round(5 + (bst - 500) * 0.05, 2)
    elif bst >= 400:
        usage = round(1 + (bst - 400) * 0.02, 2)
    else:
        usage = round(max(0.1, (bst - 200) * 0.005), 2)

    return {
        **p,
        "base_stat_total": bst,
        "role": assign_role(s),
        "speed_tier": speed_tier(s["speed"]),
        "physical_bulk": s["hp"] * s["defense"],
        "special_bulk": s["hp"] * s["special_defense"],
        "offensive_score": round(offensive_score, 2),
        "defensive_score": resistances - weaknesses,
        "usage_percent": usage,
        "attack_preference": "Physical" if s["attack"] > s["special_attack"] else "Special",
    }


def main():
    max_id = int(sys.argv[1]) if len(sys.argv) > 1 else 151
    print(f"Fetching Pokémon 1–{max_id} from PokéAPI...")

    with open("data/processed/type_effectiveness.json", "r") as f:
        type_chart = json.load(f)

    pokemon_list = []
    for i in range(1, max_id + 1):
        pct = i / max_id * 100
        print(f"\r  [{pct:5.1f}%] Fetching #{i}...", end="", flush=True)
        data = fetch_pokemon(i)
        if data:
            enriched = enrich(data, type_chart)
            pokemon_list.append(enriched)
        time.sleep(0.3)  # rate-limit

    print(f"\n\nFetched {len(pokemon_list)} Pokémon")

    # Save full data for Python backend
    with open("data/processed/pokemon_data.json", "w") as f:
        json.dump(pokemon_list, f, indent=2)

    # Save compact version for Next.js (no sprites key — frontend constructs URL)
    compact = []
    for p in pokemon_list:
        compact.append({
            "id": p["id"],
            "name": p["name"],
            "types": p["types"],
            "stats": p["stats"],
            "abilities": p["abilities"],
            "base_stat_total": p["base_stat_total"],
            "role": p["role"],
            "speed_tier": p["speed_tier"],
            "physical_bulk": p["physical_bulk"],
            "special_bulk": p["special_bulk"],
            "offensive_score": p["offensive_score"],
            "defensive_score": p["defensive_score"],
            "usage_percent": p["usage_percent"],
            "attack_preference": p["attack_preference"],
        })
    with open("app/data/pokemon_data.json", "w") as f:
        json.dump(compact, f)

    # Also copy type chart for frontend
    with open("app/data/type_effectiveness.json", "w") as f:
        json.dump(type_chart, f)

    print("Data files written to data/processed/ and app/data/")


if __name__ == "__main__":
    main()

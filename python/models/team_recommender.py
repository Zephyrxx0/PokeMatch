import json
from typing import List, Dict


class TeamRecommender:
    def __init__(self, pokemon_list: List[Dict], type_chart: dict):
        self.pokemon = pokemon_list
        self.type_chart = type_chart
        # Pre-compute max stats for normalization
        stat_keys = ["hp", "attack", "defense", "special_attack", "special_defense", "speed"]
        self.max_stats = {}
        for k in stat_keys:
            self.max_stats[k] = max((p["stats"][k] for p in self.pokemon), default=1)

    def _normalize_stat(self, pokemon: dict, stat: str) -> float:
        return pokemon["stats"][stat] / max(self.max_stats.get(stat, 1), 1)

    def calculate_playstyle_score(self, pokemon: dict, playstyle: dict) -> float:
        score = 0.0
        weights = playstyle["stat_weights"]
        for stat, weight in weights.items():
            score += self._normalize_stat(pokemon, stat) * weight

        if pokemon["role"] in playstyle.get("preferred_roles", []):
            score += 0.2

        speed_tiers = ["Slow", "Medium", "Fast", "Very Fast"]
        if "min_speed_tier" in playstyle:
            min_idx = speed_tiers.index(playstyle["min_speed_tier"])
            cur_idx = speed_tiers.index(pokemon.get("speed_tier", "Medium"))
            if cur_idx >= min_idx:
                score += 0.1

        if "required_types" in playstyle:
            ptypes = [t.lower() for t in pokemon["types"]]
            if any(rt in ptypes for rt in playstyle["required_types"]):
                score += 0.3

        return score

    def calculate_team_coverage(self, team: List[dict]) -> float:
        hit = set()
        for p in team:
            for atk_type in p["types"]:
                for def_type, mult in self.type_chart["chart"].get(atk_type, {}).items():
                    if mult == 2.0:
                        hit.add(def_type)
        return len(hit) / len(self.type_chart["types"])

    def calculate_team_weaknesses(self, team: List[dict]) -> Dict[str, int]:
        counts = {t: 0 for t in self.type_chart["types"]}
        for p in team:
            for atk_type in self.type_chart["types"]:
                mult = 1.0
                for def_type in p["types"]:
                    mult *= self.type_chart["chart"].get(atk_type, {}).get(def_type, 1.0)
                if mult > 1.0:
                    counts[atk_type] += 1
        return counts

    def calculate_synergy_score(self, team: List[dict]) -> float:
        if len(team) < 2:
            return 0
        coverage = self.calculate_team_coverage(team)
        weaknesses = self.calculate_team_weaknesses(team)
        max_weak = max(weaknesses.values(), default=0)
        weakness_penalty = max_weak / len(team)
        weakness_score = 1 - min(weakness_penalty, 1)
        roles = set(p["role"] for p in team)
        role_score = min(len(roles) / 4, 1)
        return coverage * 0.4 + weakness_score * 0.3 + role_score * 0.3

    def recommend_team(self, playstyle: dict, team_size: int = 6) -> dict:
        composition = playstyle.get("team_composition", {"Attacker": 3, "Support": 3})
        team = []
        used_ids = set()

        for role, count in composition.items():
            candidates = [p for p in self.pokemon if p["role"] == role and p["id"] not in used_ids]
            scored = sorted(
                candidates,
                key=lambda p: self.calculate_playstyle_score(p, playstyle),
                reverse=True,
            )
            for p in scored[:count]:
                if len(team) < team_size:
                    team.append(p)
                    used_ids.add(p["id"])

        # Fill remaining slots if composition didn't fill all 6
        if len(team) < team_size:
            remaining = [p for p in self.pokemon if p["id"] not in used_ids]
            scored = sorted(
                remaining,
                key=lambda p: self.calculate_playstyle_score(p, playstyle),
                reverse=True,
            )
            for p in scored:
                if len(team) >= team_size:
                    break
                team.append(p)
                used_ids.add(p["id"])

        synergy = self.calculate_synergy_score(team)
        coverage = self.calculate_team_coverage(team)
        weaknesses = self.calculate_team_weaknesses(team)

        return {
            "team": [
                {
                    "id": p["id"],
                    "name": p["name"],
                    "types": p["types"],
                    "role": p["role"],
                    "stats": p["stats"],
                    "base_stat_total": p.get("base_stat_total", sum(p["stats"].values())),
                    "usage_percent": p.get("usage_percent", 0),
                }
                for p in team
            ],
            "analysis": {
                "synergy_score": round(synergy, 2),
                "coverage": round(coverage, 2),
                "weaknesses": {k: v for k, v in weaknesses.items() if v >= 3},
                "playstyle": playstyle["name"],
            },
        }

    def recommend_missing_slots(
        self, partial_team_ids: list, playstyle: dict, n_needed: int
    ) -> list:
        """Given existing team IDs and a playstyle, recommend Pokémon to fill empty slots."""
        used_ids = set(partial_team_ids)
        partial_team = [p for p in self.pokemon if p["id"] in used_ids]

        # Types already covered by partial team
        covered_types = set()
        for p in partial_team:
            for atk_type in p["types"]:
                for def_type, mult in self.type_chart["chart"].get(atk_type, {}).items():
                    if mult == 2.0:
                        covered_types.add(def_type)

        candidates = [p for p in self.pokemon if p["id"] not in used_ids]

        def score_candidate(p):
            base = self.calculate_playstyle_score(p, playstyle)
            # Bonus for covering types the partial team doesn't cover yet
            coverage_bonus = 0
            for atk_type in p["types"]:
                for def_type, mult in self.type_chart["chart"].get(atk_type, {}).items():
                    if mult == 2.0 and def_type not in covered_types:
                        coverage_bonus += 0.05
            return base + coverage_bonus

        scored = sorted(candidates, key=score_candidate, reverse=True)
        picks = scored[:n_needed]

        return [
            {
                "id": p["id"],
                "name": p["name"],
                "types": p["types"],
                "role": p["role"],
                "stats": p["stats"],
                "base_stat_total": p.get("base_stat_total", sum(p["stats"].values())),
                "usage_percent": p.get("usage_percent", 0),
            }
            for p in picks
        ]

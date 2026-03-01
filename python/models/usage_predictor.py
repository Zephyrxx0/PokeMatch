"""
Rule-based usage predictor.
No ML training — uses stat heuristics to estimate competitive viability.
"""
import numpy as np
from typing import Dict


class UsagePredictor:
    def predict(self, pokemon: dict) -> dict:
        s = pokemon["stats"]
        bst = sum(s.values())

        # Base prediction from BST
        if bst >= 600:
            base = 15 + (bst - 600) * 0.12
        elif bst >= 500:
            base = 5 + (bst - 500) * 0.06
        elif bst >= 400:
            base = 1 + (bst - 400) * 0.025
        else:
            base = max(0.1, (bst - 200) * 0.005)

        # Offensive bonus
        max_atk = max(s["attack"], s["special_attack"])
        if max_atk >= 130:
            base *= 1.2
        elif max_atk >= 110:
            base *= 1.1

        # Speed bonus
        if s["speed"] >= 110:
            base *= 1.15
        elif s["speed"] >= 90:
            base *= 1.05

        # Bulk bonus
        phys_bulk = s["hp"] * s["defense"]
        sp_bulk = s["hp"] * s["special_defense"]
        if min(phys_bulk, sp_bulk) >= 8000:
            base *= 1.1

        predicted = round(min(base, 50), 2)

        # Confidence from BST consistency
        spread = np.std(list(s.values()))
        confidence = round(max(0.3, min(0.95, 1 - spread / 80)), 2)

        current = pokemon.get("usage_percent", 0)
        change = predicted - current
        if abs(change) < current * 0.05:
            trend = "stable"
        elif change > 0:
            trend = "rising"
        else:
            trend = "falling"

        return {
            "predicted_usage": predicted,
            "confidence": confidence,
            "prediction_range": {
                "lower": round(max(0, predicted * 0.8), 2),
                "upper": round(predicted * 1.2, 2),
            },
            "trend": trend,
        }

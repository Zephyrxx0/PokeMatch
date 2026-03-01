import type { Pokemon, TeamAnalysis } from "@/app/types/pokemon";
import {
  getTypeEffectiveness,
  getAllTypes,
} from "@/app/lib/typeEffectiveness";

export function calculateTeamCoverage(team: Pokemon[]): number {
  const allTypes = getAllTypes();
  const hit = new Set<string>();
  for (const p of team) {
    for (const atkType of p.types) {
      for (const defType of allTypes) {
        if (getTypeEffectiveness(atkType, defType) === 2.0) {
          hit.add(defType);
        }
      }
    }
  }
  return hit.size / allTypes.length;
}

export function calculateTeamWeaknesses(
  team: Pokemon[]
): Record<string, number> {
  const allTypes = getAllTypes();
  const counts: Record<string, number> = {};
  for (const t of allTypes) counts[t] = 0;

  for (const p of team) {
    for (const atkType of allTypes) {
      let mult = 1.0;
      for (const defType of p.types) {
        mult *= getTypeEffectiveness(atkType, defType);
      }
      if (mult > 1.0) counts[atkType]++;
    }
  }
  return counts;
}

export function calculateSynergy(team: Pokemon[]): number {
  if (team.length < 2) return 0;

  const coverage = calculateTeamCoverage(team);

  const weaknesses = calculateTeamWeaknesses(team);
  const maxWeak = Math.max(...Object.values(weaknesses));
  const weaknessPenalty = maxWeak / team.length;
  const weaknessScore = 1 - Math.min(weaknessPenalty, 1);

  const roles = new Set(team.map((p) => p.role));
  const roleScore = Math.min(roles.size / 4, 1);

  return coverage * 0.4 + weaknessScore * 0.3 + roleScore * 0.3;
}

export function analyzeTeam(team: Pokemon[]): TeamAnalysis {
  const weaknessMap = calculateTeamWeaknesses(team);
  // Only show significant weaknesses (3+ members weak to a type)
  const significantWeaknesses: Record<string, number> = {};
  for (const [type, count] of Object.entries(weaknessMap)) {
    if (count >= 3) significantWeaknesses[type] = count;
  }

  return {
    synergy_score: Math.round(calculateSynergy(team) * 100) / 100,
    coverage: Math.round(calculateTeamCoverage(team) * 100) / 100,
    weaknesses: significantWeaknesses,
    playstyle: "",
  };
}

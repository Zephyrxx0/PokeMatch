import type { Team, UsagePrediction } from "@/app/types/pokemon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getTeamRecommendation(
  playstyle: string
): Promise<Team> {
  const data = await apiFetch<{
    team: Team["pokemon"];
    analysis: Team["analysis"];
  }>("/recommend", { playstyle });
  return {
    pokemon: data.team,
    playstyle,
    analysis: data.analysis,
  };
}

export async function getUsagePrediction(
  pokemonId: number
): Promise<UsagePrediction> {
  return apiFetch<UsagePrediction>("/predict-usage", {
    pokemon_id: pokemonId,
  });
}

export async function fillTeam(
  partialIds: number[],
  playstyle: string,
  slotsNeeded: number
): Promise<{ pokemon: Team["pokemon"] }> {
  return apiFetch<{ pokemon: Team["pokemon"] }>("/recommend-fill", {
    partial_team_ids: partialIds,
    playstyle,
    slots_needed: slotsNeeded,
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  abilities?: string[];
  base_stat_total: number;
  role: string;
  speed_tier?: string;
  physical_bulk?: number;
  special_bulk?: number;
  offensive_score?: number;
  defensive_score?: number;
  usage_percent?: number;
  attack_preference?: string;
}

export interface Team {
  pokemon: Pokemon[];
  playstyle: string;
  analysis: TeamAnalysis;
}

export interface TeamAnalysis {
  synergy_score: number;
  coverage: number;
  weaknesses: Record<string, number>;
  playstyle: string;
}

export interface UsagePrediction {
  predicted_usage: number;
  confidence: number;
  prediction_range: {
    lower: number;
    upper: number;
  };
  trend: "rising" | "falling" | "stable";
  pokemon?: {
    id: number;
    name: string;
  };
}

export interface Playstyle {
  key: string;
  name: string;
  description: string;
}

import typeChartData from "@/app/data/type_effectiveness.json";

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const chart = typeChartData.chart as Record<string, Record<string, number>>;
const types = typeChartData.types as string[];

export function getTypeEffectiveness(
  attackingType: string,
  defendingType: string
): number {
  return chart[attackingType]?.[defendingType] ?? 1.0;
}

export function calculateTypeMatchup(
  attackerTypes: string[],
  defenderTypes: string[]
): number {
  let multiplier = 1.0;
  for (const atk of attackerTypes) {
    for (const def of defenderTypes) {
      multiplier *= getTypeEffectiveness(atk, def);
    }
  }
  return multiplier;
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || "#68A090";
}

export function getAllTypes(): string[] {
  return types;
}

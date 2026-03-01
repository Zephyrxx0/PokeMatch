import pokemonRawData from "@/app/data/pokemon_data.json";
import type { Pokemon } from "@/app/types/pokemon";

const allPokemon: Pokemon[] = pokemonRawData as Pokemon[];

const pokemonById = new Map<number, Pokemon>();
for (const p of allPokemon) {
  pokemonById.set(p.id, p);
}

export function getAllPokemon(): Pokemon[] {
  return allPokemon;
}

export function getPokemon(id: number): Pokemon | undefined {
  return pokemonById.get(id);
}

export function searchPokemon(query: string): Pokemon[] {
  const q = query.toLowerCase().trim();
  if (!q) return allPokemon.slice(0, 20);
  return allPokemon.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.types.some((t) => t.toLowerCase().includes(q)) ||
      p.role.toLowerCase().includes(q)
  );
}

export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

"use client";

import type { Pokemon } from "@/app/types/pokemon";
import PokemonCard from "./PokemonCard";

interface TeamDisplayProps {
  team: Pokemon[];
  onRemove?: (index: number) => void;
  lockedIds?: Set<number>;
}

export default function TeamDisplay({ team, onRemove, lockedIds }: TeamDisplayProps) {
  const emptySlots = 6 - team.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {team.map((pokemon, index) => (
        <div key={pokemon.id} className="relative group">
          <PokemonCard pokemon={pokemon} />
          {lockedIds && (
            <span
              className={`absolute top-0 left-0 z-10 px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                lockedIds.has(pokemon.id)
                  ? "bg-foreground text-background"
                  : "bg-[#6890F0] text-white"
              }`}
            >
              {lockedIds.has(pokemon.id) ? "🔒 LOCKED" : "AI"}
            </span>
          )}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-0 right-0 z-10 border-3 border-foreground bg-[#ef4444] px-2 py-0.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="border-3 border-dashed border-foreground/30 flex flex-col items-center justify-center min-h-[200px] select-none"
        >
          <span className="text-3xl font-bold opacity-10">
            {String(team.length + i + 1).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-bold uppercase opacity-20 mt-1">
            EMPTY SLOT
          </span>
        </div>
      ))}
    </div>
  );
}

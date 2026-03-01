"use client";

import type { Pokemon } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";
import { getSpriteUrl } from "@/app/lib/pokemonData";

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  compact?: boolean;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  special_attack: "SPA",
  special_defense: "SPD",
  speed: "SPE",
};

export default function PokemonCard({
  pokemon,
  onClick,
  compact,
}: PokemonCardProps) {
  const primaryColor = getTypeColor(pokemon.types[0]);

  return (
    <div
      onClick={onClick}
      className="border-3 border-foreground bg-background cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0"
      style={{
        boxShadow: `4px 4px 0 ${primaryColor}`,
      }}
    >
      {/* Type color strip */}
      <div
        className="h-2 w-full"
        style={{
          background:
            pokemon.types.length > 1
              ? `linear-gradient(90deg, ${getTypeColor(pokemon.types[0])} 50%, ${getTypeColor(pokemon.types[1])} 50%)`
              : primaryColor,
        }}
      />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold opacity-40">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {pokemon.name}
            </h3>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getSpriteUrl(pokemon.id)}
            alt={pokemon.name}
            className="h-16 w-16 pixelated"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Types */}
        <div className="mt-1 flex gap-1">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="border-2 border-foreground px-2 py-0.5 text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Role */}
        <p className="mt-1 text-[10px] font-bold uppercase opacity-60">
          {pokemon.role}
          {pokemon.usage_percent
            ? ` // ${pokemon.usage_percent}% USAGE`
            : ""}
        </p>

        {/* Stats */}
        {!compact && (
          <div className="mt-2 space-y-0.5">
            {Object.entries(pokemon.stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center gap-1">
                <span className="w-7 text-[9px] font-bold opacity-50">
                  {STAT_LABELS[stat] || stat}
                </span>
                <div className="flex-1 h-2 bg-foreground/10 border border-foreground/20">
                  <div
                    className="h-full"
                    style={{
                      width: `${(value / 255) * 100}%`,
                      backgroundColor:
                        value >= 120
                          ? "#22c55e"
                          : value >= 80
                            ? primaryColor
                            : "#ef4444",
                    }}
                  />
                </div>
                <span className="w-6 text-right text-[9px] font-bold">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* BST */}
        <div className="mt-1 border-t border-foreground/20 pt-1">
          <span className="text-[10px] font-bold">
            BST {pokemon.base_stat_total}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import type { Pokemon } from "@/app/types/pokemon";
import { searchPokemon, getSpriteUrl } from "@/app/lib/pokemonData";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

interface PokemonSearchProps {
  onSelect: (pokemon: Pokemon) => void;
  disabledIds?: Set<number>;
}

export default function PokemonSearch({
  onSelect,
  disabledIds,
}: PokemonSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = query.length > 0 ? searchPokemon(query).slice(0, 12) : [];
  const showResults = focused && results.length > 0;

  const handleSelect = useCallback(
    (pokemon: Pokemon) => {
      onSelect(pokemon);
      setQuery("");
    },
    [onSelect]
  );

  return (
    <div className="relative">
      <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1 block">
        [02] SEARCH & ADD POKÉMON
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-30">
          {">"}_
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="TYPE NAME, TYPE, OR ROLE..."
          className="w-full border-3 border-foreground bg-background px-8 py-2.5 text-xs font-bold uppercase tracking-wider placeholder:opacity-30 focus:outline-none focus:ring-0"
          style={{
            boxShadow: focused
              ? "4px 4px 0 rgba(0,0,0,0.15)"
              : "none",
          }}
        />
      </div>

      {showResults && (
        <div className="absolute z-50 mt-1 w-full border-3 border-foreground bg-background max-h-72 overflow-y-auto">
          {results.map((p) => {
            const disabled = disabledIds?.has(p.id);
            return (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !disabled && handleSelect(p)}
                disabled={disabled}
                className={`
                  flex w-full items-center gap-3 border-b border-foreground/10 px-3 py-2 text-left
                  ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-foreground/5"}
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSpriteUrl(p.id)}
                  alt={p.name}
                  className="h-8 w-8"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase truncate">
                    #{String(p.id).padStart(3, "0")} {p.name}
                  </p>
                  <div className="flex gap-1 mt-0.5">
                    {p.types.map((t) => (
                      <span
                        key={t}
                        className="inline-block h-1.5 w-6"
                        style={{ backgroundColor: getTypeColor(t) }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-bold opacity-40 uppercase">
                  {p.role}
                </span>
                {disabled && (
                  <span className="text-[9px] font-bold opacity-60">
                    IN TEAM
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

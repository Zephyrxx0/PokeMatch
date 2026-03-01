"use client";

import { useState, useCallback } from "react";
import type { Pokemon } from "@/app/types/pokemon";
import { searchPokemon, getSpriteUrl } from "@/app/lib/pokemonData";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

interface FavoritePickerProps {
  picks: (Pokemon | null)[];
  onPick: (index: number, pokemon: Pokemon) => void;
  onClear: (index: number) => void;
  onReveal: () => void;
  canReveal: boolean;
}

function SlotSearch({
  index,
  pick,
  onPick,
  onClear,
  usedIds,
}: {
  index: number;
  pick: Pokemon | null;
  onPick: (index: number, pokemon: Pokemon) => void;
  onClear: (index: number) => void;
  usedIds: Set<number>;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results =
    query.length > 0 ? searchPokemon(query).slice(0, 8) : [];
  const showResults = focused && results.length > 0;

  const handleSelect = useCallback(
    (p: Pokemon) => {
      onPick(index, p);
      setQuery("");
    },
    [index, onPick]
  );

  if (pick) {
    return (
      <div
        className="border-3 border-foreground p-3"
        style={{
          boxShadow: `4px 4px 0 ${getTypeColor(pick.types[0])}`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getSpriteUrl(pick.id)}
            alt={pick.name}
            className="h-16 w-16"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="flex-1">
            <p className="text-[9px] font-bold opacity-30">
              PICK #{index + 1}
            </p>
            <p className="text-sm font-bold uppercase">{pick.name}</p>
            <div className="flex gap-1 mt-1">
              {pick.types.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 text-[8px] font-bold uppercase text-white"
                  style={{ backgroundColor: getTypeColor(t) }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onClear(index)}
            className="border-2 border-foreground h-7 w-7 text-xs font-bold hover:bg-[#ef4444] hover:text-white hover:border-[#ef4444] transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="border-3 border-dashed border-foreground/30 p-3"
      >
        <p className="text-[9px] font-bold opacity-30 mb-1">
          PICK #{index + 1}
        </p>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-30">
            {">"}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="SEARCH POKÉMON..."
            className="w-full border-2 border-foreground bg-background px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider placeholder:opacity-30 focus:outline-none"
          />
        </div>
      </div>

      {showResults && (
        <div className="absolute z-50 mt-1 w-full border-3 border-foreground bg-background max-h-56 overflow-y-auto">
          {results.map((p) => {
            const disabled = usedIds.has(p.id);
            return (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !disabled && handleSelect(p)}
                disabled={disabled}
                className={`
                  flex w-full items-center gap-2 border-b border-foreground/10 px-2 py-1.5 text-left
                  ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-foreground/5"}
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSpriteUrl(p.id)}
                  alt={p.name}
                  className="h-6 w-6"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[10px] font-bold uppercase truncate">
                  {p.name}
                </span>
                <div className="flex gap-0.5 ml-auto">
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className="inline-block h-1.5 w-3"
                      style={{ backgroundColor: getTypeColor(t) }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FavoritePicker({
  picks,
  onPick,
  onClear,
  onReveal,
  canReveal,
}: FavoritePickerProps) {
  const usedIds = new Set(
    picks.filter((p): p is Pokemon => p !== null).map((p) => p.id)
  );

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
        [01] CHOOSE YOUR 3 FAVOURITES
      </h2>
      <p className="text-[10px] opacity-30 mb-4">
        Pick 3 Pokémon that resonate with you — any reason is valid.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {picks.map((pick, i) => (
          <SlotSearch
            key={i}
            index={i}
            pick={pick}
            onPick={onPick}
            onClear={onClear}
            usedIds={usedIds}
          />
        ))}
      </div>

      <button
        onClick={onReveal}
        disabled={!canReveal}
        className={`
          w-full border-3 border-foreground px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all
          ${
            canReveal
              ? "bg-foreground text-background hover:tracking-[0.25em]"
              : "opacity-20 cursor-not-allowed"
          }
        `}
      >
        {canReveal ? "REVEAL MY ARCHETYPE →" : "SELECT 3 POKÉMON TO CONTINUE"}
      </button>
    </div>
  );
}

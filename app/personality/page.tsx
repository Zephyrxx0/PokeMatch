"use client";

import { useState, useCallback } from "react";
import type { Pokemon } from "@/app/types/pokemon";
import type { PersonalityResult } from "@/app/lib/personalityEngine";
import { analyzePersonality } from "@/app/lib/personalityEngine";
import FavoritePicker from "@/app/components/personality/FavoritePicker";
import PersonalityResultCard from "@/app/components/personality/PersonalityResult";

export default function PersonalityPage() {
  const [picks, setPicks] = useState<(Pokemon | null)[]>([null, null, null]);
  const [result, setResult] = useState<PersonalityResult | null>(null);

  const handlePick = useCallback((index: number, pokemon: Pokemon) => {
    setPicks((prev) => {
      const next = [...prev];
      next[index] = pokemon;
      return next;
    });
  }, []);

  const handleClear = useCallback((index: number) => {
    setPicks((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const canReveal = picks.every((p) => p !== null);

  const handleReveal = useCallback(() => {
    const filled = picks.filter((p): p is Pokemon => p !== null);
    if (filled.length === 3) {
      setResult(analyzePersonality(filled));
    }
  }, [picks]);

  const handleReset = useCallback(() => {
    setPicks([null, null, null]);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 mb-1">
            PKM // TRAINER PERSONALITY
          </p>
          <h1 className="text-2xl md:text-4xl font-bold uppercase leading-none">
            WHAT KIND OF
            <br />
            <span className="text-[#f472b6]">TRAINER</span> ARE YOU?
          </h1>
          <p className="text-xs opacity-40 mt-2 max-w-md">
            Pick 3 of your favourite Pokémon and we&apos;ll analyze your
            battling instincts, team philosophy, and suggested Nature.
          </p>
        </div>

        {result ? (
          <PersonalityResultCard result={result} onReset={handleReset} />
        ) : (
          <FavoritePicker
            picks={picks}
            onPick={handlePick}
            onClear={handleClear}
            onReveal={handleReveal}
            canReveal={canReveal}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useTeamStore } from "@/app/lib/store";
import {
  getTeamRecommendation,
  checkHealth,
  fillTeam,
} from "@/app/lib/api";
import type { Pokemon } from "@/app/types/pokemon";
import { getAllPokemon } from "@/app/lib/pokemonData";

import PlaystyleSelector from "@/app/components/PlaystyleSelector";
import PokemonSearch from "@/app/components/PokemonSearch";
import TeamDisplay from "@/app/components/TeamDisplay";
import TeamAnalysisPanel from "@/app/components/TeamAnalysisPanel";
import UsageChart from "@/app/components/UsageChart";

const TeamSynergyWeb = lazy(
  () => import("@/app/components/3d/TeamSynergyWeb")
);

type BuildMode = "archetype" | "custom";

export default function BuildPage() {
  const {
    team,
    playstyle,
    backendOnline,
    addPokemon,
    removePokemon,
    setTeam,
    setPlaystyle,
    setBackendOnline,
    clearTeam,
  } = useTeamStore();

  const [mode, setMode] = useState<BuildMode>("archetype");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<number>>(new Set());
  const [rejectedSuggestIds, setRejectedSuggestIds] = useState<Set<number>>(new Set());
  const [lastSuggestedId, setLastSuggestedId] = useState<number | null>(null);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, [setBackendOnline]);

  const handlePlaystyleSelect = useCallback(
    async (ps: string) => {
      setPlaystyle(ps);
      if (mode === "custom" || !backendOnline) return;

      setLoading(true);
      setError(null);
      try {
        const result = await getTeamRecommendation(ps);
        setTeam(result.pokemon);
      } catch {
        setError("BACKEND ERROR — ADD POKÉMON MANUALLY");
      } finally {
        setLoading(false);
      }
    },
    [backendOnline, mode, setPlaystyle, setTeam]
  );

  const handleAddPokemon = useCallback(
    (pokemon: Pokemon) => {
      if (mode === "custom") {
        setLockedIds((prev) => new Set(prev).add(pokemon.id));
      }
      addPokemon(pokemon);
    },
    [addPokemon, mode]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const p = team[index];
      if (p) {
        setLockedIds((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
        if (p.id === lastSuggestedId) setLastSuggestedId(null);
      }
      removePokemon(index);
    },
    [team, removePokemon, lastSuggestedId]
  );

  const handleSuggestOne = useCallback(async () => {
    if (!backendOnline) return;
    setLoading(true);
    setError(null);
    try {
      const excludeIds = [...team.map((p) => p.id), ...Array.from(rejectedSuggestIds)];
      const result = await fillTeam(excludeIds, playstyle, 1);
      for (const p of result.pokemon) {
        addPokemon(p);
        setLastSuggestedId(p.id);
      }
    } catch {
      setError("BACKEND ERROR — COULD NOT SUGGEST");
    } finally {
      setLoading(false);
    }
  }, [backendOnline, team, playstyle, addPokemon, rejectedSuggestIds]);

  const handleFillTeam = useCallback(async () => {
    if (!backendOnline) return;
    const slotsNeeded = 6 - team.length;
    if (slotsNeeded <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const partialIds = team.map((p) => p.id);
      const result = await fillTeam(partialIds, playstyle, slotsNeeded);
      for (const p of result.pokemon) {
        addPokemon(p);
      }
    } catch {
      setError("BACKEND ERROR — COULD NOT FILL TEAM");
    } finally {
      setLoading(false);
    }
  }, [backendOnline, team, playstyle, addPokemon]);

  const handleRerollTeam = useCallback(async () => {
    if (!backendOnline || !playstyle) return;
    setLoading(true);
    setError(null);
    try {
      const currentIds = team.map((p) => p.id);
      const result = await fillTeam(currentIds, playstyle, 6);
      setTeam(result.pokemon);
    } catch {
      setError("BACKEND ERROR — COULD NOT REROLL");
    } finally {
      setLoading(false);
    }
  }, [backendOnline, playstyle, team, setTeam]);

  const handleRerollSuggestOne = useCallback(async () => {
    if (!backendOnline || lastSuggestedId == null) return;
    setLoading(true);
    setError(null);
    try {
      const newRejected = new Set(rejectedSuggestIds);
      newRejected.add(lastSuggestedId);
      setRejectedSuggestIds(newRejected);

      const idx = team.findIndex((p) => p.id === lastSuggestedId);
      if (idx !== -1) removePokemon(idx);
      setLastSuggestedId(null);

      const remainingIds = team.filter((p) => p.id !== lastSuggestedId).map((p) => p.id);
      const excludeIds = [...remainingIds, ...Array.from(newRejected)];
      const result = await fillTeam(excludeIds, playstyle, 1);
      for (const p of result.pokemon) {
        addPokemon(p);
        setLastSuggestedId(p.id);
      }
    } catch {
      setError("BACKEND ERROR — COULD NOT REROLL SUGGESTION");
    } finally {
      setLoading(false);
    }
  }, [backendOnline, lastSuggestedId, rejectedSuggestIds, team, playstyle, removePokemon, addPokemon]);

  const handleRandomTeam = useCallback(() => {
    const all = getAllPokemon();
    // Fisher-Yates shuffle
    const shuffled = [...all];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const locked = team.filter((p) => lockedIds.has(p.id));
    const lockedIdSet = new Set(locked.map((p) => p.id));
    const slotsNeeded = 6 - locked.length;
    const picks = shuffled.filter((p) => !lockedIdSet.has(p.id)).slice(0, slotsNeeded);
    setTeam([...locked, ...picks]);
  }, [team, lockedIds, setTeam]);

  const handleModeSwitch = useCallback(
    (m: BuildMode) => {
      setMode(m);
      setRejectedSuggestIds(new Set());
      setLastSuggestedId(null);
      if (m === "archetype") {
        setLockedIds(new Set());
      } else {
        // In custom mode, existing team members become locked
        setLockedIds(new Set(team.map((p) => p.id)));
      }
    },
    [team]
  );

  const handleClearTeam = useCallback(() => {
    clearTeam();
    setLockedIds(new Set());
    setRejectedSuggestIds(new Set());
    setLastSuggestedId(null);
  }, [clearTeam]);

  const disabledIds = new Set(team.map((p) => p.id));
  const slotsRemaining = 6 - team.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {!backendOnline && (
        <div className="mb-4 border-3 border-foreground bg-[#F8D030] px-4 py-2 text-xs font-bold uppercase">
          <span className="inline-block h-2 w-2 bg-[#ef4444] mr-2" />
          BACKEND OFFLINE — MANUAL MODE ONLY (start Flask on :5000 for
          AI recommendations)
        </div>
      )}

      {error && (
        <div className="mb-4 border-3 border-[#ef4444] bg-[#ef4444]/10 px-4 py-2 text-xs font-bold uppercase text-[#ef4444]">
          {error}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-0 mb-6">
        {(["archetype", "custom"] as BuildMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`border-3 border-foreground px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              mode === m
                ? "bg-foreground text-background"
                : "bg-background hover:bg-foreground/5"
            } ${m === "custom" ? "-ml-[3px]" : ""}`}
          >
            {m === "archetype" ? "ARCHETYPE MODE" : "CUSTOM BUILD"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <PlaystyleSelector
            selected={playstyle}
            onSelect={handlePlaystyleSelect}
            loading={loading}
          />
        </div>
        <div>
          <PokemonSearch
            onSelect={handleAddPokemon}
            disabledIds={disabledIds}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleClearTeam}
              className="border-2 border-foreground px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              CLEAR TEAM
            </button>
            {mode === "archetype" && backendOnline && (
              <button
                onClick={handleRerollTeam}
                disabled={loading || !playstyle}
                className="border-2 border-foreground px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
              >
                {loading ? "REROLLING..." : "REROLL ↺"}
              </button>
            )}
            {mode === "custom" && backendOnline && (
              <>
                <div className="flex gap-0">
                  <button
                    onClick={handleSuggestOne}
                    disabled={loading || slotsRemaining <= 0}
                    className="border-2 border-[#6890F0] text-[#6890F0] px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-[#6890F0] hover:text-white transition-colors disabled:opacity-30"
                  >
                    {loading ? "..." : "SUGGEST 1 →"}
                  </button>
                  <button
                    onClick={handleRerollSuggestOne}
                    disabled={loading || lastSuggestedId == null}
                    className="border-2 border-l-0 border-[#6890F0] text-[#6890F0] px-2 py-1.5 text-[10px] font-bold uppercase hover:bg-[#6890F0] hover:text-white transition-colors disabled:opacity-30"
                    title="Reroll last suggestion"
                  >
                    ↺
                  </button>
                </div>
                <button
                  onClick={handleFillTeam}
                  disabled={loading || slotsRemaining <= 0}
                  className="border-2 border-foreground bg-foreground text-background px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground/80 transition-colors disabled:opacity-30"
                >
                  {loading
                    ? "FILLING..."
                    : `FILL TEAM (${slotsRemaining} more)`}
                </button>
                <button
                  onClick={handleRandomTeam}
                  className="border-2 border-foreground px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                  RANDOM ↺
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
            YOUR TEAM ({team.length}/6)
            {mode === "custom" && lockedIds.size > 0 && (
              <span className="ml-2 text-[9px] opacity-40">
                — {lockedIds.size} LOCKED
              </span>
            )}
          </h2>
          <TeamDisplay
            team={team}
            onRemove={handleRemove}
            lockedIds={mode === "custom" ? lockedIds : undefined}
          />
        </div>
        <div className="space-y-4">
          <TeamAnalysisPanel team={team} />
          <UsageChart team={team} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
          [04] SYNERGY VISUALIZATION
        </h2>
        <Suspense
          fallback={
            <div className="w-full h-80 border-3 border-dashed border-foreground/20 flex items-center justify-center">
              <p className="text-xs font-bold uppercase opacity-20 animate-pulse">
                LOADING 3D ENGINE...
              </p>
            </div>
          }
        >
          <TeamSynergyWeb team={team} />
        </Suspense>
      </div>

      <footer className="border-t-2 border-foreground/20 pt-4 mt-8">
        <p className="text-[9px] font-bold uppercase opacity-30 tracking-wider">
          PKM // TEAM BUILDER — BUILT WITH NEXT.JS + THREE.JS + FLASK —
          DATA FROM POKÉAPI — NOT AFFILIATED WITH NINTENDO
        </p>
      </footer>
    </div>
  );
}

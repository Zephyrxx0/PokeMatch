"use client";

import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useTeamStore } from "@/app/lib/store";
import {
  getTeamRecommendation,
  checkHealth,
  fillTeam,
} from "@/app/lib/api";
import type { Pokemon } from "@/app/types/pokemon";

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
      }
      removePokemon(index);
    },
    [team, removePokemon]
  );

  const handleSuggestOne = useCallback(async () => {
    if (!backendOnline) return;
    setLoading(true);
    setError(null);
    try {
      const partialIds = team.map((p) => p.id);
      const result = await fillTeam(partialIds, playstyle, 1);
      for (const p of result.pokemon) {
        addPokemon(p);
      }
    } catch {
      setError("BACKEND ERROR — COULD NOT SUGGEST");
    } finally {
      setLoading(false);
    }
  }, [backendOnline, team, playstyle, addPokemon]);

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

  const handleModeSwitch = useCallback(
    (m: BuildMode) => {
      setMode(m);
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
                onClick={() => handlePlaystyleSelect(playstyle)}
                disabled={loading}
                className="border-2 border-foreground px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
              >
                {loading ? "GENERATING..." : "REGENERATE"}
              </button>
            )}
            {mode === "custom" && backendOnline && (
              <>
                <button
                  onClick={handleSuggestOne}
                  disabled={loading || slotsRemaining <= 0}
                  className="border-2 border-[#6890F0] text-[#6890F0] px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-[#6890F0] hover:text-white transition-colors disabled:opacity-30"
                >
                  {loading ? "..." : "SUGGEST 1 →"}
                </button>
                <button
                  onClick={handleFillTeam}
                  disabled={loading || slotsRemaining <= 0}
                  className="border-2 border-foreground bg-foreground text-background px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-foreground/80 transition-colors disabled:opacity-30"
                >
                  {loading
                    ? "FILLING..."
                    : `FILL TEAM (${slotsRemaining} more)`}
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

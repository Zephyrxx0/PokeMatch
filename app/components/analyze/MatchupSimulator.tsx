"use client";

import { useState, useCallback } from "react";
import type { Pokemon } from "@/app/types/pokemon";
import {
  getTypeEffectiveness,
  getAllTypes,
  getTypeColor,
} from "@/app/lib/typeEffectiveness";
import { searchPokemon, getSpriteUrl } from "@/app/lib/pokemonData";

interface MatchupSimulatorProps {
  team: Pokemon[];
}

type Verdict = "FAVORABLE" | "NEUTRAL" | "UNFAVORABLE";
type SimMode = "type" | "team";

const VERDICT_COLOR: Record<Verdict, string> = {
  FAVORABLE: "#22c55e",
  NEUTRAL: "#f59e0b",
  UNFAVORABLE: "#ef4444",
};

/* ── Opponent search slot (reused in team mode) ── */
function OpponentSlot({
  onAdd,
  usedIds,
}: {
  onAdd: (p: Pokemon) => void;
  usedIds: Set<number>;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const results = query.length > 0 ? searchPokemon(query).slice(0, 6) : [];
  const showResults = focused && results.length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder="ADD OPPONENT..."
        className="w-full border-2 border-foreground bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wider placeholder:opacity-30 focus:outline-none"
      />
      {showResults && (
        <div className="absolute z-50 mt-0.5 w-full border-2 border-foreground bg-background max-h-44 overflow-y-auto">
          {results.map((p) => {
            const disabled = usedIds.has(p.id);
            return (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!disabled) {
                    onAdd(p);
                    setQuery("");
                  }
                }}
                disabled={disabled}
                className={`flex w-full items-center gap-2 border-b border-foreground/10 px-2 py-1 text-left ${
                  disabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-foreground/5"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSpriteUrl(p.id)}
                  alt={p.name}
                  className="h-5 w-5"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[9px] font-bold uppercase truncate">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Type matchup analysis helper ── */
function analyzeVsTypes(team: Pokemon[], opponentTypes: string[]) {
  const analysis = team.map((p) => {
    let bestOffense = 0;
    for (const atkType of p.types) {
      let mult = 1.0;
      for (const defType of opponentTypes) {
        mult *= getTypeEffectiveness(atkType, defType);
      }
      bestOffense = Math.max(bestOffense, mult);
    }
    let worstDefense = 0;
    for (const oppType of opponentTypes) {
      let mult = 1.0;
      for (const defType of p.types) {
        mult *= getTypeEffectiveness(oppType, defType);
      }
      worstDefense = Math.max(worstDefense, mult);
    }
    const isFast =
      p.speed_tier === "fast" || p.speed_tier === "ultra_fast";
    return {
      pokemon: p,
      hitsSuper: bestOffense >= 2,
      resists: worstDefense <= 0.5,
      immune: worstDefense === 0,
      vulnerable: worstDefense >= 2,
      offenseMult: bestOffense,
      defenseMult: worstDefense,
      isFast,
    };
  });
  const hitters = analysis.filter((a) => a.hitsSuper);
  const walls = analysis.filter((a) => a.resists || a.immune);
  const vulnerable = analysis.filter((a) => a.vulnerable);
  const score =
    hitters.length * 2 + walls.length * 1.5 - vulnerable.length * 2;
  let verdict: Verdict = "NEUTRAL";
  if (score >= 3) verdict = "FAVORABLE";
  else if (score <= -1) verdict = "UNFAVORABLE";
  return { analysis, hitters, walls, vulnerable, verdict };
}

/* ── MAIN COMPONENT ── */
export default function MatchupSimulator({ team }: MatchupSimulatorProps) {
  const allTypes = getAllTypes();
  const [simMode, setSimMode] = useState<SimMode>("type");

  // Type mode state
  const [type1, setType1] = useState("");
  const [type2, setType2] = useState("");

  // Team mode state
  const [opponents, setOpponents] = useState<Pokemon[]>([]);

  const addOpponent = useCallback((p: Pokemon) => {
    setOpponents((prev) => (prev.length < 6 ? [...prev, p] : prev));
  }, []);

  const removeOpponent = useCallback((idx: number) => {
    setOpponents((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const opponentIds = new Set(opponents.map((p) => p.id));

  /* ── Type mode computed ── */
  const opponentTypes = [type1, type2].filter(Boolean);
  const hasTypeSelection = opponentTypes.length > 0;
  const typeMatchup =
    hasTypeSelection && team.length > 0
      ? analyzeVsTypes(team, opponentTypes)
      : null;

  /* ── Team mode computed ── */
  const teamMatchups = opponents.map((opp) => {
    const m = analyzeVsTypes(team, opp.types);
    const bestAttacker = m.analysis.reduce(
      (best, a) =>
        a.offenseMult > (best?.offenseMult ?? 0) ? a : best,
      m.analysis[0]
    );
    const bestWall = m.analysis.reduce(
      (best, a) =>
        a.defenseMult < (best?.defenseMult ?? 999) ? a : best,
      m.analysis[0]
    );
    return { opponent: opp, ...m, bestAttacker, bestWall };
  });

  const coveredCount = teamMatchups.filter(
    (m) => m.hitters.length > 0
  ).length;
  const totalOpponents = opponents.length;
  const coverageRatio =
    totalOpponents > 0 ? coveredCount / totalOpponents : 0;
  let teamVerdict: Verdict = "NEUTRAL";
  if (coverageRatio >= 0.66) teamVerdict = "FAVORABLE";
  else if (coverageRatio < 0.33 && totalOpponents > 0)
    teamVerdict = "UNFAVORABLE";

  return (
    <div className="border-3 border-foreground p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
        MATCHUP SIMULATOR
      </h3>

      {/* Mode tabs */}
      <div className="flex gap-0 mb-4">
        {(["type", "team"] as SimMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setSimMode(m)}
            className={`border-2 border-foreground px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${
              simMode === m
                ? "bg-foreground text-background"
                : "bg-background hover:bg-foreground/5"
            } ${m === "team" ? "-ml-[2px]" : ""}`}
          >
            {m === "type" ? "TYPE MATCHUP" : "TEAM MATCHUP"}
          </button>
        ))}
      </div>

      {/* ══════ TYPE MODE ══════ */}
      {simMode === "type" && (
        <>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-[9px] font-bold uppercase opacity-40 mb-1 block">
                OPPONENT TYPE 1
              </label>
              <select
                title="Select opponent primary type"
                value={type1}
                onChange={(e) => setType1(e.target.value)}
                className="w-full border-2 border-foreground bg-background px-2 py-1.5 text-[10px] font-bold uppercase"
              >
                <option value="">— SELECT —</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-bold uppercase opacity-40 mb-1 block">
                OPPONENT TYPE 2
              </label>
              <select
                title="Select opponent secondary type"
                value={type2}
                onChange={(e) => setType2(e.target.value)}
                className="w-full border-2 border-foreground bg-background px-2 py-1.5 text-[10px] font-bold uppercase"
              >
                <option value="">— NONE —</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasTypeSelection && (
            <div className="flex gap-1 mb-4">
              {opponentTypes.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[9px] font-bold uppercase text-white"
                  style={{ backgroundColor: getTypeColor(t) }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {typeMatchup && (
            <>
              <div
                className="border-2 px-3 py-2 mb-4 text-center"
                style={{
                  borderColor: VERDICT_COLOR[typeMatchup.verdict],
                  color: VERDICT_COLOR[typeMatchup.verdict],
                }}
              >
                <p className="text-lg font-bold uppercase">
                  {typeMatchup.verdict}
                </p>
              </div>

              <div className="space-y-3">
                {typeMatchup.hitters.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
                      SUPER-EFFECTIVE OFFENSE ({typeMatchup.hitters.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {typeMatchup.hitters.map((a) => (
                        <span
                          key={a.pokemon.id}
                          className="border border-[#22c55e] px-2 py-0.5 text-[9px] font-bold uppercase text-[#22c55e]"
                        >
                          {a.pokemon.name} {a.isFast && "⚡"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {typeMatchup.walls.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
                      RESISTS / IMMUNE ({typeMatchup.walls.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {typeMatchup.walls.map((a) => (
                        <span
                          key={a.pokemon.id}
                          className="border border-[#6890F0] px-2 py-0.5 text-[9px] font-bold uppercase text-[#6890F0]"
                        >
                          {a.pokemon.name}
                          {a.immune && " (IMMUNE)"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {typeMatchup.vulnerable.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
                      VULNERABLE ({typeMatchup.vulnerable.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {typeMatchup.vulnerable.map((a) => (
                        <span
                          key={a.pokemon.id}
                          className="border border-[#ef4444] px-2 py-0.5 text-[9px] font-bold uppercase text-[#ef4444]"
                        >
                          {a.pokemon.name} ({a.defenseMult}×)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!hasTypeSelection && (
            <p className="text-[10px] opacity-30 uppercase">
              Select opponent types to simulate matchups
            </p>
          )}
        </>
      )}

      {/* ══════ TEAM MODE ══════ */}
      {simMode === "team" && (
        <>
          {/* Opponent search + list */}
          <div className="mb-4">
            <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
              OPPONENT TEAM ({opponents.length}/6)
            </p>
            {opponents.length < 6 && (
              <OpponentSlot onAdd={addOpponent} usedIds={opponentIds} />
            )}
            {opponents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {opponents.map((opp, i) => (
                  <span
                    key={opp.id}
                    className="inline-flex items-center gap-1 border-2 border-foreground px-1.5 py-0.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSpriteUrl(opp.id)}
                      alt={opp.name}
                      className="h-4 w-4"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-[9px] font-bold uppercase">
                      {opp.name}
                    </span>
                    <button
                      onClick={() => removeOpponent(i)}
                      className="text-[9px] font-bold text-[#ef4444] hover:text-[#ef4444]/70 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Per-opponent cards */}
          {team.length > 0 && opponents.length > 0 && (
            <>
              <div className="space-y-3 mb-4">
                {teamMatchups.map((m) => (
                  <div
                    key={m.opponent.id}
                    className="border-2 border-foreground/30 p-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSpriteUrl(m.opponent.id)}
                        alt={m.opponent.name}
                        className="h-8 w-8"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase">
                          {m.opponent.name}
                        </p>
                        <div className="flex gap-0.5">
                          {m.opponent.types.map((t) => (
                            <span
                              key={t}
                              className="px-1 py-0 text-[7px] font-bold uppercase text-white"
                              style={{ backgroundColor: getTypeColor(t) }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[8px] font-bold uppercase">
                      {m.bestAttacker && m.bestAttacker.offenseMult >= 2 && (
                        <span className="border border-[#22c55e] text-[#22c55e] px-1.5 py-0.5">
                          COUNTER: {m.bestAttacker.pokemon.name} (
                          {m.bestAttacker.offenseMult}×)
                        </span>
                      )}
                      {m.bestWall &&
                        m.bestWall.defenseMult <= 0.5 && (
                          <span className="border border-[#6890F0] text-[#6890F0] px-1.5 py-0.5">
                            WALL: {m.bestWall.pokemon.name}
                          </span>
                        )}
                      {m.hitters.length === 0 && (
                        <span className="border border-[#ef4444] text-[#ef4444] px-1.5 py-0.5">
                          NO SE ANSWER
                        </span>
                      )}
                      {m.vulnerable.length > 0 && (
                        <span className="border border-[#ef4444]/50 text-[#ef4444] px-1.5 py-0.5">
                          {m.vulnerable.length} WEAK TO IT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Aggregate */}
              <div
                className="border-2 px-3 py-2 text-center"
                style={{
                  borderColor: VERDICT_COLOR[teamVerdict],
                  color: VERDICT_COLOR[teamVerdict],
                }}
              >
                <p className="text-lg font-bold uppercase">
                  {teamVerdict}
                </p>
                <p className="text-[9px] font-bold uppercase opacity-60 mt-1">
                  {coveredCount}/{totalOpponents} THREATS COVERED
                </p>
              </div>
            </>
          )}

          {opponents.length === 0 && (
            <p className="text-[10px] opacity-30 uppercase">
              Add opponent Pokémon to simulate team matchups
            </p>
          )}
        </>
      )}
    </div>
  );
}

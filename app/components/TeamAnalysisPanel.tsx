"use client";

import type { TeamAnalysis } from "@/app/types/pokemon";
import type { Pokemon } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";
import {
  analyzeTeam,
  calculateTeamCoverage,
  calculateTeamWeaknesses,
} from "@/app/lib/teamAnalysis";

interface TeamAnalysisPanelProps {
  team: Pokemon[];
}

export default function TeamAnalysisPanel({ team }: TeamAnalysisPanelProps) {
  if (team.length === 0) {
    return (
      <div className="border-3 border-dashed border-foreground/20 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-40">
          [03] TEAM ANALYSIS
        </h2>
        <p className="mt-4 text-xs opacity-30">
          Add Pokémon to see analysis
        </p>
      </div>
    );
  }

  const analysis = analyzeTeam(team);
  const allWeaknesses = calculateTeamWeaknesses(team);

  // Sort weaknesses by count descending
  const sortedWeaknesses = Object.entries(allWeaknesses)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const coveragePct = Math.round(analysis.coverage * 100);
  const synergyPct = Math.round(analysis.synergy_score * 100);

  return (
    <div className="border-3 border-foreground p-4">
      <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
        [03] TEAM ANALYSIS
      </h2>

      {/* Score gauges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border-2 border-foreground p-2">
          <p className="text-[9px] font-bold uppercase opacity-40">SYNERGY</p>
          <p className="text-2xl font-bold">{synergyPct}%</p>
          <div className="mt-1 h-2 bg-foreground/10 border border-foreground/20">
            <div
              className="h-full bg-foreground"
              style={{ width: `${synergyPct}%` }}
            />
          </div>
        </div>
        <div className="border-2 border-foreground p-2">
          <p className="text-[9px] font-bold uppercase opacity-40">
            TYPE COVERAGE
          </p>
          <p className="text-2xl font-bold">{coveragePct}%</p>
          <div className="mt-1 h-2 bg-foreground/10 border border-foreground/20">
            <div
              className="h-full"
              style={{
                width: `${coveragePct}%`,
                backgroundColor:
                  coveragePct >= 70
                    ? "#22c55e"
                    : coveragePct >= 50
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="mb-4">
        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
          ROLES
        </p>
        <div className="flex flex-wrap gap-1">
          {team.map((p) => (
            <span
              key={p.id}
              className="border border-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase"
            >
              {p.role}
            </span>
          ))}
        </div>
      </div>

      {/* Weakness grid */}
      <div>
        <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
          WEAKNESS MAP
        </p>
        <div className="grid grid-cols-3 gap-1">
          {sortedWeaknesses.map(([type, count]) => (
            <div
              key={type}
              className="flex items-center gap-1 px-1 py-0.5 border"
              style={{
                borderColor: count >= 3 ? "#ef4444" : "rgba(0,0,0,0.1)",
                backgroundColor:
                  count >= 3 ? "rgba(239,68,68,0.1)" : "transparent",
              }}
            >
              <span
                className="inline-block h-2 w-2 shrink-0"
                style={{ backgroundColor: getTypeColor(type) }}
              />
              <span className="text-[8px] font-bold uppercase truncate">
                {type}
              </span>
              <span
                className={`text-[9px] font-bold ml-auto ${count >= 3 ? "text-[#ef4444]" : ""}`}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTeamStore } from "@/app/lib/store";
import TypeMatrix from "@/app/components/analyze/TypeMatrix";
import StatRadarChart from "@/app/components/analyze/StatRadarChart";
import RoleBreakdown from "@/app/components/analyze/RoleBreakdown";
import MatchupSimulator from "@/app/components/analyze/MatchupSimulator";
import { analyzeTeam } from "@/app/lib/teamAnalysis";

export default function AnalyzePage() {
  const team = useTeamStore((s) => s.team);

  if (team.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mb-4">
          [ANALYZE]
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-4">
          NO TEAM TO ANALYZE
        </h1>
        <p className="text-xs opacity-40 mb-8">
          Build a team first, then come back here for full analysis.
        </p>
        <Link
          href="/build"
          className="inline-block border-3 border-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider no-underline hover:bg-foreground hover:text-background transition-colors"
        >
          → GO TO BUILDER
        </Link>
      </div>
    );
  }

  const analysis = analyzeTeam(team);
  const synergyPct = Math.round(analysis.synergy_score * 100);
  const coveragePct = Math.round(analysis.coverage * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-1">
            TEAM ANALYSIS — {team.length} POKÉMON
          </p>
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            FULL BREAKDOWN
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="border-3 border-foreground px-4 py-2 text-center">
            <p className="text-[9px] font-bold uppercase opacity-40">
              SYNERGY
            </p>
            <p className="text-xl font-bold">{synergyPct}%</p>
          </div>
          <div className="border-3 border-foreground px-4 py-2 text-center">
            <p className="text-[9px] font-bold uppercase opacity-40">
              COVERAGE
            </p>
            <p className="text-xl font-bold">{coveragePct}%</p>
          </div>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TypeMatrix team={team} />
        <StatRadarChart team={team} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RoleBreakdown team={team} />
        <MatchupSimulator team={team} />
      </div>

      <footer className="border-t-2 border-foreground/20 pt-4 mt-8">
        <p className="text-[9px] font-bold uppercase opacity-30 tracking-wider">
          PKM // TEAM BUILDER — ANALYZE MODULE
        </p>
      </footer>
    </div>
  );
}

"use client";

import type { UsagePrediction } from "@/app/types/pokemon";
import type { Pokemon } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

interface UsageChartProps {
  team: Pokemon[];
}

export default function UsageChart({ team }: UsageChartProps) {
  if (team.length === 0) return null;

  const maxUsage = Math.max(...team.map((p) => p.usage_percent || 0), 1);

  return (
    <div className="border-3 border-foreground p-4">
      <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
        USAGE RATES
      </h2>
      <div className="space-y-2">
        {team.map((p) => {
          const usage = p.usage_percent || 0;
          const pct = (usage / maxUsage) * 100;
          const color = getTypeColor(p.types[0]);
          return (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-20 text-[9px] font-bold uppercase truncate">
                {p.name}
              </span>
              <div className="flex-1 h-4 bg-foreground/5 border border-foreground/20 relative">
                <div
                  className="h-full absolute inset-y-0 left-0"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-1 text-[8px] font-bold mix-blend-difference text-white">
                  {usage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

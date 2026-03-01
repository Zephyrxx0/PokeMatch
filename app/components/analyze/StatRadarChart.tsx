"use client";

import type { Pokemon } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatRadarChartProps {
  team: Pokemon[];
}

const STAT_KEYS = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "ATK" },
  { key: "defense", label: "DEF" },
  { key: "special_attack", label: "SPA" },
  { key: "special_defense", label: "SPD" },
  { key: "speed", label: "SPE" },
] as const;

export default function StatRadarChart({ team }: StatRadarChartProps) {
  const data = STAT_KEYS.map(({ key, label }) => {
    const entry: Record<string, string | number> = { stat: label };
    for (const p of team) {
      entry[p.name] = p.stats[key];
    }
    return entry;
  });

  return (
    <div className="border-3 border-foreground p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
        STAT RADAR COMPARISON
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(10,10,10,0.15)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "Space Mono, monospace",
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 255]}
            tick={{ fontSize: 8 }}
            tickCount={4}
          />
          {team.map((p) => (
            <Radar
              key={p.id}
              name={p.name.toUpperCase()}
              dataKey={p.name}
              stroke={getTypeColor(p.types[0])}
              fill={getTypeColor(p.types[0])}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "Space Mono, monospace",
              textTransform: "uppercase",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

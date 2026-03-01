"use client";

import type { Pokemon } from "@/app/types/pokemon";
import {
  getTypeEffectiveness,
  getAllTypes,
  getTypeColor,
} from "@/app/lib/typeEffectiveness";

interface TypeMatrixProps {
  team: Pokemon[];
}

export default function TypeMatrix({ team }: TypeMatrixProps) {
  const allTypes = getAllTypes();

  // For each attacking type, compute the multiplier against each team member
  const matrix = allTypes.map((atkType) => ({
    atkType,
    matchups: team.map((p) => {
      let mult = 1.0;
      for (const defType of p.types) {
        mult *= getTypeEffectiveness(atkType, defType);
      }
      return mult;
    }),
  }));

  const cellStyle = (mult: number): { bg: string; text: string; label: string } => {
    if (mult === 0) return { bg: "#1a1a1a", text: "#555", label: "0×" };
    if (mult <= 0.25) return { bg: "#1a3a1a", text: "#4ade80", label: "¼×" };
    if (mult <= 0.5) return { bg: "#1a2a1a", text: "#86efac", label: "½×" };
    if (mult === 1) return { bg: "transparent", text: "inherit", label: "" };
    if (mult === 2) return { bg: "#3a2a1a", text: "#fb923c", label: "2×" };
    if (mult >= 4) return { bg: "#3a1a1a", text: "#ef4444", label: "4×" };
    return { bg: "transparent", text: "inherit", label: `${mult}×` };
  };

  return (
    <div className="border-3 border-foreground p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
        DEFENSIVE TYPE MATRIX
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] font-bold uppercase">
          <thead>
            <tr>
              <th className="text-left p-1 border-b-2 border-foreground/20 w-20">
                ATK →
              </th>
              {team.map((p) => (
                <th
                  key={p.id}
                  className="p-1 border-b-2 border-foreground/20 text-center"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="truncate max-w-[60px] block">
                      {p.name}
                    </span>
                    <div className="flex gap-0.5">
                      {p.types.map((t) => (
                        <span
                          key={t}
                          className="inline-block h-1.5 w-4"
                          style={{ backgroundColor: getTypeColor(t) }}
                        />
                      ))}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ atkType, matchups }) => (
              <tr key={atkType} className="border-b border-foreground/5">
                <td className="p-1.5 flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{ backgroundColor: getTypeColor(atkType) }}
                  />
                  {atkType}
                </td>
                {matchups.map((mult, i) => {
                  const s = cellStyle(mult);
                  return (
                    <td
                      key={i}
                      className="p-1.5 text-center"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      {s.label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

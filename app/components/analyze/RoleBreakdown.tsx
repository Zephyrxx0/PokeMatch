"use client";

import type { Pokemon } from "@/app/types/pokemon";

interface RoleBreakdownProps {
  team: Pokemon[];
}

const IDEAL_ROLES = [
  "sweeper",
  "wall",
  "tank",
  "support",
  "pivot",
  "revenge_killer",
  "wallbreaker",
  "setup_sweeper",
];

export default function RoleBreakdown({ team }: RoleBreakdownProps) {
  // Count roles
  const roleCounts: Record<string, number> = {};
  for (const p of team) {
    const role = p.role.toLowerCase();
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }

  const presentRoles = Object.entries(roleCounts).sort(
    ([, a], [, b]) => b - a
  );

  // Find missing common roles
  const teamRoles = new Set(team.map((p) => p.role.toLowerCase()));
  const missingRoles = IDEAL_ROLES.filter((r) => !teamRoles.has(r));

  return (
    <div className="border-3 border-foreground p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
        ROLE BREAKDOWN
      </h3>

      {/* Present roles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presentRoles.map(([role, count]) => (
          <div
            key={role}
            className="border-2 border-foreground px-3 py-1.5 text-[10px] font-bold uppercase"
          >
            {role.replace(/_/g, " ")}
            {count > 1 && (
              <span className="ml-1 opacity-50">×{count}</span>
            )}
          </div>
        ))}
      </div>

      {/* Role distribution bars */}
      <div className="space-y-1.5 mb-4">
        {presentRoles.map(([role, count]) => (
          <div key={role} className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase opacity-50 w-28 truncate">
              {role.replace(/_/g, " ")}
            </span>
            <div className="flex-1 h-3 bg-foreground/10 border border-foreground/20">
              <div
                className="h-full bg-foreground"
                style={{
                  width: `${(count / Math.max(team.length, 1)) * 100}%`,
                }}
              />
            </div>
            <span className="text-[9px] font-bold opacity-40 w-4 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Missing roles */}
      {missingRoles.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase opacity-30 mb-2">
            GAPS DETECTED:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingRoles.slice(0, 4).map((role) => (
              <span
                key={role}
                className="border border-dashed border-[#ef4444]/40 px-2 py-1 text-[9px] font-bold uppercase text-[#ef4444]/60"
              >
                NO {role.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

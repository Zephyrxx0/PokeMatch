"use client";

import type { Playstyle } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

const PLAYSTYLES: (Playstyle & { accent: string })[] = [
  {
    key: "hyper_offense",
    name: "HYPER OFFENSE",
    description: "Fast, hard-hitting — overwhelm quickly",
    accent: getTypeColor("fire"),
  },
  {
    key: "balanced",
    name: "BALANCED",
    description: "Well-rounded offense and defense mix",
    accent: getTypeColor("normal"),
  },
  {
    key: "stall",
    name: "STALL / DEFENSE",
    description: "Outlast opponents with walls & recovery",
    accent: getTypeColor("steel"),
  },
  {
    key: "weather_rain",
    name: "RAIN TEAM",
    description: "Water-boosted rain sweepers",
    accent: getTypeColor("water"),
  },
  {
    key: "trick_room",
    name: "TRICK ROOM",
    description: "Slow, powerful — inverted speed",
    accent: getTypeColor("psychic"),
  },
  {
    key: "volt_turn",
    name: "VOLT-TURN",
    description: "Momentum through pivoting moves",
    accent: getTypeColor("electric"),
  },
  {
    key: "weather_sun",
    name: "SUN TEAM",
    description: "Drought + Chlorophyll / Solar Power",
    accent: getTypeColor("fire"),
  },
  {
    key: "weather_sand",
    name: "SAND TEAM",
    description: "Sandstream + Sand Rush / Force",
    accent: getTypeColor("ground"),
  },
  {
    key: "weather_snow",
    name: "SNOW / AURORA VEIL",
    description: "Ice stacking with Aurora Veil setup",
    accent: getTypeColor("ice"),
  },
  {
    key: "bulky_offense",
    name: "BULKY OFFENSE",
    description: "Hit hard while taking hits — no glass cannons",
    accent: getTypeColor("fighting"),
  },
  {
    key: "hazard_stack",
    name: "HAZARD STACK",
    description: "Rocks + Spikes + spinblocker chip",
    accent: getTypeColor("rock"),
  },
  {
    key: "setup_sweeper",
    name: "SETUP SWEEPER",
    description: "DD / SD / NP cores + revenge killers",
    accent: getTypeColor("dragon"),
  },
  {
    key: "hyper_stall",
    name: "HYPER STALL",
    description: "Six walls — PP stall, Toxic, Encore",
    accent: getTypeColor("poison"),
  },
  {
    key: "status_spread",
    name: "STATUS SPREAD",
    description: "Para / burn / toxic + cleric support",
    accent: getTypeColor("ghost"),
  },
  {
    key: "dragon_core",
    name: "DRAGON CORE",
    description: "Dragon spam + Fairy answer",
    accent: getTypeColor("dragon"),
  },
  {
    key: "baton_pass",
    name: "BATON PASS",
    description: "Setup boosters → stat pass receiver",
    accent: getTypeColor("fairy"),
  },
];

interface PlaystyleSelectorProps {
  selected: string;
  onSelect: (playstyle: string) => void;
  loading?: boolean;
}

export default function PlaystyleSelector({
  selected,
  onSelect,
  loading,
}: PlaystyleSelectorProps) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
        [01] SELECT PLAYSTYLE
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {PLAYSTYLES.map((ps) => {
          const isSelected = selected === ps.key;
          return (
            <button
              key={ps.key}
              onClick={() => onSelect(ps.key)}
              disabled={loading}
              className={`
                border-3 border-foreground p-3 text-left transition-all
                ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-background hover:-translate-y-0.5"
                }
                ${loading ? "opacity-50 cursor-wait" : ""}
              `}
              style={{
                boxShadow: isSelected
                  ? `4px 4px 0 ${ps.accent}`
                  : "4px 4px 0 rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="h-1 w-8 mb-2"
                style={{ backgroundColor: ps.accent }}
              />
              <p className="text-xs font-bold">{ps.name}</p>
              <p
                className={`text-[9px] mt-1 ${isSelected ? "opacity-70" : "opacity-40"}`}
              >
                {ps.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

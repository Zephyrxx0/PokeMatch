"use client";

import Link from "next/link";
import { useTeamStore } from "@/app/lib/store";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

const ROUTES = [
  {
    href: "/build",
    title: "BUILD TEAM",
    description: "Select a playstyle, search Pokémon, and assemble your team of 6",
    accent: getTypeColor("fire"),
    number: "01",
  },
  {
    href: "/analyze",
    title: "ANALYZE",
    description: "Full type matrix, stat radar, role breakdown & matchup simulator",
    accent: getTypeColor("water"),
    number: "02",
  },
  {
    href: "/personality",
    title: "PERSONALITY TEST",
    description: "Pick 3 favourite Pokémon to reveal your trainer archetype & nature",
    accent: getTypeColor("psychic"),
    number: "03",
  },
];

export default function Home() {
  const team = useTeamStore((s) => s.team);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-2">
          POKÉMON COMPETITIVE TOOLKIT
        </p>
        <h1 className="text-4xl md:text-6xl font-bold uppercase leading-none tracking-tight">
          PKM //{" "}
          <span
            className="inline-block"
            style={{
              borderBottom: `6px solid ${getTypeColor("electric")}`,
              paddingBottom: "4px",
            }}
          >
            TEAM BUILDER
          </span>
        </h1>
        <p className="mt-4 text-sm opacity-50 max-w-lg">
          Build competitive teams, analyze type coverage & synergy, and discover
          your trainer personality — all in one brutalist toolkit.
        </p>
      </div>

      {/* Route cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {ROUTES.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group border-3 border-foreground bg-background p-0 no-underline block hover:-translate-y-1 transition-transform"
            style={{
              boxShadow: `6px 6px 0 ${route.accent}`,
            }}
          >
            {/* Accent bar */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: route.accent }}
            />
            <div className="p-5">
              <p className="text-[9px] font-bold opacity-30 mb-1">
                [{route.number}]
              </p>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-2">
                {route.title}
              </h2>
              <p className="text-xs opacity-50 leading-relaxed">
                {route.description}
              </p>
              <p
                className="mt-4 text-xs font-bold uppercase tracking-wider group-hover:tracking-[0.2em] transition-all"
                style={{ color: route.accent }}
              >
                → ENTER
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Team status badge */}
      {team.length > 0 && (
        <Link
          href="/build"
          className="inline-block border-3 border-foreground px-5 py-3 no-underline hover:bg-foreground hover:text-background transition-colors"
          style={{
            boxShadow: `4px 4px 0 ${getTypeColor("grass")}`,
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider">
            CURRENT TEAM: {team.length}/6 → CONTINUE BUILDING
          </span>
        </Link>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-foreground/20 pt-4 mt-16">
        <p className="text-[9px] font-bold uppercase opacity-30 tracking-wider">
          PKM // TEAM BUILDER — NEXT.JS + THREE.JS + FLASK — DATA FROM
          POKÉAPI — NOT AFFILIATED WITH NINTENDO
        </p>
      </footer>
    </div>
  );
}

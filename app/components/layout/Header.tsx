"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTypeColor } from "@/app/lib/typeEffectiveness";

const TYPE_DOTS = ["fire", "water", "grass", "electric", "psychic", "dragon"];

const NAV_ITEMS = [
  { href: "/build", label: "BUILD" },
  { href: "/analyze", label: "ANALYZE" },
  { href: "/personality", label: "PERSONALITY" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b-4 border-foreground bg-background px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex gap-1">
            {TYPE_DOTS.map((t) => (
              <span
                key={t}
                className="inline-block h-3 w-3"
                style={{ backgroundColor: getTypeColor(t) }}
              />
            ))}
          </div>
          <h1 className="text-lg font-bold uppercase tracking-widest">
            PKM // TEAM BUILDER
          </h1>
        </Link>
        <nav className="flex gap-6 text-xs font-bold uppercase tracking-wider">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`no-underline transition-opacity ${
                  isActive
                    ? "border-b-2 border-foreground opacity-100"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

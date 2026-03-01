"use client";

import type {
  PersonalityResult,
  MBTIDimensions,
} from "@/app/lib/personalityEngine";
import { getSpriteUrl } from "@/app/lib/pokemonData";

interface PersonalityResultCardProps {
  result: PersonalityResult;
  onReset: () => void;
}

const SCORE_BARS: {
  key: keyof PersonalityResult["scores"];
  label: string;
}[] = [
  { key: "aggression", label: "AGGRESSION" },
  { key: "endurance", label: "ENDURANCE" },
  { key: "swiftness", label: "SWIFTNESS" },
  { key: "physicality", label: "PHYSICALITY" },
];

const MBTI_BARS: {
  key: keyof MBTIDimensions;
  left: string;
  right: string;
}[] = [
  { key: "EI", left: "EXTRAVERTED (E)", right: "INTROVERTED (I)" },
  { key: "SN", left: "SENSING (S)", right: "INTUITIVE (N)" },
  { key: "TF", left: "THINKING (T)", right: "FEELING (F)" },
  { key: "JP", left: "JUDGING (J)", right: "PERCEIVING (P)" },
];

export default function PersonalityResultCard({
  result,
  onReset,
}: PersonalityResultCardProps) {
  const { archetype, scores, typeAffinity, pokemon, mbti } = result;

  const handleShare = () => {
    const text = `My Pokémon Trainer Archetype: ${archetype.name}!\nMBTI: ${mbti.type} — ${mbti.title}\nNature: ${archetype.suggestedNature} (${archetype.natureEffect})\nTraits: ${archetype.traits.join(", ")}\nBased on: ${pokemon.map((p) => p.name).join(", ")}\n\n— PKM // TEAM BUILDER`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-[fadeIn_0.6s_ease-out]">
      {/* Archetype card */}
      <div
        className="border-3 border-foreground mb-6"
        style={{
          boxShadow: `8px 8px 0 ${archetype.typeColor}`,
        }}
      >
        {/* Color bar */}
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, ${archetype.typeColor}, ${archetype.accent})`,
          }}
        />

        <div className="p-6 md:p-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 mb-2">
            YOUR ARCHETYPE IS
          </p>
          <h1
            className="text-3xl md:text-5xl font-bold uppercase leading-none mb-4"
            style={{ color: archetype.typeColor }}
          >
            {archetype.name}
          </h1>
          <p className="text-sm opacity-60 max-w-lg leading-relaxed">
            {archetype.description}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap gap-2 mt-6">
            {archetype.traits.map((trait) => (
              <span
                key={trait}
                className="border-2 px-3 py-1 text-[10px] font-bold uppercase"
                style={{
                  borderColor: archetype.typeColor,
                  color: archetype.typeColor,
                }}
              >
                {trait}
              </span>
            ))}
          </div>

          {/* Nature badge */}
          <div className="mt-6 border-3 border-foreground inline-block">
            <div
              className="px-4 py-1 text-[9px] font-bold uppercase text-white"
              style={{ backgroundColor: archetype.accent }}
            >
              SUGGESTED NATURE
            </div>
            <div className="px-4 py-2">
              <p className="text-lg font-bold uppercase">
                {archetype.suggestedNature}
              </p>
              <p className="text-[10px] opacity-50">
                {archetype.natureEffect}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="border-3 border-foreground p-5 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
          [02] SCORE BREAKDOWN
        </h3>
        <div className="space-y-3">
          {SCORE_BARS.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-bold uppercase opacity-50">
                  {label}
                </span>
                <span className="text-[9px] font-bold">
                  {scores[key]}%
                </span>
              </div>
              <div className="h-4 bg-foreground/10 border border-foreground/20">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${scores[key]}%`,
                    backgroundColor: archetype.typeColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] font-bold uppercase opacity-30 mt-3">
          TYPE AFFINITY: {typeAffinity.toUpperCase()}
        </p>
      </div>

      {/* Your picks */}
      <div className="border-3 border-foreground p-5 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
          [03] YOUR PICKS
        </h3>
        <div className="flex justify-center gap-6">
          {pokemon.map((p) => (
            <div key={p.id} className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSpriteUrl(p.id)}
                alt={p.name}
                className="h-20 w-20 mx-auto"
                style={{ imageRendering: "pixelated" }}
              />
              <p className="text-[10px] font-bold uppercase mt-1">
                {p.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MBTI Profile */}
      {mbti && (
        <div className="border-3 border-foreground p-5 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
            [04] MBTI PROFILE
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <span
              className="text-3xl md:text-4xl font-bold uppercase tracking-wider px-4 py-2 border-3"
              style={{
                borderColor: archetype.typeColor,
                color: archetype.typeColor,
              }}
            >
              {mbti.type}
            </span>
            <div>
              <p
                className="text-sm font-bold uppercase"
                style={{ color: archetype.typeColor }}
              >
                {mbti.title}
              </p>
              <p className="text-[10px] opacity-50 max-w-sm leading-relaxed">
                {mbti.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MBTI_BARS.map(({ key, left, right }) => {
              const value = mbti.dimensions[key];
              const isLeft = value >= 50;
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{
                        opacity: isLeft ? 1 : 0.4,
                        color: isLeft ? archetype.typeColor : undefined,
                      }}
                    >
                      {left} ({value}%)
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{
                        opacity: !isLeft ? 1 : 0.4,
                        color: !isLeft ? archetype.typeColor : undefined,
                      }}
                    >
                      ({100 - value}%) {right}
                    </span>
                  </div>
                  <div className="relative h-4 bg-foreground/10 border border-foreground/20">
                    {isLeft ? (
                      <div
                        className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${value}%`,
                          backgroundColor: archetype.typeColor,
                        }}
                      />
                    ) : (
                      <div
                        className="absolute right-0 top-0 h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${100 - value}%`,
                          backgroundColor: archetype.typeColor,
                        }}
                      />
                    )}
                    {/* Center tick */}
                    <div className="absolute left-1/2 top-0 h-full w-[2px] bg-foreground/20 -translate-x-1/2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 border-3 border-foreground px-4 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          COPY TO CLIPBOARD
        </button>
        <button
          onClick={onReset}
          className="border-3 border-foreground px-6 py-3 text-[10px] font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}

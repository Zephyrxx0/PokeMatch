import type { Pokemon } from "@/app/types/pokemon";

export interface PersonalityScores {
  aggression: number;
  endurance: number;
  swiftness: number;
  physicality: number;
}

export interface Archetype {
  name: string;
  description: string;
  traits: string[];
  suggestedNature: string;
  natureEffect: string;
  typeColor: string;
  accent: string;
}

export interface MBTIDimensions {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
}

export interface MBTIProfile {
  type: string;
  title: string;
  description: string;
  dimensions: MBTIDimensions;
}

export interface PersonalityResult {
  archetype: Archetype;
  scores: PersonalityScores;
  typeAffinity: string;
  pokemon: Pokemon[];
  mbti: MBTIProfile;
}

const TYPE_GROUPS: Record<string, string[]> = {
  intense: ["fire", "fighting"],
  calm: ["water", "ice"],
  analytical: ["psychic", "ghost"],
  cunning: ["dark", "poison"],
  powerful: ["dragon", "ground"],
  free: ["electric", "flying"],
  patient: ["grass", "bug"],
  resilient: ["rock", "steel"],
  balanced: ["normal", "fairy"],
};

const ARCHETYPES: Archetype[] = [
  {
    name: "The Strategist",
    description:
      "You think three moves ahead. Patience and foresight are your weapons — you never act without a plan.",
    traits: ["Calculated", "Patient", "Perceptive", "Composed"],
    suggestedNature: "Careful",
    natureEffect: "+Sp.Def / −Sp.Atk",
    typeColor: "#B8B8D0",
    accent: "#F85888",
  },
  {
    name: "The Brawler",
    description:
      "You charge in head-first. Raw power and aggression define your style — finesse is overrated.",
    traits: ["Aggressive", "Fearless", "Direct", "Relentless"],
    suggestedNature: "Adamant",
    natureEffect: "+Attack / −Sp.Atk",
    typeColor: "#C03028",
    accent: "#F08030",
  },
  {
    name: "The Ace",
    description:
      "Speed kills. You strike before opponents can react, riding momentum to sweep the field.",
    traits: ["Swift", "Decisive", "Competitive", "Instinctive"],
    suggestedNature: "Jolly",
    natureEffect: "+Speed / −Sp.Atk",
    typeColor: "#F8D030",
    accent: "#A890F0",
  },
  {
    name: "The Guardian",
    description:
      "You're the wall that never breaks. Protecting your team comes before personal glory.",
    traits: ["Protective", "Reliable", "Selfless", "Enduring"],
    suggestedNature: "Bold",
    natureEffect: "+Defense / −Attack",
    typeColor: "#6890F0",
    accent: "#B8B8D0",
  },
  {
    name: "The Scholar",
    description:
      "Knowledge is power. You study every matchup, exploit every weakness, and outthink the opposition.",
    traits: ["Analytical", "Curious", "Methodical", "Cerebral"],
    suggestedNature: "Modest",
    natureEffect: "+Sp.Atk / −Attack",
    typeColor: "#F85888",
    accent: "#705898",
  },
  {
    name: "The Wildcard",
    description:
      "Unpredictable and unconventional. You defy expectations and thrive in chaos.",
    traits: ["Unpredictable", "Creative", "Adaptable", "Daring"],
    suggestedNature: "Naive",
    natureEffect: "+Speed / −Sp.Def",
    typeColor: "#7038F8",
    accent: "#705848",
  },
  {
    name: "The Powerhouse",
    description:
      "Unstoppable force meets immovable object — you're both. Overwhelming presence on every front.",
    traits: ["Dominant", "Resilient", "Imposing", "Versatile"],
    suggestedNature: "Hardy",
    natureEffect: "Neutral (no change)",
    typeColor: "#E0C068",
    accent: "#B8A038",
  },
  {
    name: "The Disruptor",
    description:
      "You don't play by the rules. Status moves, mind games, and misdirection are your bread and butter.",
    traits: ["Cunning", "Tricky", "Subversive", "Elusive"],
    suggestedNature: "Hasty",
    natureEffect: "+Speed / −Defense",
    typeColor: "#705898",
    accent: "#A040A0",
  },
];

function computeScores(picks: Pokemon[]): PersonalityScores {
  const avg = (fn: (p: Pokemon) => number) =>
    picks.reduce((sum, p) => sum + fn(p), 0) / picks.length;

  const aggression = Math.min(
    100,
    Math.round(avg((p) => (p.offensive_score ?? 80) / 180) * 100)
  );

  const endurance = Math.min(
    100,
    Math.round(avg((p) => (p.defensive_score ?? 80) / 180) * 100)
  );

  const fastCount = picks.filter(
    (p) => p.speed_tier === "fast" || p.speed_tier === "ultra_fast"
  ).length;
  const swiftness = Math.round((fastCount / picks.length) * 100);

  const physicalCount = picks.filter(
    (p) => p.attack_preference === "physical"
  ).length;
  const physicality = Math.round((physicalCount / picks.length) * 100);

  return { aggression, endurance, swiftness, physicality };
}

function getTypeAffinity(picks: Pokemon[]): string {
  const typeCounts: Record<string, number> = {};
  for (const p of picks) {
    for (const t of p.types) {
      typeCounts[t.toLowerCase()] = (typeCounts[t.toLowerCase()] || 0) + 1;
    }
  }

  let bestGroup = "balanced";
  let bestScore = 0;
  for (const [group, types] of Object.entries(TYPE_GROUPS)) {
    const score = types.reduce((s, t) => s + (typeCounts[t] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestGroup = group;
    }
  }
  return bestGroup;
}

function matchArchetype(
  scores: PersonalityScores,
  affinity: string
): Archetype {
  const { aggression, endurance, swiftness, physicality } = scores;

  // Score each archetype by how well it matches
  const scored = ARCHETYPES.map((arch) => {
    let fit = 0;

    switch (arch.name) {
      case "The Strategist":
        fit = endurance * 1.5 + (100 - aggression) * 0.8;
        if (affinity === "analytical" || affinity === "calm") fit += 40;
        break;
      case "The Brawler":
        fit = aggression * 1.5 + physicality * 0.8;
        if (affinity === "intense") fit += 40;
        break;
      case "The Ace":
        fit = swiftness * 1.5 + aggression * 0.6;
        if (affinity === "free") fit += 40;
        break;
      case "The Guardian":
        fit = endurance * 1.5 + (100 - aggression) * 0.5;
        if (affinity === "resilient" || affinity === "calm") fit += 40;
        break;
      case "The Scholar":
        fit = (100 - physicality) * 1.2 + (100 - aggression) * 0.5;
        if (affinity === "analytical") fit += 50;
        break;
      case "The Wildcard": {
        // Low variance in scores = wildcard
        const vals = [aggression, endurance, swiftness, physicality];
        const mean = vals.reduce((a, b) => a + b, 0) / 4;
        const variance =
          vals.reduce((a, v) => a + (v - mean) ** 2, 0) / 4;
        fit = Math.max(0, 100 - Math.sqrt(variance)) * 1.2;
        if (affinity === "cunning" || affinity === "powerful") fit += 30;
        break;
      }
      case "The Powerhouse":
        fit = aggression * 0.8 + endurance * 0.8 + physicality * 0.4;
        if (affinity === "powerful") fit += 40;
        break;
      case "The Disruptor":
        fit =
          (100 - physicality) * 0.6 +
          swiftness * 0.5 +
          (100 - endurance) * 0.4;
        if (affinity === "cunning" || affinity === "analytical") fit += 40;
        break;
    }

    return { archetype: arch, fit };
  });

  scored.sort((a, b) => b.fit - a.fit);
  return scored[0].archetype;
}

const MBTI_PROFILES: Record<string, { title: string; description: string }> = {
  ESTJ: { title: "The Commander", description: "Decisive, organized, and direct — you lead with authority and expect results." },
  ESTP: { title: "The Dynamo", description: "Bold and action-driven — you thrive in the heat of battle with quick reflexes." },
  ESFJ: { title: "The Provider", description: "Supportive and reliable — you bring the team together and keep morale high." },
  ESFP: { title: "The Performer", description: "Energetic and spontaneous — every battle is a stage for your flashy plays." },
  ENTJ: { title: "The Field Marshal", description: "Strategic and commanding — you see the whole board and control the game." },
  ENTP: { title: "The Visionary", description: "Inventive and quick-witted — you find unorthodox solutions others miss." },
  ENFJ: { title: "The Mentor", description: "Charismatic and empathetic — you inspire your team to reach their potential." },
  ENFP: { title: "The Champion", description: "Passionate and imaginative — your enthusiasm turns every fight into an adventure." },
  ISTJ: { title: "The Inspector", description: "Methodical and dependable — you run a tight ship and never overlook details." },
  ISTP: { title: "The Craftsman", description: "Quiet and precise — you solve problems with calm, hands-on expertise." },
  ISFJ: { title: "The Protector", description: "Loyal and steadfast — you shield your team from harm at all costs." },
  ISFP: { title: "The Composer", description: "Gentle yet fierce — your battling style is an art form all its own." },
  INTJ: { title: "The Mastermind", description: "Independent and strategic — you architect victory from the shadows." },
  INTP: { title: "The Architect", description: "Logical and inventive — you deconstruct systems and rebuild them better." },
  INFJ: { title: "The Counselor", description: "Insightful and idealistic — you read the battle with an almost psychic sense." },
  INFP: { title: "The Healer", description: "Compassionate and creative — you fight for your values with quiet determination." },
};

function computeMBTI(scores: PersonalityScores): MBTIProfile {
  const dims: MBTIDimensions = {
    EI: scores.aggression,
    SN: scores.endurance,
    TF: scores.swiftness,
    JP: scores.physicality,
  };

  const letter =
    (dims.EI >= 50 ? "E" : "I") +
    (dims.SN >= 50 ? "S" : "N") +
    (dims.TF >= 50 ? "T" : "F") +
    (dims.JP >= 50 ? "J" : "P");

  const profile = MBTI_PROFILES[letter] ?? { title: "Unknown", description: "" };
  return { type: letter, title: profile.title, description: profile.description, dimensions: dims };
}

export function analyzePersonality(picks: Pokemon[]): PersonalityResult {
  const scores = computeScores(picks);
  const typeAffinity = getTypeAffinity(picks);
  const archetype = matchArchetype(scores, typeAffinity);
  const mbti = computeMBTI(scores);

  return {
    archetype,
    scores,
    typeAffinity,
    pokemon: picks,
    mbti,
  };
}

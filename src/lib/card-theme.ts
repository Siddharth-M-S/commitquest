import type { GameStats } from "@/lib/types";

// Pokémon-style "type" color theme keyed off the primary class stat.
export interface CardTheme {
  stat: string;
  glow: string;
  accent: string;
  frame: string; // gradient for the foil frame
  aura: string; // radial background tint
}

const STAT_THEMES: Record<string, Omit<CardTheme, "stat">> = {
  STR: {
    glow: "#ef4444",
    accent: "#f87171",
    frame: "linear-gradient(135deg,#ef4444,#7f1d1d,#fca5a5,#991b1b)",
    aura: "radial-gradient(circle at 30% 20%, rgba(239,68,68,0.35), transparent 60%)",
  },
  INT: {
    glow: "#3b82f6",
    accent: "#60a5fa",
    frame: "linear-gradient(135deg,#3b82f6,#1e3a8a,#93c5fd,#1d4ed8)",
    aura: "radial-gradient(circle at 30% 20%, rgba(59,130,246,0.35), transparent 60%)",
  },
  DEX: {
    glow: "#22c55e",
    accent: "#4ade80",
    frame: "linear-gradient(135deg,#22c55e,#14532d,#86efac,#15803d)",
    aura: "radial-gradient(circle at 30% 20%, rgba(34,197,94,0.35), transparent 60%)",
  },
  AGI: {
    glow: "#10b981",
    accent: "#34d399",
    frame: "linear-gradient(135deg,#10b981,#064e3b,#6ee7b7,#047857)",
    aura: "radial-gradient(circle at 30% 20%, rgba(16,185,129,0.35), transparent 60%)",
  },
  DEF: {
    glow: "#a855f7",
    accent: "#c084fc",
    frame: "linear-gradient(135deg,#a855f7,#581c87,#d8b4fe,#7e22ce)",
    aura: "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.4), transparent 60%)",
  },
  WIS: {
    glow: "#eab308",
    accent: "#facc15",
    frame: "linear-gradient(135deg,#eab308,#713f12,#fde047,#a16207)",
    aura: "radial-gradient(circle at 30% 20%, rgba(234,179,8,0.35), transparent 60%)",
  },
  CHA: {
    glow: "#ec4899",
    accent: "#f472b6",
    frame: "linear-gradient(135deg,#ec4899,#831843,#f9a8d4,#be185d)",
    aura: "radial-gradient(circle at 30% 20%, rgba(236,72,153,0.35), transparent 60%)",
  },
  SPD: {
    glow: "#06b6d4",
    accent: "#22d3ee",
    frame: "linear-gradient(135deg,#06b6d4,#164e63,#67e8f9,#0e7490)",
    aura: "radial-gradient(circle at 30% 20%, rgba(6,182,212,0.35), transparent 60%)",
  },
  END: {
    glow: "#f97316",
    accent: "#fb923c",
    frame: "linear-gradient(135deg,#f97316,#7c2d12,#fdba74,#c2410c)",
    aura: "radial-gradient(circle at 30% 20%, rgba(249,115,22,0.35), transparent 60%)",
  },
  LCK: {
    glow: "#8b5cf6",
    accent: "#a78bfa",
    frame: "linear-gradient(135deg,#8b5cf6,#4c1d95,#c4b5fd,#6d28d9)",
    aura: "radial-gradient(circle at 30% 20%, rgba(139,92,246,0.35), transparent 60%)",
  },
};

export function themeForStats(stats: GameStats): CardTheme {
  const stat = stats.primaryClass?.stat ?? "LCK";
  const t = STAT_THEMES[stat] ?? STAT_THEMES.LCK;
  return { stat, ...t };
}

// Premium (Pro-only) cosmetic frames selectable via ?theme=
export const PREMIUM_THEMES: Record<string, Omit<CardTheme, "stat">> = {
  holo: {
    glow: "#22d3ee",
    accent: "#e879f9",
    frame:
      "linear-gradient(120deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#ec4899)",
    aura: "radial-gradient(circle at 30% 20%, rgba(139,92,246,0.35), transparent 60%)",
  },
  gold: {
    glow: "#fbbf24",
    accent: "#fde68a",
    frame: "linear-gradient(135deg,#fde68a,#b45309,#fef3c7,#92400e)",
    aura: "radial-gradient(circle at 30% 20%, rgba(251,191,36,0.4), transparent 60%)",
  },
  obsidian: {
    glow: "#64748b",
    accent: "#cbd5e1",
    frame: "linear-gradient(135deg,#334155,#0f172a,#475569,#020617)",
    aura: "radial-gradient(circle at 30% 20%, rgba(100,116,139,0.3), transparent 60%)",
  },
  rose: {
    glow: "#fb7185",
    accent: "#fda4af",
    frame: "linear-gradient(135deg,#fb7185,#881337,#fecdd3,#9f1239)",
    aura: "radial-gradient(circle at 30% 20%, rgba(251,113,133,0.35), transparent 60%)",
  },
};

export function resolveTheme(
  stats: GameStats,
  themeName?: string | null
): CardTheme {
  if (themeName && PREMIUM_THEMES[themeName]) {
    return { stat: stats.primaryClass?.stat ?? "LCK", ...PREMIUM_THEMES[themeName] };
  }
  return themeForStats(stats);
}

export interface Rarity {
  label: string;
  color: string;
  holo: boolean;
}

export function rarityForLevel(level: number): Rarity {
  if (level >= 50) return { label: "MYTHIC", color: "#ff3b3b", holo: true };
  if (level >= 30) return { label: "LEGENDARY", color: "#fbbf24", holo: true };
  if (level >= 20) return { label: "EPIC", color: "#c084fc", holo: false };
  if (level >= 10) return { label: "RARE", color: "#60a5fa", holo: false };
  return { label: "COMMON", color: "#9ca3af", holo: false };
}

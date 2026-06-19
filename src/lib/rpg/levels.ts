import type { LevelInfo } from "@/lib/types";

// Logarithmic-ish curve: early levels fast, later levels demand sustained effort.
// XP required to *reach* a given level.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 2.2));
}

const TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 50, title: "10x Mythic" },
  { minLevel: 40, title: "Distinguished Engineer" },
  { minLevel: 30, title: "Staff Engineer" },
  { minLevel: 25, title: "Tech Lead" },
  { minLevel: 20, title: "Principal Engineer" },
  { minLevel: 15, title: "Architect" },
  { minLevel: 10, title: "Senior Dev" },
  { minLevel: 5, title: "Code Squire" },
  { minLevel: 1, title: "Apprentice Coder" },
];

export function titleForLevel(level: number): string {
  return TITLES.find((t) => level >= t.minLevel)?.title ?? "Apprentice Coder";
}

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;

  const xpForThis = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const xpIntoLevel = xp - xpForThis;
  const xpForThisLevel = xpForNext - xpForThis;
  const xpToNext = xpForNext - xp;

  return {
    level,
    title: titleForLevel(level),
    currentXP: xp,
    xpIntoLevel,
    xpForThisLevel,
    xpToNext,
    progress: xpForThisLevel > 0 ? xpIntoLevel / xpForThisLevel : 1,
  };
}

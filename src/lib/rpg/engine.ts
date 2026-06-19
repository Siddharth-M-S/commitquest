import type { GameStats, RawStats } from "@/lib/types";
import { calculateXP } from "@/lib/rpg/xp";
import { getLevelInfo } from "@/lib/rpg/levels";
import { languagesToSkills, primaryClass } from "@/lib/rpg/skills";
import { checkAchievements } from "@/lib/rpg/achievements";

export function buildGameStats(raw: RawStats): GameStats {
  const xp = calculateXP(raw);
  const level = getLevelInfo(xp);
  const skills = languagesToSkills(raw.languages);
  const achievements = checkAchievements(raw);

  return {
    raw,
    xp,
    level,
    primaryClass: primaryClass(skills),
    skills,
    achievements,
    generatedAt: Date.now(),
  };
}

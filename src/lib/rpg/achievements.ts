import type { Achievement, RawStats } from "@/lib/types";

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (s: RawStats) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "night_owl",
    name: "Night Owl",
    description: "50+ commits after midnight",
    icon: "🦉",
    check: (s) => s.lateNightCommits >= 50,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "50+ commits in the morning",
    icon: "🌅",
    check: (s) => s.morningCommits >= 50,
  },
  {
    id: "month_warrior",
    name: "Month Warrior",
    description: "30-day commit streak",
    icon: "🔥",
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "100-day commit streak",
    icon: "💯",
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Coded in 10+ languages",
    icon: "🗺️",
    check: (s) => s.uniqueLanguages >= 10,
  },
  {
    id: "pr_machine",
    name: "PR Machine",
    description: "Opened 100+ pull requests",
    icon: "🤖",
    check: (s) => s.totalPRs >= 100,
  },
  {
    id: "oss_hero",
    name: "OSS Hero",
    description: "Earned 100+ stars",
    icon: "⭐",
    check: (s) => s.totalStarsEarned >= 100,
  },
  {
    id: "weekend_hacker",
    name: "Weekend Hacker",
    description: "100+ weekend commits",
    icon: "🎮",
    check: (s) => s.weekendCommits >= 100,
  },
  {
    id: "code_tsunami",
    name: "Code Tsunami",
    description: "50+ commits in a single day",
    icon: "🌊",
    check: (s) => s.maxCommitsOneDay >= 50,
  },
  {
    id: "code_sheriff",
    name: "Code Sheriff",
    description: "Reviewed 50+ pull requests",
    icon: "👮",
    check: (s) => s.totalPRReviews >= 50,
  },
];

export function checkAchievements(s: RawStats): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlocked: def.check(s),
  }));
}

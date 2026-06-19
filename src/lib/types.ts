// Shared types for CommitQuest

export interface LanguageStat {
  name: string;
  size: number; // bytes
  color: string | null;
}

export interface RepoContribution {
  name: string;
  primaryLanguage: string | null;
  stargazerCount: number;
  isFork: boolean;
  commits: number;
  languages: LanguageStat[];
}

export interface RawStats {
  login: string;
  name: string | null;
  avatarUrl: string;
  createdAt: string;
  followers: number;
  totalCommits: number;
  totalPRs: number;
  totalPRReviews: number;
  totalIssues: number;
  totalStarsEarned: number;
  totalRepos: number;
  // contribution calendar derived
  longestStreak: number;
  currentStreak: number;
  maxCommitsOneDay: number;
  lateNightCommits: number;
  morningCommits: number;
  weekendCommits: number;
  uniqueLanguages: number;
  languages: LanguageStat[];
  topRepos: RepoContribution[];
}

export interface Skill {
  language: string;
  className: string;
  icon: string;
  stat: string;
  proficiency: number; // 0-100
  percentage: number; // share of code
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  xpToNext: number;
  progress: number; // 0-1
}

export interface GameStats {
  raw: RawStats;
  xp: number;
  level: LevelInfo;
  primaryClass: Skill | null;
  skills: Skill[];
  achievements: Achievement[];
  generatedAt: number;
}

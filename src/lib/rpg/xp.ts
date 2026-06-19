import type { RawStats } from "@/lib/types";

// XP weights — PRs and reviews are worth more than raw commits to
// discourage commit spam farming.
export const XP_WEIGHTS = {
  commit: 10,
  pr: 50,
  review: 30,
  issue: 15,
  star: 5,
  repo: 100,
  streakDay: 25,
  activeStreakDay: 10,
};

// Anti-gaming: cap repo XP and credited commits.
const MAX_REPOS_CREDITED = 50;

export function calculateXP(s: RawStats): number {
  const commitXP = s.totalCommits * XP_WEIGHTS.commit;
  const prXP = s.totalPRs * XP_WEIGHTS.pr;
  const reviewXP = s.totalPRReviews * XP_WEIGHTS.review;
  const issueXP = s.totalIssues * XP_WEIGHTS.issue;
  const starXP = s.totalStarsEarned * XP_WEIGHTS.star;
  const repoXP = Math.min(s.totalRepos, MAX_REPOS_CREDITED) * XP_WEIGHTS.repo;
  const streakBonus = s.longestStreak * XP_WEIGHTS.streakDay;
  const activeBonus =
    s.currentStreak > 0 ? s.currentStreak * XP_WEIGHTS.activeStreakDay : 0;

  return Math.floor(
    commitXP +
      prXP +
      reviewXP +
      issueXP +
      starXP +
      repoXP +
      streakBonus +
      activeBonus
  );
}

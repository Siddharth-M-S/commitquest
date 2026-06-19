import type { GraphQLClient } from "graphql-request";
import type { LanguageStat, RawStats, RepoContribution } from "@/lib/types";
import { githubClient } from "@/lib/github/client";
import { CONTRIB_QUERY, PROFILE_QUERY } from "@/lib/github/queries";

interface ContribDay {
  contributionCount: number;
  date: string;
  weekday: number; // 0 = Sunday ... 6 = Saturday
}

interface ContribYearResult {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      restrictedContributionsCount: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: ContribDay[] }[];
      };
    };
  };
}

interface ProfileResult {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    createdAt: string;
    followers: { totalCount: number };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: {
        name: string;
        stargazerCount: number;
        isFork: boolean;
        primaryLanguage: { name: string; color: string | null } | null;
        languages: {
          edges: {
            size: number;
            node: { name: string; color: string | null };
          }[];
        };
      }[];
    };
  };
}

function yearRanges(createdAt: string): { from: string; to: string }[] {
  const startYear = new Date(createdAt).getUTCFullYear();
  const endYear = new Date().getUTCFullYear();
  const ranges: { from: string; to: string }[] = [];
  for (let y = startYear; y <= endYear; y++) {
    ranges.push({
      from: `${y}-01-01T00:00:00Z`,
      to: `${y}-12-31T23:59:59Z`,
    });
  }
  return ranges;
}

// Aggregate all per-day calendar entries across every year into streak stats.
function analyzeCalendar(days: ContribDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let runningStreak = 0;
  let maxCommitsOneDay = 0;
  let weekendCommits = 0;

  for (const d of sorted) {
    if (d.contributionCount > 0) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
    maxCommitsOneDay = Math.max(maxCommitsOneDay, d.contributionCount);
    if (d.weekday === 0 || d.weekday === 6) {
      weekendCommits += d.contributionCount;
    }
  }

  // Current streak: count back from today through consecutive active days.
  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (d.date > today) continue; // ignore future-dated padding
    if (d.contributionCount > 0) currentStreak += 1;
    else break;
  }

  return { longestStreak, currentStreak, maxCommitsOneDay, weekendCommits };
}

// Aggregate language byte counts across owned, non-fork repos.
function aggregateLanguages(profile: ProfileResult): {
  languages: LanguageStat[];
  uniqueLanguages: number;
  totalStars: number;
  topRepos: RepoContribution[];
} {
  const langMap = new Map<string, LanguageStat>();
  let totalStars = 0;
  const topRepos: RepoContribution[] = [];

  for (const repo of profile.user.repositories.nodes) {
    totalStars += repo.stargazerCount;
    const repoLangs: LanguageStat[] = [];
    for (const edge of repo.languages.edges) {
      const existing = langMap.get(edge.node.name);
      if (existing) {
        existing.size += edge.size;
      } else {
        langMap.set(edge.node.name, {
          name: edge.node.name,
          size: edge.size,
          color: edge.node.color,
        });
      }
      repoLangs.push({
        name: edge.node.name,
        size: edge.size,
        color: edge.node.color,
      });
    }
    if (topRepos.length < 6) {
      topRepos.push({
        name: repo.name,
        primaryLanguage: repo.primaryLanguage?.name ?? null,
        stargazerCount: repo.stargazerCount,
        isFork: repo.isFork,
        commits: 0,
        languages: repoLangs,
      });
    }
  }

  const languages = [...langMap.values()].sort((a, b) => b.size - a.size);
  return {
    languages,
    uniqueLanguages: langMap.size,
    totalStars,
    topRepos,
  };
}

export async function fetchRawStats(
  login: string,
  token: string
): Promise<RawStats> {
  const client: GraphQLClient = githubClient(token);

  // 1. Profile + repos (single query).
  const profile = await client.request<ProfileResult>(PROFILE_QUERY, { login });

  // 2. One contribution query per year, all in parallel.
  const ranges = yearRanges(profile.user.createdAt);
  const yearResults = await Promise.all(
    ranges.map((r) =>
      client.request<ContribYearResult>(CONTRIB_QUERY, {
        login,
        from: r.from,
        to: r.to,
      })
    )
  );

  // 3. Aggregate contribution totals + calendar.
  let totalCommits = 0;
  let totalPRs = 0;
  let totalPRReviews = 0;
  let totalIssues = 0;
  const allDays: ContribDay[] = [];

  for (const yr of yearResults) {
    const c = yr.user.contributionsCollection;
    totalCommits += c.totalCommitContributions;
    totalPRs += c.totalPullRequestContributions;
    totalPRReviews += c.totalPullRequestReviewContributions;
    totalIssues += c.totalIssueContributions;
    for (const week of c.contributionCalendar.weeks) {
      allDays.push(...week.contributionDays);
    }
  }

  const cal = analyzeCalendar(allDays);
  const langAgg = aggregateLanguages(profile);

  return {
    login: profile.user.login,
    name: profile.user.name,
    avatarUrl: profile.user.avatarUrl,
    createdAt: profile.user.createdAt,
    followers: profile.user.followers.totalCount,
    totalCommits,
    totalPRs,
    totalPRReviews,
    totalIssues,
    totalStarsEarned: langAgg.totalStars,
    totalRepos: profile.user.repositories.totalCount,
    longestStreak: cal.longestStreak,
    currentStreak: cal.currentStreak,
    maxCommitsOneDay: cal.maxCommitsOneDay,
    // Hour-of-day data is not exposed by the contribution calendar API,
    // so these remain 0 unless a future commit-timestamp fetch is added.
    lateNightCommits: 0,
    morningCommits: 0,
    weekendCommits: cal.weekendCommits,
    uniqueLanguages: langAgg.uniqueLanguages,
    languages: langAgg.languages,
    topRepos: langAgg.topRepos,
  };
}

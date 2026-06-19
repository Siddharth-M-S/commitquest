import type { GameStats } from "@/lib/types";
import { fetchRawStats } from "@/lib/github/fetcher";
import { buildGameStats } from "@/lib/rpg/engine";
import { getCachedStats, setCachedStats } from "@/lib/cache";
import { publicToken } from "@/lib/github/client";
import { recordLeader } from "@/lib/leaderboard";

export interface StatsOptions {
  // A signed-in user's token, used to fetch their own (incl. private) data.
  token?: string;
  // Whether the subject is a Pro user. Gates private-contribution counting,
  // a near-live cache TTL, and a separate cache namespace.
  pro?: boolean;
}

// Resolve a user's game stats, using cache first. Pro users get private
// contributions folded into their totals and a near-live cache; free users
// get public-only stats with a longer cache.
export async function getStats(
  login: string,
  opts: StatsOptions = {}
): Promise<GameStats> {
  const { token, pro = false } = opts;

  const cached = await getCachedStats(login, pro);
  if (cached) {
    void recordLeader(cached, pro);
    return cached;
  }

  const raw = await fetchRawStats(login, token ?? publicToken());

  // Pro perk: private repo contributions count toward commits, XP and level.
  // Free users only ever see public totals.
  if (pro && raw.privateContributions > 0) {
    raw.totalCommits += raw.privateContributions;
  }

  const game = buildGameStats(raw);
  await setCachedStats(login, game, pro);
  void recordLeader(game, pro);
  return game;
}

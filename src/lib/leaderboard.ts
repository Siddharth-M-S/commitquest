import { Redis } from "@upstash/redis";
import type { GameStats } from "@/lib/types";

// Global leaderboard. Uses an Upstash sorted set (score = XP) plus a JSON
// blob per player for display. Falls back to an in-memory map for local dev.
let redis: Redis | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface LeaderEntry {
  login: string;
  name: string;
  avatarUrl: string;
  level: number;
  xp: number;
  classLabel: string;
  icon: string;
  stat: string;
  pro: boolean;
}

const ZKEY = "leaderboard:xp";
const pkey = (login: string) => `lb:profile:${login.toLowerCase()}`;

const memBoard = new Map<string, LeaderEntry>();

function entryFromStats(stats: GameStats, pro: boolean): LeaderEntry {
  const { raw, level, primaryClass, xp } = stats;
  return {
    login: raw.login,
    name: raw.name ?? raw.login,
    avatarUrl: raw.avatarUrl,
    level: level.level,
    xp,
    classLabel: primaryClass
      ? `${primaryClass.language} ${primaryClass.className}`
      : "Wanderer",
    icon: primaryClass?.icon ?? "🌍",
    stat: primaryClass?.stat ?? "LCK",
    pro,
  };
}

// Record (or update) a player's leaderboard entry. Best-effort: never throws.
export async function recordLeader(
  stats: GameStats,
  pro: boolean
): Promise<void> {
  const entry = entryFromStats(stats, pro);
  const k = entry.login.toLowerCase();
  try {
    if (redis) {
      await Promise.all([
        redis.zadd(ZKEY, { score: entry.xp, member: k }),
        redis.set(pkey(k), entry),
      ]);
      return;
    }
  } catch {
    // ignore — leaderboard is non-critical
    return;
  }
  memBoard.set(k, entry);
}

// Top N players by XP, descending. Pro players are visually boosted by the
// page, but ranking itself stays honest (pure XP).
export async function topLeaders(limit = 50): Promise<LeaderEntry[]> {
  try {
    if (redis) {
      const logins = await redis.zrange<string[]>(ZKEY, 0, limit - 1, {
        rev: true,
      });
      if (!logins.length) return [];
      const profiles = await Promise.all(
        logins.map((l) => redis!.get<LeaderEntry>(pkey(l)))
      );
      return profiles.filter((p): p is LeaderEntry => !!p);
    }
  } catch {
    return [];
  }
  return [...memBoard.values()]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

// A single player's rank (1-based), or null if not on the board.
export async function leaderRank(login: string): Promise<number | null> {
  const k = login.toLowerCase();
  try {
    if (redis) {
      const r = await redis.zrevrank(ZKEY, k);
      return r === null || r === undefined ? null : r + 1;
    }
  } catch {
    return null;
  }
  const sorted = [...memBoard.values()].sort((a, b) => b.xp - a.xp);
  const idx = sorted.findIndex((e) => e.login.toLowerCase() === k);
  return idx === -1 ? null : idx + 1;
}

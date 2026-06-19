import { Redis } from "@upstash/redis";
import type { GameStats } from "@/lib/types";

// Free users get a 6h cache (cheap, "stale"). Pro users get a near-live
// 5-minute cache so their card refreshes almost immediately.
const FREE_TTL_SECONDS = 6 * 60 * 60; // 6 hours
const PRO_TTL_SECONDS = 5 * 60; // 5 minutes

// Upstash Redis if configured, otherwise an in-memory Map fallback so the
// app runs with zero external services during local dev.
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

interface MemEntry {
  value: GameStats;
  expires: number;
}
const memCache = new Map<string, MemEntry>();

// Pro stats may include private contributions, so they MUST be cached under a
// separate key from public (free) stats to avoid leaking private totals.
function key(login: string, pro: boolean): string {
  return `stats:${pro ? "pro:" : ""}${login.toLowerCase()}`;
}

export async function getCachedStats(
  login: string,
  pro = false
): Promise<GameStats | null> {
  const k = key(login, pro);
  if (redis) {
    const v = await redis.get<GameStats>(k);
    return v ?? null;
  }
  const entry = memCache.get(k);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memCache.delete(k);
    return null;
  }
  return entry.value;
}

export async function setCachedStats(
  login: string,
  value: GameStats,
  pro = false
): Promise<void> {
  const k = key(login, pro);
  const ttl = pro ? PRO_TTL_SECONDS : FREE_TTL_SECONDS;
  if (redis) {
    await redis.set(k, value, { ex: ttl });
    return;
  }
  memCache.set(k, { value, expires: Date.now() + ttl * 1000 });
}

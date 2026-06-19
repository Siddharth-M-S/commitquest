import { Redis } from "@upstash/redis";
import type { GameStats } from "@/lib/types";

const TTL_SECONDS = 6 * 60 * 60; // 6 hours

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

function key(login: string): string {
  return `stats:${login.toLowerCase()}`;
}

export async function getCachedStats(
  login: string
): Promise<GameStats | null> {
  const k = key(login);
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
  value: GameStats
): Promise<void> {
  const k = key(login);
  if (redis) {
    await redis.set(k, value, { ex: TTL_SECONDS });
    return;
  }
  memCache.set(k, { value, expires: Date.now() + TTL_SECONDS * 1000 });
}

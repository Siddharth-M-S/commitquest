import { Redis } from "@upstash/redis";

// Persistent Pro store. Uses Upstash Redis when configured,
// otherwise an in-memory set (dev only — resets on restart).
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

const memPro = new Set<string>();
const memStarPro = new Set<string>();

function key(login: string): string {
  return `pro:${login.toLowerCase()}`;
}

function starKey(login: string): string {
  return `star-pro:${login.toLowerCase()}`;
}

// Local dev override: comma-separated usernames treated as Pro. Only meant
// for local testing without Redis — this env var is never set in production.
function localProUsers(): Set<string> {
  const raw = process.env.LOCAL_PRO_USERS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function isPro(login: string | undefined | null): Promise<boolean> {
  if (!login) return false;
  if (localProUsers().has(login.toLowerCase())) return true;
  if (redis) {
    const v = await redis.get<number>(key(login));
    return v === 1;
  }
  return memPro.has(login.toLowerCase());
}

export async function setPro(login: string, active: boolean): Promise<void> {
  if (redis) {
    if (active) await redis.set(key(login), 1);
    else await redis.del(key(login));
    return;
  }
  if (active) memPro.add(login.toLowerCase());
  else memPro.delete(login.toLowerCase());
}

// star-pro flag: marks that this user's Pro came from a GitHub star.
// Used by /api/me to re-verify the star on every page load.
export async function isStarPro(login: string): Promise<boolean> {
  if (redis) {
    const v = await redis.get<number>(starKey(login));
    return v === 1;
  }
  return memStarPro.has(login.toLowerCase());
}

export async function setStarPro(login: string, active: boolean): Promise<void> {
  if (redis) {
    if (active) await redis.set(starKey(login), 1);
    else await redis.del(starKey(login));
    return;
  }
  if (active) memStarPro.add(login.toLowerCase());
  else memStarPro.delete(login.toLowerCase());
}

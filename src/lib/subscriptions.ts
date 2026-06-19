import { Redis } from "@upstash/redis";

// Persistent Pro-subscription store. Uses Upstash Redis when configured,
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

function key(login: string): string {
  return `pro:${login.toLowerCase()}`;
}

// Local dev override: comma-separated usernames treated as Pro. Only meant
// for local testing without Redis/Stripe — this env var is never set in
// production, so it cannot grant Pro to real users.
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

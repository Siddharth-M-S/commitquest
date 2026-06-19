import { Redis } from "@upstash/redis";

// Per-user Pro card customization (title, tagline, default theme, layout).
// Uses Upstash Redis when configured, otherwise an in-memory map (dev only).
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

export const PREF_THEMES = ["holo", "gold", "obsidian", "rose"] as const;
export const PREF_LAYOUTS = ["detailed", "compact", "minimal"] as const;

export type PrefTheme = (typeof PREF_THEMES)[number];
export type PrefLayout = (typeof PREF_LAYOUTS)[number];

export interface CardPrefs {
  title?: string; // e.g. "Rust God" — overrides the class banner
  tagline?: string; // e.g. "Shipping since 1991" — overrides the subtitle
  theme?: PrefTheme; // persisted premium frame
  layout?: PrefLayout; // persisted card layout
}

const memPrefs = new Map<string, CardPrefs>();

function key(login: string): string {
  return `prefs:${login.toLowerCase()}`;
}

const MAX_TITLE = 24;
const MAX_TAGLINE = 40;

// Sanitize untrusted input before persisting/rendering.
export function sanitizePrefs(input: unknown): CardPrefs {
  const out: CardPrefs = {};
  if (!input || typeof input !== "object") return out;
  const o = input as Record<string, unknown>;

  if (typeof o.title === "string") {
    const t = o.title.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE);
    if (t) out.title = t;
  }
  if (typeof o.tagline === "string") {
    const t = o.tagline.replace(/\s+/g, " ").trim().slice(0, MAX_TAGLINE);
    if (t) out.tagline = t;
  }
  if (typeof o.theme === "string" && (PREF_THEMES as readonly string[]).includes(o.theme)) {
    out.theme = o.theme as PrefTheme;
  }
  if (
    typeof o.layout === "string" &&
    (PREF_LAYOUTS as readonly string[]).includes(o.layout)
  ) {
    out.layout = o.layout as PrefLayout;
  }
  return out;
}

export async function getPrefs(login: string): Promise<CardPrefs> {
  const k = key(login);
  try {
    if (redis) {
      const v = await redis.get<CardPrefs>(k);
      return v ?? {};
    }
  } catch {
    // Redis unreachable (e.g. offline/dev) — degrade gracefully.
    return {};
  }
  return memPrefs.get(k) ?? {};
}

export async function setPrefs(login: string, prefs: CardPrefs): Promise<void> {
  const k = key(login);
  const clean = sanitizePrefs(prefs);
  try {
    if (redis) {
      await redis.set(k, clean);
      return;
    }
  } catch {
    // Fall through to in-memory so the request still succeeds.
  }
  memPrefs.set(k, clean);
}

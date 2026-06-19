import type { GameStats } from "@/lib/types";
import { fetchRawStats } from "@/lib/github/fetcher";
import { buildGameStats } from "@/lib/rpg/engine";
import { getCachedStats, setCachedStats } from "@/lib/cache";
import { publicToken } from "@/lib/github/client";

// Resolve a user's game stats, using cache first. `token` lets a signed-in
// user fetch their own (incl. private) data; falls back to the server's
// public token for anonymous profile lookups.
export async function getStats(
  login: string,
  token?: string
): Promise<GameStats> {
  const cached = await getCachedStats(login);
  if (cached) return cached;

  const raw = await fetchRawStats(login, token ?? publicToken());
  const game = buildGameStats(raw);
  await setCachedStats(login, game);
  return game;
}

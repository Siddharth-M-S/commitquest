import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro } from "@/lib/subscriptions";
import { getStats } from "@/lib/stats-service";
import { CharacterCard } from "@/components/CharacterCard";
import type { GameStats } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 0;

interface Props {
  params: { a: string; b: string };
}

export function generateMetadata({ params }: Props) {
  return {
    title: `${params.a} vs ${params.b} — CommitQuest`,
    description: `Head-to-head comparison of @${params.a} and @${params.b}.`,
  };
}

type Metric = {
  label: string;
  get: (s: GameStats) => number;
  fmt?: (n: number) => string;
};

const METRICS: Metric[] = [
  { label: "Level", get: (s) => s.level.level },
  { label: "XP", get: (s) => s.xp, fmt: (n) => n.toLocaleString() },
  {
    label: "Commits",
    get: (s) => s.raw.totalCommits,
    fmt: (n) => n.toLocaleString(),
  },
  { label: "Pull Requests", get: (s) => s.raw.totalPRs },
  { label: "Reviews", get: (s) => s.raw.totalPRReviews },
  {
    label: "Stars Earned",
    get: (s) => s.raw.totalStarsEarned,
    fmt: (n) => n.toLocaleString(),
  },
  { label: "Longest Streak", get: (s) => s.raw.longestStreak },
  { label: "Repos", get: (s) => s.raw.totalRepos },
  { label: "Followers", get: (s) => s.raw.followers },
];

export default async function CompareResultPage({ params }: Props) {
  const a = params.a;
  const b = params.b;

  const session = await getServerSession(authOptions);
  const viewerPro = session?.login ? await isPro(session.login) : false;

  if (!viewerPro) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
          <p className="text-lg font-bold text-amber-300">
            👑 Compare is a Pro feature
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Go Pro to compare {`@${a}`} and {`@${b}`} side by side.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-lg bg-amber-500 px-5 py-2 font-bold text-black transition hover:bg-amber-400"
          >
            Go Pro →
          </Link>
        </div>
      </main>
    );
  }

  const [aProRes, bProRes] = await Promise.all([isPro(a), isPro(b)]);
  let statsA: GameStats | null = null;
  let statsB: GameStats | null = null;
  let failed = false;
  try {
    [statsA, statsB] = await Promise.all([
      getStats(a, { pro: aProRes }),
      getStats(b, { pro: bProRes }),
    ]);
  } catch {
    failed = true;
  }

  if (failed || !statsA || !statsB) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-xl border border-red-900 bg-red-950/30 p-6">
          <p className="text-lg font-bold text-red-300">
            We couldn&apos;t compare these profiles
          </p>
          <p className="mt-2 text-sm text-gray-400">
            One of the usernames may be misspelled or unavailable. Check{" "}
            <span className="text-gray-200">@{a}</span> and{" "}
            <span className="text-gray-200">@{b}</span> and try again.
          </p>
          <Link
            href="/compare"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-500"
          >
            ← Try again
          </Link>
        </div>
      </main>
    );
  }

  let aWins = 0;
  let bWins = 0;
  for (const m of METRICS) {
    const av = m.get(statsA);
    const bv = m.get(statsB);
    if (av > bv) aWins++;
    else if (bv > av) bWins++;
  }
  const overall =
    aWins > bWins ? statsA : bWins > aWins ? statsB : null;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/compare"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            ← New comparison
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            🏆 Leaderboard →
          </Link>
        </div>

        <h1 className="text-center text-3xl font-black tracking-tight">
          @{statsA.raw.login} <span className="text-amber-400">vs</span> @
          {statsB.raw.login}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          {overall ? (
            <>
              👑 Winner:{" "}
              <span className="font-bold text-amber-300">
                {overall.raw.name ?? overall.raw.login}
              </span>{" "}
              ({aWins}–{bWins})
            </>
          ) : (
            <>It&apos;s a tie! ({aWins}–{bWins})</>
          )}
        </p>

        {/* Side-by-side cards */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CharacterCard stats={statsA} />
          <CharacterCard stats={statsB} />
        </div>

        {/* Stat-by-stat table */}
        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-gray-800">
          <div className="grid grid-cols-3 bg-gray-900 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
            <span className="text-left">@{statsA.raw.login}</span>
            <span className="text-center">Stat</span>
            <span className="text-right">@{statsB.raw.login}</span>
          </div>
          {METRICS.map((m) => {
            const av = m.get(statsA!);
            const bv = m.get(statsB!);
            const fmt = m.fmt ?? ((n: number) => String(n));
            const aWin = av > bv;
            const bWin = bv > av;
            return (
              <div
                key={m.label}
                className="grid grid-cols-3 items-center border-t border-gray-800 px-4 py-3 text-sm"
              >
                <span
                  className={`text-left font-bold ${
                    aWin ? "text-amber-300" : "text-gray-300"
                  }`}
                >
                  {aWin && "▲ "}
                  {fmt(av)}
                </span>
                <span className="text-center text-xs uppercase tracking-wide text-gray-500">
                  {m.label}
                </span>
                <span
                  className={`text-right font-bold ${
                    bWin ? "text-amber-300" : "text-gray-300"
                  }`}
                >
                  {fmt(bv)}
                  {bWin && " ▲"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

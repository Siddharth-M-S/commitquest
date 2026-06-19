import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { topLeaders } from "@/lib/leaderboard";
import { rarityForLevel } from "@/lib/card-theme";

export const runtime = "nodejs";
export const revalidate = 0;

export const metadata = {
  title: "Leaderboard — CommitQuest",
  description: "The highest-level developers on CommitQuest.",
};

function medal(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default async function LeaderboardPage() {
  const [leaders, session] = await Promise.all([
    topLeaders(50),
    getServerSession(authOptions),
  ]);
  const me = session?.login?.toLowerCase();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            ← CommitQuest
          </Link>
          <Link
            href="/compare"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            Compare friends →
          </Link>
        </div>

        <h1 className="text-center text-4xl font-black tracking-tight">
          🏆 Leaderboard
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          Ranked by total XP. View any profile to join the board.
        </p>

        {leaders.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            No players yet — be the first! Open your{" "}
            <Link href="/" className="text-purple-400 hover:underline">
              profile
            </Link>{" "}
            to appear here.
          </p>
        ) : (
          <ol className="mt-8 space-y-2">
            {leaders.map((e, i) => {
              const rank = i + 1;
              const rarity = rarityForLevel(e.level);
              const isMe = me && e.login.toLowerCase() === me;
              return (
                <li key={e.login}>
                  <Link
                    href={`/${e.login}`}
                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition ${
                      e.pro
                        ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-400"
                        : "border-gray-800 bg-gray-900/40 hover:border-purple-500"
                    } ${isMe ? "ring-2 ring-purple-500" : ""}`}
                  >
                    <span className="w-10 shrink-0 text-center text-lg font-bold text-gray-300">
                      {medal(rank)}
                    </span>
                    <Image
                      src={e.avatarUrl}
                      alt={e.login}
                      width={44}
                      height={44}
                      className="rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold text-white">
                          {e.name}
                        </span>
                        {e.pro && (
                          <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black">
                            👑 PRO
                          </span>
                        )}
                        {isMe && (
                          <span className="shrink-0 text-[10px] text-purple-400">
                            you
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-gray-400">
                        {e.icon} {e.classLabel} · @{e.login}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-white">
                        {e.xp.toLocaleString()} XP
                      </div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: rarity.color }}
                      >
                        Lv {e.level} · {rarity.label}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}

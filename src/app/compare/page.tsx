import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro } from "@/lib/subscriptions";
import { CompareForm } from "@/components/CompareForm";

export const runtime = "nodejs";
export const revalidate = 0;

export const metadata = {
  title: "Compare — CommitQuest",
  description: "Compare two developers' CommitQuest cards side by side.",
};

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  const viewerPro = session?.login ? await isPro(session.login) : false;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            ← CommitQuest
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            🏆 Leaderboard →
          </Link>
        </div>

        <h1 className="text-4xl font-black tracking-tight">
          ⚔ Compare Developers
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Put two GitHub profiles head-to-head, stat for stat.
        </p>

        {viewerPro ? (
          <CompareForm initialA={session?.login ?? ""} />
        ) : (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
            <p className="text-lg font-bold text-amber-300">
              👑 Compare is a Pro feature
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Go Pro to put your card head-to-head with friends and rivals.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-lg bg-amber-500 px-5 py-2 font-bold text-black transition hover:bg-amber-400"
            >
              Go Pro →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

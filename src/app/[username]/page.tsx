import Link from "next/link";
import type { Metadata } from "next";
import { getStats } from "@/lib/stats-service";
import { CharacterCard } from "@/components/CharacterCard";

export const runtime = "nodejs";
export const revalidate = 0;

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = params.username;
  const ogUrl = `/api/og/${u}`;
  return {
    title: `${u} — CommitQuest`,
    description: `${u}'s GitHub RPG character card.`,
    openGraph: {
      title: `${u} on CommitQuest`,
      description: `Check out ${u}'s GitHub RPG character.`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogUrl],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const username = params.username;

  let stats;
  let error: string | null = null;
  try {
    stats = await getStats(username);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load profile.";
  }

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto mb-3 max-w-5xl flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 hover:text-purple-400">
          ← CommitQuest
        </Link>
        {!error && stats && (
          <a
            href={`/api/og/${username}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            View shareable card image →
          </a>
        )}
      </div>

      {error || !stats ? (
        <div className="mx-auto max-w-md rounded-xl border border-red-900 bg-red-950/30 p-6 text-center">
          <p className="text-lg font-bold text-red-300">Couldn&apos;t load @{username}</p>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
          <p className="mt-3 text-xs text-gray-500">
            Make sure GITHUB_PUBLIC_TOKEN is configured and the username exists.
          </p>
        </div>
      ) : (
        <CharacterCard stats={stats} />
      )}
    </main>
  );
}

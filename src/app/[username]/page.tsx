import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStats } from "@/lib/stats-service";
import { CharacterCard } from "@/components/CharacterCard";
import { CardActions } from "@/components/CardActions";
import { isPro } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const revalidate = 0;

interface Props {
  params: { username: string };
  searchParams: Record<string, string | undefined>;
}

// Turn any raw fetch error into a calm, user-facing message — never expose
// internal/env details or stack traces to the user.
function friendlyError(raw: string, username: string): {
  title: string;
  body: string;
} {
  const m = raw.toLowerCase();
  if (
    m.includes("could not resolve") ||
    m.includes("not found") ||
    m.includes("404")
  ) {
    return {
      title: `We couldn't find @${username}`,
      body: "Double-check the GitHub username — it may be misspelled or the account may not exist.",
    };
  }
  if (m.includes("rate limit") || m.includes("403") || m.includes("429")) {
    return {
      title: "We're a bit busy right now",
      body: "GitHub is rate-limiting requests. Please try again in a minute.",
    };
  }
  return {
    title: `Couldn't load @${username}`,
    body: "Something went wrong fetching this profile. Please try again in a moment.",
  };
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

  const pro = await isPro(username);
  const session = await getServerSession(authOptions);
  const isOwner = session?.login?.toLowerCase() === username.toLowerCase();
  const token = isOwner ? session?.accessToken : undefined;

  let stats;
  let error: string | null = null;
  try {
    stats = await getStats(username, { token, pro });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load profile.";
  }

  const friendly = error ? friendlyError(error, username) : null;

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
          <p className="text-lg font-bold text-red-300">{friendly?.title}</p>
          <p className="mt-2 text-sm text-gray-400">{friendly?.body}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-500"
          >
            ← Try another username
          </Link>
        </div>
      ) : (
        <>
          <CharacterCard stats={stats} />
          <CardActions username={username} pro={pro} canEdit={isOwner && pro} />
        </>
      )}
    </main>
  );
}

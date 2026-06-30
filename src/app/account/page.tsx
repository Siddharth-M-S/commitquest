import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro } from "@/lib/subscriptions";
import { SignInButton, SignOutButton } from "@/components/SignInButton";

export const runtime = "nodejs";
export const revalidate = 0;

export const metadata = {
  title: "Account — CommitQuest",
};

export default async function AccountPage() {
  // 1. Who are you? — read from the signed-in session (GitHub username).
  const session = await getServerSession(authOptions);
  const login = session?.login ?? null;

  // 2. Are you Pro? — server-side lookup of pro:<username> in Redis.
  const pro = login ? await isPro(login) : false;

  const authConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            ← CommitQuest
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Your account</h1>

        {!login ? (
          /* Not signed in */
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-center">
            <p className="text-gray-300">You&apos;re not signed in.</p>
            <p className="mt-1 text-sm text-gray-500">
              Sign in with GitHub to see your status and manage Pro.
            </p>
            <div className="mt-5 flex justify-center">
              {authConfigured ? (
                <SignInButton />
              ) : (
                <span className="text-sm text-gray-500">
                  GitHub login isn&apos;t configured on this server.
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Identity + Pro status cards */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Signed in as
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    @{login}
                  </p>
                </div>
                <Link
                  href={`/${login}`}
                  className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 transition hover:border-purple-500"
                >
                  View my card →
                </Link>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  pro
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-gray-800 bg-gray-900/40"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                   Pro Status
                </p>
                {pro ? (
                  <>
                    <p className="mt-1 text-lg font-bold text-amber-300">
                      👑 Pro — active
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      All Pro features are unlocked for{" "}
                      <span className="font-semibold">@{login}</span>: private
                      stats, premium frames, custom card, 2× downloads, README
                      badge and Compare.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-lg font-bold text-gray-200">
                      Free plan
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      You&apos;re on the free tier. Star our GitHub repo to
                      unlock private stats, premium looks and more — completely
                      free.
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-4 inline-block rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 text-sm font-bold text-black transition hover:from-amber-300 hover:to-amber-400"
                    >
                      ✦ Go Pro
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* How it works — answers "how does the app know I'm Pro?" */}
            <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/20 p-5">
              <p className="text-sm font-bold text-gray-200">
                How we know you&apos;re {pro ? "Pro" : "on Free"}
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-gray-400">
                <li>
                  You signed in with GitHub, so we know your username is{" "}
                  <span className="font-mono text-gray-200">@{login}</span>.
                </li>
                <li>
                  On every page, our server checks your Pro status for
                  that username.
                </li>
                <li>
                  Pro is granted the moment you star our GitHub repo and verify —
                  and is re-checked on every page load.
                </li>
                <li>
                  Result for you right now:{" "}
                  <span
                    className={
                      pro ? "font-semibold text-amber-300" : "text-gray-300"
                    }
                  >
                    {pro ? "Pro ✅" : "Free"}
                  </span>
                  .
                </li>
              </ol>
              <p className="mt-3 text-xs text-gray-600">
                Your Pro status is tied to your GitHub account — not this
                browser. Sign in anywhere and it follows you.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <SignOutButton />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

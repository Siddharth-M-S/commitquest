import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-black text-purple-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-100">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          The page you&apos;re looking for isn&apos;t here. Try revealing a
          GitHub character instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-purple-500"
          >
            Reveal a card
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:border-purple-500"
          >
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}

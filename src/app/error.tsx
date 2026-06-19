"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for diagnostics; the user never sees the raw error.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md rounded-2xl border border-red-900 bg-red-950/30 p-8">
        <p className="text-5xl">🛠️</p>
        <h1 className="mt-4 text-2xl font-black text-red-200">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          We hit an unexpected error. It&apos;s not you — try again, and if it
          keeps happening, come back in a little while.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-purple-500"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:border-purple-500"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

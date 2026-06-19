"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (u) {
      setLoading(true);
      router.push(`/${u}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
        Commit<span className="text-purple-500">Quest</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-400">
        Turn your GitHub history into a persistent RPG character. Earn XP, level
        up, unlock achievements.
      </p>
      <p className="mt-2 text-2xl font-bold text-purple-400">
        What class are you?
      </p>

      <form onSubmit={go} className="mt-8 flex w-full max-w-md gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-github-username"
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-purple-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner size={16} /> Revealing…
            </>
          ) : (
            "Reveal"
          )}
        </button>
      </form>

      <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
        {["torvalds", "gaearon", "sindresorhus", "yyx990803"].map((u) => (
          <a
            key={u}
            href={`/${u}`}
            className="rounded-full border border-gray-800 px-3 py-1 hover:border-purple-500 hover:text-purple-400"
          >
            @{u}
          </a>
        ))}
      </div>
    </main>
  );
}

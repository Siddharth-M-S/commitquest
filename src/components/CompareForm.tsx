"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";

export function CompareForm({ initialA = "" }: { initialA?: string }) {
  const router = useRouter();
  const [a, setA] = useState(initialA);
  const [b, setB] = useState("");
  const [loading, setLoading] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const ca = a.trim().replace(/^@/, "");
    const cb = b.trim().replace(/^@/, "");
    if (ca && cb) {
      setLoading(true);
      router.push(`/compare/${ca}/${cb}`);
    }
  }

  return (
    <form onSubmit={go} className="mt-8 flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="your-username"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-amber-500"
        />
        <span className="text-center text-sm font-bold text-amber-400">VS</span>
        <input
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="friend-username"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-amber-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner size={16} /> Comparing…
          </>
        ) : (
          "⚔ Compare"
        )}
      </button>
    </form>
  );
}

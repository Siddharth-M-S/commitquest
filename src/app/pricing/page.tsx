"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

interface Me {
  login: string | null;
  pro: boolean;
  authConfigured: boolean;
}

const FREE = [
  "Current + all-time public stats",
  "Glossy character card",
  "Shareable card image",
  "1 type-based theme",
];

const PRO = [
  "Private repo contributions counted",
  "Premium frames (holo, gold, obsidian, rose)",
  "Clean, watermark-free card",
  "High-res 2× downloads",
  "Custom title, tagline & layouts",
  "Auto-updating README badge",
  "Compare developers head-to-head",
  "Priority 5-min refresh + leaderboard flair",
];

const REPO_URL = "https://github.com/Siddharth-M-S/commitquest";

export default function PricingPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "opened" | "verifying" | "done">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  function fetchMe() {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ login: null, pro: false, authConfigured: false }));
  }

  useEffect(() => {
    fetchMe();
  }, []);

  function openRepo() {
    window.open(REPO_URL, "_blank", "noopener,noreferrer");
    setStep("opened");
    setNotice(null);
  }

  async function verifyStar() {
    setLoading(true);
    setStep("verifying");
    setNotice(null);
    try {
      const res = await fetch("/api/star-check", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.pro) {
        setStep("done");
        fetchMe(); // re-fetch so the Pro badge shows
      } else {
        setStep("opened");
        setNotice(
          "We couldn't find your star yet. Make sure you've starred the repo, then try again."
        );
      }
    } catch {
      setStep("opened");
      setNotice("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-black sm:text-5xl">
          Level up with <span className="text-purple-500">Pro</span>
        </h1>
        <p className="mt-3 text-gray-400">
          Everything you need to flex your dev character — completely free.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-gray-800 bg-panel p-6">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-1 text-3xl font-black">$0</p>
          <ul className="mt-5 space-y-2 text-sm text-gray-300">
            {FREE.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border border-purple-600 bg-gradient-to-b from-purple-900/30 to-panel p-6 shadow-xl">
          <h2 className="text-xl font-bold text-purple-300">Pro</h2>

          <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-bold text-amber-300">⭐ Free — Star to Unlock</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-300">
              Star our GitHub repo and get full Pro access instantly —
              completely free, forever. Just a star is all it takes.
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-gray-200">
            {PRO.map((f) => (
              <li key={f}>★ {f}</li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            {!me ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : me.pro ? (
              <div className="rounded-lg bg-purple-600/20 py-3 text-center font-bold text-purple-300">
                You&apos;re Pro ✦
              </div>
            ) : !me.login ? (
              me.authConfigured ? (
                <>
                  <button
                    onClick={() => signIn("github", { callbackUrl: "/pricing" })}
                    className="w-full rounded-lg bg-white py-3 font-bold text-black transition hover:bg-gray-200"
                  >
                    Sign in with GitHub
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    Sign in first, then star the repo to unlock Pro.
                  </p>
                </>
              ) : (
                <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 text-center text-sm text-gray-400">
                  GitHub login isn&apos;t set up yet.
                </div>
              )
            ) : step === "done" ? (
              <div className="rounded-lg bg-purple-600/20 py-3 text-center font-bold text-purple-300">
                You&apos;re Pro ✦
              </div>
            ) : step === "idle" ? (
              <>
                <button
                  onClick={openRepo}
                  className="w-full rounded-lg bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400"
                >
                  ⭐ Star on GitHub to Get Pro
                </button>
                <p className="text-center text-xs text-gray-500">
                  Opens the repo in a new tab. Star it, then come back and verify.
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={openRepo}
                  className="w-full rounded-lg border border-amber-500/50 bg-amber-500/10 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-500/20"
                >
                  ⭐ Open repo to star →
                </button>
                <button
                  onClick={verifyStar}
                  disabled={loading}
                  className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
                >
                  {loading ? "Verifying…" : "I've starred it — Verify ✓"}
                </button>
              </>
            )}
          </div>

          {notice && (
            <p className="mt-3 rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-center text-xs text-red-300">
              {notice}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl text-center text-xs text-gray-600">
        <p className="text-gray-500 font-medium">Pro is 100% free — no credit card, ever.</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <a href="/faq" className="text-purple-400 hover:underline">
            Questions? Read the FAQ →
          </a>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </main>
  );
}

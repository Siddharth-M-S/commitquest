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

export default function PricingPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ login: null, pro: false, authConfigured: false }));
  }, []);

  async function upgrade() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(
        data.error ??
          "We couldn't start checkout right now. Please try again in a moment."
      );
    } catch {
      setNotice(
        "Network error — please check your connection and try again."
      );
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
          Everything you need to flex your dev character.
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
          <p className="mt-1 text-3xl font-black">
            $4<span className="text-base font-normal text-gray-400">/year</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Billed annually · ~$0.33/mo</p>
          <ul className="mt-5 space-y-2 text-sm text-gray-200">
            {PRO.map((f) => (
              <li key={f}>★ {f}</li>
            ))}
          </ul>

          <div className="mt-6">
            {!me ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : me.pro ? (
              <div className="rounded-lg bg-purple-600/20 py-3 text-center font-bold text-purple-300">
                You&apos;re Pro ✦
              </div>
            ) : me.login ? (
              <button
                onClick={upgrade}
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {loading ? "Redirecting…" : "Upgrade to Pro"}
              </button>
            ) : me.authConfigured ? (
              <>
                <button
                  onClick={() => signIn("github", { callbackUrl: "/pricing" })}
                  className="w-full rounded-lg bg-white py-3 font-bold text-black transition hover:bg-gray-200"
                >
                  Sign in with GitHub
                </button>
                <p className="mt-2 text-center text-xs text-gray-500">
                  Step 1 of 2 — sign in, then pay to unlock Pro. Browsing &amp;
                  free cards never need an account.
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 text-center text-sm text-gray-400">
                GitHub login isn&apos;t set up yet.
                <br />
                <span className="text-gray-500">
                  Add OAuth keys to enable Pro sign-in.
                </span>
              </div>
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
        Secure billing by Stripe. Cancel anytime.
        <div className="mt-3">
          <a href="/faq" className="text-purple-400 hover:underline">
            Questions? Read the FAQ →
          </a>
        </div>
      </div>
    </main>
  );
}

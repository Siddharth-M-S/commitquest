"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";

interface Me {
  login: string | null;
  pro: boolean;
  authConfigured: boolean;
}

export function SiteHeader() {
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ login: null, pro: false, authConfigured: false }));
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-[#06070d]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand */}
        <Link href="/" className="text-lg font-black tracking-tight">
          Commit<span className="text-purple-500">Quest</span>
        </Link>

        {/* Center nav (hidden on small screens) */}
        <nav className="hidden items-center gap-5 text-sm text-gray-300 sm:flex">
          <Link href="/leaderboard" className="hover:text-purple-400">
            🏆 Leaderboard
          </Link>
          <Link href="/compare" className="hover:text-purple-400">
            ⚔ Compare
          </Link>
          <Link href="/faq" className="hover:text-purple-400">
            ❓ FAQ
          </Link>
        </nav>

        {/* Go Pro + Auth state */}
        <div className="flex items-center gap-2">
          {me && !me.pro && (
            <Link
              href="/pricing"
              className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-sm font-bold text-black transition hover:from-amber-300 hover:to-amber-400"
            >
              ✦ Go Pro
            </Link>
          )}
          {!me ? (
            <span className="text-xs text-gray-600">…</span>
          ) : me.login ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-1.5 text-sm transition hover:border-purple-500"
              >
                <span className="text-gray-200">@{me.login}</span>
                {me.pro && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black">
                    👑 PRO
                  </span>
                )}
                <span className="text-xs text-gray-500">▾</span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href={`/${me.login}`}
                    className="block px-4 py-2.5 text-sm text-gray-200 transition hover:bg-purple-600/20"
                    onClick={() => setMenuOpen(false)}
                  >
                    🪪 My card
                  </Link>
                  {!me.pro && (
                    <Link
                      href="/pricing"
                      className="block px-4 py-2.5 text-sm text-amber-300 transition hover:bg-amber-500/10"
                      onClick={() => setMenuOpen(false)}
                    >
                      ✦ Upgrade to Pro
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-gray-800"
                  >
                    ⎋ Sign out
                  </button>
                </div>
              )}
            </div>
          ) : me.authConfigured ? (
            <button
              onClick={() => signIn("github")}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-black transition hover:bg-gray-200"
            >
              Sign in
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

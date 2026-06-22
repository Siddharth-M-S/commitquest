"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

const PRO_THEMES = ["holo", "gold", "obsidian", "rose"] as const;
const PRO_LAYOUTS = ["detailed", "compact", "minimal"] as const;

export function CardActions({
  username,
  pro,
  canEdit = false,
}: {
  username: string;
  pro: boolean;
  // True only when the signed-in viewer owns this (Pro) card.
  canEdit?: boolean;
}) {
  const router = useRouter();

  // Customization state (Pro)
  const [theme, setTheme] = useState<string>("");
  const [layout, setLayout] = useState<string>("detailed");
  const [title, setTitle] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Load the owner's saved prefs into the editor.
  useEffect(() => {
    if (!canEdit) return;
    let active = true;
    fetch("/api/prefs")
      .then((r) => (r.ok ? r.json() : {}))
      .then((p: { theme?: string; layout?: string; title?: string; tagline?: string }) => {
        if (!active || !p) return;
        if (p.theme) setTheme(p.theme);
        if (p.layout) setLayout(p.layout);
        if (p.title) setTitle(p.title);
        if (p.tagline) setTagline(p.tagline);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [canEdit]);

  // Debounce preview refresh so typing doesn't hammer the OG route.
  useEffect(() => {
    if (!panelOpen) return;
    const t = setTimeout(() => {
      setPreviewLoading(true);
      setPreviewVersion((v) => v + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [theme, layout, title, tagline, panelOpen]);

  // Close the share menu on outside click / Escape
  useEffect(() => {
    if (!shareOpen) return;
    function onClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShareOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [shareOpen]);

  // Build the OG image URL. Pro extras are only appended for Pro users; the
  // server re-validates Pro before honoring any of them.
  const buildOgUrl = useCallback(
    (opts: { hires?: boolean; bust?: number } = {}) => {
      const qs = new URLSearchParams();
      if (pro) {
        if (theme) qs.set("theme", theme);
        if (layout) qs.set("layout", layout);
        if (title) qs.set("title", title);
        if (tagline) qs.set("tagline", tagline);
        if (opts.hires) qs.set("scale", "2");
      }
      if (opts.bust) qs.set("v", String(opts.bust));
      const q = qs.toString();
      return `/api/og/${username}` + (q ? `?${q}` : "");
    },
    [pro, theme, layout, title, tagline, username]
  );

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `/${username}`;

  async function download() {
    setBusy(true);
    try {
      // Pro perk: download a clean, high-resolution 2x PNG.
      const res = await fetch(buildOgUrl({ hires: pro }));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commitquest-${username}${pro ? "-2x" : ""}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function savePrefs() {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, layout, title, tagline }),
      });
      if (res.ok) {
        setSavedMsg("✓ Saved — downloading your card…");
        router.refresh();
        await download();
      } else {
        const e = await res.json().catch(() => ({}));
        setSavedMsg(e.error ? `✗ ${e.error}` : "✗ Failed to save");
      }
    } catch {
      setSavedMsg("✗ Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 4000);
    }
  }

  const shareText = `Check out my CommitQuest character card 🎮⚔️\nWhat class are you?`;

  const SHARE_TARGETS = [
    {
      key: "x",
      label: "X / Twitter",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      key: "reddit",
      label: "Reddit",
      icon: "🅡",
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(
        shareUrl
      )}&title=${encodeURIComponent(shareText)}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: "✆",
      href: `https://wa.me/?text=${encodeURIComponent(
        shareText + " " + shareUrl
      )}`,
    },
  ] as const;

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "CommitQuest",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or unsupported — fall back to menu
      }
    }
    setShareOpen((o) => !o);
  }

  function openShare(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  return (
    <div className="mx-auto mt-4 max-w-5xl">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={download}
          disabled={busy}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          {busy ? "Preparing…" : pro ? "⬇ Download 2x PNG" : "⬇ Download PNG"}
        </button>
        <button
          onClick={copyLink}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-purple-500"
        >
          {copied ? "✓ Copied!" : "🔗 Copy link"}
        </button>
        <div ref={shareRef} className="relative">
          <button
            onClick={share}
            aria-haspopup="menu"
            aria-expanded={shareOpen}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-purple-500"
          >
            ↗ Share
          </button>
          {shareOpen && (
            <div
              role="menu"
              className="absolute left-1/2 z-20 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl"
            >
              {SHARE_TARGETS.map((t) => (
                <button
                  key={t.key}
                  role="menuitem"
                  onClick={() => openShare(t.href)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 transition hover:bg-purple-600/20"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-800 text-xs font-bold">
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="rounded-lg border border-amber-500/60 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
          >
            👑 Customize {panelOpen ? "▲" : "▼"}
          </button>
        )}
      </div>

      {/* Pro customization studio (owner only) */}
      {canEdit && panelOpen && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-gray-900/60 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-gray-400">
                Custom title (replaces class)
                <input
                  value={title}
                  maxLength={24}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. "Rust God"`}
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-gray-400">
                Tagline (replaces subtitle)
                <input
                  value={tagline}
                  maxLength={40}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={`e.g. "Shipping since 1991"`}
                  className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-400"
                />
              </label>

              <div className="flex flex-col gap-1 text-xs uppercase tracking-wide text-gray-400">
                Frame theme
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTheme("")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                      theme === ""
                        ? "bg-amber-400 text-black"
                        : "border border-gray-700 text-gray-300 hover:border-amber-400"
                    }`}
                  >
                    default
                  </button>
                  {PRO_THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                        theme === t
                          ? "bg-amber-400 text-black"
                          : "border border-gray-700 text-gray-300 hover:border-amber-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs uppercase tracking-wide text-gray-400">
                Layout
                <div className="flex flex-wrap gap-2">
                  {PRO_LAYOUTS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                        layout === l
                          ? "bg-amber-400 text-black"
                          : "border border-gray-700 text-gray-300 hover:border-amber-400"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={savePrefs}
                  disabled={saving}
                  className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {saving ? "Saving & downloading…" : "💾 Save & Download"}
                </button>
                {savedMsg && (
                  <span className="text-xs text-gray-300">{savedMsg}</span>
                )}
              </div>
            </div>

            {/* Live preview */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Live preview
              </span>
              <div className="relative w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-900" style={{ minHeight: 180 }}>
                {/* Skeleton shown while image loads */}
                {previewLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-900">
                    <div className="h-4 w-2/3 animate-pulse rounded-md bg-gray-700" />
                    <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-700" />
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-700" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded-md bg-gray-800" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={previewVersion}
                  src={buildOgUrl({ bust: previewVersion })}
                  alt="Card preview"
                  onLoad={() => setPreviewLoading(false)}
                  onError={() => setPreviewLoading(false)}
                  className={`w-full transition-opacity duration-300 ${previewLoading ? "opacity-0" : "opacity-100"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!pro && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Want premium frames, custom titles, layouts &amp; a clean hi-res card?{" "}
          <a href="/pricing" className="text-purple-400 hover:underline">
            Go Pro →
          </a>
        </p>
      )}
    </div>
  );
}

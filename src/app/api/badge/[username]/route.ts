import { getStats } from "@/lib/stats-service";
import { isPro } from "@/lib/subscriptions";
import { themeForStats, rarityForLevel } from "@/lib/card-theme";

export const runtime = "nodejs";

// Pro-only README embed badge. Returns an auto-updating SVG that devs can
// drop into their GitHub README. Free users get a 403 nudge to upgrade.
function svg(content: string): Response {
  return new Response(content, {
    headers: {
      "content-type": "image/svg+xml",
      // Short cache so the badge stays fresh-ish but isn't hammered.
      "cache-control": "public, max-age=1800, s-maxage=1800",
    },
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  const pro = await isPro(username);
  if (!pro) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="40">
        <rect width="320" height="40" rx="6" fill="#0d1117" stroke="#7c3aed"/>
        <text x="16" y="25" fill="#c084fc" font-family="monospace" font-size="13">
          👑 CommitQuest Pro — upgrade to embed
        </text>
      </svg>`
    );
  }

  let stats;
  try {
    stats = await getStats(username, { pro });
  } catch {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="40">
        <rect width="320" height="40" rx="6" fill="#0d1117"/>
        <text x="16" y="25" fill="#f87171" font-family="monospace" font-size="13">@${esc(
          username
        )} not found</text>
      </svg>`
    );
  }

  const { raw, level, primaryClass, xp } = stats;
  const theme = themeForStats(stats);
  const rarity = rarityForLevel(level.level);
  const cls = primaryClass
    ? `${primaryClass.language} ${primaryClass.className}`
    : "Wanderer";

  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${theme.glow}"/>
          <stop offset="1" stop-color="${theme.accent}"/>
        </linearGradient>
      </defs>
      <rect width="480" height="120" rx="14" fill="#0c0f1a" stroke="url(#g)" stroke-width="3"/>
      <text x="22" y="38" fill="#f5f7fa" font-family="monospace" font-size="20" font-weight="bold">${esc(
        raw.name ?? raw.login
      )}</text>
      <text x="22" y="60" fill="#9ca3af" font-family="monospace" font-size="13">@${esc(
        raw.login
      )} · 👑 PRO</text>
      <text x="22" y="92" fill="${theme.accent}" font-family="monospace" font-size="16" font-weight="bold">Lv ${
        level.level
      } ${esc(cls)}</text>
      <text x="458" y="38" text-anchor="end" fill="${
        rarity.color
      }" font-family="monospace" font-size="13" font-weight="bold">${rarity.label}</text>
      <text x="458" y="92" text-anchor="end" fill="#9ca3af" font-family="monospace" font-size="13">${xp.toLocaleString()} XP</text>
    </svg>`
  );
}

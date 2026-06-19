import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStats } from "@/lib/stats-service";
import { rarityForLevel, resolveTheme } from "@/lib/card-theme";
import { isPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

// Load bundled fonts once. Passing explicit fonts also avoids a @vercel/og
// bug on Windows that builds a malformed file:// URL for its default font.
let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  const toAB = (b: Buffer) =>
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
  const regular = await readFile(
    join(process.cwd(), "assets", "NotoSans-Regular.ttf")
  );
  fontCache = { regular: toAB(regular), bold: toAB(regular) };
  return fontCache;
}

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username;
  const themeParam = new URL(req.url).searchParams.get("theme");
  const f = await loadFonts();
  const fonts = [
    { name: "Noto", data: f.regular, weight: 400 as const, style: "normal" as const },
  ];

  let stats;
  try {
    stats = await getStats(username);
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0d1117",
            color: "#e6edf3",
            fontSize: 48,
          }}
        >
          {`@${username} not found`}
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  }

  const { raw, level, primaryClass, skills, xp } = stats;
  // Premium themes + watermark removal are Pro-only perks for the card owner.
  const pro = await isPro(username);
  const theme = resolveTheme(stats, pro ? themeParam : null);
  const rarity = rarityForLevel(level.level);
  const top3 = skills.slice(0, 3);

  const statBoxes: [string, string][] = [
    ["COMMITS", raw.totalCommits.toLocaleString()],
    ["PRs", String(raw.totalPRs)],
    ["STARS", String(raw.totalStarsEarned)],
    ["STREAK", `${raw.longestStreak}🔥`],
    ["XP", xp.toLocaleString()],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#06070d",
          padding: 18,
          fontFamily: "Noto",
        }}
      >
        {/* Foil frame */}
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: 36,
            padding: 14,
            background: theme.frame,
            boxShadow: `0 0 60px ${theme.glow}66`,
          }}
        >
          {/* Inner card */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 24,
              padding: 32,
              overflow: "hidden",
              backgroundColor: "#0c0f1a",
              backgroundImage: `${theme.aura}, linear-gradient(160deg,#11152400,#0a0c14)`,
              border: "2px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Glossy diagonal sheen */}
            <div
              style={{
                position: "absolute",
                top: -200,
                left: -100,
                width: 700,
                height: 1000,
                transform: "rotate(25deg)",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.10) 55%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Top bar: rarity + level */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#0a0c14",
                  background: rarity.color,
                  boxShadow: `0 0 24px ${rarity.color}88`,
                }}
              >
                {rarity.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div
                  style={{
                    fontSize: 30,
                    color: "#9ca3af",
                    marginRight: 10,
                    paddingBottom: 10,
                  }}
                >
                  LVL
                </div>
                <div
                  style={{
                    fontSize: 76,
                    fontWeight: 700,
                    color: theme.accent,
                    lineHeight: 1,
                  }}
                >
                  {String(level.level)}
                </div>
              </div>
            </div>

            {/* Portrait + identity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: 6,
                  borderRadius: 24,
                  background: theme.frame,
                  boxShadow: `0 0 30px ${theme.glow}aa`,
                }}
              >
                <img
                  src={raw.avatarUrl}
                  width={112}
                  height={112}
                  style={{ borderRadius: 18 }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 50, fontWeight: 700, color: "#f5f7fa" }}>
                  {raw.name ?? raw.login}
                </div>
                <div style={{ fontSize: 28, color: "#9ca3af" }}>
                  {`@${raw.login}`}
                </div>
                <div style={{ fontSize: 24, color: "#6b7280", marginTop: 2 }}>
                  {level.title}
                </div>
              </div>
            </div>

            {/* Type badge (class) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginTop: 16,
                padding: "14px 0",
                borderRadius: 18,
                fontSize: 42,
                fontWeight: 700,
                color: "#ffffff",
                background: `linear-gradient(90deg, ${theme.glow}22, ${theme.glow}55, ${theme.glow}22)`,
                border: `2px solid ${theme.glow}88`,
              }}
            >
              {primaryClass
                ? `${primaryClass.icon}  ${primaryClass.language} ${primaryClass.className}`
                : "🌍  Wanderer"}
            </div>

            {/* Ability stat boxes */}
            <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
              {statBoxes.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "14px 0",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#ffffff" }}>
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: "#9ca3af",
                      letterSpacing: 1,
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: skills + brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: 18,
                fontSize: 25,
                color: "#9ca3af",
              }}
            >
              <div style={{ display: "flex", gap: 22 }}>
                {top3.map((s) => (
                  <span key={s.language}>
                    {`${s.icon} ${s.language} ${s.percentage}%`}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  fontSize: 28,
                  fontWeight: 700,
                  color: theme.accent,
                }}
              >
                {pro ? "✦ PRO" : "⚔ CommitQuest"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}

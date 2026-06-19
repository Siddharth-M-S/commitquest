import Image from "next/image";
import type { GameStats } from "@/lib/types";
import { SkillBar } from "@/components/SkillBar";
import { AchievementBadge } from "@/components/AchievementBadge";
import { rarityForLevel, themeForStats } from "@/lib/card-theme";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
    </div>
  );
}

export function CharacterCard({ stats }: { stats: GameStats }) {
  const { raw, level, primaryClass, skills, achievements, xp } = stats;
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const theme = themeForStats(stats);
  const rarity = rarityForLevel(level.level);

  return (
    <div
      className="mx-auto max-w-5xl rounded-3xl p-[6px] shadow-2xl"
      style={{
        backgroundImage: theme.frame,
        boxShadow: `0 0 50px ${theme.glow}55`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-[20px] p-5 sm:p-6"
        style={{
          backgroundColor: "#0c0f1a",
          backgroundImage: `${theme.aura}, linear-gradient(160deg,#11152400,#0a0c14)`,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Glossy diagonal sheen */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: -160,
            left: -100,
            width: 600,
            height: 900,
            transform: "rotate(25deg)",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 52%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div className="relative grid gap-6 lg:grid-cols-2">
          {/* LEFT column: identity + stats */}
          <div className="flex flex-col">
            {/* Top bar: rarity + level */}
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold tracking-widest text-black"
                style={{
                  backgroundColor: rarity.color,
                  boxShadow: `0 0 18px ${rarity.color}88`,
                }}
              >
                {rarity.label}
              </span>
              <div className="flex items-end gap-2">
                <span className="pb-1 text-xs text-gray-400">LVL</span>
                <span
                  className="text-4xl font-black leading-none"
                  style={{ color: theme.accent }}
                >
                  {level.level}
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mt-3 flex items-center gap-4">
              <div
                className="flex rounded-2xl p-[4px]"
                style={{
                  backgroundImage: theme.frame,
                  boxShadow: `0 0 22px ${theme.glow}aa`,
                }}
              >
                <Image
                  src={raw.avatarUrl}
                  alt={raw.login}
                  width={72}
                  height={72}
                  className="rounded-xl"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">
                  {raw.name ?? raw.login}
                </h1>
                <p className="text-sm text-gray-400">@{raw.login}</p>
                <p className="text-xs text-gray-500">{level.title}</p>
              </div>
            </div>

            {/* Class type banner */}
            {primaryClass && (
              <div
                className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3"
                style={{
                  background: `linear-gradient(90deg, ${theme.glow}22, ${theme.glow}55, ${theme.glow}22)`,
                  border: `1px solid ${theme.glow}88`,
                }}
              >
                <span className="text-2xl">{primaryClass.icon}</span>
                <span className="text-lg font-bold text-white">
                  {primaryClass.language} {primaryClass.className}
                </span>
              </div>
            )}

            {/* XP bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>{xp.toLocaleString()} XP</span>
                <span>
                  {level.xpToNext.toLocaleString()} to Lv {level.level + 1}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.round(level.progress * 100)}%`,
                    background: `linear-gradient(90deg, ${theme.glow}, ${theme.accent})`,
                  }}
                />
              </div>
            </div>

            {/* Core stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Commits" value={raw.totalCommits.toLocaleString()} />
              <Stat label="PRs" value={raw.totalPRs} />
              <Stat label="Reviews" value={raw.totalPRReviews} />
              <Stat label="Stars" value={raw.totalStarsEarned} />
              <Stat label="Streak" value={`${raw.longestStreak}🔥`} />
              <Stat label="Repos" value={raw.totalRepos} />
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Skill Tree
                </h2>
                <div className="space-y-2">
                  {skills.map((s) => (
                    <SkillBar key={s.language} skill={s} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT column: achievements */}
          <div className="flex flex-col">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Achievements{" "}
              <span className="text-gray-600">
                {unlocked}/{achievements.length}
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
              {achievements.map((a) => (
                <AchievementBadge key={a.id} a={a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

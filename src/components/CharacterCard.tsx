import Image from "next/image";
import type { GameStats } from "@/lib/types";
import { SkillBar } from "@/components/SkillBar";
import { AchievementBadge } from "@/components/AchievementBadge";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-gray-900/60 px-3 py-2 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
    </div>
  );
}

export function CharacterCard({ stats }: { stats: GameStats }) {
  const { raw, level, primaryClass, skills, achievements, xp } = stats;
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-gray-800 bg-panel p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src={raw.avatarUrl}
          alt={raw.login}
          width={72}
          height={72}
          className="rounded-full border-2 border-purple-500"
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            {raw.name ?? raw.login}
          </h1>
          <p className="text-sm text-gray-400">@{raw.login}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-purple-400">
            Lv {level.level}
          </div>
          <div className="text-xs text-gray-400">{level.title}</div>
        </div>
      </div>

      {/* Class banner */}
      {primaryClass && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-fuchsia-600/20 py-3">
          <span className="text-2xl">{primaryClass.icon}</span>
          <span className="text-lg font-bold text-white">
            {primaryClass.language} {primaryClass.className}
          </span>
        </div>
      )}

      {/* XP bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{xp.toLocaleString()} XP</span>
          <span>{level.xpToNext.toLocaleString()} XP to Lv {level.level + 1}</span>
        </div>
        <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
            style={{ width: `${Math.round(level.progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Core stats */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="Commits" value={raw.totalCommits.toLocaleString()} />
        <Stat label="PRs" value={raw.totalPRs} />
        <Stat label="Reviews" value={raw.totalPRReviews} />
        <Stat label="Stars" value={raw.totalStarsEarned} />
        <Stat label="Streak" value={`${raw.longestStreak}🔥`} />
        <Stat label="Repos" value={raw.totalRepos} />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
            Skill Tree
          </h2>
          <div className="space-y-3">
            {skills.map((s) => (
              <SkillBar key={s.language} skill={s} />
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Achievements <span className="text-gray-600">{unlocked}/{achievements.length}</span>
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

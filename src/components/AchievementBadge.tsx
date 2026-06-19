import type { Achievement } from "@/lib/types";

export function AchievementBadge({ a }: { a: Achievement }) {
  return (
    <div
      title={a.description}
      className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
        a.unlocked
          ? "border-amber-500/50 bg-amber-500/10"
          : "border-gray-800 bg-gray-900/40 opacity-40"
      }`}
    >
      <span className="text-2xl">{a.unlocked ? a.icon : "🔒"}</span>
      <span className="mt-1 text-xs font-semibold">{a.name}</span>
    </div>
  );
}

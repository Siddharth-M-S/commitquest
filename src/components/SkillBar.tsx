import type { Skill } from "@/lib/types";

export function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center">{skill.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">
            {skill.language}{" "}
            <span className="text-gray-400">· {skill.className}</span>
          </span>
          <span className="text-gray-400">{skill.percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </div>
    </div>
  );
}

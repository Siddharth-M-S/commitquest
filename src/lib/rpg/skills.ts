import type { LanguageStat, Skill } from "@/lib/types";

interface ClassDef {
  className: string;
  icon: string;
  stat: string;
}

// Language -> RPG class mapping. 30 languages from Octoverse 2025 top usage.
// All classes kept positive/neutral — no language shaming.
export const LANGUAGE_CLASSES: Record<string, ClassDef> = {
  // Tier 1 — core
  TypeScript: { className: "Ranger", icon: "🏹", stat: "DEX" },
  Python: { className: "Wizard", icon: "🧙", stat: "INT" },
  JavaScript: { className: "Rogue", icon: "🗡️", stat: "AGI" },
  Java: { className: "Cleric", icon: "📖", stat: "WIS" },
  "C#": { className: "Knight", icon: "🛡️", stat: "DEF" },
  PHP: { className: "Bard", icon: "🎵", stat: "CHA" },
  Shell: { className: "Assassin", icon: "🦂", stat: "AGI" },
  "C++": { className: "Berserker", icon: "🪓", stat: "STR" },
  Go: { className: "Monk", icon: "☯️", stat: "SPD" },
  C: { className: "Warrior", icon: "⚔️", stat: "STR" },
  // Tier 2
  Rust: { className: "Paladin", icon: "🦀", stat: "DEF" },
  Kotlin: { className: "Duelist", icon: "⚡", stat: "DEX" },
  Swift: { className: "Scout", icon: "🦅", stat: "AGI" },
  Ruby: { className: "Alchemist", icon: "💎", stat: "INT" },
  Dart: { className: "Archer", icon: "🎯", stat: "DEX" },
  R: { className: "Oracle", icon: "🔮", stat: "WIS" },
  Scala: { className: "Sage", icon: "📐", stat: "WIS" },
  Lua: { className: "Trickster", icon: "🌙", stat: "LCK" },
  Elixir: { className: "Shapeshifter", icon: "🧪", stat: "INT" },
  Haskell: { className: "Archmage", icon: "✨", stat: "INT" },
  // Tier 3
  PowerShell: { className: "Enchanter", icon: "💠", stat: "INT" },
  "Jupyter Notebook": { className: "Scholar", icon: "📓", stat: "WIS" },
  Dockerfile: { className: "Architect", icon: "🏗️", stat: "DEF" },
  YAML: { className: "Scribe", icon: "📜", stat: "WIS" },
  Astro: { className: "Starweaver", icon: "🌟", stat: "CHA" },
  Vue: { className: "Illusionist", icon: "🎭", stat: "CHA" },
  HCL: { className: "Engineer", icon: "🔧", stat: "DEF" },
  Perl: { className: "Elder", icon: "🧓", stat: "WIS" },
  MATLAB: { className: "Mathematician", icon: "🧮", stat: "INT" },
  Objective: { className: "Veteran", icon: "🎖️", stat: "END" },
};

const DEFAULT_CLASS: ClassDef = {
  className: "Wanderer",
  icon: "🌍",
  stat: "LCK",
};

export function classForLanguage(lang: string): ClassDef {
  return LANGUAGE_CLASSES[lang] ?? DEFAULT_CLASS;
}

// Convert aggregated language byte counts into ranked skills.
export function languagesToSkills(languages: LanguageStat[]): Skill[] {
  const total = languages.reduce((sum, l) => sum + l.size, 0);
  if (total === 0) return [];

  return languages
    .filter((l) => l.size / total > 0.02) // >2% of total code
    .map((l) => {
      const def = classForLanguage(l.name);
      // log scale proficiency, clamped 1..100
      const prof = Math.max(
        1,
        Math.min(100, Math.floor(Math.log2(Math.max(l.size, 1) / 1000 + 1) * 10))
      );
      return {
        language: l.name,
        className: def.className,
        icon: def.icon,
        stat: def.stat,
        proficiency: prof,
        percentage: Math.round((l.size / total) * 100),
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
}

export function primaryClass(skills: Skill[]): Skill | null {
  return skills.length > 0 ? skills[0] : null;
}

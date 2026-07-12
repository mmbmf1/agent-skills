import { readFile } from "fs/promises";
import { README_PATH, SKILLS_SECTION_BEGIN, SKILLS_SECTION_END } from "./paths.js";
import type { SkillRecord } from "./types.js";

export function formatSkillsSection(skills: SkillRecord[]): string {
  const bullets = skills.map(
    (skill) => `* [\`${skill.name}\`](./${skill.skillPath}) — ${skill.frontmatter.description}`
  );
  return [SKILLS_SECTION_BEGIN, ...bullets, SKILLS_SECTION_END].join("\n");
}

export function updateSkillsSection(readme: string, skills: SkillRecord[]): string {
  const section = formatSkillsSection(skills);
  const pattern = new RegExp(`${SKILLS_SECTION_BEGIN}[\\s\\S]*?${SKILLS_SECTION_END}`, "m");
  if (!pattern.test(readme)) {
    throw new Error("README.md missing <!-- skills:begin --> / <!-- skills:end --> markers");
  }
  return readme.replace(pattern, section);
}

export async function readReadme(): Promise<string> {
  return readFile(README_PATH, "utf-8");
}

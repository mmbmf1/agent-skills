import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import { computeHash } from "./hash.js";
import { KEBAB, SKILLS_DIR } from "./paths.js";
import type { Frontmatter, SkillRecord } from "./types.js";

export function parseFrontmatter(content: string, skillPath: string): Frontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${skillPath}: missing YAML frontmatter`);
  }

  const data = parseYaml(match[1]) as Record<string, unknown>;
  const name = data.name;
  const description = data.description;
  const globs = data.globs;

  if (typeof name !== "string" || !name) {
    throw new Error(`${skillPath}: frontmatter.name is required`);
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error(`${skillPath}: frontmatter.description is required`);
  }
  if (!Array.isArray(globs) || !globs.every((g) => typeof g === "string")) {
    throw new Error(`${skillPath}: frontmatter.globs must be an array of strings`);
  }

  return { name, description, globs };
}

export async function discoverSkills(): Promise<SkillRecord[]> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skills: SkillRecord[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    const dir = join(SKILLS_DIR, entry.name);
    const skillMdPath = join(dir, "SKILL.md");
    const skillPath = `skills/${entry.name}/SKILL.md`;
    const content = await readFile(skillMdPath, "utf-8");
    const frontmatter = parseFrontmatter(content, skillPath);

    if (frontmatter.name !== entry.name) {
      throw new Error(`${skillPath}: name "${frontmatter.name}" must match directory "${entry.name}"`);
    }
    if (!KEBAB.test(frontmatter.name)) {
      throw new Error(`${skillPath}: name must be kebab-case`);
    }

    skills.push({
      name: entry.name,
      dir,
      skillPath,
      frontmatter,
      hash: await computeHash(dir),
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

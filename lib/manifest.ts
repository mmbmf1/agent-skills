import { readFile } from "fs/promises";
import { MANIFEST_PATH } from "./paths.js";
import { serializeSortedJson } from "./serialize.js";
import type { ManifestFile, ManifestSkill, SkillRecord } from "./types.js";

export function buildManifest(skills: SkillRecord[]): ManifestFile {
  const manifestSkills: Record<string, ManifestSkill> = {};
  for (const skill of skills) {
    manifestSkills[skill.name] = {
      description: skill.frontmatter.description,
      skillPath: skill.skillPath,
    };
  }

  return { version: 1, skills: manifestSkills };
}

export function serializeManifest(manifest: ManifestFile): string {
  return serializeSortedJson(manifest, "skills");
}

export async function readManifestFile(): Promise<string | null> {
  try {
    return await readFile(MANIFEST_PATH, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

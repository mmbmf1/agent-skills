import { join } from "path";

export const ROOT = process.cwd();
export const SKILLS_DIR = join(ROOT, "skills");
export const LOCK_PATH = join(ROOT, "skills-lock.json");
export const MANIFEST_PATH = join(ROOT, "skills-manifest.json");
export const README_PATH = join(ROOT, "README.md");
export const TEMPLATE_PATH = join(ROOT, "scripts", "skill-template.md");
export const REPO_SOURCE = "mmbmf1/agent-skills";
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SKILLS_SECTION_BEGIN = "<!-- skills:begin -->";
export const SKILLS_SECTION_END = "<!-- skills:end -->";

import { createHash } from "crypto";
import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const SKILLS_DIR = join(ROOT, "skills");
const LOCK_PATH = join(ROOT, "skills-lock.json");
const MANIFEST_PATH = join(ROOT, "skills-manifest.json");
const TEMPLATE_PATH = join(ROOT, "scripts", "skill-template.md");
const REPO_SOURCE = "mmbmf1/agent-skills";
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Frontmatter = {
  name: string;
  description: string;
  globs: string[];
};

type LockEntry = {
  source: string;
  sourceType: string;
  skillPath: string;
  computedHash: string;
};

type LockFile = {
  version: number;
  skills: Record<string, LockEntry>;
};

type ManifestSkill = {
  description: string;
  skillPath: string;
};

type ManifestFile = {
  version: number;
  skills: Record<string, ManifestSkill>;
};

type SkillRecord = {
  name: string;
  dir: string;
  skillPath: string;
  frontmatter: Frontmatter;
  hash: string;
};

async function collectFiles(
  baseDir: string,
  currentDir: string,
  results: Array<{ relativePath: string; content: Buffer }>
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      await collectFiles(baseDir, fullPath, results);
      continue;
    }

    if (!entry.isFile()) continue;

    const content = await readFile(fullPath);
    const relativePath = relative(baseDir, fullPath).split("\\").join("/");
    results.push({ relativePath, content });
  }
}

async function computeHash(skillDir: string): Promise<string> {
  const files: Array<{ relativePath: string; content: Buffer }> = [];
  await collectFiles(skillDir, skillDir, files);
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.relativePath);
    hash.update(file.content);
  }

  return hash.digest("hex");
}

async function readLock(): Promise<LockFile> {
  const content = await readFile(LOCK_PATH, "utf-8");
  return JSON.parse(content) as LockFile;
}

async function writeLock(lock: LockFile): Promise<void> {
  const sortedSkills: Record<string, LockEntry> = {};
  for (const key of Object.keys(lock.skills).sort()) {
    sortedSkills[key] = lock.skills[key]!;
  }

  const body = JSON.stringify({ version: lock.version, skills: sortedSkills }, null, 2) + "\n";
  await writeFile(LOCK_PATH, body, "utf-8");
}

function parseFrontmatter(content: string, skillPath: string): Frontmatter {
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

async function discoverSkills(): Promise<SkillRecord[]> {
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

function repoLockEntries(lock: LockFile): Array<[string, LockEntry]> {
  return Object.entries(lock.skills).filter(([, entry]) => entry.skillPath.startsWith("skills/"));
}

function buildManifest(skills: SkillRecord[]): ManifestFile {
  const manifestSkills: Record<string, ManifestSkill> = {};
  for (const skill of skills) {
    manifestSkills[skill.name] = {
      description: skill.frontmatter.description,
      skillPath: skill.skillPath,
    };
  }

  return { version: 1, skills: manifestSkills };
}

function serializeManifest(manifest: ManifestFile): string {
  const sortedSkills: Record<string, ManifestSkill> = {};
  for (const key of Object.keys(manifest.skills).sort()) {
    sortedSkills[key] = manifest.skills[key]!;
  }

  return JSON.stringify({ version: manifest.version, skills: sortedSkills }, null, 2) + "\n";
}

async function readManifestFile(): Promise<string | null> {
  try {
    return await readFile(MANIFEST_PATH, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
  throw new Error(message);
}

async function validate(): Promise<void> {
  const skills = await discoverSkills();
  const lock = await readLock();
  const repoEntries = repoLockEntries(lock);
  const skillNames = new Set(skills.map((s) => s.name));

  for (const skill of skills) {
    const entry = lock.skills[skill.name];
    if (!entry) {
      fail(`skills-lock.json missing entry for "${skill.name}"`);
    }
    if (entry.computedHash !== skill.hash) {
      fail(`skills-lock.json hash mismatch for "${skill.name}" (run npm run sync)`);
    }
  }

  for (const [name] of repoEntries) {
    if (!skillNames.has(name)) {
      fail(`skills-lock.json entry "${name}" has no matching skills/${name}/ directory`);
    }
  }

  const expectedManifest = serializeManifest(buildManifest(skills));
  const actualManifest = await readManifestFile();
  if (actualManifest !== expectedManifest) {
    fail("skills-manifest.json is stale (run npm run sync)");
  }

  console.log(`ok: ${skills.length} skill(s)`);
}

async function sync(): Promise<void> {
  const skills = await discoverSkills();
  const lock = await readLock();

  for (const skill of skills) {
    const entry = lock.skills[skill.name];
    if (!entry) {
      fail(`skills-lock.json missing entry for "${skill.name}" (run npm run skills -- init ${skill.name})`);
    }
    entry.computedHash = skill.hash;
  }

  await writeLock(lock);
  await writeFile(MANIFEST_PATH, serializeManifest(buildManifest(skills)), "utf-8");
  console.log(`synced: ${skills.length} skill(s)`);
}

async function init(name: string): Promise<void> {
  if (!name) fail("usage: npm run skills -- init <skill-name>");
  if (!KEBAB.test(name)) fail(`"${name}" must be kebab-case`);

  const skillDir = join(SKILLS_DIR, name);
  const skillMdPath = join(skillDir, "SKILL.md");

  try {
    await readdir(skillDir);
    fail(`skills/${name}/ already exists`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const template = await readFile(TEMPLATE_PATH, "utf-8");
  const content = template.replaceAll("your-skill-name", name).replace("# Your Skill Name", `# ${name}`);
  await mkdir(skillDir, { recursive: true });
  await writeFile(skillMdPath, content, "utf-8");

  const hash = await computeHash(skillDir);
  const lock = await readLock();
  lock.skills[name] = {
    source: REPO_SOURCE,
    sourceType: "github",
    skillPath: `skills/${name}/SKILL.md`,
    computedHash: hash,
  };
  await writeLock(lock);

  console.log(`created: skills/${name}/SKILL.md`);
  console.log("next: edit SKILL.md → npm run sync → update README bullet");
}

const [command, arg] = process.argv.slice(2);

async function main(): Promise<void> {
  if (command === "validate") await validate();
  else if (command === "sync") await sync();
  else if (command === "init") await init(arg ?? "");
  else {
    console.error("usage: npm run skills -- <validate|sync|init [name]>");
    process.exit(1);
  }
}

main();

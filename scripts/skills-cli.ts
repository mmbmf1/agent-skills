import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { discoverSkills } from "../lib/discover.js";
import { computeHash } from "../lib/hash.js";
import { readLock, repoLockEntries, writeLock } from "../lib/lock.js";
import { buildManifest, readManifestFile, serializeManifest } from "../lib/manifest.js";
import { KEBAB, MANIFEST_PATH, README_PATH, REPO_SOURCE, SKILLS_DIR, TEMPLATE_PATH } from "../lib/paths.js";
import { readReadme, updateSkillsSection } from "../lib/readme.js";

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

  const readme = await readReadme();
  try {
    if (updateSkillsSection(readme, skills) !== readme) {
      fail("README.md Available Skills section is stale (run npm run sync)");
    }
  } catch (err) {
    fail((err as Error).message);
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
  const readme = await readReadme();
  await writeFile(README_PATH, updateSkillsSection(readme, skills), "utf-8");
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
  console.log("next: edit SKILL.md → npm run sync");
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

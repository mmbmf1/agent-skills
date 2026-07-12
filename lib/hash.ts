import { createHash } from "crypto";
import { readFile, readdir } from "fs/promises";
import { join, relative } from "path";

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

export async function computeHash(skillDir: string): Promise<string> {
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

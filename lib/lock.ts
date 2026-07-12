import { readFile, writeFile } from "fs/promises";
import { LOCK_PATH } from "./paths.js";
import { serializeSortedJson } from "./serialize.js";
import type { LockEntry, LockFile } from "./types.js";

export async function readLock(): Promise<LockFile> {
  const content = await readFile(LOCK_PATH, "utf-8");
  return JSON.parse(content) as LockFile;
}

export async function writeLock(lock: LockFile): Promise<void> {
  await writeFile(LOCK_PATH, serializeSortedJson(lock, "skills"), "utf-8");
}

export function repoLockEntries(lock: LockFile): Array<[string, LockEntry]> {
  return Object.entries(lock.skills).filter(([, entry]) => entry.skillPath.startsWith("skills/"));
}

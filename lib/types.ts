export type Frontmatter = {
  name: string;
  description: string;
  globs: string[];
};

export type LockEntry = {
  source: string;
  sourceType: string;
  skillPath: string;
  computedHash: string;
};

export type LockFile = {
  version: number;
  skills: Record<string, LockEntry>;
};

export type ManifestSkill = {
  description: string;
  skillPath: string;
};

export type ManifestFile = {
  version: number;
  skills: Record<string, ManifestSkill>;
};

export type SkillRecord = {
  name: string;
  dir: string;
  skillPath: string;
  frontmatter: Frontmatter;
  hash: string;
};

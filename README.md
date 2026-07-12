# agent-skills

A collection of AI agent skills for development workflows.

## Structure

Skills live under `skills/<skill-name>/SKILL.md`. The lock file at `skills-lock.json` tracks integrity hashes for repo-authored skills only. The generated `skills-manifest.json` is the machine-readable discovery index. CLI logic lives in `lib/`; `scripts/skills-cli.ts` is the thin command dispatcher.

Locally installed skills from `npx skills add` land in `.agents/skills/` and are gitignored — they are not part of this collection's lock or manifest.

## Authoring

```bash
npm run skills -- init my-skill   # scaffold from scripts/skill-template.md
# edit skills/my-skill/SKILL.md
npm run sync                      # refresh lock hashes, manifest, and README bullets
npm run validate                  # check frontmatter, naming, hashes, manifest, README
```

Commit `skills-lock.json`, `skills-manifest.json`, and `README.md` with your skill changes.

## Available Skills

<!-- skills:begin -->
* [`naming-conventions`](./skills/naming-conventions/SKILL.md) — Clear rules for casing, intent, and structure to keep the codebase clean and consistent.
<!-- skills:end -->

## Installation

```bash
npx skills add https://github.com/mmbmf1/agent-skills --skill naming-conventions
```

## Discover

This collection is listed on [skills.sh](https://www.skills.sh/mmbmf1/agent-skills).

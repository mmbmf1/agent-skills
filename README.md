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
* [`code-comments`](./skills/code-comments/SKILL.md) — Add, improve, audit, or remove code comments and structured docstrings using value-over-noise rules. Use when the user asks to comment code, document functions or modules, fix misleading or stale comments, reduce comment clutter, or review comment quality in a change or PR.
* [`housekeeping`](./skills/housekeeping/SKILL.md) — Sweep a file, a related set of files, or a small repo for dead code, tracked junk, docs drift, DX friction, and leftover scaffolding after partial removals. Use when the user asks if something needs housekeeping, cleanup, a tidy pass, or says "rm more" / "sweep the floor" after recent deletions.
* [`naming-conventions`](./skills/naming-conventions/SKILL.md) — Clear rules for casing, intent, and structure to keep the codebase clean and consistent.
<!-- skills:end -->

## Installation

Install one skill:

```bash
npx skills add https://github.com/mmbmf1/agent-skills --skill code-comments
npx skills add https://github.com/mmbmf1/agent-skills --skill housekeeping
npx skills add https://github.com/mmbmf1/agent-skills --skill naming-conventions
```

### code-comments

Guides the agent when adding, tightening, or removing comments: favor **why** and **constraints** over narrating the code, document public surfaces briefly, and drop stale or commented-out blocks. Full rules and workflow: [`skills/code-comments/SKILL.md`](./skills/code-comments/SKILL.md); before/after samples: [`skills/code-comments/examples.md`](./skills/code-comments/examples.md).

## Discover

This collection is listed on [skills.sh](https://www.skills.sh/mmbmf1/agent-skills).

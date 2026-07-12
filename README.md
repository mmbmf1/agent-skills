# agent-skills

A collection of AI agent skills for development workflows.

## Structure

Skills live under `skills/<skill-name>/SKILL.md`. The lock file at `skills-lock.json` tracks skill integrity hashes. The generated `skills-manifest.json` is the machine-readable discovery index.

## Authoring

```bash
npm run skills -- init my-skill   # scaffold from scripts/skill-template.md
# edit skills/my-skill/SKILL.md
npm run sync                      # refresh lock hashes + manifest
npm run validate                  # check frontmatter, naming, hashes, manifest
```

Commit `skills-lock.json` and `skills-manifest.json` with your skill changes. Update the Available Skills list below manually.

## Available Skills

* [`naming-conventions`](./skills/naming-conventions/SKILL.md) — guardrails for code readability and casing consistency.

## Installation

```bash
npx skills add https://github.com/mmbmf1/agent-skills --skill naming-conventions
```

## Discover

This collection is listed on [skills.sh](https://www.skills.sh/mmbmf1/agent-skills).

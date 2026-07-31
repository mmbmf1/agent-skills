---
name: housekeeping
description: Sweep a file, a related set of files, or a small repo for dead code, tracked junk, docs drift, DX friction, and leftover scaffolding after partial removals. Use when the user asks if something needs housekeeping, cleanup, a tidy pass, or says "rm more" / "sweep the floor" after recent deletions.
globs: ["**/*"]
---

# housekeeping

Not a redesign. Finish partial removals, drop junk in scope, and make docs/DX match reality.

## Scope

Default to what the user pointed at: one file, a related cluster (callers, styles, tests, configs, docs), or the whole project if they asked for a project tidy.

Stay inside that boundary unless leftovers clearly spill out — then widen only along the dependency trail, and say so.

## Workflow

Copy and track:

```
Housekeeping:
- [ ] Survey
- [ ] Tracked junk
- [ ] Dead leftovers
- [ ] Broken placeholders
- [ ] Edit residue
- [ ] Docs / DX drift
- [ ] Weight
- [ ] Verify
```

Skip steps that do not apply to the current scope (e.g. tracked junk / weight when tidying a single module).

### 1. Survey

Read-only first. Gather what matters for the scope:

- `git status` / recent `rm` / cleanup commits touching the target
- imports, exports, callers, tests, and sibling assets for the target files
- docs or scripts that still mention removed paths or workflows
- at repo scope: root tree vs README claims, `.gitignore` vs tracked junk, duplicate entrypoints

Report a short priority list before editing. Prefer finish-or-restore over half-removed features.

### 2. Tracked junk

When the sweep includes repo hygiene:

- Ensure OS junk, secrets, and local tool dirs are gitignored
- `git rm --cached` anything already tracked that should not be
- Delete local copies of ignored OS junk when safe

### 3. Dead leftovers (finish the removal)

After something is removed from the surface the user cares about, chase the full trail within and adjacent to scope:

- source modules and their imports/exports
- styles / markup / templates wired to those modules
- tests and fixtures
- data files, generators, and update scripts
- ignore / deploy / CI exclude lines
- README and troubleshooting sections that describe the removed path

Do not drop intentional cross-links to other projects unless the user asks.

### 4. Broken placeholders

Search in-scope files for unreplaced template tokens and dead paths, e.g.:

- stub URLs or path tokens left from a template
- empty `src=""`, broken relative imports, obvious `TODO` inject stubs

Fix to the real path or remove.

### 5. Edit residue

Partial edits often leave structural noise:

- large blank runs where content was deleted
- empty slots / leftover conditional branches / unused shared-partial hooks
- drift between a shared template and its generated copies

Prefer fixing the sync/verify path so the next run stays clean, then re-sync. Run existing verify scripts when the repo has them.

### 6. Docs / DX drift

When docs or scripts are in scope:

- Docs must match what still exists and how people actually run things
- Entry scripts should work from the place people type commands
- Remove docs for deleted workflows; keep only live commands

### 7. Weight

When large assets are in scope:

- Run the repo's optimize script if one exists
- Do not convert formats or rewrite URLs unless asked
- Report before/after size when meaningful

### 8. Verify

Run the project's smoke/verify/tests that cover the touched area. Fix failures caused by the sweep. Do not commit unless asked.

## Output style

- Lead with what was cleaned and what was left on purpose
- Keep the report short; link paths, not essays
- If something is ambiguous (keep vs delete), ask once with a default recommendation

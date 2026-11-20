---
name: clone-pattern
description: >-
  Replicates a reference file or folder for a new entity or feature, applies
  explicit name and path substitutions, and registers the result in routers,
  barrels, and app wiring. Use when the user says clone this pattern, same as,
  another one like, match how X is done, or points at a reference implementation
  and asks to scaffold something similar.
globs: ["**/*"]
---

# clone-pattern

Clone **structure and wiring**, not unrelated business logic. The new code should look like it always belonged in the destination tree.

## Golden rules

1. **Destination wins** for layout, file placement, and local naming habits; **reference wins** for behavioral shape (layers, error handling, auth, test layout).
2. **Wire, don't orphan:** New files must be reachable — routes, barrels, DI, plugin lists, story entries, or whatever this repo uses.
3. **Explicit map before edits:** State replacements (old → new) before writing files.
4. **Minimal diff:** No refactors, extractions, or drive-by fixes unless the user asked.
5. **Second sibling:** If this is another clone of the same reference, suggest shared extraction — do not duplicate a third copy blindly.

## Scope

Default to what the user named:

- **Reference:** file, folder, or feature slice to copy from
- **Destination:** directory or area where the new code lives
- **New identity:** entity name, route prefix, feature name, or skill name

Ask once if any of the three is missing, with a reasonable default from context (@-mentions, open files).

**Slice depth** — unless the user says otherwise, assume **full slice**: implementation files, types, tests, and registration points that peers at the destination use.

## Workflow

Copy and track:

```
Clone pattern:
- [ ] Anchor
- [ ] Analyze reference
- [ ] Scan destination
- [ ] Map replacements
- [ ] Scaffold files
- [ ] Wire registries
- [ ] Verify
```

### 0. Anchor

Confirm in one short block:

- Reference path(s)
- Destination path
- New entity / feature name
- Slice depth (file-only vs full slice)

### 1. Analyze reference

Read the reference completely. Extract:

- Architecture (layers, public surface, error/response shape)
- Local imports and dependency direction
- Naming and casing used in this slice
- Exported symbols and who consumes them (callers, routes, tests)

Classify:

- **Structural (keep):** file shape, middleware order, handler signature, test `describe` layout, validation pattern
- **Accidental (replace):** entity names, URLs, copy, domain types, fixture data
- **Reference-only quirk:** do not copy unless the user asked for parity

If the reference is an outlier compared to its siblings, say so and prefer peer convention at the destination.

### 2. Scan destination

Inspect the destination directory and **2–3 peer examples** (same kind of thing, already wired):

- Where tests live and how they are named
- Barrel / `index` patterns
- How routes, handlers, or modules get registered
- Config or feature flags peers touch

### 3. Map replacements

Build an explicit dictionary before editing. Include every category that applies:

| Kind | Example keys |
|------|----------------|
| Symbols | `OrdersService` → `UsersService` |
| Paths / files | `orders/` → `users/` |
| Routes / APIs | `/orders` → `/users` |
| Tests | file names, `describe` titles, fixture ids |
| Registry | router table rows, export lines, plugin manifest entries |
| Peripheral | OpenAPI tags, metrics, i18n keys, feature-flag names (not secret values) |

For casing, follow the project and [naming-conventions](../naming-conventions/SKILL.md) when available.

Show the map briefly to the user when substitutions are non-obvious.

### 4. Scaffold files

- Replicate reference **structure** at the destination using destination placement rules.
- Apply the mapping dictionary consistently (paths, imports, strings, types).
- Domain logic: only what the user specified or obvious placeholders (`// TODO` with ticket only if the team does that); do not invent business rules by find-replace from the reference.
- Do not copy secrets, real IDs, or env values.

### 5. Wire registries

Update every hook the peers use, for example:

- Route / router maps
- Barrel `index.ts` (or package exports)
- DI / provider registration
- Storybook, CLI command lists, workflow configs
- Docs that list modules by name (only if peers update those too)

**Files alone are incomplete** until registration is done.

### 6. Verify

Run the narrowest project checks that cover the new surface:

- Typecheck / build for touched packages
- Lint on new paths
- Targeted tests (new test file or peer test pattern)

Fix broken imports and missing types caused by the clone. Do not commit unless asked.

If the repo has no scripts, at least trace imports from registration entrypoints to the new symbols.

## Output style

- Lead with the **mapping summary** (entity, paths, registry files touched).
- List **created / modified** paths; keep the report short.
- Call out **deferred** wiring if something was ambiguous — ask once with a default.
- After a multi-file slice, a quick **housekeeping** pass on the touched cluster is fine (duplicate imports, stale strings); see [housekeeping](../housekeeping/SKILL.md).

## Do not

- Copy licensed or third-party blobs verbatim when substitution is required.
- Expand scope (new abstractions, “while we’re here” cleanup) without being asked.
- Leave the reference’s old entity names in comments that describe the **new** domain unless they are generic examples.

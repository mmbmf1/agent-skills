---
name: code-comments
description: >-
  Add, improve, audit, or remove code comments and structured docstrings using
  value-over-noise rules. Use when the user asks to comment code, document
  functions or modules, fix misleading or stale comments, reduce comment clutter,
  or review comment quality in a change or PR.
globs: ["**/*"]
---

# code-comments

Comments carry **why**, **constraints**, and **contracts** — not a narration of what the code already says.

## Golden rule

**Consistency wins:** Match the file and project’s existing comment style (line vs block, docstring format, language idioms). If the repo has a documented standard, follow that over the defaults below.

## When to comment

- Business rules that are not obvious from names alone
- Invariants, preconditions, and postconditions the type system cannot express
- Security, privacy, or compliance constraints
- Performance or resource tradeoffs (and why the cheaper path was rejected)
- Workarounds for bugs, platform quirks, or version-specific behavior — include an issue/ticket link when the project uses them
- Public API contracts: parameters, return semantics, errors, side effects, and threading/async expectations when callers cannot infer them from signatures alone
- Non-local effects: global state, caches, I/O, retries, idempotency

## When not to comment

- Restating the code (`// increment i`)
- Obvious control flow, loops, or null checks
- Changelog or authorship history (use version control)
- Commented-out code — delete it; history lives in git
- “TODO” without owner or ticket when the team expects trackable work
- Apologies or jokes that do not help the next reader

## Prefer code over comments

Before adding a comment, consider:

1. Rename or extract so intent is clear
2. Replace magic values with named constants
3. Split a large unit so each piece explains itself
4. Use types, enums, or assertions where the language supports them

If the comment only exists because the code is confusing, fix the code when that is in scope.

## Structured documentation (public surface)

Use the language’s normal doc form (docblock, docstring, module header) for symbols **other modules or callers depend on** — exported functions, public methods, library entrypoints, HTTP handlers, CLI commands.

Keep it short:

- One-line summary of purpose
- Non-obvious inputs, outputs, errors, and side effects
- Thread-safety, async, or re-entrancy only when it matters

Skip docstrings on trivial getters, obvious constructors, and private helpers unless behavior is surprising.

## Workflow

Copy and track:

```
Comments:
- [ ] Scope
- [ ] Read callers and contracts
- [ ] Apply when / when-not rules
- [ ] Doc public surface only where needed
- [ ] Sync or remove stale comments
- [ ] Verify (build, docs, or tests if the project has them)
```

### 1. Scope

Default to what the user pointed at: one symbol, a file, or the diff. Do not re-comment entire trees unless asked.

### 2. Read callers and contracts

Skim imports, tests, and API docs so comments describe real behavior, not intent that drifted.

### 3. Authoring

- Place the comment on the **smallest unit** that needs the explanation (block, function, or constant).
- Lead with the constraint or decision, not a line-by-line walkthrough.
- Use complete sentences for block and doc comments; fragments are fine for very short line comments.
- Keep line comments at the same indent level as the code they describe.

### 4. Audit and cleanup

- **Remove** comments that duplicate code or describe deleted behavior.
- **Tighten** verbose comments to one or two sentences.
- **Fix** comments that contradict the implementation — wrong comments are worse than none.
- Flag commented-out blocks for removal unless the user explicitly wants them kept with a documented reason.

### 5. Verify

Run the project’s doc generator, typecheck, or tests that cover documented APIs when they exist. Do not commit unless asked.

## Output style

- **Authoring:** minimal diff; no drive-by reformatting unrelated code.
- **Audit:** short list — keep / improve / remove — with paths (and symbols when helpful).
- If keep vs delete is ambiguous, ask once with a default recommendation.

## Examples

Before/after pairs and sample audit output: [examples.md](examples.md).

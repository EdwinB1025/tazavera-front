Type: Refactor (fast lane)

# Proposal

## Why

The code-structure rules added to AGENTS.md on 2026-10-08 (import sibling files directly inside a segment, no import between slices of the same layer, a component or function of at most 80 lines, a file of at most 300 lines, a cyclomatic complexity of at most 15) are checked only by review (backlog R39). Shipping them as lint warnings gives the refactors R21–R38 and every new change a mechanical check, with ESLint 9 built-in rules and no new dependency.

## What Changes

- `eslint.config.mjs` adds the built-in rules `max-lines`, `max-lines-per-function` and `complexity` for production code, and `no-restricted-imports` entries per layer and per segment for the import rules.
- Every new rule is at `"warn"`: the current code breaks them until the refactors land, so `npm run lint` keeps exiting with zero errors.
- The existing `react/jsx-no-literals` entry and the `globalIgnores` stay as they are.
- No code is changed to silence a warning.
- No behaviour change: what users see, the requests sent to the API and every requirement in `openspec/specs/` stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the observable property that the lint run reports, as warnings, the code-structure rule breaks. No existing requirement changes.

## Impact

- Files: `eslint.config.mjs`.
- Dependencies: none added, removed or upgraded; ESLint stays on v9.
- Protecting checks: the validation and QA suites, typecheck, lint (zero errors) and `npm run build`.

## Non-goals

- Fixing any warning the new rules report (that is R21–R38).
- Raising any rule to `"error"`.
- Adding a plugin (for example an FSD or boundaries plugin), a script or a guard test.
- Checking the import direction between layers (a lower layer importing a higher one); only the two rules named in R39 are shipped.

## Propose status

- Change-id: `add-code-structure-lint-rules`
- Date: 2026-10-08
- `openspec validate add-code-structure-lint-rules --strict`: valid
- Resolves backlog entry: R39 (Ship the code-structure rules as ESLint warnings)
- Resolved: globs and options of each rule in `design.md` (D1–D4): size and complexity rules over the production code only, counting non-blank, non-comment lines, with the generated `src/shared/api/schema.ts` excluded; the cross-slice import rule over every sliced layer (`pages`, `widgets`, `features`, `entities`); the own-index rule over every segment with a public index (`src/shared/ui`, `src/shared/api`, each `src/shared/lib/<name>` folder, `src/app/shell`) plus relative imports of a folder's own index everywhere under `src/`; test files excluded from the import rules because they import the slice or segment under test through its public API.
- Open: none.

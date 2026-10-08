Type: Refactor (fast lane)

# Proposal

## Why

Every locale route ships about 220 KB of gzipped JavaScript on first load, and cmdk with the Radix primitives that only some screens use (Popover, AlertDialog, Tabs, Slider, ToggleGroup, RadioGroup) load on all of them (backlog R28; Performance grade C of the technical review). The cause, measured in design.md: the bundler cannot tell that the project's own modules are free of side effects, so a named import from the `src/shared/ui` entry point keeps every module that entry point re-exports, Combobox and its cmdk import included.

## What Changes

- `package.json` declares `"sideEffects": ["*.css"]`: only the project's stylesheets have import side effects, so the bundler keeps just the re-exports a module actually uses. The two side-effect imports of the project (`app/layout.tsx` imports `globals.css`, `src/shared/lib/leaflet` imports `leaflet.css`) are both stylesheets and stay.
- Imports, the `src/shared/ui` entry point, `next.config.ts` and every component stay as they are.
- No behaviour a user sees changes, and the requests sent to the API stay the same. No dependency is added, removed or upgraded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the requirement that a route loads only the client code of the shared controls it renders. No existing requirement changes.

## Impact

- Files: `package.json` (the `sideEffects` field only).
- Dependencies: none.
- Protecting checks: the validation and QA suites, typecheck, lint, `npm run build` and the First Load JS measurement of design.md.

## Non-goals

- Splitting `src/shared/ui` into more segments or importing its modules by path.
- Lazy-loading controls a route does render (the header's Radix DropdownMenu and the sidebar's Dialog stay on every locale route).
- Reducing the framework and React runtime shared by all routes.

## Propose status

- Change-id: `reduce-shared-client-bundle`
- Date: 2026-10-08
- `openspec validate reduce-shared-client-bundle --strict`: valid
- Resolves backlog entry: R28 (Reduce the shared client bundle).
- Resolved: the mechanism is the `sideEffects` field of `package.json` (design.md D1). The two options the session prompt preferred were measured or checked first and do not apply: importing heavy components by module path breaks the FSD rule that `shared` is imported by segment (`@/shared/ui`), and `experimental.optimizePackageImports: ["@/shared/ui"]` left every route unchanged (it only handles package names). Before/after First Load JS per route is in design.md.
- Open: the mechanism is a field in `package.json`, which the backlog entry's "Where today" does not name; Product owner confirms it on review.

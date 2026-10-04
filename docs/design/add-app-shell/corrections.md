# Corrections — add-app-shell

Product Owner rulings recorded after apply (2026-10-04). Each entry supersedes the referenced part of design.md and tasks.md; the artifacts are updated to match.

## C1 — Literal-text lint configuration (supersedes D10, task 6.1)
- `react/jsx-no-literals`: `{ noStrings: true, ignoreProps: true, allowedStrings: ["*"] }`, scoped to `app/**`, `src/**`, `*.ts`, tests excluded.
- No `elementOverrides`: it crashed the plugin and re-enabled the props check.
- The brand wordmark renders from the `WORDMARK` constant in `Logo.tsx`.
- `*` is allowed for the required-field marker in `Field.tsx`.

## C2 — Unsupported locale (supersedes D2 and the "Unsupported locale" scenario)
- A path whose first segment is not a supported locale is redirected to the default locale (`/fr/about` → `/es/fr/about`), which resolves to not-found. No screen renders in an unsupported locale.

## C3 — File inventory (supersedes D13)
- Add `src/app/shell/ShellChrome.tsx` (client boundary of the shell chrome) and the test files present but not listed: `proxy.test.ts`, `src/pages/home/ui/HomeScreen.test.tsx`, `src/widgets/app-header/ui/ThemeSelect.test.tsx`, `src/shared/lib/i18n/messages.test.ts`, `src/shared/lib/i18n/catalog-guard.test.ts`.
- `next.config.ts` with the `next-intl` plugin.

## C4 — Unplanned fixes
- The Logo link in its `icon` form has an accessible name via an `aria-label` from the `shell` catalog.
- The sidebar collapse control's `toggleLabel` is required, with its text in the `shell` catalog (es, en, ca).
- User menu internal entries (`/[locale]/account/*`, `/[locale]/manage/*`) use the internal `Link` treatment, so navigation does not reload the page and wipe the in-memory tokens; only the API's `/user/security` stays a native anchor.
- Five profile entries in the user menu; "Session unresolvable" represented as `{ state: "anonymous" }` (D4 unchanged).

### Status

2026-10-04. `openspec validate add-app-shell --strict`: `Change 'add-app-shell' is valid`. The document is processed as review round 1.

1. **C1 — literal-text lint configuration.** design.md updated: D10 states the ruled configuration (`noStrings: true`, `ignoreProps: true`, `allowedStrings: ["*"]` over `app/**`, `src/**` and `*.ts`, tests excluded, no `elementOverrides`, wordmark from the `WORDMARK` constant of `Logo.tsx`) and D7's carve-out sentence replaced; task 6.1 rewritten to the same configuration and verification. `specs/app-shell/spec.md` unchanged: the "Literal interface text detected" outcome is preserved — the wordmark passes as a constant rather than as an allowed literal, and `*` is a glyph rather than an interface text. Task 10.1 created (verification of the configuration and both directions of `npm run lint`).
2. **C2 — unsupported locale.** `specs/app-shell/spec.md` scenario "Unsupported locale" and design.md D2 updated to the redirect of the same path under the default locale, resolving to not-found. Task 11.1 created (test-first `proxy.test.ts` cases, then verification).
3. **C3 — file inventory.** design.md D13 updated with `src/app/shell/ShellChrome.tsx`, `proxy.test.ts`, `src/pages/home/ui/HomeScreen.test.tsx`, `src/widgets/app-header/ui/ThemeSelect.test.tsx`, `src/shared/lib/i18n/messages.test.ts` and `src/shared/lib/i18n/catalog-guard.test.ts`, and with `next.config.ts` under Modified (registers the `next-intl` plugin). Task 12.1 created.
4. **C4 — unplanned fixes.** No tasks. Items 1 and 2 are applied (commits `447dcec` and `6501381`); design.md D7, D10 and D13 and task 6.2's catalog list now state the `brandLink` and `toggleSidebar` keys and the required `toggleLabel`. Item 3 is an unplanned fix still outstanding for the build — the user menu's internal entries (`/[locale]/account/*`, `/[locale]/manage/*`) use the internal `Link` treatment, behaviour already stated in design.md D5 and task 7.1 and now explicit in D5. Item 4 records the as-built state (five profile entries; unresolvable session as `{ state: "anonymous" }`, D4 unchanged), now explicit in design.md D5.

Differences against `design-summary.md` (its §3 "carve-out" wording and Propose-status item 7) are resolved by precedence: this round supersedes them.
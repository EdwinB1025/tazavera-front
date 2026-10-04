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
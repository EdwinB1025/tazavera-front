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

### Status

2026-10-04, second entry for the same round. `openspec validate add-app-shell --strict`: `Change 'add-app-shell' is valid`.

- **C4, item 3 — no longer outstanding.** Applied while the round was being processed: the build's unplanned fix `ebc5c4d` renders the user menu's internal entries (`/[locale]/account/*`, `/[locale]/manage/*`) with the internal `Link` treatment and keeps the API's `/user/security` as a native anchor, verified by `AppHeader.test.tsx`. No artifact changes and no tasks: design.md D5 already states this end state. Nothing of C4 remains for the build.
- **Handed to the product owner, not processed here.** `ebc5c4d` also widened `Link` with the anchor-surface passthrough and hands the architect the matching widening of the `LinkProps` block in `add-base-control`'s design.md D7 (`openspec/changes/archive/2026-10-02-add-base-control/design.md`), which is outside this change's commit scope. The product owner routes it through corrections.md before `/opsx:verify`.
- C1, C2 and C3 are unchanged from the entry above.

## Round 2

Build handoff of `ebc5c4d`, routed here by the product owner (2026-10-04) because it lands outside `add-app-shell`'s commit scope.

1. **Link anchor-surface passthrough (`add-base-control` design).** Widen the `LinkProps` block of `openspec/changes/archive/2026-10-02-add-base-control/design.md` — the types section and D7 — with the anchor-surface passthrough, so `/opsx:verify` does not flag `src/shared/ui/Link.tsx` as a deviation. Expected end state: `Link` takes the rest of the `next/link` anchor surface (`className`, `aria-*`, events, `ref`) and passes it through to the element, exactly as `ButtonProps` does for the native button surface — `{...rest}` is spread before the component's own props and the caller's `className` is joined after the treatment classes, so `href` and the treatment can never be overridden — and a composing parent such as a menu entry (`DropdownMenuItem asChild`) merges its role, handlers and classes in through it. No specified behaviour changes: `base-controls` "Link navigation" and "Link states and back variant" hold as written.

## Round 3

1. Header layout: logo and primary navigation on the left; language selector and "Sign in" or the avatar grouped on the right, on every viewport.

### Status

2026-10-04. `openspec validate add-app-shell --strict`: `Change 'add-app-shell' is valid`.

1. **Link anchor-surface passthrough.** Artifacts updated: `openspec/changes/archive/2026-10-02-add-base-control/design.md` — types section (`LinkProps` widened with `Omit<ComponentProps<typeof NextLink>, "href" | "children">` and its precedence comment) and D7 (composing parents merge through the passthrough) — applied and committed by the product owner (`144093d`), the archived change lying outside the architect's edit scope. No specified behaviour change: `openspec/specs/base-controls/spec.md` is untouched. Task 13.1 created (test-first `src/shared/ui/Link.test.tsx` passthrough cases, then verification).

### Status

2026-10-04. `openspec validate add-app-shell --strict`: `Change 'add-app-shell' is valid`. The document is processed as review round 3.

1. **Header layout groups.** Classified as a change to specified behaviour: the two-group layout was stated in no spec or design artifact. Artifacts updated: `specs/app-shell/spec.md` — requirement "Header brand and primary navigation" now states the grouping (logotype and primary navigation on the left, language selector and session control on the right, on every viewport) and carries the new scenario "Header grouping on every viewport"; `design.md` — decision **D14** added (the two groups, the grouping never gated by a breakpoint with D11's `md` switch unchanged, right group after the left group in DOM order). Task 14.1 created (test-first verification and alignment of `src/widgets/app-header/ui/AppHeader.test.tsx` and `AppHeader.tsx` against D14). The implementation and its cases landed before this round was processed, as unplanned fix `90befb3`, whose handoff this processing fulfils.

Notes on this entry: the round's report commit (`docs(app-shell): report review round 3 for add-app-shell`) was made by the architect on the product owner's instruction of 2026-10-04 to commit at the end himself. The section heading `## Roud 3` and the placement of round 2's `### Status` below it are left exactly as written: the architect never edits corrections, only appends. C1 to C4 and rounds 1 and 2 are unchanged.

## Round 4

Product Owner rulings on the `/opsx:verify` report of 2026-10-04, recorded by the architect on the product owner's instruction.

1. **Content-Security-Policy scope (verify W2 — Path B, change to specified behaviour).** The "Content-Security-Policy" requirement and its scenario cover **document responses**; static assets under `/_next/*` and file paths are intentionally excluded from the policy, and `/callback` gets its policy from `add-auth`, which owns that route (D2).
2. **User menu security entry (verify S1).** Add the external security entry to the "Menu content" requirement and scenario: the user menu offers the security entry as an external link to the API's security page (`{NEXT_PUBLIC_API_URL}/user/security`), rendered natively (D5).
3. **Deferred to `docs/backlog.md` (verify W1, S2, S3).** W1 — end-to-end test of "Choosing a locale" — is deferred to the backlog. S2 — the `/callback` matcher also excluding paths that merely start with `callback` — and S3 — no automated coverage of the `/callback` exclusion and the `connect-src` fallback — go to the backlog as well.
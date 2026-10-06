# Backlog — refactor candidates

Augusto adds entries; agents read the file. The architect checks it before /opsx:explore or /opsx:propose and flags any entry the change would affect, and removes the whole section of an entry only when archiving the change that resolves it.

One section per candidate, in this format:

## R<n> — <title>

- **Duplicated:** <code, classes or helpers that are repeated>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Augusto):** <options, or "none">
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>

## R1 — End-to-end test of "Choosing a locale" (verify W1, deferred here by the product owner)

- **Duplicated:** none
- **Where today:** `src/app/shell/ShellChrome.tsx:35-39` (the locale swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op)
- **Why it pays off now:** the shell's one navigation interaction is verified only up to the callback; every later change that switches locale rides on it
- **Owning capability:** app-shell
- **Proposed change:** none yet — belongs to the pre-deployment Playwright suite
- **Open decision (Augusto):** none
- **Status:** deferred
- **Affects:** none

## R2 — Tighten the `/callback` matcher exclusion (verify S2)

- **Duplicated:** none
- **Where today:** `proxy.ts:97` (`matcher: ["/((?!callback).*)"]`)
- **Why it pays off now:** the lookahead excludes any path merely starting with `callback` (e.g. `/callbackfoo` skips the default-locale redirect and 404s in place); `add-auth` lands `/callback` next and the matcher is the seam
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** tighten to `callback(?:/|$)` or accept the over-exclusion
- **Status:** proposed
- **Affects:** `add-auth`

## R3 — Cover the `/callback` exclusion and the `connect-src` fallback (verify S3)

- **Duplicated:** none
- **Where today:** `proxy.test.ts` (no case for the matcher exclusion or the unset-`NEXT_PUBLIC_API_URL` fallback), `proxy.ts:41-58`
- **Why it pays off now:** two ruled edge cases rest on review only; `add-auth` touches the same proxy seam for `/callback`
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** `add-auth`
## R4 — Align the shared menu panel radius with `base-controls` (refine-app-header, Q4)

- **Duplicated:** two radius choices for the same menu panel: the shared `DropdownMenu` card panel uses `rounded-container` (16px); the nav variant added by `refine-app-header` uses `radius-field` (8px), which is what `base-controls` states for menus
- **Where today:** `src/shared/ui/DropdownMenu.tsx` (card class set, `rounded-container`; nav class set, field radius)
- **Why it pays off now:** every new menu built on the card variant inherits the mismatch with `base-controls`
- **Owning capability:** base-controls
- **Proposed change:** none yet
- **Open decision (Augusto):** move the card panel to `radius-field`, or amend `base-controls` to allow `radius-container` for card menus
- **Status:** proposed
- **Affects:** none

## R6 — Expose the badge geometry from `Badge` (add-evaluation-scales, Open 3)

- **Duplicated:** the badge layout classes (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`), which the unselected descriptor chip would copy outside `Badge`
- **Where today:** `src/shared/ui/Badge.tsx` (R5 is reserved by the uncommitted entry in the `add-auth` worktree)
- **Why it pays off now:** `add-evaluation-scales` (`DescriptorChipGroup`) needs the geometry without a `Badge`; catalog and filter chips would add more copies
- **Owning capability:** feedback
- **Proposed change:** `refactor-badge-geometry`
- **Open decision (Augusto):** none (Product owner chose the refactor first, 2026-10-06)
- **Status:** accepted
- **Affects:** `add-evaluation-scales`, `add-specialist-evaluations`

## R7 — Move the taxonomy read and the pagination out of the offering-list widget (add-specialist-evaluations, Open 13)

- **Duplicated:** `fetchTaxonomies`, `buildTaxonomyLookup` and `OfferingPagination` (route hard-wired to `/{locale}?page=`), which other slices cannot import without breaking FSD and would copy
- **Where today:** `src/widgets/offering-list/api/offerings.ts`, `src/widgets/offering-list/lib/resolve-taxonomies.ts`, `src/widgets/offering-list/ui/OfferingPagination.tsx`
- **Why it pays off now:** evaluations, catalog, filters and offering management all need taxonomies or pagination
- **Owning capability:** content-structure
- **Proposed change:** `extract-offering-list-parts`
- **Open decision (Augusto):** none (Product owner chose the refactor first, 2026-10-06)
- **Status:** accepted
- **Affects:** `add-specialist-evaluations`, `add-offering-catalog`, `add-filter-controls`, `add-offering-management`

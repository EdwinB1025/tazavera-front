# Design

## Context

See `proposal.md` — Why. Current state: `src/shared/ui/Button.tsx` maps six variants to semantic token families (`VARIANT_REST` / `VARIANT_HOVER`); `nav-button` is the only variant with a border today (`border` plus `border-nav-button-border`). `src/app/styles/globals.css` holds the primitives and semantic tokens in a traditional `@theme` block and a `[data-theme="dark"]` reassignment block, and `src/app/styles/theme-tokens.test.ts` parses it into two contrast matrices (`kind: "bound"` at 3:1, `kind: "text"` at 4.5:1, an `exempt` flag) plus completeness blocks (avatar boundary, logotype, theme, radius). The evidence for every contrast choice is `docs/design/fix-button-boundaries/design-summary.md` §4 (the design lead's executed scripts, 2026-10-06); its ratios settle the token choices and are not re-derived here. Settled inputs and precedents (the theming "UI boundary and focus contrast" clause, the `nav-button` label-colour border, the `nav-avatar-border` transparent token) are listed in §0 of that summary.

This change consumes no API: no endpoint is called, no generated type in `src/shared/api/schema.ts` is used or touched, and no derived or UI-specific type is defined. No API error can occur, so no error presentation applies. No route or screen file is involved.

## Goals / Non-Goals

**Goals:**
- Every action treatment (`primary`, `action-1` to `action-4`) is identifiable against each host surface (`surface-page`, `surface-card`, `surface-section`, `surface-form`) in both themes, at rest and on hover: either its fill measures at least 3:1 against the surface, or its border does (theming spec, "UI boundary and focus contrast").
- The label keeps at least 4.5:1 against its fill in both states; no existing token value, size, radius, typography or interaction behaviour changes.

**Non-Goals:**
- `nav-button` and the avatar boundary: their pairs are registered and pass today.
- Label contrast rework, new fill primitives, derived primitives and hover border tokens (summary §4: an existing primitive passes everywhere, so the derivation procedure is never reached).
- Catalog text and contract operations.

## Decisions

### D1. The boundary is a 1px border per variant, coloured by one new semantic token

Each of the five action treatments gains `border` (1px, as `nav-button`) on all four sides, coloured `border-action-<v>-border` through one new semantic token per variant. Open 1 is settled as a): 1px, matching the only bordered button; every chosen border reaches at least 4.77 (summary §4.4), well above the 3:1 that SC 1.4.11 asks of a 1px boundary. The border is drawn inside the fixed box (Tailwind preflight's `border-box`; **unverified** in this repo's built CSS), so heights stay 40px and 32px and the width grows by 2px (explore A2); the mock-up shows this (Open Questions). Padding (16px / 12px horizontal), gap and radius are unchanged.

*Alternatives considered.* **A darker or lighter fill** (the boundary-mechanism question the design lead closed with the border): rejected — no single oxblood fill passes both the boundary gate and the label gate for dark `primary` (summary §0 F1), the positional fills are the MVC's tinted look and are kept, and no existing token value may change. **A dark label token** (the other fix F1 allows): rejected — label contrast is out of scope and every label passes today. **A 2px border** (option b, as the input and select boxes): rejected by the settlement of Open 1; 1px already clears the gate by a wide margin.

### D2. Token assignments: existing primitives only, and the transparent traditional `primary` border is exempt under the fill gate

One semantic token per variant, defined in both theme blocks and pointing at an existing primitive (never at another semantic token), taking the passing candidate with the highest minimum ratio (summary §4.4, the contract):

| Semantic token | Traditional | Dark | Lowest ratio (traditional / dark) |
|---|---|---|---|
| `--color-action-primary-border` | `transparent` | `var(--color-night-cream-100)` | — / 5.38 |
| `--color-action-1-border` | `var(--color-moss-700)` | `var(--color-night-moss-200)` | 4.89 / 5.14 |
| `--color-action-2-border` | `var(--color-brown-900)` | `var(--color-night-oxblood-200)` | 6.02 / 5.40 |
| `--color-action-3-border` | `var(--color-sage-800)` | `var(--color-night-sage-100)` | 4.77 / 5.40 |
| `--color-action-4-border` | `var(--color-petrol-900)` | `var(--color-night-petrol-100)` | 7.87 / 5.17 |

`action-primary-border` is `transparent` in the traditional theme (the `nav-avatar-border` precedent): there the `primary` fill already identifies the button at rest (6.11–7.27) and on hover (10.40–12.38), so the transparent border is covered by the theming exemption for "borders whose component fill already identifies the component at 3:1 or more" and no theming delta is needed. The registered `action-primary` / `S` and `action-primary-hover` / `S` fill pairs double as that exemption gate (the `nav-avatar` gate pattern); design.md states this so the exemption is never asserted without its gate.

*Alternatives considered.* Deriving a new primitive per failing theme: not reached — the procedure's step 3 is only entered when no existing token passes, and one passes everywhere (summary §4.3). A `-border-hover` token family: not needed (D3).

### D3. Hover keeps the rest border token

No `enabled:hover:border-*` class is added and no hover token is created. Traditional: the hover fill identifies the button at 5.32 or more, so the border is exempt on hover (theming clause). Dark: the same border passes against the hover fill (3.07–5.40) and every surface (summary §4.2, §4.3). On hover the rest border may sit on a nearly same-colour fill (1.00–1.91 against it); that is allowed because the fill, not the border, identifies the button there.

### D4. Class contract: border classes in the rest set only

Added to the rest classes of each variant (the contract; hover classes unchanged):

| Variant | Added to the rest classes |
|---|---|
| `primary` | `border border-action-primary-border` |
| `action-1` | `border border-action-1-border` |
| `action-2` | `border border-action-2-border` |
| `action-3` | `border border-action-3-border` |
| `action-4` | `border border-action-4-border` |
| `nav-button` | none (unchanged) |

### D5. Completeness coverage: an explicit both-themes test for `action-primary-border`

`--color-action-primary-border` is `transparent` in the traditional `@theme`, so its value falls outside the shared relational completeness filter (`var()` / `color-mix()` values only) — the same gap the avatar boundary token has. Its presence in both theme blocks is asserted by an explicit "defined in both themes" test mirroring the avatar block of `theme-tokens.test.ts` (two cases, traditional and dark). The shared completeness filter is not changed. The other four tokens are `var(...)` values and are covered by the existing "every traditional semantic token defined in dark" test.

### D6. Verification shape: registered pairs in both matrices, class assertions in the component test

- `theme-tokens.test.ts` registers the guard pairs in both matrices, all `kind: "bound"`, exactly as enumerated in `tasks.md` (traditional 8 + 2 exempt + 20 + 16 = 46 entries; dark 5 × 6 = 30 entries). Traditional registers the fill pairs as the D2 exemption gate, the two exempt `action-primary-border` pairs, each `action-<v>-border` against `S` and the rest fill, and each `action-<v>-bg-hover` against `S` (the hover fill identifies the button, so the border against the hover fill is not registered there). Dark registers only border pairs (no fill passes there): each border token against `S`, the rest fill and the hover fill. Nothing else: labels are already registered, disabled is exempt, focus is covered by the `focus-ring` pairs.
- `Button.test.tsx` asserts, for each of `primary` and `action-1` to `action-4`, that the split class tokens include `border` and `border-action-<v>-border` exactly, and that no `hover:border-` token is present; `nav-button` keeps exactly its current border classes (`border`, `border-nav-button-border`, `enabled:hover:border-nav-button-border-hover`).
- `color-guard.test.ts` needs no edit: the new `border-action-*` utilities must resolve to `--color-*` tokens, which the guard already enforces.

**Must keep passing** (derived from the files that render `Button` directly or through `Sidebar`, `AppHeader` and the explore buttons, plus the style guards):

- `src/shared/ui/Button.test.tsx` — every case. Its treatment cases use `toContain` on the class string, so added border classes do not break them.
- Direct renderers: `src/shared/ui/index.test.tsx`, `src/shared/ui/Sidebar.test.tsx`, `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/widgets/offering-list/ui/OfferingPagination.test.tsx`, `src/widgets/offering-list/ui/OfferingList.test.tsx` (through the retry button), `src/pages/home/ui/ExploreButton.test.tsx`, `src/pages/about/ui/ExploreButton.test.tsx`.
- Transitive renderers: `src/app/shell/AppShell.test.tsx`, `src/widgets/app-sidebar/ui/AppSidebar.test.tsx`, `src/pages/home/ui/HomeScreen.test.tsx`, `src/pages/home/ui/HomeHero.test.tsx`, `src/pages/about/ui/AboutContent.test.tsx`.
- Style guards: `src/app/styles/theme-tokens.test.ts` (both matrices, completeness), `src/shared/ui/color-guard.test.ts`, `src/shared/ui/radius-guard.test.ts`, `src/shared/ui/focus-guard.test.ts`.

### Files created or modified

| Path | FSD layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | `app` | modified — five semantic border tokens per theme block (D2); no existing token touched |
| `src/shared/ui/Button.tsx` | `shared` | modified — rest classes of the five action variants (D4) |
| `src/shared/ui/Button.test.tsx` | `shared` | modified — border class assertions (D6) |
| `src/app/styles/theme-tokens.test.ts` | `app` | modified — guard pairs in both matrices (D6) and the `--color-action-primary-border` completeness block (D5) |

No Next.js route file and no file under the root `app/` or `pages/` is involved. No type is defined or redefined; `src/shared/api/schema.ts` is untouched.

## Risks / Trade-offs

- [Textual conflict with `add-evaluation-scales` in `globals.css` and `theme-tokens.test.ts`, which appends tokens and pairs in the same blocks] → the resolution keeps both sides (summary §9); the conflict is expected whichever change merges second and needs no simulation.
- [The repo's built CSS is not verified to set `box-sizing: border-box`, so the border might be drawn outside the fixed heights] → the design lead's mock-up (Open Questions) uses its own copy of the stylesheet, and every rendered `Button` on the live landing computes `box-sizing: border-box` at 40px high (design lead, 2026-10-06); the fixed 40px / 32px heights and unchanged padding stand either way (explore A2).
- [The transparent traditional `primary` border makes the button 2px wider and, at the fixed height, its content area 2px shorter, although no edge is drawn] → accepted consciously, identical to the `nav-avatar-border` precedent; the mock-up shows it (explore A2).

## Open Questions

None. **Visual reference (former Open 2), resolved 2026-10-06.** The design lead rendered the mock-up of the five variants on `surface-page` and `surface-card`, at rest and on hover, in both themes, built from the D2 tokens (`docs/design/fix-button-boundaries/mockup/buttons-mockup.html`). Product owner reviewed it and approves every border as rendered, including the border merging with the fill on the traditional hover of `action-1` and `action-3`, the dark-theme borders lighter than the label at rest, and the cream border on dark `primary`. Nothing blocks the apply on the visual side, and the resolution changes no spec, decision or task.

## Design lead report — R64 — spacing analysis

Base: `origin/develop` `be9e2e4`, 2026-10-09. Analysis only; no code, test, spec or `.claude/` file touched.

Produced: `docs/design/r64-list-spacing/analysis.md` (this file). The mock API, the measuring script and the screenshots stayed in the session scratchpad and are not committed.

### Measured band (real render)

Production build (`npm run build`, `npm start`) with `NEXT_PUBLIC_API_URL` pointing to a local mock serving the `200` examples of `contracts/openapi.yaml` for `GET /offerings`, `/coffeeshops`, `/taxonomies` and `/coffees`; measured in headless Chromium (Playwright `chromium-1194`), route `/es/...`, traditional theme, anonymous session, list view, first page. "Gap" = top of the first card − bottom of the toolbar row.

| Screen | Viewport | Toolbar bottom | First card top | Gap |
|---|---|---|---|---|
| `/es/offerings` | 375px | 267.5 | 363.5 | **96px** |
| `/es/offerings` | 1280px | 303.5 | 431.5 | **128px** |
| `/es/coffeeshops` | 375px | 353.5 | 449.5 | **96px** |
| `/es/coffeeshops` | 1280px | 337.5 | 465.5 | **128px** |

The AUT's "about 100px" is the 375px value; from `md` the band is 128px.

### Box trace between the toolbar and the first card (both screens, identical)

Tailwind 4 default spacing (0.25rem per step, 16px root); `src/app/styles/globals.css` defines no `--spacing` override (only `letter-spacing` tokens). px values are the computed styles read in the browser.

| # | Element | File:line | Class | 375px | 1280px |
|---|---|---|---|---|---|
| 1 | Toolbar row (bottom edge; `items-end`, no padding/margin; the `Field` below the select has no help/error, so nothing under it) | `src/features/offering-facets/ui/OfferingsToolbar.tsx:20`, `src/features/coffeeshop-facets/ui/CoffeeshopsToolbar.tsx:21`, `src/shared/ui/Field.tsx:56-76` | `flex flex-wrap items-end justify-between gap-x-4 gap-y-3` | 0 | 0 |
| 2 | Toolbar wrapper (offerings only) | `src/pages/offerings/ui/OfferingsScreen.tsx:78` | none (`<div>`) | 0 | 0 |
| 3 | Header container (last child is the toolbar) | `OfferingsScreen.tsx:25,73`, `CoffeeshopsScreen.tsx:31,94` + `src/shared/ui/PageSection.tsx:29-35` | `mx-auto w-full max-w-6xl px-4 md:px-8` + `flex flex-col gap-8` (no vertical padding) | 0 | 0 |
| 4 | **Header section, bottom padding** | `src/shared/ui/PageSection.tsx:25,55` (used at `OfferingsScreen.tsx:73`, `CoffeeshopsScreen.tsx:94`) | `py-12 md:py-16` | **48** | **64** |
| 5 | **Results section, top padding** | same `PageSection.tsx:25,55` (used at `OfferingsScreen.tsx:80`, `CoffeeshopsScreen.tsx:115`) | `py-12 md:py-16` | **48** | **64** |
| 6 | Results container | `PageSection.tsx:29-35` | `mx-auto w-full max-w-6xl px-4 md:px-8` | 0 | 0 |
| 7 | `Suspense` boundary (resolved: no box; fallback has the same top edge) | `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx:62-83`, `CoffeeshopsScreen.tsx:118-137` | — | 0 | 0 |
| 8 | List block | `src/widgets/offering-list/ui/OfferingList.tsx:188,232`; `src/widgets/coffeeshop-list/ui/CoffeeshopList.tsx:54,77` | `@container flex flex-col gap-8` / `flex flex-col gap-8` | 0 | 0 |
| 9 | Result count, first child of the block | `src/shared/ui/ResultStatus.tsx:46` | `sr-only` (`position: absolute`, out of flex flow: adds no `gap-8`; measured 1px box above the card) | 0 | 0 |
| 10 | Card grid / column | `src/widgets/offering-list/lib/grid.ts:303`; `src/widgets/coffeeshop-list/lib/column.ts` | `grid grid-cols-1 gap-6` (gap only between cards) | 0 | 0 |
| | **Total** | | | **96** | **128** |

Shell: `main` (`src/app/shell/SessionShell.tsx:36`, `bg-surface-page flex-1 md:flex`) and the content column (`:38`, `min-w-0 flex-1`) add no vertical spacing; the `@sidebar` slot (`app/[locale]/@sidebar/offerings/page.tsx`, `src/shared/ui/Sidebar.tsx:106-116`) is a separate column and does not touch the band. Route files (`app/[locale]/offerings/page.tsx`, `app/[locale]/coffeeshops/page.tsx`) only pass props.

Findings:

1. **The "unexplained part" is the second section's top padding.** Each list screen stacks two `PageSection`s: one for the heading block and toolbar, one for the results. Their paddings add up: 48 + 48 = 96px below `md`, 64 + 64 = 128px from `md`. Nothing else contributes (rows 1–3, 6–10 measured at 0). Evidence: table above, `OfferingsScreen.tsx:73,80`, `CoffeeshopsScreen.tsx:94,115`, `PageSection.tsx:25`. Path: see findings 2 and 3.
2. **Directory: the code contradicts its own archived design.** `openspec/changes/archive/2026-10-08-add-coffeeshop-directory/design.md:87` and `docs/design/add-coffeeshop-directory/design-summary.md` §8 settle "2rem to the toolbar, 1.5rem to the results" (24px). Delivered: 96 / 128px. The wireframe in the same summary (§12) also shows "1.5rem" between toolbar and results. Path (workflow §4): **unplanned fix** (behaviour already in a design; no decision changes). Since that change is archived, the fix needs a carrier: the R64 change, or a `fix(content-structure)` on its own (Open 1).
3. **Catalog: no settled toolbar→results value, and the two-section stack contradicts the main spec.** `openspec/specs/content-structure/spec.md:73` ("Page sections"): "A feature view SHALL use one section on the page background … its top-level blocks … 2rem apart … The section background SHALL be used only by the landing and About pages." The catalog and the directory are feature views on the backdrop since `refine-page-surfaces` (§5.2, §5.5), yet each uses two sections. `add-offering-catalog` summary §6.1–§6.2 settled the two sections when section 2 was a `surface-section` band (the padding framed a band); `refine-page-surfaces` §5.5 moved the results to `surface-page` but kept the section split, so the band became empty backdrop. The toolbar was added later (`add-filter-controls` §6.4, `add-offering-facets` D8) as "the catalog's filter slot, 2rem below the heading block", with no value to the results. Path: **new change** (Change (layout), owning capability `content-structure`, as in R64), because the catalog's value is not settled (Open 2).
4. **Existing spacing between a toolbar and its list (criterion C):**
   - 1.5rem (`gap-6`): directory design (finding 2); coffee shop detail "Ofertas" panel, which renders the very same `FilteredOfferingsToolbar` + `FilteredOfferingsResults` as the catalog: `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:34-35` (`OFFERINGS_PANEL_CLASSES = flex flex-col gap-6`, "The offerings toolbar, then the results, 1.5rem apart").
   - 2rem (`gap-8`): "My evaluations", `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:23-24,95` (`add-evaluation-facets` D8, "toolbar 2rem above the list"); `content-structure` top-level blocks (spec line 73, `refine-page-surfaces` §5.2).
   - Between related elements inside a block the project uses 0.5rem (heading block), 1rem (section cards), 1.5rem (cards in a list), 2rem (top-level blocks, list → pagination). Between sections: 3rem / 4rem padding per section.
   Path: information for Open 2.
5. **States follow automatically.** The skeleton fallback (`FilteredOfferingsResults.tsx:65-71`, `CoffeeshopsScreen.tsx:121-125`), the empty and error states and the directory's map view all render as the first visible child of the same results container, so whatever end state is chosen applies to them too (code trace; only the list state was measured). Path: none.
6. **Same pattern on a third screen, out of R64's scope.** `src/pages/public-evaluations/ui/ListScreen.tsx:60-67`: heading + toolbar in a `surface="page"` section, the list in a `surface="section"` section, so the toolbar→list distance is the same 96/128px (code trace, unverified), here across a band edge. The band was settled in `docs/design/add-public-evaluations/design-summary.md:214` ("mirrors the catalog list"), before or alongside `refine-page-surfaces`, while `content-structure` now reserves the section background for landing and About. Path: **backlog** (a separate entry; not to be folded into R64).

Open for Product owner:

1. **Where the spacing changes (one place per screen).** End state for both screens: one `PageSection surface="page"` holding the heading block, the toolbar and the results; 3rem / 4rem padding above the heading and below the pagination unchanged; heading block → toolbar 2rem unchanged; toolbar → first card as in Open 2, at every width; side padding, borders and radius unchanged.
   - **(a) Recommended: merge the two sections in each page slice.** `OfferingsScreen.tsx` and `CoffeeshopsScreen.tsx` render one `PageSection`; its container (via `containerClassName`, layout only) is a flex column whose children are the existing header column (heading block + toolbar, `gap-8`) and the results. This is the pattern already used by `EvaluationsListScreen` (one section, toolbar and list in a `gap-8` column) and by the coffee shop detail's Ofertas panel (`gap-6`). Touches only the two page slices; **no shared component** (`PageSection` unchanged), no other screen affected. It also brings both screens in line with `content-structure` "one section per feature view". Keeping the header column nested leaves the existing "Toolbar region contributes nothing" test valid (the heading block stays the only child of its column when the toolbar is empty) — unverified, tests were not run.
   - (b) Add a "no top padding" option to `PageSection` and use it on the results section. Touches a shared primitive used by every page (home, about, account, management, evaluations, detail screens) and adds a padding variant that the primitive's contract excludes (`PageSection.tsx:14-19`: `containerClassName` never carries padding) and that `extract-page-section` did not settle. Not recommended.
   - (c) Keep two sections and accept the band. Contradicts finding 2 and the spec line in finding 3. Not recommended (Product owner already decided the band should shrink).
2. **The toolbar → first card value.**
   - **(a) Recommended: 1.5rem (24px) at 375px and at 1280px.** It is the directory's settled value (finding 2) and the value the detail's Ofertas panel already uses for the identical offerings toolbar and list (finding 4), so the catalog, the directory and the detail tab would match. It also keeps the toolbar visibly closer to its list than the 2rem that separates the heading block from the toolbar, which reads the toolbar as part of the list. Band reduction (computed): 96 → 24px below `md`, 128 → 24px from `md`.
   - (b) 2rem (32px) at both widths: the `content-structure` top-level-block value and "My evaluations" (`add-evaluation-facets` D8). Consistent with the spec's generic rule, but then the directory's settled 1.5rem changes (a correction to an archived design) and the detail's Ofertas tab differs from the catalog by 8px.
   - Either way, the value is a gap between the two children of the section's container (no margin, no padding on the toolbar or on the list block), and no new token is needed.
3. **Carrier for the directory half.** (a) Recommended: one R64 change for both screens (one decision, one review, both screens tested together). (b) The directory as an unplanned `fix(content-structure)` now (its value is settled) and the catalog in R64 after Open 2.
4. **Public evaluations (finding 6):** add a backlog entry, or leave it until that screen is next touched. Recommendation: a backlog entry referencing R64's outcome, because the same reasoning (feature view, one section, page background) will apply.

Unverified:

- The skeleton, empty, error and map-view states were not measured; their gap is from the code trace (finding 5).
- Signed-in sessions, the dark theme, the sidebar-closed 1280px layout and locales other than `es` were not measured; none of them touches the classes in the trace (code reading).
- Public evaluations' 96/128px (finding 6) is computed from the code, not measured.
- The 24px / 32px end states and the band reductions in Open 2 are computed by me, not rendered.
- No test, typecheck or lint was run; the test impact in Open 1 (a) is from reading `src/pages/offerings/ui/OfferingsScreen.test.tsx:54-71` and `src/pages/coffeeshops/ui/CoffeeshopsScreen.test.tsx:60-66`.
- No MVC capture exists for either screen (`add-offering-catalog` summary §6.5: "no MVC capture was taken"; `add-coffeeshop-directory` summary §12: "No MVC screen exists").

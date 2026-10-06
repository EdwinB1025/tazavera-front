Status: draft — pending Product owner review

# Design summary — add-public-evaluations

Capability: `public-evaluations` (new). Change-id: `add-public-evaluations`. Branch (when created): `feature/add-public-evaluations`.

Drafted by the design lead on 2026-10-06 (generation mode), for the three public evaluation reads that no change consumes after today's contract update. Sources:
- `contracts/openapi.yaml` on `develop` (updated 2026-10-06): `listEvaluations`, `getAnEvaluation`, `listTheEvaluationsOfAUser`, `getAnOffering`, `listOlfactoryTaxonomies`;
- the decisions log of `docs/general-context.md`, especially "lecturas de evaluaciones: decisión final" (public reads stay public and anonymous; the evaluator is never exposed in public responses), "medias SCA en el detalle con la escala de granos", "pestañas del detalle de oferta" and "estilo de la pestaña futura";
- the approved summaries of `add-specialist-evaluations` (worktree `tazavera-front-evaluations`: the read-only view of the user's own closed evaluations, §2, §3, §9) and `add-offering-catalog` (detail page, layout values), and the `add-evaluation-scales` summary (read-only `BeanScale`, `IntensitySlider`, `DescriptorChipGroup`);
- the main specs in `openspec/specs/` and the code on `develop`;
- the MVC, read only: `layouts/evaluations/show.blade.php`, `partials/technical-info.blade.php`, `layouts/offerings/partials/evaluation-axis-static.blade.php`, `consensus-axis.blade.php`, `partials/evaluation-card.blade.php`, `partials/evaluation-list.blade.php`.

Numbers marked *(measured)* come from a script executed by a design lead (this session had no shell: every such number is quoted from the cited summary); *(computed)* are the design lead's arithmetic; *(unverified)* was not checked.

## 1. Scope

Three public screens, open to any visitor, with or without a session:

1. **Evaluations** at `/{locale}/evaluations`: every closed evaluation, newest first, as row cards with Previous/Next pagination (`listEvaluations`).
2. **Specialist's evaluations** at `/{locale}/specialists/{userUlid}`: the closed evaluations of one specialist, same list presentation (`listTheEvaluationsOfAUser`).
3. **Evaluation** at `/{locale}/evaluations/{ulid}`: one closed evaluation, read only, with the offering it belongs to (`getAnEvaluation` + `getAnOffering`), presented as the user's own read-only view in `add-specialist-evaluations` (same groups, same layout, scales in `readOnly`).

Why this split (criterion B, from the contract and the decisions log):
- The evaluation resource carries `offeringId` but no evaluator and no offering details (`getAnEvaluation`, contract lines 426-751). Coffee, coffeeshop and roaster names come from `getAnOffering`, one request per distinct `offeringId`, as `add-specialist-evaluations` §1 does for its own list.
- No public response exposes a specialist's ULID (decisions log "lecturas de evaluaciones: decisión final"). A specialist's page is reached only from a link that already holds the ULID: the specialist's own session (Open 2).
- `listEvaluations` also accepts `evaluatorId`; the specialist page uses the dedicated `listTheEvaluationsOfAUser` instead, which documents the `404` for an unknown user.

MVC mapping: the MVC has no public evaluation pages (its evaluation list and show are the evaluator's management area, `routes/web.php`). The visual language is translated from those management views and from the MVC offering detail's static axes, each cited where used.

Out of scope:
- open (draft) evaluations: never shown publicly (Open 4);
- filters and sorting controls on these lists (`add-filter-controls` places facets only on the offerings list and the management evaluations list; decisions log "filtros");
- the evaluator's name or profile data: not in any public response;
- the offering detail tab with the provisional evaluation (a later change of `add-offering-catalog`);
- writing evaluations (`add-specialist-evaluations`).

## 2. Contract operations consumed

| operationId | Route | Security | Used by | Fetched |
|---|---|---|---|---|
| `listEvaluations` | `GET /evaluations?status=closed&orderBy=created_at&orderDirection=desc&page=n` | public (`security: []`) | Evaluations list | Server, plain `fetch` |
| `listTheEvaluationsOfAUser` | `GET /users/{user_ulid}/evaluations?status=closed&orderBy=created_at&orderDirection=desc&page=n` | public | Specialist list | Server, plain `fetch` |
| `getAnEvaluation` | `GET /evaluations/{evaluation_ulid}` | public | Evaluation view | Server, plain `fetch` |
| `getAnOffering` | `GET /offerings/{offering_ulid}` | public | Row heading and captions (one per distinct `offeringId` on the page, in parallel); the evaluation view's header and roast level | Server, plain `fetch` (Open 7: where the fetcher lives) |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | public | Taste-note names and colours of the evaluation view | Server, `fetchTaxonomies` (`src/entities/taxonomy`) |

Fetching rule (settled, `.claude/CLAUDE.md` §2): every operation here is public, so all run on the server with plain `fetch` against `NEXT_PUBLIC_API_URL`, with no credential, as `fetchVerifiedOfferings` does. No session is read on these screens.

Fields shown (contract names; values as the API returns them, general context "Forma de trabajar"):
- list row and view header: `cuppingScore` (decimal string, rating tier by `ratingTierFor`), `closedAt` (date), `extractionMethod`, `isDefective`; from the offering: `coffeeInventory.coffee.name`, `location.name`, `coffeeInventory.roastery.name`;
- view only: `descriptive.{fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel}.score` (0–15) and `.note`; `affective.{…, overall}.score` (1–9) and `.note`; `tastes[]` (`ref`, `type` per axis, mapped as `add-specialist-evaluations` §2 "Loading a draft"); `extrinsics.*` (non-null ones); `evaluationType`; the offering's `coffeeInventory.coffee.roastLevel` (the evaluation does not return it, `add-specialist-evaluations` §2).
- not shown: `ulid`, `offeringId`, `status` (always closed here), `createdAt` (Open 5).

**Response states:**

| State | Lists | Evaluation view |
|---|---|---|
| Loading | `Suspense` fallback: three row skeletons (§6.2) | Header placeholder bars and two skeleton cards (§6.3), as the catalog detail |
| 200 with items | Row cards + pagination | Full view |
| 200 with `data: []` | Empty message | n/a |
| One row's `getAnOffering` fails | That row shows `offeringUnavailable` as its heading, no captions, no "View offering" link; the other rows are unaffected | Header shows `offeringUnavailable`; the evaluation groups still render |
| Unknown user ULID (`404`, documented in the description of `listTheEvaluationsOfAUser`) | The 404 page (Next `notFound()`) | n/a |
| Evaluation with `status: open` | n/a | The 404 page (Open 4) |
| Any other non-2xx or transport failure | Error message + Retry | Error message + Retry + the back link (add-offering-catalog Open 7 rule: a `404` of `getAnEvaluation` is undocumented, so it falls here) |
| 422 (invalid query value) | Same as the error state; the screens send only fixed values and `page` | n/a |

## 3. Routes and composition (FSD)

| Layer | Piece | Notes |
|---|---|---|
| `app/[locale]/evaluations/page.tsx` | Route: passes the locale and `page` | No logic |
| `app/[locale]/evaluations/[ulid]/page.tsx` | Route: passes the locale and the ulid | |
| `app/[locale]/specialists/[userUlid]/page.tsx` | Route: passes the locale, the user ulid and `page` | Route name: Open 3 |
| `src/pages/public-evaluations` | `EvaluationsScreen`, `SpecialistEvaluationsScreen`: texts (server), `PageSection`, the list in `Suspense` | New |
| `src/pages/public-evaluation` | `EvaluationScreen`: texts, `PageSection`, the view in `Suspense` | New |
| `src/widgets/evaluation-list` | Async fetch component (list + offerings per row) and sync presentation, the `VerifiedOfferings` / `OfferingList` split; takes the list fetch as a parameter so both list routes share it | Shared with `add-specialist-evaluations`' row card (Open 6) |
| `src/widgets/evaluation-sheet` | The read-only evaluation: header data, context card, group cards with read-only scales and descriptors | Shared with `add-specialist-evaluations`' read-only view (Open 6) |
| `src/entities/offering` | `ratingTierFor`; the single-offering fetch (Open 7) | Existing / Open 7 |
| `src/entities/taxonomy` | `fetchTaxonomies`, `buildTaxonomyLookup` | Existing |
| `src/shared/ui` | `PageSection`, `Pagination`, `Card`, `Badge`, `Link`, `Button`, `BeanScale`, `IntensitySlider`, `DescriptorChipGroup` (scales) | Existing / scales |

## 4. Components and reuse

| Part | Component and variant | States | Accessible name / semantics |
|---|---|---|---|
| Page eyebrow | `<p className="type-eyebrow-strong">` | — | text |
| Page heading | `<h1 className="type-heading">` | — | text |
| Row card | `Card layout="default"`: `CardAside` (score), `CardContent` (heading, captions, meta), `CardFooter` (links) — the row card of `add-specialist-evaluations` §9 "List page", without its status badge and actions | — | `h2` coffee name (`type-card-heading`) |
| Score row | `type-score` value, `type-meta` "/100", `Badge variant={ratingTierFor(cuppingScore)}` with the tier word (the `OfferingCard` composition, label-rating-badge) | absent when `cuppingScore` is null | the score text; the badge's word |
| Row links | `Link` default: "View" → `/{locale}/evaluations/{ulid}`; "View offering" → `/{locale}/offerings/{offeringId}` | rest, hover, focus | "View" + visually hidden " {coffee name}" (WCAG 2.5.3, name starts with the visible text); same for "View offering" |
| Defective mark | `<span className="type-meta">` with the `defectiveLabel` text, only when `isDefective` | — | text (never colour alone) |
| Pagination | `Pagination` (`@/shared/ui`): `path` the route, `query` none, `currentPage` / `lastPage` from `meta` | disabled at the boundaries | button labels |
| Row skeleton | `Card layout="default"` with the placeholder bars of `OfferingSkeletonCard` (`bg-surface-section`, `rounded-field`) | loading | `aria-hidden`; the list region carries `aria-busy` |
| Empty message | `<p className="type-body">` | — | text |
| Error + Retry | `type-body` message and Retry (Open 8) | — | label |
| Back link | `Link variant="back"` → `/{locale}/evaluations` (Open 9) | — | `backLabel` |
| View header | eyebrow, `h1` coffee name, captions (`type-label`), meta line (`type-meta`), "View offering" `Link` | — | — |
| Context card | `Card layout="stacked"`, `CardContent` only: the score row, then a `dl` | — | `h2` `contextHeading` (`type-subheading`) |
| Group card | `Card layout="stacked"`: `CardAside` header (group name), `CardContent` body (descriptive and affective parts) — `add-specialist-evaluations` §9 | below `md`: collapsible header (`aria-expanded`); from `md`: static | `h2` group name |
| Intensity (0–15) | `IntensitySlider readOnly` (`role="meter"`, `valueText` "8/15", `valueLabel` "8 de 15", `scaleLabels`) | read-only | `label` = axis name |
| Impression (1–9) | `BeanScale readOnly size="responsive"` (`role="meter"`, `valueText` "6/9", `valueLabel` "6 de 9") | read-only | `label` = axis name |
| Descriptors | `DescriptorChipGroup readOnly` with the rows built from `GET /taxonomies` per `add-specialist-evaluations` §3; `emptyText` `noDescriptors` | read-only | `legend` = block name |
| Notes | `<p className="type-body">` per non-null note, under a `type-label` "Note" | — | text |
| Extrinsics | `dl`, one row per non-null `extrinsics.*` field | — | native |

**New components in `src/shared/ui`:** none. Two new widgets (Open 6) compose existing parts.

## 5. Semantic tokens and contrast

Only existing semantic tokens. No new primitive or semantic token.

| Part | Token(s) | Sits on |
|---|---|---|
| Page | `bg-surface-page` (`PageSection surface="page"`) | — |
| Eyebrow | `text-label` (`type-eyebrow-strong`) | surface-page |
| h1 | `text-primary` (`type-heading`) | surface-page |
| View captions | `text-label` (`type-label`) | surface-page |
| View meta line | `text-secondary` (`type-meta`) | surface-page |
| Links (back, View offering) | `text-link`, hover `text-link-hover` | surface-page, surface-card |
| Cards | `surface-card`, 4px left `border-accent`, `rounded-container`, `shadow-lg` (Card's own); `CardAside` 1px `border-subtle` separator (decorative) | surface-page |
| Row heading, `h3` part headings in cards | `text-primary` (`type-card-heading`) / `text-label` (`type-label`) | surface-card |
| Group and context `h2` | `text-accent` (`type-subheading`) | surface-card |
| Captions, `dt` | `text-label` (`type-label`) | surface-card |
| Meta, `dd` | `text-secondary` (`type-meta`) / `text-primary` (`type-body`) | surface-card |
| Score | `text-primary` (`type-score`), `text-secondary` "/100", rating `Badge` (`evaluation-rating-*` + `badge-text`) | surface-card |
| Score and descriptor panels | `bg-surface-section`, 1px `border-subtle` (decorative), `rounded-container` | surface-card |
| Scale labels, value text, marks | `text-label`, `text-primary`, `text-secondary` (scales' own) | surface-section |
| Beans, slider track | `evaluation-bean-*`, `evaluation-slider-*` (scales' own) | surface-section |
| Taxonomy badges | `Badge variant="taxonomy"` (feedback's luminance rule) | surface-section |
| Error text | `feedback-error` | n/a (no error text on a field here; errors use `type-body`) |
| Focus | `focus-visible:focus-ring` | surface-page, surface-card |

**Gated pairs** (text 4.5:1; icon and boundary 3:1). No new measurement in this session (no shell): every pair below is registered in `theme-tokens.test.ts` (measured on every run) or measured in the cited summary.

| Pair | Gate | Traditional | Dark | Registered today | Source |
|---|---|---|---|---|---|
| text-primary / surface-page, surface-card | 4.5 | 6.41 / 6.41 | 14.28 / 13.22 | yes | add-offering-catalog §5 *(measured)* |
| text-label / surface-page | 4.5 | 5.97 | 10.28 | yes | same |
| text-secondary / surface-page | 4.5 | 6.05 | 8.57 | yes | same |
| text-accent / surface-card | 4.5 | 6.85 | 6.82 | yes | same |
| **text-label / surface-card** | 4.5 | 5.97 | 9.51 | no | same |
| **text-secondary / surface-card** | 4.5 | 6.05 | 7.93 | no | same |
| **text-link / surface-page** | 4.5 | 6.41 | 14.28 | no | same |
| **text-link-hover / surface-page** | 4.5 | 11.53 | 15.93 | no | same |
| text-link, text-link-hover / surface-card | 4.5 | 6.41 / 11.53 | 13.22 / 14.75 | yes | add-user-account §6.4 *(measured)* |
| badge-text / evaluation-rating-* over surface-card | 4.5 | 4.69–5.12 | 6.42–7.08 | no (add-offering-catalog F1) | add-offering-catalog §11 *(measured)* |
| text-primary, text-secondary / surface-section | 4.5 | 5.72 / ≥5.39 | 11.97 / ≥7.18 | yes | add-evaluation-scales §4 *(measured, range over four surfaces)* |
| **text-label / surface-section** (scale labels, legends in panels) | 4.5 | ≥5.32 | ≥8.61 | no | add-evaluation-scales §4 *(range minimum; the exact surface-section value unverified)* |
| **evaluation-bean-mark-on / evaluation-bean-on over surface-section** (icon) | 3 | 7.31–7.72 | 4.89 | no (scales registers surface-form and surface-card only) | add-evaluation-scales §4 |
| evaluation-bean-mark-off / evaluation-bean-off | 3 | 7.02 | 7.44 | yes, by scales | add-evaluation-scales §4 |
| focus-ring / surface-page, surface-card | 3 | 11.53 / 11.53 | 14.28 / 13.22 | yes | add-offering-catalog §5 |

Not gated: the read-only slider (a `meter` whose value is given as text; the track is decorative, scales §4), panel borders, the `CardAside` separator, the skeleton bars.

**Pairs the guard tests must register, in both matrices** (only those not registered by an earlier change when this one lands):
- `text-label` / `surface-card`, `text-secondary` / `surface-card`, `text-link` / `surface-page`, `text-link-hover` / `surface-page` (also named by add-offering-catalog, add-user-account and add-offering-management);
- `text-label` / `surface-section`;
- icon `evaluation-bean-mark-on` / `evaluation-bean-on` with base `surface-section` (scales §4: "Other host surfaces … are registered by the consumer that uses them");
- the four `badge-text` / rating pairs over `surface-card`, unless add-offering-catalog registers them first (its Open 10).

If `add-specialist-evaluations` builds the shared sheet first (Open 6), it registers the `surface-section` pairs and this change registers none of them.

## 6. Layout and spacing (criterion A)

Breakpoints: Tailwind defaults (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px). Every value is an end state.

### 6.1 Page layout (`PageSection`, decisions log D14)

All three routes: one `PageSection surface="page"`: full width, `surface-page`, vertical padding 3rem below `md` and 4rem from `md`; container centred, at most 72rem, side padding 1rem below `md` and 2rem from `md`; no border or radius. These are `PageSection`'s values; the screens add none. The container's children are a flex column (`containerClassName`, layout only). One section per page, as `add-specialist-evaluations` §9 (the read-only view this one mirrors).

### 6.2 Lists (`/{locale}/evaluations`, `/{locale}/specialists/{userUlid}`)

Container column, gaps:
- heading block → list: 2rem;
- list → pagination: 2rem.

**Heading block:** eyebrow and h1, 0.5rem apart (MVC `layouts/evaluations/index.blade.php:3-5`; as add-offering-catalog §6.2). No box.

**List:** one column at every width, one row card per evaluation, 1rem between cards (`add-specialist-evaluations` §9; MVC `evaluation-list.blade.php:4` `gap-2`, rounded up to the project's 1rem list step). No padding, border or radius of its own.

**Row card** (`Card layout="default"`, MVC `evaluation-card.blade.php`):
- `CardAside` (1.5rem padding; below `lg` a 1px bottom `border-subtle`, from `lg` a 1px right border and a quarter of the card width, Card's own): the score row: flex, wraps, baseline-aligned, 0.5rem gap (the `OfferingCard` score row). Absent when `cuppingScore` is null.
- `CardContent` (1.5rem padding): a vertical stack, 0.5rem apart: the `h2` coffee name, the coffeeshop caption, the roaster caption, the meta line ("{closed date} · {extraction method}", `type-meta`) and, when `isDefective`, the defective mark.
- `CardFooter` (1.5rem padding, below both regions): the links, a flex row, wrapping, aligned to the end, 1rem apart (`add-specialist-evaluations` §9 footer).
- Card border, radius and shadow: Card's own (4px left `border-accent`, `rounded-container`, `shadow-lg`).

**Pagination:** `Pagination` as shipped: centred, buttons 1rem apart, wrapping.

**Empty state:** `type-body` text at the top of the list area; no box.

**Error state:** a column, 1rem apart, at the top of the list area: the message (`type-body`), then Retry at its own width; no box.

**Loading:** three row skeletons in the list (1rem apart), each a `Card layout="default"` whose `CardContent` holds three bars 0.5rem apart: 1.5rem tall at two thirds width, 1rem tall at half width, 1rem tall at a quarter width (`bg-surface-section`, `rounded-field`, as `OfferingSkeletonCard`); no aside, no footer.

### 6.3 Evaluation view (`/{locale}/evaluations/{ulid}`)

Values from `add-specialist-evaluations` §9 (form page, read-only variant), so the public view and the owner's read-only view are one presentation (Open 6). MVC `show.blade.php`, `technical-info.blade.php`, `evaluation-axis-static.blade.php`.

Container column:
- **Header block** at the top: back link; eyebrow (`viewEyebrow`); `h1` coffee name; coffeeshop and roaster captions (`type-label`); meta line (`type-meta`: "{closedLabel} {closed date}"); "View offering" link.
  - Back link and eyebrow 1rem apart; eyebrow and heading 1rem apart; heading and first caption 0 apart (MVC `gap-0`); captions 0.25rem apart; meta line 0.25rem below the last caption; the link 0.5rem below the meta line.
  - No border, background or padding of its own.
- **Header block → context card:** 2rem.
- **Context card** (`Card layout="stacked"`, `CardContent` only: 1.5rem padding, Card's border, radius, shadow). MVC `technical-info.blade.php:26-43`, translated:
  - a header row: `h2` `contextHeading` (`type-subheading`) at the start and the score row at the end; flex, wraps, space between, centre-aligned, 0.5rem gap (MVC `flex items-center justify-between`);
  - 1rem below it, a `dl`: rows "Roast level" (the offering's `roastLevel`), "Extraction method" (catalog label of `extractionMethod`, Open 10), "Defective cup" (Yes / No), "Evaluation type" (`evaluationType` as returned); each row `dt` (`type-label`) above `dd` (`type-body`), 0.25rem apart; rows stacked 1rem apart below `md`, two equal columns 1.5rem apart from `md` with 1rem between rows (MVC `grid-cols-2 gap-x-6 gap-y-3`; `add-specialist-evaluations` §9 context card).
- **Context card → first group card:** 1rem; **between group cards:** 1rem (MVC `gap-4`).
- **Group cards**, in CVA order (`add-specialist-evaluations` §2): Fragrance / Aroma, Flavor / Aftertaste, Acidity, Sweetness, Mouthfeel, Overall, Defects, Extrinsic. Each `Card layout="stacked"`:
  - **Header** in `CardAside` (1.5rem padding, 1px bottom `border-subtle`, Card's own): the `h2` group name (`type-subheading`). Below `md`, the header is the collapse toggle: a full-width button carrying the name and a `ChevronDown` icon (1rem, rotated when open), name and icon 0.5rem apart, space between, `focus-visible:focus-ring`, `aria-expanded`, accessible name = the group name; every group starts open (MVC `x-data="{ open: true }"`). From `md`, not interactive. No completeness indicator (closed evaluations are complete).
  - **Body** in `CardContent` (1.5rem padding): the descriptive and affective parts. Below `md` they stack, 1.5rem apart, the affective part with a 1px top `border-subtle` and 1.5rem padding above it. From `md` two equal columns 1.5rem apart, the descriptive column with a 1px right `border-subtle` and 1.5rem padding to its right (MVC `tz-right-border-card`, `gap-6`). Groups without a descriptive part (Overall, Defects, Extrinsic) use one full-width column.
  - **Inside each part:** part heading (`h3`, `type-label`), score panel, descriptor block, notes, 1rem apart (MVC `gap-4`). A part with no descriptor block or no note omits it, with no gap.
  - **Score panel:** `bg-surface-section`, `rounded-container`, 1px `border-subtle`, padding 1rem; the two scales of a pair 0.5rem apart (MVC `tz-card-section`, `gap-2`). Scales keep their own internals (scales §1–§2: label 0.5rem above, beans 0.25rem apart, row gap 0.75rem; slider header 0.5rem above the track, marks 0.25rem below).
  - **Descriptor block:** the same panel treatment (padding 1rem); `DescriptorChipGroup readOnly` internals (legend 0.5rem above, rows 0.75rem apart, badges 0.5rem apart both ways). With nothing selected it shows `noDescriptors`.
  - **Notes:** a vertical stack, 0.25rem apart: `type-label` "Note", then the note in `type-body`. Shown only when the note is non-null.
  - **Extrinsic group:** a `dl` of the non-null `extrinsics.*` fields, same row values as the context card; with none, `noExtrinsics` (`type-body`).
- **Error state:** the back link, then 1.5rem below, the message and Retry in a column 1rem apart.
- **Loading:** the back link, three placeholder bars 0.5rem apart (1rem tall at a quarter width, 1.5rem at two thirds, 1rem at half; `bg-surface-section`, `rounded-field`), then 2rem below, two skeleton cards 1rem apart.

### 6.4 At 375px

*(computed)*
- Container 343px; a card's content 343 − 2 × 24 − 4 = 291px; a score panel's content 291 − 2 × 16 − 2 = 257px.
- Bean row at 24px: 9 × 24 + 8 × 4 = 248px, which fits 257px; the value text wraps under the beans (scales §1 row rule).
- Row cards stack aside above content; links wrap; the context card's header wraps the score row under the `h2`.
- No horizontal scroll.

### 6.5 Visual reference (mock-ups, ASCII: the MVC has no public evaluation screen)

Evaluations list, 1280px:
```
┌ header ── Logo  Top rated  About us ─────────────────── ES ▾  Sign in ┐
│ PageSection surface-page  py-16                                       │
│   EVALUATIONS                                   (eyebrow)             │
│   Closed evaluations                            (h1)                  │
│   2rem                                                                │
│ ┃┌ aside ─────────────┐┌ content ──────────────────────────────────┐  │
│ ┃│ 84.25 /100 [Good]  ││ Huila El Mirador                  (h2)    │  │
│ ┃│                    ││ Coffeeshop: Tazavera Gràcia               │  │
│ ┃│                    ││ Roaster: Nómada Roasters                  │  │
│ ┃│                    ││ 2 Oct 2026 · V60                          │  │
│ ┃└────────────────────┘└───────────────── View  View offering ─────┘  │
│   1rem                                                                │
│ ┃ … next row …                                                        │
│                     [Previous] [Next]                                 │
└───────────────────────────────────────────────────────────────────────┘
```
Evaluation view, 375px:
```
│ px-4 py-12                                │
│ ← Back                                    │
│ EVALUATION                                │
│ Huila El Mirador (h1)                     │
│ Coffeeshop: Tazavera Gràcia               │
│ Roaster: Nómada Roasters                  │
│ Closed on 2 Oct 2026                      │
│ View offering                             │
│ ┃ Context            84.25 /100 [Good]    │
│ ┃ Roast level   medium                    │
│ ┃ Extraction method   V60                 │
│ ┃ Defective cup   No                      │
│ ┃ Fragrance / Aroma                    ⌄  │
│ ┃ Descriptive                              │
│ ┃ ╭ panel (surface-section) ───────────╮  │
│ ┃ │ Fragrance            11/15         │  │
│ ┃ │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬            │  │
│ ┃ │ 0     5     10     15              │  │
│ ┃ ╰────────────────────────────────────╯  │
│ ┃ Affective                                │
│ ┃ ╭ Fragrance  ●●●●●●●○○  7/9 ╮          │
```
The verification task captures the three routes at 375px and 1280px in both themes, against a local read mock (the local database has no offerings or evaluations).

## 7. Behaviour

- **Lists:** fixed query `status=closed&orderBy=created_at&orderDirection=desc` plus `page` from the URL (`?page=n`); `Pagination` replaces only `page`. No other query key is read or forwarded.
- **Offerings per row:** after the list returns, one `getAnOffering` per distinct `offeringId` on the page, in parallel, on the server; at most 15 *(per_page from the contract example; the API default is unverified)*.
- **Evaluation view:** `getAnEvaluation`; if `status` is not `closed`, the 404 page; otherwise `getAnOffering(offeringId)` and `fetchTaxonomies()` in parallel.
- **Taste notes:** each `tastes[]` entry goes to its block by `type` (`fragrance`/`aroma` → the Fragrance / Aroma block, `flavor`/`aftertaste`/`main_tastes` → Flavor / Aftertaste, `mouthfeel` → Mouthfeel, `defects` → Defects), with the shared-block union of `add-specialist-evaluations` §2; names by the route's locale (`nameEs`, `nameEn`, `nameCa`); level 2 not shown; an unresolved `ref` renders no badge.
- **Fragrance not evaluated:** the evaluation stores the copied aroma values (`add-specialist-evaluations` §2); the view shows what is stored.
- **Dates:** `closedAt` formatted as a date in the route's locale (`Intl.DateTimeFormat`, medium date style, no time). A formatter shared with `add-specialist-evaluations`' list date (Open 6).
- **Session:** none read. A signed-in specialist sees the same public screens.

## 8. Texts (message catalog, es / en / ca, passed as props)

New area `public-evaluations` (`messages/{locale}/public-evaluations.json`) for the keys below. The CVA labels (group, part and axis names, LOW/MEDIUM/HIGH, "/15", "/9", the descriptor block names, the extraction-method labels) come from the `evaluations` area of `add-specialist-evaluations`, read as the catalog reads the `landing` card keys (add-offering-catalog Open 3). The rating tier words and the pagination labels come from the `landing` area. Spanish follows the MVC where cited; the rest, and every English and Catalan string, are proposals (Open 11).

| Key | es | en | ca |
|---|---|---|---|
| `listEyebrow` | Evaluaciones (MVC `index.blade.php:4`) | Evaluations | Avaluacions |
| `listHeading` | Evaluaciones cerradas | Closed evaluations | Avaluacions tancades |
| `specialistEyebrow` | Especialista | Specialist | Especialista |
| `specialistHeading` | Evaluaciones de este especialista | Evaluations by this specialist | Avaluacions d'aquest especialista |
| `listEmptyMessage` | No hay evaluaciones registradas todavía. (MVC `evaluation-list.blade.php:8`) | There are no evaluations yet. | Encara no hi ha avaluacions. |
| `listErrorMessage` | No se pudieron cargar las evaluaciones. | The evaluations could not be loaded. | No s'han pogut carregar les avaluacions. |
| `retryLabel` | Reintentar | Retry | Tornar-ho a provar |
| `coffeeshopCaption` | Cafetería: (MVC) | Coffeeshop: | Cafeteria: |
| `roasterCaption` | Tostadora: (MVC) | Roaster: | Torrador: |
| `viewLabel` | Ver (MVC) | View | Mostra |
| `viewOfferingLabel` | Ver oferta | View offering | Mostra l'oferta |
| `defectiveLabel` | Taza defectuosa (MVC) | Defective cup | Tassa defectuosa |
| `offeringUnavailable` | Oferta no disponible | Offering unavailable | Oferta no disponible |
| `viewEyebrow` | Evaluación (MVC `show.blade.php:1`) | Evaluation | Avaluació |
| `backLabel` | Volver (MVC) | Back | Tornar |
| `closedLabel` | Cerrada el | Closed on | Tancada el |
| `contextHeading` | Contexto (MVC `technical-info.blade.php:28`) | Context | Context |
| `roastLevelLabel` | Nivel de tueste (MVC) | Roast level | Nivell de torrat |
| `extractionMethodLabel` | Método de extracción (MVC) | Extraction method | Mètode d'extracció |
| `defectiveCupLabel` | Taza con defectos (MVC `evaluation-axis-static.blade.php:72`) | Defective cup | Tassa amb defectes |
| `yes` / `no` | Sí / No (MVC) | Yes / No | Sí / No |
| `evaluationTypeLabel` | Tipo de evaluación | Evaluation type | Tipus d'avaluació |
| `noteLabel` | Notas (MVC) | Note | Nota |
| `noDescriptors` | Sin descriptores. | No descriptors. | Sense descriptors. |
| `extrinsicsHeading` | Atributos extrínsecos | Extrinsic attributes | Atributs extrínsecs |
| `extrinsicFarming` … `extrinsicGeneralObservation` | Cultivo, Procesado, Comercio, Certificaciones, Observación general | Farming, Processing, Trading, Certifications, General observation | Cultiu, Processament, Comerç, Certificacions, Observació general |
| `noExtrinsics` | Sin atributos extrínsecos. | No extrinsic attributes. | Sense atributs extrínsecs. |
| `viewErrorMessage` | No se pudo cargar la evaluación. | The evaluation could not be loaded. | No s'ha pogut carregar l'avaluació. |

API values shown as returned, untranslated: names, `roastLevel`, `evaluationType`, notes, extrinsic texts, scores.

## 9. Accessibility

- **Headings:** one `h1` per screen; rows and view cards `h2`; parts `h3`.
- **Names:** "View" and "View offering" in each row carry a visually hidden " {coffee name}" so every link name is unique and starts with its visible text.
- **Scales:** read-only `meter`s with `aria-valuetext` (scales §1, §2); the value is also text.
- **Descriptors:** a list of badges in labelled rows (`DescriptorChipGroup readOnly`).
- **Collapsible groups (below `md`):** a button with `aria-expanded`, named by the group; the icon is `aria-hidden`.
- **States:** the defective mark is text; the rating badge shows a word next to the numeric score; nothing relies on colour alone.
- **Focus:** every interactive element is an existing control with `focus-visible:focus-ring`.
- **Document title:** `Tazavera` (landing rule, as add-offering-catalog Open 12).

## 10. Dependencies

**Capability layer:** `theming` → `base-controls` (`Button`, `Link`) → `form-fields` (scales in `readOnly`), `feedback` (`Badge`), `content-structure` (`Card`, `PageSection`, `Pagination`) → `app-shell` (header entry, Open 1) → `landing` (`ratingTierFor`, tier words), `offering-catalog` (detail route as the "View offering" target), `evaluations` (shared sheet, labels) → `public-evaluations`.

**Changes:**
- **Merged:** `extract-page-section` (`PageSection`), `extract-offering-list-parts` (`Pagination`, `entities/taxonomy`), `label-rating-badge` (tier words; pending merge per the board, already in `develop`'s `OfferingCard`), `fix-button-boundaries`.
- **add-evaluation-scales** (Apply): `BeanScale`, `IntensitySlider`, `DescriptorChipGroup` in `readOnly`. Waits for its merge.
- **add-specialist-evaluations** (Explore; contract now on `develop`): owns the CVA layout, the descriptor-row mapping, the `evaluations` catalog labels and the read-only view this change mirrors (Open 6). Its §1 still lists `listEvaluations` and `getAnEvaluation`; after the decisions log "lecturas de evaluaciones: decisión final" it consumes `listMyEvaluations` / `getMyEvaluation` instead (F1).
- **add-offering-catalog** (Summary — approved): the detail route `/{locale}/offerings/{ulid}` that "View offering" opens; the single-offering fetch (Open 7).
- **add-filter-controls:** no facets here (decisions log "filtros").

**Backlog:** R1, R3, R4, R5 do not name this change. `RetryButton` reuse (Open 8) is a new candidate.

**Decisions log entries applied:** D14; "lecturas de evaluaciones: decisión final" (public reads, no evaluator exposed); "filtros" (no sidebar here); "piezas extraídas disponibles"; "primitivo compartido de sección"; "medias SCA … escala de granos" and "estilo de la pestaña futura" (read-only beans as the shared evaluation look); "landing D4" (tier words).

**Contract coverage:** with this change, `listEvaluations`, `getAnEvaluation` and `listTheEvaluationsOfAUser` are consumed. The board's coverage table needs the new rows (F2).

## 11. Tests (expected coverage)

- **Fetch builders (pure functions):** the public list `GET /evaluations?status=closed&orderBy=created_at&orderDirection=desc&page={n}`; the specialist list `GET /users/{ulid}/evaluations?…` with the same query; the view `GET /evaluations/{ulid}`; non-2xx and transport failures map to error; a `404` of the specialist list maps to not-found.
- **Offerings per row:** one request per distinct `offeringId`; a failed one gives that row `offeringUnavailable` without captions or "View offering", others unaffected.
- **List presentation (sync):** rows with score row (absent when `cuppingScore` is null), tier word, heading, captions, meta line with the locale date and the extraction label, defective mark only when `isDefective`; links to `/es/evaluations/{ulid}` and `/es/offerings/{offeringId}` with unique names; empty and error states; `Pagination` with the route path.
- **View presentation (sync):** header (h1, captions, closed date, View offering link); context card rows; the eight groups in CVA order; scales `readOnly` with `valueText`/`valueLabel`; descriptors in their blocks by `type`, unresolved `ref` skipped, `noDescriptors`; notes only when non-null; extrinsic rows only when non-null; an `open` evaluation → not-found; the error state with Retry and the back link; below `md` the group toggle with `aria-expanded`.
- **Catalog guard:** the `public-evaluations` area in es, en and ca with the same keys.
- **Contrast guard:** the pairs of §5 not yet registered when this change lands.
- **Layout classes:** exact classes per §6, asserted as chosen.
- **Verification task:** captures of `/es/evaluations`, `/es/specialists/{ulid}` and `/es/evaluations/{ulid}` at 375px and 1280px in both themes, with a local read mock.

## 12. Findings on existing code and records

- **F1: `add-specialist-evaluations` summary §1 and §6 still describe the public reads.** Its table lists `listEvaluations` (with `evaluatorId`) and `getAnEvaluation` for its own list and edit, while its answer 6 and the decisions log moved them to `listMyEvaluations` / `getMyEvaluation`. Semantic contradiction inside an approved summary where the later answer is explicit: the orchestrator may fix the wording (`.claude/CLAUDE.md` §3) before its propose.
- **F2: board coverage table out of date.** `docs/change-progress.md` counts 23 operations and assigns `listEvaluations` / `getAnEvaluation` to `add-specialist-evaluations`; today's contract has 26 *(computed from the `operationId` list of `contracts/openapi.yaml`)*, adding `listMyEvaluations`, `getMyEvaluation`, `listTheEvaluationsOfAUser`. Path: board update (orchestrator).
- **F3: `listTheEvaluationsOfAUser` documents its `404` only in the description**, not as a response. The front follows the description (§2). Report to Product owner for the Scribe annotations.
- **F4: `getAnEvaluation` publicly returns open (draft) evaluations** (contract example `status: open`). The front hides them (Open 4); whether the API should is Product owner's call for the API.

## Open

1. **Entry point of the public evaluations list.**
   - Question: `/{locale}/evaluations` is new; nothing links to it.
   - Options:
     - (a) A third header entry "Evaluations" in `PrimaryNav` (an `app-shell` delta in this change: entry, `shell` catalog key, the "Primary navigation" requirement and its tests; shown from `md` like the other two).
     - (b) A link from the offering detail (add-offering-catalog) — but `listEvaluations` has no offering filter (`coffeeId` + `locationId` only approximates it).
     - (c) No entry: reachable by URL and from the specialist page only.
   - Recommendation: (a). The list is a public page of the same weight as "Top rated" and "About us"; the delta reuses the existing entry treatment and adds no token. Source: `PrimaryNav.tsx:51-58`; `app-shell` spec "Primary navigation".
   - Blocks propose: yes (it decides whether this change carries an `app-shell` delta).
2. **Entry point of a specialist's page.**
   - Question: no public response exposes a specialist's ULID, so only the specialist's own session can build `/{locale}/specialists/{ulid}`. Where is that link?
   - Options:
     - (a) In the specialist's "My evaluations" management list header, a link "View my public page" (touches `add-specialist-evaluations`' list; added by whichever of the two changes lands second).
     - (b) In the account page's Profile section, for role `specialist` (touches `add-user-account`).
     - (c) A user-menu entry for specialists (an `app-shell` delta).
     - (d) No entry: the page exists for shared URLs only.
   - Recommendation: (a): the link sits where the specialist manages the evaluations it lists, and needs no shell change. Source: decisions log "lecturas de evaluaciones: decisión final" (the evaluator is not exposed publicly).
   - Blocks propose: yes (it decides which other change's files this one touches).
3. **Specialist route name.**
   - Options: (a) `/{locale}/specialists/{userUlid}`; (b) `/{locale}/evaluations?specialist={userUlid}` on the list route.
   - Recommendation: (a): one route per operation and a documented 404 for an unknown user.
   - Blocks propose: no (the body follows (a)).
4. **Open (draft) evaluations.**
   - Options: (a) closed only: both lists send `status=closed`; an open evaluation opened by URL shows the 404 page; (b) show both, with the status badge.
   - Recommendation: (a). A draft is not a result, and the specialist's own drafts already live in management. Source: decisions log ("the read-only view stays for the user's own closed evaluations"); F4.
   - Blocks propose: no (the body follows (a)).
5. **Order and date of the lists.**
   - Options: (a) `orderBy=created_at desc`, showing `closedAt` as the row date; (b) the same order showing `createdAt`; (c) by `cupping_score desc`.
   - Recommendation: (a). The contract has no `closed_at` sort; for closed evaluations the closing date is the meaningful one, and creation order approximates it *(unverified: an evaluation may stay open for days)*.
   - Blocks propose: no.
6. **One read-only evaluation presentation and one row card, shared with `add-specialist-evaluations`.**
   - Question: that change shows the user's own closed evaluations read-only "with the same layout as the form without actions" (its §9) and a row card in its list (its §9 "List page"). A second copy here breaks criterion C.
   - Options:
     - (a) Two widgets, `src/widgets/evaluation-sheet` (read-only view: context card and group cards) and `src/widgets/evaluation-list` (row card with an actions slot, the list presentation), plus the descriptor-row mapping in `src/entities/taxonomy` and the date formatter in `src/shared/lib`. Whichever of the two changes is proposed first builds them; the other reuses them.
     - (b) A refactor change first that extracts them.
     - (c) Each change its own copy, with a backlog entry.
   - Recommendation: (a). `add-specialist-evaluations` is likely first (its contract is on `develop`); the orchestrator passes this to its propose so its read-only view is built as the widget. Source: criterion C; FSD (a feature cannot be imported by another page's feature; a widget can).
   - Blocks propose: no (it orders the work; the files are named either way).
7. **Single-offering fetch location.**
   - Question: add-offering-catalog places its detail fetch in `src/widgets/offering-detail` (its §3), where this change and `add-specialist-evaluations` cannot import it.
   - Options: (a) the fetch lives in `src/entities/offering/api` (as `entities/taxonomy` holds its fetch), built by the first of the three changes; (b) a copy per change.
   - Recommendation: (a), passed to add-offering-catalog's propose. Source: decisions log "piezas extraídas disponibles" (same pattern); criterion C.
   - Blocks propose: no.
8. **Retry on server-rendered lists.** `RetryButton` (`router.refresh()`) lives in `src/widgets/offering-list`, out of reach of another widget.
   - Options: (a) move `RetryButton` to `@/shared/ui` in the first change that needs it outside landing, and add a backlog entry now; (b) a second copy.
   - Recommendation: (a). `add-specialist-evaluations` (its answer 7) and this change both need it.
   - Blocks propose: no.
9. **Back link destination of the evaluation view.**
   - Options: (a) `/{locale}/evaluations`, plain; (b) browser history back (also returns to a specialist page or a catalog detail); (c) a `back` query, as the MVC (`show.blade.php:3`).
   - Recommendation: (a), as add-offering-catalog Open 8: predictable, no query mechanism.
   - Blocks propose: no.
10. **Extraction method labels.** The value is a free string (contract), shown in `add-specialist-evaluations` through catalog labels of its fixed list (its answer 3).
    - Options: (a) the label from the `evaluations` area when the value is in that list, the API value as returned otherwise; (b) always the API value.
    - Recommendation: (a): consistent with the owner's screens and safe for unknown values.
    - Blocks propose: no.
11. **Texts.** The keys and strings of §8 are proposals; Product owner confirms or edits them. The specialist heading cannot show a name (no public source).
    - Blocks propose: no.
12. **Visual reference.** The MVC has no public evaluation screen; the ASCII mock-ups of §6.5 stand until the verification captures.
    - Options: (a) accept the mock-ups; (b) a capture of the MVC `evaluations.show` (management) as the nearest reference.
    - Recommendation: (a), plus (b) for spacing only.
    - Blocks propose: no.

## Review log

- 2026-10-06, design lead, generation mode.
  - **Settled from sources (criterion B):**
    - the three operations and their screens from the contract and the decisions log "lecturas de evaluaciones: decisión final" (public, anonymous, no evaluator exposed);
    - offering names per row and in the view from `getAnOffering`, as `add-specialist-evaluations` §1 does (the evaluation carries only `offeringId`);
    - server fetching for every operation (all public, `.claude/CLAUDE.md` §2);
    - the specialist list through `listTheEvaluationsOfAUser` rather than `listEvaluations?evaluatorId=`, for its documented 404;
    - the view's groups, layout and spacing from `add-specialist-evaluations` §2, §3, §9 (its read-only variant), and the scales' `readOnly` modes from `add-evaluation-scales` §1–§3;
    - the score badge in the context card on `surface-card`, following MVC `technical-info.blade.php:27-33`, which keeps the badge on an already measured surface;
    - the error-state rule for an undocumented 404 from add-offering-catalog Open 7; `notFound()` only where the contract documents a 404;
    - reuse of `PageSection`, `Pagination`, `Card`, `Badge`, `Link`, `ratingTierFor`, `entities/taxonomy`.
  - **Not measured in this session** (no shell): every ratio in §5 is quoted from the cited summary or left to the guard; the per-surface value of `text-label` / `surface-section` is unverified.
  - **Blocking points:** Open 1 and Open 2 (entry points; each decides a delta in another capability or change).

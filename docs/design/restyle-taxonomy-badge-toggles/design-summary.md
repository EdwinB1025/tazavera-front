Status: approved

# Design summary — restyle-taxonomy-badge-toggles

Change-id provisional (Open 7 proposes `refine-taxonomy-tree-toggle`). Type: `Change` (section 12).

## 1. Goal

Product owner, 2026-11-11 (verbatim): "I would like the colapse and expand bottons of the taste badges in the commong taxonomy dipslay components to have the same color format, will it be possible to have them just in white will it comply the constrast rules, and reduce it sizes and located at the end of teh badge separating it from the text?"

Four asks:
1. One colour format for the +/− toggle on every taxonomy badge.
2. Is white compliant? (answered in section 4: **no**)
3. A smaller toggle.
4. The toggle at the end of the badge, visibly separated from the name.

## 2. Scope

- In: `TaxonomyTreeToggle` (its size, radius, colours and hit area) and the toggle-bearing badge in `NoteRow` of `TaxonomyTree` (the gap between name and toggle, and the badge's end padding).
- Out: `Badge.tsx` and the other badge variants; the leaf badges (no toggle); the label colour rule (`taxonomy-color.ts`); the tree layout, open/close behaviour, accessible names, catalogs; the flavor wheel; the descriptor cascade of the evaluation form; tokens in `globals.css` (none added or changed with the recommended option); API requests.

## 3. Findings on the current code (read on `develop`)

- `src/shared/ui/TaxonomyTreeToggle.tsx`: `inline-flex size-6 shrink-0 items-center justify-center rounded-field border border-current type-button focus-visible:focus-ring`. So it is 24×24px, 8px radius (0 in the dark theme), a 1px border, and a `+` or `−` (U+2212) text glyph in `type-button` (0.875rem, weight 600, line-height 1.5). The glyph is `aria-hidden`. There is no fill and no hover. Settled by collapse-taxonomy-trees D4 and unify-taste-trees D2.
- `border-current` makes the border and glyph take the badge's label colour. The label is white or black per badge, theme and surface, by the luminance rule (`taxonomy-color.ts`; feedback spec "Taxonomy badge": white when L ≤ 0.179). **That is why the toggles differ today:** in the traditional theme, 24 of the 36 toggle-bearing notes get a black toggle and 12 get a white one (computed, section 4.3).
- `src/shared/ui/TaxonomyTree.tsx` `NoteRow`: `<Badge variant="taxonomy">` holds `<span>{label}</span>` and then the toggle (unify-taste-trees D1). The toggle is already the badge's last child. Today the gap is the badge geometry's `gap-1` (0.25rem) and the end padding is `px-2` (0.5rem) (`BADGE_GEOMETRY_CLASSES` = `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`).
- Badge height (computed): a leaf badge is 21px of line height plus 2 × 2px padding = **25px**. A badge with today's 24px toggle is 24 + 4 = **28px**, so toggle-bearing badges stand 3px taller than leaf badges.
- No test pins the toggle's classes (`TaxonomyTreeToggle` and `TOGGLE_CLASSES` appear in no test under `src/` or `qa/`). Spec scenarios assert the visible text `+`/`−`, the position "inside its own badge, right after the note's name", and the accessibility attributes.
- `cn` (`src/shared/lib/utils.ts`) only joins classes; it has no tailwind-merge. An override passed to `Badge` through `className` therefore sits next to `px-2`/`gap-1` and does not replace them (section 6, note for the architect).

## 4. Colour (the answered question)

### 4.1 Method

- **Script:** `docs/design/restyle-taxonomy-badge-toggles/toggle-contrast.mjs`, run with Node 24 on `tazavera-api/database/seeders/data/taxonomia-sensorial-semilla.csv`. That file holds the 120 taxonomy nodes; the API serves its `color` column as `color` in `TaxonomyResource`.
- **Rendered badge background:** the data colour at its depth opacity (1, 0.92, 0.85 for levels 0, 1, 2) blended over `surface-card` (`#f2e8d9` traditional, `#0d1b1e` dark). This is the same blend `taxonomy-color.ts` uses.
- **Surface check:** every `TaxonomyTree` sits on `surface-card`: the offering card, the offering detail's `Card` and section-card bodies, and the evaluation sheet's `SheetCard`. None sits inside `variant-inverse`, so the sidebar surfaces do not apply.
- **Gate:** 3:1, the gate `theme-tokens.test.ts` applies to `icon` and `bound` pairs (`threshold()`). The glyph carries information (open or closed) and the border is the button's boundary.
- **States:** rest only. The toggle has no hover. Its focus ring (`focus-ring`) is token-to-token and already gated.
- **Notes measured:** the 36 nodes with children, the only ones that render a toggle. The results over all 120 nodes are in the script output.
- **Unverified:** these are seed values, not a live `GET /taxonomies`.

All ratios below are **computed by the design lead** with that script.

### 4.2 Answer: white fails

A white glyph and border is **not compliant**. It fails 3:1 on **12 of 36** toggle-bearing notes in the traditional theme (lowest **1.86:1**) and on **10 of 36** in the dark theme (lowest **2.13:1**).

No single flat colour can pass, whether white, black or any token. The rendered toggle-bearing backgrounds span luminance 0.028–0.516 (traditional) and 0.028–0.442 (dark). A colour reaching 3:1 against the darkest would need L ≥ 0.184, and one reaching 3:1 against the lightest would need L ≤ 0.139 (traditional) or ≤ 0.114 (dark). No colour meets both. So §11 step 3, a new primitive for a flat glyph, cannot fix it either.

One colour format on every badge is possible only if the toggle carries **its own fill**: the glyph then sits on a constant fill, and the boundary is made by the fill on dark badges and by the ring on light badges (section 4.4).

### 4.3 White glyph and border, per toggle-bearing note

| Id | Note (en) | Level | Data colour | Badge, traditional | White, traditional | Badge, dark | White, dark | Label today (trad/dark) |
|---|---|:-:|---|---|--:|---|--:|---|
| 1 | Fruity | 0 | #a4485c | #a4485c | 5.74 | #a4485c | 5.74 | white/white |
| 2, 7, 10, 19 | Berry, Dried Fruit, Other Fruit, Citrus Fruit | 1 | #af5e70 | #b46978 | 4.01 | #a25969 | 5.04 | black/white |
| 24 | Sour/Acid | 0 | #c2b34a | #c2b34a | **2.13 fail** | #c2b34a | **2.13 fail** | black/black |
| 25 | Sour Aromatics | 1 | #c9bc60 | #ccc06a | **1.86 fail** | #baaf5b | **2.24 fail** | black/black |
| 31 | Alcohol/Fermented | 0 | #7d4a6f | #7d4a6f | 6.82 | #7d4a6f | 6.82 | white/white |
| 32, 35 | Alcohol, Fermented | 1 | #8d6080 | #956b87 | 4.44 | #835a78 | 5.68 | black/white |
| 37 | Green/Vegetative | 0 | #5f8a53 | #5f8a53 | 4.00 | #5f8a53 | 4.00 | black/black |
| 40 | Green | 1 | #729868 | #7c9e71 | 3.01 | #6a8e62 | 3.71 | black/black |
| 49 | Earthy | 0 | #7a5c43 | #7a5c43 | 6.11 | #7a5c43 | 6.11 | white/white |
| 50 | Musty/Earthy | 1 | #8a705a | #927a64 | 4.05 | #806955 | 5.16 | black/white |
| 57 | Roasted | 0 | #4a2510 | #4a2510 | 13.43 | #4a2510 | 13.43 | white/white |
| 58, 60, 64 | Tobacco, Burnt, Roasted | 1 | #603f2d | #6c4d3b | 7.60 | #593c2c | 9.96 | white/white |
| 66 | Spices | 0 | #b0623a | #b0623a | 4.51 | #b0623a | 4.51 | black/black |
| 69 | Brown Spice | 1 | #b97552 | #be7e5d | 3.32 | #ab6e4e | 4.14 | black/black |
| 74 | Nutty | 0 | #a5804f | #a5804f | 3.62 | #a5804f | 3.62 | black/black |
| 75 | Nutty | 1 | #b08f64 | #b5966d | **2.78 fail** | #a3865e | 3.43 | black/black |
| 79 | Cocoa | 0 | #6b4226 | #6b4226 | 8.63 | #6b4226 | 8.63 | white/white |
| 80 | Cocoa | 1 | #7d5940 | #86644c | 5.33 | #74543d | 6.82 | white/white |
| 83 | Sweet | 0 | #c99a4b | #c99a4b | **2.56 fail** | #c99a4b | **2.56 fail** | black/black |
| 84, 90, 92 | Sweet, Vanilla, Sweet Aromatics | 1 | #cfa661 | #d2ab6b | **2.15 fail** | #bf9b5c | **2.61 fail** | black/black |
| 94 | Floral | 0 | #c489a0 | #c489a0 | **2.83 fail** | #c489a0 | **2.83 fail** | black/black |
| 95 | Floral | 1 | #cb97ab | #ce9daf | **2.32 fail** | #bc8da0 | **2.82 fail** | black/black |
| 100 | Stale/Papery | 0 | #8a8577 | #8a8577 | 3.68 | #8a8577 | 3.68 | black/black |
| 101 | Stale | 1 | #989487 | #9f9b8e | **2.78 fail** | #8d8a7f | 3.46 | black/black |
| 104 | Chemical | 0 | #5c7080 | #5c7080 | 5.14 | #5c7080 | 5.14 | white/white |
| 111 | Cereal | 0 | #b8a06a | #b8a06a | **2.54 fail** | #b8a06a | **2.54 fail** | black/black |
| 112 | Grain | 1 | #c1ab7c | #c5b083 | **2.12 fail** | #b39f74 | **2.58 fail** | black/black |
| 115 | Mouthfeel | 0 | #6b6f76 | #6b6f76 | 5.05 | #6b6f76 | 5.05 | white/white |

Rows that share a data colour and level are merged. The 36 notes fail as follows:
- **traditional, 12 fail:** 24, 25, 75, 83, 84, 90, 92, 94, 95, 101, 111, 112;
- **dark, 10 fail:** the same notes except 75 and 101.

### 4.4 Alternatives with one colour format, measured on existing semantic tokens

Minimum over the 36 toggle-bearing notes, and how many fail 3:1. Flat options colour only the glyph and the border. Chip options add an opaque fill, with the glyph and a 1px ring in one token. A chip's boundary is the better of fill-vs-badge and ring-vs-badge (Open 2).

| Option | Theme | Glyph vs its background | Boundary vs badge (min) | Fails |
|---|---|--:|--:|--:|
| Flat white (literal; also `text-input-icon` in trad) | trad / dark | 1.86 / 2.13 | same | 12 / 10 |
| Flat `nav-text-dark` / `action-primary-text` (cream) | trad / dark | 1.53 / 1.79 | same | 15 / 12 |
| Flat `nav-toggle-icon` | trad / dark | 1.53 / 1.60 | same | 15 / 15 |
| Flat `text-strong` | trad / dark | 1.04 / 1.79 | same | 11 / 12 |
| Flat `text-primary` | trad / dark | 1.02 / 1.60 | same | 27 / 15 |
| Flat black (literal) | trad / dark | 1.56 / 1.56 | same | 5 / 5 |
| Today: label colour (`border-current`), white or black per badge | trad / dark | 4.65 / 4.65 | same | 0 / 0 |
| Translucent fill `nav-toggle-bg`, glyph `nav-toggle-icon` (the header menu toggle pair) | trad / dark | 3.45 / 1.49 | 2.09 / 1.60 | 15 / 15 boundary |
| Chip `nav-surface-dark` + white glyph and ring | trad / dark | 7.78 / 16.34 | 2.80 / 4.08 | 3 / 0 (75, 94, 101) |
| Chip `nav-surface-dark` + `nav-text-dark` | trad / dark | 6.41 / 13.69 | 2.59 / 3.78 | 6 / 0 |
| Chip `surface-card` + `text-primary` | trad / dark | 6.41 / 13.22 | 2.59 / 3.78 | 6 / 0 |
| **Chip `surface-card` + `text-strong`** | trad / dark | **11.53 / 14.75** | **3.46 / 3.90** | **0 / 0** |
| **Chip `surface-textarea` (white in trad) + `text-strong`** | trad / dark | **13.98 / 15.93** | **3.80 / 4.22** | **0 / 0** |

Two existing-token chips pass on every toggle-bearing badge in both themes, at least at gate + 0.1. They also pass on all 120 badges (min 3.46 / 3.89 and 3.75 / 4.06). §11's procedure (new primitive and token) is therefore **not** followed.

What each looks like:
- **`surface-card` + `text-strong`:**
  - traditional: a cream chip (`#f2e8d9`) with a dark petrol glyph and ring (`#1a2f35`);
  - dark: a near-black chip (`#0d1b1e`) with a cream glyph and ring (`#f2eadd`).
  - The chip reads as a window onto the card the badge sits on.
- **`surface-textarea` + `text-strong`:** the same, but white (`#ffffff`) in traditional and `#051215` in dark. This is the closest compliant option to "white". It borrows the textarea surface token outside its role.

Guard registration: the glyph pair `text-strong` on `surface-card` is already registered in both themes as `text` (4.5:1), which covers the icon gate. `text-strong` on `surface-textarea` is not registered: with option D, register it as `icon` in both matrices. The boundary pairs involve data colours, which the token matrix cannot hold, so nothing else is registered.

## 5. Components and FSD placement

- `src/shared/ui/TaxonomyTreeToggle.tsx` (shared): new classes (section 6). Behaviour, props, accessible names, `aria-expanded`, `aria-controls` and the `aria-hidden` glyph are unchanged (collapse-taxonomy-trees D4).
- `src/shared/ui/TaxonomyTree.tsx` `NoteRow` (shared): the toggle-bearing badge gets the new gap and end padding. Leaf badges are unchanged.
- No new component and no change to `Badge.tsx`. Nothing is duplicated (criterion C).

## 6. Layout and spacing (criterion A), end state

**Toggle (recommended, Open 1 C + Open 3 A + Open 4 A):**

| Property | Today | Proposed |
|---|---|---|
| Visible box | 24 × 24px | **16 × 16px** (same box as `Checkbox`) |
| Hit area | 24 × 24px | **24 × 24px**, centred on the box, invisible, extending 4px on each side (Open 3) |
| Radius | `radius-field` (8px; 0 dark) | **`radius-check`** (4px; 0 dark), as `Checkbox`'s 16px box. With `radius-field` a 16px box would read as a circle |
| Border | 1px, all sides, label colour | **1px, all sides, `currentColor` = `text-strong`** |
| Fill | none | **`surface-card`** |
| Glyph | `+` / `−` text, `type-button` (0.875rem, 600), label colour | **unchanged text glyph and size**, colour `text-strong`. Its drawn extent is about 8px inside the 14px inner box (estimate, unverified until the visual review). Open 6 offers icons instead |
| Hover | none | none |
| Focus | `focus-ring` | unchanged |
| Padding | 0 (glyph centred) | 0 (glyph centred) |

**Toggle-bearing badge:**

| Property | Today | Proposed |
|---|---|---|
| Gap, name to toggle | 0.25rem | **0.5rem** (Open 4) |
| Start padding | 0.5rem | 0.5rem (unchanged) |
| End padding | 0.5rem | **0.25rem** (Open 4): the 16px toggle then sits 4px from the badge's end, matching its 4.5px inset top and bottom (computed: (25 − 16) / 2), so it reads as an end cap |
| Vertical padding | 0.125rem | 0.125rem (unchanged) |
| Height | 28px | **25px** (computed), the same as a leaf badge, so rows of mixed badges line up |
| Radius, text treatment, background, label colour | — | unchanged |

- Leaf badges and every container (trees `gap-3`, level-1 column `gap-2` with connector, level-2 row `gap-1.5`, share row `gap-2`) are unchanged.
- **Note for the architect:** `cn` does not merge, so `gap-1`/`px-2` from `BADGE_GEOMETRY_CLASSES` and an override would both be in the class list. The values above are the end state; the architect picks a mechanism that guarantees them (for example a margin on the toggle, or a dedicated geometry for toggle-bearing badges). Unverified: which Tailwind 4 utility wins when `px-2` and `pr-1` are both present.

## 7. States, accessibility and tokens

- **States:** closed (`+`) and open (`−`), focus-visible. No hover, no disabled.
- **Accessible names:** unchanged (`landing.treeShowNotesLabel` / `treeHideNotesLabel` with `{label}`).
- **Target size:**
  - No spec in `openspec/specs/` states a minimum target size.
  - The project's practice is WCAG 2.5.8's 24px for interactive controls: collapse-taxonomy-trees D4 ("the 24px target matches the minimum target size"); add-evaluation-scales, where the 16px bean is allowed only read-only; add-form-fields and add-flavor-wheel.
  - The recommended toggle therefore keeps a 24 × 24px hit area (Open 3). It fits inside the 25px badge height. Sideways it covers 4px of the 8px gap (not the name) and the 4px end padding.
- **Tokens:**
  - recommended: `bg-surface-card` and `text-text-strong` with `border-current`;
  - option D: `bg-surface-textarea` instead of `bg-surface-card`.
  - No new token. No colour literal (option A's white would be a literal).

## 8. Texts

None added or changed.

## 9. Responsive behaviour

The same at every breakpoint. A toggle-bearing badge gets 3px shorter (25px instead of 28px) and 8px narrower (computed: −8px of toggle, +4px of gap, −4px of end padding). The trees still wrap within their container, so nothing overflows at 375px. That claim is unverified until the visual review.

## 10. Visual reference

- No MVC reference: the MVC has no collapsible trees. `../../Sprint4/MVC/tazavera-app` could not be read in this session (read permission), so this is unverified.
- No mock-up produced. Captures at 375px and 1280px, both themes, belong to the visual review (3a-8).

## 11. Where the toggle renders (every `TaxonomyTree` consumer)

| Consumer | Route / place | Share |
|---|---|---|
| `src/entities/offering/ui/OfferingCard.tsx` via `widgets/offering-list` `OfferingList` | `/{locale}` (verified offerings), `/{locale}/offerings`, `/{locale}/coffeeshops/{ulid}` (Offerings tab) | no |
| `OfferingCard.tsx` via `pages/manage-offerings` `OwnOfferingsGrid` | `/{locale}/manage/offerings` | no |
| `src/widgets/offering-detail/ui/SelectionBlock.tsx` (Main tastes, Defects) | `/{locale}/offerings/{ulid}`, Consensus tab | yes |
| `src/widgets/offering-detail/ui/AxisDetail.tsx` (detail by axis, five section cards) | `/{locale}/offerings/{ulid}`, Consensus tab | yes |
| `src/widgets/evaluation-sheet/ui/EvaluationSheetDescriptors.tsx` via `EvaluationSheetView` | `/{locale}/evaluations/{ulid}` (public evaluation view) | no |
| `EvaluationSheetDescriptors.tsx` via `EvaluationSheetBaseline` | `/{locale}/offerings/{ulid}`, provisional evaluation tab | no |

All of them render through the one shared component, so the change touches no consumer.

## 12. Change type, capabilities and spec requirements

**Type: `Change`.** It changes what users see (colour, size, spacing) and has an open colour decision for Product owner. Either one rules out the fast lane (workflow §3: "a behaviour or design change … or an open decision").

**Capability: `landing`.** It owns "Taxonomy badge trees on the offering card", the requirement that defines the toggle and that `offering-catalog` and `evaluations` reference. Commit scope: `landing`.

Requirements touched:
- `landing` — "Taxonomy badge trees on the offering card".
  - Recommended MODIFIED: the toggle sits **at the end of** its badge, separated from the name. It also renders in **one colour treatment on every badge**, with its glyph and boundary at least 3:1 against the badge in both themes.
  - Recommended scenario: "Toggle at the end of its badge", asserting the toggle is the badge's last child and its classes. One test (Open 5).
  - Today's wording "right after the note's name" stays true but does not state the separation.
- `offering-catalog` — "Consensus Defects and Main tastes" and "Consensus detail by axis": reference landing's trees and repeat "inside its badge, right after its name". No change needed if landing's wording stays compatible (Open 5).
- `evaluations` — "Read-only evaluation presentation": same as offering-catalog.
- `feedback` — "Badge presentation", "Taxonomy badge" and "Badge label contrast": unchanged. The label rule and the badge's own padding are not modified; only the toggle-bearing badge in the tree gets its own gap and end padding.

Design decisions superseded: collapse-taxonomy-trees D4 (classes and the 24px target statement) and unify-taste-trees D2 (`border-current` taking the label colour). unify-taste-trees D1 (the toggle inside the badge after the name) stands.

Tests: no existing test pins the toggle's classes. The change adds one test, for the new or modified scenario. Existing scenario tests keep their assertions.

## 13. Dependencies

- Builds on the archived collapse-taxonomy-trees and unify-taste-trees.
- Backlog entries touched: none.
- Board: R91 (`add-register-landing`) also carries `landing`, but its files are `HomeHero`, `AboutContent`, the header and `/join`, which do not overlap. `git merge-tree` not run (no branch yet).
- No contract operation is consumed.

## Open

1. **Which single colour format should the toggle use?** Blocks propose: **yes**.
   - A. White glyph and border (literal). Not compliant: fails on 12/36 (trad) and 10/36 (dark), lowest 1.86:1 (section 4.3).
   - B. Keep today's label colour (`border-current`). Compliant (min 4.65:1), but white or black per badge, which is the inconsistency Product owner sees.
   - C. Chip with `surface-card` fill, `text-strong` glyph and 1px ring. Compliant everywhere (min 3.46 / 3.90), existing tokens only.
   - D. As C with a `surface-textarea` fill: a white chip in the traditional theme. Compliant (min 3.80 / 4.22), closest to "white"; borrows the textarea surface token outside its role and registers `text-strong` on `surface-textarea` as `icon`.
   - E. White glyph and ring on a dark chip (`nav-surface-dark`). Fails on 3 notes in trad (75 Nutty L1 2.80, 94 Floral 2.83, 101 Stale 2.80); making it pass needs a new primitive and token through §11. Not prepared, because C and D already pass.
   - **Recommendation:** C, the only compliant single format built from tokens used in their own role (section 4.4). D if Product owner wants the white look in the traditional theme.
   - **Answer (Product owner, 2026-11-11): C**, the chip filled with the card's background (`surface-card`), `text-strong` glyph and 1px ring.
2. **Can a two-tone boundary count?** Blocks propose: **yes** (C, D and E rest on it).
   - With a chip, the fill gives the boundary on dark badges and the 1px ring gives it on light ones. Section 4.4 counts the boundary as met when either reaches 3:1 against the badge. This is the design lead's reading of WCAG 2.2 SC 1.4.11, not a gate `theme-tokens.test.ts` encodes, because data colours are not in the matrix.
   - Options: A. accept the reading (rec.); B. require one element alone at 3:1 everywhere. Then no single format passes and only option 1B (today's colours) is compliant.
   - **Answer: A, implied by choosing 1C** (C rests on it). Recorded by the orchestrator; Product owner's approval commit confirms it.
3. **Hit area of the 16px toggle.** Blocks propose: no.
   - A. Keep a 24 × 24px invisible hit area around the 16px box (rec.; project practice, section 7).
   - B. Rely on the WCAG 2.5.8 spacing exception: the closest pair of toggle centres is 33px apart (25px badge + 8px column gap, computed), more than 24.
4. **Size and placement values.** Blocks propose: no.
   - Size: A. 16px box (rec., badge height becomes equal to leaf badges); B. 20px box (badge also 25px, smaller step).
   - Gap to the name: A. 0.5rem (rec.); B. 0.375rem; C. 0.5rem plus a 1px divider in `currentColor` before the toggle (decorative, not gated).
   - End padding: A. 0.25rem when the badge has a toggle (rec., an even 4px inset around the toggle); B. keep 0.5rem.
5. **Spec delta.** Blocks propose: no (the architect's call).
   - A. MODIFIED landing "Taxonomy badge trees on the offering card" with the end-of-badge position, the single colour treatment and the 3:1 contrast, plus one scenario and one test (rec.: it states the observable property the change establishes, and an OpenSpec change needs at least one delta; that last point is unverified).
   - B. No requirement change, design.md only.
6. **Glyph.** Blocks propose: no.
   - A. Keep the text `+`/`−` in `type-button` (rec.: the specs' scenarios read the visible text `+`/`−`; no spec or test change).
   - B. Lucide `Plus`/`Minus` from `@/shared/ui/icons` at 12px (`size-3`). This is crisper at 16px, but the scenarios' "visible text" and their tests would change in landing, offering-catalog and evaluations.
7. **Change-id.** Blocks propose: no (needed before the branch).
   - A. `refine-taxonomy-tree-toggle` (rec.: names the component, `TaxonomyTreeToggle`, and follows the project's `refine-*` changes);
   - B. keep `restyle-taxonomy-badge-toggles`.
   - If A, this folder moves to `docs/design/refine-taxonomy-tree-toggle/`.

## Unverified

- Colours are the API seed (`taxonomia-sensorial-semilla.csv`), not a live `GET /taxonomies`.
- The MVC could not be read (read permission outside the working directories).
- Rendering:
  - how the 14px glyph centres inside a 16px box;
  - which utility wins between `px-2` and `pr-1` without a merge;
  - no overflow at 375px.
  All three wait for the visual review.
- `git merge-tree` against R91: there is no branch yet.
- Whether `openspec validate --strict` accepts a change without a spec delta.

## Review log

- **2026-11-11 — generation (design lead).**
  - Drafted from Product owner's request, the code on `develop`, the archived collapse-taxonomy-trees (D3, D4) and unify-taste-trees (D1, D2), and the landing, offering-catalog, evaluations and feedback specs.
  - Contrast measured by `toggle-contrast.mjs` over the 120 seed colours (36 with a toggle).
  - Settled under criterion B: every consumer and its surface (all `surface-card`); the capability that owns the toggle (`landing`); the type (`Change`); the superseded decisions; and that §11's new-token procedure does not apply, because existing tokens pass.
  - Left open: 1–7.
- **2026-11-11 — Product owner's answer (recorded by the orchestrator).** Open 1: C. Open 2: A, implied by 1C. Open 3–7 not answered: their recommendations stand unless Product owner changes them before approving.

Status: approved — by the orchestrator on 2026-10-06 under Product owner's delegation during his pause ("si lo puedes resolver tú, resuélvelo"); every Open point takes the design lead's recommendation (see "Answered by the orchestrator" under Open). Product owner may reopen any of them.

# Design summary — add-flavor-wheel

Capability: `feedback` (proposed, see section 1.1 and Open 7). Change-id: `add-flavor-wheel`. Branch (when created): `feature/add-flavor-wheel`.

The design lead drafted this summary on 2026-10-06 in generation mode. Sources: Product owner's decision (decisions log, "catálogo: detalle y consenso; filtros: cascada y división"), `contracts/openapi.yaml` on `develop`, the API read-only (`tazavera-api`), the main specs in `openspec/specs/`, the code on `develop` and the MVC.

How numbers are marked:
- *(computed)*: geometry the design lead derived by arithmetic.
- *(measured, catalog §5)*: contrast ratios measured by the design lead's executed script for `add-offering-catalog`, and reused here.
- *(unverified)*: not checked.

No new contrast measurement was run in this pass, because the shell was not available. The design uses only token pairs that are already registered or already measured (section 5).

## 1. Scope

1. **A reusable interactive flavor wheel** in `src/shared/ui`: an SCA-style sunburst drawn in-house as SVG (no new dependency; orchestrator's decision in the log entry). It shows an offering's aromatic consensus.
   - Each segment is one taxonomy note.
   - The rings expand from the centre outward, one level at a time.
   - Every note's legend is "evaluators who identified it / total", for example `4/5`.
   - Hovering a note, or giving it keyboard focus, shows its olfactory-taxonomy description.
2. **A text alternative of the wheel.** It is a keyboard-operable tree of the same notes, with name, colour swatch and `n/total`. Colour is never the only carrier, and every note can be reached even when its segment is too small for a label (section 4.4, Open 1).
3. **The data mapping** from the API to the wheel: a pure helper in `src/entities/taxonomy`, plus the description added to the taxonomy lookup (section 3).

Out of scope:
- **Placing the wheel in the offering detail's Consensus tab.** `add-offering-catalog` owns it. It replaces that summary's §6.3 "Taste profile card" tree (catalog Open 6 answer), and the catalog depends on this change (general context, "Al retomar" 1).
- **Defects and main tastes.** Product owner decided they use the evaluation's selector components, read-only, with consensus legends (decisions log entry). That work belongs to `add-offering-catalog` together with the owner of those selectors. The wheel covers the aromatic set only (section 2.2).
- **`sensoryTaxonomy`.** It is per CVA attribute and counts the same evaluator once per attribute. The wheel does not read it (section 2.2).
- Zoom, animation, export, printing.

### 1.1 Capability

`openspec/config.yaml` lists no data-visualisation capability. Candidates:
- **`feedback` (proposed).** It already owns the taxonomy badge's data-colour rule, its depth opacities and the "Badge label contrast" requirement (`openspec/specs/feedback/spec.md`, "Taxonomy badge", "Badge label contrast"). The wheel's segment colours and labels follow that same rule, so one spec keeps the taxonomy colour treatment.
- `content-structure`: content containers (card, collapsible, tabs). The wheel's disclosure is like a collapsible, but its substance is taxonomy data in data colours.
- A new capability: `config.yaml` rule "Reuse an existing capability before creating a new one".

The decision stays with Product owner (Open 7).

## 2. Contract operations consumed

The component calls no operation. Its host (`add-offering-catalog`) loads both reads on the server with plain `fetch` (settled rule, `.claude/CLAUDE.md` §2) and passes resolved nodes as props.

| operationId | Route | Security | Fields used |
|---|---|---|---|
| `getAnOffering` | `GET /offerings/{offering_ulid}` | none | `evaluationCount`; `cataConcordance[]` nodes `{ref, type, level, count, children}` with `type = "aromatics"` |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | none | per node: `ulid`, `nameEs/En/Ca`, `descriptionEs/En/Ca`, `color` (`#RRGGBB`), `children` |

### 2.1 What `count` means (verified in the API, read-only)

The contract does not define `count` or `type`. The meaning below comes from `tazavera-api`.
- **Which evaluations count.** `OfferingConsensusService::recompute` (lines 27–34, 49) takes the offering's evaluations with `status = closed` and `evaluation_type = specialist`, and only when there are at least 5 of them. It then sets `evaluation_count` to their number.
- **How `count` is built.** `populateOfferingTastes` (lines 117–186) builds one row per `(taxonomy node, type)`. Its `count` is the number of distinct evaluations that marked that node or any of its descendants: marks propagate upward through `parent`, and evaluation ids are merged as set keys. A parent's `count` is therefore at least each child's, and every `count` is at most `evaluationCount`.
- **The `aromatics` group.** Marks of the types `fragrance`, `aroma`, `flavor`, `aftertaste` and `mouthfeel` (`OfferingTaste::AROMATIC_TYPES`, `OfferingTaste.php:21`) are also merged under `type = aromatics`, keyed by evaluation id. An evaluator who marks "Fruity" in both aroma and flavor counts once there.
- **What each field returns.** `cataConcordance` is the `cataAggregate` scope (`type NOT IN AROMATIC_TYPES`): the groups `aromatics`, `main_tastes` and `defects`. `sensoryTaxonomy` is `sensoryAxes` (`type != aromatics`): one tree per attribute type. Children share their parent's type (`resolveParentOfferingTasteId`).
- **The contract example is incomplete.** It shows only the types `flavor`, `aroma`, `main_tastes` and `defects`. The API also emits `fragrance`, `aftertaste` and `mouthfeel` (Finding F2).
- **Defaults.** `evaluation_count` defaults to 0 (offerings migration, line 23). Below 5 closed specialist evaluations, nothing is computed: `evaluationCount` is 0 and both trees are `[]` (contract example, provisional offering).

### 2.2 Which tree the wheel shows

The wheel shows **`cataConcordance` filtered to `type = "aromatics"`**, with `total = evaluationCount`.
- **Why that tree.** It is the only tree where one evaluator counts once per note across the aromatic attributes. `sensoryTaxonomy` would need summing across types, which double-counts.
- **Main tastes and defects.** They are the other two `cataConcordance` groups. They stay out of the wheel, as Product owner's decision gives them their own read-only selectors.
- **Mouthfeel.** The API merges `mouthfeel` marks into `aromatics`, so a "Mouthfeel" root can appear in the wheel (Open 6).
- **Level 2.** In practice the wheel will rarely show level 2: the evaluation form shows levels 0–1 only (general context, add-specialist-evaluations decisions), and the aggregation only goes upward. The geometry still supports levels 0–2, as the contract allows.

### 2.3 States

| Case | What the component shows |
|---|---|
| Loading | Not the component's. The host's detail skeleton covers it (catalog §2). |
| `total` 0, or no aromatics node, or no node resolved | The empty message (`texts.emptyMessage`) in place of the wheel, panel and tree (section 6.5). |
| Some refs unresolved | Those nodes and their subtrees are skipped. The rest renders normally (badge precedent, `openspec/specs/landing/spec.md` "Unresolved reference"; Open 5). |
| A node without description (`null` in the API seeder, `OlfactoryTaxonomySeeder.php:30-32`) | The panel shows name and count, with no description paragraph. |
| A node with an empty colour (`color` nullable in the seeder) | Treated as unresolved and skipped. The contract types `color` as a string. *(unverified that live data has none)* |
| Host fetch failure (offering or taxonomies) | The host's error state (catalog §2). The component never renders with a failed lookup. |

## 3. Routes and composition (FSD)

No route. The pieces:

| Layer | Piece | Notes |
|---|---|---|
| `src/shared/ui/FlavorWheel.tsx` | `FlavorWheel`, `"use client"` (event handlers and state; `client-boundary.test.ts`) | New. Exported from `src/shared/ui/index.ts`. |
| `src/shared/ui/flavor-wheel-geometry.ts` | Pure functions: layout, arc paths, label placement (section 4.2) | New. No React. |
| `src/shared/ui/Badge.tsx` | Exports its taxonomy colour rule as a pure helper. The wheel and the badge share one definition, and the badge's behaviour and tests stay unchanged (Open 8). | Modified. |
| `src/entities/taxonomy/model/lookup.ts` | `TaxonomyLookupEntry` gains `description: string \| null`, localized like `label` | Modified |
| `src/entities/taxonomy/model/flavor-wheel-nodes.ts` | `buildFlavorWheelNodes(cataConcordance, lookup, total, countLabel)` → `FlavorWheelNode[]` | New. Exported from `src/entities/taxonomy/index.ts`. |

`src/shared/ui` cannot import entities (FSD), so the component takes resolved, UI-only nodes. The resolution helper lives in the taxonomy entity, which may import the `@/shared/ui` type.

### 3.1 Props (UI-only types; no generated type is redefined)

```ts
export type FlavorWheelNode = {
  id: string;                 // taxonomy ulid
  name: string;               // localized name
  description: string | null; // localized description
  color: string;              // #RRGGBB data color
  level: 0 | 1 | 2;           // from the offering node's own level (landing D5 precedent)
  count: number;              // evaluators who identified the note
  countLabel: string;         // host-composed accessible text, e.g. "4 de 5 evaluadores"
  children: FlavorWheelNode[];
};

export type FlavorWheelTexts = {
  label: string;        // accessible name of the tree and caption of the figure
  hint: string;         // panel text before any note is active
  emptyMessage: string;
};

export type FlavorWheelProps = {
  nodes: FlavorWheelNode[]; // level-0 nodes, siblings already ordered
  total: number;            // evaluationCount
  texts: FlavorWheelTexts;
};
```

- **No `locale` prop.** Names, descriptions and `countLabel` arrive already localized. The visible `n/total` is two integers and needs no locale formatting. The host's helper takes the locale through `buildTaxonomyLookup(nodes, locale)`.
- **`countLabel`.** The host composes it from a catalog key with `{count}` and `{total}`. This is the bean scale precedent: the host composes `valueLabel` (add-evaluation-scales summary §3).
- **`buildFlavorWheelNodes`:**
  - keeps the `cataConcordance` roots whose `type` is `aromatics`;
  - resolves each `ref` through the lookup;
  - skips a node, with its subtree, when its ref is not found or its colour is empty;
  - orders siblings by taxonomy order: the insertion order of the lookup, which follows `GET /taxonomies` (Open 3);
  - fills `countLabel` with `countLabel(count, total)`.

## 4. Components and reuse

| Part | Component and variant | States | Accessible name / semantics |
|---|---|---|---|
| Root | `FlavorWheel` (new), a `<figure>` | empty / populated | `<figcaption>` visually hidden, with `texts.label` |
| Wheel graphic | inline `<svg>` with one `<path>` and an optional `<text>` per visible note | segment rest / active; parent collapsed / expanded | `aria-hidden="true"`: the tree is the accessible equivalent (Open 1) |
| Centre | `<text>` with `total` | — | covered by the tree's name, see section 8 |
| Description panel | plain `<div>` inside the root | hint / active note | the active treeitem's `aria-describedby` points at its description |
| Note tree | `<ul role="tree">` with flat `<li role="treeitem">` rows, using `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded` for parents (WAI-ARIA APG Tree View, flat form) | collapsed, expanded, active, hover, focus | `aria-label` = `texts.label`; each item's `aria-label` = "`name`, `countLabel`" |
| Chevron | `ChevronRight` (collapsed) / `ChevronDown` (expanded) from `@/shared/ui/icons` | — | `aria-hidden` (state is in `aria-expanded`) |
| Swatch | `<span>`, inline data colour | — | `aria-hidden` (decorative; the name carries the meaning) |
| Empty message | `<p className="type-body">` | — | text |

Reuse:
- **Badge colour rule.** The taxonomy colour rule of `Badge.tsx` (data colour, depth opacity 92% at level 1 and 85% at level 2, label white or black by the luminance of the blend over `surface-card` in each theme, the `[data-taxonomy]` rule in `globals.css:721-727`) applies to segments and swatches through the one exported helper (Open 8).
- **No copied badge.** No chip geometry is copied: the tree rows are not chips (decisions log, "geometría de chip compartida").
- **Icons and focus.** Icons come only through `icons.ts`, and the focus indicator is `focus-visible:focus-ring`.
- **Library check (criterion C).** Radix (`radix-ui` 1.6.x, installed) has no tree or sunburst primitive. Radix Popover could anchor a floating panel, but Open 4 recommends a static panel, which needs none. No new dependency, as the orchestrator decided.

### 4.1 Interaction

- **Initial state.** Only ring 0 (level 0) shows, and nothing is expanded ("expands from the centre outward", decisions log).
- **Expand and collapse.** Activating a note with children expands it: its children appear in the next ring, inside the parent's angular span, and in the tree under it. Activating it again collapses it and its descendants. Several notes may be expanded at once.
- **Active note.** The panel shows the most recent of these: the segment under the pointer, the focused treeitem, or the note last activated by click or tap. Before the first interaction, the panel shows `texts.hint`. Leaving the wheel with the pointer keeps the last active note, so the panel never flickers back to the hint.
- **Pointer on the wheel:**
  - Hovering a segment makes its note active.
  - Clicking or tapping a segment makes it active and, if it has children, toggles its expansion. It also makes that note the tree's roving-tabindex item, without moving focus.
  - Segments have `cursor-pointer`.
- **Keyboard on the tree** (APG Tree View; one Tab stop with roving `tabindex`):
  - Tab enters at the last active item, or at the first item.
  - Down / Up move to the next / previous visible item.
  - Right expands a collapsed parent. On an expanded parent, it moves to the first child.
  - Left collapses an expanded parent. On a child, it moves to its parent.
  - Home / End go to the first / last visible item.
  - Enter or Space toggles the expansion of a parent.
  - Escape collapses every note back to ring 0 and moves focus to the level-0 ancestor of the focused item (Open 11).
  - Focus makes the item's note active, so the panel and the segment highlight follow the keyboard.
- **No animation.** Expansion is instant (nothing to reduce for `prefers-reduced-motion`).

### 4.2 Geometry (pure functions; all values in SVG user units, *(computed)*)

- **viewBox:** `-204 -204 408 408`, constant. The outer radius is always 200 and the margin is 4. The SVG scales to its box (section 6.2).
- **Ring radii by the deepest level `D` present in `nodes`** (whole tree, not only the expanded part, so the wheel does not rescale while it expands):

  | D | Hole | Ring 0 | Ring 1 | Ring 2 |
  |---|---|---|---|---|
  | 0 | 0–40 | 40–200 | — | — |
  | 1 | 0–40 | 40–110 | 110–200 | — |
  | 2 | 0–40 | 40–100 | 100–150 | 150–200 |

- **Start angle and direction:** 12 o'clock, clockwise.
- **Segment sizing (proportional by count, Open 2):**
  - a root spans `360° × count / Σ(root counts)`;
  - a child spans `parent span × count / Σ(sibling counts)`, filling the parent's span.
  - A single root draws a full ring: two half-arcs, because a 360° SVG arc does not render as one arc command.
- **Separation:** each segment path has a 2-unit stroke in `stroke-surface-card`. It gives a 2-unit gap between neighbouring segments and between rings. It is decorative (section 5). Corners stay square (no corner radius).
- **Active segment:** the path of the active note is drawn last, with a 3-unit `stroke-text-primary` outline (highlight, not focus; section 5).
- **Labels:**
  - **Ring 0, tangential:** the baseline is perpendicular to the radius at the segment's mid-angle, centred at mid-radius, and rotated 180° when the mid-angle is between 90° and 270° (lower half), so it stays upright. Font size 13 units.
  - **Rings 1–2, radial:** the baseline runs along the radius at the mid-angle, centred at mid-radius, and flipped 180° in the left half (180°–360°). Font size 12 units.
  - **Content:** line 1 is the name; line 2 is `count/total`. Line height 1.2 × font size.
  - **Fit rule.** Text width is estimated as `characters × 0.6 × font size` (approximation, *(unverified)* until the visual review).
    - *Tangential:* the longest line must fit within `2 × midR × sin(Δθ / 2) − 8`, and the lines' height within `ring width − 8`.
    - *Radial:* the longest line must fit within `ring width − 8`, and the lines' height within `midR × Δθ(rad) − 4`.
    - If two lines do not fit, try the name alone. If that does not fit, draw no label: no ellipsis, and the tree carries the name (Open 13).
  - **Colour:** `fill="currentColor"` inside the segment group that carries `data-taxonomy` and the badge rule's label custom properties. The label is white or black per theme, as the badge's.
- **Centre:** `total` as text at (0, 0), centred both ways, 28 units, `font-serif` bold, `fill-text-primary`. No caption in the hole: at 375px it would render at about 7px *(computed: 291 px / 408 units ≈ 0.71)*.
- **Example capacities (5 equal roots, `D` = 1)** *(computed)*:
  - ring 0 holds about 10 characters at 13 units (chord 88 − 8 = 80 units);
  - ring 1 radial holds about 11 characters at 12 units (90 − 8 = 82 units).
  - With `D` = 2, ring 2 holds about 5 characters, so most level-2 labels drop to the tree.

### 4.3 Description panel

- **Hint (no active note):** one `type-body` paragraph with `texts.hint`.
- **Active note:**
  - a header row with the swatch, the name and the visible `count/total`;
  - below it, the description paragraph (left out when it is `null`). It has a stable id `flavor-wheel-desc-<id>`, referenced by the active treeitem's `aria-describedby`.
- **Not a live region:** hover previews would be announced constantly. Keyboard users get the description through `aria-describedby` on focus.

### 4.4 Note tree

- **Rows:** one per visible note, in wheel order (depth-first, clockwise): a level-0 row, then its children's rows when it is expanded.
- **Row content:**
  - the chevron (parents) or a 1rem spacer (leaves), so names align;
  - the swatch;
  - the name;
  - `count/total` at the end of the row.
- **Accessible name:** "`name`, `countLabel`".

## 5. Semantic tokens and contrast

The component must sit on **`surface-card`**: the label rule blends over `TAXONOMY_CARD_SURFACES`, which mirrors `--color-surface-card` (`Badge.tsx:78-81`). The host's Consensus tab card provides it. No new primitive or semantic token is needed.

| Part | Token(s) | Sits on | Gated? |
|---|---|---|---|
| Segment fill | taxonomy data colour (inline `fill` + `fill-opacity` 1 / 0.92 / 0.85 by level) | surface-card | Data colour. Its label is gated (below). |
| Segment separator | `stroke-surface-card` | surface-card | No: decorative |
| Active segment outline | `stroke-text-primary` | segment colours | No: the panel names the active note, so the outline is redundant styling |
| Segment label | white / black by the badge rule (`[data-taxonomy]`, `--taxonomy-label`, `--taxonomy-label-dark`) | blended data colour | Yes, text 4.5:1 (feedback "Badge label contrast", "Taxonomy pairs") |
| Centre total | `fill-text-primary` | surface-card (the hole is transparent) | Yes, text |
| Panel name | `type-subheading` (`text-accent`) | surface-card | Yes, text |
| Panel count, description, hint | `type-body` (`text-primary`) | surface-card | Yes, text |
| Panel boundary | `border-border-subtle`, 1px | surface-card | No: the panel is not a control; decorative boundary |
| Tree row text and count | `type-body` (`text-primary`) | surface-card (rest); `surface-section` (hover, active) | Yes, text |
| Tree row hover / active background | `bg-surface-section` | surface-card | Row is not a button-styled control. Its identification is its text, and focus is shown by the ring. Not gated. |
| Chevron | `currentColor` = `text-primary` | surface-card, surface-section | Yes, icon 3:1 (it repeats the `aria-expanded` state) |
| Swatch | inline data colour | surface-card | No: decorative |
| Row focus | `focus-visible:focus-ring` (`focus-ring` / `focus-offset`) | surface-card | Yes, 3:1 |
| Empty message | `type-body` (`text-primary`) | surface-card | Yes, text |

Gated pairs and their ratios:

| Pair | Traditional | Dark | Registered in `theme-tokens.test.ts` |
|---|---|---|---|
| text-primary / surface-card | 6.41 | 13.22 | yes (line 293 / 647) *(measured, catalog §5)* |
| text-primary / surface-section | 5.72 | 11.97 | yes *(measured, catalog §5)* |
| text-accent / surface-card | 6.85 | 6.82 | yes (line 298 / 652) *(measured, catalog §5)* |
| focus-ring / surface-card | 11.53 | 13.22 | yes (line 357 / 708) *(measured, catalog §5)* |
| chevron (text-primary) on surface-card / surface-section | 6.41 / 5.72 | 13.22 / 11.97 | covered by the text pairs above (≥ 3:1) |
| segment label (white or black) on the blended data colour | ≥ 4.58 for any colour | ≥ 4.58 for any colour | Covered by the badge sweep only if the wheel reuses the same helper (Open 8). The bound is *(computed)*: at the threshold `L` = 0.179, white gives 1.05 / 0.229 and black gives 0.229 / 0.05, both 4.58:1, and the rule always picks the better side. Not measured by script in this pass *(unverified)*. |

No new guard pair needs registering. The wheel deliberately uses `text-primary` and `text-accent` instead of `text-label` and `text-secondary`: those two pairs on `surface-card` are not registered yet (catalog §5 registers them).

**Segment boundary (SC 1.4.11).** Segments are pointer targets, but they are not the accessible controls; the tree rows are (Open 1). A segment is identified by its label or its tree row, not by its edge against the card. Some data colours are light (for example the seeded Floral) and will not reach 3:1 against `surface-card`. That pair is not gated under criterion D while option (b) of Open 1 holds. Under option (a), segments become controls, and the boundary of every data colour would need a measured sweep (Open 1).

## 6. Layout and spacing (criterion A)

### 6.1 Component root

- **Container:** the root is a container-query context (`@container`). It lays out by its own width, not by the viewport, because the host may give it a full-width card or half a grid (MVC `consensus.blade.php:31-46` puts the wheel in the right half from `lg`). See Open 9.
- **Below 42rem of container width:** a flex column, children 1.5rem apart, in this order: wheel, panel, tree.
- **From 42rem of container width:** a two-column grid.
  - Column 1 is at most 25rem wide and holds the wheel, which spans both rows and is top-aligned.
  - Column 2 takes the rest (min 0), with the panel in row 1 and the tree in row 2.
  - Column gap 2rem; row gap 1.5rem.
- **Own box:** no padding, border, radius or background. The host's `CardContent` supplies the 1.5rem padding and the `surface-card` background.

### 6.2 Wheel

- **Size:** width 100% of its column, at most 25rem, square (1:1). Centred horizontally (auto side margins) in the stacked layout, start-aligned in the grid.
- **Box:** no padding, border or radius. The SVG fills the box, and the 4-unit viewBox margin keeps strokes from clipping.
- **Rendered sizes** *(computed)*:
  - at 375px viewport: `375 − 2×16 (container) − 2×24 (card padding) − 4 (card accent border)` = 291px, so the scale is about 0.71 and ring-0 labels render at about 9.3px;
  - at 1280px with the full-width card: the 25rem cap gives 400px, a scale of about 0.98, and labels at about 12.7px.

### 6.3 Description panel

- **Box:**
  - padding 1rem;
  - border 1px on all sides, `border-border-subtle`;
  - radius `rounded-field` (8px traditional, 0 dark);
  - no background (it sits on the card);
  - min-height 6rem, so the layout does not jump between short and long descriptions *(proposal; adjust at visual review)*.
- **Inside:** a flex column, children 0.5rem apart.
  - **Header row:** flex, wrapping, items centred, gap 0.5rem. It holds:
    - the swatch: 0.75rem square, `rounded-check`;
    - the name (`type-subheading`);
    - the count (`type-body`, tabular numbers), pushed to the end of the row (auto start margin).
  - **Description:** `type-body`, no margin of its own.

### 6.4 Note tree

- **List:** `ul` flex column, rows 0.25rem apart. No padding, border or radius on the list.
- **Row:**
  - flex, items centred, gap 0.5rem;
  - min-height 2.5rem (the button height of `fix-button-boundaries`), padding 0.25rem 0.5rem;
  - radius `rounded-field`;
  - background: none at rest, `surface-section` on hover and when active;
  - `focus-visible:focus-ring`; pointer cursor.
- **Indent by level:** start margin 0 / 1.5rem / 3rem for levels 0 / 1 / 2. The flat tree draws no guide lines.
- **Chevron or spacer:** 1rem, does not shrink.
- **Swatch:** 0.75rem square, `rounded-check`, does not shrink.
- **Name:** takes the free space (min-width 0) and wraps long words.
- **Count:** does not shrink, tabular numbers, at the row's end.

### 6.5 Empty state

- One `<p className="type-body">` with `texts.emptyMessage`: no box, no margin, left-aligned. It replaces the whole root content.
- The host keeps its card and heading around it.

### 6.6 At 375px and 1280px

- **375px:**
  - stacked: wheel (291px square), panel, tree;
  - no horizontal scroll: names wrap, the counts do not shrink, and the panel header wraps;
  - segment labels are small (about 9px), and the tree carries every name at the body size *(visual review item)*.
- **1280px:**
  - with the full-width card, the container is about 1100px *(computed: 1152 − 48 − 4)*, so the two-column grid applies: wheel 400px, then the panel and tree in about 668px;
  - in half a grid, about 512px *(computed)*, so it stays stacked (Open 9).

### 6.7 Visual reference (mock-up, ASCII)

The MVC has no wheel. Its consensus screen shows the taxonomy as nested pills (`resources/views/layouts/offerings/partials/cata-wheel-static.blade.php:34-84`), titled "Rueda SCA — Perfil de cata" (`consensus.blade.php:42`). An image mock-up and the 375/1280 captures are pending the visual review.

Container ≥ 42rem (1280px, full-width card):
```
┃ TASTE PROFILE                                                              ┃
┃   .-~~~~~~~-.                  ┌ panel ─────────────────────────────────┐ ┃
┃  / Berry\Dried\                │ ■ Fruity                          4/5  │ ┃
┃ |  ┌───────┐  |  ring 1        │ Aromas reminiscent of fresh, dried or  │ ┃
┃ | /Fruity 4/5\ |  ring 0       │ cooked fruit.                          │ ┃
┃ ||    5    | |  hole: total    └────────────────────────────────────────┘ ┃
┃ | \Floral 3/5/ |                 ▾ ■ Fruity                         4/5   ┃
┃  \ └───────┘  /                      ■ Berry                        4/5   ┃
┃   '-~~~~~~~-'                        ■ Dried fruit                  2/5   ┃
┃                                  ▸ ■ Floral                         3/5   ┃
```
375px: the wheel at the full width (291px square), then the panel, then the tree, 1.5rem apart.

Research for proportions and labels:
- **notbadcoffee.com** (an interactive Coffee Taster's Flavor Wheel): general descriptors near the centre, more specific outward; selecting a segment shows a card with the definition. This is the source for "centre outward" and "selection shows the description". https://notbadcoffee.com/flavor-wheel-en/
- **D3 arc documentation:** the label point is the arc's centre line (mid-angle, mid-radius), and fixed linear padding separates arcs. This is the source for label anchoring and the constant 2-unit separator. https://d3js.org/d3-shape/arc
- **Not reachable** (404, connection refused or rate limit): the SCA research page and the 2016 SCA news resource. The SCA wheel's own ring proportions are *(unverified)*. The radii in section 4.2 are the design lead's, sized for the label capacities computed there.

## 7. Texts (message catalog, es / en / ca, passed as props)

Area: `catalog` (`messages/{locale}/catalog.json`), the host's area. The component lives in `src/shared/ui` and owns no catalog area. Who adds the keys is Open 10. The strings are the design lead's proposals (Open 14).

| Key | es | en | ca |
|---|---|---|---|
| `wheelLabel` | Rueda de sabores | Flavor wheel | Roda de sabors |
| `wheelHint` | Pasa el puntero o el foco por una nota para ver su descripción. | Hover over or focus a note to see its description. | Passa el punter o el focus per una nota per veure'n la descripció. |
| `wheelEmpty` | Sin datos de cata disponibles. | No cupping data available. | Sense dades de tast disponibles. |
| `wheelCount` (`{count}`, `{total}`) | {count} de {total} evaluadores | {count} of {total} evaluators | {count} de {total} avaluadors |

- `wheelEmpty` repeats the wording of the catalog's `detailTasteEmpty` (catalog §7.2). If the catalog keeps that key, it can pass it instead, and `wheelEmpty` is not added. Not adding a duplicate key is a semantic point under criterion B, settled for whoever writes the keys.
- `count` counts evaluations. "Evaluators" assumes one closed specialist evaluation per specialist and offering; no unique index enforces it in the migrations *(unverified in the FormRequests)*. See Open 12.

## 8. Accessibility

- **Accessible equivalent.** The tree is the wheel's accessible equivalent. The SVG is `aria-hidden`, and the figure has a visually hidden caption.
- **Names and states.** Every treeitem has a name with the note and its count. Parents expose `aria-expanded`. Levels and positions come from `aria-level`, `aria-setsize` and `aria-posinset`.
- **Focus.** The visible indicator is `focus-visible:focus-ring` on the row (box-shadow on an HTML element). The SVG takes no focus (Open 1, Finding F5).
- **Colour.** Colour is never the only carrier: every note has a text name and `n/total` in the tree, and in the segment when it fits.
- **Total.** The centre total is visual only. Its value is in every treeitem's `countLabel`, and the host shows `evaluationCount` in its Consensus data.
- **Touch.** Tap equals click (expand and make active). Hover has no touch equivalent, and none is needed, because a tap shows the description.
- **Target size.** Rows are at least 2.5rem tall (WCAG 2.5.8 needs 24px). Small segments can be below that, and their tree rows are the conforming alternative.

## 9. Dependencies

- **Capabilities used:**
  - `theming` (tokens, `focus-ring`);
  - `base-controls` (icons entry point);
  - `feedback` (taxonomy colour rule, label contrast);
  - `content-structure` (the host's card).
- **Entities:** `src/entities/taxonomy` (`buildTaxonomyLookup`, extended with `description`; `fetchTaxonomies`). Available since `extract-offering-list-parts` (decisions log, "piezas extraídas disponibles").
- **Consumer:** `add-offering-catalog`:
  - it places the wheel in the Consensus tab, replacing catalog §6.3's tree and §4's "Taste profile" row;
  - it passes `cataConcordance`, `evaluationCount` and the texts;
  - its approved summary still describes the tree, so its propose must take the log entry into account (the entry already names it).
- **Possible later consumers:** `add-public-evaluations` was withdrawn (decisions log, "evaluaciones públicas fuera del alcance"), so none today.
- **Backlog:** R1, R3, R4, R5 and R8 do not name this change. The badge colour helper (Open 8) avoids a second copy instead of creating a backlog entry.
- **Decisions log:**
  - "catálogo: detalle y consenso…" (the requirements, applied throughout);
  - "geometría de chip compartida" (tree rows are not chips, so it does not apply);
  - "piezas extraídas disponibles" (lookup reuse).
- **Parallel work:** `add-offering-catalog` changes the detail page, and this change changes `Badge.tsx`, `entities/taxonomy` and `shared/ui/index.ts`. The catalog also imports from `entities/taxonomy`. The merge simulation was not run *(unverified; Bash not available)*.

## 10. Tests (expected coverage)

- **Geometry (pure, `flavor-wheel-geometry.test.ts`):**
  - ring radii for `D` = 0, 1, 2 per the table in section 4.2;
  - root spans proportional to count, summing to 360°, starting at 12 o'clock and running clockwise;
  - children inside the parent's span, proportional among siblings, filling it;
  - collapsed parents give no child segments;
  - a single root gives a full-ring path;
  - the label orientation flips in the lower half (ring 0) and the left half (rings 1–2);
  - the fit rule returns two lines, the name only, or no label, at the boundaries of the estimate.
- **Node building (`flavor-wheel-nodes.test.ts`):**
  - only `aromatics` roots are kept;
  - names and descriptions follow the locale;
  - an unresolved ref skips its subtree;
  - an empty colour skips the node;
  - siblings follow taxonomy order;
  - `countLabel` is filled from the callback;
  - the provisional example (`evaluationCount` 0, `[]`) gives `[]`.
- **Lookup (`lookup.test.ts`):** the four `toEqual` assertions (lines 55, 63, 71, 79) gain `description` in the asked locale. Fixtures in `widgets/offering-list/lib/resolve-taxonomies.test.ts` that build `TaxonomyLookupEntry` values gain `description` *(type change; the test's assertions stay)*.
- **Component (`FlavorWheel.test.tsx`, jsdom):**
  - Initial render: ring-0 paths only, one treeitem per root, the hint in the panel.
  - Clicking a parent's segment or row: its children appear in the SVG and the tree, and `aria-expanded` toggles.
  - Hover and focus make the panel show the name, count and description, and the active row and segment get their classes.
  - Keyboard: Down, Up, Right, Left, Home, End, Enter, Space and Escape, per section 4.1, with roving `tabindex`.
  - Accessible names come from `countLabel`, and `aria-describedby` points at the panel description.
  - Description `null` renders no paragraph.
  - Empty state: `total` 0 or no nodes.
  - The segment's `fill` and `fill-opacity` follow its level, and the label group carries `data-taxonomy` with the two custom properties.
  - Exact classes per section 6, as chosen by the build.
- **Badge (`Badge.test.tsx`):** unchanged, and must keep passing after the helper is extracted (Open 8).
- **Guards:**
  - `client-boundary.test.ts`: `FlavorWheel.tsx` starts with `"use client"`;
  - `color-guard`, `focus-guard`, `radius-guard`: pass with no exception;
  - no new contrast pair.
- **Verification task:** captures at 375px and 1280px of a harness or of the host page with the local read mock (the local database has no offerings). The captures check label fit, no horizontal scroll, the focus ring on rows, and the active outline.

## 11. Findings on existing code

- **F1: landing cards may repeat a taxonomy badge.**
  - What happens: the real `sensoryTaxonomy` has one tree per attribute type (fragrance, aroma, flavor, aftertaste, mouthfeel, main_tastes, defects; section 2.1). `resolveTaxonomies` flattens all of them (`src/widgets/offering-list/lib/resolve-taxonomies.ts:23-40`), so a note marked under two attributes renders twice on the card.
  - Status: this matches the spec as written (`openspec/specs/landing/spec.md`, "Each taxonomy reference … SHALL render as a badge").
  - Path (workflow §4): a change to specified behaviour, so a **new change or a backlog entry**, not a fix. Candidate: the card reads `cataConcordance` and de-duplicates by ref.
- **F2: the contract leaves the taste trees undocumented.**
  - What is missing: the contract does not define `count` or `type`, and its example shows 4 of the 7 types.
  - Path: contract or API documentation, which is Product owner's (`AGENTS.md`, "API contract": stop and tell). It does not block this summary, which relies on the API reading in section 2.1.
- **F3: nullable fields typed as strings.**
  - What happens: `description*` and `color` are nullable in the taxonomy seeder (`OlfactoryTaxonomySeeder.php:30-34`), but the contract types them as `string`. `buildTaxonomyLookup` maps a missing colour to `""` (`lookup.ts:33`), and a taxonomy badge with `""` gets no background.
  - Path: unverified on live data. The wheel handles both (section 2.3). For landing it would be **backlog** (no observed defect).
- **F4: a propose may have started before the summary existed.**
  - What happened: the general context ("Al retomar" 2) lists a cloud propose routine for `add-flavor-wheel` (`trig_01J4A4Hj6hACcDS7wHazr5me`), while no design summary existed for it. The pipeline gate is `.claude/CLAUDE.md` §9, "Gate": no propose without an approved summary.
  - Path: for the orchestrator. If that routine produced artifacts, they predate this summary.
- **F5: the shared focus indicator cannot render on SVG shapes.**
  - What happens: `focus-ring` is a `box-shadow` (`globals.css:691-694`), and box-shadow does not render on SVG shapes such as `<path>` *(unverified in a browser)*. Any focusable SVG segment would need its own focus drawing, which `focus-guard.test.ts` and the settled rule ("`focus-visible:focus-ring` on every interactive control") do not foresee.
  - Path: it informs Open 1. It is not a defect in existing code.

## Open

**Answered by the orchestrator, 2026-10-06 (Product owner's delegation):** every point takes the recommendation written below it — 1 (b) segments are pointer-only and the note list is the keyboard and screen-reader path; 2 segments sized by count; 3 taxonomy order; 4 fixed description panel beside or below the wheel; 5 skip a reference not found, with its subtree; 6 mouthfeel notes shown as the API returns them; 7 capability `feedback`; 8 the taxonomy colour rule is extracted from `Badge.tsx` into one shared helper in this change, with no visible change; 9 layout switch by the component's own width (container query); 10 `add-offering-catalog` adds the message keys as the host; 11 Escape collapses everything and returns focus to the outer note; 12 "evaluadores" wording, pending Product owner's confirmation that a specialist cannot close two evaluations of the same offering (fallback "evaluaciones"); 13 estimated label width, checked at the visual review; 14 strings stay as proposals. No point blocks propose.

1. **Where does keyboard focus live?**
   - Options:
     - (a) Segments are focusable SVG elements (`role="button"`, `tabindex`, `aria-expanded`), with a focus indicator drawn as two SVG strokes in `focus-offset` and `focus-ring`. This is a second focus mechanism beside the shared utility (F5). The guard would need an exception. Every data colour's segment edge becomes a gated control boundary against `surface-card`, and some light colours are unlikely to reach 3:1 *(unverified)*. The tree would still be needed as the text legend, so screen readers would get the same notes twice unless one is hidden.
     - (b) Segments are pointer targets only (`aria-hidden`), and the note tree (APG Tree View) is the keyboard and screen-reader path. Focusing a row highlights its segment and shows the description, as section 4.1 describes.
   - Recommendation: (b). It keeps the settled focus rule and guard, gives one accessible structure, can be tested in jsdom, and still shows the description "with keyboard focus" on the matching segment. Source: `.claude/CLAUDE.md` §2 design rules; WAI-ARIA APG Tree View.
   - Blocks propose: yes (it changes the spec scenarios for keyboard and focus).
2. **Segment sizing.**
   - Options:
     - (a) Proportional to `count` (section 4.2).
     - (b) Equal angles per sibling.
     - (c) Proportional to the number of taxonomy descendants, as on a printed SCA wheel.
   - Recommendation: (a). The wheel shows consensus, so more evaluators means a wider segment. Small segments lose their label but keep their tree row.
   - Blocks propose: yes (the geometry tests depend on it).
3. **Order of notes around the wheel and in the tree.**
   - Options:
     - (a) Taxonomy order (`GET /taxonomies`), so colour families stay adjacent and positions are stable across offerings.
     - (b) Count, descending.
   - Recommendation: (a), the SCA wheel's fixed layout. The API's order of `cataConcordance` is *(unverified)*, so the helper sorts.
   - Blocks propose: no.
4. **The description panel.**
   - Options:
     - (a) A static panel beside the wheel (or below it when narrow), as in sections 4.3 and 6.3.
     - (b) A floating tooltip anchored at the segment (Radix Popover with a virtual anchor, already installed). It covers the wheel, needs positioning at 375px, and has no hover on touch.
   - Recommendation: (a). It is simple, never covers the wheel, and works the same for pointer, keyboard and touch. Source: notbadcoffee.com shows the definition in a card beside the wheel.
   - Blocks propose: yes.
5. **An unresolved ref inside the tree.**
   - Options:
     - (a) Skip the node and its subtree.
     - (b) Skip the node and promote its children to its ring.
   - Recommendation: (a). A child cannot be placed in a ring without its parent's span. It follows the badge precedent ("no badge for an unresolved reference").
   - Blocks propose: no.
6. **Mouthfeel notes in the wheel.** The API merges `mouthfeel` marks into `aromatics` (`OfferingTaste::AROMATIC_TYPES`), so a "Mouthfeel" root (`categories: ["mouthfeel"]`) can appear.
   - Options:
     - (a) Show the `aromatics` group as the API returns it.
     - (b) Keep only nodes whose taxonomy `categories` include `aromatics`. This needs the categories in the lookup.
   - Recommendation: (a). The front does not re-interpret the API's aggregate. If Product owner wants (b), the cleaner fix is in the API.
   - Blocks propose: no.
7. **Capability.**
   - Options:
     - (a) `feedback`.
     - (b) `content-structure`.
     - (c) A new capability (for example `data-display`).
   - Recommendation: (a), for the reasons in section 1.1: it owns the taxonomy colour and label-contrast requirements the wheel reuses.
   - Blocks propose: yes (the architect needs the spec folder).
8. **Sharing the taxonomy colour rule with `Badge`.**
   - Options:
     - (a) In this change, export the rule from `Badge.tsx`, or move it to a small module in `src/shared/ui`, as one pure helper: colour and level in; fill opacity and the two theme labels out. The badge's behaviour and `Badge.test.tsx` stay unchanged.
     - (b) A separate refactor change in `feedback` first.
     - (c) Copy it into the wheel (a second definition: rejected under criterion C).
   - Recommendation: (a). It is an extraction with no visible change, the wheel is its first second consumer, and the existing sweep keeps covering the rule.
   - Blocks propose: no.
9. **Responsive switch by container instead of viewport.**
   - Options:
     - (a) A container query: two columns from 42rem of the component's own width (Tailwind 4 built-in `@container` / `@2xl:`). It is the project's first container query *(no other use found in `src/shared/ui`)*.
     - (b) Viewport breakpoints (`lg:`), which break when the host puts the wheel in half a grid.
   - Recommendation: (a). It is a reusable component with an unknown host width.
   - Blocks propose: no.
10. **Who adds the message keys.**
    - Options:
      - (a) `add-offering-catalog` adds them in its `catalog` area, as the host.
      - (b) This change adds them.
    - Recommendation: (a). `src/shared/ui` components take texts as props and own no area.
    - Blocks propose: no.
11. **Escape.** APG Tree View defines no Escape. The brief asks for one.
    - Options:
      - (a) Escape collapses every note to ring 0 and moves focus to the focused item's level-0 ancestor.
      - (b) Escape does nothing.
    - Recommendation: (a). It is a quick "back to the centre" that mirrors "expands from the centre outward".
    - Blocks propose: no.
12. **"Evaluators" or "evaluations".** `count` and `evaluationCount` count closed specialist evaluations (section 2.1). The wording "evaluators" is exact only if a specialist cannot close two evaluations of the same offering *(unverified)*.
    - Options:
      - (a) "evaluadores", as in Product owner's decision.
      - (b) "evaluaciones".
    - Recommendation: (a), with Product owner confirming the one-evaluation-per-specialist rule in the API.
    - Blocks propose: no.
13. **Label fit.**
    - Options:
      - (a) Estimate text width (`characters × 0.6 × size`) in a pure function, with no ellipsis.
      - (b) Measure the rendered text (`getComputedTextLength`) after mount and truncate with an ellipsis. This needs a browser, is not testable in jsdom, and makes the first render differ from the second.
    - Recommendation: (a), checked at the visual review.
    - Blocks propose: no.
14. **Strings.** The es, en and ca strings in section 7 are proposals for Product owner to confirm or edit.
    - Blocks propose: no.

## Review log

- 2026-10-06, design lead, generation mode.
  - **Settled from sources:**
    - The tree the wheel reads (`cataConcordance`, type `aromatics`) and the meaning of `count` and of the total, read from `OfferingConsensusService.php`, `OfferingTaste.php`, `Offering.php` and `OfferingResource.php` (read-only).
    - The empty state, from the contract's provisional example and the offerings migration default.
    - The colour mechanism, reused from `Badge.tsx` and the `[data-taxonomy]` rule, under the feedback spec's label-contrast requirement.
    - Text pairs restricted to already-registered tokens, so no new guard pair is needed.
    - Icons from `icons.ts`; the focus utility; the row height of `fix-button-boundaries`.
    - The wheel's placement and the defects and main-tastes selectors left to `add-offering-catalog` (decisions log).
  - **Settled under criterion B (semantic):** no duplicate empty-message key when the catalog's `detailTasteEmpty` already exists (section 7); no `locale` prop, because every text arrives localized (section 3.1).
  - **Computed:** ring radii, label capacities, rendered sizes, and the 4.58:1 lower bound of the label rule.
  - **Not measured:** no contrast script was run in this pass (shell denied). Every gated pair reuses the measurements of the add-offering-catalog summary §5.
  - **Research:**
    - Fetched: notbadcoffee.com (interactive wheel) and d3js.org (arc labels and padding).
    - Not reachable: sca.coffee (404), scanews.coffee (connection refused), en.wikipedia.org (404), observablehq.com (429).

## Propose status

- **Change-id:** `add-flavor-wheel` (capability `feedback`), branch `feature/add-flavor-wheel`, folder `openspec/changes/add-flavor-wheel/`. Proposed 2026-10-06 by the architect agent under Product owner's delegation.
- **`openspec validate add-flavor-wheel --strict`:** passes ("Change 'add-flavor-wheel' is valid"); 4/4 artifacts complete (proposal, feedback spec delta, design, tasks).
- **Resolved (all by the orchestrator's answers above, taken as the decisions):** 1 (b) keyboard and screen reader live in the note list, segments are pointer-only; 2 (a) segments sized by `count`; 3 (a) taxonomy order; 4 (a) fixed description panel; 5 (a) an unresolved ref is skipped with its subtree; 6 (a) mouthfeel notes as the API returns them; 7 (a) capability `feedback`; 8 (a) the taxonomy colour rule is extracted from `Badge.tsx` into one shared helper (`src/shared/ui/taxonomy-color.ts`, design.md D4) with `Badge.test.tsx` unmodified; 9 (a) layout switch by container query at 42rem (design.md D8); 10 (a) `add-offering-catalog` adds the message keys (design.md D9); 11 (a) Escape collapses everything and refocuses the level-0 ancestor (design.md D6); 13 (a) estimated label width with no ellipsis (design.md D5). Design.md also settles: `buildFlavorWheelNodes` typed with the existing `OfferingTaxonomyNode` alias (D1), `TaxonomyLookupEntry.description: string | null` (D2), and the mapping rules (D3).
- **Backlog:** no entry is resolved by this change (R1, R3, R4, R5, R8 do not name it). The shared colour helper (Open 8) avoids a second copy instead of creating a backlog entry.
- **Remains open (Product owner):** Open 12 — the `wheelCount` wording ("evaluadores", fallback "evaluaciones") awaits his confirmation that a specialist cannot close two evaluations of the same offering; Open 14 — the es/en/ca strings of section 7 stay proposals. Open 13's label-fit estimate is checked at the visual review (tasks 7.2). None of these changes the specs, the design or the tasks (design.md "Open Questions").
- **Reported, not corrected here:** section 10 says the fixtures of `widgets/offering-list/lib/resolve-taxonomies.test.ts` "that build `TaxonomyLookupEntry` values" gain `description`; those fixtures build `TaxonomyNode` values and their badge assertions stay, so the type ripple reaches only the four `toEqual` expectations of `lookup.test.ts` (named in task 1.1).

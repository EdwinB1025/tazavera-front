# Design

## Context

See `proposal.md` — Why. The settled product design is `docs/design/add-flavor-wheel/design-summary.md` (approved 2026-10-06; every Open point answered with its recommendation). This document records the implementation decisions it leaves to the build; the geometry numbers, interaction rules, states and contrast pairs live in the summary (§2–§8) and are referenced, not restated, where they are unchanged.

Review round 1 (`docs/design/add-flavor-wheel/corrections.md`, 2026-10-06) supersedes parts of the summary, and this document records the result: the note list collapses behind an expand control (D7, D8), the wheel grows (D8), every segment carries an arched label set along its outer edge, a visible gap separates segments, the hole is larger and the rings thinner (D5), and a name that cannot fit even arched shows only while its note is active (D5). Where D5 or D8 differ from summary §4.2 or §6, this document wins (corrections.md overrides the summary). The colour rule (D4), the keyboard model (D6), the panel content (D7), the empty state (D10), the existing texts and the contrast gates are unchanged.

Current state that shapes the approach: `src/shared/ui/Badge.tsx` holds the taxonomy colour rule as private functions (`relativeLuminance`, `channels`, `labelOver`, `taxonomyStyle`) plus the exported `TAXONOMY_CARD_SURFACES`, which `Badge.test.tsx` imports from `@/shared/ui/Badge` and pins against `globals.css`; that test asserts the exact inline styles (plain `backgroundColor` at level 0, `color-mix(in srgb, … 92%|85%, transparent)` at levels 1–2, the `--taxonomy-label` / `--taxonomy-label-dark` custom properties). `src/entities/taxonomy` exposes `fetchTaxonomies` and `buildTaxonomyLookup`, whose `TaxonomyLookupEntry` carries `label` and `color` only. The guards (`color-guard`, `focus-guard`, `radius-guard`, `badge-geometry-guard`, `client-boundary`) scan `src/shared/ui` source with `node:fs`, and `theme-tokens.test.ts` registers every text/boundary pair the wheel uses (`text-primary`/`surface-card` and `/surface-section`, `text-accent`/`surface-card`, `focus-ring`/`surface-card`, both themes). `ChevronRight` and `ChevronDown` already leave `src/shared/ui/icons.ts`.

API endpoints consumed (loaded by the host with plain `fetch` on the server and passed as props — the component calls no operation; summary §2):

| Method and path | operationId | Auth | Used fields | Errors |
|---|---|---|---|---|
| `GET /offerings/{offering_ulid}` | `getAnOffering` | none | `data.evaluationCount`; `data.cataConcordance[]` nodes `{ref, type, level, count, children}` with `type = "aromatics"` | non-2xx or transport failure → the host's error state; the wheel never renders with unresolved data |
| `GET /taxonomies` | `listOlfactoryTaxonomies` | none | per node: `ulid`, `nameEs/En/Ca`, `descriptionEs/En/Ca`, `color`, `children` | non-2xx or transport failure (`fetchTaxonomies` throws) → the host's error state |

Every displayed value maps to a real contract field: names, descriptions and colours to the taxonomy node fields above; `count` to the offering node's `count`; the total to `evaluationCount`. The meaning of `count` and `type` is read from `tazavera-api` (summary §2.1); the contract documents neither (summary F2 — Product owner's). No shared card is used here: the host's Consensus tab card and its field mapping belong to `add-offering-catalog`.

## Goals / Non-Goals

**Goals:**
- The taxonomy colour rule has exactly one definition, shared by the badge, the wheel's segments and its swatches, with the badge's rendered output byte-identical to `develop`.
- Geometry and data mapping are pure functions with unit tests; every interaction is testable in jsdom (no rendered-text measurement, no browser global).
- The wheel takes resolved, UI-only data as props, so `shared/ui` never imports an entity and the host owns fetching, localization and texts.

**Non-Goals:**
- Placing the wheel on any screen, message catalog keys, and the defects/main-tastes selectors (proposal non-goals: `add-offering-catalog`).
- Measuring rendered text (`getComputedTextLength`) — rejected in summary Open 13 (b).
- Animation, zoom, export, printing; any dependency change; any change to `src/shared/api/schema.ts` or `contracts/openapi.yaml`.

## Decisions

### D1. Derived and UI-specific types; no generated type touched

`buildFlavorWheelNodes` takes the concordance nodes as `OfferingTaxonomyNode[]`, the existing alias of `src/shared/api/index.ts`: the `cataConcordance` node carries exactly the same fields (`ref`, `type`, `level`, `count`, `children`), so no new alias is derived and `schema.ts` stays untouched. The wheel's UI-only types are declared before the component in `src/shared/ui/FlavorWheel.tsx` (the `Badge`/`Pagination` convention), exactly as the summary §3.1 defines them:

```ts
export type FlavorWheelNode = {
  id: string;                 // taxonomy ulid
  name: string;               // localized name
  description: string | null; // localized description
  color: string;              // #RRGGBB data color
  level: 0 | 1 | 2;           // from the offering node's own level
  count: number;              // evaluators who identified the note
  countLabel: string;         // host-composed accessible text
  children: FlavorWheelNode[];
};

export type FlavorWheelTexts = {
  label: string;
  hint: string;
  emptyMessage: string;
  notesToggle: string; // the note list's expand control (review round 1, D7)
};

export type FlavorWheelProps = {
  nodes: FlavorWheelNode[];
  total: number;
  texts: FlavorWheelTexts;
};
```

`FlavorWheelNode` lands with the node mapping it is the return type of (D3); `FlavorWheelTexts` and `FlavorWheelProps` land with the component, still before it. `src/entities/taxonomy/model/flavor-wheel-nodes.ts` imports the `@/shared/ui` type (a downward import the FSD skill allows); there is no `locale` prop, because every text arrives localized (summary §3.1).

*Why this mechanism.* The summary settles the prop block and "no generated type is redefined"; typing the helper's input with the existing alias is the simplest choice that compiles against both operations' identical node shapes. *Alternatives considered:* a new `src/shared/api` alias derived from `getAnOffering` — rejected as a second name for a shape `OfferingTaxonomyNode` already names; redefining the generated node — forbidden by the rules.

### D2. The lookup gains `description: string | null`

`TaxonomyLookupEntry` gains `description: string | null`, localized exactly like `label` (`descriptionCa`/`descriptionEs`/`descriptionEn` by locale) and `null` when the chosen locale's description is absent (the seeder makes it nullable — summary F3, §2.3). The value flows into `FlavorWheelNode.description`; the panel renders no description paragraph for `null`.

*Why:* the panel then needs no locale and no second lookup (summary §3.1, §4.3). *Alternatives:* storing all three locales and resolving in the component — rejected: the lookup is the one place that localizes.

### D3. `buildFlavorWheelNodes` is a pure mapping in the taxonomy entity

Signature and behaviour exactly as the summary §3.1 settles:

```ts
buildFlavorWheelNodes(
  cataConcordance: OfferingTaxonomyNode[],
  lookup: TaxonomyLookup,
  total: number,
  countLabel: (count: number, total: number) => string,
): FlavorWheelNode[]
```

It keeps the roots whose `type` is `aromatics`; resolves each `ref` through the lookup; skips a node with its subtree when its ref is not found or its colour is empty; orders siblings by taxonomy order (the insertion order of the lookup, which follows `GET /taxonomies`); takes `level` from the offering node's own level (landing D5 precedent); and fills `countLabel` with `countLabel(count, total)` (the bean-scale precedent: the host composes the accessible text). Exported from `src/entities/taxonomy/index.ts`.

*Why:* `shared/ui` cannot import entities, so the API-to-UI mapping lives in the entity and the component stays business-agnostic (summary §3). *Alternatives:* mapping inside the component — rejected: it would pull API shapes into `shared/ui` and is untestable in isolation.

### D4. One shared taxonomy colour rule, no visible change

The taxonomy colour rule moves out of `Badge.tsx` into `src/shared/ui/taxonomy-color.ts` (summary Open 8, option (a)'s small module) as one pure helper — `taxonomyColorRule(color, level)` returning the depth fill opacity (1 at level 0, 0.92 at level 1, 0.85 at level 2) and the two theme labels (`"white"`/`"black"` by the luminance of the colour at that opacity over `TAXONOMY_CARD_SURFACES`, threshold 0.179) — together with `TAXONOMY_CARD_SURFACES` itself. `Badge.tsx` composes its existing inline style from that output and re-exports `TAXONOMY_CARD_SURFACES` from its module, so `Badge.test.tsx` passes **unmodified** and every badge renders class- and style-identical to `develop`. The wheel derives its segments (`fill` = the colour, `fill-opacity` = the helper's opacity, the two label custom properties on the segment label group under `data-taxonomy`) and its swatches (the colour at the helper's opacity) from the same helper.

*Why:* one definition shared by badge, segments and swatches (criterion C; summary §4 Reuse), with the existing badge sweep still covering the label rule. *Alternatives considered:* exporting the rule from `Badge.tsx` — rejected: a component module is the wrong home for a rule a second module consumes; a separate refactor change first — rejected by the orchestrator's answer to Open 8; copying the rule into the wheel — rejected: a second definition.

### D5. Geometry as pure functions

`src/shared/ui/flavor-wheel-geometry.ts` holds layout, arc paths and label placement with no React: viewBox `-204 -204 408 408` (outer radius 200, unchanged); ring radii by the deepest level `D` present in the whole tree (so the wheel never rescales while expanding). Review round 1 makes the hole larger (radius 40 → 80) and every ring thinner:

| D | Hole | Ring 0 | Ring 1 | Ring 2 |
|---|---|---|---|---|
| 0 | 0–80 | 80–200 | — | — |
| 1 | 0–80 | 80–140 | 140–200 | — |
| 2 | 0–80 | 80–120 | 120–160 | 160–200 |

Segments start at 12 o'clock and run clockwise, sized proportionally by `count` (roots over the sum of root counts; children among siblings inside the parent's span), with a single root drawn as two half-arcs. **Gap (round 1, item 4):** the separator stroke in `stroke-surface-card` widens from 2 to 4 units on every segment path; being the card's colour, it reads as a constant-width 4-unit gap between neighbours and between rings (the D3 arc "linear padding" look) with no change to the arc geometry, and it stays decorative (summary §5). The active segment is drawn after the other segments with the 3-unit `stroke-text-primary` outline, unchanged. The centre shows `total` only, 28 units, unchanged.

**Arched labels (round 1, items 3 and 6; supersedes summary §4.2's tangential and radial orientations).** Every segment's label follows its arc, set along its outer edge, in every ring. Each label line is an SVG `<text>` (`text-anchor="middle"`, `dominant-baseline="central"`, the ring's font size, `fill="currentColor"`) holding one `<textPath>` with `startOffset="50%"` whose `href` points at an unfilled arc `<path>` of that line (MDN `<textPath>`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath; the SVG 2 `href` attribute, not `xlink:href`). The path ids are unique per wheel instance (React `useId` prefix plus note id and line index). The geometry module provides:

- `labelRadius(segment, line)` — the radius the line's glyphs are centred on: line 0 (the name) at `outer − 4 − 0.6 × size`, line 1 (the legend `count/total`) one line height inward at `outer − 4 − 1.8 × size`, with `size` 13 in ring 0 and 12 in rings 1–2 (`labelFontSize`, unchanged; the font size is never reduced). The name always sits on the outer line.
- `labelPath(radius, start, end)` — the path data of the arc a line runs along, from 12-o'clock degrees `start` to `end`: clockwise from `start` to `end` (sweep flag 1) when the mid-angle `(start + end) / 2` is at most 90° or at least 270°, and reversed — from `end` back to `start`, sweep flag 0 — when the mid-angle is strictly between 90° and 270°, so the text reads upright in the lower half (the existing flip thresholds of ring 0). The large-arc flag is 1 above 180°. A span of 360° or more is two half-arcs in the same direction. Points use the module's existing rounding.
- `fitLabel(segment, name, legend)` returns `"both" | "name" | "active"`. Text width is estimated as before (`characters × 0.6 × font size`); a line fits when its estimated width is at most `labelRadius(segment, line) × Δθ(rad) − 8` (the arc length at its own radius minus 8; no clamp, an arc has no chord limit) and the lines' height `lines × 1.2 × size` is at most `ring width − 8`. Both lines fit → `"both"`; else the name alone → `"name"`; else `"active"`. There is no `"none"` outcome: every segment carries its label.

`labelPlacement` (the tangential and radial anchor and rotation) is removed with the orientations it served.

**Name shown on activation (round 1, item 8).** For a segment whose fit is `"active"`, no label is drawn at rest. While its note is the active note (D6: hover, focus or activation, persisting when the pointer leaves), the wheel draws its name alone — never the legend, never an ellipsis, at the ring's unchanged font size — along `labelPath(labelRadius(segment, 0), mid − 90, mid + 90)`, a half-circle centred on the segment's mid-angle so a name wider than the segment has room on both sides. Because that name overflows onto the neighbouring segments, it does not use the badge label rule (its contrast is only guaranteed on its own segment's colour): it is drawn last in the SVG, after the active outline, with `fill-text-primary` and a `stroke-surface-card` halo of 4 units painted under the glyphs (`paint-order="stroke"`, round line joins), so every glyph sits on the card colour. That is the registered `text-primary` / `surface-card` pair (6.41 traditional, 13.22 dark; `theme-tokens.test.ts`), so no new colour pair or token arises. It takes no pointer events.

*Why:* pure functions are unit-testable in Vitest and keep the component declarative; the estimation avoids the render-measure-render cycle that jsdom cannot test (summary Open 13 (a)). The stroke gap keeps the geometry, hit areas and fit rule unchanged except for the wider stroke. `<textPath>` is the native SVG way to set text along an arc and needs no measurement. The halo reuses a gated pair rather than measuring the label against every possible neighbour. *Alternatives considered:* an angular pad that shrinks each arc — rejected: it changes every span and hit area for the same visual result; rotating individual glyphs — rejected: needs per-glyph widths jsdom cannot provide; drawing the overflowing name in the badge label colour — rejected: unmeasured pairs against the neighbours' colours.

### D6. Interaction and keyboard (APG Tree View, flat rows)

Summary §4.1 as settled: initial state is ring 0 with nothing expanded; activating a note with children expands it one level and activating again collapses it, several notes being expandable at once; the active note is the most recent of segment hover, focused row and last click/tap, and it persists when the pointer leaves; clicking or tapping a segment activates its note and, when it has children, toggles its expansion, making it the list's roving item without moving focus. The list is one tab stop with a roving `tabindex`: Down/Up over visible rows, Right expands or enters the first child, Left collapses or moves to the parent, Home/End to the ends, Enter/Space toggles a parent. Escape (Open 11 (a)) collapses every note back to ring 0 and moves focus to the focused row's level-0 ancestor. Expansion is instant; there is nothing to reduce for `prefers-reduced-motion`. Keyboard focus lives on the rows only — segments are pointer targets and `aria-hidden` (Open 1 (b); the shared `focus-ring` is a `box-shadow` that cannot render on SVG shapes, summary F5).

### D7. Structure and accessibility

A `<figure>` root with a visually hidden `<figcaption>` carrying `texts.label`; the inline `<svg>` is `aria-hidden="true"` (the list is its accessible equivalent) and takes no focus; the centre total is visual only. The description panel is a plain `div`: the hint paragraph before any interaction, then a header row (swatch, name, visible `count/total`) and the description paragraph with a stable id `flavor-wheel-desc-<id>`, referenced by the active row's `aria-describedby`; it is not a live region (hover previews must not be announced). The list is a flat `<ul role="tree">` of `<li role="treeitem">` rows carrying `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded` on parents, with the accessible name "`name`, `countLabel`"; the chevron (`ChevronRight`/`ChevronDown` from `@/shared/ui/icons`) and the swatch are `aria-hidden`, and the row's state is in `aria-expanded`. The focus indicator is `focus-visible:focus-ring` on the row.

**Note list disclosure (review round 1, item 1).** The note list is collapsed by default behind a native `<button type="button">` (APG Disclosure pattern) placed after the panel and before the list: a chevron (`ChevronRight` collapsed, `ChevronDown` expanded, `aria-hidden`) and the visible text `texts.notesToggle`, which is its accessible name and does not change with the state; `aria-expanded` carries the state and `aria-controls` the list's id (a React `useId` value). The list `ul` stays in the DOM with the `hidden` attribute while collapsed, so `aria-controls` always resolves and the hidden rows leave the tab order. Enter and Space are the button's native activation; the tree's keyboard model (D6) is unchanged inside the expanded list. Collapsing the list keeps the wheel's expansion and the active note: the wheel, the panel and the active-name label are independent of it. Only the list collapses: the description panel is never collapsed.

### D8. Layout and tokens

The root is a container-query context (`@container` — the project's first; Open 9 (a)). **Review round 1 (item 2)** raises the wheel's cap from 25rem to 32rem and gives the wheel the space the collapsed list leaves:

- **Below 42rem of its own width:** a flex column — wheel, panel, note-list control, list — 1.5rem apart; the wheel is `w-full`, at most 32rem, square and centred.
- **From 42rem:** a two-column grid. Column 1 is `minmax(0, 32rem)` and holds the top-aligned wheel across every row; column 2 is `minmax(16rem, 1fr)` and stacks the panel, the note-list control and the list (rows `auto`, the last `1fr`). Column gap 2rem, row gap 1.5rem. Column 2 keeps at least 16rem, so between 42rem and about 50rem of container width the wheel grows with the container (about 24rem at 42rem) and from about 50rem it sits at its 32rem cap.
- **Rendered sizes** *(computed)*: at 375px the wheel stays width-limited at 291px (labels about 9.3px); at 1280px with the full-width card (container about 1068px, summary §6.6) the wheel is 512px (scale about 1.25: ring-0 labels about 16px, rings 1–2 about 15px) and column 2 about 524px.

The component draws no box of its own: the host's `surface-card` card supplies padding and background. Panel box: padding 1rem, 1px `border-border-subtle`, `rounded-field`, min-height 6rem (proposal of summary §6.3, adjustable at the visual review). Rows: min-height 2.5rem (the `fix-button-boundaries` button height), padding 0.25rem 0.5rem, `rounded-field`, `bg-surface-section` on hover and when active, indentation 0 / 1.5rem / 3rem by level. The note-list control takes the row treatment (flex, items centred, gap 0.5rem, min-height 2.5rem, padding 0.25rem 0.5rem, `rounded-field`, `text-text-primary`, `hover:bg-surface-section`, `focus-visible:focus-ring`, `type-body`), aligned to the start and as wide as its content, so its text and chevron use only the registered `text-primary` pairs on `surface-card` and `surface-section`. Text comes from the existing treatments (`type-subheading` for the active name, `type-body` elsewhere) with tabular numbers for counts; only the semantic tokens summary §5 lists, no primitive, no new token and no new guard pair. Classes are chosen by the build from these values, within the guards' allowlists (exact names are pinned by its tests).

### D9. Texts arrive as props

The component owns no catalog area: `texts.label`, `texts.hint`, `texts.emptyMessage`, `texts.notesToggle` and the `countLabel(count, total)` callback come from the host (Open 10 (a)), which composes them from its `catalog` message keys — the strings of summary §7 remain Product owner's to confirm. Review round 1's expand control needs one text the summary did not list: `notesToggle`, proposed as the host key `wheelNotes` with es "Notas", en "Notes", ca "Notes" (Product owner's to confirm, like Open 14). The existing texts are unchanged. No file under `messages/` changes in this change.

### D10. States

Empty (summary §2.3): `total` 0, no `aromatics` node, or nothing resolved renders one `type-body` paragraph with `texts.emptyMessage` in place of wheel, panel and list. Loading and read failures are the host's states (skeleton and error of `add-offering-catalog` §2); the component never renders with a failed lookup. A skipped note (unresolved ref or empty colour) takes its subtree with it and the rest renders normally; a note without description renders no description paragraph.

### Files created or modified

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/ui/FlavorWheel.tsx` | `shared` | created — `FlavorWheel` (`"use client"`), with `FlavorWheelNode`, `FlavorWheelTexts`, `FlavorWheelProps` declared before it (D1, D6–D10) |
| `src/shared/ui/FlavorWheel.test.tsx` | `shared` | created — component tests (jsdom) |
| `src/shared/ui/flavor-wheel-geometry.ts` | `shared` | created — pure geometry (D5) |
| `src/shared/ui/flavor-wheel-geometry.test.ts` | `shared` | created — geometry unit tests |
| `src/shared/ui/taxonomy-color.ts` | `shared` | created — the shared taxonomy colour rule (D4) |
| `src/shared/ui/Badge.tsx` | `shared` | modified — composes the shared rule and re-exports `TAXONOMY_CARD_SURFACES`; rendered output unchanged (D4) |
| `src/shared/ui/index.ts` | `shared` | modified — exports `FlavorWheel` and its types |
| `src/shared/ui/index.test.tsx` | `shared` | modified — one smoke render of the wheel |
| `src/entities/taxonomy/model/lookup.ts` | `entities` | modified — `TaxonomyLookupEntry.description` (D2) |
| `src/entities/taxonomy/model/lookup.test.ts` | `entities` | modified — the four expectations gain `description` |
| `src/entities/taxonomy/model/flavor-wheel-nodes.ts` | `entities` | created — `buildFlavorWheelNodes` (D3) |
| `src/entities/taxonomy/model/flavor-wheel-nodes.test.ts` | `entities` | created — mapping unit tests |
| `src/entities/taxonomy/index.ts` | `entities` | modified — exports `buildFlavorWheelNodes` |

No Next.js route file and nothing under the root `app/` or `pages/` is involved. `src/shared/api/schema.ts`, `contracts/openapi.yaml`, `messages/` and `Badge.test.tsx` are untouched.

## Risks / Trade-offs

- [Label width is estimated (`characters × 0.6 × size`), so a label may overflow its arc or move to the active-only name where it would have fit] → the fit rule draws no ellipsis and the list carries every name; the estimate is checked at the visual review (Open 13, summary §6.6).
- [Arched labels rely on `<textPath>` with the SVG 2 `href` and on `dominant-baseline="central"` along a path; jsdom renders neither] → the component tests assert the path data and attributes; placement and the active-only name's halo are confirmed by the round's 375px/1280px captures.
- [The active-only name overflows onto neighbouring segments and may cover their labels while active] → it is shown only while its note is active and the panel and list carry the same name; covering a neighbour is accepted for the active note.
- [The first container query in the project; jsdom performs no layout] → the switch is asserted as classes in component tests and confirmed by the 375px/1280px captures of the visual review.
- [The badge extraction touches shared code while `add-offering-catalog` is being proposed in parallel and also imports `entities/taxonomy`] → the extraction keeps `Badge.tsx`'s exports and output identical and the lookup change is additive, so either side merges as additions; the merge simulation of summary §9 remains unverified.
- [Small segments fall below the 24px target size (WCAG 2.5.8)] → the rows of the note list are the conforming alternative (summary §8).
- [The contract documents neither `count` nor `type` of the taste nodes (summary F2)] → the mapping follows the API reading recorded in summary §2.1; documenting the fields stays with Product owner (the contract is never edited here).

## Migration Plan

Not applicable: new modules plus one extraction with a class- and style-identical badge. A rollback is a revert of the change's commits.

## Open Questions

- The `wheelCount` wording ("evaluadores" / "evaluaciones", summary Open 12) awaits Product owner's confirmation that a specialist cannot close two evaluations of the same offering. The texts are the host's (D9), so this cannot change the specs, this design or the tasks.
- The es/en/ca strings of summary §7 stay proposals for Product owner to confirm or edit (Open 14).

# Design

## Context

`add-flavor-wheel` (archived `openspec/changes/archive/2026-10-06-add-flavor-wheel/`, on `develop` at `2bc37aa`) ships the wheel in `src/shared/ui/FlavorWheel.tsx` with its pure geometry in `src/shared/ui/flavor-wheel-geometry.ts`. Its design.md D5 keys the ring table by the deepest level `D` of the whole tree, so the wheel never rescales; its D7 puts the note list behind its own `<button>` disclosure with the `ul` carrying the `hidden` attribute; its D8 lays the wheel, panel, control and list out in a container-query grid with rows `auto auto 1fr`.

This change follows the approved `docs/design/refine-flavor-wheel/design-summary.md` (Product owner's answers Q4 (b) and Q5). Everything that summary leaves unchanged keeps the archived decisions: the colour rule (D4), the keyboard model (D6), the panel and the row structure (D7), the empty state (D10), the props (D1) and the round-1 label rules. The shared collapsible section is the `content-structure` "Collapsible section" requirement, built by `add-collapsible-section` as `Collapsible` / `CollapsibleHeader` / `CollapsibleBody` exported from `src/shared/ui/index.ts`.

**API endpoints consumed:** none. The component calls no operation; the host (`add-offering-catalog`) reads `GET /offerings/{offering_ulid}` (`getAnOffering`) and `GET /taxonomies` (`listOlfactoryTaxonomies`) and passes resolved props, exactly as in the archived change. No API error is presented by this change: loading and read failures stay the host's (archived D10). No generated type is used or derived beyond the archived ones, and `src/shared/api/schema.ts` is untouched.

## Goals / Non-Goals

**Goals:**
- Size the rings by the deepest level currently expanded, rescaling instantly (summary §4.1).
- Replace the note list's control with the shared collapsible section header, the tree in its body (summary §4.2).
- Drop one grid row from the layout (summary §5).

**Non-Goals:**
- Any change to the ring values, labels, colours, keyboard model, panel, empty state, props or texts.
- Any rescale animation, new token, new guard pair or new dependency.
- Any change to the shared collapsible section itself.

## Decisions

### D1. Rings keyed by the visible depth `V`

`layoutWheel(nodes, expanded)` keeps its signature and its return shape. It computes `V` instead of the tree depth: `V` is 0 when no node with children is expanded; otherwise it is the largest `1 + V(children)` over the expanded nodes with children whose ancestors are all expanded, capped at 2. Only nodes reachable through expanded parents count, so a collapsed parent hides any expanded descendant from `V` as it already hides it from the segments. `ringRadii(V)` then supplies the bounds, with the archived D5 table unchanged and keyed by `V`:

| V | Hole | Ring 0 | Ring 1 | Ring 2 |
|---|---|---|---|---|
| 0 | 0–80 | 80–200 | — | — |
| 1 | 0–80 | 80–140 | 140–200 | — |
| 2 | 0–80 | 80–120 | 120–160 | 160–200 |

`ringRadii` and its table, `arcPath`, `labelRadius`, `labelPath` and `fitLabel` do not change. The private tree-depth helper is replaced by the visible-depth computation, and the module's comments follow (`RINGS_BY_DEPTH` documents bounds by visible depth). Since labels, the fit rule, the active name, the active outline and the hit areas are all derived from the segments' `inner`/`outer`, they follow the rescale with no further change.

The rescale is instant: archived D6 settles that expansion is instant with nothing to reduce for `prefers-reduced-motion`, and the rescale is part of the expansion (summary §4.1, criterion B).

*Why:* keeping the D5 values and changing only their key is exactly Q4 (b); computing `V` inside `layoutWheel` keeps the component unchanged for this part. *Alternatives considered:* passing `V` from the component — rejected: the component would duplicate the expansion walk `layoutWheel` already does.

### D2. Note list inside the shared collapsible section

The archived D7 disclosure `<button>` and its `ChevronRight`/`ChevronDown` swap are removed. The note list becomes an uncontrolled `<Collapsible>` (default `defaultOpen` false, so the list is collapsed at first) holding:

- `<CollapsibleHeader>` with `texts.notesToggle` as its children (the title), no `aside` and no `headingLevel`: it stays a control inside the figure. Its look, chevron (down collapsed, turned up expanded), `aria-expanded`, `aria-controls`, `focus-visible:focus-ring` and 0.25s motion are the shared section's; the wheel passes no `className`.
- `<CollapsibleBody>` wrapping the tree `ul`. The body stays mounted while collapsed and is `inert`, so `aria-controls` (naming the body) always resolves, the row refs survive, and the hidden rows leave the tab order. The `ul` loses its own id and its `hidden` attribute.

Collapsing the list keeps the wheel's expansion, the active note and the roving row (the body keeps its content mounted). Only the list collapses; the panel never does. This reverses the round-1 F2 fix (`@2xl:justify-self-start`): the header is full width by Q5.

`ChevronRight` stays imported for the rows (their own chevrons are unchanged); the header's chevron is the shared section's own.

### D3. Layout and spacing

Archived D8 is unchanged except:

- **The section is one layout item.** The header and the body are wrapped in one `div` (`flex flex-col`), the layout's third child, so no layout gap separates them: only the body's top padding (below) does.
- **Below 42rem:** a flex column of the wheel, the panel and the section, 1.5rem apart.
- **From 42rem:** rows `auto 1fr` instead of `auto auto 1fr`; the wheel spans 2 rows instead of 3 (`@2xl:row-span-2`); column 2 holds the panel (row `auto`) then the section (row `1fr`).
- **Body top padding 0.5rem** (summary §5, the MVC legend body `p-2`): it sits on the tree `ul` (`pt-2`, added to its `flex flex-col gap-1`) inside the body's clipped row, not on the body, so the collapsed body keeps zero height. No other padding, border or background on the body.
- **Focus rings of rows** at the body's edge are not clipped while expanded: the shared body widens its clip by the 4px ring once open (`content-structure` "Collapsible section"; `add-collapsible-section` §4.3).

The layout container's class becomes `flex flex-col gap-6 @2xl:grid @2xl:grid-cols-[minmax(0,32rem)_minmax(16rem,1fr)] @2xl:grid-rows-[auto_1fr] @2xl:gap-x-8 @2xl:gap-y-6` and the wheel's `mx-auto aspect-square w-full max-w-128 @2xl:row-span-2 @2xl:mx-0 @2xl:self-start`. The section wrapper is `flex flex-col`. At 375px nothing scrolls horizontally: the shared header wraps its title and its chevron never shrinks.

### D4. Contrast and tokens

No new token, no new guard pair. The header's pairs are the shared section's (`text-accent` on `surface-card`, already registered; summary §7). The removed control's `text-primary` pairs stay registered because the rows use them. The rescale changes no colour.

### Files created or modified

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/ui/flavor-wheel-geometry.ts` | shared | modified: ring bounds by visible depth (D1) |
| `src/shared/ui/flavor-wheel-geometry.test.ts` | shared | modified (tasks 1.1) |
| `src/shared/ui/FlavorWheel.tsx` | shared | modified: collapsible section, layout rows (D2, D3) |
| `src/shared/ui/FlavorWheel.test.tsx` | shared | modified (tasks 2.1, 3.1) |

No route, page, widget, feature or entity file changes. `FlavorWheel.tsx` importing a sibling `shared/ui` module is allowed: `shared` has no slices.

## Risks / Trade-offs

- **Dependency not in the base yet.** `add-collapsible-section` is implemented on `feature/add-collapsible-section` but not merged into `develop` (`2bc37aa`), which this branch was created from. Tasks of section 3 import `Collapsible` from `@/shared/ui` and cannot be built until that change is merged into this branch's base (agents never merge). Sections 1 and 2 do not depend on it.
- **The wheel rescales under the pointer.** Expanding a note by click moves every ring boundary at once; after the rescale, the active note is the one under the still pointer, which may be a different segment (spec "Description on hover"), so the panel may change. A click in the inner part of the ring keeps the clicked note active; keyboard activation is unaffected. Accepted by Q4 (b).
- **Label coverage at each `V` with real counts is unverified** until the browser check (task 4.1).
- **jsdom and `inert`.** jsdom does not compute the accessibility effect of `inert`; tests assert the attribute and the shared section's own tests cover its behaviour.

## Migration Plan

None: the props are unchanged, so the host needs no edit.

## Open Questions

None. The note list title text (summary Open 1) is the host's and does not block this change: the orchestrator approved "Notas" / "Notes" / "Notes" under `wheelNotes`, owned by `add-offering-catalog`.

Status: approved

# Design summary — fix-collapsible-overflow

Input for `/opsx:propose`. Drafted by the design lead on 2026-10-07. Approved by the orchestrator under Product owner's autonomy mandate (2026-10-07): a defect fix that restores specified behaviour, with no open product point.

- Change-id: `fix-collapsible-overflow`
- Capability: `content-structure` (owner of the shared collapsible section, `src/shared/ui/Collapsible.tsx`).
- Branch and folder: `feature/fix-collapsible-overflow`, `openspec/changes/fix-collapsible-overflow/`, `docs/design/fix-collapsible-overflow/`.
- Depends on: `add-collapsible-section` (merged).
- Backlog: no entry names it.

## 1. Defect

Design lead's browser review, 2026-10-07. A collapsed body hides its content visually (`grid-rows-[0fr]`, `invisible`, `[clip-path:inset(0)]`), and its inner wrapper (`min-h-0`) shrinks to zero height, but nothing clips the wrapper's layout overflow. The hidden content still overflows below the zero-height row and extends the page's scrollable area: on the evaluation form at 375px the page scrolls to 2512px while the visible content ends at 1324px, leaving a blank area below. `clip-path` and `visibility` only affect painting, not scrollable overflow.

## 2. Expected end state

content-structure spec, "Collapsible section": while collapsed the body shows nothing, so a collapsed section shows only its header. In addition, stated explicitly by this change:

- A collapsed body contributes no height to the page: the page does not scroll past its visible content because of a collapsed section.
- Opening and closing keep the 0.25s height animation, and stay instant under reduced motion.
- Content inside a collapsed body stays out of the tab order and the accessibility tree (unchanged: `inert`).
- No visual change while expanded: a control at the body's edge keeps its full 4px focus ring (the expanded `[clip-path:inset(-4px)]` stays).

## 3. Mechanism

The body's inner wrapper (the grid row child, already `min-h-0`) also gets `overflow-hidden` while the section is collapsed, and only then. Expanded, the wrapper keeps visible overflow so the focus ring is not clipped.

- Closing: `overflow-hidden` applies at once, as the clip-path already narrows to `inset(0)` at once; the painted result during the animation is unchanged.
- Opening: `overflow-hidden` drops at once; the clip-path keeps clipping the paint to the animating row until the animation ends, as today.
- No new token, no change to Collapsible's API (`Collapsible`, `CollapsibleHeader`, `CollapsibleBody` props unchanged), no change to the outer body's classes.

## 4. Consumers to keep green

Every consumer goes through `CollapsibleBody`, so the fix reaches all of them; their tests must stay green and none needs changing:

- Evaluation form groups (section cards with a collapsible header band).
- Offering catalog per-axis sections (`src/widgets/offering-detail/ui/ConsensusPanel.tsx`).
- Facets (`FacetCascade`, `FacetRadioList`) and the flavor wheel notes (`FlavorWheel`).
- Card's collapsed section variant (`Card.tsx`, `Card.test.tsx`).

## 5. Open

None.

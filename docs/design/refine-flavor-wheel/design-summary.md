Status: approved — by the orchestrator in Product owner's absence (overnight mandate, 2026-10-06): Open 1 the list title stays "Notas" / "Notes" / "Notes" (key `wheelNotes`). Product owner may reopen it.

# Design summary — refine-flavor-wheel

Change-id: `refine-flavor-wheel` · capability `feedback` · follow-up of the archived `add-flavor-wheel` (`openspec/changes/archive/2026-10-06-add-flavor-wheel/`, on `feature/add-flavor-wheel`, not yet merged into `develop`). Drafted by the design lead on 2026-10-06 (generation mode). Values marked *(computed)* are the design lead's own; *unverified* marks what was not checked.

## 1. Scope

Two answers of Product owner (decisions log, "2026-10-06 — secciones plegables, rueda y facetas (respuestas de Product owner)"; `add-flavor-wheel` handoff, Q4 and Q5):
- **Q4 (b):** the rings are sized by the deepest level that is currently expanded, so the wheel rescales as notes expand and collapse. This replaces the archived design.md D5 rule, which sized them by the deepest level in the whole tree so the wheel never rescaled.
- **Q5:** the note list's expand control becomes the shared collapsible section header from `add-collapsible-section`.

Unchanged:
- the colour rule (D4) and the keyboard model (D6);
- the panel (D7), the empty state (D10) and the props (D1);
- the label rules of round 1: arched labels, fit rule, name shown on activation, 4-unit gap, hole 80, font sizes 13/12/12;
- the contrast gates.

No contract operation, no new token, no new dependency.

## 2. Contract operations consumed

None directly, as before. The host (`add-offering-catalog`) loads `getAnOffering` and `listOlfactoryTaxonomies` and passes resolved props. The `FlavorWheelProps` shape does not change (§3), so the catalog's call is unaffected.

## 3. Composition (FSD) and files

| Path | Change |
|---|---|
| `src/shared/ui/flavor-wheel-geometry.ts` | modified: the ring bounds come from the visible depth (§4.1) |
| `src/shared/ui/flavor-wheel-geometry.test.ts` | modified (§6) |
| `src/shared/ui/FlavorWheel.tsx` | modified: the note list control and the list become `Collapsible` / `CollapsibleHeader` / `CollapsibleBody` from `@/shared/ui` (§4.2); grid rows (§5) |
| `src/shared/ui/FlavorWheel.test.tsx` | modified (§6) |

The props stay `nodes`, `total` and `texts` (`label`, `hint`, `emptyMessage`, `notesToggle`). `notesToggle` keeps its name and becomes the section title, so no host or catalog change follows. `FlavorWheel.tsx` importing a sibling `shared/ui` module is allowed: `shared` has no slices.

## 4. Behaviour

### 4.1 Rings by the deepest expanded level (Q4 b)

`V` is the deepest ring that holds a visible segment, capped at 2:
- 0 when nothing is expanded;
- 1 when a root is expanded;
- 2 when a level-1 note is expanded.

Expansion only ever opens a parent with children (D6), so each expansion adds exactly the next ring. The D5 ring table keeps its values and is keyed by `V` instead of the tree depth `D`:

| V (visible depth) | Hole | Ring 0 | Ring 1 | Ring 2 |
|---|---|---|---|---|
| 0 (nothing expanded) | 0–80 | 80–200 | — | — |
| 1 | 0–80 | 80–140 | 140–200 | — |
| 2 | 0–80 | 80–120 | 120–160 | 160–200 |

How `V` changes:
- Collapsing a note (which also collapses its descendants) or pressing Escape (which collapses everything) recomputes `V`. After Escape the wheel returns to `V` = 0.
- A wheel whose tree has no children stays at `V` = 0, as before.

**Rescale is instant.** Archived design.md D6 settles "Expansion is instant; there is nothing to reduce for `prefers-reduced-motion`", and the rescale is part of the expansion. This is settled under criterion B: the fewest decisions change, and it adds no motion and no new reduced-motion case.

**What changes on screen.** These numbers are for a tree three levels deep, at rest *(computed)*:
- ring 0 grows from 80–120 to 80–200;
- the name line moves from radius 108.2 to 188.2 (×1.74);
- the legend line moves from 92.6 to 172.6 (×1.86).

Each ring-0 label therefore gets roughly 1.7–1.9 times more arc length, and the round-1 observation "an empty ring 2 shows while notes are collapsed" goes away. How many labels show at rest with real counts is *unverified*: it is checked at the visual review (§7).

Everything else follows the segment geometry and needs no new rule:
- labels, the fit rule and the name shown on activation;
- the active outline and the 4-unit gap;
- the hit areas.

### 4.2 Note list control as the collapsible header (Q5)

- The archived D7 disclosure button (chevron on the left, start-aligned at content width, `type-body` / `text-primary`, `hover:bg-surface-section`) is replaced by the shared section:
  - `CollapsibleHeader` with `texts.notesToggle` as its title;
  - no `aside`, no `headingLevel`: it stays a control inside the figure, as before.
- The tree `ul` goes inside `CollapsibleBody`.
- The section is uncontrolled with `defaultOpen` false, so the list stays collapsed at first (round 1, item 1).
- The header's look, chevron, animation and accessibility are those of `add-collapsible-section` (its §4–§6):
  - a full-width header, title on the left;
  - a chevron on the right, down when collapsed and up when expanded, in `text-accent` at 80% that rises to 100% on hover and focus;
  - `aria-expanded`, and `aria-controls` naming the body in both states;
  - `focus-visible:focus-ring`;
  - a 0.25s open and close, instant under reduced motion.
- Kept from D7:
  - the visible text is the accessible name and does not change with the state;
  - collapsing the list keeps the wheel's expansion and the active note;
  - only the list collapses: the description panel never collapses.
- Now provided by the shared section:
  - the hidden list stays in the DOM, so `aria-controls` resolves and the row refs survive;
  - it leaves the tab order (shared body: `inert` while collapsed, instead of the `hidden` attribute on the `ul`).
- This reverses the F2 fix (`f25b478`, `@2xl:justify-self-start`): the control is now full width by Product owner's Q5 answer.

## 5. Layout and spacing (criterion A)

Unchanged from archived D8: the container query, the 32rem cap, the column widths, the panel box and the rows.

What changes:

| Element | Value | Source |
|---|---|---|
| Layout below 42rem | flex column: wheel, panel, collapsible section; 1.5rem apart | D8 (the separate control and list become one section) |
| Layout from 42rem | column 1: the wheel, spanning both rows; column 2: the panel (row `auto`), then the section (row `1fr`); column gap 2rem, row gap 1.5rem | D8 with one row fewer (`auto auto 1fr` → `auto 1fr`; the wheel spans 2 rows instead of 3) |
| Section header | full width of its column (≥ 16rem in column 2; the card's content width below 42rem); 0.5rem padding; min height 2.5rem; title–chevron gap 0.5rem; no border; no background; radius `radius-field` | `add-collapsible-section` §6.1 |
| Section body | 0.5rem top padding above the list; no other padding, border or background | MVC legend body `p-2` (`evaluation-form.blade.php:80`); the list's left edge stays aligned with the header's edge |
| List | unchanged: a flex column with 0.25rem between rows; rows min 2.5rem, padding 0.25rem 0.5rem, indent 0 / 1.5rem / 3rem | D8 |
| Focus rings of rows at the body's edge | never clipped while expanded | `add-collapsible-section` §4.3 end state |

At 375px nothing scrolls horizontally: the header wraps its title and the chevron never shrinks. At 1280px the header spans column 2, about 524px wide *(computed in D8)*.

ASCII mock-up (1280px, from 42rem of container width):

```
┌───────────────────────────────┐  ┌──────────────────────────────┐
│                               │  │ ■ Frutal              4/5    │ ← panel (unchanged)
│        wheel, V = 0:          │  │ description…                 │
│   ring 0 fills 80–200;        │  └──────────────────────────────┘
│   expanding a note splits     │  ┌──────────────────────────────┐
│   into 80–140 / 140–200       │  │ NOTAS                     ⌄  │ ← shared header, full width
│                               │  └──────────────────────────────┘
└───────────────────────────────┘    (list: 0.5rem below, when open)
```

Visual references:
- `feature/add-flavor-wheel:docs/design/add-flavor-wheel/captures/round1-1280-light.png` and `round1-375-light.png` (current state, `V` = `D`);
- the mock-up above (target).

## 6. Tests: what changes (criterion: name each existing assertion)

`flavor-wheel-geometry.test.ts`:
- **Replaced:** "sizes rings by the deepest level of the whole tree, expanded or not" (`:85-91`). It asserted `radii` = `ringRadii(2)` and the root at 80–120 with nothing expanded. The new cases, each fails on the old rule and passes on the new:
  - a three-level tree with nothing expanded gives `ringRadii(0)`, with the root at 80–200;
  - with `a` expanded, `ringRadii(1)`: `a` at 80–140 and `a1` at 140–200;
  - with `a` and `a1` expanded, `ringRadii(2)`.
- **Added:** collapsing back (removing `a` from the expanded set) returns `ringRadii(0)`.
- **Wording only:** the file's doc comment, "ring radii by the deepest level of the whole tree" (`:15`).
- **Unchanged:** "places a child inside its parent's span…" (depth 1, `a` expanded, so `V` = `D` = 1); `ringRadii`, `arcPath`, `labelRadius`, `labelPath` and `fitLabel`.

`FlavorWheel.test.tsx`:
- **"FlavorWheel — note list disclosure" (`:180-252`):**
  - `TOGGLE_CLASSES` (`:181-182`) and "takes the row treatment, start-aligned at content width" (`:228-237`, including the `@2xl:justify-self-start` assertion) are replaced by assertions that the control is the shared `CollapsibleHeader`: its full-width classes, and the title `texts.notesToggle`.
  - "collapses the note list at first…" (`:184-198`) changes two things:
    - `aria-controls` now names the section body that holds the tree, not the `ul` itself;
    - the collapsed check moves from `list.hasAttribute("hidden")` to the body's `inert`. The same applies at `:205` and `:214`.
  - "shows a hidden chevron that follows the state, with a constant name" (`:218-226`) now asserts the chevron's rotation by state, instead of a swap between `ChevronRight` and `ChevronDown`.
  - The helper that opens the list before querying rows (`:84-85`) keeps working, through the button named `texts.notesToggle`.
- **"lays out by container width…" (`:157-178`):** the grid row template `auto auto 1fr` → `auto 1fr`, and the wheel's row span 3 → 2.
- **Added:** expanding a root rescales ring 0 from 80–200 to 80–140 (segment path data from `layoutWheel` with the new rule), and Escape returns it to 80–200.
- **Unchanged:** the label, active-name, keyboard, colour, panel and empty-state cases. They compute their expected geometry through `layoutWheel`, so they follow the new rule. The build confirms this when it runs them (not predicted here, per `AGENTS.md`).

## 7. Contrast (criterion D)

- New pairs on the wheel's host surface `surface-card`: the header title `text-accent` (6.85 traditional / 6.82 dark), the chevron at 80% (4.50 / 4.78), and the chevron at 100% (6.85 / 6.82) *(computed; `add-collapsible-section` §5)*. All pass, and `text-accent` / `surface-card` is already registered (`theme-tokens.test.ts:304`, dark block).
- The removed control's `text-primary` pairs stay registered, because the rows still use them.
- The rescale changes no colour: segment labels keep the badge label rule, and the active name keeps its `text-primary` / `surface-card` halo.
- No new guard pair.

Visual review (design lead, after the build): captures at 375px and 1280px in both themes, in three states: at rest, one root expanded, and two levels expanded. They check that labels fit at each `V`, that there is no horizontal scroll, that the header has a focus ring and is full width, and that the list's row focus rings are not clipped at the body edge.

## 8. Texts

No new key. `notesToggle` is the title. The host key proposed in round 1 is `wheelNotes`: es "Notas", en "Notes", ca "Notes". It still awaits Product owner's confirmation (Open 1), and it lives in the host's catalog (`add-offering-catalog`), not in this change.

## 9. Dependencies

- **Waits for:**
  - `add-flavor-wheel` merged into `develop`. The merge of `develop` into it was running in the cloud, `trig_01NzH6pqU9a9YVH5RkatxZya`, according to the board.
  - `add-collapsible-section` merged.
- **Consumers:**
  - `add-offering-catalog` renders the wheel. The props are unchanged, so the catalog needs no edit. Both changes touch `FlavorWheel.tsx` only if the catalog edits it, which its artifacts do not plan (*unverified*: no `git merge-tree`, because this change has no branch).
  - `add-public-evaluations` may reuse the wheel (decisions log), with the same props.
- **Backlog:** none affected.
- **Decisions log:** "secciones plegables, rueda y facetas"; "add-offering-catalog: preguntas del propose" item 3 (the props stay those of the approved summary).

## 10. Findings on existing code

None new. The archived lint warning W1 (`aria-selected` on `treeitem`) stays as Product owner answered (Q2 a).

## Open

1. **Note list title text** (handoff Q5, the text half).
   - Options: confirm es "Notas" / en "Notes" / ca "Notes" under host key `wheelNotes`, or edit them.
   - Recommendation: confirm. It is short and matches the panel's vocabulary (archived design.md D9).
   - Blocks propose: no. The text is the host's, and this change's prop name does not change.

## Review log

### 2026-10-06 — design lead, generation
Settled under criterion B:
- **Rescale instant:** keeps archived D6 ("Expansion is instant"), the fewest decisions changed.
- **Ring values kept:** only the key of the D5 table changes (from `D` to `V`). Product owner's Q4 (b) asked for sizing by the expanded level, not for new radii.
- **`notesToggle` keeps its name:** no host or catalog change.
- **Body top padding 0.5rem:** from the MVC legend body (`p-2`).
- **Full-width control:** reverses F2 (`f25b478`). This is a consequence of Q5, not a new decision.

Each affected test is named with its line range on `feature/add-flavor-wheel` (§6).

## Propose status

- Change-id: `refine-flavor-wheel` (capability `feedback`), proposed 2026-10-06 by the architect in a cloud routine.
- `openspec validate refine-flavor-wheel --strict` (`@fission-ai/openspec@1.13.2`): valid.
- Resolved:
  - Visible depth `V` is computed inside `layoutWheel` from the expanded set, counting only nodes reachable through expanded parents (design.md D1).
  - The header and body sit in one `flex flex-col` wrapper so the section is one layout item; the 0.5rem body top padding is `pt-2` on the tree `ul`, inside the body's clipped row, so the collapsed body keeps zero height (design.md D3).
  - Open 1 (title text) stays the host's, as approved: "Notas" / "Notes" / "Notes" under `wheelNotes`; it does not block this change.
- Open: none. Risk: `add-collapsible-section` is not merged into `develop` (`2bc37aa`), so tasks 3.x cannot be built on this branch until it is (design.md Risks).
- Backlog: no entry affected or resolved.

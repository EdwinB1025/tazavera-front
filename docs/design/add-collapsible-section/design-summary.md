Status: approved — by the orchestrator in Product owner's absence (overnight mandate, 2026-10-06): Open 1 (a) build in-house; Open 2 1rem total header padding inside `CardAside` (for the add-specialist-evaluations round). Product owner may reopen them.

# Design summary — add-collapsible-section

Change-id: `add-collapsible-section` · capability `content-structure` · drafted by the design lead on 2026-10-06 (generation mode). Values marked *(computed)* are the design lead's own; anything marked *unverified* was not checked.

## 1. Scope

A shared collapsible section in `src/shared/ui`: a full-width header button and a body that it shows and hides, taken from the MVC evaluation form. Source: decisions log, "2026-10-06 — secciones plegables, rueda y facetas (respuestas de Product owner)":
- the header is a button across the whole width: title on the left, chevron on the right (down when collapsed, up when expanded);
- it carries `aria-expanded` and `aria-controls`, a visible focus indicator and an opening animation;
- it lives in `shared/ui` (`content-structure`), in its own change, before its consumers.

In scope: the component, its states, its tokens and contrast, its spacing, its tests, and one `content-structure` requirement.

Out of scope (each consumer adopts it in its own change):
- `add-specialist-evaluations` round 1: the CVA groups and the 1–9 legend use the section. Every section starts collapsed, except in a closed (read-only) evaluation, where every section starts open (decisions log entry above).
- `refine-flavor-wheel`: the note list control becomes this header (Q5).

The component owns no text, fetches nothing, and consumes no contract operation.

### 1.1 Capability

`content-structure` ("content containers ... for every screen that groups related content", `openspec/specs/content-structure/spec.md` Purpose). It sits below `app-shell` and the feature capabilities, at the same layer as `form-fields` and `feedback`, so both consumers (`feedback` and the evaluations feature) may use it.

## 2. Contract operations consumed

None. The component renders consumer content only.

## 3. Composition (FSD)

| Path | Layer | Change |
|---|---|---|
| `src/shared/ui/Collapsible.tsx` | `shared` | created: `Collapsible`, `CollapsibleHeader`, `CollapsibleBody` (`"use client"`: state and event handlers) |
| `src/shared/ui/Collapsible.test.tsx` | `shared` | created |
| `src/shared/ui/index.ts` | `shared` | modified: exports the three parts and their prop types |
| `src/shared/ui/index.test.tsx` | `shared` | modified: one smoke render, as for the other components |
| `src/app/styles/theme-tokens.test.ts` | `app` | modified: two new text pairs per theme (§5) |

No route, no page, no catalog file, no new token, no new icon export.

### 3.1 Parts and props (UI-only types, declared before the components)

The section is three compound parts, the `Card` / `CardAside` / `CardContent` pattern (`src/shared/ui/Card.tsx`: siblings that read shared state from a context). The parts are separate because the evaluation-group consumer puts the header in `CardAside` and the body in `CardContent` (`add-specialist-evaluations` summary §9, "Header in `CardAside` ... Body in `CardContent`"), which a single component with a fixed header-above-body markup could not do.

```ts
export type CollapsibleProps = {
  open?: boolean;                          // controlled
  defaultOpen?: boolean;                   // uncontrolled, default false
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type CollapsibleHeaderProps = {
  children: ReactNode;                     // the title: the button's accessible name
  aside?: ReactNode;                       // optional header content beside the title (for example a completeness indicator)
  headingLevel?: 2 | 3 | 4 | 5 | 6;        // optional: wraps the button in a heading of that level
  className?: string;                      // class extension, merged with `cn`
};

export type CollapsibleBodyProps = HTMLAttributes<HTMLDivElement>; // the consumer's content and classes
```

- `Collapsible` renders no element of its own: it only provides the open state and the body id. Because of that, it can wrap a `Card` without breaking the card's flex layout.
- With `open` given, the section is controlled and reports each toggle through `onOpenChange`. Without it, the section keeps its own state, starting at `defaultOpen`. This follows the Radix convention the project already uses (`radix-ui` Popover and Dialog).

## 4. Components, states and accessibility

### 4.1 Header (`CollapsibleHeader`)

Structure:
- A native `<button type="button">` holding, in order:
  1. a title block: the title, then the optional `aside`;
  2. the chevron.
- With `headingLevel` given, the button sits inside an `<h{n}>` with no margin of its own (APG Accordion pattern: the button inside the heading). Without it, there is no heading.

Accessibility and states:
- `aria-expanded` follows the state. `aria-controls` holds the body id **in both states**, because the body stays in the DOM (§4.3).
- Accessible name: the title only, through `aria-labelledby` pointing at the title element.
- `aside`: when given, the header points at it through `aria-describedby`. The name stays the title, and the aside is read as its description. Source: `add-specialist-evaluations` summary §9, "accessible name = the group name".
- Chevron: `ChevronDown` from `@/shared/ui/icons`, `aria-hidden`.
  - It points down when collapsed and turns 180° to point up when expanded. The rotation runs with the body's animation (§4.3).
  - Reuse: no `ChevronUp` export is added. The rotation is the `add-specialist-evaluations` summary §9 precedent ("ChevronDown icon (rotated when open)").
  - The state is never carried by the chevron alone: `aria-expanded` carries it.
- Focus: `focus-visible:focus-ring` (settled design rule).
- Hover:
  - the chevron goes from 80% to 100% opacity. The same rise applies while the header has keyboard focus (`focus-visible`). Source: MVC `evaluation-axis.blade.php:23` `opacity-80 group-hover:opacity-100 transition-opacity`.
  - The header's background never changes (the MVC button has no background of its own).
- Disabled: not offered. No consumer needs it (YAGNI).

### 4.2 States

| State | Header | Body |
|---|---|---|
| collapsed (default) | `aria-expanded="false"`, chevron down | zero height, `inert`: out of the tab order and the accessibility tree |
| expanded | `aria-expanded="true"`, chevron up | full height, interactive |
| hover / focus-visible | chevron at 100% opacity; focus ring when focus-visible | — |
| reduced motion | no rotation animation | opens and closes instantly |

### 4.3 Body (`CollapsibleBody`)

- A `div` with the stable id that the header's `aria-controls` names. It stays mounted while collapsed, so `aria-controls` always resolves and consumer state inside it survives a collapse (the flavor wheel's roving row refs rely on this).
- While collapsed:
  - it is `inert`;
  - it takes zero height and nothing of it shows.
- Opening animation:
  - height from zero to the content height and back, over 0.25s, ease-out, with the chevron rotation over the same time. The 0.25s duration is taken from Alpine's `x-collapse` default, used by the MVC (`x-show="open" x-collapse`, `evaluation-axis.blade.php:34`); that default is *unverified*.
  - The animation needs no measurement of the content in script; jsdom cannot measure it (`AGENTS.md` testing note).
  - Under `prefers-reduced-motion: reduce`, there is no transition: the body opens and closes instantly, and the chevron turns instantly.
- End state for the clipping (the build picks the mechanism):
  - while expanded, the focus ring of a control that touches the body's edge is never clipped;
  - while collapsed or animating, nothing outside the animated height shows.
- No `role="region"`: a disclosure body is not a landmark (APG Disclosure pattern), and every consumer already sits inside a named card or figure.

### 4.4 Library check (criterion C)

- Candidate: shadcn/ui Collapsible, which is Radix Collapsible. It is already installed: `radix-ui` ^1.6.7 re-exports `@radix-ui/react-collapsible` 1.1.20 (`node_modules/radix-ui/dist/index.d.ts:13`). It is not a forbidden shadcn control.
- Verified in `node_modules/@radix-ui/react-collapsible/dist/index.mjs`:
  - **Line 66:** the trigger sets `aria-controls` only while open (`context.open ? context.contentId : void 0`).
  - **Line 84:** the content unmounts while closed, through `Presence`, unless `forceMount` is set.
  - **Lines 129–137:** with `forceMount`, the content computes `isOpen` as always true. It then never sets `hidden` and always renders its children, so the consumer has to hide it.
  - The opening animation relies on `getBoundingClientRect` and the `--radix-collapsible-content-height` variable, plus keyframes the project does not have.
- Result:
  - Radix as it ships contradicts the settled `aria-controls` in both states.
  - It also removes the body that the flavor wheel test asserts as present-but-hidden (`FlavorWheel.test.tsx:193-194`).
  - Making it fit means overriding both its `aria-controls` and its hiding, which fights the library.
- The disclosure pattern itself is trivial: one button, one state, one region. It is built in-house as §4.1–§4.3 describe, with no new dependency.
- Settled under criterion B as a verified technical constraint (Review log). Product owner may reopen it (Open 1).

## 5. Semantic tokens and contrast

MVC translation (colours never copied):

| Part | MVC | Token |
|---|---|---|
| Title | `flux:subheading` (`text-lg`) | `type-subheading`. Its colour is `text-accent`, the project's subheading role, used for the evaluation group names (`add-specialist-evaluations` summary §9) |
| Chevron | `color: var(--color-primary)` (MVC primary, `brown-600`), 80% → 100% | `text-accent`, the project's text and icon role of the brand red. `action-primary` is a button fill, not a text or icon role |
| Focus | — | `focus-visible:focus-ring` (`focus-ring` over `focus-offset`, already registered) |
| Header background | none (transparent button) | none: the consumer's surface shows |

The header sits on these consumer surfaces:
- `surface-card`: evaluation group cards and the wheel's host card;
- `surface-section`: the 1–9 legend panel (MVC `tz-card-section`);
- `surface-section-hover`: the legend panel on hover (MVC `.tz-card-section:hover`; the surface list of the `add-specialist-evaluations` summary §10).

No consumer places it on `nav-surface-dark` or another sidebar surface, so those are not gated.

Measured with an executed script (`scratchpad/contrast.mjs`, WCAG relative luminance; the 80% values blend the colour over the surface) *(computed)*:

| Pair | Gate | Traditional | Dark |
|---|---|---|---|
| title `text-accent` / `surface-card` | 4.5 | 6.85 | 6.82 |
| title `text-accent` / `surface-section` | 4.5 | 6.11 | 6.17 |
| title `text-accent` / `surface-section-hover` | 4.5 | 5.73 | 5.43 |
| chevron `text-accent` at 80% (rest) / `surface-card` | 3.0 | 4.50 | 4.78 |
| chevron at 80% / `surface-section` | 3.0 | 4.15 | 4.42 |
| chevron at 80% / `surface-section-hover` | 3.0 | 3.97 | 3.99 |
| chevron at 100% (hover, focus) | 3.0 | same as the title rows | same as the title rows |

Everything passes. No new primitive or semantic token is needed.

Guard pairs to register in `theme-tokens.test.ts`, both themes, `kind: "text"`, each skipped if already registered when this change merges:
- `text-accent` / `surface-section`;
- `text-accent` / `surface-section-hover`.

`text-accent` / `surface-card` and the focus pairs are already registered (`theme-tokens.test.ts:304`, `:363-364`, and the dark block). The guard cannot express the 80% rest blend; it is recorded here as measured, at its lowest 3.97.

## 6. Layout and spacing (criterion A)

### 6.1 Header button

| Property | Value | Source |
|---|---|---|
| Width | the full width of its container | decisions log; MVC `w-full` |
| Layout | one row; title block left, chevron right (`justify-between`); items centred vertically | MVC `flex items-center justify-between` |
| Gap, title block ↔ chevron | 0.5rem | MVC `gap-2` |
| Gap, title ↔ aside (title block) | 0.75rem horizontally; the block wraps, with 0.25rem between wrapped lines | MVC `gap-3` (the 0.25rem row gap *(computed)*, the badge-row value) |
| Padding | 0.5rem on every side | MVC button `py-2 px-2` |
| Minimum height | 2.5rem | the project's control height (`fix-button-boundaries`; flavor wheel rows `min-h-10`) |
| Text alignment | start; the title wraps (no truncation, `min-w-0`) | MVC `text-left` |
| Border | none | MVC button has none |
| Radius | `radius-field`, so the focus ring follows a rounded shape in traditional and a square in dark | flavor wheel rows; base-controls |
| Background | none, at rest and on hover | MVC |
| Margin | none: the consumer places it | — |
| Chevron | 1rem square, never shrinks | MVC `w-4 h-4` |
| Heading wrapper (when `headingLevel`) | no margin, no padding, block | — |

### 6.2 Body

- No padding, border, background or margin of its own: the consumer's content brings its spacing. This follows the MVC, where each body sets its own (`p-4` on the axis body, `p-2` with `tz-top-border-card` on the legend).
- No gap between header and body comes from the component.
- Animation: 0.25s ease-out, instant under reduced motion (§4.3).

### 6.3 Consumer guidance (not built here; recorded so the consumers' rounds start from it)

**Evaluation group (`add-specialist-evaluations`):**
- `Collapsible` wraps the `Card`;
- `CollapsibleHeader` goes inside `CardAside`, with `aside` holding the completeness indicator;
- `CollapsibleBody` wraps `CardContent`.

Its round settles:
- whether `CardAside`'s 1.5rem padding is kept around the header's own 0.5rem, which gives 2rem from the card edge to the title, against the MVC's 1rem (`tz-card-section p-2` plus the button's `p-2`);
- whether `CardAside`'s bottom border should show while the body is collapsed.

**1–9 legend:**
- a `surface-section` panel (radius `radius-container`, 1px `border-subtle`; the score-panel treatment of that summary §9) holding the header;
- the body with 0.5rem padding and a 1px top border `border-subtle` (MVC `p-2 tz-top-border-card`).

**Flavor wheel note list:** see `docs/design/refine-flavor-wheel/design-summary.md` §4.

### 6.4 Responsive

The component is the same at every width: it has no breakpoint of its own. At 375px the title wraps before the chevron moves; the chevron never shrinks. The consumers own their breakpoints (project breakpoints `md` 48rem, `lg` 64rem).

### 6.5 Visual reference

Sources:
- MVC `resources/views/livewire/evaluations/evaluation-form.blade.php:67-91` (1–9 legend);
- MVC `resources/views/layouts/evaluations/partials/evaluation-axis.blade.php:14-34` (group header).

No capture was taken: no server in this design phase. ASCII mock-up, not to scale:

```
collapsed (on surface-card)
┌──────────────────────────────────────────────────────────┐ ← consumer surface
│ ┌──────────────────────────────────────────────────────┐ │
│ │ FRAGANCIA / AROMA   [✓ Completo]                  ⌄  │ │ ← header: 0.5rem padding, min 2.5rem
│ └──────────────────────────────────────────────────────┘ │   title type-subheading, chevron text-accent 80%
└──────────────────────────────────────────────────────────┘

expanded
│ │ FRAGANCIA / AROMA   [✓ Completo]                  ⌃  │ │ ← chevron turned 180°, 100% on hover
│ ├──────────────────────────────────────────────────────┤ │
│ │  consumer body (its own padding)                     │ │ ← height animates 0.25s; instant on reduced motion
```

## 7. Texts (message catalog, es / en / ca)

None owned. The title and the aside arrive as props from each consumer's catalog area. The component adds no visible or accessible text of its own.

## 8. Tests (expected coverage, jsdom: classes and attributes)

These items fail on the old or missing behaviour and pass on the end state:
1. collapsed by default: `aria-expanded="false"`, body `inert`, `aria-controls` equal to the body id;
2. a click toggles the state; `aria-controls` is still present and resolving in both states;
3. `defaultOpen` starts the section expanded;
4. controlled: with `open`, a click reports `onOpenChange(!open)` and does not change the state until the prop changes;
5. the accessible name is the title only, with an `aside`; the aside is the description;
6. `headingLevel={3}` wraps the button in an `h3`; without it there is no heading;
7. the chevron is `aria-hidden`, and its rotation classes follow the state; the reduced-motion classes are present;
8. the header carries `focus-visible:focus-ring`, the full-width row classes, the 0.5rem padding and the 2.5rem minimum height (the build pins the exact classes it chose);
9. no colour outside the semantic tokens, and no radius outside the radius tokens: the existing `color-guard`, `focus-guard` and `radius-guard` cover the new file;
10. `client-boundary`: the file carries `"use client"`.

## 9. Dependencies

- Builds on: `content-structure` (Card pattern), `theming` (tokens, `focus-ring`), the icon entry point `src/shared/ui/icons.ts` (`ChevronDown`, already exported).
- Consumers, which wait for this merge:
  - `add-specialist-evaluations` round 1;
  - `refine-flavor-wheel` (Q5).
- Backlog: no entry is affected. R4 (menu radius) and R9 (Clear all) do not touch this code.
- Decisions log: "2026-10-06 — secciones plegables, rueda y facetas".
- Shared files: `src/shared/ui/index.ts`, `index.test.tsx`, `theme-tokens.test.ts`. These are additive exports and pairs, also touched by every open change that adds a shared component (catalog, management, the facets changes). Merge conflicts would be additive. `git merge-tree` was not run, because this change has no branch yet (*unverified*).

## 10. Findings on existing code

None.

## Open

1. **Build it in-house, or on Radix Collapsible?**
   - Options:
     - (a) in-house, as §4.4 describes: the settled `aria-controls` holds in both states and the body stays mounted;
     - (b) Radix Collapsible, with `forceMount` plus a consumer-side `hidden` and an always-set `aria-controls`: this overrides both of the library's choices;
     - (c) Radix as it ships: `aria-controls` only while open and the body unmounted. That changes the settled decision and the flavor wheel's asserted behaviour.
   - Recommendation: (a). The pattern is trivial, there is no new dependency, and every settled point is kept. Source: §4.4, verified in `node_modules`.
   - Already settled as (a) under criterion B (Review log); listed so Product owner can reopen it.
   - Blocks propose: no.
2. **Header spacing inside `CardAside`.** This is decided by the `add-specialist-evaluations` round, not here (§6.3); it is recorded so it is not lost.
   - Options: keep `CardAside`'s padding (2rem from the card edge to the title), or reduce `CardAside`'s padding to 0.5rem around this header (1rem in total, as in the MVC).
   - Recommendation: reduce it, to match the MVC.
   - Blocks propose: no (this change).

## Review log

### 2026-10-06 — design lead, generation
Settled under criterion B:
- **Header geometry and colours:** translated from the MVC (§5, §6) to existing tokens. No colour was copied.
- **Chevron:** a rotated `ChevronDown`, not a new `ChevronUp` export (criterion C; the `add-specialist-evaluations` summary §9 precedent).
- **In-house rather than Radix (Open 1):** a verified library constraint (Radix 1.1.20 drops `aria-controls` while closed and unmounts the body) contradicts the settled decision. The in-house option changes no decision and adds no dependency.
- **Accessible name:** the title, with the aside as its description. This keeps the `add-specialist-evaluations` summary §9 name rule while letting the indicator sit in the header.
- **Compound parts instead of one component:** the existing `Card` / `CardAside` / `CardContent` composition of the first consumer requires it.

Measured: title and chevron contrast on three surfaces in both themes (§5), *(computed)*.

## Propose status

- Change-id: `add-collapsible-section` (capability `content-structure`), proposed 2026-10-06.
- `openspec validate add-collapsible-section --strict`: valid.
- Resolved:
  - Open 1: (a) built in-house, as approved by the orchestrator (design.md D7). No dependency.
  - Ids per instance with React `useId`; the body's id always comes from the section, never from a consumer prop (design.md D3, single-component detail).
  - In uncontrolled use, `onOpenChange` also reports each toggle when given (design.md D2).
- Open:
  - Open 2 (header padding inside `CardAside`): recorded for the `add-specialist-evaluations` round; not settled here.
  - The 0.25s duration stays *unverified* against Alpine's default (design.md Risks); the browser check of task 3.2 is taken by the design lead.
- Noted, not added: `focus-ring` / `surface-section-hover` is not a registered guard pair; §5 asks only for the two text pairs.
- Backlog: no entry resolved or affected.

# Design

## Context

See proposal.md (Why) for the motivation. The design source of truth is `docs/design/refine-page-surfaces/design-summary.md` (`Status: approved`; Open 1–3 answered (a) by Product owner on 2026-10-07; Open 4–6 take option (a)). This design records only how the summary's end states land in the code; it does not re-decide them.

Current state on `develop`:
- `src/app/styles/globals.css`: `--color-surface-page` is `var(--color-cream-100)` in the traditional `@theme` block and `var(--color-night-petrol-950)` in the dark block; `--color-sage-100` (`#dae9e6`) already exists; `surface-section` / `surface-section-hover` are `cream-200` / `cream-300` (dark `night-petrol-850` / `night-petrol-800`).
- `src/app/shell/SessionShell.tsx` paints the main area with `bg-surface-page`; `src/shared/ui/PageSection.tsx` paints `surface="page"` with `bg-surface-page`. Neither changes: the token carries the backdrop.
- `src/shared/ui/Card.tsx`: a root with `bg-surface-card rounded-container border-l-4 border-border-accent shadow-lg`, a `layout` prop (`default` | `stacked`) passed to the parts through a context, and parts `CardAside` / `CardContent` / `CardFooter` padded `p-6`.
- `src/shared/ui/Collapsible.tsx`: `CollapsibleHeader` renders a button with `aria-expanded` and its own `p-2`, `min-h-10` and `focus-visible:focus-ring`; `CollapsibleBody` stays mounted while collapsed (zero height, clipped, inert).
- `src/shared/ui/radius-guard.test.ts` allows only `rounded-pill`, `rounded-container`, `rounded-field`, `rounded-check`, `rounded-full` and `rounded-none` (no directional radius utilities).
- No popup in `src/shared/ui` renders in flow: `DropdownMenu`, `Combobox`, `AlertDialog` and `Sheet` render through portals.

## Goals / Non-Goals

**Goals:**
- The backdrop and the section card exist on `develop` so that each feature adopts them in its own round (design summary §9.4).
- The section card is a variant of the existing `Card`, not a new component (summary §6.1, criterion C).

**Non-Goals:**
- No shared "body container" or view-layout component: the body container is layout only (summary §3, L1), built by each view inside `PageSection` with its `containerClassName`. The composition rule lives in the `content-structure` spec ("Page sections").
- No change to `Collapsible`, `PageSection`, `SessionShell`, the focus ring or any token other than `surface-page` in the traditional theme.
- No screen adopts the section card in this change.

## Files

| File | FSD layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | app | Traditional block: `--color-surface-page: var(--color-sage-100);`. Dark block unchanged. |
| `src/app/styles/theme-tokens.test.ts` | app | Six pairs in both matrices; a backdrop value guard (D6). |
| `src/shared/ui/Card.tsx` | shared | `variant` prop with the `section` variant (D2–D5). |
| `src/shared/ui/Card.test.tsx` | shared | Section variant cases; default-variant tests unchanged. |
| `src/shared/ui/index.ts` | shared | Also exports the `CardVariant` type. |

No route, page, widget, feature or entity file is created or modified. No API endpoint is consumed, so no API type, error presentation or card field mapping applies.

## Decisions

### D1 — Backdrop by repointing `surface-page` (summary §3, Open 1 a and 2 a)
The traditional `--color-surface-page` points to `var(--color-sage-100)`; the dark value stays `var(--color-night-petrol-950)`. The shell main area, `PageSection surface="page"`, and every matrix pair registered against `surface-page` follow the token with no class change. All gated pairs on the new backdrop pass, the lowest at 5.79:1 (summary §4.1, computed by the design lead). Alternatives (switching classes to `surface-inverse`, a new primitive) were withdrawn or rejected in the summary.

### D2 — `variant` prop on `Card`
`Card` takes `variant?: CardVariant`, with `export type CardVariant = "content" | "section"` declared with the other UI types before the components, default `"content"`. The `content` variant keeps today's classes and its `layout` behaviour exactly. The parts read the variant from the card, as they already read the layout (the existing context pattern; the build may widen the existing context or add a second one).

With `variant="section"`:
- The parts stack in DOM order at every width whatever `layout` says: no `lg:` float, width, side border, `flow-root` or `clear-both` class on any part, and none of the stacked layout's height-filling classes (a section card's height is its content's).
- Root: the card fill (`surface-card`), a 1px `border-subtle` border on all four sides, `rounded-container`, `shadow-lg`, no `border-l-4` and no `border-border-accent`, and it clips its content to its own corners (D3).
- Band (`CardAside`): fill `surface-section`, a 1px `border-subtle` bottom separator, its children in a flex column 0.5rem apart; padding and collapsible behaviour per D4.
- Body (`CardContent`) and footer (`CardFooter`): no fill of their own (the card's), padding 1rem left, right and top and 1.25rem bottom below 768px, 1.5rem on every side from 768px; no separator between body and footer.

The build chooses the utilities for these end states; `Card.test.tsx` asserts the classes it chose (AGENTS.md, Tasks).

### D3 — Outer corners by clipping, not by a band radius
The summary gives the band top corners `radius-container` and square bottom corners, and all four corners while collapsed (§5.3). The radius guard forbids directional radius utilities (`rounded-t-*`, `rounded-b-*`), so the section card root clips its content to its own rounded corners (overflow hidden) and the band takes no radius of its own. The visible result is the one the summary settles: the band's top corners follow the card's, its bottom edge is square against the body, and a collapsed card (band only) shows four rounded corners. In the dark theme `radius-container` is 0, so nothing is rounded.
- Alternatives: directional `rounded-t-container` (fails the radius guard; changing the guard is not this change's scope); an arbitrary `[border-top-left-radius:var(--radius-container)]` property (passes the guard only by evading it).
- Why clipping is safe here: every popup in `src/shared/ui` renders in a portal; the band pads the collapsible header by 0.5rem and the body pads its content by at least 1rem, more than the 4px the focus ring needs (2px offset + 2px ring); the card's own error highlight ring (add-specialist-evaluations D10) and its shadow are drawn by the card itself, outside its clip.

### D4 — Static and collapsible bands told apart by the header they hold
The band changes with what it holds, with no prop and no change to `Collapsible`: its styles key off the collapsible header's button inside it, which exposes `aria-expanded` (content-structure "Collapsible section"), through the CSS `:has()` relational selector (Tailwind CSS 4 `has-*` / `has-[…]` variants: https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-descendants).
- **Static band** (no element with `aria-expanded` inside): padding 1rem below 768px; 1rem top and bottom and 1.5rem left and right from 768px. No hover surface.
- **Collapsible band** (holds the header button): padding 0.5rem below 768px; 0.5rem top and bottom and 1rem left and right from 768px (with the header's own 0.5rem, the title starts at 1rem / 1.5rem, the body's inset). `surface-section-hover` while the pointer is on the band.
- **Collapsed** (the header button has `aria-expanded="false"`): no bottom separator. Expanded: the separator shows.

The consumer composes as `EvaluationGroupCard` does today: `Collapsible` around the card, `CollapsibleHeader` inside `CardAside`, `CollapsibleBody` around `CardContent`.
- Alternatives: a `collapsible` prop on `CardAside` (the consumer would also have to pass the open state for the collapsed corners and separator); exporting the collapsible state from `Collapsible` for `Card` to read (couples two shared components, a shared mechanism the summary does not settle).

### D5 — Section card has no name, role or text
The root stays a plain `div` with no role, no `aria-*` and no text, as the content card. A consumer that needs a landmark wraps the card in `<section aria-labelledby>` pointing at the band's heading (summary §6.1). The collapsible header's name and description come from `Collapsible`, unchanged.

### D6 — Contrast registration and backdrop guard (summary §4.3)
Both `TRADITIONAL_PAIRS` and `DARK_PAIRS` gain exactly these entries:

```ts
{ fg: "text-accent", bg: "surface-page", kind: "text" },
{ fg: "text-link", bg: "surface-page", kind: "text" },
{ fg: "text-link-hover", bg: "surface-page", kind: "text" },
{ fg: "text-label", bg: "surface-section", kind: "text" },
{ fg: "text-label", bg: "surface-section-hover", kind: "text" },
{ fg: "focus-ring", bg: "surface-section-hover", kind: "bound" },
```

A new block in `theme-tokens.test.ts` asserts the raw values of the backdrop token: traditional `--color-surface-page` is `var(--color-sage-100)`; dark `--color-surface-page` is `var(--color-night-petrol-950)`. It fails on `develop` today (traditional value `var(--color-cream-100)`) and passes after D1. `theming` gets no delta spec: its contrast requirements already cover the new pairs, and token values are not stated in the spec.

### D7 — Commit scopes
Tasks that touch `globals.css` or `theme-tokens.test.ts` commit under `theming`; tasks that touch `Card.tsx`, `Card.test.tsx` or `index.ts` under `content-structure`; the verification task under `app-shell`. Each commit touches one capability (AGENTS.md, Git).

## Risks / Trade-offs

- [Every screen on `develop` with `surface-page` changes colour in the traditional theme (shell main area, Home hero, About alternate bands)] → Intended (summary §9.1, Open 4 a); every gated pair passes (summary §4.1); the verification task captures Home and About in both themes.
- [The focus ring's cream offset gap shows on the backdrop] → Known and accepted (summary §2); no change.
- [`:has()` keys off any descendant with `aria-expanded`: a static band that one day holds another expandable control (a menu trigger) would style as collapsible] → No consumer does today; the summary's static band holds a heading and a description only. The build may narrow the selector to the header button if it can do so without a change to `Collapsible`.
- [The section card clips overflow: a future in-flow popup or a control flush with the card edge would be cut] → All current popups portal; the band and body padding exceed the focus ring's extent (D3).
- [No screen renders the section card in this change] → The verification captures the backdrop on Home and About, and the section card on a temporary host page outside the commit (the add-collapsible-section precedent), compared with `docs/design/refine-page-surfaces/mockup/`.
- [`theme-tokens.test.ts` overlaps with `feature/add-offering-catalog` and `feature/add-user-account`] → Keep both sides at merge; the side that merges second drops its duplicate lines of the `text-link`, `text-link-hover` / `surface-page` and `text-label` / `surface-section` pairs (summary §9.3).

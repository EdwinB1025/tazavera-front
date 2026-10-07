# Design

## Context

See proposal.md for motivation. The design source of truth is `docs/design/add-collapsible-section/design-summary.md` (status approved: Open 1 (a) build in-house; Open 2 recorded for the `add-specialist-evaluations` round). This design restates its settled decisions for the build; it does not re-decide them.

Current state that shapes the approach:

- `src/shared/ui/Card.tsx` is the compound-parts pattern: sibling parts read shared state from a context, the consumer supplies children and class extensions, classes join with `cn` (`src/shared/lib/utils.ts`, which only joins strings and does not resolve conflicts).
- `src/shared/ui/icons.ts` already exports `ChevronDown` (lucide); it is the only allowed icon entry point.
- `focus-visible:focus-ring` is the shared focus indicator (`globals.css` `@utility focus-ring`), enforced by `focus-guard.test.ts`.
- `type-subheading` (`globals.css`) sets the subheading role, coloured `text-accent`.
- Guards over `src/shared/ui`: `color-guard`, `radius-guard`, `focus-guard`, `client-boundary`, `xss-guard`.
- `theme-tokens.test.ts` registers `text-accent` / `surface-card` in both themes and the focus pairs; `text-accent` / `surface-section` and `text-accent` / `surface-section-hover` are not registered.

No API endpoint is consumed: the component renders consumer content only, so there is no request, no generated API type and no API error to present. The only types are UI-specific (D2), declared before the components.

## Goals / Non-Goals

**Goals:**

- One shared collapsible section in `src/shared/ui`, meeting the `content-structure` "Collapsible section" requirement.
- Compound parts so the header and the body can sit in different card regions.
- `aria-controls` resolving in both states and consumer state kept across a collapse.

**Non-Goals:**

- No consumer adoption (`add-specialist-evaluations`, `refine-flavor-wheel` adopt it in their own changes).
- No disabled state, no `role="region"`, no new token, icon export, text or dependency.
- The `CardAside` padding around the header (summary Open 2) is not settled here.

## Decisions

**D1 — Placement and parts (summary §3).** One client module, `src/shared/ui/Collapsible.tsx`, with `"use client"` as its first statement (state and event handlers), exporting `Collapsible`, `CollapsibleHeader` and `CollapsibleBody`. Sibling parts read the open state, the toggle and the body id from a context, the `Card.tsx` pattern. `Collapsible` renders no element of its own, so it can wrap a `Card` without breaking its layout. All three parts and their prop types are exported from `src/shared/ui/index.ts`.

**D2 — Types (summary §3.1), declared before the components and exported:**

```ts
export type CollapsibleProps = {
  open?: boolean;                          // controlled
  defaultOpen?: boolean;                   // uncontrolled, default false
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type CollapsibleHeaderProps = {
  children: ReactNode;                     // the title: the button's accessible name
  aside?: ReactNode;                       // optional header content beside the title
  headingLevel?: 2 | 3 | 4 | 5 | 6;        // optional: wraps the button in a heading of that level
  className?: string;                      // class extension, merged with `cn`
};

export type CollapsibleBodyProps = HTMLAttributes<HTMLDivElement>;
```

With `open` given, the section is controlled: activating the header calls `onOpenChange(!open)` and the rendered state changes only when the prop does. Without `open`, the section keeps its own state starting at `defaultOpen` (default `false`) and also reports each toggle through `onOpenChange` when given (the Radix convention the project already uses for Popover and Dialog).

**D3 — Ids.** The body id and the ids of the title and aside elements are generated per section instance with React `useId`, so several sections on one page never collide. `CollapsibleBody` renders its `id` from the context; a consumer `id` prop is not used for it (the header's `aria-controls` must name the body).

**D4 — Header (summary §4.1).**
- A native `<button type="button">` holding, in order: a title block (the title element, then the aside element when `aside` is given) and the chevron.
- `aria-expanded` follows the state; `aria-controls` holds the body id in both states.
- Accessible name: `aria-labelledby` pointing at the title element only. With `aside`, `aria-describedby` points at the aside element; without it, no `aria-describedby`.
- With `headingLevel`, the button sits inside an `h{n}` with no margin and no padding, displayed as a block (APG Accordion: button inside the heading); without it, no heading element.
- Chevron: `ChevronDown` imported from `@/shared/ui/icons` (or `./icons`), `aria-hidden`, 1rem square, never shrinks. Collapsed it points down; expanded it is rotated 180° (points up). No `ChevronUp` export is added.
- Colours: title `type-subheading` (its colour is `text-accent`); chevron `text-accent` at 80% opacity at rest, 100% while the header is hovered or has `focus-visible`. The header has no background, at rest or on hover, and no border.
- Focus: `focus-visible:focus-ring`; radius `rounded-field` so the ring follows the field shape of each theme.
- No disabled state.

**D5 — Header layout (summary §6.1).** Full width of its container; one row, title block at the start and chevron at the end, items centred vertically; 0.5rem gap between the title block and the chevron; title block wraps with 0.75rem horizontal gap between title and aside and 0.25rem between wrapped lines; 0.5rem padding on every side; minimum height 2.5rem; text aligned to the start, title wraps (no truncation, the title block can shrink); no margin. The build chooses the utility classes and its tests pin the ones it chose. At 375px the title wraps before the chevron moves; there is no breakpoint of the component's own.

**D6 — Body (summary §4.3, §6.2).**
- A `div` carrying the body id, spreading the consumer's `HTMLAttributes` and merging `className` with `cn`. It stays mounted in both states.
- While collapsed it carries the `inert` attribute (out of the tab order and the accessibility tree) and takes zero height with nothing of it shown; while expanded it has no `inert` attribute and its full height.
- No padding, border, background or margin of its own; no gap between header and body; no `role="region"`.
- Animation: the height goes from zero to the content height and back over 0.25s, ease-out, and the chevron rotation runs over the same 0.25s, ease-out. No script measures the content (jsdom cannot; summary §4.3), so the mechanism is CSS only. Under `prefers-reduced-motion: reduce` there is no transition on either (`motion-reduce:` variant).
- Clipping end state (the build picks the mechanism, summary §4.3): while expanded, the focus ring of a control touching the body's edge is never clipped; while collapsed or animating, nothing outside the animated height shows.

**D7 — Built in-house (summary §4.4, Open 1 approved as (a)).** Radix Collapsible 1.1.20, already installed through `radix-ui`, sets `aria-controls` only while open and unmounts the content while closed unless `forceMount`, with which it never hides the content; its animation relies on measurement and keyframes the project lacks. Using it would override both of its choices. The disclosure pattern is one button, one state, one region, so it is built in-house with no dependency. Alternatives (b) Radix with overrides and (c) Radix as shipped lose for the reasons above.

**D8 — Tokens and contrast (summary §5).** No new token. Measured contrast (summary §5, computed): title `text-accent` ≥ 5.43:1 on `surface-card`, `surface-section` and `surface-section-hover` in both themes; chevron at 80% rest ≥ 3.97:1 on the same surfaces. Guard pairs added to `src/app/styles/theme-tokens.test.ts`, `kind: "text"`, in `TRADITIONAL_PAIRS` and in `DARK_PAIRS`: `text-accent` / `surface-section` and `text-accent` / `surface-section-hover`, each skipped if already registered when the task runs. The 80% blend is not expressible in the guard; it stays recorded here as measured.

**D9 — Tests (summary §8), jsdom, asserting classes and attributes.** `src/shared/ui/Collapsible.test.tsx` covers:
1. collapsed by default: `aria-expanded="false"`, body has the `inert` attribute, header `aria-controls` equals the body id;
2. a click toggles (expanded: `aria-expanded="true"`, body without `inert`; again: collapsed), and in both states `aria-controls` is present and `document.getElementById` of it returns the body;
3. `defaultOpen` starts expanded;
4. controlled: with `open={false}`, a click calls `onOpenChange(true)` once and `aria-expanded` stays `"false"` until the prop changes; rerendered with `open={true}` it reads `"true"`;
5. with an `aside`, the accessible name (`getByRole("button", { name })`) is the title only and the accessible description is the aside text; without `aside`, no `aria-describedby`;
6. `headingLevel={3}` wraps the button in an `h3` (`getByRole("heading", { level: 3 })` contains the button); without it there is no heading;
7. the chevron is `aria-hidden`, its rotation class is absent while collapsed and present while expanded, and the transition and `motion-reduce:` classes the build chose are present on the chevron and the body;
8. the header carries `focus-visible:focus-ring`, `rounded-field`, the full-width row classes, the 0.5rem padding, the 2.5rem minimum height and `type-subheading` on the title (the exact classes the build chose);
9. content kept: a text input inside the body keeps its typed value after a collapse and a reopen;
10. consumer content only: the header's text content equals title plus aside, with nothing added.

`src/shared/ui/index.test.tsx` gets one smoke case rendering the three parts from `@/shared/ui`. The existing `color-guard`, `radius-guard`, `focus-guard`, `client-boundary` and `xss-guard` cover the new file without change.

**D10 — Next.js.** The module crosses the server/client boundary (`"use client"`), so the build reads the `use client` directive guide in `node_modules/next/dist/docs/` once before implementing.

**D11 — Files touched.**

| File | FSD layer | Change |
|---|---|---|
| `src/shared/ui/Collapsible.tsx` | shared | created |
| `src/shared/ui/Collapsible.test.tsx` | shared | created |
| `src/shared/ui/index.ts` | shared | modified: exports the three parts and their prop types |
| `src/shared/ui/index.test.tsx` | shared | modified: one smoke case |
| `src/app/styles/theme-tokens.test.ts` | app | modified: two text pairs per theme |

No route, page, catalog, token or icon file is touched.

## Risks / Trade-offs

- [The 0.25s duration is Alpine's `x-collapse` default, unverified (summary §4.3)] → recorded as the settled value; a visual review can retune it in a later round.
- [The height animation without script measurement depends on a CSS-only technique] → its rendering is checked in a real browser (task 3.2); jsdom only checks classes and attributes.
- [Shared files edited by other open changes] → conflicts are additive; the resolution keeps both sides.
- [`focus-ring` over `surface-section-hover` is not a registered pair] → the summary records only the two text pairs; not added here.

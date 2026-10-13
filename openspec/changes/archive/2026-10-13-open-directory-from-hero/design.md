## Context

See proposal.md (Why) and backlog entry R86, whose settled end state this design implements. Current state:

- `src/pages/home/ui/ExploreButton.tsx` (pages layer, Client Component) renders `Button` with variant `action-3` and scrolls `#offerings` into view on click. `src/pages/home/ui/HomeHero.tsx` renders `<ExploreButton label={texts.exploreLabel} />` in its actions group and already receives `locale`.
- No component in `src/shared/ui/` renders a link with `Button`'s look: the shared `Link` always adds the underlined link treatment, and `Button`'s class composition (`BASE_CLASSES` plus the variant, hover, geometry and width maps in `src/shared/ui/Button.tsx`, a `"use client"` module) is not exported.
- `Button`'s hover classes are gated by `enabled:` (`enabled:hover:…`). An anchor never matches `:enabled`, so those exact classes on an anchor would show no hover change.
- `HomeHero` and `HomeScreen` tests in both suites render the hero without a `next/navigation` mock, so the action cannot use the app router.
- The about page's closing action (`src/pages/about/ui/ExploreButton.tsx`) is a separate component and stays as it is.

API endpoints: none. No derived API type is needed. The Next.js `Link` component (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`) passes `className` to its anchor and navigates client-side.

## Goals / Non-Goals

**Goals:** R86's end state: the hero's explore action is a link to `/{locale}/coffeeshops` with `Button`'s `action-3` look (rest, hover, focus, geometry and width), in the same place, with the same label.

**Non-Goals:** no change to `Button`'s rendered classes, props or tests, to the shared `Link`, to the about page's action, to the offerings block's `offerings` id, to texts, tokens or dependencies.

## Decisions

### D1 — `Button.tsx` builds the link's classes from `Button`'s own class maps

`src/shared/ui/Button.tsx` gets two class builders over its existing maps, and `Button` keeps rendering exactly the classes it renders today:

- `buttonClasses({ variant, size, iconOnly, busy })`, internal to the module, returns the classes `Button` composes today — `BASE_CLASSES`, the variant's rest classes, its hover classes unless busy, the size's geometry (icon-only or labelled) and the action width (none for icon-only or `nav-button`) — and `Button` uses it, appending its `className` as today.
- `buttonLinkClasses(variant, size)`, exported, returns the same composition for a labelled anchor: `BASE_CLASSES`, the variant's rest classes, the size's labelled geometry and action width (none for `nav-button`), and the variant's hover classes in the plain `hover:` form. The plain form lives in its own map next to the `enabled:hover:` one, because an anchor never matches `:enabled`; with the `enabled:` form the link would lose the button's hover colours, against the end state ("look stays the same"). Tailwind generates only class names written literally in the source, so the map is written out, not derived at runtime.

`src/shared/ui/index.ts` adds `buttonLinkClasses` to its existing `Button` export line, since other slices import `shared/ui` only through its public index. The `src/shared/ui` edit goes in its own commit and leaves `Button`'s tests unchanged.

Alternatives considered: the shared `Link` (always underlined, link colours); `RouteButton` or `useRouter` (the hero's tests have no `next/navigation` mock); copying the `action-3` classes into the page (a copy of the shared treatment).

### D2 — The hero's explore action is a `next/link` anchor

`src/pages/home/ui/ExploreButton.tsx` renders a `next/link` `Link` with `href={`/${locale}/coffeeshops`}`, `className={buttonLinkClasses("action-3", "base")}` and the label as its text; it takes a `locale` prop next to `label`. It stays a Client Component (`"use client"`), because it calls a function exported from the client module `Button.tsx`. The scroll handler is removed. `HomeHero.tsx` passes its `locale` to it; nothing else in the hero changes. The doc comments name the new behaviour.

## Risks / Trade-offs

- [QA test `qa/src/pages/home/ui/HomeHero.test.tsx` line 80] → it finds the actions group with `screen.getByRole("button")` and is expected to fail once the action is a link. QA tests are not edited in this change and production code does not change to satisfy it: if `npm run test:qa` fails only there, the change stops after the full checks, before verify and archive, and the failure is reported (task 2.1).
- [The link's hover classes are a second literal map] → it holds only the `hover:` form of the existing hover classes; the rest, geometry, width and base classes are shared with `Button`.

# Tasks

## 1. Collapsed body takes up no space

- [x] 1.1 In `src/shared/ui/Collapsible.test.tsx`, add the test of design.md D2 ("clips the collapsed body's overflow"): the inner wrapper `body.firstElementChild` has the class tokens `min-h-0` and `overflow-hidden` while collapsed; after clicking the header it has `min-h-0` and not `overflow-hidden`; after clicking it again it has `overflow-hidden`. Verify: `npm run test:run -- src/shared/ui/Collapsible.test.tsx` fails only on this new test (missing `overflow-hidden`); every other test passes. Commit as `test(content-structure): ...`.
- [x] 1.2 In `src/shared/ui/Collapsible.tsx`, give `CollapsibleBody`'s inner wrapper `overflow-hidden` while collapsed only (design.md D1), keeping `min-h-0` in both states; no prop, outer class or token changes. Verify: the 1.1 test passes and `npm run test:run` is fully green.

## 2. Verification

- [x] 2.1 Run `npm run test:run`, `npm run lint`, `npx tsc --noEmit` and `npm run build`. Expected: all pass, including the unchanged `Card`, `FlavorWheel`, `ConsensusPanel` and `index` tests.
- [ ] 2.2 Browser capture at 375px, both themes: on a page with collapsed sections (offering detail per-axis sections; the evaluation form once merged), `document.documentElement.scrollHeight` equals the bottom of the last visible content (no blank area below); expanding a section grows the page by its content and animates over 0.25s; collapsing returns the page to its collapsed height; with reduced motion the toggle is instant; Tab skips the content of a collapsed section; an expanded section looks as before, including a focused control's ring at the body's edge.

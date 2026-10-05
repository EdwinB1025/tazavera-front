# Corrections — add-landing

## Round 1

Product owner, 2026-10-05. Resolves handoff Q1.

1. design.md D2, derived API types. The data and pagination fields of the generated responses are optional, so indexing them directly fails `npx tsc --noEmit` (TS2537). End state: every type D2 derives from an optional field wraps it in `NonNullable<…>` before indexing:
   - `NonNullable<ListOfferingsResponse["data"]>[number]`
   - `NonNullable<ListTaxonomiesResponse["data"]>[number]`
   - `OfferingsPageMeta`: the same `NonNullable<…>` form over its existing indexed access of `meta`.
   The meaning of D2's doc comments is unchanged; the generated schema is not edited.
   Existing tests affected: none.
   New test: none; task 1.1's verification `npx tsc --noEmit` must exit 0 (fails on the current literal text, passes on the new form).

### Status

2026-10-05. `openspec validate add-landing --strict` passes.

1. design.md D2, derived API types — artifacts updated: design.md D2 (the three derived types wrap their indexed access in `NonNullable<…>` before indexing, the doc comments' meanings unchanged and the generated schema untouched); spec.md unchanged, since no observable behaviour changes. Tasks created: tasks.md section 9, task 9.1 (one task carrying the end state and its `npx tsc --noEmit` verification; no test task, the round creating no test). Task 1.1 is still open and copies D2 exactly, so the end state also lands through it.
## Round 2

Product owner, 2026-10-05. Resolves handoff Q11 (option 1).

1. The entry page fills the shell's main area, which the `app-shell` main spec still describes as empty. End state: the change carries an `app-shell` MODIFIED delta for the requirement holding the scenario "Root of a supported locale", whose THEN becomes: the shell renders the entry page in its main area instead of reporting the page as not found. The rest of that requirement is unchanged. proposal.md lists `app-shell` under Modified Capabilities, and design.md D13 lists `src/app/shell/AppShell.test.tsx` among the modified files.
   Existing tests affected: `src/app/shell/AppShell.test.tsx`.
   - The two renders of `<HomeScreen />` (the shared `renderShell` helper and the sidebar label case for es, en and ca) render a plain placeholder child instead. `HomeScreen` now loads the `landing` catalog and wraps an async server component, and the shell tests must not depend on the home screen.
   - The case "renders the shell with an empty main area (spec: Root of a supported locale)" is restated: the banner renders and the main area renders exactly the child it was given, the placeholder. It must fail if the main area does not hold the child.
   - The single-button assertion in "Session unresolvable renders as anonymous with no error message and no retry affordance" stays as is: with the placeholder child, the only button is still the header's Sign in.
   - No other assertion in the file is removed or weakened.
   Order: this test update must be committed before task 6.2's commit, because 6.2's verification (`npm run test:run`, `npx tsc --noEmit`) fails on the current `AppShell.test.tsx`. Its commit scope is `app-shell`.

### Status

2026-10-05. `openspec validate add-landing --strict` passes.

1. The `app-shell` MODIFIED delta and the named test update — artifacts updated: new `specs/app-shell/spec.md` (requirement "Locale routing" modified: the scenario "Root of a supported locale" has THEN "the shell renders the entry page in its main area instead of reporting the page as not found"; the rest of the requirement unchanged), proposal.md Modified Capabilities (lists `app-shell` with that modification), design.md D13 (`src/app/shell/AppShell.test.tsx` among the modified files). Tasks created: tasks.md section 10, task 10.1 — the `src/app/shell/AppShell.test.tsx` update (plain placeholder child in both former `<HomeScreen />` renders, the main-area case restated to the child the main area holds and failing if it does not hold it, the single-button assertion unchanged, no other assertion removed or weakened), placed before task 6.2 in list order with commit scope `app-shell` and the `npm run test:run`, `npm run lint`, `npx tsc --noEmit` verification. No test comes first and no implementation task follows: the round changes no implementation.

## Round 3

Product owner, 2026-10-05. From the browser check at 1280px on mock data: the pages have no margins, no spacing and no card gaps. The artifacts never settled page layout, so this round settles it. Spacing values are end states; the build picks the utilities and the tests assert its choice.

1. **Page container.** On both the entry page and the About page, every section's content sits in a horizontally centered container, at most 72rem wide, with 1rem side padding below `md` and 2rem from `md` up. Section backgrounds still span the full viewport width; only the content is constrained.
2. **Section spacing.** Every section of both pages has 3rem vertical padding below `md` and 4rem from `md` up. On the entry page, the hero and the offerings list are two separate sections.
3. **Entry page backgrounds.** The hero section keeps `bg-surface-page`, and the offerings list section takes `bg-surface-section`, alternating as the About page does.
4. **Hero rhythm.** Inside the hero text column, the eyebrow, heading, paragraph and actions are separated vertically: 1rem between eyebrow, heading and paragraph, and 1.5rem before the actions.
5. **Registration links.** On both pages, the two registration links sit in a row with a 1.5rem gap and wrap onto separate lines with a 0.5rem gap when there is no room. They never touch.
6. **Offerings grid.** The verified list renders its cards in a grid: one column below `md`, two from `md`, three from `xl`, with a 1.5rem gap in both directions. Cards in a row stretch to the same height, with the footer at the bottom of each card.
7. **Offering card stacked layout.** The offering card renders its side column (score, `/100` and rating chip on one compact row) above the content at every width, separated from it by the `border-border-subtle` separator on the boundary between them. The shared Card keeps its current behaviour by default (side column beside the content from `lg`) and gains an option for this stacked layout at every width. The offering card uses that option.
8. **Card footer.** The two counts are separated by a 1rem gap. The View link, and the Evaluate link when shown, are grouped at the end of the footer, separated from the counts. The footer wraps on narrow cards.
9. **Badge padding.** Every badge variant has 0.5rem horizontal and 0.125rem vertical inner padding.
10. **Content distribution.** Inside the centered container, content spreads across the available width instead of gathering on the left. From `md` up, the hero text and the photograph split the container into two equal columns, vertically centered. The About sections use the full container width, with the three evaluation cards sharing it equally. Text stays left-aligned; it is the content block that is centered on the page.
   Existing tests affected: the assertions that pin the replaced classes. `src/shared/ui/Badge.test.tsx` checks that the base classes are exactly `type-badge rounded-field`; `src/shared/ui/Card.test.tsx` checks the stacking classes; and the class assertions in `OfferingCard.test.tsx`, `OfferingList.test.tsx`, `HomeHero.test.tsx`, `HomeScreen.test.tsx` and `AboutContent.test.tsx`. The tasks name each one. No assertion is removed without a replacement for the new end state.
   Not in this round: the rating chip label (D4, still pending my browser check); the header's primary navigation spacing and the About page's white area below the content (`app-shell`, sent to `refine-app-header`); the verified badge's icon above its label (unplanned fix, behaviour already in spec).

### Status

2026-10-05. `openspec validate add-landing --strict`: valid. Processed by the orchestrator on Product owner's instruction ("follow the process yourself"), in place of the architect agent.

1. Page container → spec `landing` "Page layout" (scenario "Centered content"); design.md D14. Tasks 13.1, 13.2.
2. Section spacing → spec "Page layout" ("Side and section spacing"); D14. Tasks 13.1, 13.2.
3. Entry page backgrounds → spec "Page layout" ("Entry page sections"); D14. Tasks 13.1, 13.2.
4. Hero rhythm → D14; spec unchanged (layout detail only). Tasks 13.1, 13.2.
5. Registration links → spec "Page layout" ("Link groups"); D14. Tasks 13.1, 13.2.
6. Offerings grid → spec "Verified offerings list" (text and new scenario "Grid by viewport"); D14. Tasks 13.1, 13.2.
7. Offering card stacked layout → spec `content-structure`: new requirement "Stacked card layout", "Card stacking on narrow viewports" now scoped to the default layout; spec `landing` adds the "Score row above the content" scenario; D6, D14. Tasks 11.1, 11.2 and 13.1, 13.2.
8. Card footer → spec "Footer counts" scenario; D14. Tasks 13.1, 13.2.
9. Badge padding → spec `feedback` "Badge presentation" (icon and label on one line, inner padding); D7, D14. Tasks 12.1, 12.2. This also covers the verified badge's icon rendering above its label, which was planned as an unplanned fix.
10. Content distribution → spec "Responsive hero" (two equal, vertically centered columns) and "How we evaluate" (cards share the width); D14. Tasks 13.1, 13.2.
End-to-end verification with captures: task 13.3.

## Round 4

Product owner, 2026-10-05 (option 1 of the contrast finding). An executed measurement over the 120 API taxonomy colours, at the three levels and in both themes, found 44 level-1/level-2 pairs below 4.5:1 (worst 3.63:1). The cause: the label is chosen from the raw colour, but at depth the rendered background is that colour blended over the card surface.

1. **Taxonomy label per theme.** In each theme, the label (white or black) is chosen by the WCAG relative luminance of the rendered background: the taxonomy colour at its depth opacity over that theme's card surface. White when L ≤ 0.179, black above. The badge carries both labels and the active theme selects one. No single label passes both themes for 44 of the 360 colour-and-level combinations, so the switch must follow the theme. End state: every taxonomy label measures at least 4.5:1 against its rendered background, at every level, in both themes.
2. **Measured ranges in the spec.** The "Rating and status pairs" scenario quotes 4.7–4.9:1 (traditional) and 6.6–7.1:1 (dark). The measured rating pairs are 4.68–5.13:1 and 6.42–7.12:1. The scenario states the gate (at least 4.5:1) and the measured ranges.
   Existing tests affected: the taxonomy cases of `src/shared/ui/Badge.test.tsx` that assert `style.color` white/black from the raw colour.
   Coverage afterwards: the build adds the measured-contrast tests that verify asked for (rating pairs in `theme-tokens.test.ts`; taxonomy pairs over the luminance rule) as unplanned coverage.

### Status

2026-10-05. `openspec validate add-landing --strict`: valid. Processed by the orchestrator on Product owner's instruction.

1. Taxonomy label per theme: spec `feedback` "Taxonomy badge" (requirement text and the white/black scenarios) and "Taxonomy pairs"; design.md D7, round 4 paragraph (the earlier 4.58:1 claim marked superseded). Tasks 14.1 (`91cb807`) and 14.2 (`893f3df`).
2. Measured ranges: spec `feedback` "Rating and status pairs" now quotes 4.68–5.13:1 and 6.42–7.12:1. Artifact only, no task.
Coverage: the measured-contrast tests from verify go to the build as unplanned coverage.

No derived API types are needed: the tree keeps receiving the notes its consumers already resolve.

## 1. Collapsible trees on the offering card (landing)

- [x] 1.1 Tests in `src/entities/offering/ui/OfferingCard.test.tsx` (fixture: Floral → Jazmin → Bergamota, Frutal without children; `TEXTS` gains `showNotesLabel` and `hideNotesLabel` with a `{label}` placeholder), one per scenario of the landing delta:
  - "Closed at first": Floral and Frutal show; Jazmin and Bergamota are not visible (inside a `hidden` list).
  - "Toggle on notes with children": a button follows Floral's badge in its row, with visible text `+`; Frutal's item holds no button.
  - "Opening a note": after clicking Floral's toggle its text is `−`, Jazmin shows with its own toggle reading `+`, Bergamota does not show; after clicking Jazmin's toggle Bergamota shows.
  - "Closing a note closes its descendants": open Floral and Jazmin, close Floral, open it again: Jazmin shows, its toggle reads `+`, Bergamota does not show.
  - "Accessible toggle": Floral's toggle has `aria-expanded="false"`, its accessible name is `showNotesLabel` with `{label}` replaced by `Floral`, and `aria-controls` names the `ul` that holds Jazmin; after a click `aria-expanded="true"` and the name is the filled `hideNotesLabel`; the `+`/`−` glyph sits in an element with `aria-hidden="true"`.
  - "Open state stays on the page": with `fetch` spied, open Floral; `window.location.href` is unchanged and `fetch` was not called; unmount and render the card again: Jazmin is not visible and Floral's toggle reads `+`.
  - "Nested trees" (modified): the existing test opens Floral and Jazmin first and keeps every assertion.
  Verify: the new tests fail only because no toggle renders (typecheck errors for the two new `TEXTS` fields are allowed); the other tests of the file pass; lint is clean.
- [x] 1.2 Implement design.md D1–D5 for the card: `messages/{es,en,ca}/landing.json` (D1), `src/shared/ui/TaxonomyTree.tsx` (D2, D3), `src/shared/ui/TaxonomyTreeToggle.tsx` (new, D4), `src/shared/ui/index.ts` (exports `TaxonomyTreeTexts`), `src/entities/offering/ui/OfferingCard.tsx` (`OfferingCardTexts` intersects `TaxonomyTreeTexts`, passes its texts to the tree), and the card screens `src/pages/home/ui/HomeScreen.tsx`, `src/pages/offerings/ui/OfferingsScreen.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx`, `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx`. Add the two fields to every test fixture typed with `OfferingCardTexts`, `OfferingListTexts` or a type built on them (values only). Verify: `npx vitest related` on the changed files passes, 1.1 included; `npx tsc --noEmit` reports no error outside `src/widgets/offering-detail/` and `src/pages/offering-detail/` (the Consensus texts of task 2); `npm run lint` reports no errors.

## 2. Collapsible trees on the Consensus tab (offering-catalog)

- [x] 2.1 Tests in `src/widgets/offering-detail/ui/ConsensusPanel.test.tsx` (`TEXTS` gains `showNotesLabel` and `hideNotesLabel`), one per scenario of the offering-catalog delta:
  - "Trees closed at first with the toggle after the share": in the Defects card Fermentado shows, Vinagre is not visible, and the element right after Fermentado's `Fermentado 1/5` share is a button with visible text `+`.
  - "Identified notes" (modified): the existing test opens Fermentado first and keeps every assertion.
  - "Axis trees closed at first": in the expanded fragrance section Floral shows, Jazmín is not visible, and the element right after the `Floral 3/5` share is a button with visible text `+`.
  - "Identified notes of an axis" (modified): the existing test opens Floral after expanding the section and keeps every assertion.
  Verify: the new tests fail only because `SelectionBlock` and `AxisDetail` pass no texts to the tree (or because no toggle renders); the other tests of the file pass.
- [ ] 2.2 Pass the tree texts on the Consensus tab: `src/widgets/offering-detail/ui/SelectionBlock.tsx` and `src/widgets/offering-detail/ui/AxisDetail.tsx` (`SelectionBlockTexts` and `AxisDetailTexts` intersect `TaxonomyTreeTexts`, each passes its texts to the tree), `src/pages/offering-detail/ui/OfferingDetailScreen.tsx` (`showNotesLabel: landing.treeShowNotesLabel`, `hideNotesLabel: landing.treeHideNotesLabel`). Add the two fields to every test fixture typed with `ConsensusPanelTexts`, `OfferingDetailTexts` or a type built on them (values only). Verify: `npx vitest related` on the changed files passes, 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. A QA test that fails only because a tree now starts closed gets the clicks that open it, keeping its assertions, in one commit per capability (`test(<capability>): open the taxonomy trees in the qa tests`), listed in the final report. Expected: both suites pass, the typecheck reports no error, lint reports no errors (the known warning in `qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx` is not this change's), and the build succeeds.

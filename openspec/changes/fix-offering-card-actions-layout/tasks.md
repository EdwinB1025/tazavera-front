No derived API types are needed: the change reads only `OfferingSummary` fields the card and the actions already read.

## 1. Badge-row slot and footer height on the offering card (landing)

- [x] 1.1 Test in `src/entities/offering/ui/OfferingCard.test.tsx` for "Consumer content in the badge row": render a card with `badgeRowEnd` set to a sentinel element; assert the sentinel and the verification badge share one parent, the sentinel is that parent's last child, the parent's classes include `justify-between`, and the sentinel is not inside the footer. Verify: the test fails only because the slot does not render (a typecheck error for the unknown `badgeRowEnd` prop is allowed); the rest of the file passes; lint is clean.
- [x] 1.2 Test in `src/widgets/offering-list/ui/OfferingList.test.tsx` for "Footer actions share one height": for a signed-in specialist, the View, View evaluations and Evaluate buttons of a card each carry the `h-8` class. Verify: the test passes at once (the buttons already share `size="sm"`, design.md D4); the rest of the file passes.
- [x] 1.3 Implement design.md D1 in `src/entities/offering/ui/OfferingCard.tsx`. Verify: `npx vitest related` on the changed files passes, 1.1 and 1.2 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Select in the badge row, View and Delete in the footer (offering-management)

- [x] 2.1 Test in `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx` (selection block) for "Select in the badge row": each card's checkbox named `Select <coffee> — <location>` is the last item of the row holding the card's verification badge, that row's classes include `justify-between`, and the checkbox is not inside the card's footer action group. Verify: the test fails only because Select is still in the footer; the rest of the file passes.
- [ ] 2.2 Test in the same file (list states block) for "Card actions fit the card": in each card, the View button and the Delete button named `Delete <coffee> — <location>` have the same parent, which has exactly these two children in this order and no checkbox, and both carry `h-8`. Verify: the test fails only because Delete is still wrapped with Select.
- [ ] 2.3 Implement design.md D2 and D3: `src/features/offering-management/lib/identification.ts` (new), `src/features/offering-management/ui/OfferingSelect.tsx` (new), `src/features/offering-management/ui/OfferingActions.tsx` (Delete only, no wrapper), `src/features/offering-management/index.ts`, `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx`. The existing test "fills every card's actions with its Select and Delete" keeps its assertions. Verify: `npx vitest related` on the changed files passes, 2.1 and 2.2 included; `npx tsc --noEmit` reports no error outside `qa/src/features/offering-management/ui/OfferingActions.test.tsx`; `npm run lint` reports no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite, the typecheck and the build fail only in `qa/src/features/offering-management/ui/OfferingActions.test.tsx`, stale on purpose (design.md Risks), which is listed in the final report and not rewritten; lint reports no errors.

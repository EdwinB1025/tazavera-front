# Tasks

This fast-lane change modifies observable behaviour by Product owner's decision, so it writes one test per new or modified scenario, test first. In every task, "related tests" means `npx vitest related <changed files> --run`; each task also runs `npx tsc --noEmit` (0 errors) and `npm run lint` (0 errors). Every commit carries the footer `Refs: nest-card-taste-notes`.

## 1. Tree resolver

- [x] 1.1 Move `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` to `src/entities/taxonomy/model/taste-note-tree.test.ts` (`git mv`) and import `buildTasteNoteTree` from `./taste-note-tree`. Update its four existing cases to the tree shape of design.md D1 (each expected node gains `ref` and `children`): "Unresolved reference" (the unresolved sibling is absent, Frutal and Baya remain as top-level nodes), "Values from the consensus", "Each value once" (Baya once, at its first occurrence at the top level; Frutal with no children) and "No consensus" (`[]`). Add one case for the spec "Repeated reference keeps its children": Frutal appears twice at the top level, the first occurrence with child Baya and the second with child Baya and child Mora under Baya; the result is exactly one Frutal node whose children are one Baya node whose children are one Mora node. Expected: the file fails only because `./taste-note-tree` does not exist. Commit `test(landing): cover the taste note tree resolver`, naming the moved file and the changed assertions in the body.
- [x] 1.2 Create `src/entities/taxonomy/model/taste-note-tree.ts` with `TasteNoteNode` and `buildTasteNoteTree` (design.md D1) and export both from `src/entities/taxonomy/index.ts`. Verify: the related tests pass; tsc and lint 0 errors. Commit `feat(landing): add the taste note tree resolver`.

## 2. Offering list

- [ ] 2.1 In `src/widgets/offering-list/ui/Offerings.tsx` call `buildTasteNoteTree(offering, lookup)` from `@/entities/taxonomy` and delete `src/widgets/offering-list/lib/resolve-taxonomies.ts` (design.md D4). Verify: the related tests pass with no test changed; tsc and lint 0 errors. Commit `refactor(landing): resolve the list's taste notes with the shared tree resolver`.

## 3. Manage offerings

- [ ] 3.1 In `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` call `buildTasteNoteTree(offering, lookup)` from `@/entities/taxonomy` and delete `src/pages/manage-offerings/lib/resolve-taxonomies.ts` (design.md D4). Verify: the related tests pass with no test changed; tsc and lint 0 errors. Commit `refactor(offering-catalog): resolve the panel's taste notes with the shared tree resolver`.

## 4. Card trees

- [ ] 4.1 In `src/entities/offering/ui/OfferingCard.test.tsx` change the `TAXONOMIES` fixture to a tree (each node with `ref` and `children`): Floral (level 0) with child Jazmin (level 1) with child Bergamota (level 2), plus a second top-level note. Replace the case "renders the resolved badges in three rows by level, each row carrying flex-wrap" (spec "Rows by level") with one case for the spec "Nested trees": Jazmin's `li` sits in a `ul` inside Floral's `li`, that `ul` carrying `ml-5`, `border-l` and `border-border-subtle`; Bergamota's `li` sits in a `ul` inside Jazmin's `li`, that `ul` carrying `ml-5` and `flex-wrap`; the lists have `role="list"`. Add one case for the spec "Trees side by side": the top-level `ul` holds one `li` per top-level note and carries `flex-wrap`. Expected: both cases fail on the current card; every other case passes. Commit `test(landing): cover the nested taste note trees on the card`, naming the replaced case and its assertions in the body.
- [ ] 4.2 In `src/entities/offering/ui/OfferingCard.tsx` give `ResolvedTaxonomyBadge` the shape of design.md D1 and render the nested lists of design.md D2 and D3 in place of the rows (`ROWS_CLASSES`, `ROW_CLASSES` and `TAXONOMY_LEVELS` go), keyed by `ref`. Verify: the related tests pass; tsc and lint 0 errors; `OfferingCard.tsx` at most 300 lines and each component at most 80 lines. Commit `feat(landing): render the card's taste notes as nested trees`.

## 5. Full checks

- [ ] 5.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0; `src/widgets/offering-list/lib/resolve-taxonomies.ts` and `src/pages/manage-offerings/lib/resolve-taxonomies.ts` no longer exist; no hex value, primitive token or Tailwind default colour scale is added. This task changes no files: check it off in a commit containing only the checkbox, `chore(landing): complete tasks for nest-card-taste-notes`.

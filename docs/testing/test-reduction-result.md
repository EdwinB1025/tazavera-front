# Test reduction — pass 1 result

- **Date:** 2026-10-07 (scheduled run for the Product owner decision of 2026-10-08).
- **Branch:** `claude/test-reduction-apply`, from `origin/develop` at `d0124cb`.
- **Plan applied:** `docs/testing/test-reduction-plan.md` on `claude/test-reduction-plan` (measured on `8803904`), sections 3.1 and 3.2.
- **Guard decision applied:** `theme-tokens.test.ts` is now 4 general tests: dark-theme completeness, contrast pairs, typography roles, radius and focus. Each test loops over every item and fails with the list of offending items. All 697 items that are not pins are still asserted. Its 10 design-value pins moved to QA.
- **QA export:** the moved cases are on branch `claude/test-reduction-qa`, under `qa-suite/<original path>`. That is 109 files and 570 cases. All of them pass when put back at their original path on `d0124cb`.

## Totals

| | Files | Cases | Vitest duration |
|---|---|---|---|
| Before (`d0124cb`) | 161 | 2,246 | 99.0 s |
| After (pass 1) | 144 | 937 | 83.5 s |

The 1,309 cases that left the repository break down as follows:
- 570 moved to QA;
- 693 are `theme-tokens` items that are now checked inside the 4 guard tests;
- 45 were deleted;
- 1 was merged (`sort-control` into `Select.test.tsx`).

## Per capability (files touched in pass 1)

| Capability | Files before | Cases before | Files after | Cases after |
|---|---|---|---|---|
| theming (incl. theme-tokens guard) | 2 | 722 | 2 | 12 |
| base-controls | 2 | 45 | 2 | 25 |
| app-shell | 12 | 126 | 10 | 71 |
| auth | 7 | 92 | 7 | 45 |
| user-account | 15 | 124 | 11 | 61 |
| content-structure | 4 | 46 | 4 | 35 |
| feedback | 5 | 131 | 5 | 77 |
| form-fields | 10 | 177 | 10 | 92 |
| filtering | 19 | 168 | 16 | 63 |
| landing | 9 | 57 | 6 | 27 |
| offering-catalog | 11 | 85 | 10 | 47 |
| evaluations | 13 | 115 | 11 | 70 |
| offering-management | 7 | 79 | 5 | 33 |
| **Touched** | **116** | **1,967** | **99** | **658** |
| Untouched (KEEP, other guards, excluded) | 45 | 279 | 45 | 279 |

## Excluded from pass 1 (reduce in pass 2)

These files are modified by in-flight branches: `feature/refine-list-pagination`, `feature/add-coffeeshop-location`, `feature/add-evaluation-facets`, and the `claude/*` branches committed after 2026-10-07T21:00Z. Together they hold 208 cases.

| File | Cases | Plan action |
|---|---|---|
| `app/[locale]/@sidebar/route-files.test.tsx` | 5 | KEEP-TRIM |
| `proxy.test.ts` | 16 | KEEP-TRIM |
| `src/entities/contact/ui/ContactFields.test.tsx` | 18 | KEEP-TRIM |
| `src/entities/evaluation/api/user-evaluations.test.ts` | 12 | KEEP-TRIM |
| `src/features/offering-management/ui/ManagementSidebarEntries.test.tsx` | 2 | MERGE INTO ManageOfferingsSidebarEntries |
| `src/pages/evaluations-list/ui/EvaluationsList.test.tsx` | 9 | KEEP-TRIM |
| `src/pages/home/ui/HomeScreen.test.tsx` | 9 | KEEP-TRIM |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx` | 26 | KEEP-TRIM |
| `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.test.tsx` | 3 | KEEP (merge target) |
| `src/pages/new-offering/ui/NewOfferingSidebarEntries.test.tsx` | 3 | KEEP-TRIM |
| `src/pages/offerings/ui/OfferingsScreen.test.tsx` | 5 | KEEP-TRIM |
| `src/shared/lib/filter-query/filter-query.test.ts` | 11 | MOVE-QA |
| `src/shared/ui/Pagination.test.tsx` | 7 | KEEP-TRIM |
| `src/shared/ui/icons.test.ts` | 13 | guard: reduce to 1 test |
| `src/shared/ui/index.test.tsx` | 32 | MOVE-QA |
| `src/widgets/offering-list/api/offerings.test.ts` | 7 | KEEP-TRIM |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | 19 | KEEP-TRIM |
| `src/widgets/offering-list/ui/FilteredOfferingsResults.test.tsx` | 9 | not in plan (same folder as excluded OfferingList tests) |
| `src/pages/offerings/ui/OfferingsToolbarScreen.test.tsx` | 2 | not in plan (split from excluded OfferingsScreen) |

## Deviations and judgement calls

- **`icons.test.ts`:** the decision reduces it to 1 test, but three in-flight branches modify it. It stays unchanged until pass 2.
- **`OfferingFacets.test.tsx`:** the plan's two sections disagree. §3.2 lists 7 kept cases and §3.1 says 6. The 7 cases of §3.2 were kept.
- **`OfferingsSidebarScreen.test.tsx`:** this is the plan's renamed `OfferingsSidebar.test.tsx`. It keeps the anonymous row, as the plan says.
- **`AccountSection.test.tsx`:** the plan gives counts but does not name the deleted case. The deleted case is "shows the heading alone when there is no description", because the kept header-band case asserts the same thing.
- **Folds into kept cases:**
  - Button: border, compact size, compact icon-only, disabled activation, busy no-hover.
  - Link: the protocol-relative URL rejection.
  - Logo: the dark hex values.
  - theme.test: the unknown-theme cookie.
- **Deleted duplicates with assertions that no kept test makes any more:**
  - ExternalLink: the link's class list.
  - RegisterSuccessPanel: the heading's `tabindex="-1"` and the Sign in button's `bg-action-primary`.

  Neither is the only test of a spec scenario.
- **Scenarios whose only test was not kept:** none.

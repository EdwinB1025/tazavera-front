No derived API types are needed: the change reads no API field and sends no new request.

## 1. List memory and restore (filtering, shared)

- [x] 1.1 Tests in `src/shared/ui/RememberedFiltersGate.test.tsx` (validation suite), with `next/navigation` mocked (`usePathname` `/es/manage/evaluations`, `useSearchParams` from a per-test query, `useRouter` with `push` and `replace` spies), every test inside `FilterMemoryScope name="my-evaluations"` with the keys `status`, `scoreMin`, `scoreMax`, `process`, `city`, `orderBy`, `orderDirection`, and `sessionStorage` cleared before each:
  - "Restored on a new opening": `sessionStorage` holds `tazavera.list-filters.my-evaluations` = `process=washed&orderBy=cupping_score&orderDirection=desc`, the address has no query; render the gate with a child "list" probe. Assert `replace` was called once with `/es/manage/evaluations?process=washed&orderBy=cupping_score&orderDirection=desc` and `{ scroll: false }`, `push` was not called, and the probe is not rendered.
  - "Cleared filters are stored": the address is `?process=washed&orderBy=cupping_score&orderDirection=desc&page=2`; render `ClearFiltersButton` with `keep={["orderBy", "orderDirection"]}` inside the scope and activate it. Assert `push` was called with `/es/manage/evaluations?orderBy=cupping_score&orderDirection=desc` and the stored value is now `orderBy=cupping_score&orderDirection=desc`.
  - "Nothing stored": nothing stored, the address has no query. Assert the probe is rendered and neither `replace` nor `push` was called.
  - "Browser storage unavailable": `Storage.prototype.getItem` and `setItem` throw; with the address `?process=washed`, a component calling `useFilterNavigation().navigate({ process: "natural" })` inside the scope pushes `/es/manage/evaluations?process=natural`; with no query, the gate renders the probe and `replace` is not called; nothing throws.
  Verify: the tests fail only because `FilterMemoryScope`, `RememberedFiltersGate` and the memory write do not exist yet (test failures and typecheck errors for those missing exports only); `npm run lint` passes.
- [x] 1.2 Implement design.md D1–D3: `src/shared/lib/tab-storage.ts` (`readTabValue`, `writeTabValue`, `removeTabValues`, each failure-safe); in `src/shared/lib/filter-query/index.ts` the `FilterMemory` type, `FilterMemoryContext`, `rememberedQuery`, `forgetRememberedFilters` and the write in `navigateTo` inside a scope; `src/shared/ui/FilterMemoryScope.tsx` and `src/shared/ui/RememberedFiltersGate.tsx`, exported from `src/shared/ui/index.ts`. Verify: `npx vitest related` on the changed files passes, 1.1 included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Forgetting with the session (filtering, app)

- [x] 2.1 Tests in `src/app/shell/forget-list-preferences.test.ts` (validation suite), with `renderHook` and `sessionStorage` holding `tazavera.list-filters.my-evaluations` = `process=washed` and an unrelated key `tazavera.pending-flow` before each:
  - "Forgotten on sign out": the hook renders with an `authenticated` session (user `ulid` `A`), then with `anonymous`. Assert the list key is gone and `tazavera.pending-flow` is still there.
  - "Forgotten when another user signs in": the hook renders with `authenticated` user `A`, then with `authenticated` user `B`. Assert the list key is gone; a re-render with user `B` and a value written again keeps that value.
  Verify: the tests fail only because `useForgetListPreferences` does not exist yet; `npm run lint` passes.
- [x] 2.2 Implement design.md D4: `src/app/shell/forget-list-preferences.ts` (`useForgetListPreferences`) and its call in `src/app/shell/SessionShell.tsx` with the value of `useSession()`. Verify: `npx vitest related` on the changed files passes, 2.1 and `src/app/shell/AppShell.test.tsx` included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Wiring the editing lists (filtering, features and pages)

- [ ] 3.1 Implement design.md D5: export `MY_EVALUATION_KEYS` from `src/features/evaluation-facets` and `INVENTORY_FILTER_KEYS` from `src/features/inventory-facets`; wrap the content of `EvaluationsListScreen` and the facets of `EvaluationsSidebarScreen` in `FilterMemoryScope name="my-evaluations"`, and `EvaluationsList` in `RememberedFiltersGate` (fallback `null`); wrap the content of `ManageInventoryScreen` and the facets of `ManageInventorySidebarScreen` in `FilterMemoryScope name="coffee-inventory"`, and `InventoryResults` in `InventoryListClient` in `RememberedFiltersGate` (fallback `InventorySkeletonGrid`). My offerings and the public lists are not touched. No new test. Verify: `npx vitest related` on the changed files passes with no existing assertion edited (a test that renders a wired component without a scope keeps today's behaviour); `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Full checks

- [ ] 4.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass with six new tests and no QA test made stale. Any QA test made stale on purpose is left untouched and listed in the final report; any other failure is fixed in its own `fix(filtering): …` commit.

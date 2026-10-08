# Tasks

## 1. Prune the unused exports

No task adds, deletes or changes a test. Each removal is verified by search first (design.md D1). No file under `qa/` is edited; a QA copy that breaks the typecheck is excluded in `tsconfig.json` with a comment (design.md D4).

- [x] 1.1 Shared layer: delete the unused scaffold primitives of `Sidebar.tsx`, `DropdownMenu.tsx`, `Sheet.tsx` and `AlertDialog.tsx`, stop exporting the module-only primitives and constants, and drop from `src/shared/ui/index.ts`, `src/shared/api/index.ts` and the `src/shared/lib/*/index.ts` files every value and type re-export no other slice imports (design.md D2). Expected: `npx vitest related` over the changed files passes with no test changed, `npx tsc --noEmit` and `npm run lint` report no errors, and knip reports no unused export and no unused index type under `src/shared/` except `getCatalogs` in `messages.ts`.
- [x] 1.2 Entities and features: stop exporting `GEOCODE_TIMEOUT_MS` and drop from the `index.ts` of every entity and feature slice the value and type re-exports no other slice imports (design.md D2). Expected: `npx vitest related` over the changed files passes with no test changed, typecheck and lint report no errors, and knip reports no unused export and no unused index type under `src/entities/` and `src/features/`.
- [ ] 1.3 Widgets and app: delete `fetchVerifiedOfferings` and drop from the `index.ts` of every widget slice and of `src/app/shell` the value and type re-exports no other slice imports (design.md D2). Expected: `npx vitest related` over the changed files passes with no test changed, typecheck and lint report no errors, knip reports only `getCatalogs` (`messages.ts`) as an unused export and no unused type in any `index.ts`, and no file under `src/` or `app/` names `fetchVerifiedOfferings` outside a comment.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; every QA failure also fails on `origin/qa` (listed in the final report); the typecheck and lint report no errors; and the build succeeds.

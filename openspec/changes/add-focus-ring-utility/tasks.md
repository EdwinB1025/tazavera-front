# Tasks

## 1. Foundation: types

- [x] 1.1 Confirm this change introduces no derived or UI-specific type and never touches generated types: verify `git status --short` shows no entry under `src/shared/api/` (with `src/shared/api/schema.ts` untouched) and `npx tsc --noEmit` exits 0 without any type file added or modified

## 2. Shared focus indicator vertical slice

- [x] 2.1 Extend `src/app/styles/theme-tokens.test.ts` with the shared-definition checks (design.md D4): `@utility focus-ring` is defined exactly once in `src/app/styles/globals.css` and renders exactly the effect of today's five-class set — outline suppressed, 2px ring resolving through `var(--color-focus-ring)`, 2px offset resolving through `var(--color-focus-offset)` — following the file's existing role-assertion pattern, verifying `npm run test:run` runs the checks and they fail because the utility is not defined yet
- [x] 2.2 Define `@utility focus-ring` in `src/app/styles/globals.css` (design.md D1), drawn from the existing focus tokens and touching no existing token, `type-*` role or radius rule, verifying the shared-definition checks pass, the compiled CSS inspected from the `npm run build` output resolves the ring and offset colors through `var(--color-focus-ring)` and `var(--color-focus-offset)` rather than inlined values (if a value is inlined, write the declarations directly per design.md D1 and re-verify), and `npm run lint` and `npx tsc --noEmit` exit 0

## 3. Button vertical slice

- [x] 3.1 Update `src/shared/ui/Button.test.tsx`, test "includes focus-visible ring classes from the focus tokens (D6)" in the "hover and focus-visible state classes" block: assert the single full prefixed class `focus-visible:focus-ring`, replacing the assertions on `focus-visible:ring-focus-ring` and `focus-visible:ring-offset-focus-offset`, verifying `npm run test:run` runs the file, every other Button assertion still passes and the updated focus assertion fails because Button still carries the five-class set
- [x] 3.2 Replace the five-class focus set in `BASE_CLASSES` of `src/shared/ui/Button.tsx` with `focus-visible:focus-ring` (design.md D1 and D3), changing nothing else in the component, verifying the updated focus assertion passes, every other Button test stays green unchanged, and `npm run test:run`, `npm run lint` and `npx tsc --noEmit` exit 0

## 4. Link vertical slice

- [x] 4.1 Update `src/shared/ui/Link.test.tsx`, test "includes focus-visible ring classes from the focus tokens (D6)" in the "hover and focus-visible state classes" block: assert the single full prefixed class `focus-visible:focus-ring`, replacing the assertions on `focus-visible:ring-focus-ring` and `focus-visible:ring-offset-focus-offset`, verifying `npm run test:run` runs the file, every other Link assertion still passes and the updated focus assertion fails because Link still carries the five-class set
- [x] 4.2 Replace the five-class focus set in `BASE_CLASSES` of `src/shared/ui/Link.tsx` with `focus-visible:focus-ring` (design.md D1 and D3), changing nothing else in the component, verifying the updated focus assertion passes, every other Link test stays green unchanged, and `npm run test:run`, `npm run lint` and `npx tsc --noEmit` exit 0

## 5. Divergence guard and integration verification

- [x] 5.1 Write `src/shared/ui/focus-guard.test.ts` (design.md D4, the `color-guard`/`radius-guard` pattern) over `src/shared/ui`: a hand-rolled focus indicator (`outline-none`, `ring-*` or `ring-offset-*` utilities in any state prefix) fails naming the offending class and file, and the migrated controls carry `focus-visible:focus-ring`, verifying `npm run test:run` runs the guard, it passes on the migrated surface, and it fails naming a file and a class when a hand-rolled set is temporarily introduced
- [ ] 5.2 Verify the complete change with `npm run test:run`, `npm run lint` and `npx tsc --noEmit`, verifying all three commands exit 0 and the Button and Link focus tests assert only `focus-visible:focus-ring`

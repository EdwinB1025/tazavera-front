No derived API types are needed: the change reads no API field (design.md Context).

## 1. Pointer cursor on every enabled action (base-controls)

- [x] 1.1 Create `src/app/styles/pointer-cursor.test.ts` with one test for the scenario "Pointer on enabled actions only". It reads `src/app/styles/globals.css`, `src/shared/ui/DropdownMenu.tsx` and `src/shared/ui/ComboboxPopup.tsx` as text (as `src/app/styles/theme-tokens.test.ts` reads the stylesheet) and asserts: an `@layer base` block holds a rule whose body is `cursor: pointer;` and whose selector contains `a[href]`, `button`, `summary`, `label[for]`, `select`, the six input types of design.md D1, the nine roles of design.md D1, and the exclusion `:not(:disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"]))`; that selector contains no `[role="combobox"]`, `textarea` or `[type="text"]`; and neither shared file contains `cursor-default`. It must fail on today's files (no such rule; `cursor-default` present) and pass once design.md D1 and D2 are applied. Verify: the test fails only for those reasons; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 1.2 Implement design.md D1 in `src/app/styles/globals.css` and D2 in `src/shared/ui/DropdownMenu.tsx` and `src/shared/ui/ComboboxPopup.tsx`. Verify: `npx vitest related src/app/styles/globals.css src/shared/ui/DropdownMenu.tsx src/shared/ui/ComboboxPopup.tsx src/app/styles/pointer-cursor.test.ts --run` passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [ ] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, lint with 0 errors. Any failure is fixed in its own `fix(base-controls): …` commit, or reported when the fix would go beyond the end state.

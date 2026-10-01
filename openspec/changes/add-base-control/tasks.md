# Tasks

## 1. Foundation: dependency, icon source, types

- [ ] 1.1 Add the approved `lucide-react` dependency to `package.json` and install it, verifying `npm install` succeeds and `npm run lint` and `npm run test:run` still pass
- [ ] 1.2 Write the icon entry-point test (asserts `Loader2`, `ArrowLeft` and the `LucideIcon` type are exported from `src/shared/ui/icons.ts`, and that no other file under `src/` imports `lucide-react`), verifying `npm run test:run` runs the file and fails because `icons.ts` does not exist yet
- [ ] 1.3 Create `src/shared/ui/icons.ts` as the only `lucide-react` import site, verifying the icon entry-point test passes
- [ ] 1.4 Declare the UI-specific types (ButtonProps union with required accessible name for icon-only buttons, ButtonVariant, ButtonSize, LinkProps) at the top of `src/shared/ui/Button.tsx` and `src/shared/ui/Link.tsx` with no components yet and no generated API type touched, verifying `npx tsc --noEmit` passes

## 2. Button vertical slice

- [ ] 2.1 Write `src/shared/ui/Button.test.tsx` covering label rendering, size geometry (h-10 px-4 / h-8 px-3), icon 16px with gap-2, icon-only square shape and accessible name, treatment classes per variant, hover and focus-visible state classes, disabled semantics (opacity, cursor, no click), and busy semantics (aria-busy, disabled, kept label, no rotation class under reduced motion), verifying `npm run test:run` runs the file and fails because the component is not implemented
- [ ] 2.2 Implement Button in `src/shared/ui/Button.tsx` (geometry D3, treatments D2, states D4/D5, focus D6, `radius-pill`), verifying `npm run test:run` passes the Button tests and `npm run lint` and `npx tsc --noEmit` pass

## 3. Link vertical slice

- [ ] 3.1 Write `src/shared/ui/Link.test.tsx` covering internal route rendering, permanent underline in rest and hover, the back variant (16px leading arrow icon with gap-2 and its text), and hover and focus-visible state classes, verifying `npm run test:run` runs the file and fails because the component is not implemented
- [ ] 3.2 Implement Link in `src/shared/ui/Link.tsx` with `next/link`, always underlined and back variant per D7, verifying `npm run test:run` passes the Link tests and `npm run lint` and `npx tsc --noEmit` pass

## 4. Radius tokens and theme verification

- [ ] 4.1 Extend `src/app/styles/theme-tokens.test.ts` with a radius completeness check (every `--radius-*` defined in `@theme` is reassigned under `[data-theme="dark"]`) and the four documented `nav-button` focus pairs (D6) in both theme matrices, verifying `npm run test:run` shows the focus pairs passing and the radius check failing because the tokens do not exist yet
- [ ] 4.2 Add the radius `@theme` block (`radius-pill` 9999px, `radius-container` 16px, `radius-field` 8px, `radius-check` 4px) and their four `0` reassignments in the dark block of `src/app/styles/globals.css`, touching no existing token, verifying `npm run test:run` passes completely including radius completeness
- [ ] 4.3 Confirm the generated `rounded-pill`, `rounded-container`, `rounded-field` and `rounded-check` utilities read `var(--radius-*)` so the dark reassignment applies (inspect the CSS emitted by `npm run build`); if a value is inlined instead, define that utility with `@utility` per design.md D1 and re-verify, verifying the emitted CSS resolves radii through the variables and `npm run test:run` still passes

## 5. Segment integration

- [ ] 5.1 Write a smoke test importing Button, Link and the icon module through `@/shared/ui` and rendering both controls, verifying `npm run test:run` runs it and fails because the segment entry does not exist yet
- [ ] 5.2 Create `src/shared/ui/index.ts` exporting Button, Link and the icon module, verifying the smoke test passes
- [ ] 5.3 Verify the complete change with `npm run test:run`, `npm run lint` and `npx tsc --noEmit`, verifying all three commands exit 0

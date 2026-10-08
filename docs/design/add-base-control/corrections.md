continue applyin the the previous fix, reload AGENTS.md rule and work basedon on them:Review of add-base-control — corrections before merge.

Button
1. Busy must not submit forms: when loading, the click handler must call
   event.preventDefault() before returning (returning early from onClick does not
   cancel the native default action). Add a test: <form onSubmit={spy}><Button
   type="submit" loading>Save</Button></form>, click it, assert spy not called.
2. Spread {...rest} BEFORE the explicit props so aria-busy, aria-disabled, type,
   onClick and className set by the component cannot be overridden by callers.
3. Busy shows no hover change: gate the hover treatment so it applies only when
   the button is neither natively disabled nor aria-disabled.
4. Tests: assert the full prefixed classes ("disabled:opacity-50",
   "disabled:cursor-not-allowed", "enabled:hover:bg-action-primary-hover"), not
   substrings that would still pass without the prefix.

Link
5. Color utilities are wrong: tokens --color-text-link and --color-text-link-hover
   generate text-text-link and hover:text-text-link-hover. "text-link" and
   "hover:text-link-hover" generate no CSS. Fix the classes.
   Add a guard test: every color utility used in src/shared/ui (bg-, text-,
   border-, ring-, ring-offset-, incl. state-prefixed) must map to a --color-*
   token defined in globals.css (or a Tailwind built-in color); fail naming the
   offending class and file.
6. Apply inline-flex/items-center/gap-2 only to the back variant; the default
   link stays inline so its text wraps with surrounding text.
7. Exclude protocol-relative URLs: href must reject `//${string}` at compile time
   (conditional type). Add a second @ts-expect-error case with "//example.com".

Guards and token tests
8. radius-guard.test.ts: switch to an allowlist. Allowed: rounded-pill,
   rounded-container, rounded-field, rounded-check, rounded-full (intrinsic
   circles: radio, coffee bean, slider thumb, avatar) and rounded-none. Any other
   rounded utility fails: bare "rounded", any size suffix, directional variants
   (rounded-t-*, rounded-s-*, rounded-tl-*, …) and arbitrary values
   (rounded-[…]).
9. icons.test.ts: also catch subpath imports (lucide-react/…) and dynamic
   imports (import("lucide-react")).
10. theme-tokens.test.ts: assert radius VALUES, not only presence — traditional
    9999px / 16px / 8px / 4px, dark 0 for all four.

After the fixes: npm run test:run, npm run lint and npx tsc --noEmit must exit 0. 

### Status

- Date: 2026-10-02
- `openspec validate add-base-control --strict` → `Change 'add-base-control' is valid`
- Round 1 of the change `add-base-control` (this file has no `## Round N` heading; the round is the review above).

1. Busy must not submit forms — artifacts: `specs/base-controls/spec.md` (new scenario "Busy does not submit forms"), `design.md` (D4: the busy click handler cancels the native default action). Tasks: 6.1, 6.2.
2. Spread `{...rest}` before the explicit props — artifacts: `design.md` (types section: props precedence). No specified behaviour change. Tasks: 6.3, 6.4.
3. Busy shows no hover change — artifacts: `specs/base-controls/spec.md` (Hover feedback narrowed to a non-busy button, Busy scenario extended), `design.md` (D4 and D5: the hover gate). Tasks: 6.5, 6.6.
4. Button tests assert full prefixed classes — artifacts: `design.md` (D10: full prefixed class names in state assertions). No specified behaviour change. Task: included in 6.5 (tightened assertions over code that is already correct).
5. Link color utilities and the color-utility guard — artifacts: `design.md` (D7: `text-text-link` / `hover:text-text-link-hover`; D10: `color-guard.test.ts`). No specified behaviour change (the spec already says the link colors come from the link tokens). Tasks: 6.7, 6.8.
6. Layout classes only on the back variant — artifacts: `specs/base-controls/spec.md` (new scenario "Default variant stays inline"), `design.md` (D7). Tasks: 6.9, 6.10.
7. Protocol-relative URLs rejected at compile time — artifacts: `specs/base-controls/spec.md` (External destination refused names protocol-relative URLs), `design.md` (types section and D7: `href` conditional type). Tasks: 6.11, 6.12.
8. radius-guard allowlist — artifacts: `design.md` (D10). No specified behaviour change (intrinsic circles and the no-radius cases are already exempted in the spec). Task: included in 6.13.
9. icons.test.ts also catches subpath and dynamic imports — artifacts: `design.md` (D10). No specified behaviour change. Task: included in 6.13.
10. theme-tokens.test.ts asserts radius values — artifacts: `design.md` (D10). No specified behaviour change (the values are already specified). Task: included in 6.13.
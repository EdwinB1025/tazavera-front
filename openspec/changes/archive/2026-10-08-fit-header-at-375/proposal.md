Type: Refactor (fast lane)

# Proposal

## Why

The design lead's visual review on real data (2026-10-08) found that the header of `refine-header-aut` overflows at 375px for a signed-out visitor on pages with the sidebar re-open control (offerings, coffee shops, coffee-shop detail). The page grows to 388px (es), 389px (ca) and 377px (en), "Sign in" is cut at the right edge and the theme toggle (`size-10`) shrinks to 33px (es) and 26px (ca). This breaks `refine-header-aut` design D1 ("no overflow at 375px"). Signed in, the header fits because the avatar is narrower.

Product owner typed this AUT correction for the fast lane and settled the fix (2026-10-08, option a). It fixes the overflow by Product owner's decision.

## What Changes

- **Language selector below `md`.** The trigger shows only the globe icon and the chevron; the locale code text is hidden visually below `md` and stays available to assistive technology. The control's accessible name is unchanged and still states the current language. From `md` the trigger looks as today.
- **Left group gap.** Below `md` the header's left group gap goes from `gap-4` to `gap-2`; from `md` it stays `gap-4`.
- **Theme toggle.** It no longer shrinks (`shrink-0`) and stays `size-10`.
- No new token, text or icon: the selector reuses its existing globe and chevron.

## Non-goals

- No change to the signed-in header, the user menu, the right group's gap or the sidebar re-open control.
- No change to the QA suite (`qa/`), and no API or contract change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: "Signed-out header" gains the scenario "Header fits a small viewport". "Language selection" shows the locale code only from medium viewports, with the globe and chevron on every viewport.

## Impact

- Code: `src/widgets/app-header/ui/LanguageSelect.tsx`, `src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-header/ui/ThemeToggle.tsx`.
- Tests: `src/widgets/app-header/ui/AppHeader.test.tsx` (one new test for "Header fits a small viewport"; the left-group test drops its "no `md:` class" assertion), `src/widgets/app-header/ui/ThemeToggle.test.tsx` (the exact class list of "Switch presentation" gains `shrink-0`).
- APIs, dependencies: none.

## Propose status

- **Change-id:** fit-header-at-375
- **Date:** 2026-10-08
- **`openspec validate fit-header-at-375 --strict`:** valid
- **Backlog entries resolved:** none (AUT correction of `refine-header-aut`, given in the session prompt)
- **Resolved:**
  - Fix → option a (Product owner): locale code hidden below `md` with `sr-only md:not-sr-only`, left group `gap-2 md:gap-4`, theme toggle `shrink-0`.
  - Spec placement → the new scenario goes to "Signed-out header"; "Language selection" is MODIFIED with the smallest wording change, because its text required the code on every viewport. The scenario "Trigger content on every viewport" keeps its name.
- **Open:** none.

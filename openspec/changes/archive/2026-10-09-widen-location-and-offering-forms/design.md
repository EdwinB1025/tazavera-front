## Context

Product owner's AUT finding (2026-10-09): Manage locations shows its card at half the page. The cap is on the card itself: `CARD_CLASSES = w-full md:max-w-160` in `src/features/location-management/ui/LocationForm.tsx` and `EMPTY_CARD_CLASSES = w-full md:max-w-160` in `src/features/location-management/ui/LocationsPanelStates.tsx`. New offering's panel (`PANEL_CLASSES = w-full md:max-w-160` in `src/pages/new-offering/ui/NewOfferingForm.tsx`) has the same cap. `widen-account-cards` (R51) settled the pattern: the card fills the container and its content goes into one wrapper capped at 40rem from `md` (`AccountSection`). No API endpoint is consumed or changed.

## Goals / Non-Goals

**Goals:** the location form card, the empty card and the New offering panel fill the page container; their content stays at most 40rem from `md`, start-aligned.

**Non-Goals:** changing `PageSection`, `Card`, the location list, texts, states, requests or tokens.

## Decisions

### D1. Card fills, content capped (repeats widen-account-cards D2)

- `LocationForm.tsx`: the card takes `w-full` only; the `form` inside `CardContent` goes into one wrapper `w-full md:max-w-160`. The header band (`CardAside`) still fills the card.
- `LocationsPanelStates.tsx`: the empty card takes `w-full` only; its stack (empty text and "Add location") goes into one wrapper `w-full md:max-w-160`.
- `NewOfferingForm.tsx`: the panel takes `w-full` only; the `form` inside `CardContent` goes into one wrapper `w-full md:max-w-160`; the form keeps `flex flex-col gap-6`.
- The wrapper has no `mx-auto`, so the content stays aligned to the card's start. Below `md` the wrapper is full width, as the card was.

## Risks / Trade-offs

- [jsdom asserts classes, not pixels] → the updated test asserts the class names; Product owner checks the visual end state in a browser.

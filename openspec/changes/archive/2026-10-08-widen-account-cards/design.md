## Context

Production AUT finding 19 (backlog R51): the account cards sit in a 32rem column (`src/pages/account/ui/AccountScreen.tsx:84`, `flex w-full max-w-lg flex-col gap-8`) and look cut off on wide screens. The registration routes (`src/pages/register/ui/RegisterScreen.tsx:54`) and the not-found page (`src/pages/not-found/ui/NotFoundScreen.tsx:25`) use a centred 32rem column (`mx-auto … max-w-lg`). Product owner and the design lead settled the end state below. No API endpoint is consumed or changed; no API error presentation changes.

## Goals / Non-Goals

**Goals:** the account, registration and not-found cards fill the `PageSection` container; form content inside a section card keeps a readable width from `md`.

**Non-Goals:** changing `PageSection`, `Card`, the confirmation dialogs, texts, states or requests; any other page's layout.

## Decisions

### D1. Column (replaces add-user-account D10 "Column")

Registration, account and not-found fill the `PageSection` container (no max width, start-aligned); inside a section card, form content is at most 40rem from `md` (`md:max-w-160`). This reverses adopt-section-card-in-account item 4. The side margins are `PageSection`'s own container (max 72rem, 1rem side padding below `md`, 2rem from `md`); nothing new is added for them.

- `src/pages/account/ui/AccountScreen.tsx` (pages): the column wrapper becomes `flex w-full flex-col gap-8` (`max-w-lg` removed).
- `src/pages/register/ui/RegisterScreen.tsx` (pages): the column wrapper becomes `flex w-full flex-col gap-8` (`mx-auto` and `max-w-lg` removed).
- `src/pages/not-found/ui/NotFoundScreen.tsx` (pages): the card wrapper becomes `w-full` (`mx-auto` and `max-w-lg` removed); no content cap.

### D2. Content width inside a section card

- `src/features/user-account/ui/AccountSection.tsx` (features): the children go into one wrapper `flex w-full flex-col gap-6 md:max-w-160` inside `CardContent`, which keeps its padding and loses its own `flex flex-col gap-6`; the header band (`CardAside`) still fills the card. The loading and signed-out gate cards of the account page do not use `AccountSection` and get no cap.
- `src/pages/register/ui/RegisterClient.tsx` (pages): the content of `CardContent` (loading status, or the form with its success panel) goes into one wrapper `w-full md:max-w-160`; the submit button stays `w-full`, so it spans the capped width.
- `md:max-w-160` is the existing form-width precedent (`src/features/location-management/ui/LocationForm.tsx:73`, `src/pages/new-offering/ui/NewOfferingForm.tsx:45`); Tailwind 4 generates it from the spacing scale (160 × 0.25rem = 40rem).

### D3. Dialogs

`AlertDialog` (`max-w-lg`) and the confirmation dialogs built on it keep their width.

## Risks / Trade-offs

- [jsdom asserts classes, not pixels] → the tests assert the class names; the visual end state is checked by Product owner in a browser at 375px and 1280px.
- [Layout decision reversed] → add-user-account D10 and adopt-section-card-in-account item 4 are superseded by D1; the specs state the new end state.

# Design

## Context

See proposal.md (Why) and backlog entry R80. Today `CreateForm` in `src/pages/new-offering/ui/NewOfferingForm.tsx` (pages layer) renders, after a `201`, a `role="status"` region with the text `${createdStatus} ${count}` and an inline `Link` to `/{locale}/manage/offerings` (`viewMyOfferings`), and an end-aligned `ActionGroup` with the submit `Button` ("Create offerings", variant `primary`) and the "Cancel" `RouteButton` (variant `action-4`, size `base`). The create flow (`useCreateFlow`, `src/features/offering-management/model/create-flow.ts`) sets `status` to `{ state: "created", count }` and `item` to `null` on success; `choose` sets `item` and does not touch `status`, which stays `created` until the next submit.

No API endpoint, field or error changes: the change sends exactly today's requests (`GET /locations`, `GET /coffeeInventory`, `POST /offerings`). No derived type is needed.

## Goals / Non-Goals

**Goals:** the modified and added scenarios of "Creating offerings" in the offering-management delta, inside the pages-layer form only.

**Non-Goals:** any change to `src/features/offering-management` (the flow's states, requests and reset stay as they are), to `src/shared/ui`, to the catalogs or to `NewOfferingScreen.tsx`.

## Decisions

### D1. The created state is read in the page form

`CreateForm` derives `showList = status.state === "created" && flow.item === null`. When `showList` is true the action group renders, in the submit action's place, `<RouteButton href={listRoute} variant="action-3" size="base">{texts.viewMyOfferings}</RouteButton>` (R80 point 2: navigate/consult variant, as the button-variant rule), followed by the existing "Cancel"; otherwise it renders the submit `Button` exactly as today. Choosing an item sets `flow.item`, so "Create offerings" returns (R80 point 3); clearing that choice again before a new submit shows "View my offerings" again, which is the same created state.

The status region keeps today's lifecycle (shown while `status.state === "created"`, until the next submit) and keeps its `role="status"` and `STATUS_CLASSES`, holding only the text; the `Link` import is dropped if nothing else uses it (R80 points 1 and 4).

Alternative rejected: a new flag in `useCreateFlow` that `choose` clears. It changes the feature model for a rendering concern of one screen, and would also hide the status line on a new choice, which point 4 keeps as today.

### D2. Size limits

`CreateForm` must stay within 80 lines. If the swap pushes it over, the build moves the action group into a sibling component in the same segment (e.g. `src/pages/new-offering/ui/CreateActions.tsx`, taking `listRoute`, `showList`, the submit's `disabled` and `loading`, and the two or three labels), imported directly from its file, not through an index.

## Risks / Trade-offs

- [The status line stays visible after a new choice, next to "Create offerings"] → this is today's behaviour, kept by R80 point 4; it clears on the next submit.
- [The `next/navigation` router is used by `RouteButton`, so tests drive the new button through the existing `useRouter().push` mock] → no new mock is needed.

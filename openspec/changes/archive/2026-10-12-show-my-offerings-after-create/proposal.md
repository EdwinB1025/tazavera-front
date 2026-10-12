Type: Refactor (fast lane)

## Why

Backlog entry R80 (Product owner, 2026-10-12), an AUT correction taken as a fast lane by Product owner's standing order for AUT findings: after offerings are created on "New offering", the form resets and keeps "Create offerings", which cannot act until an inventory item is chosen again, so the action looks like it does nothing; the way to the list is only an inline link in the status line. Product owner settled the end state: "View my offerings" becomes a button that takes the place of "Create offerings" after a creation, and stops being a link.

## What Changes

- After a successful creation, the status line keeps announcing the number of created offerings (`createdStatus` + count) as text only, with no link (R80 point 1).
- In that created state, the end-aligned action group shows a "View my offerings" button (existing catalog text `viewMyOfferings`) in place of "Create offerings", opening `/{locale}/manage/offerings`, followed by "Cancel" as today (R80 point 2).
- As soon as the user chooses an inventory item again, "Create offerings" returns in its place, so several creations in a row stay possible; the reset of the inventory choice and the location checkboxes stays as today (R80 point 3).
- Nothing else changes: requests, errors, the pending state, texts and other screens (R80 point 4).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Creating offerings": the requirement text and the scenario "Create success" drop the status line's link; ADDED scenarios "View my offerings after a create" (point 2) and "Create offerings returns on a new choice" (point 3).

## Non-goals

- No change to the create request, its error handling, the pending state, the inventory field, the locations group or the preselected item.
- No new catalog text, token, dependency, guard test or API request.
- No change to the sidebar entries, other screens or other backlog entries (R76–R79 run in parallel on other files).
- The feature model of the create flow (`src/features/offering-management`) is not changed.

## Impact

- Modified: `src/pages/new-offering/ui/NewOfferingForm.tsx` (status line and action group), and, if the size limits require it, a new sibling file in `src/pages/new-offering/ui/`.
- Tests: in `src/pages/new-offering/ui/NewOfferingForm.test.tsx` (validation suite), the test of "Create success" updated to the modified scenario, and two new tests, one per added scenario. Every other test keeps its assertions.
- QA suite: no QA test is expected to become stale (none queries the status line's link).

## Propose status

- Change-id: `show-my-offerings-after-create`
- Date: 2026-10-12
- `openspec validate show-my-offerings-after-create --strict`: valid
- Resolves backlog entry: R80 (fast lane by Product owner's order, AUT correction of 2026-10-12).
- Resolved (backlog entry R80, Product owner): status line text only (point 1); "View my offerings" as a route button, variant `action-3`, size `base`, in the same end-aligned action group before "Cancel" (point 2); "Create offerings" returns on a new inventory choice (point 3); nothing else changes (point 4).
- Resolved (architect, design.md D1): the created state is read in the page form as "the last create succeeded and no inventory item is chosen"; the status line keeps today's lifecycle (shown until the next submit), as point 4 keeps it.
- Open: none.

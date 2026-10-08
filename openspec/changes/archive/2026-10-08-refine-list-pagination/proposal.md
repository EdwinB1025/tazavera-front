## Why

Product owner asked (2026-10-07) for two things: the landing's verified offerings list should be shorter when it shows several columns, and the paginator should show numbered pages between Previous and Next, so a visitor can jump to any page instead of stepping one at a time. The shared paginator serves every paged list, so the second request reaches the landing, the catalog, "My offerings" and "My evaluations" at once.

## What Changes

- The shared paginator becomes a named navigation landmark with numbered pages between Previous and Next: first and last page always, a window around the current page (the current page only below 768px, one page each side from 768px), and an ellipsis for any gap of two or more pages. A number opens its page at the list's own address, keeping every other query parameter; the current page is marked as current, distinct by fill, and opens nothing.
- Below 768px Previous and Next show a chevron instead of their label, keeping the label as their accessible name; from 768px they keep their label.
- The paginator's spacing changes from "1rem apart" to 0.25rem below 768px and 0.5rem from 768px.
- **BREAKING (internal):** the paginator's texts gain a navigation label and a page label; every host passes them (landing, catalog, "My offerings", "My evaluations"). New catalog keys in `landing` and `evaluations`, in es, en and ca.
- The landing requests 6 verified offerings per page (`perPage=6`), at every width, so the grid always ends in a full row at one, two and three columns. Today it shows the API's default of 15.
- A chevron-left icon is added to the shared icon entry point.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: "Pagination" gains numbered pages, the page-number window, the current page, the navigation name and the compact Previous/Next below 768px; its spacing changes.
- `landing`: "Verified offerings list" shows 6 offerings per page with the numbered pagination.

## Non-goals

- The catalog's layout, the card content and any list's grid.
- Previous/Next behaviour at the boundaries, and the scroll position after a page change.
- A "see the full catalog" link below the landing list (design summary, Open 2 closed: A).
- Page size of any list other than the landing's (catalog, "My offerings", "My evaluations" keep the API default).
- "My evaluations" keeps its own rule of showing the paginator only when there is more than one page.
- Public evaluations and the coffee shop directory: they pass the new texts when they adopt the paginator in their own changes.
- Any change to `contracts/openapi.yaml` (`perPage` and `listOfferings`' `page` are communicated by Product owner, not documented in the contract).

## Impact

- Code: `src/shared/ui/Pagination.tsx` and its test, `src/shared/ui/icons.ts`, `src/shared/ui/index.test.tsx`; landing fetch `src/widgets/offering-list/api/offerings.ts`; hosts `src/pages/home`, `src/pages/offerings`, `src/pages/manage-offerings`, `src/pages/evaluations-list` and their tests; catalogs `messages/{es,en,ca}/landing.json` and `messages/{es,en,ca}/evaluations.json`.
- API: `GET /offerings` called with `perPage=6` from the landing (accepted by the API, standard 15, maximum 50; communicated by Product owner, decisions log 2026-10-07). No other request changes.
- Order: apply runs after `add-offering-catalog`, `add-offering-management` and `add-specialist-evaluations` merge into `develop`, so all four hosts are updated at once.
- Dependencies: none added (`lucide-react` already provides the chevron).

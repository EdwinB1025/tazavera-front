Type: Refactor (fast lane)

By Product owner's decision of 2026-10-08 (backlog R42), this package runs in the fast lane at maximum priority although points 1–4 change what users see. Unlike a behaviour-keeping refactor, it updates the specs where behaviour changes and writes one test per new or modified scenario.

## Why

The production AUT of 2026-10-08 found five user-visible defects (AUT 4, 5, 6, 7 and 9) that must be fixed before the deploy, delivered as one package merged into `develop` together.

## What Changes

1. **Offering card flavours (AUT 4).** The card's taxonomy badges come from the offering's consensus (its CATA concordance), not from the per-attribute sensory taxonomy, which repeats a note once per attribute. Each taxonomy value shows once; notes marked on several aromatic attributes are already condensed into the concordance's single `aromatics` group. The fallback to the baseline evaluation when there is no consensus stays open (see Propose status): its data is not in the list response.
2. **Card actions (AUT 5).** Every action of a card — offering card, coffee shop card and public evaluation row — is an action button, not a link; the map actions keep their current form. On the offering card, View shows only to a signed-in user.
3. **Back link of the detail headers (AUT 6).** The Back link of the offering detail, the coffee shop detail and the public evaluation view returns to the previous page of the application, with its query, and falls back to today's fixed list route when there is none (a new tab or an outside link).
4. **Header on mobile (AUT 7).** Below the medium breakpoint a menu control with a three-lines icon replaces the hidden primary navigation entries and lists them in a menu presented like the user menu.
5. **Pagination (AUT 9).** Changing page in a list loaded on the server shows the list's loading state at once instead of keeping the old page until the new one has loaded. The remaining wait on the catalog, caused by uncached facet reads in the sidebar, is reported, not fixed (backlog R30).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: "Offering card content", "Taxonomy badges on the offering card" and "Offering card actions" (flavours from the consensus, each once; View for signed-in users only, as an action button; actions supplied by the consumer).
- `evaluations`: "Evaluate action on the offering card" (action button; View for signed-in users only), "Public evaluations list" (row actions are action buttons), "Read-only evaluation view" (Back to the previous page).
- `offering-catalog`: "Coffee shop card" (View as an action button), "Offering detail page" and "Coffee shop detail page" (Back to the previous page).
- `base-controls`: new requirement "Back link to the previous page".
- `app-shell`: "Header brand and primary navigation" (navigation menu on a small viewport).
- `content-structure`: new requirement "Prompt page change on server-loaded lists".

## Non-goals

- The baseline-evaluation fallback for an offering without consensus (open question for Product owner; it needs a request per card).
- Caching the reference reads (`/coffees`, `/taxonomies`) that still delay the catalog's page change: backlog R30.
- Back links of the management forms (evaluation form, new offering) and of the not-found page: they keep their fixed destinations.
- Links outside cards (detail headers, landing hero, about page) and the header's own navigation.
- Any change to the API, its contract or the generated types; no new dependency, token or colour value.

## Impact

- Code: `src/entities/offering`, `src/entities/coffeeshop`, `src/features/evaluate-offering`, `src/widgets/offering-list`, `src/widgets/evaluation-row`, `src/widgets/app-header`, `src/widgets/offering-detail`, `src/widgets/coffeeshop-detail`, `src/pages/manage-offerings`, `src/pages/offering-detail`, `src/pages/coffeeshop-detail`, `src/pages/public-evaluation`, `src/pages/home`, `src/pages/coffeeshops`, `src/shared/ui`, `src/shared/lib`, `src/app/shell`.
- Messages: one new `shell` key in es, en and ca.
- API usage: unchanged (same endpoints, same number of requests).

## Propose status

- Change-id: `fix-production-aut-findings`
- Date: 2026-10-08
- Backlog entry: R42
- `openspec validate fix-production-aut-findings --strict`: pass
- Resolved in design.md: D1 flavour source (CATA concordance, de-duplicated by reference); D2–D4 card actions as route buttons, View moved to the consumers; D5–D6 Back from a navigation record kept by the shell, with the fixed route as fallback; D7 mobile menu over the shared dropdown menu; D8 keyed list boundaries for the page change.
- Open for Product owner:
  1. **Baseline fallback (point 1).** With no consensus the list response carries empty `sensoryTaxonomy` and `cataConcordance`; the baseline evaluation is only available through `GET /evaluations?evaluationType=baseline&offeringId=…`, one request per card. Per the session's rule this change adds no request: a card without consensus shows no flavour badge (today's behaviour for those offerings). Decide whether to add the per-card request (or ask the API for the baseline in the list response).
  2. **Back labels (point 3).** The coffee shop detail's label reads "Volver a cafeterías" while it may now return to another page; keep it, or use the generic "Volver"?
  3. **Remaining catalog wait (point 5).** The catalog's sidebar facets read `/coffees` and `/taxonomies` uncached on every page change outside any loading boundary; R30 (approved) removes it.

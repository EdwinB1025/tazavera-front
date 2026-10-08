# Proposal

## Why

The contract now documents the public coffee shop directory (`listCoffeeShops`, `getACoffeeShop`) and the `coffeeshopUlid` filter of `listOfferings`, but the front has no screen for them: a visitor can browse offerings, yet cannot find the coffee shops that serve them, see where their locations are, or list one coffee shop's offerings. Product owner decided the directory on 2026-10-06 (decisions log "directorio de cafeterías" and "directorio por negocio, pestañas y barra lateral de la cafetería"); its design summary is approved (`docs/design/add-coffeeshop-directory/design-summary.md`).

## What Changes

- **Coffee shop directory** at `/{locale}/coffeeshops` (public): heading block, a body toolbar (Filters trigger, list/map view toggle, sort by name A–Z / Z–A), one coffee shop card per coffee shop of the current page in one centred column, pagination, and the loading, empty, filtered-empty and error states. Each card shows the verified-offerings badge, the name, the number of locations, the cities, the offering counts, a View link and a "show on the map" action.
- **Coffee shop facets** in the sidebar (filtering): Name, Postal code, City and "With verified offerings", with applied chips and "Clear all", the state kept in the URL; full screen on a small viewport, as the offering facets.
- **Map view** of the directory: every located location of the current page as a keyboard-reachable marker, a selected-location panel, own zoom buttons and an always-visible map attribution; the card's map action focuses that coffee shop's locations; below the medium breakpoint the map opens full screen. Tiles come from the OpenStreetMap tile server.
- **Coffee shop detail** at `/{locale}/coffeeshops/{ulid}` (public): back link, header with the business data, and two tabs kept in the URL (`?tab=`): **Offerings** (the shared filtered-offerings toolbar, results and facets of `@/widgets/offering-list` — the catalog's own compositions — with the request always carrying `coffeeshopUlid` and the pagination keeping the tab) and **Locations** (the map and one card per location).
- **Header entry** "Explora coffees" → `/{locale}/coffeeshops`, between "Top rated" and "About us".
- **Sidebar routes**: the sidebar also appears on the directory and on the detail's Offerings tab.
- **Content-Security-Policy**: images are also allowed from the map tile server (approved by Product owner).
- **Texts**: a new `coffeeshops` message area (es / en / ca) and the `shell` key of the new header entry.
- **Map library (approved by Product owner, 2026-10-07)**: `leaflet@1.9.4` + `@types/leaflet@1.9.22` behind one entry point in `src/shared` (design.md D16).
- **Filtered offerings pagination keys**: `FilteredOfferingsResults` gains one optional prop adding keys to its pagination links only; the catalog does not pass it (design.md D17).

## Capabilities

### New Capabilities

- `offering-catalog`: introduced by `add-offering-catalog` (not archived yet; it archives first). This change adds the public coffee shop directory to it — the list with its view toggle and map, the coffee shop card, and the coffee shop detail with its Offerings and Locations tabs — as `config.yaml`'s "reuse an existing capability" rule asks (design summary §1.1).

### Modified Capabilities

- `filtering`: adds the coffee shop facet set — its facets, URL state, applied chips, sort, body toolbar and filtered results. No existing requirement changes.
- `app-shell`: the primary navigation gains the "Explore coffee shops" entry; the sidebar also appears on the directory and on the coffee shop detail's Offerings tab; the Content-Security-Policy allows images from the map tile server.

## Out of Scope (Non-Goals)

- Map clustering, the visitor's geolocation ("near me"), directions, and address search on the map.
- A district facet: the API exposes no district field (summary Open 6).
- Linking the offering detail's coffeeshop caption to the coffee shop: `getAnOffering` exposes the location, not the coffee shop user (summary Open 12).
- A mobile navigation for the header entries (summary finding 1; a separate app-shell change).
- Creating or editing locations (`add-coffeeshop-location`) and contacts (`add-user-contact`).
- The `config.yaml` description line of `offering-catalog` (Product owner owns that file; summary Open 1).
- A page-size parameter: the directory requests the API's default page size.
- Any change to `contracts/openapi.yaml`, `src/shared/api/schema.ts` or `AGENTS.md`.

## Impact

- **Code (created):** routes `app/[locale]/coffeeshops/page.tsx`, `app/[locale]/coffeeshops/[ulid]/page.tsx`, `app/[locale]/@sidebar/coffeeshops/page.tsx`, `app/[locale]/@sidebar/coffeeshops/[ulid]/page.tsx` (layer `app`); screens `src/pages/coffeeshops/` and `src/pages/coffeeshop-detail/` (`pages`); widgets `src/widgets/coffeeshop-list/` and `src/widgets/coffeeshop-detail/` (`widgets`); feature `src/features/coffeeshop-facets/` (`features`); entity `src/entities/coffeeshop/` and, if `add-coffeeshop-location` has not merged it, `src/entities/location/` (`entities`); map pieces in `src/shared/ui` and the map library entry point `src/shared/lib/leaflet/` (`shared`); `src/entities/location/` identical to `add-coffeeshop-location`'s (`entities`); `messages/{es,en,ca}/coffeeshops.json`.
- **Code (modified):** `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx` and `Offerings.tsx` (`paginationQuery`), `src/widgets/app-header/ui/PrimaryNav.tsx` and its texts, `messages/{es,en,ca}/shell.json`, `proxy.ts` (`img-src`), `src/shared/ui/icons.ts`, `src/shared/ui/index.ts`, `src/shared/api/index.ts` (derived types).
- **API:** consumes `listCoffeeShops` (`GET /coffeeshops`) and `getACoffeeShop` (`GET /coffeeshops/{user_ulid}`); reuses `listOfferings` with `coffeeshopUlid` and the facet option reads of `add-offering-facets`. All public, fetched on the server with plain `fetch`. External: OpenStreetMap tiles (images only).
- **Dependencies:** `leaflet@1.9.4` and `@types/leaflet@1.9.22` (dev), approved (design.md D16).
- **Apply dependencies (merged into `develop` `d264dd2`, then into this branch):** `add-offering-catalog`, `add-offering-facets`, R9 (`ClearFiltersButton`), R12 (`FilteredOfferingsToolbar`, `FilteredOfferingsResults`, `FilteredOfferingsFacets`), `add-user-contact` (`ContactDetails`). `add-coffeeshop-location` is not merged: this change creates its `LocationCard` with identical content (design.md D11).

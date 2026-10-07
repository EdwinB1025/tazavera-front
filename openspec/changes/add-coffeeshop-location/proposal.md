# Proposal

## Why

A signed-in coffeeshop cannot see or add its locations on the web, so the coffee shop directory has nothing to place on its map and the offering form's location list can only be filled by the API's seeder. The contract now documents both operations the page needs (`listAUsersLocations`, `createALocation`, `contracts/openapi.yaml` `290d22e`), and the approved design summary (`docs/design/add-coffeeshop-location/design-summary.md`, `Status: approved`) settles the page, the geocoding in the browser and the sidebar entry.

## What Changes

- **Manage locations** at `/{locale}/manage/locations`, for the `coffeeshop` role only: the coffee shop's own locations as one column of location cards (name, description, the primary contact's details, and a "Not on the map" line when the location has no coordinates), read from `GET /users/{ulid}/locations`.
- **Empty state**: a text and an "Add location" action that reveals the form in the same card. With locations, an "Add location" action above the list reveals the same form above the list.
- **Location form**: name, description and the eight contact fields (address, postal code, city, country, phone, email, web, social) in two labelled groups, checked in the browser only for what the request documents, sent as `POST /locations`.
- **Geocoding in the browser**: on submit, one structured search to OpenStreetMap's Nominatim service with the address, postal code, city and country, aborted after 5 seconds; its first result becomes the location's `latitud`/`longitud`; no result or any failure saves the location without coordinates and says so. A result is reused for the same address during the page's lifetime. No request while typing; the help text and the OpenStreetMap attribution sit below the form.
- **Write outcomes**: success closes the form, announces the creation, re-reads the list and moves focus to the page heading; `403` shows the step-up notice; `422` and every other failure show the generic form error, keeping the values.
- **Access gate** as the other management routes: loading status, signed-out message with "Sign in", the 404 page for another role.
- **Sidebar**: the coffee shop management area shows two entries on all its routes, "Manage offerings" and "Manage locations", each marked current on its own routes. **This modifies** the single-entry requirement that `add-offering-management` introduces.
- **Content-Security-Policy**: `connect-src` adds the Nominatim origin.
- New message area `location-management` (es / en / ca); `MapPin`, `MapPinOff` and `Plus` join the shared icon entry point when not already there. No dependency is added: the geocoding library is a recorded proposal pending Product owner (design.md D5), and the tasks build the geocoding entry point without it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: new requirements for the locations page (access, list, form, geocoding, creation outcomes, texts) and a modified "Management sidebar entry" requirement (two entries). The capability is introduced by `add-offering-management`, which archives before this change.
- `app-shell`: the "Content-Security-Policy" requirement also allows connections to the geocoding service's origin.

## Out of Scope

- Editing or deleting a location, or correcting its coordinates later: the contract offers only list and create.
- A map on this page: the coffee shop directory owns the map.
- Address autocomplete or geocoding while typing: forbidden by the Nominatim usage policy on the client.
- Confirming the matched place before saving: the location is saved with the first result.
- Location data in registration.
- Per-field messages for a `422` (backlog R8).
- The shared gate and write-status pieces themselves: they are moved to `src/shared/ui` by the backlog R11 refactor, which runs before this change's apply.
- The contact field group and the read-only contact details: built by `add-user-contact` and reused here.
- The `config.yaml` description of `offering-management` (Product owner's file; the proposed line is in design.md, Open Questions).

## Impact

- Code (created): `app/[locale]/manage/locations/page.tsx`, `app/[locale]/@sidebar/manage/locations/page.tsx`, the page slice `src/pages/manage-locations/`, the feature slice `src/features/location-management/`, the entity slice `src/entities/location/`, the geocoding entry point `src/shared/lib/geocoding/`, and `messages/{es,en,ca}/location-management.json`.
- Code (modified): `proxy.ts` and `proxy.test.ts` (CSP), `src/shared/api/index.ts` (derived aliases), `src/shared/ui/icons.ts`, `src/features/offering-management/ui/ManagementSidebarEntries.tsx` and the two offering sidebar entry blocks in `src/pages/manage-offerings` and `src/pages/new-offering` (second entry).
- API: consumes `listAUsersLocations` and `createALocation`; the session's `ulid` comes from `getTheAuthenticatedUser`. No contract change.
- External service: `GET https://nominatim.openstreetmap.org/search` from the browser (CSP approved by Product owner).
- Order: the apply waits for `add-offering-management`, `add-user-contact` and the R11 refactor merged into `develop` (tasks.md, group 0).

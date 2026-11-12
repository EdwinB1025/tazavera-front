# Proposal

## Why

A coffee shop that registers today lands on the entry page with no location, so it is not listed in the coffee shop directory (which lists only coffee shops with at least one location) until it finds Manage locations on its own. Product owner accepted backlog R45 (2026-10-29, option A, front only): right after registering, the front asks the coffee shop for its first location before anything else, reusing the Manage locations form. Both blockers of the earlier API-side option are gone (`POST /register` returns a `token` block; `POST /locations` needs only the read floor).

## What Changes

- New first location step at `/{locale}/manage/locations/first`: the heading "Add your first location", an introduction, and the existing new-location form, with its secondary action labelled "Later" instead of "Cancel". It has the session gate of the locations page (loading status, signed-out prompt with "Sign in", 404 for a role other than `coffeeshop`) and moves focus to its heading when it opens.
- On the step, a `201` of `POST /locations` opens `/{locale}/manage/locations`, where the new location shows in the list; "Later" opens `/{locale}` and sends nothing. Checks, geocoding, the create request and its failures are those of the Manage locations form.
- A registration on `/{locale}/register/coffeeshop` whose `201` signs the user in opens the step instead of `/{locale}`. The specialist registration keeps opening `/{locale}`, and a visitor who opens a registration route already signed in (a coffee shop included) still goes to `/{locale}`.
- The new-location form's submit handling (submit state, geocoding cache, `422` hand-back, `201` outcome) is shared by Manage locations and the step; Manage locations behaves as before.
- New texts in the `location-management` catalog, es/en/ca: `firstLocationTitle`, `firstLocationIntro`, `firstLocationLater`.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `user-account`: MODIFIED "Registration routes" (the authenticated-session rule leaves room for the coffeeshop registration's own sign-in) and "Registration result" (a signed-in coffeeshop opens the first location step; the specialist keeps `/{locale}`).
- `offering-management`: ADDED "First location step", "First location step session gate" and "First location step form".

## Out of scope

- Any API or contract change: only `registerAUser` and `createALocation` are used, as today. No new dependency, token, icon or shared component.
- Opening the step again when the step is left or fails, or for a coffee shop with no location that signs in later (summary Open 2 = A): Manage locations' empty state and New offering's "no locations" rule cover it.
- The step after a registration whose `201` has no usable `token` block (summary Open 5 = A).
- Reading the coffee shop's locations before showing the step's form (summary Open 9 = A).
- A sidebar of the step's own: the slot's default sidebar renders there.
- Any change to the registration form, its fields, checks, `422` handling, Cancel, the success panel or the registration landing; any change to Manage locations' rendering, statuses or focus moves.

## Impact

- Routing: new `app/[locale]/manage/locations/first/page.tsx`.
- `src/pages/manage-locations` (step screen and client region; one slice-local texts helper shared with Manage locations), `src/pages/register` (the anonymous-only gate takes the registration's destination), `src/features/location-management` (new-location form composition shared by `LocationsPanel` and the step; public index).
- `messages/{es,en,ca}/location-management.json`; `README.md` route table.
- Validation tests: `src/pages/register/ui/RegisterClient.test.tsx` (two tests updated, one added), new `src/pages/manage-locations/ui/FirstLocationScreen.test.tsx`. `LocationsPanel.test.tsx` and `ManageLocationsScreen.test.tsx` keep passing unchanged. No QA fixture goes stale.
- API: `POST /register` (unchanged), `POST /locations` (unchanged); no contract change. Dependencies: none.

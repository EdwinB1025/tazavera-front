# Corrections — route-api-web-pages-through-front

## Round 1

Source: the code review of 2026-10-12 (handoff, Q12), Product owner's choice: option A.

1. **Forward the API pages' tab icon.** The API's web pages ask for `/favicon.svg` (`tazavera-api/resources/views/partials/head.blade.php:9`). The front neither forwards that path nor has a file for it, so it answers 404, and those pages fall back to the front's `/favicon.ico`, which lacks the SVG's dark-mode colours. End state: `/favicon.svg` joins the web list as an exact path, forwarded to `API_INTERNAL_URL` with the path unchanged, like `/login`. `/favicon.ico` stays not forwarded: the front keeps serving its own (`app/favicon.ico`) and the "Paths that are not forwarded" scenario keeps it. `/apple-touch-icon.png` is out of scope: neither app has one.
   - Artifacts: the auth delta's "One public entry point" list and its "A listed web route is forwarded unchanged" scenario (add `GET /favicon.svg` to the examples), design.md D1 (the web list), and a task pair (test first, then the list entry in `src/shared/api/forwarding.ts`).
   - Test: in the existing root `proxy.test.ts` case for "A listed web route is forwarded unchanged", add `GET /favicon.svg` to the paths it checks; no new test file.
   - No other route, header, CSP or production file changes.

### Status

2026-10-12. `openspec validate route-api-web-pages-through-front --strict`: valid.

1. Forward the API pages' tab icon: changes specified behaviour. Updated the auth delta (`/favicon.svg` added to the web routes of "One public entry point" and to the examples of "A listed web route is forwarded unchanged"; "Paths that are not forwarded" keeps `/favicon.ico`) and design.md D1 (the web list, superseding the summary §2 row for `/favicon.svg`). Tasks created: 9.1 (test) and 9.2 (implementation).

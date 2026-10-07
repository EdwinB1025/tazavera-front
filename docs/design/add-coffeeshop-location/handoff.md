# Handoff — add-coffeeshop-location

## Session 2026-10-07 — task 11.2 visual verification (cloud)

Branch `claude/add-coffeeshop-location-verify` from `origin/feature/add-coffeeshop-location` (`dd6a2ca`).

### Setup
- `npm run build` + `npm run start` with `NEXT_PUBLIC_API_URL=https://api.tazavera.test`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_OAUTH_CLIENT_ID=test-client` (HTTPS API origin so the production token request is allowed).
- Playwright 1.56 from a scratch folder outside the repo, Chromium at `/opt/pw-browsers`, CSP not bypassed.
- Signed-in `coffeeshop` session through the app's own silent flow: the `tazavera.signed-in` marker in `localStorage`, `/oauth/authorize` intercepted with a 302 to `/callback?code&state`, `/oauth/token` with a grant, `GET /user` with the contract example and `role: "coffeeshop"`.
- `GET /users/{user_ulid}/locations`: the contract 200 example (two locations, "Nomad Coffee Gràcia" with `latitud`/`longitud` null) or `{"data": []}` for the empty state. `POST /locations`: the contract 201 example. Nominatim intercepted with one result.
- Theme through the `theme` cookie (`traditional` / `dark`); `<html data-theme>` confirmed in each run.

### Captures (`captures/`)
`list-{375,1280}-{traditional,dark}.png`, `form-…`, `empty-…`, `sidebar-375-{traditional,dark}.png` (overlay open), plus `created-{375,1280}-traditional.png` (status after a creation with the Nominatim request, extra).

### Results
| Check | Result | Evidence |
|---|---|---|
| (a) list with the two contract locations, one no-map line | PASS | both cards render; "Sin posición en el mapa" count = 1 (Gràcia) in all four runs |
| (b) form open above the list | PASS | form card bottom ≤ list top in all four runs |
| (c) empty state | PASS | empty card with text and "Añadir ubicación", no band |
| No horizontal scroll at 375 px | PASS | `scrollWidth` = `clientWidth` = 375 in list, form, empty and sidebar states, both themes |
| §8 one column | PASS | cards share the same x and width (375: x 16, w 343; 1280: x 288, w 960) |
| §8 form ≤ 40rem | PASS | form card 640 px at 1280; 343 px at 375; empty card same widths |
| §8 two-column contact rows from `md` | PASS | 1280: Código postal/Ciudad, Teléfono/Email, Web/Redes sociales on the same row, x 313 / 620, width 283, 24 px (1.5rem) gap; 375: every pair stacked (same x, increasing y) |
| Sidebar: "Administrar ofertas" then "Administrar ubicaciones", second current | PASS | in that order; `aria-current="page"` only on the second (1280 inline and 375 overlay); at 375 closed on arrival, open after the toggle |
| No CSP violation for the Nominatim request | PASS | the request `https://nominatim.openstreetmap.org/search?street=…&format=jsonv2&limit=1` was issued on submit at 375 and 1280; zero console messages mentioning Content Security Policy in all runs; served CSP `connect-src 'self' https://api.tazavera.test https://nominatim.openstreetmap.org`; "Ubicación creada." shown |

Verdict: every 11.2 check PASS.

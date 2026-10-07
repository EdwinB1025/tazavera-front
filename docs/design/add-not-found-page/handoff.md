# Handoff — add-not-found-page

## Session 2026-10-07 — task 2.2 visual verification (cloud)

Branch `claude/add-not-found-page-apply` from `origin/feature/add-not-found-page` (`577358a`) merged with `origin/develop` (`2105303`), at `365b043` (tasks 1.1–1.3 applied).

### Setup
- `npm run build` + `npm run start` with `NEXT_PUBLIC_API_URL=https://api.tazavera.test`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_OAUTH_CLIENT_ID=test-client`.
- Server-side mock (scratch folder, outside the repo): an HTTPS server on `127.0.0.1:443` for `api.tazavera.test` (hosts entry, self-signed certificate given to `next start` through `NODE_EXTRA_CA_CERTS`) answering `{"data": []}`, so the server reads (`GET /taxonomies`, home offerings) succeed.
- Browser-side mock: Playwright 1.56 from a scratch folder, Chromium at `/opt/pw-browsers`, intercepting `https://api.tazavera.test/**`. Signed-in sessions through the app's own silent flow: the `tazavera.signed-in` marker in `localStorage`, `/oauth/authorize` answered with a 302 to `/callback?code&state`, `/oauth/token` with a grant, `GET /user` with the contract example and `role` `specialist` or `coffeeshop`; `GET /user/evaluations/{ulid}` answers `404` (`01ZZZZZZZZZZZZZZZZZZZZZZZZ`).
- Theme through the `theme` cookie (`traditional` / `dark`); `<html data-theme>` confirmed in every run. Viewports 375×900 and 1280×900, full-page captures.

### Captures (`captures/`)
`<case>-{375,1280}-{light,dark}.png` for `unknown-es`, `unknown-en`, `unknown-ca`, `unsupported-locale`, `role-offerings`, `role-evaluations`, `unknown-evaluation` (28 files), plus `focus-ring-1280-light.png` (keyboard-focused link) and `in-app-navigation-1280-light.png` (state after the in-app navigation check).

### Results
| Check | Result | Evidence |
|---|---|---|
| Page renders inside the shell, not Next.js's default page | PASS | all 28 runs: `header` present, one `h1` with the locale's title, text and link shown; `<html lang>` = es/en/ca as the route |
| Texts of design.md D3 per locale | PASS | es "Página no encontrada" / en "Page not found" / ca "Pàgina no trobada", with their text and link names |
| Unsupported locale `/xx/anything` | PASS | redirected to `/es/xx/anything`, page in Spanish, HTTP 404 |
| Role not allowed: `/es/manage/offerings` as specialist, `/es/manage/evaluations` as coffeeshop | PASS | page shown after the silent sign-in (`GET /user` answered) in all 8 runs |
| Unknown evaluation `/es/manage/evaluations/<ULID>` as specialist | PASS | `GET /user/evaluations/01ZZZZZZZZZZZZZZZZZZZZZZZZ` answered 404, page shown in all 4 runs (client `notFound()` reaches the boundary) |
| Card centred in the column, spacing of design summary §5, at the top | PASS | 375: card x 16, y 112 (64 header + 48 = 3rem), w 343; 1280: x 384, y 128 (64 + 64 = 4rem), w 512 (32rem), centred on 640; beside the 256 px sidebar: x 512, centred on the main area (768) |
| No horizontal scroll at 375px | PASS | `scrollWidth` = `clientWidth` = 375 in all 14 runs at 375 |
| `ArrowLeft` icon beside the link text | PASS | icon inside the link, left of the text, vertically centred (all runs) |
| Focus ring visible on the keyboard-focused link | PASS | reached with Tab; `:focus-visible`; `box-shadow: 0 0 0 2px rgb(242,232,217), 0 0 0 4px rgb(26,47,53)`; see `focus-ring-1280-light.png` |
| Link opens `/{locale}` | PASS | `href` = `/es`, `/en`, `/ca` per locale; click from `/es/no-existe` lands on `/es` |
| `/es/no-existe` answers HTTP 404 with `<meta name="robots" content="noindex">` | PASS | status 404 (curl and browser); meta present (also on every other case) |
| In-app navigation to an unknown path shows the page in the active locale | FAIL | from `/en`, client navigation (`router.push('/en/no-such-page')`, the mechanism of `next/link`) changes the URL to `/en/no-such-page` but keeps the home page content; no document request. The RSC request answers 200: the path matches `app/[locale]/@sidebar/[...rest]`, so the route exists and, on soft navigation, the `children` slot keeps its previous page (parallel-routes doc, "Soft Navigation"); `default.tsx` applies only on hard navigation. Existing routing behaviour, not caused by this change; a reload of the same URL shows the page. |
| Sidebar on the role-gated routes (design.md Risks: reported, not fixed) | RECORDED | 1280: `/es/manage/offerings` as specialist shows the offerings route's sidebar ("Gestionar evaluaciones", "Administrar ofertas" current, "Administrar ubicaciones"); `/es/manage/evaluations` as coffeeshop shows the sidebar panel with only its toggle and no entries; unknown evaluation shows "Gestionar evaluaciones". 375: overlay closed, no entries visible |

Observations (no check of this task):
- Role-gated and unknown-evaluation pages answer HTTP 200: `notFound()` runs on the client after a streamed response (not-found doc, status codes).
- The server HTML of the 404 responses is Next's error document (`<html id="__next_error__">`); the not-found UI arrives in the RSC payload and renders on the client. Visible output is correct in the browser; without JavaScript the page is blank.

Verdict: every check PASS except in-app navigation to an unknown path (FAIL, existing parallel-route behaviour; needs a decision: correction or backlog). Task 2.2 not checked off.

# Handoff — add-coffeeshop-directory

## Session 2026-10-07 — artifact update, full apply and task 12.1 verification (cloud)

Branch `claude/add-coffeeshop-directory-apply` from `origin/feature/add-coffeeshop-directory` (`e67debf`) with `origin/develop` (`d264dd2`) merged (`593f5b6`, no conflict).

### Setup
- `npm run build` (exit 0) and `next start -p 3100` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:4010`.
- Local mock API (scratch folder, not in the repo) that answers `GET /coffeeshops`, `/coffeeshops/{ulid}`, `/offerings`, `/taxonomies`, `/coffees` and `/roasteries` with the 200 examples of `contracts/openapi.yaml` (Nomad Coffee with two located locations, Syra Coffee with one). `verified=1` and `orderBy=name&orderDirection=desc` are applied to the example list; an unknown coffee shop gets 404.
- Playwright 1.56 from the scratch folder, Chromium at `/opt/pw-browsers`, CSP not bypassed. Theme through the `theme` cookie (`traditional` / `dark`); `<html data-theme>` confirmed in every run.
- The sandbox cannot reach `tile.openstreetmap.org`: every tile request failed at the network (128 failures, no CSP block), so the maps show the grey background ("Failed tiles").

### Captures (`captures/`)
`{view}-{375,1280}-{traditional,dark}.png` for `directory` (`/es/coffeeshops`), `directory-filtered` (`?verified=1&orderDirection=desc`), `map` (`?view=map`), `map-focus` (`?view=map&focus={Nomad}`), `detail-offerings` (`/es/coffeeshops/{Nomad}`) and `detail-locations` (`?tab=locations`) — 24 files — plus `map-from-card-375-traditional.png` (full-screen map opened from the card, panel open) and `map-marker-focus-1280-traditional.png` (marker focused and opened with Enter).

### Results
| Check | Result | Evidence |
|---|---|---|
| Usual checks | PASS | `npm run test:run` 182 files / 2319 tests, `npm run lint` 0 errors (the existing FlavorWheel warning), `npx tsc --noEmit` exit 0, `npm run build` exit 0 |
| Commit scope | PASS | no commit after the develop merge touches `contracts/openapi.yaml`, `schema.ts`, `AGENTS.md` or `docs/` (before this handoff); `package.json`/`package-lock.json` only in `c5a5fb1` (leaflet 1.9.4, @types/leaflet 1.9.22, exact); `proxy.ts` only in `6cd5e25`; `leaflet` imported only by `src/shared/lib/leaflet/index.ts` |
| One centred column, backdrop in both margins | PASS | cards share one x (375: 16; 1280: 288 on the directory, 96 on the Locations tab without sidebar) in both themes |
| No horizontal scroll | PASS | `scrollWidth` ≤ `clientWidth` in all 24 runs |
| Toolbar at 375 | PASS | Filters, Lista, Mapa on the first row; "Ordenar por" full width on the second |
| Sidebar on the directory and the Ofertas tab only | PASS | visible at 1280 on directory, map and Ofertas; absent on Ubicaciones (no Filters trigger either); closed on arrival at 375 with the trigger shown |
| Ofertas tab scoped to the coffee shop | PASS | every offerings request carried `coffeeshopUlid={Nomad}`; the R12 toolbar and results render in one column |
| Map inline from 1280, full screen at 375 | PASS | 3 markers, zoom buttons and "© OpenStreetMap contributors" visible in both themes; at 375 a dialog titled "Mapa de cafeterías" with "Volver a la lista" and no pagination |
| Focus from a card | PASS | 2 markers `data-selected="true"`, Nomad Coffee Born's panel open with "Ver cafetería" (directory only) |
| Back to the list | PASS | Escape from the toggle's map → `/es/coffeeshops`, focus on the Map item; "Volver a la lista" from the card's map → focus on "Ver Nomad Coffee en el mapa" |
| Marker keyboard | PASS (after fixes) | focused marker named "Nomad Coffee — Nomad Coffee Born"; Enter opens its panel, Escape closes it with the focus kept on the marker |
| No CSP violation | PASS | zero console messages mentioning Content Security Policy in all runs |

### Defects found and fixed (unplanned fixes)
- `3ce5cf4` — markers were added before the map had a view, and Leaflet builds a marker's element only then: no name, no Space/Escape listener, no selected look. The view is now set first.
- `11eff4e` — Leaflet 1.9.4 maps Enter on a marker only to a bound popup, not to a click (design.md D14 assumed a click): Enter did not open the panel. The component handles Enter as it handles Space.
- `34b9a58` — `leaflet.css` sets `.leaflet-marker-icon` to `display: block`, so the pin sat at the marker's top-left; the icon element centres it.

### Notes for review
- `directory-filtered` uses the task's URL `?verified=1&orderDirection=desc`: per design.md D4 a lone `orderDirection` is dropped (the sort pair is `orderBy=name` + `orderDirection`), so the capture shows A–Z. The select writes both keys (unit test "Reverse order").
- At 375 on the Locations tab, the 2rem fit padding lets a marker sit under the zoom buttons (`detail-locations-375-*`). Design.md D14 sets the padding; changing it is a design decision.
- The attribution uses `rounded-field` instead of design.md D14's `rounded-tl-field`, which `radius-guard` forbids.

Verdict: every 12.1 check PASS after the three unplanned fixes.

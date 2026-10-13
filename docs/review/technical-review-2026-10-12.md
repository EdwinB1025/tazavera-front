# Technical review — tazavera-front (ISO/IEC 25010) — 2026-10-12

- **Date:** 2026-10-12
- **Scope:** `app/`, `src/`, `proxy.ts`, configuration, `Dockerfile` and `.dockerignore`, against `contracts/openapi.yaml` (35 operations) and `openspec/specs/*` (14 capabilities), plus the active change R74 `route-api-web-pages-through-front` (`openspec/changes/route-api-web-pages-through-front/`, `docs/design/route-api-web-pages-through-front/`).
- **Revision:** `origin/feature/route-api-web-pages-through-front` `4b44059a` ("product owner: dockfiles prepared for deployment"). It is `develop` (`4425d955`) plus the R74 propose, apply, round 1 and R75 commits and Product owner's `Dockerfile` and `.dockerignore`.
- **Previous review:** [`technical-review-2026-10-09.md`](technical-review-2026-10-09.md) (removed by this commit; it stays in the history), code of `origin/develop` `72b7ec6`. Every section below gives the previous finding and grade next to the new one.
- **History note:** `develop` was rewritten after the previous review. `4425d955` is a root commit that holds the whole tree, so `72b7ec6` is no longer an ancestor of the reviewed head. "Changes in between" is therefore a tree diff `72b7ec6..4425d955`, not a commit log. `72b7ec6` is still fetchable (through `origin/claude/technical-review-2026-10-09`), and every script was re-run on it (Appendix A).
- **Kind:** read-only analysis ordered by Product owner (2026-10-12). No source, test, configuration, `openspec/` or other doc file was changed. Tools ran with `npx -y <tool>@<version>` or from a scratch folder outside the repository.
- **Changes in between:** 12 changes were archived after `72b7ec6`:
  - the 2026-10-09 risk round of the previous review: `move-flavor-wheel-types` (N4), `lazy-load-facet-controls` (N5), `split-oversized-shared-ui`, `split-oversized-screens`, `split-oversized-facets` (N6); plus the unplanned fix of the sidebar "Filters" contrast (N1), the pass-2 scenario coverage (N2) and the `testing` Purpose (N3), which are not OpenSpec changes;
  - R67 `add-manage-locations-menu-entry`, R68 `add-coffee-inventory-explorer`, R69 `fix-offering-card-actions-layout`, R70 `unify-management-eyebrow`, R71 `name-card-actions-by-coffee`, R72 `shorten-coffeeshop-back-label` (all 2026-10-11) and R73 `remember-list-preferences` (2026-10-12);
  - plus the QA cleanup after R69–R72 (3 stale QA files deleted, their exclusions removed).
  - **R74** `route-api-web-pages-through-front` is applied but **not archived** (task 8.1, the browser checks, is open). **R75** is not an OpenSpec change: it is one QA test commit (`7871bd7e`, `qa/proxy.test.ts`, the expected `connect-src` without the API origin), ordered by Product owner in R74's code review.
  - The `Dockerfile` and `.dockerignore` are new (`4b44059a`).
- **Measured vs judged:** every number below comes from a tool run listed in [Appendix A](#appendix-a--method-and-tool-versions), with the same method as the previous review. Statements marked *(judged)* are reviewer opinion from reading the code. Statements marked *(not measured)* could not be checked in this session. Every script was first run on the previous revision (`72b7ec6`) and reproduced the previous figures (differences noted in Appendix A).

---

## 1. Executive summary

The six candidates of the previous review (N1–N6) were all delivered, and it shows:

- **Usability went from D to A.** The "Filters" toggle now takes the sidebar entry's text token (N1), and axe finds **0** WCAG A/AA violations and **0** best-practice findings on 48 runs.
- **Maintainability holds B, with every indicator but one better.** Functions over 80 lines fell from 22 to **0**, the CC ceiling from 27 to **15**, high-complexity LOC from 1.3% to **0%** (Analysability B → A), and the share of function code in units over 60 lines from 29.3% to **17.4%**. Lint warnings fell from 48 to **1**. Modularity stays B: `move-flavor-wheel-types` removed the 11 flavor-wheel cycles, but the split refactors created **7 new type-only cycles** of the same kind.
- **OpenSpec validates 14 / 14** (the `testing` Purpose is filled), and the active R74 change validates `--strict`.
- All 1,190 validation tests and all 1,975 tests of both suites pass; typecheck is clean; lint reports 0 errors; the build succeeds.

R74 makes the front the API's only public door. Its security design is sound where it is specified (CSP `connect-src` is now `'self'` + Nominatim only, the server reads take the internal address, tokens stay in memory), and G1 passed through ngrok (A1, A2). This review **measured four residual exposures** that the grades' indicators do not cover (§1.2):

- every forwarded response carries **`x-middleware-rewrite: http://<API_INTERNAL_URL>/…`**, which discloses the internal API address to any visitor;
- the `/api/` group forwards **every** API path, so the web-route list is not a boundary (`/api/oauth/clients` reaches Passport's management routes);
- the visitor's `X-Forwarded-For` and `Host` reach the API unchanged; this is safe only behind an edge that rewrites them (ngrok does: G1 PASS), and the Docker image listens on `0.0.0.0:3000`;
- the `Dockerfile` runs as root and ships the whole build folder, dev dependencies included.

Grades that did not move:

- **Testability and Functional suitability stay D**, on one indicator only: requirement names found in test text are **67.2%** (was 67.1%). The 9 pass-2 scenarios are now covered (N2), but by test titles that paraphrase; the specs grew by 22 requirements, 8 of them refactor properties that can never match by name. Without the 27 refactor-property requirements, the figure is 74.7% (C).
- **Performance stays C.** cmdk no longer loads on any measured route (N5); the heaviest route (coffee shop detail) fell from 248.8 to **239.5 KB gz**, and the floor is still 208 KB.
- **Suite duration is still A, but at the edge:** 53.4 s against the 60 s limit (34.2 s in the previous session, another machine). `EvaluationForm.test.tsx` alone takes 32.3 s, and it failed once intermittently on 2026-10-11 (board, row 0c).

### Scorecard

Each characteristic's grade is the worst grade among its indicators, with the same thresholds as before ([Appendix C](#appendix-c--grading-thresholds)).

| ISO/IEC 25010 characteristic | Previous | **Now** | Indicators now (previous → now) | Key evidence now |
|---|:-:|:-:|---|---|
| **Maintainability** | B | **B** | Modularity B → **B** · Reusability A → **A** · Analysability B → **A** · Modifiability B → **B** | 0 same-layer imports in production; 7 cycles, all type-only, each between two files of one segment (was 11); jscpd 0.79% (was 0.84%); CC risk by LOC 7.8% moderate, 0% high (was 12.8% / 1.3%); 2 files > 300 lines (unchanged); 17.4% of function LOC in units > 60 lines (was 29.3%); 0 functions > 80 lines (was 22) |
| **Testability** | D | **D** | Pass rate A → **A** · Suite duration A → **A** · Requirement traceability D → **D** | 1,190 / 1,190 validation and 1,975 / 1,975 combined; 53.4 s (was 34.2 s); 180 / 268 requirement names found in test text (67.2%, was 67.1%) |
| **Functional suitability** | D | **D** | Contract coverage A → **A** · Spec traceability D → **D** | 32 of the 32 in-scope operations (31 requests + 1 navigation); the contract is unchanged; the same 67.2% traceability |
| **Security** | A | **A** | Dependencies A → **A** · Headers A → **A** · Credential handling A → **A** · Injection A → **A** | `npm audit --omit=dev`: 0; full audit: 5 high, dev-only; every front document keeps the nonce CSP and the four headers, `connect-src` narrowed to `'self'` + Nominatim; tokens in module memory only; no HTML sinks. **Not graded by any indicator:** the R74 and Docker findings of §1.2 |
| **Usability (accessibility)** | D | **A** | WCAG A/AA (axe) D → **A** · Best practice A → **A** · Guards A → **A** | 0 A/AA violations on 48 runs (was 1 serious rule in 4 runs); 0 best-practice findings; 0 jsx-a11y warnings |
| **Performance efficiency** | C | **C** | JS per route C → **C** · Request efficiency A → **A** *(judged)* | 207.9–239.5 KB gz per route (was 206.7–248.8); cmdk on no measured route; `/coffees` read once for 48 runs |

Not graded, because the brief does not ask for them: Reliability, Compatibility, Portability.

### Previous → Now

| Characteristic | Previous (2026-10-09) | Now (2026-10-12) | Moved by |
|---|:-:|:-:|---|
| Maintainability | B | **B** = | Analysability ▲ and Modifiability (a) ▲ `split-oversized-shared-ui`, `split-oversized-screens`, `split-oversized-facets`; Modularity: flavor-wheel cycles ▲ `move-flavor-wheel-types`, new type cycles ▼ the three splits |
| Testability | D | **D** = | traceability flat: 9 scenarios covered (N2, `claude/cover-pass2-scenarios`) but by paraphrased titles; +8 refactor-property requirements; duration still A, closer to the limit |
| Functional suitability | D | **D** = | traceability, as above; contract coverage holds (R68 consumes `listCoffeeInventory` again for the inventory explorer) |
| Security | A | **A** = | headers: `connect-src` narrowed by R74; credentials unchanged (R73 keeps only list preferences in `sessionStorage`); new residual risks of R74 and the `Dockerfile` (§1.2) |
| Usability | D | **A** ▲ | contrast ▲ unplanned fix `fix(app-shell): give the sidebar filters toggle the sidebar entry text colour` (N1) |
| Performance efficiency | C | **C** = | coffee shop detail ▲ `lazy-load-facet-controls` (248.8 → 239.5 KB gz); floor unchanged |

### Top remaining risks

1. **R74: the internal API address is disclosed on every forwarded response** (Security, not graded).
   - **Where:** `src/shared/api/forwarding.ts:96` (`NextResponse.rewrite` to `API_INTERNAL_URL`). Next.js answers the forwarded request with `x-middleware-rewrite: http://127.0.0.1:8000/<path>` (measured on `next start`; G1 saw the same header through ngrok, `X-Middleware-Rewrite: http://127.0.0.1:8000/favicon.svg`). In Docker it would name the compose address of the API.
   - **Recommendation:** a **Change** (auth "One public entry point": a forwarded response "served as the API sends it" should not gain a header that names the internal address). Effort S–M; it needs a check of how Next 16 lets a proxy drop that header, or the edge strips it.
2. **R74: the `/api/` group forwards every API path, and visitor-sent forwarding headers reach the API** (Security, not graded).
   - `/api/<anything>` is forwarded with the prefix removed (spec, by design), so `/api/oauth/clients`, `/api/oauth/authorize` or any route the API registers reach it; the web list of D1 restricts nothing on its own. Measured: `GET /api/oauth/clients` → `GET /oauth/clients` on the API.
   - The visitor's `X-Forwarded-For` is kept (spec) and Next.js does not append the peer address when one is present; `X-Forwarded-Host` is the incoming `Host` (design.md Risks). Measured: `X-Forwarded-For: 203.0.113.7` arrived unchanged; `Host: evil.example` arrived as `X-Forwarded-Host: evil.example`. Behind ngrok both are rewritten (G1 A1, A2 PASS). The `Dockerfile` serves `0.0.0.0:3000`, so a deployment that publishes that port directly would let a visitor bypass the sign-in limit and poison URLs the API builds from the host *(judged: e.g. password-reset links)*.
   - **Recommendation:** a **Change** (auth): forward under `/api` only the contract's paths and `/oauth/token`; set `X-Forwarded-For` from the connection and the forwarded host from `NEXT_PUBLIC_APP_URL` in the proxy. It reverses Product owner's Q8 decision and touches security: Product owner decides. Until then, a deploy note: never publish port 3000 without an edge that rewrites both headers.
3. **The `Dockerfile` ships a root, full-tree image** (Security / deployment, not graded).
   - `node:22-alpine` without a digest; no `USER`; the run stage copies all of `/app` (sources, validation tests, docs, OpenSpec, dev dependencies with the 5 dev-only advisories); `npx` as PID 1; no `HEALTHCHECK`; `API_INTERNAL_URL` is required at run time but not declared.
   - **Recommendation:** a deployment **Change** with Product owner (his file): `output: "standalone"` in `next.config.ts`, a run stage with `.next/standalone`, `.next/static` and `public` only, `USER node`, `node server.js`, a pinned base image, `ENV NEXT_TELEMETRY_DISABLED=1`, and `API_INTERNAL_URL` documented. Effort S.
4. **Spec traceability by name is 67.2%** (Testability, Functional suitability D).
   - The 9 pass-2 scenarios are covered, so the measure, not the coverage, holds the grade: titles paraphrase, and 27 refactor-property requirements can never match.
   - **Recommendation:** the second half of the previous N2: Product owner accepts a scenario → test map as the measured indicator, with refactor properties recorded as "verified by lint / build". Without the 27, the figure is 180 / 241 = 74.7% (C).
5. **First-load JS is 208–240 KB gz on every route** (Performance C).
   - React DOM (64 KB gz), a 43 KB framework chunk, a 19 KB chunk and the header's Radix chunk (16.5 KB gz) are on every route; the About page alone is 208.0 KB gz.
   - **Recommendation:** a measured **Change** that traces what the app shell and `next-intl` put on every route, target ≤ 170 KB gz. Effort M.
6. **The validation suite is 6.6 s under the A limit and one file dominates it** (Testability).
   - `EvaluationForm.test.tsx` takes 32.3 s for 45 tests (the slowest case 2.7 s), more than half the wall time, and it failed intermittently once on 2026-10-11.
   - **Recommendation:** a **Refactor (fast lane)** that splits the file so both pools run its parts in parallel, assertions unchanged; investigate the intermittent failure first.
7. **7 type-only cycles came back** (Modularity B).
   - **Where:** `split-oversized-shared-ui` and `split-oversized-facets` moved parts into new files that `import type` back from the parent: `RadioOptionRow` ↔ `RadioGroup`, `LocationsMapPanel` and `locations-map-view` ↔ `LocationsMap`, `DescriptorChipRows` ↔ `DescriptorChipGroup`, `use-combobox-input` ↔ `Combobox`, `OfferingFacetParts` ↔ `OfferingFacets`, `EvaluationFacetParts` ↔ `EvaluationFacets`.
   - **Recommendation:** a **Refactor (fast lane)** like `move-flavor-wheel-types`: each family's shared types move into a `*-types.ts`. Effort S. It takes Modularity to A.
8. **Open backlog:** R1 (E2E locale switch, waits for R74 in `develop`); R45 (first location at coffee-shop registration, API first, deferred). R74 itself waits for the browser checks (task 8.1) and a working test account.

---

### 1.1 Functional suitability — contract operations

**Previous:** 32 of the 32 in-scope operations (31 requests + 1 navigation); 3 out of scope. Grade **A**.

**Now:**

- The contract did not change (`git diff 72b7ec6 HEAD -- contracts src/shared/api/schema.ts` is empty): 35 operations.
- 31 operations are called through the request clients and 1 is consumed as a navigation. Grade **A** (32 / 32 in scope).
- **R74** moves no call site to a new operation. It changes where each call goes: the browser sends every request to `{NEXT_PUBLIC_API_URL}` = `{NEXT_PUBLIC_APP_URL}/api`, and the front forwards it; the server-side reads go to `API_INTERNAL_URL` (`src/shared/api/client.ts:134–139`).
- The two email-verification operations that were out of scope (`markTheAuthenticatedUsersEmailAddressAsVerified`, `sendANewEmailVerificationNotification`) are now in R74's forwarded web list (`forwarding.ts:20–21` and the `/email/verify/{id}/{hash}` pattern): the link in the email opens on the front's origin, which forwards it to the API (R74 handoff, Q5). They stay "not consumed" by the front's code.

| Operation | Consumed in (now) |
|---|---|
| `listOfferings`, `getAnOffering` | `src/widgets/offering-list/api/offerings.ts:60`, `src/entities/offering/api/offering.ts:18` |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings` | `src/features/offering-management/api/management.ts:82,74,140` |
| `listCoffeeInventory` | `management.ts:111`, now also the inventory explorer of R68 (`add-coffee-inventory-explorer`); the explorer's detail is built from the list (the contract has no read by identifier) |
| `listCoffees`, `listRoasteries`, `listOlfactoryTaxonomies` | `src/shared/api/coffees.ts:26` and `src/features/offering-facets/api/search-coffees.ts:22`; `search-roasteries.ts:10`; `src/entities/taxonomy/api/taxonomies.ts:19` |
| `listCoffeeShops`, `getACoffeeShop` | `src/widgets/coffeeshop-list/api/coffeeshops.ts:25`, `src/entities/coffeeshop/api/coffeeshop.ts:17` |
| `listEvaluations`, `getAnEvaluation` | `src/entities/evaluation/api/public-evaluations.ts:54,72` |
| `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `src/entities/evaluation/api/user-evaluations.ts:88–124` |
| `listMyLocations`, `listAUsersLocations`, `createALocation` | `management.ts:159`, `src/features/location-management/api/locations.ts:15,45` |
| `getTheAuthenticatedUser`, `logOut` | `src/features/auth/model/session.ts:103,147,216`, `src/features/auth/api/identity.ts:41,52` |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `src/features/user-account/api/register.ts:23`, `account.ts:39,54,66,74` |
| `listMyContacts`, `createMyPrimaryContact` | `src/features/user-account/api/contacts.ts:10,20` |
| `displayTheEmailVerificationPrompt` | navigation link, `src/pages/account/ui/SecuritySection.tsx:57`, now built by `apiWebPageUrl("/email/verify")` on the front's origin (R74) |
| **`listTheEvaluationsOfAUser`** | **not consumed**: out of scope (Product owner, 6 Oct) — unchanged |
| **`markTheAuthenticatedUsersEmailAddressAsVerified`**, **`sendANewEmailVerificationNotification`** | **not consumed** by the front's code *(judged: out of scope)*; reached through the front by R74's forwarding |

No call targets a path the contract does not declare. Every API URL is built by the shared clients or by `apiWebPageUrl` (`src/shared/api/web-pages.ts`), which replaced the 5 hand-built links to the API's web pages (R74 D4). `NEXT_PUBLIC_API_URL` is read in two places only: `client.ts:138` and the token endpoint, `src/shared/api/tokens.ts:168`. **Previous:** the API-hosted pages and the CSP origin also read it; R74 removed both.

### 1.2 Security details

**Previous:** dependencies **A**, headers **A**, credentials **A**, injection **A**.

**Now: dependencies A, headers A, credentials A, injection A.** The indicators of Appendix C do not cover a reverse proxy or a container image; the R74 and Docker findings below are reported in full but grade nothing.

- **`npm audit --omit=dev`:** **0** vulnerabilities (unchanged). `next` stays on `16.4.0`.
- **Full `npm audit`:** **5 high, 0 critical** (unchanged). The same dev-only chain: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` (GHSA-vfj7-8cjw-p6xm). New consequence: the `Dockerfile` copies the dev dependencies into the run image (below).
- **Headers on the front's documents** (checked with `curl -D` on `next start`):
  - `/en`: the nonce CSP with `'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'`; COOP `same-origin-allow-popups`; `nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` with `geolocation=(self)` only; no `X-Powered-By`. Unchanged.
  - `/callback`: the CSP, `nosniff`, `Referrer-Policy` and `Permissions-Policy`, no COOP. Unchanged.
  - **`connect-src` is now `'self' https://nominatim.openstreetmap.org`** (`proxy.ts:96`; R74 `a5e8a4f4`). The API origin left the policy because the browser reaches the API only on the front's origin: the policy is narrower than before.
  - Unchanged and still documented: `style-src 'unsafe-inline'` for Radix; `Strict-Transport-Security` belongs to the hosting layer *(not measured)*.
- **R74 — forwarded path list** (`src/shared/api/forwarding.ts`):
  - Two groups, checked before every other proxy branch (`proxy.ts:72`): every path under `/api/`, with the prefix removed (`apiPathFor`, `:57–65`), and 22 exact web paths plus 6 patterns (`/reset-password/{token}`, `/email/verify/{id}/{hash}`, `/user/passkeys/{id}`, `/build/`, `/flux/`, `/livewire-<hex>/`).
  - The web list matches the spec delta (auth "One public entry point") and, per R74's code review, every route the API's own pages use.
  - **Finding (measured):** the `/api/` group forwards any path, so the web list does not limit what reaches the API. `GET /api/oauth/clients` was forwarded as `GET /oauth/clients`. Any route the API registers (Passport's management routes, the web `/register`, framework routes) is reachable at `/api/<path>`. *(judged)* Not new exposure compared with an API on its own public address, but option A makes the front the only door, and this door has no list.
  - `%2e%2e` in the path is normalised by Next.js before the proxy (a `307`), so the prefix cannot be escaped (measured).
- **R74 — `proxy.ts`:**
  - Forwarded responses carry none of the front's headers (spec, D6): the API's pages are served with the API's own headers. *(judged)* Under D10 the API's pages now share the front's origin, storage and opener; a script injected in one of them would run with the front's origin. D10 records this as accepted; the backlog candidate in design.md Risks (a CSP and `frame-ancestors` on the API's pages) is the mitigation, on the API side.
  - **Finding (measured):** every forwarded response carries **`x-middleware-rewrite: http://127.0.0.1:8000/<path>`** — the value of `API_INTERNAL_URL`. Seen on `/api/taxonomies` and `/login` locally, and on `/favicon.svg` through ngrok in G1. It discloses the internal address and port to every visitor.
  - An unset `API_INTERNAL_URL` answers `502` with an empty body (`forwarding.ts:92–95`); an unset `NEXT_PUBLIC_APP_URL` throws in `forwardedHeaders` (`:72`), which R74's code review accepted as a deployment matter (finding B).
- **R74 — CSP `connect-src`:** as above; `'self'` covers the JSON calls and `POST /api/oauth/token`, because both are same-origin now.
- **R74 — internal vs public API base:**
  - Server-side reads (no `window`) use the server-only `API_INTERNAL_URL`; browser calls use `NEXT_PUBLIC_API_URL` (`client.ts:134–139`); neither falls back to the other (D5).
  - Measured: the build ran without `API_INTERNAL_URL`, and `next start` with `API_INTERNAL_URL=http://127.0.0.1:8000` sent the landing's server read to that address. The value is read at run time, as the Docker image needs.
  - The token endpoint stays on `NEXT_PUBLIC_API_URL` (`tokens.ts:168`), the front's origin. A production build still refuses a non-`https` token endpoint, so a production front signs in only when it is served over `https` (R74 handoff Q6, deployment matter).
  - `API_PREFIX` is exported from `src/shared/api/index.ts:32` but imported nowhere (knip), against content-structure "Public indexes export only what is imported"; the prefix is also repeated in the value of `NEXT_PUBLIC_API_URL`.
- **R74 — visitor IP and host:**
  - The spec keeps the client's `X-Forwarded-For` and sets `X-Forwarded-Host/Proto/Port` from `NEXT_PUBLIC_APP_URL` (`forwarding.ts:71–79`).
  - Measured on `next start` (mock API log): a visitor-sent `X-Forwarded-For: 203.0.113.7` reached the API unchanged, without the peer address; without that header Next.js sent the peer (`127.0.0.1`). A visitor-sent `Host: evil.example` reached the API as `X-Forwarded-Host: evil.example`: Next.js overwrites the proxy's value with the incoming `Host` (design.md Risks, verified in source).
  - **G1 (`origin/develop:docs/design/route-api-web-pages-through-front/handoff.md`, 2026-10-12): A1 PASS, A2 PASS through ngrok.** The 6th wrong password answered `429`, and `X-Forwarded-For: 203.0.113.7` and `.8` were both still `429`: ngrok appends the real address, and the API trusts only the front. A3 was inconclusive (the test account no longer accepts its password; not an R74 defect).
  - *(judged)* The result holds for ngrok only. A deployment that exposes the front without an edge that rewrites `X-Forwarded-For` and `Host` would let a visitor bypass the 5-per-minute sign-in limit and set the host the API trusts.
- **`Dockerfile` and `.dockerignore`** (`4b44059a`):
  - **Base image:** `node:22-alpine` in all three stages, a floating tag without a digest. *(judged)* Builds are not reproducible, and the minor Node version drifts (this session's Node 22.22.0 is already below jsdom's 22.22.2).
  - **Build stages:** `deps` (`npm ci`, dev dependencies included, needed by the build), `build` (`COPY . .`, `npm run build` with `NODE_ENV=production`), `run` (`COPY --from=build /app ./`). The run stage takes the whole build folder: `node_modules` with dev dependencies (and their 5 high advisories), sources, the validation tests, `docs/`, `openspec/`, `contracts/`. Next's `output: "standalone"` is not set (`next.config.ts`).
  - **User:** none set, so the server runs as **root**.
  - **Secrets:** none baked. The build arguments are the three `NEXT_PUBLIC_*` values, all public by design (the OAuth client is a PKCE public client). `.dockerignore` excludes `.env*`, `.git`, `.next`, `node_modules`, `coverage` and `qa`. The image is per environment, because the `NEXT_PUBLIC_*` values are inlined at build.
  - **Ports and command:** `EXPOSE 3000`; `CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]`. *(judged)* `npx` as PID 1 adds a process between the signal and the server, and there is no `HEALTHCHECK`.
  - **Env:** `NODE_ENV=production`. `API_INTERNAL_URL` is required at run time (D5) but not declared or documented in the image; without it every forwarded path answers `502` and server reads fail. `NEXT_TELEMETRY_DISABLED` is not set (the build printed the telemetry notice).
- **Credentials:** unchanged.
  - The grant lives in module memory (`src/shared/api/tokens.ts`); `sessionStorage` holds only a full-page flow's record (`src/features/auth/model/flow.ts:49–67`); `localStorage` holds the credential-free marker (`flow.ts:72–82`).
  - R73 adds `src/shared/lib/tab-storage.ts`, which keeps the editing lists' filters and order in `sessionStorage` and clears them on sign-out or change of user (filtering "Remembered filters forgotten with the session"). No credential.
  - *(judged)* Under D10 the flow record in `sessionStorage` is readable by the API's pages, which now share the origin.
- **Injection:** still no `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function` in `src/`, `app/` or `proxy.ts`. `xss-guard.test.ts` still guards it.

### 1.3 Usability and accessibility details

**Previous:** 1 serious A/AA rule (`color-contrast`, the sidebar "Filters" toggle at 1.06:1) in 4 of 48 runs; 0 best-practice findings; 0 jsx-a11y warnings. Grade **D**.

**Now:** axe-core 4.11.0, the same tags, the same mock method and the same 12 screens × {traditional, dark} × {1280, 375} = **48 runs**. The inventory screens of R68 are signed-in, so they are not audited (as every signed-in screen).

| Screen | Path | A/AA violations | Best-practice findings | Previous |
|---|---|:-:|---|---|
| Landing | `/en` | 0 | — | 0 |
| Catalog | `/en/offerings` | 0 | — | **1** (`color-contrast`) |
| Offering detail | `/en/offerings/{ulid}` | 0 | — | 0 |
| Public evaluation view | `/en/evaluations/{ulid}` | 0 | — | 0 |
| Public evaluations list | `/en/evaluations` | 0 | — | **1** (same) |
| Register | `/en/register` | 0 | — | 0 |
| Coffee shop directory | `/en/coffeeshops` | 0 | — | **1** (same) |
| Coffee shop detail | `/en/coffeeshops/{ulid}` | 0 | — | **1** (same) |
| Evaluation form, signed out (gated) | `/en/manage/evaluations/new?offering=…` | 0 | — | 0 |
| Coffee shop registration | `/en/register/coffeeshop` | 0 | — | 0 |
| About | `/en/about` | 0 | — | 0 |
| Unknown route, 404 | `/en/does-not-exist` | 0 | — | 0 |

Notes:

- **The contrast failure is fixed.** `SidebarMenuSub.tsx:21–28` gives the toggle `text-nav-text-dark` at rest and points `--color-text-accent` at the same token (6.41:1 traditional, 13.69:1 dark, by the board's record of the fix). theming "Text and button contrast" is now matched by name in a test (B.4).
- **The guards** still check written classes only. The fix makes the colour written, not inherited, so `color-guard` now sees it; an inherited colour would still pass the guards *(judged)*.
- **Lint:** 0 jsx-a11y warnings.
- **Signed-in screens:** still not audited. They need the OAuth popup, and the mock has no authorization server *(not measured)*. R74 does not change that.

**Guards (all passing):** `color-guard`, `radius-guard`, `focus-guard`, `badge-geometry-guard`, `xss-guard`, `client-boundary` (×2), `icons`, `catalog-guard`, `leaflet-guard`, `session-types-guard` and the `theme-tokens` contrast matrix — the same set. The AGENTS.md size, complexity and import rules are reported by lint: **0** production warnings now (was 29).

**Spec traceability** (Testability and Functional suitability). Same script: requirement and scenario titles of `openspec/specs/*` matched against the text of the test files (case-insensitive substring). R74's delta is not in the main specs yet, so it is not counted.

| | Previous | Now (validation suite, 209 files) | Now (validation + QA, 364 files) |
|---|--:|--:|--:|
| Requirement names found | 165 / 246 (67.1%) | **180 / 268 (67.2%)** | 181 / 268 (67.5%) |
| Scenario titles found | 559 / 1,077 (51.9%) | **609 / 1,137 (53.6%)** | 616 / 1,137 (54.2%) |

The figure did not move, for two reasons:

- **The specs grew by 22 requirements and 60 scenarios.** The 14 behaviour requirements (inventory pages and facets, remembered filters, lazy facet comboboxes) are all found. The 8 refactor properties ("… kept within the size limits" × 7, "Flavor wheel types shared without import cycles") are not, and cannot be: a refactor change adds no test. With the previous review's ones, **27 refactor-property requirements** are marked ◆ in B.4. Without them, the figure is 180 / 241 = **74.7%** (C).
- **The pass-2 scenarios** (`docs/testing/test-reduction-result.md`) are covered since 2026-10-09 (`claude/cover-pass2-scenarios`, 9 test files), but their `it()` titles paraphrase the scenarios. A scenario → test map would measure them; name matching does not.

The unmatched requirement names are listed in Appendix B.4.

### 1.4 Performance details

**Previous:** 206.7–248.8 KB gz on 12 routes; cmdk/Radix chunks on the catalog and coffee shop routes; reference reads cached for one hour. Grade **C** (JS) / **A** (requests, judged).

**Now:** the same method. Scripts are summed until network idle in a fresh browser context (traditional theme, 1280 px), and gzip uses Node `zlib` at level 6. The build was made with R74's values (`NEXT_PUBLIC_API_URL=http://localhost:3000/api`), and the browser's requests went through the front's forwarding.

| Route | Scripts | Raw JS | Gzip JS | Previous gzip |
|---|:-:|--:|--:|--:|
| `/en` (landing) | 15 | 675 KB | 214.6 KB | 213.4 KB |
| `/en/offerings` | 18 | 706 KB | 224.8 KB | 227.9 KB |
| `/en/offerings/{ulid}` | 16 | 694 KB | 220.3 KB | 218.8 KB |
| `/en/evaluations/{ulid}` | 16 | 680 KB | 215.9 KB | 214.4 KB |
| `/en/evaluations` | 17 | 693 KB | 220.8 KB | 219.8 KB |
| `/en/register` | 16 | 669 KB | 212.0 KB | 210.7 KB |
| `/en/coffeeshops` | 18 | 693 KB | 220.5 KB | 219.7 KB |
| `/en/coffeeshops/{ulid}` | 18 | 751 KB | **239.5 KB** | 248.8 KB |
| `/en/manage/evaluations/new` (signed out) | 16 | 708 KB | 223.5 KB | 222.0 KB |
| `/en/register/coffeeshop` | 16 | 669 KB | 212.0 KB | 210.7 KB |
| `/en/about` | 15 | 657 KB | 208.0 KB | 206.8 KB |
| unknown route (404) | 15 | 657 KB | 207.9 KB | 206.7 KB |

Findings:

- **cmdk loads on no measured route** (`lazy-load-facet-controls`). Its chunks (`3ca0lyw4j35ro.js` 7.5 KB gz, `1wxbdhzctqosv.js` 12.0 KB gz) load only when a facet panel is first opened (filtering "Facet comboboxes loaded on first opening").
- **The coffee shop detail fell by 9.3 KB gz** and is now 10.5 KB under the D limit. It still loads 2 scripts more than the landing *(judged: the tabbed detail and the facet shells; not traced chunk by chunk)*.
- **The floor is unchanged.** About loads 208.0 KB gz: React DOM (`2nii411saqstq.js`, 63.8 KB gz), the framework chunk (`1zu2osino5zci.js`, 42.9 KB gz), a 19.4 KB gz chunk and the header's Radix chunk (`3w1_3fxz0bzu1.js`, 16.5 KB gz). Every route grew by 1–1.5 KB gz *(judged: R67–R73's shell additions — the management menu entries and the list-preference scope)*.
- **Leaflet** (`3rcb7zdltz07z.js`, 149 KB raw / 43.6 KB gz) still loads only on the map view.
- **R74 adds one hop** to every browser request (browser → front → API), and the front buffers request bodies (10 MB) with a 30 s proxy timeout (design.md Risks) *(not measured: latency)*.
- **Server requests** (mock API log, 72 requests over 48 runs):
  - The offering detail asks for `/offerings/{ulid}` and `/taxonomies`; `/evaluations` does not load on its default tab (unchanged).
  - `/taxonomies` was requested 21 times: the **fresh** read of `refresh-stale-taxonomies`, because the mock's offering example references taxonomy ids its taxonomy example lacks (unchanged mock deviation).
  - `/coffees` was read **once** for all 48 runs: the one-hour cache works.
  - Server-side reads reached the mock directly on `API_INTERNAL_URL`, without forwarding headers (they do not pass through the proxy).

---

## 2. Maintainability in depth

### 2.1 Size and layering (measured)

`.ts`/`.tsx` files, non-test, without the generated `schema.ts`. The same script gives 413 files and 29,413 lines on `72b7ec6`, the previous figures.

| Layer | Slices | Files (non-test) | LOC (non-test) | Previous files / LOC |
|---|:-:|:-:|--:|--:|
| `app` (Next routing, root) + `proxy.ts` | — | 40 | 582 | 36 / 535 |
| `src/app` | 2 + `fonts.ts` | 7 | 373 | 6 / 340 |
| `src/pages` | 21 | 107 | 7,226 | 95 / 6,419 |
| `src/widgets` | 10 | 78 | 5,536 | 77 / 5,287 |
| `src/features` | 10 | 88 | 6,984 | 74 / 6,206 |
| `src/entities` | 7 | 38 | 1,998 | 34 / 1,801 |
| `src/shared` (without `schema.ts`) | 4 segments | 108 | 9,698 | 91 / 8,825 |
| **Total** | | **466** | **32,397** | 413 / 29,413 |

Tests:

- **Validation suite:** 209 files, 29,738 lines (was 198 files, 28,143 lines).
- **QA suite:** 155 files under `qa/`, 17,506 lines; all of them run (was 158, 3 excluded). The QA cleanup after R69–R72 deleted the 3 stale files and their exclusions.

The code grew by 10% (+2,984 lines). New slices: `entities/coffee-inventory`, `features/inventory-facets`, `pages/inventory-detail` and `pages/manage-inventory` (R68). The rest is the splits (more, smaller files: `shared/ui` +17 files) and R74's two small modules (`forwarding.ts` 99 lines, `web-pages.ts` 8).

### 2.2 SOLID applied to React + FSD

**S — single responsibility**

- **Previous:** good, with units over 80 lines that mix concerns still open (`Combobox` 183 lines / CC 27, `LocationsMap` 147, `EvaluationSheet` 141, `OfferingFacets` 136).
- **Now:** good, and the open units are split.
  - `Combobox.tsx` is 71 lines / CC 12; its input logic moved to `use-combobox-input.ts` and its popup to `ComboboxPopup.tsx` (`split-oversized-shared-ui`).
  - `LocationsMap` is 75 lines, with `LocationsMapPanel.tsx` and `locations-map-view.tsx`; `EvaluationSheet` moved its cards to `EvaluationSheetCards.tsx`; `OfferingFacets` (70 lines) to `OfferingFacetParts.tsx`; the account forms' state to `use-password-form.ts`, `use-profile-form.ts` and `use-register-form.ts`.
  - R74's `forwarding.ts` keeps one concern (the forwarded surface) with data plus two functions, each well under the limits (design.md D11).
- **Still open:** many units sit just under the limit. 40 functions are between 61 and 78 lines (B.2); 11 of them are 75–78.

**O — open for extension**

- **Previous:** good (one component per row variant).
- **Now:** good. R68's inventory card and detail reuse the offering-card and detail parts through props, without boolean-switched trees *(judged)*. R74's forwarded list is data (`WEB_PATHS`, `WEB_PATTERNS`), so adding a route is one entry (round 1 added `/favicon.svg` that way).

**L — variants honour the same contract**

- **Previous:** good.
- **Now:** good. `RadioOptionRow`, `DescriptorChipRows` and `BeanScaleBeans` take their parent's option types, so the parents keep one contract per control.

**I — minimal props**

- **Previous:** 208 types, mean 4.0; 14 with 8 or more; 1 with 12 or more (`RadioGroupProps`, 13).
- **Now:** **237** types, mean **3.92**; **15** with 8 or more (`RadioOptionRowProps`, 10, is new); 1 with 12 or more (`RadioGroupProps`, 13, unchanged). The same regex scan gives 211 types on `72b7ec6`, so the scan counts about 3 more than the previous review reported.
- `formTextsFrom` (96 lines) and `evaluationSheetTexts` (67) are still long text mappings.

**D — depend on injected actions and data**

- **Previous:** good; 0 same-layer imports in production; 4 test files coupled to another slice.
- **Now:** unchanged: 0 in production, the same 4 test files (§2.3).
- R74: `proxy.ts` takes `forwardToApi` from `@/shared/api`; the routing file sits above every layer, so the import is allowed. The account and header components take `apiWebPageUrl` from the same index instead of reading the environment.

### 2.3 Coherence

| Aspect | Previous | Now | Evidence / change |
|---|---|---|---|
| FSD layering | 0 in production, 0 upward, 0 public-API bypasses; 4 in tests | **Unchanged** | the same 4 test files: `src/features/offering-management/model/delete-flow.test.ts`, `ui/DeleteOfferingsDialog.test.tsx`, `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.test.tsx`, `PublicEvaluationList.test.tsx`. Lint reports no `no-restricted-imports` |
| Cycles (dependency-cruiser 16.10.4) | 11, all type-only, all inside `shared/ui`'s flavor wheel | **7, all type-only, each between two files of one segment** (5 in `shared/ui`, 1 in `features/offering-facets/ui`, 1 in `features/evaluation-facets/ui`) | `move-flavor-wheel-types` removed the 11. The splits made 7 new ones: the new part file `import type`s back from its parent (e.g. `RadioOptionRow.tsx:9`, `use-combobox-input.ts:17`, `OfferingFacetParts.tsx:20`). Not a spec breach (content-structure forbids only paths through the public index); the same pattern N4 fixed |
| Data loading | Matches the decisions log | Unchanged; server reads now on `API_INTERNAL_URL` (R74 D5) | `client.ts:134–139` |
| API access | One seam | **One seam**, two bases: `request` / `publicRequest` / `requestWithToken` (`src/shared/api/client.ts`) choose the base by environment; the API's web pages go through `apiWebPageUrl` | R74 |
| Error handling | 1 result style (`ApiResult<T, K>`) | Unchanged; the forwarding answers `502` only for an unset `API_INTERNAL_URL`; an unreachable API answers Next's `500` (design.md Risks) | — |
| Texts | Coherent | Coherent: catalogs es/en/ca, `react/jsx-no-literals`, `catalog-guard` | — |
| Tokens | Coherent in written classes; one inherited colour failed contrast | **Coherent**; the toggle's colour is written | N1 |
| Naming | Coherent | Coherent; one exported name unused (`API_PREFIX`, knip) | R74 |
| Locale derivation | One derivation | Unchanged | — |
| Routing / i18n | next-intl routing | Unchanged; the proxy now forwards before the locale routing (`proxy.ts:69–75`) | R74 D2 |
| Browser storage | Flow record and marker only | Plus the editing lists' preferences, behind one failure-safe module (`src/shared/lib/tab-storage.ts`) and one scope component (`FilterMemoryScope`, `RememberedFiltersGate`) | R73 |

### 2.4 Oversizing

**Files over 300 lines:** **2** (unchanged), by raw line count.

- `src/features/auth/api/authorize.ts`: 347 lines (was 351). R74 replaced its private `apiUrl()` with `apiWebPageUrl`.
- `src/shared/ui/Sidebar.tsx`: 342 lines (unchanged), shadcn primitives.

Lint counts non-blank, non-comment lines, and by that count both files are under 300 (0 `max-lines` warnings).

**Top 15 files by lines** (non-test, without `schema.ts` and `globals.css`):

| # | File | Lines | Largest function (LOC / CC) | Previous rank |
|--:|---|--:|---|---|
| 1 | `src/features/auth/api/authorize.ts` | 347 | `completeCallback` CC 14 | 1 (351) |
| 2 | `src/shared/ui/Sidebar.tsx` | 342 | shadcn primitives, all small | 2 (342) |
| 3 | `src/widgets/evaluation-sheet/ui/EvaluationSheetCards.tsx` | 292 | cards, each < 60 lines | new (from `EvaluationSheet.tsx`, 295) |
| 4 | `src/shared/ui/DropdownMenu.tsx` | 267 | shadcn primitives | 6 (267) |
| 5 | `src/shared/ui/flavor-wheel-geometry.ts` | 261 | pure geometry | 7 (261) |
| 6 | `src/features/auth/model/session.ts` | 249 | `refreshProfile` CC 11 | 9 (249) |
| 7 | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx` | 249 | `headerLines` CC 13 | — |
| 8 | `src/features/location-management/ui/LocationForm.tsx` | 242 | `LocationForm` 75 / 3 | 13 (225) |
| 9 | `src/shared/ui/Pagination.tsx` | 236 | `Pagination` 66 / — | 11 (236) |
| 10 | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx` | 229 | `detailTexts` 71 / 1 | — (215) |
| 11 | `src/shared/api/index.ts` | 222 | public index | — (212) |
| 12 | `src/shared/ui/Button.tsx` | 222 | `Button` CC 15 | 14 (222) |
| 13 | `src/shared/api/tokens.ts` | 220 | small | — (220) |
| 14 | `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx` | 219 | `CoffeeshopsMapView` < 60 | — |
| 15 | `src/shared/ui/Collapsible.tsx` | 218 | small | — (218) |

The previous rows 4, 5, 8, 10, 12 and 15 (`Combobox` 289, `LocationsMap` 267, `DescriptorChipGroup` 255, `BeanScale` 239, `RegisterForm` 230, `EvaluationsList` 222) are all under 200 lines now.

**Cyclomatic complexity** (ESLint `complexity`, ad hoc `--rule`):

- **Now:** 1,480 functions, mean **2.40**, max **15**.
- **Previous:** 1,316 functions, mean 2.50, max 27.

| CC band | Functions (prev → now) | Share of outermost-unit LOC (prev → now) |
|---|--:|--:|
| 1–10 (low) | 1,264 → **1,430** | 85.9% → **92.2%** |
| 11–20 (moderate) | 39 → **34** | 12.8% → **7.8%** |
| 21–50 (high) | 1 → **0** | 1.3% → **0%** |
| > 50 (very high) | 0 → 0 | 0% → 0% |

The previous review reported 1,276 functions in the low band; the pairing script gives 1,264 on `72b7ec6` (every other figure matches, Appendix A), so the previous column above is the re-measured one.

**No function is over CC 15** (the AGENTS.md limit), so lint reports 0 `complexity` warnings. `Combobox` fell from 27 to 12; `Checkbox` from 19 to 11; `EvaluationSheetView`, `EvaluationsList`, `RadioGroup` and `OfferingCard` (17–19) left the list (B.1).

**Unit size** (outermost functions, by LOC):

| Size | Previous | Now |
|---|--:|--:|
| ≤ 15 lines | 20.4% | **21.8%** |
| 16–30 lines | 22.0% | **25.2%** |
| 31–60 lines | 28.2% | **35.6%** |
| > 60 lines | 29.3% | **17.4%** |

40 outermost functions are over 60 lines (was 47). **0 functions are over 80 lines** (was 22); lint reports 0 `max-lines-per-function` warnings. A for Modifiability (a) needs ≤ 15%: about 6 of the 40 units would have to drop under 61 lines *(judged)*.

**Single-use abstractions and code beyond the specs:**

- **Previous:** knip reported 1 unused export (`SidebarSeparator`).
- **Now:** 4 unused exports: `SidebarSeparator` (`Sidebar.tsx:338`, unchanged), and R74's `API_PREFIX` (exported twice: `forwarding.ts:11` and the public index `index.ts:32`) and `apiPathFor` (`forwarding.ts:57`, exported for no importer).

### 2.5 Duplication (jscpd 4.3.0)

- Settings: the same as before (`--min-tokens 50`, non-test, without `schema.ts`). The same run on `72b7ec6` gives the previous figures.
- **Now:** 739 sources, **30 clones, 312 duplicated lines (0.79%), 1.03% of tokens**.
- **Previous:** 655 sources, 28 clones, 304 lines (0.84%), 1.09% of tokens.

| Clone | Lines | Locations | Previous |
|---|--:|---|---|
| Filtered list screen (toolbar + sidebar + results) | 29 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50–78` ↔ `src/pages/offerings/ui/OfferingsScreen.tsx:48–76` | 29, still open |
| Password-form submit and status block | 21 | `src/features/user-account/ui/PasswordForm.tsx:108–128` ↔ `ProfileForm.tsx:93–113` | 21, unchanged |
| New-password + confirmation handling | 20 + 10 | `model/use-password-form.ts:85–104` ↔ `use-register-form.ts:102–121`; `use-profile-form.ts:60–69` ↔ `use-register-form.ts:102–111` | 20 + 10; moved into the form hooks with the split |
| Not-found notice (new) | 18 + 13 | `src/pages/evaluation-form/ui/NotFoundNotice.tsx:6–36` ↔ `src/pages/inventory-detail/ui/InventoryNotFound.tsx:6–35` | new (R68) |
| Detail screen header | 15 | `CoffeeshopDetailScreen.tsx:104–118` ↔ `OfferingDetailScreen.tsx:137–151` | 17 |
| Inventory screen frame (new) | 11 | `InventoryDetailScreen.tsx:25–35` ↔ `ManageInventoryScreen.tsx:37–47` | new (R68) |
| Facet query parsing | 9 + 9 | `inventory-facets/model/query.ts:24–32` ↔ `evaluation-facets/model/query.ts:76–84` and `coffeeshop-facets/model/query.ts:35–43` | 9, now three copies (R68) |
| Selectable chip/scale option rendering | — | — | **removed** by `split-oversized-shared-ui` (`BeanScale`, `DescriptorChipGroup`, `RadioGroup`, `IntensitySlider` clones) |
| Evaluation list screens | 9 | `EvaluationsListScreen.tsx:30–38` ↔ `public-evaluations/ui/ListScreen.tsx:31–45` | 14 |

The full list is in Appendix B.3.

### 2.6 Dead code (knip 5.88.1)

| Finding | Previous | Now |
|---|--:|--:|
| Unused files | 2 (false positives or design material) | **2**, the same two: `src/shared/lib/i18n/request.ts` (loaded by path from `next.config.ts:6`) and `docs/design/add-theme-tokens/tokens.css` |
| Unlisted dependencies | 1 (`postcss`) | **1**, the same |
| Unresolved imports | 1 (a stale QA file) | **0**: the file was deleted with the QA cleanup |
| Unused exports | 1 (`SidebarSeparator`) | **4**: `SidebarSeparator`; `API_PREFIX` ×2 and `apiPathFor` (R74) |
| Unused exported types | 225 | **258** (the `*Props` / `*Texts` types exported by convention, *judged harmless*) |

---

## 3. Refactoring roadmap

### 3.1 Status of the previous roadmap (N1–N6) and of the changes since

All six candidates of the previous review were delivered on 2026-10-09, before R67. The table gives the effect each was expected to have and what this review measures.

| ID | Change-id / path | Expected impact (previous review) | Measured now |
|---|---|---|---|
| N1 | unplanned fix `fix(app-shell): give the sidebar filters toggle the sidebar entry text colour` (`claude/fix-sidebar-toggle-contrast` `06e97d60`) | Usability D → A | **A**: 0 A/AA violations on 48 runs |
| N2 | `claude/cover-pass2-scenarios` (5 test commits, 9 files) | Traceability D → C or B, depending on the measure Product owner accepts | 9 scenarios covered; the name measure stays **67.2%** (D). The measure itself was not changed |
| N3 | `testing` Purpose (`7da5829`) | 14 / 14 specs valid | **14 / 14** |
| N4 | `move-flavor-wheel-types` | Modularity B → A | the 11 cycles are gone; **7 new type cycles** from the splits keep Modularity at **B** |
| N5 | `lazy-load-facet-controls` | Performance C → B if ≤ 170 KB gz | cmdk on no measured route; max 239.5 KB gz → stays **C** |
| N6 | `split-oversized-shared-ui`, `split-oversized-screens`, `split-oversized-facets` | Analysability B → A; > 60-line share → ≤ 15% for A | Analysability **A**; > 60-line share **17.4%** (B); lint warnings 48 → 1 |
| — | QA hygiene (reduction plan) | delete 3 stale QA files; 19 unused variables | **done**: 0 excluded files, 1 unused variable left (`qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx:529`) |

Changes since (R67–R75):

| ID | Change-id | Effect measured in this review |
|---|---|---|
| R67 | `add-manage-locations-menu-entry` | the coffee shop's user menu gains an entry (`UserMenu` CC 11 → 13 *(judged: attributed to this change)*) |
| R68 | `add-coffee-inventory-explorer` | 4 new slices, 2 new routes (23 dynamic in the build); 2 new clones (§2.5); consumes `listCoffeeInventory` |
| R69 | `fix-offering-card-actions-layout` | new `OfferingSelect`; `OfferingCard` CC 17 → `cardLines` 13 *(judged: with `split-oversized-screens`)* |
| R70–R72 | `unify-management-eyebrow`, `name-card-actions-by-coffee`, `shorten-coffeeshop-back-label` | texts and labels; no metric moved |
| R73 | `remember-list-preferences` | new `tab-storage.ts` (`sessionStorage`, no credential); 2 new filtering requirements, both traced |
| R74 | `route-api-web-pages-through-front` (active, not archived) | §1.2: `connect-src` narrowed; two API bases; 4 residual findings; 8 new tests (6 in `proxy.test.ts`, which now holds 18, 1 in `tokens.test.ts`, 1 in `client.test.ts`) plus round 1's `/favicon.svg` test; `--strict` valid |
| R75 | QA test commit `7871bd7e` (no OpenSpec change) | `qa/proxy.test.ts` passes; the QA suite is green (1,975 / 1,975) |
| — | `Dockerfile`, `.dockerignore` | §1.2 |

Previous estimate for N1–N6: not given in hours. *(not measured: actual effort)*

### 3.2 Existing backlog entries

| Entry | Previous status | Now | Backlog |
|---|---|---|---|
| R1 (E2E locale switch) | deferred | waits for R74 in `develop` (Product owner, 2026-10-12) | open |
| R45 (first location at registration) | deferred, API first | unchanged | open (deferred) |
| R74 (front as the API's entry point) | — | applied on its feature branch; browser checks (8.1), verify and archive pending; G1 PASS | open, priority 1 |
| R75 (stale QA proxy test) | — | done (`7871bd7e`), no backlog section | — |
| R10, R40, R41, R47, R50 | closed or open | closed (in "Closed entries" since 2026-10-10) | closed |
| R15 (slow `EvaluationForm` tests) | closed in the backlog; the file still the slowest (18.4 s) | the file now takes **32.3 s** for 45 tests, more than half the suite, and failed once intermittently (board, 2026-10-11) | closed in the backlog; see N12 |

### 3.3 New candidates from this review

These are not in `docs/design/backlog.md`: this session only writes the review. They are numbered N7–N14 so they do not collide with backlog ids or with the previous review's N1–N6. Product owner or the orchestrator files them.

| ID | Proposed change-id (capability) | Files | Problem → sub-characteristic | Effort | Impact | Type |
|---|---|---|---|:-:|---|---|
| **N7** | `hide-internal-api-address` (auth) | `src/shared/api/forwarding.ts:96`, `proxy.ts` (or the edge) | `x-middleware-rewrite` names `API_INTERNAL_URL` on every forwarded response → Security / confidentiality | S–M (investigate first) | no internal address in any response | **Change** (security; the spec's "served as the API sends it") |
| **N8** | `restrict-forwarded-api-paths` (auth) | `src/shared/api/forwarding.ts:57–65`, auth "One public entry point" | `/api/<any>` reaches every API route; the web list is not a boundary → Security / integrity | S | only the contract's 35 paths and `/oauth/token` under `/api` | **Change** (security, behaviour; PO decision) |
| **N9** | `pin-forwarded-client-headers` (auth) | `forwarding.ts:71–79` | visitor-sent `X-Forwarded-For` and `Host` reach the API unless the edge rewrites them → Security / authenticity | S | sign-in limit and host safe without depending on the edge | **Change** (reverses the Q8 decision and the spec's "keep the client's `X-Forwarded-For`"; PO decision) |
| **N10** | `harden-front-image` (deployment) | `Dockerfile`, `.dockerignore`, `next.config.ts` (`output: "standalone"`) | root user, full tree with dev dependencies, floating base, `npx` as PID 1, undeclared `API_INTERNAL_URL` → Security, Portability | S | non-root, minimal run image | **Change** (Product owner's files; `next.config.ts` needs a change) |
| **N11** | `move-split-unit-types` (form-fields, filtering, offering-catalog) | the 7 parent ↔ part pairs of §2.3 → new `*-types.ts` files | 7 type-only cycles → Modularity | S | Modularity B → A | **Refactor (fast lane)** |
| **N12** | `split-evaluation-form-test` (evaluations) | `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` (45 tests, 32.3 s) | one file is > 50% of the suite's wall time and flaky once → Testability | S–M | suite well under 60 s; isolates the intermittent case | **Refactor (fast lane)** (tests move, assertions unchanged) |
| **N13** | `drop-unused-forwarding-exports` (auth) | `src/shared/api/index.ts:32`, `forwarding.ts:11,57` | `API_PREFIX` and `apiPathFor` exported for no importer → content-structure "Public indexes export only what is imported" | S | 0 unused R74 exports | **Refactor (fast lane)** (can ride N8) |
| **N14** | `trim-shared-client-floor` (app-shell) | app shell, header menus, `next-intl` client provider | 208 KB gz on the lightest route → Performance / resource use | M (measure first) | Performance C → B if ≤ 170 KB gz *(target not verified)* | **Change** (what loads on every route) |

The traceability measure (the second half of N2) is a Product owner decision, not a change: accept a scenario → test map as the measured indicator.

### 3.4 Expected grades

| Characteristic | Now | After N7–N13 | After N7–N14 and the traceability decision |
|---|:-:|:-:|:-:|
| Maintainability | B | B (Modularity A; Modifiability (a) 17.4% still B) | A *(judged: needs ≤ 15% of function LOC in units > 60 lines)* |
| Testability | D | D | C or B *(depends on the measure Product owner accepts)* |
| Functional suitability | D | D | C or B *(same)* |
| Security | A | A, with the R74 and Docker residuals closed | A |
| Usability | A | A | A |
| Performance efficiency | C | C | B *(if N14 reaches ≤ 170 KB gz)* |

---

## Appendix A — Method and tool versions

**Environment**

- Node 22.22.0, npm 10.9.4. `npm ci` warns `EBADENGINE` for `jsdom@30.1.1`, `w3c-xmlserializer@6.0.0`, `@asamuzakjp/css-color@7.1.2` and `@asamuzakjp/dom-selector@9.2.2` (all want Node ≥ 22.22.2). It does not affect the results; the environment's Node should be raised.
- Next.js 16.4.0 (Turbopack), TypeScript 5.9.3, ESLint 9.39.5 (npm marks it deprecated; AGENTS.md keeps ESLint 9 on purpose), Vitest 5.0.2 (jsdom 30.1.1), next-intl 4.14.9, radix-ui 1.6.7, cmdk 1.1.1, leaflet 1.9.4, oauth4webapi 3.8.8, lucide-react 1.49.0, React 19.2.8. All unchanged.
- Linux container (a different session from the previous review: wall times compare only roughly).

**Setup**

- `git fetch origin`, `git checkout -b technical-review-2026-10-12 origin/feature/route-api-web-pages-through-front` (head `4b44059a`, as expected), `npm ci`, `npx next typegen`.
- The previous revision was extracted with `git archive 72b7ec6` into a scratch folder (its `node_modules` linked to this checkout's) to re-run every script there.
- `git status` stayed clean apart from this file and the removal of the previous report.

| Check | Command | Result (previous → now) |
|---|---|---|
| Validation suite | `npm run test:run` | 198 files / 1,126 tests, 34.2 s → **209 files / 1,190 tests, all passed, 53.4 s**; a second run with the JSON reporter: 1,190 passed, 56.7 s wall. vmThreads pool, with forks for 7 files |
| QA suite | `npm run test:qa` (both suites) | 353 files / 1,914 tests, 51.1 s → **364 files / 1,975 tests, all passed, 79.8 s**. QA alone: 155 files / 785 tests; 0 QA files excluded (was 3) |
| Per-file durations | `npx vitest run --reporter=json --outputFile=…` | Appendix B.5 |
| Typecheck | `npx tsc --noEmit` | 0 errors → **0 errors** |
| Lint | `npm run lint` | 0 errors / 48 warnings → **0 errors / 1 warning**: 1 `@typescript-eslint/no-unused-vars` in `qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx:529`; 0 `max-lines-per-function`, 0 `complexity`, 0 `max-lines`, 0 `no-restricted-imports`, 0 jsx-a11y |
| Build | `next build` with `NEXT_PUBLIC_API_URL=http://localhost:3000/api`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_OAUTH_CLIENT_ID=review-client` (R74's values; previously `NEXT_PUBLIC_API_URL=http://localhost:8000`) | success, 21 dynamic routes → **success (compile 11.3 s, TypeScript 19.3 s); 23 dynamic routes (+ the two inventory routes of R68) + `icon.svg` static; `ƒ Proxy`** |
| OpenSpec | `npx -y @fission-ai/openspec@1.13.2 validate --specs --strict`; `… validate route-api-web-pages-through-front --strict` | 13 passed, 1 failed → **14 passed, 0 failed** (INFO notes on long requirement texts only); the active change: **valid** |
| Audit | `npm audit --omit=dev`, `npm audit` | 0 / 5 high → **0 / 5 high** (dev only), 0 critical |
| Complexity and unit size | `npx eslint src app proxy.ts --ignore-pattern '**/*.test.ts' --ignore-pattern '**/*.test.tsx' --ignore-pattern src/shared/api/schema.ts --rule '{"complexity":["warn",0]}' --rule '{"max-lines-per-function":["warn",{"max":0,"skipBlankLines":true,"skipComments":true}]}' --rule '{"max-depth":["warn",4]}' -f json -o …`, then a scratch script that pairs each complexity report with the innermost function range and keeps outermost units for the LOC shares | 1,480 functions; 34 with CC > 10; 0 > 80 lines; 0 with depth > 4. 17 of 1,481 complexity reports could not be paired (left out). On `72b7ec6` the script gives every previous figure (1,316 functions, mean 2.50, max 27, 39 / 1 in the moderate / high bands, the LOC shares, 40 with CC > 10, 22 > 80 lines) except the low-band count, 1,264 against the 1,276 reported |
| File sizes | `git ls-tree` + `git show` per `.ts`/`.tsx` file, non-test, without `schema.ts` | On `72b7ec6`: 413 files / 29,413 lines, the previous figures. Now 466 / 32,397 |
| Duplication | `npx -y jscpd@4.3.0 src app --min-tokens 50 --ignore '**/*.test.ts,**/*.test.tsx,**/schema.ts' --reporters json` | On `72b7ec6`: 28 clones, 0.84%, the previous figures. Now 30 clones, **0.79%** lines |
| Dead code | `npx -y knip@5.88.1 --reporter json`, default config | §2.6 |
| Cycles | `npx -y dependency-cruiser@16.10.4 src app proxy.ts`, ad hoc config in the scratch folder (`no-circular`, `tsPreCompilationDeps`, tests, `qa/` and `schema.ts` excluded), `NODE_PATH` set to the repo's `node_modules` | On `72b7ec6`: the previous 11 cycles (420 modules, 1,130 dependencies with this config; the previous review reported 437 / 1,449 with its own). Now **7 type-only cycles / 473 modules, 1,283 dependencies** |
| FSD layering | Ad hoc Node script: every `import` / `export … from` / dynamic `import()` / `vi.mock()` of `@/…` and relative paths under `src/`, `app/` and `proxy.ts`, classified by layer and slice | On `72b7ec6` and now: 0 production violations, the same 4 test files |
| Props count | Ad hoc regex scan of `export type *Props = { … }` top-level fields | 211 types on `72b7ec6` (the previous review reported 208); now 237, mean 3.92 |
| Contract | `js-yaml` parse of `contracts/openapi.yaml` (35 operations) plus a grep of request paths in `src/` | §1.1 |
| Traceability | Ad hoc script: requirement and scenario titles of `openspec/specs/*/spec.md` searched in the test file text | On `72b7ec6`: 165 / 246 and 559 / 1,077, the previous figures. Now 180 / 268, 609 / 1,137 |
| Accessibility | `playwright-core` 1.56.1, `@axe-core/playwright` 4.11.0, `axe-core` 4.11.0, Chromium (`/opt/pw-browsers/chromium-1194`), installed in a scratch folder outside the repo; tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; theme set with the `theme` cookie | §1.3 |
| JS per route | The same Playwright run: sum of `script` response bodies until network idle, gzip with Node `zlib` level 6 | §1.4 |
| Headers and forwarding | `curl -D -` on `next start` (with `API_INTERNAL_URL=http://127.0.0.1:8000`) for `/en`, `/callback`, `/api/taxonomies` (with `X-Forwarded-For: 203.0.113.7`), `/login`, `/forgot-password` (with `Host: evil.example`), `/api/oauth/clients` and `/api/%2e%2e/oauth/clients`; the mock API logged `X-Forwarded-For/Host/Proto` | §1.2 |
| G1 | read from `git show origin/develop:docs/design/route-api-web-pages-through-front/handoff.md` | A1 PASS, A2 PASS through ngrok; A3 inconclusive (test account) |

**Mock API**

- The same as before: a Node HTTP server answers every contract path with the example of its first documented 2xx response (35 operations + `OPTIONS`), and logs every request.
- The same deviation: `GET /evaluations/{ulid}` returns `status: "closed"`.
- New: the browser's calls reach it through the front's `/api` forwarding, and the server's reads directly on `API_INTERNAL_URL`. It is not committed.

**Limits**

- Signed-in screens (account, the evaluation form with a session, management, the inventory explorer) were still not audited with axe, because they need the OAuth popup flow.
- R74 was checked against a mock, not the Laravel API: the CSRF, cookie and passkey behaviour of the forwarded pages, and the `Location` headers, are covered only by G1 and the pending browser checks (task 8.1).
- The `Dockerfile` was read, not built: Docker is not available in this session *(not measured: image size, start-up)*.
- HTTP/2, real network timing, the extra hop of R74 and Core Web Vitals were not measured.

## Appendix B — Raw metrics

### B.1 Functions with CC > 10 (non-test)

34 functions (was 40). None is over the AGENTS.md limit of 15 (was 7).

| CC | Function | Location | Previous |
|--:|---|---|--:|
| 15 | `SpecialistEvaluationRow` | `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx:53` | 15 |
| 15 | `Button` | `src/shared/ui/Button.tsx:152` | 15 |
| 15 | `InventoryPanel` | `src/widgets/offering-detail/ui/InventoryPanel.tsx:47` | 15 |
| 15 | `OfferingList` | `src/widgets/offering-list/ui/OfferingList.tsx:88` | 15 |
| 14 | `completeCallback` | `src/features/auth/api/authorize.ts:107` | 14 |
| 14 | `handleSubmit` | `src/features/user-account/model/use-password-form.ts:90` | 14 (in `PasswordForm.tsx`) |
| 14 | `DetailHeader` | `src/widgets/offering-detail/ui/DetailHeader.tsx:38` | 14 |
| 13 | `completenessOf` | `src/entities/evaluation/model/completeness.ts:26` | 13 |
| 13 | `cardLines` | `src/entities/offering/ui/OfferingCard.tsx:75` | new (from `OfferingCard` 17) |
| 13 | `formReducer` | `src/pages/evaluation-form/model/form-model.ts:96` | 13 |
| 13 | `EvaluationGroupCard` | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx:67` | 13 |
| 13 | `UserMenu` | `src/widgets/app-header/ui/UserMenu.tsx:116` | 11 |
| 13 | `AppSidebar` | `src/widgets/app-sidebar/ui/AppSidebar.tsx:44` | 13 |
| 13 | `headerLines` | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:140` | new (from `EvaluationSheetView` 19) |
| 12 | `formStateFromEvaluation` | `src/entities/evaluation/model/load.ts:43` | 12 |
| 12 | `buildTaxonomyLookup` | `src/entities/taxonomy/model/lookup.ts:21` | 12 |
| 12 | `completePopup` | `src/features/auth/api/authorize.ts:230` | 12 |
| 12 | `evaluationListQuery` | `src/features/evaluation-facets/model/query.ts:161` | 12 |
| 12 | `publicEvaluationsQuery` | `src/features/evaluation-facets/model/query.ts:182` | 12 |
| 12 | `initialFormModel` | `src/pages/evaluation-form/model/form-model.ts:55` | 12 |
| 12 | async arrow function | `src/pages/evaluation-form/model/use-evaluation-form.ts:104` | 12 |
| 12 | `EvaluationFormHeader` | `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx:31` | 12 |
| 12 | `Combobox` | `src/shared/ui/Combobox.tsx:59` | 27 |
| 12 | `RadioOptionRow` | `src/shared/ui/RadioOptionRow.tsx:63` | new (from `RadioGroup` 18 / `renderOption` 12) |
| 12 | `useComboboxInput` | `src/shared/ui/use-combobox-input.ts:56` | new (from `Combobox`) |
| 12 | `EvaluationSheetBaseline` | `src/widgets/evaluation-sheet/ui/EvaluationSheetBaseline.tsx:60` | 12 |
| 12 | `EvaluationListPresentation` | `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx:79` | 12 |
| 11 | `refreshProfile` | `src/features/auth/model/session.ts:202` | 11 |
| 11 | `appliedEvaluationFilters` | `src/features/evaluation-facets/model/applied.ts:32` | 11 |
| 11 | `parseEvaluationFilters` | `src/features/evaluation-facets/model/query.ts:131` | 16 |
| 11 | `handleSubmit` | `src/features/user-account/model/use-profile-form.ts:65` | 11 (in `ProfileForm.tsx`) |
| 11 | `Checkbox` | `src/shared/ui/Checkbox.tsx:106` | 19 |
| 11 | `Field` | `src/shared/ui/Field.tsx:30` | 11 |
| 11 | `onKeyDown` | `src/shared/ui/use-combobox-input.ts:107` | 11 (the `Combobox` arrow function) |

These left the list: `EvaluationSheetView` 19, `EvaluationsList` 18, `RadioGroup` 18, `OfferingCard` 17, `EvaluationFacets` 15, `BeanScale` 15, `IntensitySlider` 14, `DescriptorChipGroup` 12, `renderOption` 12 and the `LocationsMap` arrow function 11.

### B.2 Functions over 80 lines (non-blank, non-comment)

**0 functions** (was 22); lint reports no `max-lines-per-function` warning. The 22 previous units were split by `split-oversized-shared-ui`, `split-oversized-screens` and `split-oversized-facets`; their largest successors are `LocationsMap` 75, `Combobox` 71, `OfferingFacets` 70, `RegisterForm` 70, `PasswordForm` 70, `ProfileForm` 67 and `DangerZone` 64 (was 183, 147, 136, 111, 105, 106 and 105).

The 40 functions between 61 and 80 lines, the next limit that matters for Modifiability (a):

| LOC | Function | Location |
|--:|---|---|
| 78 | `CoffeeshopDetailScreen` | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:44` |
| 78 | `FlavorWheel` | `src/shared/ui/FlavorWheel.tsx:50` |
| 77 | `LocationsPanel` | `src/features/location-management/ui/LocationsPanel.tsx:101` |
| 77 | `UserMenu` | `src/widgets/app-header/ui/UserMenu.tsx:116` |
| 77 | `CoffeeshopListBody` | `src/widgets/coffeeshop-list/ui/CoffeeshopList.tsx:86` |
| 76 | `ContactSection` | `src/features/user-account/ui/ContactSection.tsx:65` |
| 76 | `OfferingDetailContent` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:72` |
| 75 | `LocationForm` | `src/features/location-management/ui/LocationForm.tsx:165` |
| 75 | `AccountScreen` | `src/pages/account/ui/AccountScreen.tsx:18` |
| 75 | `useEvaluationForm` | `src/pages/evaluation-form/model/use-evaluation-form.ts:83` |
| 75 | `LocationsMap` | `src/shared/ui/LocationsMap.tsx:83` |
| 73 | `EvaluationFacets` | `src/features/evaluation-facets/ui/EvaluationFacets.tsx:74` |
| 71 | `OwnOfferingsGrid` | `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx:52` |
| 71 | `detailTexts` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:59` |
| 71 | `Combobox` | `src/shared/ui/Combobox.tsx:59` |
| 70 | `OfferingFacets` | `src/features/offering-facets/ui/OfferingFacets.tsx:46` |
| 70 | `PasswordForm` | `src/features/user-account/ui/PasswordForm.tsx:58` |
| 70 | `RegisterForm` | `src/features/user-account/ui/RegisterForm.tsx:65` |
| 70 | `ContextFieldsCard` | `src/pages/evaluation-form/ui/ContextFieldsCard.tsx:57` |
| 70 | `ManageOfferingsPanel` | `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx:59` |
| 70 | `FlavorWheelChart` | `src/shared/ui/FlavorWheelChart.tsx:117` |
| 69 | `FacetPanel` | `src/shared/ui/FacetPanel.tsx:37` |
| 68 | `useCreateFlow` | `src/features/offering-management/model/create-flow.ts:124` |
| 68 | `EvaluationGroupCard` | `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx:67` |
| 68 | `CreateForm` | `src/pages/new-offering/ui/NewOfferingForm.tsx:66` |
| 68 | `ScoreRangeFacet` | `src/shared/ui/ScoreRangeFacet.tsx:38` |
| 67 | `ProfileForm` | `src/features/user-account/ui/ProfileForm.tsx:46` |
| 67 | `evaluationSheetTexts` | `src/widgets/evaluation-sheet/lib/texts.ts:19` |
| 67 | `OfferingList` | `src/widgets/offering-list/ui/OfferingList.tsx:88` |
| 66 | `Pagination` | `src/shared/ui/Pagination.tsx:170` |
| 65 | `HomeScreen` | `src/pages/home/ui/HomeScreen.tsx:34` |
| 65 | `CoffeeshopDetailContent` | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:46` |
| 64 | `DangerZone` | `src/features/user-account/ui/DangerZone.tsx:132` |
| 64 | `EvaluationsListScreen` | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:88` |
| 63 | `CoffeeshopsScreen` | `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx:96` |
| 62 | `SpecialistEvaluationRow` | `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx:53` |
| 62 | `RadioGroup` | `src/shared/ui/RadioGroup.tsx:72` |
| 61 | `ManageOfferingsScreen` | `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx:23` |
| 61 | `Checkbox` | `src/shared/ui/Checkbox.tsx:106` |
| 61 | `useComboboxInput` | `src/shared/ui/use-combobox-input.ts:56` |

### B.3 All jscpd clones (lines, tokens)

| Lines | Tokens | First location | Second location |
|--:|--:|---|---|
| 29 | 229 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:50-78` | `src/pages/offerings/ui/OfferingsScreen.tsx:48-76` |
| 21 | 193 | `src/features/user-account/ui/PasswordForm.tsx:108-128` | `src/features/user-account/ui/ProfileForm.tsx:93-113` |
| 20 | 214 | `src/features/user-account/model/use-password-form.ts:85-104` | `src/features/user-account/model/use-register-form.ts:102-121` |
| 18 | 88 | `src/pages/evaluation-form/ui/NotFoundNotice.tsx:6-23` | `src/pages/inventory-detail/ui/InventoryNotFound.tsx:6-22` |
| 15 | 123 | `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx:104-118` | `src/pages/offering-detail/ui/OfferingDetailScreen.tsx:137-151` |
| 14 | 104 | `src/pages/account/ui/AccountScreen.tsx:70-83` | `src/pages/manage-locations/ui/ManageLocationsScreen.tsx:51-64` |
| 13 | 125 | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:56-68` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:83-95` |
| 13 | 125 | `src/pages/evaluation-form/ui/NotFoundNotice.tsx:24-36` | `src/pages/inventory-detail/ui/InventoryNotFound.tsx:23-35` |
| 13 | 143 | `src/features/evaluation-facets/ui/EvaluationsToolbar.tsx:43-55` | `src/features/offering-facets/ui/OfferingsToolbar.tsx:32-44` |
| 12 | 89 | `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx:68-79` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:95-106` |
| 12 | 93 | `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx:41-52` | `src/pages/offerings/ui/OfferingsScreen.tsx:57-68` |
| 12 | 94 | `src/features/coffeeshop-facets/ui/CoffeeshopFacets.tsx:32-43` | `src/features/offering-facets/ui/OfferingFacets.tsx:57-68` |
| 12 | 106 | `src/shared/ui/DescriptorCascade.tsx:12-23` | `src/shared/ui/DescriptorChipGroup.tsx:21-32` |
| 11 | 84 | `src/pages/inventory-detail/ui/InventoryDetailScreen.tsx:25-35` | `src/pages/manage-inventory/ui/ManageInventoryScreen.tsx:37-47` |
| 10 | 87 | `src/pages/evaluation-form/ui/ExtrinsicField.tsx:39-48` | `src/pages/evaluation-form/ui/NoteField.tsx:51-60` |
| 10 | 105 | `src/features/user-account/model/use-profile-form.ts:60-69` | `src/features/user-account/model/use-register-form.ts:102-111` |
| 9 | 52 | `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx:24-32` | `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx:24-32` |
| 9 | 95 | `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx:30-38` | `src/pages/public-evaluations/ui/ListScreen.tsx:31-45` |
| 9 | 96 | `src/features/evaluation-facets/model/query.ts:76-84` | `src/features/inventory-facets/model/query.ts:24-32` |
| 9 | 108 | `src/features/coffeeshop-facets/model/query.ts:35-43` | `src/features/inventory-facets/model/query.ts:24-…` |
| 8 | 82 | `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx:110-117` | `src/widgets/offering-detail/ui/OfferingDetailContent.tsx:87-95` |
| 8 | 71 | `src/pages/about/ui/AboutContent.tsx:77-84` | `src/pages/home/ui/HomeHero.tsx:70-77` |
| 8 | 71 | `src/features/inventory-facets/ui/InventoryFacets.tsx:36-43` | `src/features/offering-facets/ui/OfferingFacets.tsx:57-65` |
| 8 | 56 | `src/features/evaluation-facets/ui/EvaluationFacetParts.tsx:76-83` | `src/features/offering-facets/ui/OfferingFacetParts.tsx:126-133` |
| 7 | 59 | `src/pages/evaluation-form/ui/GroupParts.tsx:147-153` | `src/pages/evaluation-form/ui/GroupParts.tsx:116-122` |
| 7 | 76 | `src/entities/offering/ui/OfferingCard.tsx:128-134` | `src/widgets/offering-detail/ui/ScoreCard.tsx:48-54` |
| 7 | 71 | `src/entities/coffeeshop/ui/CoffeeshopCard.tsx:27-33` | `src/entities/offering/ui/OfferingCard.tsx:68-74` |
| 6 | 87 | `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx:35-40` | `src/widgets/evaluation-row/ui/EvaluationRowParts.tsx:78-83` |
| 6 | 74 | `src/entities/offering/ui/OfferingCard.tsx:84-89` | `src/widgets/offering-detail/ui/DetailHeader.tsx:46-52` |
| 6 | 86 | `src/entities/coffeeshop/api/coffeeshop.ts:20-25` | `src/entities/offering/api/offering.ts:25-32` |

As before, jscpd reports the second range of one clone with an end line beyond the clone (shown as `…`).

### B.4 Requirement names not found in any validation-suite test file text

The tests may still cover these under another wording (§1.3). Requirements marked ◆ are refactor properties: AGENTS.md lets no test be added for them, so lint, the build or the existing suites verify them. 88 names (was 81); 27 ◆.

- **app-shell (9):** Brand logotype presentation; Header menu triggers; Sidebar entry presentation; No known high or critical framework advisory ◆; Code-structure rules reported by lint ◆; Header menu surface; Named navigation landmarks; Result count announced inside the sidebar overlay; Client code loaded per route ◆.
- **auth (1):** One active-locale derivation for the auth flows ◆.
- **base-controls (8):** Action button treatments; Action button sizes; Action button interaction states; Accessible naming of icon-only actions; Link states and back variant; Theme-driven corner radii; Action variants by kind; Navigation controls by position.
- **content-structure (6):** Card stacking on narrow viewports; Pagination page numbers; Acyclic shared segment imports ◆; Prompt page change on server-loaded lists; Heading outline; Public indexes export only what is imported ◆.
- **evaluations (11):** Closing an evaluation; Sign-in to the evaluation routes; Evaluate action on the offering card; Public evaluations filter sidebar; Offerings of an evaluations page ◆; Evaluation routes as protected views; One row per evaluation-row variant ◆; Evaluation form kept as one form ◆; Cancelling the evaluation form; Evaluation route headings; Evaluation screens kept within the size limits ◆ (new).
- **feedback (6):** Badge label contrast; Flavor wheel note list disclosure; Flavor wheel kept as one view ◆; Flavor wheel with every level; Selected row of the flavor wheel note list; Flavor wheel types shared without import cycles ◆ (new).
- **filtering (7):** Evaluation facets in the sidebar; Filtered evaluation results; Coffee shop filter toolbar; Filtered coffee shop results; Sidebar facets sub-section; Facet units kept within the size limits ◆ (new); Inventory filter toolbar (new).
- **form-fields (6):** Field structure and association; Inverse variant on dark surfaces; Theme-driven rendering; Facet row presentation; One field resolution for every field control ◆; Own-field controls kept within the size limits ◆ (new).
- **landing (2):** Public access; Verified offerings list.
- **offering-catalog (16):** Catalog pagination; Catalog heading and toolbar slot; Catalog single column; Catalog and detail texts and metadata; View evaluations link on the offering detail; Directory heading and results column; Map interaction and accessibility; Full-screen map on a small viewport; Coffee shop detail tabs in the address; Directory texts and metadata; Public reads through the shared public request client ◆; Consensus panel kept as one view ◆; Reference data cached with a one-hour refresh ◆; One result shape for every API request ◆; Locations map kept within the size limits ◆ (new); Catalog screens kept within the size limits ◆ (new).
- **offering-management (5):** Localized management texts; Access to the locations page; Address geocoding; Management panels kept as one view ◆; Location form kept within the size limits ◆ (new). ("Localized location texts" is found now.)
- **testing (1):** Test environment set-up keeps the suites' results ◆.
- **theming (4):** Two complete color themes; UI boundary and focus contrast; Theme-invariant typography; Text sizing accessibility. ("Text and button contrast" is found now, N1.)
- **user-account (6):** Writes and the step-up; Account requests through the slice's request layer ◆; Contact section kept as one view ◆; Account page modes and their session gate; Grouped security section; Account forms kept within the size limits ◆ (new).

"Inventory filter toolbar" is the one new behaviour requirement not found by name; the other 13 new behaviour requirements are.

Matches by capability (requirements / scenario titles), previous → now:

| Capability | Requirements | Scenario titles |
|---|--:|--:|
| app-shell | 20/29 → 20/29 | 77/126 → 79/128 |
| auth | 10/11 → 10/11 | 40/45 → 40/45 |
| base-controls | 5/13 → 5/13 | 19/43 → 19/43 |
| content-structure | 9/15 → 9/15 | 36/66 → 37/66 |
| evaluations | 13/23 → 13/24 | 48/124 → 50/126 |
| feedback | 8/13 → 8/14 | 29/63 → 29/65 |
| filtering | 29/34 → 36/43 | 40/129 → 52/147 |
| form-fields | 12/17 → 12/18 | 67/86 → 67/88 |
| landing | 8/10 → 8/10 | 46/46 → 48/48 |
| offering-catalog | 25/39 → 25/41 | 103/141 → 107/146 |
| offering-management | 12/17 → 19/24 | 24/90 → 51/115 |
| testing | 0/1 → 0/1 | 0/2 → 0/2 |
| theming | 4/9 → 5/9 | 2/24 → 2/24 |
| user-account | 10/15 → 10/16 | 28/92 → 28/94 |

### B.5 Slowest test files (validation suite)

From the JSON-reporter run (1,190 tests, 56.7 s wall).

| Duration | Tests | File | Previous |
|--:|--:|---|---|
| 32.3 s | 45 | `EvaluationForm.test.tsx` | 18.4 s / 45 |
| 3.8 s | 27 | `ManageOfferingsPanel.test.tsx` | 2.0 s / 24 |
| 3.4 s | 43 | `AppHeader.test.tsx` | 2.1 s / 41 |
| 3.0 s | 43 | `FlavorWheel.test.tsx` | 1.6 s / 43 |
| 2.6 s | 7 | `EvaluationDetail.test.tsx` | 1.7 s / 7 |
| 2.2 s | 22 | `authorize.test.ts` | 2.0 s / 22 |
| 1.9 s | 10 | `OfferingFacets.test.tsx` | 1.1 s / 9 |
| 1.8 s | 15 | `session.test.ts` | 1.7 s / 15 |
| 1.7 s | 21 | `NewOfferingForm.test.tsx` | — |
| 1.6 s | 14 | `AppShell.test.tsx` | 0.9 s / 14 |

The slowest case is still "sends each descriptor block's selection to its request field (design.md D7)", now 2.7 s (was 1.8 s). Every file is slower than in the previous session by a similar factor *(judged: the container, not the code)*, but `EvaluationForm.test.tsx` grew from 18.4 to 32.3 s with the same 45 tests and alone takes more than half of the suite's wall time.

### B.6 Largest client chunks (`.next/static/chunks`)

| Chunk | Raw | Gzip | Contents (by string match) | Previous |
|---|--:|--:|---|---|
| `2nii411saqstq.js` | 202 KB | 63.8 KB | react-dom; every route | the same chunk, 207 / 65 KB |
| `1zu2osino5zci.js` | 155 KB | 42.9 KB | framework; every route | `0hzoz45wp76l6.js` 159 / 44 KB |
| `3rcb7zdltz07z.js` | 149 KB | 43.6 KB | Leaflet; lazy, map view only | `2m30aakide9md.js` 152 / 44 KB |
| `0cz1d0mv5g_q7.js` | 110 KB | 38.7 KB | — (not loaded on the measured routes) | the same chunk, 113 / 39 KB |
| `2wzqk8r1niqp0.js` | 60 KB | 19.4 KB | every route | `3kveyp7z-2f-p.js` 62 / 20 KB |
| `3w1_3fxz0bzu1.js` | 44 KB | 16.5 KB | Radix; every route (header menus) | — |
| `1wxbdhzctqosv.js` + `3ca0lyw4j35ro.js` | 35 + 20 KB | 12.0 + 7.5 KB | cmdk; only when a facet panel first opens | `41qy8ggehgcyv.js` 56 / 19 KB, cmdk + Radix on the facet routes |

The CSS bundle is 86.5 KB raw / 13.9 KB gzip (was 88 / 14 KB), plus a 10.3 KB raw / 2.6 KB gzip route stylesheet.

## Appendix C — Grading thresholds

These are the same thresholds as the previous review, unchanged so the grades compare. A characteristic's grade is the **worst** of its indicators.

| Indicator | A | B | C | D | E | Previous value | **Now** |
|---|---|---|---|---|---|---|---|
| Modularity: FSD violations in production / cycles | 0 / 0 | ≤ 2 / only intra-segment or type-only cycles | ≤ 5 / ≤ 3 cross-slice | ≤ 10 | > 10 | 0 / 11 type-only, intra-segment → B | 0 / 7 type-only, intra-segment → **B** |
| Reusability: jscpd duplicated lines | < 3% | 3–5% | 5–10% | 10–20% | > 20% | 0.84% → A | 0.79% → **A** |
| Analysability: share of outermost-unit LOC with CC 11–20 / 21–50 / > 50 | ≤ 25% / 0% / 0% | ≤ 30% / ≤ 5% / 0% | ≤ 40% / ≤ 10% / 0% | ≤ 50% / ≤ 15% / ≤ 5% | worse | 12.8% / 1.3% / 0% → B | 7.8% / 0% / 0% → **A** |
| Modifiability (a): share of function LOC in units > 60 lines (React-calibrated) | ≤ 15% | ≤ 30% | ≤ 45% | ≤ 60% | > 60% | 29.3% → B | 17.4% → **B** |
| Modifiability (b): files > 300 lines | ≤ 2 | ≤ 5 | ≤ 10 | ≤ 20 | > 20 | 2 → A | 2 → **A** |
| Testability: pass rate | 100% | ≥ 99% | ≥ 97% | ≥ 90% | < 90% | 100% → A | 100% (1,190 and 1,975) → **A** |
| Testability: full-suite wall time | ≤ 60 s | ≤ 120 s | ≤ 240 s | ≤ 480 s | > 480 s | 35 s (validation suite) → A | 53.4 s (validation suite; 56.7 s on a second run) → **A**; both suites 79.8 s |
| Testability / Functional suitability: requirement names traceable to tests | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 67.1% → D | 67.2% → **D** (lower bound; 74.7% → C without the 27 refactor-property requirements) |
| Functional suitability: in-scope contract operations consumed | ≥ 95% | ≥ 85% | ≥ 70% | ≥ 50% | < 50% | 32/32 → A | 32/32 in scope (32/35 overall) → **A** |
| Security: dependency advisories (runtime) | none | low/moderate only | high with an in-minor fix | high with no fix, or reachable | critical | none → A | none → **A** |
| Security: response headers | CSP + nosniff + Referrer-Policy + Permissions-Policy, no X-Powered-By | strict CSP, 1–4 of the rest missing | CSP present but weak | no CSP | no CSP and framing allowed | all present → A | all present on the front's documents, `connect-src` narrowed → **A** (forwarded API responses are outside the indicator, §1.2) |
| Security: credential storage | memory only | session storage | local storage | cookies without flags | tokens in URL / logs | memory only → A | memory only → **A** |
| Security: HTML injection sinks | 0 | — | 1 sanitised | 1 unsanitised | > 1 | 0 → A | 0 → **A** |
| Usability: axe WCAG 2.2 A/AA violations | 0 | 0 | ≤ 3 moderate | any serious | any critical | 1 serious rule in 4 of 48 runs → D | 0 on 48 runs → **A** |
| Usability: best-practice rule types / lint a11y warnings | 0 / 0 | ≤ 3 / ≤ 2 | ≤ 6 / ≤ 5 | more | — | 0 / 0 → A | 0 / 0 → **A** |
| Performance: first-load JS per route (gzip, max) | ≤ 130 KB | ≤ 170 KB | ≤ 250 KB | ≤ 350 KB | > 350 KB | 248.8 KB → C | 239.5 KB (coffee shop detail) → **C** |
| Performance: redundant requests per view *(judged)* | none | ≤ 2 | ≤ 5 | — | — | none with consistent data → A | none with consistent data; `/coffees` once for 48 runs → **A** |

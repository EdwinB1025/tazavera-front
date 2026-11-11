Status: approved

# Design summary — update-vulnerable-dependencies

Type: `Change` (touches security; dependency upgrades need Product owner's approval, `AGENTS.md` → Dependencies). Capability: `app-shell` (its requirement "No known high or critical framework advisory"). No branch yet; this draft lives on `develop`.

## 0. Sources

| Source | What it gives |
|---|---|
| Product owner's `npm audit` on `develop`, 2026-11-11 (verbatim copy given to the design lead) | 13 vulnerabilities: 9 moderate, 3 high, 1 critical. `next` 16.0.0–16.4.0 critical, fix `npm audit fix --force` → `next@16.4.6` (outside the stated range); every other one "fix available via `npm audit fix`" |
| `package.json` and `package-lock.json` on `develop` (read 2026-11-11) | Installed versions, direct or transitive, dev or production (section 1) |
| npm registry and GitHub advisories (read by the design lead, 2026-11-11) | Patched versions, latest versions and peer ranges (section 2, column "Checked") |
| `openspec/specs/app-shell/spec.md` line 473 | Requirement "No known high or critical framework advisory": production dependencies, the framework included, carry no high or critical advisory |
| `openspec/changes/archive/2026-10-08-upgrade-next-16-4/` | Precedent: same kind of change (exact pins for `next` and `eslint-config-next`, `npm audit fix` without `--force`, `npm audit --omit=dev` clean, dev-only advisory without a patched release reported, not fixed) |
| Board, row `update-vulnerable-dependencies`; R91 handoff via the board | `npm run build` failed 4 times with Next.js's `Error [SecurityFatalError]` (16.4.0 flagged), passing on rerun; latest 2026-11-11 (R91 Round 1). `next dev` suggested 16.4.5 earlier |

## 1. Today (verified in `package-lock.json`, `develop`, 2026-11-11)

- `next` 16.4.0 is the only vulnerable **production** package (`dependencies`, exact pin). Every other vulnerable package is marked `"dev": true` in the lock file.
- `eslint-config-next` 16.4.0 (exact pin) pulls `@next/eslint-plugin-next` 16.4.0 and `typescript-eslint` `^8.56.0` (installed 8.70.1).
- `eslint` 9.39.5 (`^9`).
- The app-shell requirement of line 473 is **not met on `develop` today**: `next` 16.4.0 carries a critical advisory.
- Exposure (code read, not exploited): `next.config.ts` builds a standalone server, so the Image Optimization endpoint ships (`src/pages/home/ui/HomeHero.tsx` uses `next/image` with a PNG); no `"use server"`, `"use cache"` or `cacheComponents` in `src/`. GHSA-2464 (RCE) needs glibc Linux and SVG; whether the Docker image is glibc-based is **unverified**.
- Neither active branch (`feature/add-register-landing`, `feature/restyle-taxonomy-badge-toggles`) changes `package.json` or `package-lock.json` (`git diff --name-only develop...<branch>`, 2026-11-11): no merge conflict expected on those files.
- The board recorded 14 vulnerabilities (10 moderate) from `npm ci` on 2026-11-06; the audit of 2026-11-11 reports 13 (9 moderate). The missing moderate one is not identified (**unverified**); the audit of 2026-11-11 is the source of this summary.

## 2. Packages: current → target

Severity is the audit's. "Checked" = read on the npm registry or the GitHub advisory by the design lead on 2026-11-11.

| # | Package | Direct / transitive (dev or prod) | Current | Target | Severity | Patched from (advisory) | Why | How it moves |
|:-:|---|---|---|---|---|---|---|---|
| 1 | `next` | Direct, `dependencies` (prod), exact pin | 16.4.0 | **16.4.6** (exact pin) | critical (3 advisories: GHSA-2464-fhr4-w9xw RCE in Image Optimization with SVG on glibc Linux; GHSA-p3m5-59mp-jv5r DoS with Server Actions; GHSA-673q-mjm6-r5xr RCE in `use cache` returning typed arrays) | 16.4.1 (checked) | Clears the critical advisory; restores app-shell's line-473 requirement; expected to end the `SecurityFatalError` build failures. 16.4.6 is npm's `latest` (checked) and the version the audit names | `package.json` pin edited (outside the stated range, so not by `npm audit fix`) |
| 2 | `eslint-config-next` | Direct, `devDependencies`, exact pin | 16.4.0 | **16.4.6** (exact pin) | — (not flagged) | — | Moves with `next` (same version, as in `upgrade-next-16-4`). 16.4.6 keeps `typescript-eslint ^8.56.0` and peer `eslint >=9.0.0` (checked): no ESLint 10 | `package.json` pin edited |
| 3 | `@next/eslint-plugin-next` (and `@next/env`, `@next/swc-*`) | Transitive of 1 and 2 | 16.4.0 | 16.4.6 | — | — | Pinned by `next` / `eslint-config-next` 16.4.6 (checked) | Lock file |
| 4 | `vitest` | Direct, `devDependencies`, `^5.0.2` | 5.0.2 | ≥ 5.0.3 within `^5.0.2` (npm's `latest` is 5.1.0, checked) | moderate (depends on 5) | 5.0.3 | Pulls the patched `@vitest/mocker` (vitest pins it exactly) | `npm audit fix`, lock file only; range unchanged |
| 5 | `@vitest/mocker` | Transitive of 4 (dev) | 5.0.2 | same as `vitest` | moderate (GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp) | 5.0.3 (checked) | Code injection / path traversal in the test runner's mock registration | Lock file, with 4 |
| 6 | `vite` | Transitive (dev, peer of `vitest` and `@vitejs/plugin-react`) | 8.3.1 | ≥ 8.3.3 within `^8` (npm's `latest` is 8.3.8, checked) | high (launch-editor ×3, GHSA-9jrq-w75r-8gcw and 2 more) | 8.3.3 (checked, GHSA-9jrq) | Dev-server only; `next` does not use Vite (Turbopack) | `npm audit fix`, lock file only |
| 7 | `undici` | Transitive of `jsdom` (dev), `^8.10.2` | 8.11.2 | ≥ 8.12.2 within `^8.10.2` (npm's `latest` is 8.12.4, checked) | high (8 advisories) | 8.12.2 (checked, GHSA-2m5v) | Used only by jsdom in tests | `npm audit fix`, lock file only. Engine `node >=22.19.0` unchanged from 8.11.2 |
| 8 | `zod` | Transitive of `eslint-plugin-react-hooks` ← `eslint-config-next` (dev), `^3.25.0 \|\| ^4.0.0` | 4.6.5 | ≥ 4.6.6 (npm's `latest` is 4.6.7, checked) | high (GHSA-mrhx-c7xc-m3w5) | 4.6.6 (checked) | Lint-time only | `npm audit fix`, lock file only |
| 9 | `minimatch` (nested under `@typescript-eslint/typescript-estree`) | Transitive (dev) ← `typescript-eslint` ← `eslint-config-next`; required `^10.2.2` | 10.2.6 | **none available in range**: patched only from 11.0.1 (checked) | moderate (GHSA-g3hv-75wg-m249, DoS) | 11.0.1 | Lint-time only; patterns come from the project's own config | See Open 2 |
| 10 | `typescript-eslint`, `@typescript-eslint/{parser,eslint-plugin,type-utils,utils,typescript-estree}` | Transitive (dev) of 2 | 8.70.1 | **8.72.3 or later, not yet released**: npm's `latest` is 8.72.2, still `minimatch ^10.2.2`; the canary 8.72.3-alpha.7 requires `minimatch ^11.0.1` (checked) | moderate ×6 (via 9) | first stable release with `minimatch ^11.0.1` | Same as 9 | See Open 2 |

Totals: 1 + 2 (rows 4–5) + 1 (row 6) + 1 (row 7) + 1 (row 8) + 7 (rows 9–10) = 13, matching the audit (computed by the design lead).

**Conflict with the audit text (computed):** the audit says the `minimatch` chain has a "fix available via `npm audit fix`", but no stable `typescript-eslint` release accepts a patched `minimatch` as of 2026-11-11. Expected after `npm audit fix`: rows 4–8 fixed, rows 9–10 still reported (6 + 1 moderate), unless 8.72.3 ships before the apply. **Unverified** until the build runs it.

## 3. Decisions settled in this draft (criterion B, citing the source)

- **D1 — Exact pins for `next` and `eslint-config-next`, same version.** Source: `package.json` pins both exactly; precedent `upgrade-next-16-4` proposal ("keeping the exact-version pins"). No new decision.
- **D2 — Range dependencies move only in the lock file.** `vitest ^5.0.2` and the transitive packages are fixed by `npm audit fix` without `--force`; `package.json` ranges stay. Source: precedent `upgrade-next-16-4` task 1.1. No range is widened.
- **D3 — ESLint stays on v9.** Checked: `eslint-config-next` 16.4.6 peer `eslint >=9.0.0`; `typescript-eslint` 8.72.x peer `^8.57.0 || ^9.0.0 || ^10.0.0`; `eslint-plugin-import` peer stops at `^9.7`. No fix in rows 1–10 requires ESLint 10. Source: `AGENTS.md` → Dependencies.
- **D4 — No dependency added or removed; no behaviour change.** What users see, API requests, `proxy.ts`, the security headers and the CSP stay the same. No new texts, tokens, screens or tests. Source: precedent; nothing in the advisories requires a code change (the project does not use the affected Server Action / `use cache` features).
- **D5 — The apply reads the Next.js upgrade notes 16.4.1–16.4.6** under `node_modules/next/dist/docs/` and applies only mechanical renames; any deprecation needing more is a question, not a change. Source: `AGENTS.md` Next.js block; precedent task 1.2.
- **D6 — Order: merges after R91** (board). No package-file conflict with R91 or the badge-toggles branch (section 1).

Not applicable to this change (criteria A, C, D and §1 items): components, tokens and contrast, responsive behaviour, layout and spacing, texts, contract operations (none consumed), visual reference (no screen changes).

## 4. Requirements for propose

- `app-shell`: the existing requirement "No known high or critical framework advisory" (spec line 473) already states the end state for production dependencies; the change makes `develop` meet it again. Whether the spec delta also covers development dependencies is Open 1.
- `package.json`: `next` and `eslint-config-next` → `16.4.6`. `package-lock.json`: regenerated by `npm install` and `npm audit fix` (no `--force`).

## 5. Checks to keep green (build, after the last task)

- `npm ci`, `npx next typegen`, `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build` (twice, both must pass: the `SecurityFatalError` was intermittent), `npm audit --omit=dev` (expected: no advisory) and `npm audit` (expected: no critical or high; only rows 9–10 left, per Open 2).
- `npm run test:qa`: recommended though this is not a refactor (dependency change touching the test runner; Open 4).
- Browser check by Product owner before archive: home page (the `next/image` hero), sign-in popup, one form submission. Recommended, not required by rule.

## 6. Open — Product owner's

1. **Spec delta scope.** The app-shell requirement covers only production dependencies; `next` is the only production package here.
   - Options: **A.** No new requirement; the architect restates the existing requirement unchanged with a scenario naming 16.4.6's audit result (only if `openspec validate --strict` accepts it; **unverified**). **B.** Widen the requirement to every installed dependency for high and critical severity (dev included); moderate stays report-only. **C.** Widen to every severity, dev included (fails today because of Open 2).
   - Recommendation: **B.** Rows 6–8 are high-severity dev tooling the requirement does not catch today; B is satisfiable now (computed from section 2), C is not. Source: spec line 473; precedent proposal "Modified Capabilities".
   - Blocks propose: **yes** (the architect cannot write the delta without it).
   - **Answer (orchestrator, approval delegated by Product owner, 2026-11-11): B.**
2. **The `minimatch` / `typescript-eslint` chain (rows 9–10, 7 moderate, dev only), no stable fix.**
   - Options: **A.** Accept and report: leave it for the next release of `typescript-eslint` (8.72.3+); the apply re-checks `npm view typescript-eslint version` and takes it via `npm audit fix` if released by then. **B.** Add an `overrides` entry in `package.json` forcing `minimatch@^11.0.1` under `@typescript-eslint/typescript-estree` (outside its declared `^10.2.2`; risk of breaking lint; needs approval as a dependency change). **C.** Use the canary `typescript-eslint@8.72.3-alpha.x` (prerelease in the toolchain).
   - Recommendation: **A.** Moderate DoS, lint-time only, patterns come from the project's own config; same treatment as the dev-only `braces` advisory in `upgrade-next-16-4`. Source: npm registry (2026-11-11), GHSA-g3hv-75wg-m249, precedent Propose status.
   - Blocks propose: **yes** (it decides whether a task touches `package.json` `overrides` and what the audit check expects).
   - **Answer (orchestrator, approval delegated by Product owner, 2026-11-11): A.**
3. **Approval of the package list.** Approve rows 1–2 (`next` and `eslint-config-next` 16.4.0 → 16.4.6, exact pins) and rows 4–8 by `npm audit fix` within current ranges (lock file only).
   - Options: **A.** Approve as listed. **B.** `next` only to 16.4.1 (lowest patched; earlier `next dev` suggested 16.4.5). **C.** Approve and also allow the latest in-range minor (`vitest` 5.1.0) explicitly.
   - Recommendation: **A.** 16.4.6 is the audit's and npm's latest 16.4.x; the board's 16.4.5 suggestion is older. `npm audit fix` may pick `vitest` 5.1.0 (in range); A accepts whatever in-range version it picks, recorded in the propose status.
   - Blocks propose: **yes** (`AGENTS.md` → Dependencies).
   - **Answer (orchestrator, approval delegated by Product owner, 2026-11-11): A.** This is the explicit dependency approval `AGENTS.md` → Dependencies requires: `next` and `eslint-config-next` 16.4.0 → 16.4.6 (exact pins), and rows 4–8 through `npm audit fix` within their current ranges (whatever in-range versions it picks, recorded in the propose status). No `--force`, no `overrides`, ESLint stays on v9.
4. **Workflow weight.** It is a `Change` (security), yet it adds no behaviour or tests.
   - Options: **A.** Traditional workflow, short: propose with `design.md` skipped (as the precedent), one apply task + full checks, verify, archive on Product owner's request. **B.** Product owner orders it fast lane (`AGENTS.md` → Fast lane by Product owner's order), base `qa`.
   - Recommendation: **A**, launched right after R91 merges: the build failures make it urgent, and `qa` would delay it to the next refactoring round. Also run `npm run test:qa` before verify (dependency of the test runner changes).
   - Blocks propose: no.
   - **Answer (orchestrator, approval delegated by Product owner, 2026-11-11): A, but launched now, not after R91.** Product owner made this change the highest priority: it goes to `develop` first; R91 and the badge-toggle change take `develop` in at their merge. `npm run test:qa` runs before verify.

## 7. Risks and unverified points

- Whether 16.4.6 ends the intermittent `SecurityFatalError` (expected: the online check flags 16.4.0 only) — unverified until `npm run build`.
- Breaking or deprecation notes in 16.4.1–16.4.6 — not read (they live in `node_modules/next/dist/docs/` after the install).
- What `npm audit fix` will choose exactly (for example `vitest` 5.0.3 or 5.1.0) — unverified; npm was not run.
- The Docker base image (glibc or musl) for GHSA-2464 exposure — unverified.
- The missing moderate vulnerability between 2026-11-06 (14) and 2026-11-11 (13) — not identified.

## Review log

- **2026-11-11 — generated (design lead).** Drafted from Product owner's `npm audit` of 2026-11-11, `package.json` and `package-lock.json` on `develop`, the npm registry and GitHub advisories, app-shell spec line 473 and the archived `upgrade-next-16-4`. Settled D1–D6 by precedent and the `AGENTS.md` rules (no new decision). Found that no stable release fixes the `minimatch` chain, contrary to the audit's "fix available" text (Open 2). Found that `develop` currently fails app-shell's line-473 requirement (finding for the orchestrator; resolved by this change). Open: 4 points, 3 block propose.
- **2026-11-11 — approved (orchestrator, approval delegated by Product owner the same day).** 1 = B, 2 = A, 3 = A, 4 = A launched at once (highest priority).

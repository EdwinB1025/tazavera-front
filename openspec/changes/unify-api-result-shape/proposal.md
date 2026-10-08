Type: Refactor (fast lane)

# Proposal

## Why

The request functions of the `api` segments report not-found and failure in several shapes: a `{ status: "found" | "not-found" | "failed" }` union, a rejection, a `{ ok, status }` pair, a raw `Response` the caller reads, string outcomes (`"success" | "stepUp" | "error"`, `"ok" | "forbidden" | "failed"`, `"created" | "error"`) and UI states built inside the api segment (`{ state: "success" | "empty" | "error" }`, `ListState`). Every consumer handles errors its own way, and the planned per-field `422` errors (R8) would land in all of them (backlog R35, after R24 and R25).

## What Changes

- New `src/shared/api/result.ts`: one discriminated result type, `ApiResult<T, K>`, `{ ok: true; data: T } | { ok: false; kind: K | "error" }`, where `K` names the failures a consumer tells apart today (`"not-found"`, `"forbidden"` for the `403` step-up or refusal, `"conflict"` for `409`). It is exported as a type from `@/shared/api`.
- Every request function under `src/**/api/` (except the OAuth token and authorize flows, see design.md D6) resolves to an `ApiResult` and never rejects: the public reads of offering-catalog (coffees, taxonomies, offerings, offering, coffee shops, coffee shop, public evaluations, name searches), the specialist's evaluation calls, the management and location requests, and the account, registration and contact requests.
- Every consumer branches on `ok` and `kind` instead of the old shapes. UI states (`empty`, `ready`, `step-up`…) are built by the consumers, never by an `api` module.
- The combobox searches keep the shared Combobox's contract: their read returns an `ApiResult`, and a failure becomes the rejection that shows the failure row (design.md D3).
- What users see (states, texts, accessible names, the message per status) and the requests sent to the API (method, path, query, headers, body, request options) stay the same.

## Non-goals

- No change to the request client (`client.ts`), the token exchange and refresh (`tokens.ts`) or the authorize and callback flow (`authorize.ts`).
- No new outcome per status: no per-field `422` errors (R8), no new message.
- No anticipation of the array query parameters (`name[]`) of the offering facets or of the contact and location creation leaving step-up.
- No new tests. Existing tests change only where they assert or mock a result's shape (design.md D7); what each scenario checks stays the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: adds the structural property that every API request function of the front reports its outcome in one shared result shape, with requests and UI states unchanged.

## Impact

- Code: `src/shared/api/result.ts` (new), `src/shared/api/index.ts`, `src/shared/api/coffees.ts`; the `api` modules of `entities/offering`, `entities/coffeeshop`, `entities/taxonomy`, `entities/evaluation`, `features/offering-facets`, `features/offering-management`, `features/location-management`, `features/user-account`, `widgets/offering-list`, `widgets/coffeeshop-list`; and their consumers (design.md D2).
- Tests: the shape-only updates of design.md D7. QA copies that mock or assert the old shapes go stale and are listed in the final report; they are not edited.
- APIs, dependencies: none.

## Propose status

- **Change-id:** unify-api-result-shape
- **Date:** 2026-10-08
- **`openspec validate unify-api-result-shape --strict`:** valid
- **Backlog entry resolved:** R35 — Unify the API result shape
- **Resolved:** the result type (design.md D1, type-only so the existing mocks of `@/shared/api` stay valid), the inventory and the target shape of every function (D2), the combobox searches (D3), the raw-`Response` functions (D4), the UI-state types moving to the consumers (D5), the scope boundary (D6), the shape-only test updates (D7) and the commit plan, one commit per capability (D8).
- **Open:** nothing.

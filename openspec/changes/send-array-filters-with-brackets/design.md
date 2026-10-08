# Design

## Context

See proposal.md — Why. The AUT finding and Product owner's decision of 2026-10-08 (option a) replace the design folder (fast lane). No route, facet, URL key or error presentation changes.

## Goals / Non-Goals

**Goals:** the offerings request reaches the API with every array filter in the bracketed form PHP reads as an array.

**Non-Goals:** see proposal.md — Non-goals.

## Decisions

- **D1 — Which keys get brackets.** The six array query parameters of `GET /offerings`: `cataRef`, `fragranceCata`, `aromaCata`, `flavorCata`, `aftertasteCata`, `mouthfeelCata` (Product owner's list; they are the `string[]` query parameters of `listOfferings` in the current contract). `fetchOfferings` keeps them in one set next to its query building. A key of that set is sent as `<key>[]` once per value, whether the query holds it as one string or as an array; every other key is sent as before. Values and their order are unchanged.
- **D2 — Where and how.** The shared request client (`publicRequest`) takes a ready path and builds no query; the query string of the offerings request is built in `fetchOfferings` with `URLSearchParams`, and that building is reused: only the appended key changes. `URLSearchParams` percent-encodes the brackets (`cataRef%5B%5D=01JREFA`); PHP decodes the key before parsing it, so the API reads `cataRef[]` as an array. The front's URL and the query record (`OfferingsQuery`) keep the plain keys.
- **D3 — Other requests.** `GET /evaluations` and `GET /coffeeshops` and the name searches send only scalar values, and the contract declares no array query parameter for them; they stay unchanged.

## Risks / Trade-offs

- [The contract refresh renames the `listOfferings` query names to `cataRef[]` etc.] → `contracts/openapi.yaml` and `schema.ts` are refreshed by Product owner in a follow-up; the allow-list of `buildOfferingsQuery` and its test name the plain keys, and that follow-up decides how they map.
- [The QA copy of `offerings.test.ts` asserts the plain form] → it is reported as stale; QA tests are never edited during a change.

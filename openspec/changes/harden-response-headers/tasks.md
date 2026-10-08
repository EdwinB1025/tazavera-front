# Tasks

## 1. Response security headers

- [x] 1.1 In `proxy.test.ts`, add one test to a new `describe` for the response security headers: a page response (`https://tazavera.test/es/about`, `NEXT_PUBLIC_API_URL` stubbed) carries `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`. Expected: the new test fails (the headers are missing) and every existing test passes.
- [x] 1.2 In `proxy.ts`, set the three headers of 1.1 on the page, locale-redirect and `/callback` responses, keeping the Content-Security-Policy, its nonce, the Cross-Origin-Opener-Policy and the asset pass-through exactly as they are. Expected: `npx vitest related proxy.ts --run`, `npx tsc --noEmit` and `npm run lint` pass.
- [x] 1.3 In `next.config.ts`, set `poweredByHeader: false`. No unit test (the header comes from the framework server, not from `proxy.ts`). Expected: `npx tsc --noEmit` and `npm run lint` pass; after `npm run build`, a request to the production server (`npm run start`) for `/es` returns no `X-Powered-By` header and carries the three headers of 1.1.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes with one test more than on `origin/qa`; `test:qa` fails only on the 9 stale QA copies from `refine-offering-facets-aut` (design D6); typecheck and lint report no errors; the build succeeds.

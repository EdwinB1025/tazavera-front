# Tasks

## 1. Standalone build output

- [x] 1.1 In `next.config.ts`, add `output: "standalone"` to `nextConfig`, keeping `poweredByHeader: false` and the next-intl plugin (`createNextIntlPlugin("./src/shared/lib/i18n/request.ts")`) exactly as they are. No test is added or changed. Expected: `npx tsc --noEmit` and `npm run lint` pass (0 errors); `npm run build` succeeds and emits `.next/standalone/server.js`.
- [ ] 1.2 Runtime check (nothing from it is committed): after `npm run build`, copy `.next/static` to `.next/standalone/.next/static`; start `node .next/standalone/server.js` in the background with `PORT=3100` and `API_INTERNAL_URL=http://127.0.0.1:9`; request `/es`, `/en` and `/ca`. Expected: each answers 200 with HTML containing a translated string from `messages/<locale>/` (one per locale), and the page's CSS file under `/_next/static/` answers 200. If a locale page fails because the message catalogs are not in the standalone output, add `outputFileTracingIncludes` for `messages/**` to the same `next.config.ts` (its own commit, no other change) and repeat the check. Stop the server afterwards.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: both suites pass with the same file and test counts as on `origin/qa`; typecheck reports no errors; lint reports 0 errors (the known warning in `qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx` stays); the build succeeds.

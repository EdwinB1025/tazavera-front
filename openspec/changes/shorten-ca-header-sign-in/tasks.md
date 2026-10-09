# Tasks

## 1. Shorten the Catalan header sign-in label (app-shell)

- [ ] 1.1 In `messages/ca/shell.json`, set `signIn` to `Entra`. No other key, locale or file changes; no test is added.

  Verify: `npx tsc --noEmit` and `npm run lint` report no errors. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.

# Handoff — route-api-web-pages-through-front

## Session 2026-10-12 — design summary draft (local design lead)
Summary: backlog entry R74 (Product owner, 2026-10-12: traditional workflow, highest priority, last change before the Playwright suite; the design lead decides the open points a–d). Design lead drafted `design-summary.md` (`Status: draft — pending Product owner review`); the orchestrator committed it on `develop`. Stopped because: waiting for Product owner's approval. MVC reachable: not needed (no new screen).

### Agent feedback
Decisions in the draft: D1 explicit list of forwarded paths (not a prefix); D2 forwarding in `proxy.ts` with `NextResponse.rewrite`; D3 `X-Forwarded-Host/Proto/Port` from `NEXT_PUBLIC_APP_URL`, no `Location` or body rewriting; D4 the second base URL is `NEXT_PUBLIC_APP_URL` behind one helper (moves: `authorize.ts`, `UserMenu.tsx:123`, `SecuritySection.tsx:43/:56`, `PasswordForm.tsx:92`); D5 server-only `API_INTERNAL_URL` with fallback; D6 front headers unchanged on its own pages, forwarded responses served as the API sends them; D7 cookies move to the front's origin (one extra login after the switch); D8 OAuth issuer stays the API base; D9 access from another device is an environment matter (replaced by option A below); D10 same-origin risk accepted and recorded. Supersedes the 2026-10-09 log entry that called `API_INTERNAL_URL` a deploy matter. Ten scenarios with their test files; nine browser checks.

### Deferred to Product owner (none blocks propose)
#### Q1 — API `APP_URL`
- Recommendation: the front's public origin (passkeys take their domain from it; otherwise only the passkey browser check fails).
#### Q2 — `TRUSTED_PROXIES`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`
- Recommendation: trust the front's address (`127.0.0.1` locally, the compose subnet in Docker); `SESSION_DOMAIN` unset; secure cookies on.
#### Q3 — Tunnels
- Recommendation: a second ngrok endpoint for the API, used as `NEXT_PUBLIC_API_URL`.
#### Q4 — `X-Powered-By` on forwarded responses
- Recommendation: `expose_php=Off` in the API image.
#### Q5 — Email-verification link built on the API's address
- Recommendation: a later backlog entry to build it on the front's address; not part of this change.

### Product owner's answers (2026-10-12)
- **Setup:** the build environment is a single server with one public entry point (one ngrok URL). It is the only environment the design considers (Product owner, 2026-10-12).
- **D10 revised — option A:** the front is the only door. It forwards the API's web routes **and** `/oauth/token` and every JSON call (the front calls the API under a path prefix and strips it when forwarding; no API code change). `NEXT_PUBLIC_API_URL` becomes the front's own origin. This replaces R74 end-state point 2 and the "JSON and `/oauth/token` not forwarded" part of D10.
- Q1: `APP_URL` = the public front URL (accepted).
- Q2: trust the front's address; `SESSION_DOMAIN` unset; secure cookies on (accepted).
- Q3: not needed (one tunnel, one URL).
- Q4: `expose_php=Off` in the API image (accepted).
- Q5: solved by Q1 (the link is built on `APP_URL`, opens on the front, which forwards `/email/verify`); no backlog entry.
- Next: the design lead updates the summary (end-state point 2, D4, D9, CSP, scenarios); then Product owner's approval.

### Summary updated for option A (design lead, 2026-10-12)
D1 two forwarded groups (`/api/*` with the prefix stripped → `/oauth/token` and JSON; the web list unchanged), checked before assets and locale routing; D4 `NEXT_PUBLIC_API_URL` keeps its name, value `{NEXT_PUBLIC_APP_URL}/api`; D5 `API_INTERNAL_URL` required, no fallback (502 without it); D6 `connect-src 'self'` + Nominatim; D7 same-origin, no CORS; 11 scenarios, 11 browser checks.

#### Q6 — How to sign in without ngrok (closed: deployment matter)
- Product owner, 2026-10-12: how the front is served over https (ngrok, Caddy) is a deployment change, not part of R74. The summary states only the requirement: a production build signs in only when the front is served over https. The deployment documentation decides how.
- Context: the token endpoint is now on the front's origin, so a production build signs in only when the front is served over `https` (ngrok gives it). A local production build on `http://localhost:3000` or the Docker stack without ngrok cannot sign in; Caddy no longer serves the browser. / Options: (A) every end-to-end check through ngrok, Caddy leaves the stack; (B) Caddy in front of the front for local and Docker checks; (C) accept `http` on `localhost` in the token exchange (changes security code). / Recommendation: A (B only if checks without ngrok are wanted; not C). `npm run dev` is unaffected.

### API callback registration (orchestrator's read-only check of the API, 2026-10-12)
- The OAuth front client's `redirect_uris` are written by `FrontClientSeeder` as `{FRONT_URL}/callback`. Product owner: the seeder is re-run once the API configuration is in place, so the client gets `https://<public origin>/callback`. Added to the summary (§0, browser check 3).
- Product owner asked for a summary of the decided setup for the deploy assistant to update the deployment documentation (given in chat, 2026-10-12).

### Local test setup (Product owner, 2026-10-12)
- Local tests serve the front over https through Caddy (a site in front of the front, in the local Caddyfile, Product owner's file); Caddy takes no role in the deploy. The browser checks of R74 run on that local https origin.

### Approval and propose launch (2026-10-12)
- Product owner approved the summary in the orchestrator session ("I approve") and asked the orchestrator to commit it and run the rest in the cloud: `docs: approve design summary for route-api-web-pages-through-front` (`4e02d8c3`), committed by the orchestrator at the Product owner's request (deviation from step 4, where Product owner commits the approval himself).
- Branch `feature/route-api-web-pages-through-front` created on origin from `develop` `4e02d8c3`.
- Propose (step 6) in the cloud: `trig_011ACFx3DJHxHoTy1uTFHWCD`, 08:37 UTC, architect only, prompt written by the design lead; target `claude/route-api-web-pages-through-front-propose`.
- **Next session (orchestrator):** list the routine's runs; review the branch (commit format, one commit per capability, `validate --strict`, `## Propose status`, departures from the summary in the final report); fast-forward `feature/route-api-web-pages-through-front`; then Product owner's artifact review (step 7) before apply. The session was closed by Product owner after the launch: no watch is running.

### Open until the browser checks
- Whether Next.js adds its own `X-Forwarded-*` after the proxy's (check 1: every `Location` stays on the front's origin).
- Whether Laravel's CSRF check passes with the forwarded host (check 5: no `419` on the security pages).

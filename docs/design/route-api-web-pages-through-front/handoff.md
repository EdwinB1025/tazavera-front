# Handoff — route-api-web-pages-through-front

## Session 2026-10-12 — design summary draft (local design lead)
Summary: backlog entry R74 (Product owner, 2026-10-12: traditional workflow, highest priority, last change before the Playwright suite; the design lead decides the open points a–d). Design lead drafted `design-summary.md` (`Status: draft — pending Product owner review`); the orchestrator committed it on `develop`. Stopped because: waiting for Product owner's approval. MVC reachable: not needed (no new screen).

### Agent feedback
Decisions in the draft: D1 explicit list of forwarded paths (not a prefix); D2 forwarding in `proxy.ts` with `NextResponse.rewrite`; D3 `X-Forwarded-Host/Proto/Port` from `NEXT_PUBLIC_APP_URL`, no `Location` or body rewriting; D4 the second base URL is `NEXT_PUBLIC_APP_URL` behind one helper (moves: `authorize.ts`, `UserMenu.tsx:123`, `SecuritySection.tsx:43/:56`, `PasswordForm.tsx:92`); D5 server-only `API_INTERNAL_URL` with fallback; D6 front headers unchanged on its own pages, forwarded responses served as the API sends them; D7 cookies move to the front's origin (one extra login after the switch); D8 OAuth issuer stays the API base; D9 demo is an environment matter; D10 same-origin risk accepted and recorded. Supersedes the 2026-10-09 log entry that called `API_INTERNAL_URL` a deploy matter. Ten scenarios with their test files; nine browser checks.

### Deferred to Product owner (none blocks propose)
#### Q1 — API `APP_URL`
- Recommendation: the front's public origin (passkeys take their domain from it; otherwise only the passkey browser check fails).
#### Q2 — `TRUSTED_PROXIES`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`
- Recommendation: trust the front's address (`127.0.0.1` locally, the compose subnet in Docker); `SESSION_DOMAIN` unset; secure cookies on.
#### Q3 — Demo tunnels
- Recommendation: a second ngrok endpoint for the API, used as `NEXT_PUBLIC_API_URL`.
#### Q4 — `X-Powered-By` on forwarded responses
- Recommendation: `expose_php=Off` in the API image.
#### Q5 — Email-verification link built on the API's address
- Recommendation: a later backlog entry to build it on the front's address; not part of this change.

### Open until the browser checks
- Whether Next.js adds its own `X-Forwarded-*` after the proxy's (check 1: every `Location` stays on the front's origin).
- Whether Laravel's CSRF check passes with the forwarded host (check 5: no `419` on the security pages).

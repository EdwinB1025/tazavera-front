# Backlog — refactor candidates

Augusto adds entries; agents read the file. The architect checks it before /opsx:explore or /opsx:propose and flags any entry the change would affect, and removes the whole section of an entry only when archiving the change that resolves it.

One section per candidate, in this format:

## R<n> — <title>

- **Duplicated:** <code, classes or helpers that are repeated>
- **Where today:** <files>
- **Why it pays off now:** <upcoming change that would add copies>
- **Owning capability:** <capability>
- **Proposed change:** <change-id>
- **Open decision (Augusto):** <options, or "none">
- **Status:** proposed | accepted | deferred
- **Affects:** <changes that should wait for it or reference it>

## R1 — End-to-end test of "Choosing a locale" (verify W1, deferred here by the product owner)

- **Duplicated:** none
- **Where today:** `src/app/shell/ShellChrome.tsx:35-39` (the locale swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op)
- **Why it pays off now:** the shell's one navigation interaction is verified only up to the callback; every later change that switches locale rides on it
- **Owning capability:** app-shell
- **Proposed change:** none yet — belongs to the pre-deployment Playwright suite
- **Open decision (Augusto):** none
- **Status:** deferred
- **Affects:** none

## R2 — Tighten the `/callback` matcher exclusion (verify S2)

- **Duplicated:** none
- **Where today:** `proxy.ts:97` (`matcher: ["/((?!callback).*)"]`)
- **Why it pays off now:** the lookahead excludes any path merely starting with `callback` (e.g. `/callbackfoo` skips the default-locale redirect and 404s in place); `add-auth` lands `/callback` next and the matcher is the seam
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** tighten to `callback(?:/|$)` or accept the over-exclusion
- **Status:** proposed
- **Affects:** `add-auth`

## R3 — Cover the `/callback` exclusion and the `connect-src` fallback (verify S3)

- **Duplicated:** none
- **Where today:** `proxy.test.ts` (no case for the matcher exclusion or the unset-`NEXT_PUBLIC_API_URL` fallback), `proxy.ts:41-58`
- **Why it pays off now:** two ruled edge cases rest on review only; `add-auth` touches the same proxy seam for `/callback`
- **Owning capability:** app-shell
- **Proposed change:** none
- **Open decision (Augusto):** none
- **Status:** proposed
- **Affects:** `add-auth`
## R5 — Single active-locale derivation in `src/features/auth` (add-auth, Build report at 5.2)

- **Duplicated:** the active-locale derivation from the path (first segment, `isSupportedLocale` check, `DEFAULT_LOCALE` fallback)
- **Where today:** `src/features/auth/api/authorize.ts` (`activeLang`), `src/features/auth/model/session.ts` (`localeRoot`)
- **Why it pays off now:** step-up (6.x) and the callback's return route (8.x) also need the active locale; a third copy is likely
- **Owning capability:** auth (or `src/shared/lib/i18n` if another slice needs it)
- **Proposed change:** none
- **Open decision (Augusto):** keep it inside `src/features/auth` or move it to `src/shared/lib/i18n`
- **Status:** proposed
- **Affects:** `add-auth`

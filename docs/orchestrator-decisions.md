# Orchestrator decisions log

## 2026-10-05 — add-auth
- Decision: the session seam of `src/app/shell` is a new `"use client"` `SessionShell.tsx` that calls `useSession()` and renders `ShellChrome` and the sidebar region; `AppShell.tsx` stays a Server Component that resolves the catalog texts and passes them, and the `session?` override, to `SessionShell`. Text composition (catalog and locale) stays in `AppShell.tsx`.
- Why: Product owner's answer to handoff Q12–Q14, corrections.md round 2 of add-auth (`dd8b126`).
- Affects: refine-app-header (it composes the language trigger's name in `AppShell.tsx`, design.md D6; expect a merge overlap in that file).

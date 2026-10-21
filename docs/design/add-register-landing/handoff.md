# Handoff — add-register-landing

## Session 2026-10-21 — Summary (draft)
Summary: Product owner asked (2026-10-21) for a "Register" button shown only to anonymous visitors, a registration landing that explains registering as a specialist or as a coffee shop, and the removal of the registration links from the initial landing pages; the landing and the button are only for unauthenticated users. Put on the board as `Type: Change` (traditional workflow 3a, step 1) and in the backlog as R91; the design lead drafted the summary (step 2). Stopped because: the summary waits for Product owner's answers and approval (steps 3–4). MVC reachable: yes (read only; it has no registration chooser).

### Agent feedback
Design lead (draft, uncommitted until this commit): landing under the register slice with a heading block and two `Card layout="stacked"` option cards (one column, two from 768px, 1.5rem gap), each with a `RouteButton` `action-1` to its form; header `RouteButton` `nav-button` before "Sign in", anonymous only; links and six `landing` catalog keys per locale removed; new keys `shell.register` and eight `account.registerLanding*`; no new token, dependency or contract operation. Could not run Bash or PowerShell: contrast not re-measured (every pair already registered in the theme matrix), header widths at 375/768 px are estimates, no captures. MVC found under `C:/Programing/Full Stack/Sprint5/tazavera-app`.

### Decisions taken
#### D1 — The landing's session gate is the existing register* rule
- Context: the request says the landing and the button are only for unauthenticated users. / Decision: the landing reuses the gate of the register forms (loading status while the session resolves; an authenticated user is sent to `/{locale}` by client-side navigation). / Why: decisions log 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (last sentence) and user-account "Registration routes"; `RegisterClient.tsx:43-51`. / Result: summary §4; the design lead's open point "do the forms also redirect" closed (they already do).

#### D2 — Links removed from both the entry page and About us (summary Open 4 = A)
- Context: the request says "the links in the initial landing pages"; both pages hold the two registration links. / Decision: remove both groups. / Why: the request as written (plural). / Result: summary Open 4 stays listed with A; no edit to the summary.

#### D3 — Specialist card first (summary Open 6 = A)
- Context: card order. / Decision: specialist, then coffee shop. / Why: order of the request ("register as specialist or register as coffeeshop"). / Result: summary Open 6 stays listed with A.

### Closed for review
(none)

### Artifact fixes
(none — no artifacts yet)

### Fixes and coverage sent to the Build
(none)

### Deferred to Product owner
#### Q1 — Route of the landing (summary Open 1)
- Question: where does the landing live? / Why deferred: changes routes and the user-account spec paths. / Options: A. `/{locale}/register` becomes the landing and the specialist form moves to `/{locale}/register/specialist`; B. a new route (e.g. `/{locale}/join`), forms unchanged. / Recommendation: A — symmetric URLs, the landing stays under the existing register* redirect rule, nothing in the auth flow holds the route (verified by the design lead). / Blocks: propose.

#### Q2 — The header button on small screens (summary Open 2)
- Question: the signed-out header has no room at 375 px for a second button. / Why deferred: visible behaviour. / Options: A. button from 768 px; below it, a "Register" entry in the existing navigation menu (anonymous only); B. icon-only button below 768 px (likely overflows); C. shorter labels; D. one account menu (new component). / Recommendation: A, measured at 768 px in the visual review (from 1024 px if it overflows there). / Blocks: propose.

#### Q3 — Defaults to confirm (summary Open 3, 5, 7–10)
- Question: confirm or change the recommended defaults: button before "Sign in" with the `nav-button` style; new `UserPlus` icon for the menu entry (new icon export, no dependency: needs your yes under "nothing new in the design"); one shared gate piece in the register slice; no "Already have an account?" line; the proposed es/en/ca texts (§8); the forms' Cancel keeps going to the entry page. / Why deferred: wording and one new icon. / Recommendation: accept all. / Blocks: no.

### Final checks
Not run: no code yet.

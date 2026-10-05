# Handoff — add-specialist-evaluations — night of 2026-10-04

## Summary
Tasks done: n/a (explore only). Skipped: none. Stopped because: explore finished; the propose was not run, by instruction (explore only for this change).
MVC reachable: yes (read `resources/css/app.css`).

Shell notes: the explore ran with `opencode run` as written. Inside it, the architect's `dir ... | findstr ...` was denied twice ("Permission denied: shell"); it switched to Glob/Grep and carried on. One of my own chained `git` commands was denied; I re-ran each command on its own. Writing this file was refused twice while Claude Code was in "don't ask" mode; it was drafted in the scratchpad and copied here once that mode was turned off.

Uncommitted by design: this file only. The design summary was not edited (the brief allows that only in the header worktree). Also pre-existing and untouched: `.opencode/agents/architect.md` modified.

## Explore feedback (architect, verbatim summary of its report)

The full raw output is in the Claude Code background-task output file of this session. The report's content, as given:

**State:** `openspec/changes/` is empty; the change exists only as `design-summary.md` (27db1c7). Capabilities `evaluations`, `offerings-catalog`, `offerings-management` are declared in `openspec/config.yaml`; no `specs/evaluations/` yet. Backlog R1–R3 are app-shell items affecting `add-auth`; none affects this change.

**Dependency check (on this branch):**
- `add-app-shell`: done (`/[locale]/manage/*` reserved).
- `add-form-fields`: done (Field, Select, Checkbox, Textarea, Radio).
- `add-auth`: not built (`useSession`, API client, step-up). Blocks all writes.
- `add-landing`: not built (Card, taxonomy Badge, OfferingCard, Evaluate link).
- Filtering change: not named yet. Blocks §7.
- `add-evaluation-scales`: not proposed (bean scale, slider). This is Open 1.

Sections 1–7 match the contract where it checked: write shape `descriptive.roastLevel`, then per-axis `{score, note, cata}` plus `mainTastes`; `affective` per axis plus `defects`; the close 409 matches the §5 completeness rule.

- **E1. `GET /coffees?name=` does not exist in `contracts/openapi.yaml`.** The only `coffeeName` filters are on `GET /coffeeInventory` (coffeeshop role, not usable by a specialist) and `GET /offerings` (public, but it returns offerings, not coffees). The §7 coffee autocomplete has no endpoint in the contract. *(Verified by me: the contract's paths are `/coffeeInventory`, `/evaluations`, `/evaluations/{ulid}`, `/evaluations/{ulid}/close`, `/locations`, `/offerings`, `/offerings/{ulid}`, `/taxonomies`, `/logout`, `/register`, `/user`, `/users/...`. There is no `/coffees`.)*
- **E2. The flat `tastes` read may lose more than "map it back" assumes.** Writes take `cata` on five axes; reads return `{ref, type}`, with the types seen being `aromatics | main_tastes | mouthfeel | defects`. `type: aromatics` probably mixes the fragrance/aroma pair and the flavor/aftertaste pair, and those two selections can differ. Add this to Open 3.
- **E3. Open 1 (absorb scales).** `openspec/config.yaml` puts the bean scale, the intensity slider **and the descriptor chip group** under `form-fields`. The archived form-fields proposal deferred the two scales to `add-evaluation-scales` "same capability". If all three are built here, the change spans `form-fields` and `evaluations`. Add §1 CRUD and §7 filter on top, and it strains the single-implementation-session rule. Architect leans towards a separate `form-fields` change first (scales plus chip group).
- **E4. Open 2 (routes).** These are the lowest risk: `/{locale}/manage/evaluations…` matches app-shell's reserved `/manage/*` and add-landing's Evaluate target. Gap for the design: what `/new` shows when `offering` is missing or unknown.
- **E5. Open 3 (roastLevel/cata on read).** Confirmed: `GET /evaluations/{ulid}` has no `descriptive.roastLevel`, and `PUT` requires it. Side fact: `GET /evaluations/{ulid}` and `GET /evaluations` are `security: []` (public), so the closed read-only view works without a session. *(Verified by me.)*
- **E6. Open 4 (filter fields).** The full query set is `evaluatorId, coffeeId, locationId, city, process, status, scoreMin, scoreMax, orderBy (cupping_score|created_at|status), orderDirection`. The proposed subset is valid in the contract; the coffee autocomplete is the open part (E1).
- **E7. Open 5 (Evaluate link).** Layering problem: `useSession()` will live in `src/features/auth`, and OfferingCard in `src/entities/offering`. An entity cannot import a feature, so the client component cannot live inside the card. The card needs a footer-action slot supplied by its consumer, or the link lives in a feature slot. That touches add-landing's card contract, a shared mechanism.
- **E8. Open 6 (write scope).** Confirmed: the write endpoints name the `specialist` role and no scope; the contract's scope note only mentions `profile:read`/`profile:write`. The same question covers `PUT`, `PATCH …/close` and `DELETE`. The backend must answer.

The architect's suggested first question: Open 1. Ask about Open 3 and Open 6 in parallel, because they need the backend.

## Decisions taken
### D1 — Nothing settled; every open point routed to Augusto
- Context: the explore confirmed the six open points and added E1 (missing `/coffees`), E2 (aromatics merge on read) and E7 (FSD layering of the Evaluate link).
- Decision: I settled none of them. Each point is an API question, a scope or capability choice, a shared mechanism, or is explicitly reserved for Augusto by tonight's instruction. The design summary is unchanged.
- Why: brief §3 ("must defer": API/contract, scope, security, unsure); tonight's task ("the summary's open points and its dependency on the filter change are Augusto's decisions"); AGENTS.md ("If [the contract] looks outdated or incomplete, stop and tell the user").
- Result: no commit.

## Fixes and coverage sent to the Build
None.

## Deferred to Augusto
### Q1 — Absorb `add-evaluation-scales` (Open 1, E3)
- Question: build the bean scale, the intensity slider and the descriptor chip group inside this change, or as a prior `form-fields` change?
- Why deferred: scope; capability ownership (`openspec/config.yaml` lists all three under `form-fields`); reserved for Augusto.
- Options: a) a separate `form-fields` change first (`add-evaluation-scales`, extended with the chip group), then this change; b) absorb all three here (two capabilities, one commit per capability); c) absorb only the scales and keep the chips in their own change.
- Recommendation: a). The config already assigns them to `form-fields`; §4 already records the scale decisions, so nothing is lost; this change stays implementable in one session. It adds one change to the chain.
- Blocks: propose.

### Q2 — Routes (Open 2, E4)
- Question: confirm `/{locale}/manage/evaluations` (list), `/new?offering={ulid}` and `/{ulid}` (edit or view). Also: what does `/new` show when `offering` is missing or unknown?
- Why deferred: reserved for Augusto (open point); the `/new` fallback is a new UI state.
- Options: route set as proposed; for the bad `offering`: a) the 404 page, b) a message with a link to the catalogue, c) redirect to the list.
- Recommendation: confirm the routes as proposed (they match app-shell and add-landing exactly). For a bad `offering`, a) the 404 page: the add-landing link always carries a valid ULID, so this only happens with a hand-typed URL, and it needs no new screen or message text.
- Blocks: propose (routes go in spec.md).

### Q3 — `roastLevel` and cata on read (Open 3, E2, E5)
- Question: will the API return `descriptive.roastLevel` and per-axis cata on `GET /evaluations/{ulid}`, or must the front work around it?
- Why deferred: API/contract change.
- Options: a) backend adds both (the symmetric `EvaluationResource` backlog item), regenerate `contracts/openapi.yaml` and types; b) the front asks again for the roast level when it loads a draft and maps the flat list back; with E2 this cannot tell fragrance/aroma from flavor/aftertaste aromatics.
- Recommendation: a). b) cannot restore the two aromatic pairs separately, so editing a draft would silently merge or lose selections. Ask the backend now: it has the longest lead time. New fact for the spec: reads are public (`security: []`).
- Blocks: propose (edit-draft behaviour), and the edit flow in apply.

### Q4 — Coffee autocomplete has no endpoint (E1)
- Question: §7 relies on `GET /coffees?name=`, which is not in the contract. How does the filter pick a coffee?
- Why deferred: API/contract (AGENTS.md: contract incomplete, stop and tell the user).
- Options: a) backend adds a public `GET /coffees?name=`, then update the contract; b) the autocomplete searches `GET /offerings?coffeeName=` and takes the coffee ULID from the results; c) drop coffee search from the filter in this change.
- Recommendation: a) if the backend can add it soon; otherwise c) and ship the filter with status, score range and order. b) shows duplicates (one coffee across many offerings) and depends on an offering response field the summary has not checked.
- Blocks: §7 coffee field only.

### Q5 — Filter fields and the dependency on the unnamed filter change (Open 4, §7)
- Question: which filter fields does "my evaluations" have, and can this change be proposed before the generic filtering change exists?
- Why deferred: reserved for Augusto (open point and dependency); scope.
- Options for fields: as proposed (coffee, status, score range, order) or a subset. Options for the dependency: a) name and run the filtering change first; b) propose this change now without §7 and add the evaluations filter in a follow-up change; c) build the filter components here (rejected by §7 as written).
- Recommendation: fields as proposed, with coffee subject to Q4. For the dependency, b): CRUD and the form do not need the filter, and the list works without it. The filter follows once the generic change is named and archived. If you prefer a single change, a) first.
- Blocks: propose (§7 is in or out).

### Q6 — Evaluate link layering (Open 5, E7)
- Question: how does the session-aware Evaluate link reach the OfferingCard, since an entity cannot import `useSession()` from a feature?
- Why deferred: shared mechanism that changes add-landing's card contract (AGENTS.md sends shared mechanisms to Product Owner); add-landing is being applied tonight and its decision "never renders" must not change there.
- Options: a) OfferingCard takes a consumer-supplied action slot; the page or widget passes a feature component `EvaluateLink` that reads the session; b) move the link into a widget that wraps the card; c) the card takes a `canEvaluate` boolean computed above it.
- Recommendation: a). It keeps the entity free of auth and fits FSD; the cost is a small change to the card's props, made in this change after add-landing is archived.
- Blocks: propose (the handover requirement).

### Q7 — Scope for evaluation writes (Open 6, E8)
- Question: do `POST`, `PUT`, `PATCH …/close` and `DELETE /evaluations` need `profile:write`?
- Why deferred: security (tokens and the auth flow) and API.
- Options: a) `profile:write` needed, so the form requests the step-up on entry, as for account editing; b) the plain token is enough, no step-up.
- Recommendation: ask the backend and have the contract say it explicitly. Until it does, plan for a): every other write in the contract needs `profile:write`.
- Blocks: propose (entry flow of the form).

### Q8 — Dependencies not yet built on this branch
- Question: `add-auth` and `add-landing` are applied tonight in their own worktrees but are not merged into `develop` or this branch. The propose can reference their designs, but apply cannot start until both are archived and merged.
- Why deferred: merge order belongs to Augusto (no agent merges).
- Options: a) propose now against their design summaries; b) wait for their merge, then propose.
- Recommendation: a) once Q1–Q7 are answered, because the propose only needs their interfaces (`useSession()`, HTTP client, Card, taxonomy Badge). Merge `develop` into this branch before `/opsx:apply`.
- Blocks: apply.

### Known item (record only)
- `/callback` is excluded from `proxy.ts` and gets no Content-Security-Policy from it; `add-auth` owns that route. Not touched here.

## Final checks
Not run: no code was changed in this folder (docs only). To resume: answer Q1–Q7, update `design-summary.md` (Open list and §7), then run `opencode run --standalone --agent architect --model xiaomi/mimo-v2.6-pro --auto --title "add-specialist-evaluations propose" "Use the openspec-propose skill for change add-specialist-evaluations. Propose only: do not apply, verify or archive."`

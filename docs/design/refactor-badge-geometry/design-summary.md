Status: draft — pending Product owner review

# Design summary — refactor-badge-geometry

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

- Change-id: `refactor-badge-geometry`
- Capability: `feedback` (owner of the badge, `openspec/config.yaml`).
- Branch and folder: `feature/refactor-badge-geometry`, `openspec/changes/refactor-badge-geometry/`, `docs/design/refactor-badge-geometry/`.
- Depends on: `add-landing` (the `Badge` component, merged into `develop`).
- Consumed by: `add-evaluation-scales` (the unselected chip of `DescriptorChipGroup`, scales summary §3 and Open 3 b), and through that component `add-specialist-evaluations` and `add-filter-controls` (taste-note facet, filter-controls summary row 11).
- Backlog: R6, "Badge geometry" (named by the orchestrator; the entry is not yet committed in `docs/backlog.md`, which today holds R1–R4). The architect records R6 in `## Propose status` and removes it when archiving this change.
- Decisions log: no entry names this change. D14 (page layout) does not apply: no page is added.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `add-evaluation-scales/design-summary.md` (worktree `tazavera-front-scales`), Open 3, answered b) | A refactor change in `feedback` exposes the badge geometry from `Badge.tsx` first; `add-evaluation-scales` uses it and waits for this merge. Copying the classes is rejected. |
| Same summary §3 "Layout and spacing" | The unselected chip uses the badge geometry plus its own 2px `border-muted` border; the chip, not the badge, owns that border. |
| Orchestrator's task (2026-10-06) | Goal: `Badge.tsx` exposes its geometry so `DescriptorChipGroup` uses it without rendering a `Badge` and without copying classes. No visible change. |
| `openspec/specs/feedback/spec.md` "Badge presentation" | A badge is a compact one-line chip with inner padding, the badge text treatment and the field radius. |
| `src/shared/ui/Badge.tsx` lines 44–53 | The geometry today: `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`, private to the file (`BASE_CLASSES`). |
| `src/shared/ui/Badge.test.tsx` lines 54–55 and 101–110 | The test pins those seven tokens, in that order, as the first seven classes of every variant. |
| `.opencode/skills/fsd-architecture/SKILL.md` | Generic UI lives in `src/shared/ui`. The segment is imported through `@/shared/ui`. |
| `src/widgets/offering-list/index.ts` (`OFFERING_GRID_CLASSES`) | Precedent: a shared class set is exported as an upper-case constant through the public entry point. |

## 1. Scope

**In:**
- Expose the badge geometry from `src/shared/ui/Badge.tsx` as one exported constant, and build `Badge` from it.
- Re-export it from `src/shared/ui/index.ts`.
- A test and a guard that prove the geometry has one source (§4).

**Out (non-goals):**
- No change to any badge variant, colour, icon, inline style or label rule.
- No new variant, such as an outline taxonomy state (scales Open 3 option c, rejected).
- No `DescriptorChipGroup`: it belongs to `add-evaluation-scales`.
- No token, no catalog text, no contract operation.

## 2. End state

- `src/shared/ui/Badge.tsx` exports `BADGE_GEOMETRY_CLASSES`. It is a string holding exactly `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`, in that order.
  - The order is the one `Badge.test.tsx` pins today. The task text listed `rounded-field` last; the existing test fixes the order, so the test's order is kept (review log B1).
- `Badge` composes `BADGE_GEOMETRY_CLASSES` as its base, then its variant classes, then `className`, as today. Its private copy (`BASE_CLASSES`) is removed.
- `src/shared/ui/index.ts` exports `BADGE_GEOMETRY_CLASSES` beside `Badge`.
- The rendered output of every badge (element, classes and their order, inline style, `data-taxonomy`, icon) is identical to `develop`.
- **How the consumer uses it** (for `add-evaluation-scales`, not built here): the unselected chip applies `BADGE_GEOMETRY_CLASSES` plus its own classes (`border-2 border-muted`, the dot, `text-strong`). Inside `src/shared/ui` it imports from `./Badge`; any other layer imports from `@/shared/ui`.

**Layout and spacing (criterion A).** Nothing changes. For the record, the geometry the constant carries:
- padding: 0.125rem vertical, 0.5rem horizontal;
- 0.25rem between the icon and the label;
- `rounded-field` radius (8px traditional, 0 dark);
- no border and no margin. The container spaces the badge.

## 3. Files touched

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/Badge.tsx` | shared | Export `BADGE_GEOMETRY_CLASSES`; `Badge` uses it |
| `src/shared/ui/index.ts` | shared | Re-export `BADGE_GEOMETRY_CLASSES` |
| `src/shared/ui/Badge.test.tsx` | shared | New cases (§4) |
| `src/shared/ui/index.test.tsx` | shared | Import check for the new export (§4) |
| `src/shared/ui/badge-geometry-guard.test.ts` | shared | New guard (§4; Open 2) |

## 4. Tests

**Must keep passing, unchanged:**
- `src/shared/ui/Badge.test.tsx`, every case, in particular "renders the base classes first on every variant" (the seven-token `BASE` literal) and the taxonomy label, depth and contrast cases.
- `src/shared/ui/index.test.tsx` ("renders the badge exported from the segment").
- `src/entities/offering/ui/OfferingCard.test.tsx` (rating, status and taxonomy badges on the card).
- `src/widgets/offering-list/ui/OfferingList.test.tsx`.
- The guards: `color-guard.test.ts`, `radius-guard.test.ts`, `focus-guard.test.ts`, `xss-guard.test.ts`, `client-boundary.test.ts`, and `src/app/styles/theme-tokens.test.ts`.

**New:**
1. `Badge.test.tsx`, "exports the geometry every badge renders":
   - `BADGE_GEOMETRY_CLASSES.split(" ")` equals the existing `BASE` literal;
   - for every variant, the first seven class tokens of the rendered badge equal `BADGE_GEOMETRY_CLASSES.split(" ")`.
2. `index.test.tsx`: `BADGE_GEOMETRY_CLASSES` is importable from `@/shared/ui` and equals the `Badge.tsx` export.
3. Guard `badge-geometry-guard.test.ts`. It scans the non-test `.ts` and `.tsx` files under `src/`.
   - It **fails** when a file other than `src/shared/ui/Badge.tsx` holds all seven geometry tokens (`type-badge`, `rounded-field`, `inline-flex`, `items-center`, `gap-1`, `px-2`, `py-0.5`) as literal class names. A fixture with the seven tokens in one string, and another with them in a class array, must both be reported with the file name.
   - It **passes** on a fixture that imports `BADGE_GEOMETRY_CLASSES` and adds `border-2 border-muted`, and on a fixture holding only some of the tokens (for example `inline-flex items-center gap-1`).
   - It passes on `develop` today: `Badge.tsx` is the only non-test file containing `py-0.5` or `type-badge` (searched by the design lead).

## 5. Contrast

Not applicable. No colour, token or surface changes, so no pair is measured and no guard pair is registered (criterion D).

## 6. Responsive behaviour

Unchanged: badges keep their size at every breakpoint.

## 7. Texts

None. No catalog area is touched.

## 8. Contract

None. No operation is consumed.

## 9. Order and dependencies

- Runs before `add-evaluation-scales` propose (scales Open 3 b: "waits for its merge").
- Touches only `src/shared/ui/Badge*`, `index.ts` and `index.test.tsx`.
  - `add-evaluation-scales` will add exports to the same `index.ts` and `index.test.tsx`. Merging this change first avoids a conflict in those lines.
  - `fix-button-boundaries` touches `Button.tsx`, `globals.css` and `theme-tokens.test.ts`, which do not overlap, so the two can run in parallel. Not simulated with `git merge-tree`: neither branch exists yet.

## 10. Visual reference

No visible change, so no MVC capture applies. The reference is the landing on `develop` (`/es`, offerings section with rating, verification and taxonomy badges) captured at 375px and 1280px before the change. The verification task captures the same route after it, and the two must match.

## Open

1. **Spec delta.**
   - Question: the change has no observable behaviour of its own. Does it carry a `feedback` delta?
   - Options:
     - a) ADDED requirement "Shared chip geometry": the badge's geometry (text treatment, inner padding, icon gap, one-line layout, field radius) has one definition that other compact chips reuse. Scenarios: "Chip matches the badge geometry", and "Second geometry definition detected" (the guard of §4).
     - b) No delta: a pure refactor, with `proposal.md` and `tasks.md` only.
   - Recommendation: a). It records the rule the guard enforces, so the guard traces to a spec. Whether `openspec validate --strict` accepts a change with no delta is **unverified** (the CLI is outside the readable folders); if it does not, b) is not possible.
   - Blocks propose: no. The architect writes a) unless Product owner picks b).
2. **Guard scope.**
   - Question: is the source-scan guard of §4 item 3 wanted, or are the `Badge.test.tsx` cases enough?
   - Options:
     - a) Both. The test proves the export matches the badge; the guard proves no second copy appears.
     - b) Only the `Badge.test.tsx` cases. A later copy would go unnoticed.
   - Recommendation: a). The orchestrator's task asks for a proof of one source, and only a scan can catch a copy in another file. The guard follows the pattern of the existing guards (`radius-guard`, `color-guard`).
   - Blocks propose: no.

Settled by the orchestrator, 2026-10-06 (criterion B): Open 1 a) and Open 2 a), the recommendations. Product owner may reopen them.

## Review log

- **2026-10-06, design lead (draft).** Generated from the scales summary (§3, Open 3 b), the orchestrator's task, `Badge.tsx`, `Badge.test.tsx`, the feedback spec and the FSD skill.
  - B1 (semantic): the class order. The task listed `rounded-field` last; `Badge.test.tsx` pins it second. The existing test is kept, so the constant follows the test's order. The set is the same.
  - B2 (semantic): the constant's name and placement follow the `OFFERING_GRID_CLASSES` precedent (an upper-case constant re-exported from the public entry).
  - B3: R6 is not yet in `docs/backlog.md`. Recorded under the header; adding the entry is Product owner's.

## Propose status

- Change-id: `refactor-badge-geometry`
- Date: 2026-10-06
- `openspec validate refactor-badge-geometry --strict`: passed (`Change 'refactor-badge-geometry' is valid`); 4/4 artifacts complete (proposal, spec delta, design, tasks).
- Resolved:
  - Open 1 — option a): the change carries an ADDED `feedback` requirement "Shared chip geometry" (the badge's geometry has one definition that compact chips reuse) with the scenarios "Chip matches the badge geometry" and "Second geometry definition detected". `skip_specs` is not set in `.openspec.yaml`.
  - Open 2 — option a): both proofs land — the `Badge.test.tsx`/`index.test.tsx` cases pinning the export to the render, and the source scan `src/shared/ui/badge-geometry-guard.test.ts`.
  - Handoff D2 (requirement wording): the requirement is stated in observable terms ("compact chips render with the badge's geometry"), with the verification scenario "Second geometry definition detected" in the existing "… detected" pattern, and without the word "guard" or section numbers.
  - Handoff D3 (wording fix): the scan-scope statement reads "the only non-test `.ts`/`.tsx` file" — `globals.css` defines `@utility type-badge` and is outside the scan. Applied in design.md D4 and tasks 4.1.
  - Handoff D1 (backlog R6): R6 "Expose the badge geometry from `Badge`" exists on `develop` (`f0d2c87`, read with `git show develop:docs/backlog.md`); this change resolves it. The backlog entry id recorded here is **R6**; it is removed from `docs/backlog.md` when this change is archived (after `develop` is merged into this branch).
- Open: nothing. Product owner may still reopen Open 1 and Open 2.

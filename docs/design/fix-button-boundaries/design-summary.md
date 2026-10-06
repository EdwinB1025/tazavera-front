Status: draft — pending Product owner review

# Design summary — fix-button-boundaries

Input for `/opsx:explore` and `/opsx:propose`, once Product owner approves it. Drafted by the design lead on 2026-10-06. Anything not settled by a source is listed under "Open".

> **Measured 2026-10-06.** §4 holds the design lead's own ratios from executed scripts (`buttons.mjs`, `buttons-a4.mjs` in the design lead's scratch directory). The ratios quoted in §0 are other sessions' results; §4 confirms them. Nothing was computed by hand.

- Change-id: `fix-button-boundaries`
- Capability: `base-controls` (owner of `Button`). The token values live in `theming`'s `globals.css`, as in earlier `base-controls` changes; the commit scope is `base-controls` (AGENTS.md: the scope is the change's capability).
- Branch and folder: `feature/fix-button-boundaries`, `openspec/changes/fix-button-boundaries/`, `docs/design/fix-button-boundaries/`.
- Depends on: `add-theme-tokens` and `add-base-control` (merged).
- Consumed by every screen with an action button:
  - merged: `add-landing` (pagination, retry and explore buttons, all `primary`);
  - planned: `add-evaluation-scales` (dialog: `primary` and `action-4`), `add-specialist-evaluations` (`primary`, `action-3`, `action-2`), `add-user-account` (`primary` only, chosen to avoid this defect, its F2), `add-offering-management` and `add-offering-catalog`.
- Backlog: no entry names it. R4 (menu panel radius) is in `base-controls` but touches `DropdownMenu.tsx`, not `Button`.
- Decisions log: no entry names it.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `add-evaluation-scales/design-summary.md` (worktree `tazavera-front-scales`), Open 6, answered a) | F1 and F2 go to this change, in `base-controls`. It also measures `action-1` and `action-2`. |
| Same summary, F1 | Dark `action-primary` boundary: 2.48–2.96 against the four surfaces (gate 3). No single oxblood fill passes both gates: night-oxblood-600 gives a 4.10–4.89 boundary but a 3.26 label; the derived #aa5451 gives a 3.12–3.72 boundary but a 4.28 label. "A fix needs a border or a dark label token." (That session's script.) |
| Same summary, F2 | `action-3-bg` and `action-4-bg` boundaries: 1.17–1.55 against every surface, both themes. (That session's script.) |
| Same summary §5 | Labels pass: `primary` 6.85 traditional / 5.38 dark; `action-4` 5.36 / 5.52. (That session's script.) |
| `docs/design/add-user-account/design-summary.md` F2 | Dark `action-primary` / `surface-card`: 2.74 at rest and 2.22 on hover. `action-4`: 1.46 / 1.29. (That session's script.) |
| `openspec/specs/theming/spec.md` "UI boundary and focus contrast" | Boundaries that identify a component need 3:1 against each adjacent colour. A border is exempt when the component's fill already identifies it at 3:1 or more. |
| `.claude/CLAUDE.md` "Contrast gate failures" and the orchestrator's task | A button is gated on its label (4.5:1) and its boundary (3:1) against every surface it sits on, both themes. Measure the existing tokens of the same family first. Only if none passes, derive one same-hue primitive per failing theme (darken on light, lighten on dark, stop at gate + 0.1 on the hardest background) and one semantic token per role and surface. Never change an existing token's value. |
| `add-theme-tokens/design-summary.md` line 134 and line 148 (Decision 14) | Precedent: the dark `nav-button` hover takes `action-primary-text` as its text **and its border**. A border in the label colour is an accepted boundary treatment. |
| `globals.css` `--color-nav-avatar-border` (transparent traditional, night-cream-100 dark) | Precedent: a boundary token that is `transparent` in the theme where no boundary is needed. |
| `src/shared/ui/Button.tsx` | `nav-button` is the only variant with a border today: `border` (1px) plus `border-nav-button-border`. Every variant is `rounded-pill`, 40px (`h-10 px-4`) or 32px (`h-8 px-3`) high. |
| MVC `resources/css/app.css` lines 379–387 and 839–920 | The MVC buttons are tinted fills with no border. The tinted look of positional actions is the MVC's. |

## 1. Scope

**In:**
- Variants `primary`, `action-1`, `action-2`, `action-3` and `action-4` of `src/shared/ui/Button.tsx`.
- Their states rest and hover. Focus is already gated by the `focus-ring` pairs; disabled is exempt (base-controls spec "Disabled"); busy shows the rest look.
- The surfaces a button sits on: `surface-page`, `surface-card`, `surface-section` and `surface-form`, in both themes. A later host on another surface (for example `surface-filter`) registers its own pairs, as the scales summary does.
- The guard pairs in `src/app/styles/theme-tokens.test.ts`.

**Out (non-goals):**
- `nav-button`: its pairs are registered and pass today (`theme-tokens.test.ts` lines 333–334, 370–373 and 631–634).
- Label contrast is not reworked: the label pairs are registered and pass. They are re-measured only to confirm that a new fill or border keeps them.
- No change to any existing token's value, size, radius, typography or interaction behaviour.
- No catalog text and no contract operation.

## 2. End state

Every action button is identifiable against each host surface in both themes, at rest and on hover: either its fill measures at least 3:1 against the surface, or its border does. Its label keeps at least 4.5:1 against its fill. Settled by the §4 measurements (the former Open 1, closed with option a; see the review log):

- `primary` and `action-1` to `action-4` get a 1px border on all sides (`border`, as `nav-button`), coloured by one new semantic token per variant: `action-primary-border`, `action-1-border`, `action-2-border`, `action-3-border`, `action-4-border`, defined in both themes.
- Every token points to an **existing primitive** (§4.4). No new primitive and no hover token are needed.
- `action-primary-border` is `transparent` in the traditional theme, where the `primary` fill already passes at rest and on hover; that theme looks unchanged for `primary` (the `nav-avatar-border` precedent).
- Hover keeps the rest border token. Traditional: the hover fill passes 3:1 against every surface, so the border is exempt on hover (theming spec). Dark: the same border passes against the hover fill and every surface (§4.3).
- No existing token value changes. Labels are untouched and still pass (§4.1).

**Layout and spacing (criterion A):**
- Border: 1px on all four sides, colour `action-<variant>-border` (width: Open 1).
- Radius: `rounded-pill`, unchanged (fully rounded in traditional, 0 in dark, as today).
- Height: unchanged at 40px (`base`) and 32px (`sm`). Icon-only buttons stay square. The border is drawn inside the box (Tailwind's preflight sets `box-sizing: border-box`; **unverified** in this repo's built CSS).
- Padding: unchanged at 16px (`base`) and 12px (`sm`) horizontal. The content box narrows by 2px, the two border widths (computed by the design lead).
- Gap: 8px between icon and label, unchanged.
- Margin: none. The host spaces its buttons, as today.

## 3. Files touched

| File | Layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | app (theming) | Five new semantic tokens in both themes (§4.4); no new primitive |
| `src/shared/ui/Button.tsx` | shared | `border` plus `border-action-<v>-border` in the rest classes of `primary` and `action-1` to `action-4` (§4.5) |
| `src/shared/ui/Button.test.tsx` | shared | New cases (§6) |
| `src/app/styles/theme-tokens.test.ts` | app | New pairs in both matrices, and token completeness (§5) |

## 4. Measurements (design lead, 2026-10-06)

**All ratios in this section are the design lead's**, from executed Node scripts (`buttons.mjs`, `buttons-a4.mjs`, design lead's scratch directory): WCAG 2.2 relative luminance; primitive values copied from `globals.css` on `develop`; the opaque `color-mix(in srgb, …)` fills resolved in sRGB; two decimals (three where a value sits on the gate). `nav-button` is out of scope (§1); no other Button variant exists in `Button.tsx`.

**Surfaces (S), in the order page / card / section / form:** traditional cream-100 / cream-100 / cream-200 / cream-50; dark night-petrol-950 / night-petrol-900 / night-petrol-850 / night-petrol-900.

### 4.1 Current state (fill against S, gate 3; label against fill, gate 4.5)

| Variant | Theme | Rest fill / S | Hover fill / S | Label / rest fill | Hover label / hover fill |
|---|---|---|---|---|---|
| `primary` | traditional | 6.85 / 6.85 / 6.11 / 7.27 ok | 11.67 / 11.67 / 10.40 / 12.38 ok | 6.85 | 11.67 |
| `primary` | dark | **2.96 / 2.74 / 2.48 / 2.74** | **2.40 / 2.22 / 2.01 / 2.22** | 5.38 | 6.64 |
| `action-1` | traditional | **1.22 / 1.22 / 1.09 / 1.30** | 5.97 / 5.97 / 5.32 / 6.34 ok | 4.89 | 5.97 |
| `action-1` | dark | **1.39 / 1.28 / 1.16 / 1.28** | **2.60 / 2.40 / 2.18 / 2.40** | 5.60 | 5.14 |
| `action-2` | traditional | **1.97 / 1.97 / 1.76 / 2.10** | 6.85 / 6.85 / 6.11 / 7.27 ok | 6.02 | 6.85 |
| `action-2` | dark | **1.35 / 1.25 / 1.13 / 1.25** | **2.40 / 2.22 / 2.01 / 2.22** | 5.44 | 5.40 |
| `action-3` | traditional | **1.35 / 1.35 / 1.20 / 1.43** | 6.41 / 6.41 / 5.72 / 6.81 ok | 4.77 | 6.41 |
| `action-3` | dark | **1.40 / 1.29 / 1.17 / 1.29** | **2.64 / 2.45 / 2.22 / 2.45** | 5.58 | 5.05 |
| `action-4` | traditional | **1.46 / 1.46 / 1.30 / 1.55** | 6.05 / 6.05 / 5.39 / 6.42 ok | 5.36 | 6.05 |
| `action-4` | dark | **1.39 / 1.29 / 1.17 / 1.29** | **2.57 / 2.38 / 2.15 / 2.38** | 5.52 | 5.17 |

F1 and F2 are confirmed. Every label passes. Traditional: every hover fill passes, every positional rest fill fails. Dark: every fill fails, at rest and on hover.

### 4.2 Border candidates, traditional theme (needed at rest only: the hover fills pass)

A candidate must reach 3 against the four S and against the variant's rest fill.

| Variant | Candidate (primitive) | vs S (page / card / section / form) | vs rest fill | Result |
|---|---|---|---|---|
| `action-1` | `action-1-text`, `action-1-bg-hover`, `text-label` (all moss-700) | 5.97 / 5.97 / 5.32 / 6.34 | 4.89 | pass, min 4.89 |
| `action-2` | `action-2-text` (brown-900) | 11.89 / 11.89 / 10.59 / 12.62 | 6.02 | **pass, min 6.02** |
| `action-2` | `action-2-bg-hover`, `border-accent` (oxblood-800) | 6.85 / 6.85 / 6.11 / 7.27 | 3.47 | pass, min 3.47 |
| `action-3` | `action-3-text`, `action-3-bg-hover`, `text-primary` (all sage-800) | 6.41 / 6.41 / 5.72 / 6.81 | 4.77 | pass, min 4.77 |
| `action-4` | `action-4-text` (petrol-800) | 7.84 / 7.84 / 6.99 / 8.33 | 5.36 | pass, min 5.36 |
| `action-4` | `action-4-bg-hover` (petrol-700) | 6.05 / 6.05 / 5.39 / 6.42 | 4.13 | pass |
| `action-4` | `border-muted` (petrol-600) | 3.51 / 3.51 / 3.13 / 3.72 | 2.40 | fail |
| `action-4` | `border-strong` (petrol-900) | 11.53 / 11.53 / 10.28 / 12.24 | 7.87 | **pass, min 7.87** |

On hover the rest border sits on a hover fill of nearly the same colour (1.00–1.91), which is allowed: the hover fill identifies the button at 5.32 or more (theming spec, "UI boundary and focus contrast").

### 4.3 Border candidates, dark theme (needed at rest and on hover)

A candidate must reach 3 against the four S, the rest fill and the hover fill, so one token serves both states. Candidates of §0's list plus each variant's hover-label colour (the `nav-button` precedent: label colour as border).

| Variant | Candidate (primitive) | min vs S | vs rest fill | vs hover fill | Result |
|---|---|---|---|---|---|
| `primary` | `action-primary-text` (night-cream-100) | 13.35 | 5.38 | 6.64 | **pass, min 5.38** |
| `primary` | `border-accent` (night-oxblood-600) | 4.10 | 1.65 | 2.04 | fail |
| `primary` | `text-accent` (night-oxblood-400) | 6.17 | 2.49 | 3.07 | fail |
| `action-1` | `action-1-text` (night-moss-400) | 6.51 | 5.60 | 2.99 | fail (hover) |
| `action-1` | `action-1-bg-hover` (night-moss-700) | 2.18 | 1.87 | 1.00 | fail |
| `action-1` | `text-label` (night-moss-300) | 8.61 | 7.41 | 3.96 | pass, min 3.96 |
| `action-1` | `action-1-text-hover` (night-moss-200) | 11.18 | 9.62 | 5.14 | **pass, min 5.14** |
| `action-2` | `action-2-text`, `text-accent` (night-oxblood-400) | 6.17 | 5.44 | 3.07 | pass, min 3.07 |
| `action-2` | `action-2-bg-hover` (night-oxblood-800) | 2.01 | 1.77 | 1.00 | fail |
| `action-2` | `border-accent` (night-oxblood-600) | 4.10 | 3.61 | 2.04 | fail (hover) |
| `action-2` | `action-2-text-hover` (night-oxblood-200) | 10.85 | 9.56 | 5.40 | **pass, min 5.40** |
| `action-3` | `action-3-text` (night-sage-400) | 6.53 | 5.58 | 2.95 | fail (hover) |
| `action-3` | `action-3-bg-hover` (night-sage-700) | 2.22 | 1.89 | 1.00 | fail |
| `action-3` | `text-primary` (night-sage-100) | 11.97 | 10.23 | 5.40 | **pass, min 5.40** |
| `action-3` | `action-3-text-hover` (night-sage-200) | 11.20 | 9.56 | 5.05 | pass, min 5.05 |
| `action-4` | `action-4-text` (night-petrol-500) | 6.45 | 5.52 | 2.996 | fail (hover) |
| `action-4` | `action-4-bg-hover` (night-petrol-700) | 2.15 | 1.84 | 1.00 | fail |
| `action-4` | `border-muted`, `border-strong` (night-petrol-600) | 4.09 | 3.50 | 1.90 | fail (hover) |
| `action-4` | `text-secondary` (night-petrol-400) | 7.18 | 6.16 | 3.34 | pass, min 3.34 |
| `action-4` | `action-4-text-hover` (night-petrol-100) | 11.12 | 9.53 | 5.17 | **pass, min 5.17** |

An existing primitive passes for every variant in both themes, so no primitive is derived (procedure step 3 not reached) and no `-border-hover` token is needed.

### 4.4 Chosen tokens (the passing candidate with the highest minimum, per theme)

| Semantic token | Traditional | Dark | Lowest ratio (traditional / dark) |
|---|---|---|---|
| `--color-action-primary-border` | `transparent` (fill passes) | `var(--color-night-cream-100)` | — / 5.38 |
| `--color-action-1-border` | `var(--color-moss-700)` | `var(--color-night-moss-200)` | 4.89 / 5.14 |
| `--color-action-2-border` | `var(--color-brown-900)` | `var(--color-night-oxblood-200)` | 6.02 / 5.40 |
| `--color-action-3-border` | `var(--color-sage-800)` | `var(--color-night-sage-100)` | 4.77 / 5.40 |
| `--color-action-4-border` | `var(--color-petrol-900)` | `var(--color-night-petrol-100)` | 7.87 / 5.17 |

Each token points to a primitive, never to another semantic token. No existing value changes. In the dark theme every border is the variant's hover-label colour, or a lighter step of its family for `action-3` (night-sage-100 against night-sage-200: 5.40 against 5.05).

### 4.5 Class per variant (rest classes in `Button.tsx`; hover classes unchanged)

| Variant | Added to the rest classes |
|---|---|
| `primary` | `border border-action-primary-border` |
| `action-1` | `border border-action-1-border` |
| `action-2` | `border border-action-2-border` |
| `action-3` | `border border-action-3-border` |
| `action-4` | `border border-action-4-border` |
| `nav-button` | none (unchanged) |

No `enabled:hover:border-*` class is added: the rest border colour holds on hover (§4.2, §4.3).

## 5. Guard pairs to register (both matrices of `theme-tokens.test.ts`)

`S` = `surface-page`, `surface-card`, `surface-section`, `surface-form` (four pairs each). All `kind: "bound"`.

**Traditional matrix:**
- `action-primary` / S and `action-primary-hover` / S (the fill identifies `primary`);
- `action-primary-border` / `surface-page` and / `action-primary`, with `exempt: true` (transparent, as `nav-avatar-border`);
- for `v` = 1 to 4: `action-<v>-border` / S and `action-<v>-border` / `action-<v>-bg` (rest);
- for `v` = 1 to 4: `action-<v>-bg-hover` / S (the hover fill identifies the button; the border against the hover fill is not registered).

**Dark matrix:**
- for `v` = `primary` (token `action-primary-border`, fills `action-primary` and `action-primary-hover`) and 1 to 4: `action-<v>-border` / S, / the rest fill and / the hover fill.
- No fill pair is registered in the dark theme: no fill passes there (§4.1).

**Completeness:** the five new tokens are defined in both themes (the existing completeness test).

Totals (design lead's count): traditional 8 + 2 exempt + 20 + 16 = 46 entries; dark 5 × 6 = 30 entries. Nothing else: labels are already registered, disabled is exempt, focus is covered by the `focus-ring` pairs.

Nothing else is registered: disabled buttons are exempt, and focus is already covered by the `focus-ring` pairs.

## 6. Tests

**Must keep passing:**
- `src/shared/ui/Button.test.tsx`, every case. Its treatment cases use `toContain` on the class string, so added border classes do not break them.
- `src/app/styles/theme-tokens.test.ts` (both matrices, completeness), `color-guard.test.ts` (the new `border-action-*` utilities must resolve to `--color-*` tokens), `radius-guard.test.ts` and `focus-guard.test.ts`.
- Every consumer test that renders a `Button`: `OfferingPagination.test.tsx`, `OfferingList.test.tsx`, `ExploreButton.test.tsx` (home and about), `AppHeader.test.tsx`, `Sidebar.test.tsx`.

**New:**
- For each of `primary` and `action-1` to `action-4`, the class tokens (split, exact) include `border` and `border-action-<v>-border`, and no `hover:border-` token.
- `nav-button` keeps exactly its current border classes.

## 7. Responsive behaviour

None. Buttons do not change with the breakpoint.

## 8. Texts and contract

None.

## 9. Order and dependencies

- Blocks no change: the scales summary's Open 6 is "Blocks propose: no", and consumers keep using `Button` as it is.
- Shared files: `globals.css` and `theme-tokens.test.ts` also gain tokens and pairs in `add-evaluation-scales` (bean-mark tokens, §4 pairs). Both changes append lines in the same blocks, so a textual conflict is expected whichever merges second. The resolution keeps both sides. Not simulated with `git merge-tree`: neither branch exists yet.
- Can run in parallel with `refactor-badge-geometry` and `extract-taxonomy-and-pagination`, which touch no file of this change.

## 10. Visual reference

The MVC has no bordered button to capture: its buttons are borderless tints. Pending: a mock-up of the five variants on `surface-page` and `surface-card`, at rest and on hover, in both themes, built from the §4.4 tokens (Open 2).

## Open

1. **Border width.**
   - Options: a) 1px (`border`, as `nav-button`); b) 2px (as the input and select boxes).
   - Recommendation: a). It matches the only bordered button, and every chosen border reaches at least 4.77 (§4.4), well above the 3:1 that SC 1.4.11 asks of a 1px boundary.
   - Blocks propose: no.
2. **Visual reference.**
   - Question: a mock-up is needed (§10); none is rendered yet.
   - Options: a) the design lead renders it with the §4.4 tokens in a session with a browser; b) Product owner reviews the change in the browser during verification only.
   - Recommendation: a), before Product owner approves this summary, so he sees the look he approves.
   - Blocks propose: no.

Settled by the orchestrator, 2026-10-06 (Product owner may reopen it): Open 1 a), 1px, as `nav-button`; every chosen border reaches 4.77 or more (design lead's measurement). Open 2 stays with the design lead: the mock-up is rendered before the apply.

## Review log

- **2026-10-06, design lead (draft).** Generated from the scales summary (F1, F2, Open 6), the user-account summary (F2), the theming and base-controls specs, `Button.tsx`, `globals.css`, `theme-tokens.test.ts` and the `add-theme-tokens` summary.
  - No contrast measured by the design lead: script execution was denied in this session. §4 lists the measurements; every quoted ratio names its source session.
  - B1 (semantic): `add-theme-tokens/design-summary.md` line 66 says a failing pair "is fixed by changing a token value, keeping its hue". The orchestrator's procedure and the task forbid changing an existing token's value. The later procedure is applied, through new primitives and new semantic tokens. Recorded so the architect does not reopen it.
  - B2: `nav-button` left out of scope: its pairs are registered and pass today.
- **2026-10-06, design lead (measurement).** Ran the §4 measurements with executed scripts, both themes (all ratios in §4 are the design lead's).
  - Confirmed F1 (dark `primary` 2.48–2.96 at rest, 2.01–2.40 on hover) and F2. Also measured `action-1` and `action-2`: their rest fills fail in both themes and their hover fills fail in the dark theme. All labels pass.
  - Closed the former Open 1 (boundary mechanism) with a), as the orchestrator asked, on the numbers: an existing primitive passes as a border for every variant in both themes, at rest and on hover. The border keeps every existing value; b) would need new fill primitives and, for dark `primary`, a new label token (F1). No primitive is derived and no hover token is needed.
  - Settled from the §4 rule "the passing candidate with the highest minimum": `action-2` traditional takes brown-900 (6.02), not oxblood-800 (3.47); `action-4` traditional takes petrol-900 (7.87); `action-3` dark takes night-sage-100 (5.40). I added each variant's hover-label primitive to the dark candidates, and `text-secondary` for `action-4`, because §0's list had no candidate passing on hover for `action-1`, `action-3` or `action-4`. This follows the `nav-button` precedent and adds no token.
  - Wrote the tokens (§4.4), the class per variant (§4.5) and the exact guard pairs (§5); removed the conditional hover-token test from §6. Renumbered the Open list: border width is now Open 1, the visual reference Open 2. Neither blocks propose.

## Propose status

- Change-id: `fix-button-boundaries`
- Date: 2026-10-06
- `openspec validate fix-button-boundaries --strict`: passed ("Change 'fix-button-boundaries' is valid").
- Resolved:
  - **Q1 (spec delta for the border), by handoff D1.** The change carries a `base-controls` delta that amends the scenarios "Primary action" and "Positional actions" to name the border ("background, label, border and hover colors resolve to …"); the transparent traditional `primary` border is left to the theming exemption clause, so there is no theming delta. Applied in `openspec/changes/fix-button-boundaries/specs/base-controls/spec.md`.
  - **Q2 (completeness of `--color-action-primary-border`), by handoff D2.** An explicit defined-in-both-themes test for `--color-action-primary-border` mirroring the avatar block of `theme-tokens.test.ts`; the shared completeness filter is unchanged. Applied in design.md D5, and D2 states that the `action-primary` fill pairs double as the exemption gate. (Explore A1, which corrected §5's "(the existing completeness test)", is covered by this decision.)
  - **Open 1 (border width), settled 2026-10-06 as a).** 1px is written plainly in the artifacts (design.md D1), per explore A3; the "(width: Open 1)" wording is not carried over.
  - **Explore A2 (border-box geometry).** The +2px width is noted in design.md D1 and is to be shown in the mock-up (Open 2).
  - **§6's incomplete "must keep passing" list, by handoff D3.** The complete list (direct renderers, transitive renderers and style guards) is recorded in design.md D6.
- Open: **Open 2 (visual reference).** The mock-up is rendered by the design lead before the apply (design.md Open Questions); it changes no spec, decision or task and does not block propose.
- Backlog: none. No entry names this change (R4 touches `DropdownMenu.tsx`, not `Button`).
- **Artifact review by Product owner, 2026-10-06 (applied 2026-10-06).** `openspec validate fix-button-boundaries --strict`: passed ("Change 'fix-button-boundaries' is valid").
  - Open 1 a) (1px border) and Open 2 a) confirmed.
  - Product owner reviewed the mock-up (`mockup/buttons-mockup.html`) and approves every border as rendered, including the border merging with the fill on the traditional hover of `action-1` and `action-3`, the dark-theme borders lighter than the label at rest, and the cream border on dark `primary`. Nothing blocks the apply on the visual side.
  - Kept as edited by the orchestrator in `openspec/changes/fix-button-boundaries/design.md`: Risk 2 (the mock-up uses its own copy of the stylesheet; every rendered `Button` on the live landing computes `box-sizing: border-box` at 40px high) and Risk 3 (the transparent border makes the button 2px wider and, at the fixed height, its content area 2px shorter).
  - Applied: design.md "Open Questions" records the visual reference as resolved. Open 2 is closed and supersedes the `Open` line above (it changes no spec, decision or task). Open: none.

# Design

## Context

See `proposal.md` — Why. Current state: the badge's geometry lives once, as the private `BASE_CLASSES` of `src/shared/ui/Badge.tsx` (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`), and `src/shared/ui/Badge.test.tsx` pins those seven tokens, in that order, as the first seven classes of every variant. `src/shared/ui/index.ts` re-exports `Badge` and its types; `src/widgets/offering-list/index.ts` (`OFFERING_GRID_CLASSES`) is the precedent for exporting a shared class set as an upper-case constant through a public entry point. The guards (`color-guard.test.ts`, `radius-guard.test.ts`, `focus-guard.test.ts`, `xss-guard.test.ts`) scan source files with `node:fs` and report offending files by name. A scan confirms today's state: outside test files, `src/shared/ui/Badge.tsx` is the only non-test `.ts`/`.tsx` file holding the geometry tokens — `src/app/styles/globals.css` defines `@utility type-badge`, the text treatment's own definition, and is not a copy of the geometry.

This change consumes no API: no endpoint is called, no generated type in `src/shared/api/schema.ts` is used or touched, and no derived or UI-specific type is defined. No API error can occur, so no error presentation applies. No route or screen is involved.

## Goals / Non-Goals

**Goals:**
- The geometry other compact chips will reuse is obtainable from one exported value, and the badge renders from that same value.
- A second spelling of the geometry anywhere in `src/` is caught automatically and reported by file name.

**Non-Goals:**
- Any consumer of the constant (`DescriptorChipGroup` belongs to `add-evaluation-scales`; catalog and filter chips come later). Proposal non-goals.
- Changing what any badge renders: variants, colors, icons, inline styles, label rules, class order.
- Moving the geometry into `globals.css` as a custom utility (rejected in D1).

## Decisions

### D1. One exported constant in the badge's module, re-exported from the segment entry

`src/shared/ui/Badge.tsx` exports `BADGE_GEOMETRY_CLASSES`, a string holding exactly `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`, and `Badge` composes its base classes from it; the private `BASE_CLASSES` copy is removed. `src/shared/ui/index.ts` re-exports `BADGE_GEOMETRY_CLASSES` beside `Badge`. The name and placement follow the `OFFERING_GRID_CLASSES` precedent (an upper-case constant re-exported through the public entry point).

*Why this mechanism.* The design summary settles "expose the geometry from `Badge.tsx` as one exported constant, and build `Badge` from it", and its review log (B2) fixes the naming and placement. *Alternatives considered:* keeping the classes private and exporting a second copy — rejected: that is two definitions, exactly what the change exists to prevent. A `@utility` in `globals.css` like `focus-ring` — rejected: the consuming chip adds its own classes on top of the geometry, which a single utility class cannot express without also merging the chip's additions into the stylesheet, and it would change every badge's rendered class string.

### D2. The constant keeps the class order the existing test pins

The tokens and their order are the ones `Badge.test.tsx` asserts today (`type-badge`, `rounded-field`, `inline-flex`, `items-center`, `gap-1` as the icon gap, `px-2`, `py-0.5`). The task text of the scales handoff listed `rounded-field` last; the existing test fixes the order, so the test's order is kept (design summary review log B1). The set is the same; only the order is settled here.

### D3. Badge composition order is unchanged

`Badge` renders `BADGE_GEOMETRY_CLASSES`, then the variant classes, then `className`, exactly as today's `cn(BASE_CLASSES, VARIANT_CLASSES[variant].join(" "), className)`. The rendered output of every badge — element, classes and their order, inline style, `data-taxonomy`, icon — stays identical to `develop`.

### D4. Verification: pinned export plus a source scan, in the existing guard pattern

Two verifications prove one source:

- **Export pinned to the render.** `Badge.test.tsx` gains a case asserting `BADGE_GEOMETRY_CLASSES.split(" ")` equals its existing `BASE` literal, and that for every variant the first seven class tokens of the rendered badge equal `BADGE_GEOMETRY_CLASSES.split(" ")`. `index.test.tsx` asserts `BADGE_GEOMETRY_CLASSES` is importable from `@/shared/ui` and equals the `Badge.tsx` export.
- **Source scan.** `src/shared/ui/badge-geometry-guard.test.ts`, in the `radius-guard`/`color-guard` pattern (recursive `node:fs` scan, offenders reported with the file name). Scope: the non-test `.ts` and `.tsx` files under `src/` — the only non-test `.ts`/`.tsx` file holding the geometry tokens today is `Badge.tsx`; `globals.css` defines `@utility type-badge` and is outside that scan. It fails when a file other than `src/shared/ui/Badge.tsx` holds all seven geometry tokens (`type-badge`, `rounded-field`, `inline-flex`, `items-center`, `gap-1`, `px-2`, `py-0.5`) as literal class names — whether spelled in one string or collected in a class array — and names the file. It passes on a file that imports `BADGE_GEOMETRY_CLASSES` and adds its own classes (`border-2 border-muted`), and on a file holding only some of the tokens (`inline-flex items-center gap-1`).

This is the verification behind the spec scenario "Second geometry definition detected"; both Open 2's option a) (the cases plus the scan) and Open 1's option a) (the `feedback` delta that records the rule) are settled.

### D5. How the consuming chip uses it (settled for `add-evaluation-scales`, not built here)

The unselected descriptor chip applies `BADGE_GEOMETRY_CLASSES` plus its own classes (`border-2 border-muted`, the dot, `text-strong`); the chip, not the badge, owns that border (scales summary §3). Inside `src/shared/ui` the import comes from `./Badge`; any other layer imports from `@/shared/ui`. No consumer is added by this change.

### Files created or modified

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/ui/Badge.tsx` | `shared` | modified — exports `BADGE_GEOMETRY_CLASSES`; `Badge` composes it; private `BASE_CLASSES` removed (D1, D3) |
| `src/shared/ui/index.ts` | `shared` | modified — re-exports `BADGE_GEOMETRY_CLASSES` (D1) |
| `src/shared/ui/Badge.test.tsx` | `shared` | modified — new cases pinning the export to the render (D4) |
| `src/shared/ui/index.test.tsx` | `shared` | modified — import check for the new export (D4) |
| `src/shared/ui/badge-geometry-guard.test.ts` | `shared` | created — source scan against a second geometry definition (D4) |

No Next.js route file and no file under the root `app/` or `pages/` is involved. No type is defined or redefined; `src/shared/api/schema.ts` is untouched.

## Risks / Trade-offs

- [A consumer could split, reorder or extend the constant's string and silently lose the geometry] → the export is pinned token-by-token and in order to the rendered badge base classes (D4); the scan catches a hand-written replacement of all seven tokens.
- [The scan's scope (non-test `.ts`/`.tsx` under `src/`) misses a copy written in CSS or in a test fixture] → settled scope (D4): `globals.css` holds the text treatment's own `@utility type-badge`, not a geometry copy, and tests hold class names in prose only — the same exclusion the existing guards use.
- [Holding only some of the geometry tokens in a file passes the scan (a chip borrowing just the row layout)] → accepted: a partial set is not a second definition of the geometry; the requirement binds the full geometry.

## Migration Plan

Not applicable: a pure refactor with a class-identical render. A rollback is a single revert commit.

## Open Questions

None. The design summary's two open points are settled (Open 1 a) with a `feedback` delta; Open 2 a) with the cases plus the source scan); Product owner may reopen them.

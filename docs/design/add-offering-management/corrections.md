# Corrections — add-offering-management

## Round 1

Source: Product owner's answer of 2026-10-07 to handoff Q1 (Product owner delegated the choice; recorded choice written down by the orchestrator).

1. **One sidebar entry.** The coffee shop management sidebar shows a single entry, "Administrar ofertas" (en "Manage offerings", ca "Gestionar ofertes", from the message catalog), instead of "Mis ofertas" and "Nueva oferta". It addresses the list route and is marked as the current entry on both the list route and the create route. The create route stays reachable from the list's "New offering" link and its empty-state link. "Administrar ubicaciones" is not part of this change: `add-coffeeshop-location` adds it beside this entry.

### Status

- Date: 2026-10-07.
- `openspec validate add-offering-management --strict` (OpenSpec 1.13.2): valid.
- Correction 1 (one sidebar entry): changes specified behaviour. Updated spec.md (requirement "Management sidebar entries" becomes "Management sidebar entry", one entry addressing the list route and marked current on both routes; "Localized management texts" names the entry), design.md (D8, D11 with the key `sidebarManageOfferings` and 43 keys, files table, icons row without `Plus`) and proposal.md (sidebar line and icons line). Tasks: group 8 was not yet built, so 8.1 (tests) and 8.2 (catalog key swap, `List` icon, entry, page blocks and slot routes) are rewritten in place as the round's section "8. Management sidebar entry (review round 1, correction 1)", keeping test-first order before groups 9–10; no checked task changed. Groups 9 and 10 need no change.

## Round 2

Source: Product owner's decision of 2026-10-07 (decisions log, "superficies de página: respuestas a Open 1–3": each running change gets a small adoption round before its archive), written down by the orchestrator. The shared pattern is `refine-page-surfaces`, merged into `develop` at `2bc80ae` (content-structure "Section card"; `Card variant="section"`). Reference: `docs/design/refine-page-surfaces/design-summary.md` §0.3, §5.3 and the §9.2 row of this change.

1. **The create form panel is a section card.** The local form panel of the create route (`NewOfferingForm.tsx`, today a translation of the MVC `.tz-form-main` with a 2px border) becomes the shared `Card variant="section"`: 1px `border-subtle`, fill `surface-card`, the section card's radius, shadow and padding; it keeps its 40rem width from `md`. No local copy of the section card remains.

### Status

- Date: 2026-10-07.
- `openspec validate add-offering-management --strict` (OpenSpec 1.14.0): valid.
- Correction 1 (the create form panel is a section card): changes specified behaviour (the panel's appearance). Updated spec.md (requirement "Creating offerings": the form renders inside a section card with no header band, full column below 768px and at most 40rem from 768px; new scenario "The form panel is a section card"), design.md (new D15: `Card variant="section"` without a band, form in the card's body, local panel classes removed, fill `surface-card`, 1px border; no contrast pair added, D12 unchanged; files table row of `NewOfferingForm.tsx`) and proposal.md ("New offering" line). Tasks: new section "11. Create form panel as a section card (review round 2, correction 1)" with 11.1 (tests), 11.2 (implementation) and 11.3 (verification including `npm run build`); no checked task changed.

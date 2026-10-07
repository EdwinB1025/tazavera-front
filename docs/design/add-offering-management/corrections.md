# Corrections — add-offering-management

## Round 1

Source: Product owner's answer of 2026-10-07 to handoff Q1 (Product owner delegated the choice; recorded choice written down by the orchestrator).

1. **One sidebar entry.** The coffee shop management sidebar shows a single entry, "Administrar ofertas" (en "Manage offerings", ca "Gestionar ofertes", from the message catalog), instead of "Mis ofertas" and "Nueva oferta". It addresses the list route and is marked as the current entry on both the list route and the create route. The create route stays reachable from the list's "New offering" link and its empty-state link. "Administrar ubicaciones" is not part of this change: `add-coffeeshop-location` adds it beside this entry.

### Status

- Date: 2026-10-07.
- `openspec validate add-offering-management --strict` (OpenSpec 1.13.2): valid.
- Correction 1 (one sidebar entry): changes specified behaviour. Updated spec.md (requirement "Management sidebar entries" becomes "Management sidebar entry", one entry addressing the list route and marked current on both routes; "Localized management texts" names the entry), design.md (D8, D11 with the key `sidebarManageOfferings` and 43 keys, files table, icons row without `Plus`) and proposal.md (sidebar line and icons line). Tasks: group 8 was not yet built, so 8.1 (tests) and 8.2 (catalog key swap, `List` icon, entry, page blocks and slot routes) are rewritten in place as the round's section "8. Management sidebar entry (review round 1, correction 1)", keeping test-first order before groups 9–10; no checked task changed. Groups 9 and 10 need no change.

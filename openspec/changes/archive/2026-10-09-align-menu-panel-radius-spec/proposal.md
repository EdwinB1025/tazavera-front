Type: Refactor (fast lane)

# Proposal

## Why

`base-controls` "Theme-driven corner radii" says every menu uses `radius-field`, but the shared `DropdownMenu` card panel uses `rounded-container` (16px) while its nav panel, the Select list and the Combobox list use `rounded-field` (8px). Product owner settled backlog entry R4 on 2026-10-08: a menu panel takes the radius of what opens it. The code already does this, so only the spec wording is aligned; no behaviour changes.

## What Changes

- `base-controls` "Theme-driven corner radii": `radius-container` also covers menus opened from a card, and `radius-field` covers menus opened from a field or the navigation. The "Traditional shapes" scenario states the same split, and two scenarios are added: a menu opened from a field or the navigation uses the field radius; a menu opened from a card uses the container radius.

## Out of scope (non-goals)

- Code, tests, tokens, texts, contract and dependencies: unchanged. `src/shared/ui/DropdownMenu.tsx`, `Select.tsx` and `Combobox.tsx` already render the stated radii.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: MODIFIED "Theme-driven corner radii" (menu radius follows what opens it).

## Impact

- **Code and tests**: none. The existing tests of `DropdownMenu`, `Select` and `Combobox` already assert `rounded-container` for the card panel and `rounded-field` for the nav, Select and Combobox panels.
- **API, contract, texts, tokens, dependencies**: none.

## Propose status

- **Change-id:** `align-menu-panel-radius-spec`
- **Date:** 2026-10-09
- **Validation:** `openspec validate align-menu-panel-radius-spec --strict` → "Change 'align-menu-panel-radius-spec' is valid".
- **Resolved:** backlog entry R4 (Product owner, 2026-10-08): a menu panel takes the radius of what opens it; field- and navigation-opened panels use `radius-field`, card-opened menus use `radius-container`. Spec wording only.
- **Backlog entry resolved:** R4.
- **Open:** nothing.

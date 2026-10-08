Type: Refactor (fast lane)

## Why

Production AUT findings 22 and 23 (2026-10-08), backlog entries R54 and R55. Product owner typed this change for the fast lane; unlike a pure refactor it changes two visible details, by Product owner's decision with the design lead's measurements:

- R54: the coffee shop card's action reads only "Ver" ("View"), which does not say where it leads. It becomes "Ver ofertas" (en "View offerings", ca "Veure ofertes"); the destination stays the coffee shop detail, whose Offerings tab is already the default.
- R55: the bean mark's coloured disc fills the whole mark and frames the bean as a coin (add-evaluation-scales design.md D4). Product owner: "the circle is the background of the bean; it must not go beyond the bean's outline". The disc becomes a smaller circle behind the bean, inside its visible outline; this reverses D4.

## What Changes

- `offering-catalog` "Coffee shop card": the action is named "View offerings"; activating it opens the coffee shop detail with its Offerings tab selected (same route, no query). Only the coffee shop catalog's `viewLabel` changes, in es, en and ca; other catalogs' `viewLabel` keys stay.
- `form-fields` "Bean scale": new scenario "The mark's background stays inside the bean". The mark's background circle has centre (11.85, 12.15) and radius 7.8 in the bean path's coordinates, shares the path's ×1.33 transform and is painted before the path; the viewBox is unchanged. The read-only partial bean keeps working.
- The bean colours are registered against the host surfaces in both theme contrast matrices (3:1, icon), since the background no longer frames the bean.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: "Coffee shop card" (action name and "Card content" and "View link" scenarios).
- `form-fields`: "Bean scale" gains the scenario "The mark's background stays inside the bean".

## Out of Scope (non-goals)

- The coffee shop map overlay's action (its own `viewCoffeeshop` key) and every other catalog's `viewLabel`.
- The bean path artwork, its ×1.33 scale, the viewBox, the bean tokens' values and the partial-bean clip.
- Any API, route or new token.

## Impact

- **Code**: `messages/{es,en,ca}/coffeeshops.json`; `src/shared/ui/icons.ts` (FSD `shared`); tests `src/entities/coffeeshop/ui/CoffeeshopCard.test.tsx`, `src/widgets/coffeeshop-list/ui/CoffeeshopList.test.tsx`, `src/shared/ui/BeanScale.test.tsx`, `src/app/styles/theme-tokens.test.ts`.
- **API**: none. **Dependencies**: none.

## Propose status

- Change-id: `refine-small-visuals-aut`; date 2026-10-08.
- Backlog entries resolved: R54 (table row `0j`) and R55 (table row `0k`).
- R54 resolved: label "Ver ofertas" / "View offerings" / "Veure ofertes"; accessible name equals the visible text; destination unchanged, the Offerings tab being the detail's default (design lead's open point closed: no query).
- R55 resolved: background circle centre (11.85, 12.15), radius 7.8, same ×1.33 transform, path keeps its scale, contrast pairs registered against `surface-card` and `surface-form` in both themes; the partial-bean clip unchanged (design lead's open points closed).
- Open: none.
- `openspec validate refine-small-visuals-aut --strict`: passed.

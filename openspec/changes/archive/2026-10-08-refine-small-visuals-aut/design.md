# Design

## Context

See `proposal.md`. Fast-lane change from backlog entries R54 and R55; the decisions below are Product owner's and the design lead's (production AUT findings 22 and 23). No API endpoint is consumed, no generated type is used or defined, no route or screen file changes, so no API error presentation applies.

## Decisions

### D1. Coffee shop card action label (R54)

Only `viewLabel` in `messages/{es,en,ca}/coffeeshops.json` changes: es "Ver ofertas", en "View offerings", ca "Veure ofertes". The card already uses the visible text as the accessible name; no hidden suffix is added. The destination stays `/{locale}/coffeeshops/{ulid}` with no query: the Offerings tab is the coffee shop detail's default tab. The coffee shop map overlay uses its own `viewCoffeeshop` key and is not touched.

### D2. Bean mark background (R55; replaces add-evaluation-scales design.md D4)

`icons.ts` exports `BeanMark`, `aria-hidden`. A circular background (a `rect` with `rx` half its side: centre (11.85, 12.15), radius 7.8 in the bean path's coordinates) sits behind the MVC bean path and colours only the bean's inside; it stays within the bean's visible outline. The background is `fill-evaluation-bean-on` or `fill-evaluation-bean-off`; the path's fill and stroke are `fill-/stroke-evaluation-bean-mark-on` or `-mark-off`. Background and path share the transform `translate(12 12) scale(1.33) translate(-12 -12)` in the viewBox `-2.4 -2.4 28.80 28.80`. The on bean is identified by its background against the host surface, the off bean by its outline.

The rect is `x="4.05" y="4.35" width="15.6" height="15.6" rx="7.8"`, painted before the path. Drawn as a `rect`, it keeps the read-only partial bean (a clipped second `BeanMark`) and the `svg rect` selector of the existing bean tests working unchanged. Design lead's measurement: it covers about 97.8% of the bean halves.

### D3. Contrast against the host surface (R55)

Both theme matrices of `src/app/styles/theme-tokens.test.ts` register, kind `icon` (3:1): `evaluation-bean-on` on `surface-card` and `surface-form`, and `evaluation-bean-mark-off` on `surface-card` and `surface-form`. Design lead's measurements: 7.44/7.76/4.53 and 11.89/12.62/13.22. If the guard fails, the build stops and reports the numbers.

## Files

- `messages/es/coffeeshops.json`, `messages/en/coffeeshops.json`, `messages/ca/coffeeshops.json` (catalogs).
- `src/shared/ui/icons.ts` (FSD `shared`).
- Tests: `src/entities/coffeeshop/ui/CoffeeshopCard.test.tsx` (`entities`), `src/widgets/coffeeshop-list/ui/CoffeeshopList.test.tsx` (`widgets`), `src/shared/ui/BeanScale.test.tsx` (`shared`), `src/app/styles/theme-tokens.test.ts` (`app`).

## Risks

- The `qa/` copies of `CoffeeshopList.test.tsx` and other bean tests use fixture texts or the old geometry; the QA suite is not edited in this change, and any QA test asserting the old text or geometry is reported.

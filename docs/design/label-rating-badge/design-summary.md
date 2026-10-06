Status: approved

# Design summary — label-rating-badge

Product owner delegated this decision on 2026-10-06 ("la decisión sobre la insignia la tienes tú; revisa el MVC y confirma"). It closes landing D4 (handoff Q17): the offering card shows the score twice, as the large number and as the rating badge's text.

## 1. Decision

The rating badge on the offering card shows the tier word of the score, not the score. The score stays once, as the large number with its `/100` scale.

| Score (`cuppingAvg`) | Badge variant (existing) | es | en | ca |
|---|---|---|---|---|
| 90 or above | `rating-exceptional` | Excepcional | Exceptional | Excepcional |
| 85 to below 90 | `rating-excellent` | Excelente | Excellent | Excel·lent |
| 80 to below 85 | `rating-good` | Bueno | Good | Bo |
| below 80 | `rating-commercial` | Comercial | Commercial | Comercial |
| no score | — | no badge (unchanged) | | |

## 2. Sources

- MVC `resources/views/livewire/coffees/partials/offeringcard.blade.php:20-36`: the same four ranges with the labels Excepcional, Excelente, Bueno, Comercial; the score, `/100` and the badge in one block. The front follows the MVC labels.
- Front, unchanged: the ranges (`src/entities/offering/lib/rating.ts`, `ratingTierFor`), the four badge variants and their tokens (`src/shared/ui/Badge.tsx`), the `feedback` spec "Rating badge" and the `landing` spec card scenarios (score with the badge of its range; no score → no score and no badge).

## 3. Scope

- The badge's visible text becomes the tier word, from the message catalog (`messages/{locale}/landing.json`, four new keys, es/en/ca as in §1), passed to the card as props like the other card texts.
- Every place that renders `OfferingCard` gets the word: the landing list today, the catalog and offering management later through the same card.
- `landing` spec: the card scenario names the tier word as the badge's text. The `feedback` spec is unchanged (it already defines the tiers, not the text).
- Tests that assert the badge's text equals `cuppingAvg` are updated to the tier word.

## 4. Out of scope

- No new token, variant, range or component; no change to the badge's geometry or colours.
- The large score, the `/100` scale and the card layout stay as they are.
- The rating badge in evaluation lists or the detail page (they are designed in their own changes and reuse this rule).

## 5. Visual reference and verification

No capture. Product owner verifies the card in the browser (`/es`, `/en`, `/ca`) before the archive.

## 6. Dependencies and overlap

- No dependency. It touches `OfferingCard`, which the planned refactor of its action slot (decisions log, 2026-10-06) also touches; the two must not run in parallel on the card without a merge simulation.

## Open

None.

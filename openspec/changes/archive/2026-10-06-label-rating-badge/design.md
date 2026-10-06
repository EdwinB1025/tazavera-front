# Design

## Context

See proposal.md for the motivation. The current state this design builds on:

- The card already computes the score's tier and uses it only to pick the badge's treatment: `ratingTierFor` (`src/entities/offering/lib/rating.ts`) returns the tier of `cuppingAvg`, and the card renders the badge of that variant with the score as its text. The score therefore appears twice on the card.
- Every card text arrives as `texts` props (`OfferingCardTexts`, declared before the component), supplied from `messages/{locale}/landing.json` by the screen and passed down through the list's texts type. No component carries literal interface text.
- The four rating treatments' tokens live in `src/app/styles/globals.css` (`bg-evaluation-rating-*`, applied by the badge's rating variants); nothing in this change touches them.
- The four words are the MVC's labels for the ranges (`resources/views/livewire/coffees/partials/offeringcard.blade.php:20-36`), not SCA grade names. The Spanish words come from the MVC; the English and Catalan words are the translations decided in the approved design summary.

### API endpoint consumed

- `GET /offerings` (`listOfferings`), auth: none (public). Request: query `verified=1` and `page`, unchanged by this change. Response 200: the paginated offerings list whose items carry `cuppingAvg`, the optional decimal string of the average cupping score — the only API field this change derives from. Errors: a failed request or a non-success status keeps the list's error presentation (below). No endpoint, request, response or error shape changes.

### How API errors are presented

Unchanged: when the offerings or taxonomy read fails or returns a non-success status, the list shows its error message with the retry action and no card renders, so no badge text can appear in that state. The badge text itself adds no error state: an absent or unparsable `cuppingAvg` keeps showing no score and no badge (unchanged), exactly as the `null` contract of `ratingTierFor` reads today.

### Card sections filled from the API (shared card)

| Card section | Source |
|---|---|
| Score row — large number | `cuppingAvg` |
| Score row — scale | the fixed `/100` text |
| Score row — rating badge | the word of `cuppingAvg`'s tier (this change); the treatment stays the `Badge` rating variant of that tier |
| Verification state badge | `verificationStatus` selecting the verified or provisional label |
| Coffee name | `coffeeInventory.coffee.name` |
| Coffeeshop and roaster captions | `location.name`, `coffeeInventory.roastery.name` |
| Origin line | `coffeeInventory.coffee.{country,region,process,variety}` |
| Taxonomy badges | `sensoryTaxonomy` resolved against `GET /taxonomies` |
| Footer counts and links | `evaluationCount`, `defectiveEvaluationCount`, `ulid` |

Only the rating badge's text changes; every other mapping is as it is.

### Files modified (no file created, no route change)

| Path | FSD layer | Change |
|---|---|---|
| `messages/es/landing.json` | message catalog (landing area) | four new keys, Spanish words |
| `messages/en/landing.json` | message catalog (landing area) | four new keys, English words |
| `messages/ca/landing.json` | message catalog (landing area) | four new keys, Catalan words |
| `src/entities/offering/ui/OfferingCard.tsx` | entities | `OfferingCardTexts` gains four word fields; the badge renders the tier's word |
| `src/pages/home/ui/HomeScreen.tsx` | pages | the list texts mapping supplies the four new fields |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities | badge text assertions and the every-text coverage rule |
| `src/widgets/offering-list/ui/OfferingList.test.tsx` | widgets | texts fixture gains the four fields |
| `src/pages/home/ui/HomeScreen.test.tsx` | pages | the exact texts object gains the four keys |

`src/widgets/offering-list/ui/OfferingList.tsx`, `VerifiedOfferings.tsx` and `src/entities/offering/lib/rating.ts` change nothing: the list texts type intersects the card texts type, and the range rule is untouched. No generated API type is edited; `src/shared/api/schema.ts` stays as it is.

## Goals / Non-Goals

**Goals:**

- The rating badge classifies the score with the tier word, localized like every other card text.
- Every place that renders the card receives the words through the texts props, so the catalog and offering management can supply the same keys later from their own area catalogs.

**Non-Goals:**

- No new token, variant, range or component; no change to badge geometry or colours.
- No change to the large score, the `/100` scale or the card layout.
- The rating badge in evaluation lists or on the offering detail page (their changes reuse this rule).
- The `feedback` spec is untouched: it defines the tiers and their treatments, not the badge's text.

## Decisions

### D1. The badge's text is the tier word, supplied as texts props

Four new landing-owned keys in `messages/{locale}/landing.json` — `cardRatingExceptionalLabel`, `cardRatingExcellentLabel`, `cardRatingGoodLabel` and `cardRatingCommercialLabel`, named like the other card texts — hold the four words; they surface as the four `OfferingCardTexts` fields `ratingExceptionalLabel`, `ratingExcellentLabel`, `ratingGoodLabel` and `ratingCommercialLabel`, which reach the card as `texts` props exactly like every other label and caption. The words per locale are those the approved summary settles — es Excepcional, Excelente, Bueno, Comercial (the MVC's words), en Exceptional, Excellent, Good, Commercial, ca Excepcional, Excel·lent, Bo, Comercial (the summary's translations) — mapped to the tiers exceptional (90 or above), excellent (85 to below 90), good (80 to below 85), commercial (below 80). Later consumers (catalog, offering management) add the same keys to their own area catalogs, as they already do for the card texts.

Alternatives considered: composing the four words from one key — the catalog holds one text per key and the catalog guard compares key sets per locale; hardcoding the words in the card — forbidden by the catalog-and-props rule and by the no-literals lint rule.

### D2. The tier selects the word; the ranges stay untouched

`ratingTierFor` remains the single range rule: an absent or unparsable `cuppingAvg` yields no tier, and the card keeps rendering no score and no badge (unchanged). The card renders the word belonging to the tier it already uses to pick the variant, so the treatment and the word can never disagree.

Alternative considered: re-deriving the range from the score inside the card — rejected: it would duplicate the range rule the `feedback` spec and `rating.test.ts` already pin.

### D3. Texts type extension only

The four fields are added to the existing UI-specific `OfferingCardTexts` (declared before the component, per the type rule); `OfferingListTexts` inherits them through its intersection and needs no edit. No generated type is touched.

## Risks / Trade-offs

- [Two changes touch the card] → No blocking dependency; one coordination overlap with `replace-offering-card-session`. That change starts from `develop` after this change and `extract-offering-list-parts` are merged, so the two never run in parallel on the card (orchestrator answer to Q1).
- [A texts-coverage test can silently drop one of twelve texts] → The coverage rule is revised to render one card per tier so their union covers every text, including all four words (tasks 2.1).
- [Badge text length varies per locale] → The words are short labels in all three locales and the score row already wraps; Product owner verifies the card in the browser on `/es`, `/en` and `/ca` before the archive (no captures).

## Migration Plan

None: no data, no dependency, no route or contract change. Rolling back is reverting the change's commits.

## Open Questions

None.

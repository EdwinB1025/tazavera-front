# Proposal

## Why

The offering card shows the cupping score twice: once as the large number and again as the rating badge's text (landing D4, handoff Q17). The badge should classify the score instead of repeating it. Product owner delegated the decision ("revisa el MVC y confirma") and it is settled in the approved design summary: the badge shows the tier word of the score. Landing is merged, so this is a new change on the card.

## What Changes

- The rating badge on the offering card shows the word of the score's tier instead of the score: Excepcional at 90 or above, Excelente from 85 to below 90, Bueno from 80 to below 85, Comercial below 80. The words are the MVC's labels for those ranges (`resources/views/livewire/coffees/partials/offeringcard.blade.php:20-36`), not SCA grade names; the English and Catalan words are the translations settled in the approved design summary.
- Four new landing-owned message keys in `messages/{locale}/landing.json` (es, en, ca), passed to the card as texts props like the other card texts. Later consumers (catalog, offering management) add the same keys to their own area catalogs, as they already do for the card texts.
- The score stays once on the card, as the large number with its `/100` scale. No score, or an unparsable score, keeps showing no badge (unchanged).
- Tests that assert the badge's text equals `cuppingAvg` are updated to assert the tier word per range.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: the offering card content requirement's "Score and rating tier" scenario names the word of the score's tier as the rating badge's text.

## Out of Scope

- No new token, variant, range or component; no change to the badge's geometry or colours. The four rating treatments and their tokens in `src/app/styles/globals.css` are unchanged.
- The large score, the `/100` scale and the card layout stay as they are.
- The rating badge in evaluation lists or on the offering detail page: those are designed in their own changes and reuse this rule.
- The `feedback` spec is unchanged: it defines the tiers and their treatments, not the badge's text.

## Impact

- Code: `messages/es/landing.json`, `messages/en/landing.json`, `messages/ca/landing.json`, `src/entities/offering/ui/OfferingCard.tsx` (texts type and badge text), `src/pages/home/ui/HomeScreen.tsx` (texts mapping), and the tests `src/entities/offering/ui/OfferingCard.test.tsx`, `src/widgets/offering-list/ui/OfferingList.test.tsx`, `src/pages/home/ui/HomeScreen.test.tsx`.
- API: none. The card keeps reading `cuppingAvg` from `GET /offerings`.
- Dependencies: none added. No blocking dependency; one coordination overlap with `replace-offering-card-session`, which touches the same card and starts from `develop` after this change and `extract-offering-list-parts` are merged, so the two never run in parallel on the card.

## ADDED Requirements

### Requirement: Consensus panel kept as one view
The Consensus tab SHALL render its blocks — the score, the SCA attribute averages or the not-verified message, the counts and concordances, the Main tastes and Defects selections with their consensus legends, the CATA wheel and the detail by axis — in that order, with the same structure, texts and accessible names for the same offering, taxonomy tree and locale, however the panel is organised internally. This requirement adds no behaviour: every block keeps what the other Consensus requirements of this capability state.

#### Scenario: Verified offering renders as before
- **WHEN** the Consensus tab renders for a verified offering carrying a score, attribute averages, counts, concordances and identified notes
- **THEN** the score, the attribute scales, the counts and concordances, the Main tastes and Defects cards with their legends, the CATA wheel and the five axis sections render in that order, each with its texts in the active locale

#### Scenario: Provisional offering renders as before
- **WHEN** the Consensus tab renders for a provisional offering
- **THEN** no score renders, the not-verified message renders in place of the attribute scales, and the remaining blocks render in the same order

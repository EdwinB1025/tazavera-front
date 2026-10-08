## MODIFIED Requirements

### Requirement: Consensus Defects and Main tastes
The Consensus tab SHALL show the main tastes and the defects the CATA concordance identified, each group in its card as the concordance's resolved tree of that group — each identified note as its taxonomy badge with its identified children nested under it, levels 0 to 2 — and each note SHALL show its `name n/total` share inline next to its own badge, the evaluations that identified the note over the offering's total evaluations, with no separate legend beside the card. A group with no identified note SHALL show an empty text in its card and no share.

#### Scenario: Identified notes
- **WHEN** the CATA concordance identified main tastes or defects
- **THEN** each identified note renders as its taxonomy badge in its group's card, nested under the note it belongs to in the concordance's tree, with its `name n/total` share inline next to its badge

#### Scenario: Empty group
- **WHEN** the consensus identified no main taste, or no defect
- **THEN** its card shows the empty text and no share renders

#### Scenario: Unresolved reference
- **WHEN** an identified note matches no taxonomy
- **THEN** no badge and no share render for that note, its resolved children take its place, and the remaining notes render normally

### Requirement: Consensus detail by axis
Below a heading, the Consensus tab SHALL show one collapsible section per sensory-taxonomy axis — fragrance, aroma, flavor, aftertaste, mouthfeel, in that order — titled with the axis name and collapsed by default. Each section SHALL be a section card whose header band holds its collapsible header, the five cards 1rem apart on the page background with no card around them. Each SHALL show only the axis's identified notes, as the sensory taxonomy's resolved tree of that axis — each note as its taxonomy badge with its identified children nested under it, levels 0 to 2 — each note with its `name n/total` share inline next to its own badge and no separate legend; an axis with no identified note SHALL show the empty text and no share.

#### Scenario: Sections collapsed by default
- **WHEN** the Consensus tab renders
- **THEN** five section cards render in the axis order, 1rem apart, each with its axis name in its header band, and each is collapsed with its content out of the tab order

#### Scenario: Identified notes of an axis
- **WHEN** the visitor expands an axis section whose axis carries identified notes
- **THEN** each identified note of that axis renders as its taxonomy badge, nested under the note it belongs to in the axis's tree, with its `name n/total` share inline next to its badge, and no note of another axis renders

#### Scenario: Empty axis
- **WHEN** the visitor expands an axis section whose axis carries no identified note
- **THEN** the section shows the empty text and no share

### Requirement: Consensus panel kept as one view
The Consensus tab SHALL render its blocks — the score, the SCA attribute averages or the not-verified message, the counts and concordances, the Main tastes and Defects selections with their inline shares, the CATA wheel and the detail by axis — in that order, with the same structure, texts and accessible names for the same offering, taxonomy tree and locale, however the panel is organised internally. This requirement adds no behaviour: every block keeps what the other Consensus requirements of this capability state.

#### Scenario: Verified offering renders as before
- **WHEN** the Consensus tab renders for a verified offering carrying a score, attribute averages, counts, concordances and identified notes
- **THEN** the score, the attribute scales, the counts and concordances, the Main tastes and Defects cards with their inline shares, the CATA wheel and the five axis sections render in that order, each with its texts in the active locale

#### Scenario: Provisional offering renders as before
- **WHEN** the Consensus tab renders for a provisional offering
- **THEN** no score renders, the not-verified message renders in place of the attribute scales, and the remaining blocks render in the same order

## MODIFIED Requirements

### Requirement: Consensus Defects and Main tastes
The Consensus tab SHALL show the main tastes and the defects the CATA concordance identified, each group in its card as the concordance's resolved tree of that group — each identified note as its taxonomy badge with its identified children nested under it, levels 0 to 2 — and each note SHALL show its `name n/total` share inline next to its own badge, the evaluations that identified the note over the offering's total evaluations, with no separate legend beside the card. A group with no identified note SHALL show an empty text in its card and no share. Each tree SHALL start closed and open note by note as the offering card's taxonomy trees do (landing, "Taxonomy badge trees on the offering card"), the toggle of a note with children sitting right after its share.

#### Scenario: Trees closed at first with the toggle after the share
- **WHEN** the CATA concordance identified a main taste or a defect that has identified children
- **THEN** its card shows only the group's top-level notes, and that note's toggle, with the visible text `+`, renders right after its `name n/total` share

#### Scenario: Identified notes
- **WHEN** the CATA concordance identified main tastes or defects and the visitor opens the notes that have children
- **THEN** each identified note renders as its taxonomy badge in its group's card, nested under the note it belongs to in the concordance's tree, with its `name n/total` share inline next to its badge

#### Scenario: Empty group
- **WHEN** the consensus identified no main taste, or no defect
- **THEN** its card shows the empty text and no share renders

#### Scenario: Unresolved reference
- **WHEN** an identified note matches no taxonomy
- **THEN** no badge and no share render for that note, its resolved children take its place, and the remaining notes render normally

### Requirement: Consensus detail by axis
Below a heading, the Consensus tab SHALL show one collapsible section per sensory-taxonomy axis — fragrance, aroma, flavor, aftertaste, mouthfeel, in that order — titled with the axis name and collapsed by default. Each section SHALL be a section card whose header band holds its collapsible header, the five cards 1rem apart on the page background with no card around them. Each SHALL show only the axis's identified notes, as the sensory taxonomy's resolved tree of that axis — each note as its taxonomy badge with its identified children nested under it, levels 0 to 2 — each note with its `name n/total` share inline next to its own badge and no separate legend; an axis with no identified note SHALL show the empty text and no share. Each axis's tree SHALL start closed and open note by note as the offering card's taxonomy trees do (landing, "Taxonomy badge trees on the offering card"), the toggle of a note with children sitting right after its share.

#### Scenario: Sections collapsed by default
- **WHEN** the Consensus tab renders
- **THEN** five section cards render in the axis order, 1rem apart, each with its axis name in its header band, and each is collapsed with its content out of the tab order

#### Scenario: Axis trees closed at first
- **WHEN** the visitor expands an axis section whose axis carries an identified note with identified children
- **THEN** only the axis's top-level notes show, and that note's toggle, with the visible text `+`, renders right after its `name n/total` share

#### Scenario: Identified notes of an axis
- **WHEN** the visitor expands an axis section whose axis carries identified notes and opens the notes that have children
- **THEN** each identified note of that axis renders as its taxonomy badge, nested under the note it belongs to in the axis's tree, with its `name n/total` share inline next to its badge, and no note of another axis renders

#### Scenario: Empty axis
- **WHEN** the visitor expands an axis section whose axis carries no identified note
- **THEN** the section shows the empty text and no share

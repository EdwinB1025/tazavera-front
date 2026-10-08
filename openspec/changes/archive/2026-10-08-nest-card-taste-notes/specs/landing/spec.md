# Spec Delta

## REMOVED Requirements

### Requirement: Taxonomy badges on the offering card
**Reason**: The badges no longer render in three rows by level (scenario "Rows by level"); Product owner's decision of 2026-10-08 (AUT finding 18) replaces that layout with nested trees. The OpenSpec CLI refuses a MODIFIED block that drops a scenario and a requirement both removed and added under one name, so the requirement is replaced by "Taxonomy badge trees on the offering card".
**Migration**: "Taxonomy badge trees on the offering card" under ADDED Requirements replaces it, keeping every other scenario.

## ADDED Requirements

### Requirement: Taxonomy badge trees on the offering card
The taxonomy badges of an offering card SHALL come from the offering's consensus — every taxonomy reference of its CATA concordance, including nested children, where the notes marked on several aromatic attributes are already condensed into the single `aromatics` group — and never from its per-attribute sensory taxonomy. Each taxonomy value SHALL render once, however many times its reference appears, with the children of every occurrence nested under that single badge. Each badge SHALL carry the taxonomy's name in the active locale and the taxonomy's data color with the treatment of its own level. The badges SHALL render as nested trees following the concordance tree as the API delivers it: each top-level note starts a tree; its children render below it, indented, in one column behind a left connector line; and each child's own children render below that child, further indented, wrapping. The trees SHALL sit side by side and wrap onto further lines, so that no tree overflows the card at any viewport width. A reference that resolves to no taxonomy SHALL render no badge, and an offering without a consensus SHALL render no taxonomy badge. The hierarchy SHALL be exposed to assistive technologies as nested lists.

#### Scenario: Names by locale
- **WHEN** an offering card renders in the active locale
- **THEN** each taxonomy badge shows the taxonomy's name in that locale

#### Scenario: Nested trees
- **WHEN** an offering's concordance carries a top-level note with a child that has a child of its own
- **THEN** the child renders below the top-level note, indented, in one column behind a left connector line, and the grandchild renders below its parent child, further indented, each level as a list nested in the item of its parent

#### Scenario: Trees side by side
- **WHEN** an offering's concordance carries several top-level notes
- **THEN** each top-level note renders as its own tree, the trees side by side in one list that wraps onto further lines

#### Scenario: Unresolved reference
- **WHEN** a taxonomy reference matches no taxonomy
- **THEN** no badge renders for that reference and the remaining badges render normally

#### Scenario: Values from the consensus
- **WHEN** an offering carries both a per-attribute sensory taxonomy and a CATA concordance
- **THEN** the card's badges are exactly the resolved references of the CATA concordance and no reference found only in the sensory taxonomy renders

#### Scenario: Each value once
- **WHEN** the same taxonomy reference appears more than once in the offering's CATA concordance
- **THEN** its badge renders once

#### Scenario: Repeated reference keeps its children
- **WHEN** a taxonomy reference appears in several places of the concordance, each occurrence with its own children
- **THEN** its single badge renders at its first occurrence and the children of every occurrence render nested under it, each once

#### Scenario: No consensus
- **WHEN** an offering's CATA concordance is empty, whatever its sensory taxonomy holds
- **THEN** the card renders no taxonomy badge and the rest of its content renders normally

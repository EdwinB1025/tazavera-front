# Spec Delta

## MODIFIED Requirements

### Requirement: Flavor wheel
The system SHALL present an offering's aromatic consensus as an interactive flavor wheel: one segment per note of the offering's `cataConcordance` group of type `aromatics`, resolved against the olfactory taxonomies of `GET /taxonomies` for its name, description and colour. The rings SHALL expand from the centre outward one level at a time and SHALL be sized by the deepest level currently expanded, so the wheel rescales instantly as notes expand and collapse, each segment's span SHALL be proportional to its `count` within its siblings, the `evaluationCount` total SHALL sit at the centre, and each note's visible legend SHALL be its `count` over that total (for example `4/5`). Hovering or focusing a note SHALL make it the active note and show its name, its legend and its olfactory-taxonomy description in a fixed description panel. The notes SHALL keep the order of `GET /taxonomies` around the wheel and down the list.

#### Scenario: Ring 0 only at first
- **WHEN** the wheel first renders with resolved notes
- **THEN** only the innermost ring (level 0) shows, nothing is expanded, and that ring fills the wheel from the centre hole to the outer edge

#### Scenario: Rings follow the deepest expanded level
- **WHEN** the viewer expands or collapses notes, or presses Escape
- **THEN** the rings are resized at once to the deepest level that is expanded: one ring filling the wheel with nothing expanded, two rings sharing it with a level-0 note expanded, three with a level-1 note expanded, and back to one ring after Escape

#### Scenario: Activating a note expands it one level
- **WHEN** the viewer activates a note that has children
- **THEN** its children appear in the next ring inside the parent's span and its subtree appears in the note list, and several notes may be expanded at once

#### Scenario: Activating an expanded note collapses it
- **WHEN** the viewer activates a note that is already expanded
- **THEN** it and its descendants collapse back

#### Scenario: Segments sized by consensus
- **WHEN** the notes render
- **THEN** each root's span is proportional to its `count` over the sum of the root counts, each child's span is proportional to its `count` among its siblings and fills the parent's span, and a single note draws the full ring

#### Scenario: Segments separated by a gap
- **WHEN** the notes render
- **THEN** a visible gap in the card colour separates each segment from its neighbours and from the next ring

#### Scenario: Consensus legend
- **WHEN** a note renders in the wheel or in the note list
- **THEN** its visible legend is its `count` over the `evaluationCount` total, for example `4/5`

#### Scenario: Description on hover
- **WHEN** the pointer enters a note's segment or list row
- **THEN** that note becomes active and the panel shows its name, its legend and its olfactory-taxonomy description

#### Scenario: Pointer leaving keeps the last active note
- **WHEN** the pointer leaves the wheel after a note was shown
- **THEN** the last active note stays shown in the panel

#### Scenario: Note without a description
- **WHEN** the active note's taxonomy carries no description
- **THEN** the panel shows its name and legend with no description text

#### Scenario: Taxonomy colour treatment
- **WHEN** a segment or a swatch renders for a note
- **THEN** it carries the note's taxonomy colour with the depth opacity and the white/black label rule the "Taxonomy badge" requirement states, and its labels keep the contrast "Badge label contrast" states

#### Scenario: Every segment carries an arched label
- **WHEN** a segment renders
- **THEN** its label follows the curve of the segment along its outer edge, with its name and, where it fits, its legend

#### Scenario: Name shown on activation when it cannot fit
- **WHEN** a segment is too narrow for its name even when arched
- **THEN** the wheel shows that note's name only while the note is active, never truncated with an ellipsis and never in a smaller font, and the note stays reachable in the note list

#### Scenario: Unresolved or colourless notes are skipped
- **WHEN** a note's reference matches no taxonomy or its taxonomy carries no colour
- **THEN** that note and its subtree are skipped and the remaining notes render normally

#### Scenario: Empty state
- **WHEN** the evaluation total is 0, or the aromatics group has no notes, or no note resolves
- **THEN** the empty message shows in place of the wheel, the panel and the note list

#### Scenario: Loading is the host's
- **WHEN** the offering and the taxonomies are still loading
- **THEN** the host's loading state shows and the wheel does not render yet

#### Scenario: Read failure is the host's
- **WHEN** the read of the offering or of the taxonomies fails
- **THEN** the host's error state shows and the wheel never renders with unresolved data

### Requirement: Flavor wheel note list disclosure
The note list SHALL be collapsed by default behind a visible expand control that exposes whether the list is expanded and which list it controls. The control SHALL span the full width of its column, with the note list title at the start and a chevron at the end that points down while collapsed and up while expanded; its accessible name SHALL be the title and SHALL not change with the state. While collapsed, the note list SHALL be out of the tab order. Only the note list SHALL collapse: the description panel SHALL never collapse and stays beside the wheel.

#### Scenario: Note list collapsed at first
- **WHEN** the wheel first renders with resolved notes
- **THEN** the note list is collapsed and out of the tab order, its expand control shows collapsed with its chevron pointing down, and the wheel and the description panel show

#### Scenario: Expanding and collapsing the note list
- **WHEN** the viewer activates the note list's expand control
- **THEN** the note list toggles between expanded and collapsed, the control exposes the new state and turns its chevron, and the description panel stays shown

#### Scenario: Full-width expand control
- **WHEN** the expand control renders
- **THEN** it spans the full width of its column with the title at the start and the chevron at the end

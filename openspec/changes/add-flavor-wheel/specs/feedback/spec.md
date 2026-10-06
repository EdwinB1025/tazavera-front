# Spec Delta

## ADDED Requirements

### Requirement: Flavor wheel
The system SHALL present an offering's aromatic consensus as an interactive flavor wheel: one segment per note of the offering's `cataConcordance` group of type `aromatics`, resolved against the olfactory taxonomies of `GET /taxonomies` for its name, description and colour. The rings SHALL expand from the centre outward one level at a time, each segment's span SHALL be proportional to its `count` within its siblings, the `evaluationCount` total SHALL sit at the centre, and each note's visible legend SHALL be its `count` over that total (for example `4/5`). Hovering or focusing a note SHALL make it the active note and show its name, its legend and its olfactory-taxonomy description in a fixed description panel. The notes SHALL keep the order of `GET /taxonomies` around the wheel and down the list.

#### Scenario: Ring 0 only at first
- **WHEN** the wheel first renders with resolved notes
- **THEN** only the innermost ring (level 0) shows and nothing is expanded

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

### Requirement: Flavor wheel note list
The wheel SHALL carry a text alternative that is a note list structured as a tree: one row per visible note in wheel order, each carrying the note's name, a colour swatch and its `count` over the `evaluationCount` total, with its accessible name combining the note's name and its consensus legend. The list SHALL be operable by keyboard through a single tab stop, parents SHALL expose whether they are expanded, and colour SHALL never be the only carrier of meaning.

#### Scenario: Every note is reachable
- **WHEN** a segment is too narrow to show its name at rest
- **THEN** its note's row in the list still carries the name, the swatch and the legend

#### Scenario: Keyboard navigation
- **WHEN** the viewer navigates the list with the keyboard
- **THEN** Down and Up move to the next and previous visible rows, Right expands a collapsed parent or moves to the first child of an expanded one, Left collapses an expanded parent or moves to a child's parent, and Home and End move to the first and last visible rows

#### Scenario: Expand and collapse with Enter or Space
- **WHEN** the viewer presses Enter or Space on a parent row
- **THEN** its expansion toggles and its note's segments follow in the wheel

#### Scenario: One tab stop
- **WHEN** the viewer tabs into the expanded list
- **THEN** focus lands on the last active note's row, or on the first row before any interaction, and the whole list is one tab stop

#### Scenario: Escape returns to the centre
- **WHEN** the viewer presses Escape
- **THEN** every note collapses back to the innermost ring and focus moves to the focused note's level-0 ancestor

#### Scenario: Focus drives the wheel
- **WHEN** a row receives keyboard focus
- **THEN** its note becomes active, the panel shows its description and the wheel highlights its segment

#### Scenario: Activation without moving focus
- **WHEN** the viewer clicks or taps a segment or a row
- **THEN** its note becomes active and the list's active row without moving focus

### Requirement: Flavor wheel note list disclosure
The note list SHALL be collapsed by default behind a visible expand control that exposes whether the list is expanded and which list it controls. Only the note list SHALL collapse: the description panel SHALL never collapse and stays beside the wheel.

#### Scenario: Note list collapsed at first
- **WHEN** the wheel first renders with resolved notes
- **THEN** the note list is collapsed, its expand control shows collapsed, and the wheel and the description panel show

#### Scenario: Expanding and collapsing the note list
- **WHEN** the viewer activates the note list's expand control
- **THEN** the note list toggles between expanded and collapsed and the control exposes the new state, while the description panel stays shown

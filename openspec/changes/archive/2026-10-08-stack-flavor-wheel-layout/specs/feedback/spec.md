## ADDED Requirements

### Requirement: Flavor wheel with every level
The system SHALL present an offering's aromatic consensus as an interactive flavor wheel: one segment per note of the offering's `cataConcordance` group of type `aromatics`, resolved against the olfactory taxonomies of `GET /taxonomies` for its name, description and colour. The wheel SHALL draw every level of the notes from its first render, level 0 in the innermost ring and each deeper level in the next ring outward, the rings sharing the width from the centre hole to the outer edge equally; expanding or collapsing notes SHALL change only the note list, never the wheel. Each segment's span SHALL be proportional to its `count` within its siblings, the `evaluationCount` total SHALL sit at the centre, and each note's visible legend SHALL be its `count` over that total (for example `4/5`). Hovering or focusing a note SHALL make it the active note and show its name, its legend and its olfactory-taxonomy description in a fixed description panel. The notes SHALL keep the order of `GET /taxonomies` around the wheel and down the list.

#### Scenario: Every level from the start
- **WHEN** the wheel first renders with resolved notes
- **THEN** every note shows, level 0 in the innermost ring and each deeper level in the next ring outward, one ring per level down to the deepest level of the notes, the rings sharing the width from the centre hole to the outer edge equally, and nothing is expanded in the note list

#### Scenario: Expansion leaves the wheel unchanged
- **WHEN** the viewer expands or collapses notes, or presses Escape
- **THEN** the wheel keeps the same segments and rings, and only the note list changes

#### Scenario: Activating a note expands it one level
- **WHEN** the viewer activates a note that has children
- **THEN** it becomes active and is highlighted in the wheel, its subtree appears in the note list, and several notes may be expanded at once

#### Scenario: Activating an expanded note collapses it
- **WHEN** the viewer activates a note that is already expanded
- **THEN** its rows and its descendants' rows collapse back in the note list

#### Scenario: Stacked on every width
- **WHEN** the wheel renders at any width
- **THEN** the wheel, centred, comes first, then the group legend when groups are set apart, then the description panel, then the note list behind its expand control, one below the other, the panel and the note list at the full width of the wheel's figure

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

## MODIFIED Requirements

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
- **THEN** its expansion toggles and its children's rows show or hide

#### Scenario: One tab stop
- **WHEN** the viewer tabs into the expanded list
- **THEN** focus lands on the last active note's row, or on the first row before any interaction, and the whole list is one tab stop

#### Scenario: Escape returns to the centre
- **WHEN** the viewer presses Escape
- **THEN** every row collapses back to the level-0 rows and focus moves to the focused note's level-0 ancestor

#### Scenario: Focus drives the wheel
- **WHEN** a row receives keyboard focus
- **THEN** its note becomes active, the panel shows its description and the wheel highlights its segment

#### Scenario: Activation without moving focus
- **WHEN** the viewer clicks or taps a segment or a row
- **THEN** its note becomes active and the list's active row without moving focus

### Requirement: Flavor wheel note list disclosure
The note list SHALL be collapsed by default behind a visible expand control that exposes whether the list is expanded and which list it controls. The control SHALL span the full width of the wheel's figure, with the note list title at the start and a chevron at the end that points down while collapsed and up while expanded; its accessible name SHALL be the title and SHALL not change with the state. While collapsed, the note list SHALL be out of the tab order. Only the note list SHALL collapse: the description panel SHALL never collapse and stays shown between the wheel and the note list.

#### Scenario: Note list collapsed at first
- **WHEN** the wheel first renders with resolved notes
- **THEN** the note list is collapsed and out of the tab order, its expand control shows collapsed with its chevron pointing down, and the wheel and the description panel show

#### Scenario: Expanding and collapsing the note list
- **WHEN** the viewer activates the note list's expand control
- **THEN** the note list toggles between expanded and collapsed, the control exposes the new state and turns its chevron, and the description panel stays shown

#### Scenario: Full-width expand control
- **WHEN** the expand control renders
- **THEN** it spans the full width of the wheel's figure with the title at the start and the chevron at the end

### Requirement: Flavor wheel kept as one view
The flavor wheel SHALL render the wheel with its centre total, the group legend when groups are set apart, the description panel and the note list behind its expand control, in that order, with the same segments, labels, structure, texts, accessible names, tree attributes, tab stop, keyboard keys and pointer behaviour for the same notes, total, texts and groups, however the wheel is organised internally. This requirement adds no behaviour: every part keeps what the "Flavor wheel with every level", "Flavor wheel note list" and "Flavor wheel note list disclosure" requirements of this capability state.

#### Scenario: Wheel renders as before
- **WHEN** the wheel renders with resolved notes, a total and texts
- **THEN** the wheel with its segments, arched labels and centre total, the description panel showing the hint and the collapsed note list render in that order, each with its texts and accessible names

#### Scenario: Keyboard and pointer behave as before
- **WHEN** the viewer hovers or clicks a segment or a row, or navigates the expanded note list with Down, Up, Right, Left, Home, End, Enter, Space or Escape
- **THEN** the active note, the expanded notes, the focused row and the single tab stop change exactly as the "Flavor wheel with every level" and "Flavor wheel note list" requirements state

#### Scenario: Empty wheel renders as before
- **WHEN** the evaluation total is 0 or there are no notes
- **THEN** only the empty message renders, in place of the wheel, the panel and the note list

## REMOVED Requirements

### Requirement: Flavor wheel
**Reason**: Replaced by "Flavor wheel with every level" (findings 29, 31): OpenSpec refuses a MODIFIED block that drops the scenarios "Ring 0 only at first" and "Rings follow the deepest expanded level".
**Migration**: None; the wheel draws every level from the start.

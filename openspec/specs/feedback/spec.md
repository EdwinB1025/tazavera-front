# feedback Specification

## Purpose
Defines Tazavera's status and messaging components: how the interface reports state to the user — evaluation ratings, verification status and sensory taxonomy labels now, callouts, toasts, modals and empty states in later changes.

## Requirements

### Requirement: Badge presentation
A badge SHALL render as a compact chip carrying its label, and its icon when it has one, on one line, with inner padding around them, in the badge text treatment with the field corner radius of the active theme, and SHALL convey meaning through its label and icon as well as its colors.

#### Scenario: Chip presentation
- **WHEN** a badge renders in either theme
- **THEN** it appears as a compact chip with the badge text treatment and the field radius of the active theme

### Requirement: Rating badge
A rating badge SHALL classify a cupping score into one of four tiers — exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, and commercial below 80 — each rendered in its own rating treatment.

#### Scenario: Exceptional tier
- **WHEN** a rating badge classifies a score of 90 or above
- **THEN** it renders in the exceptional rating treatment

#### Scenario: Excellent tier
- **WHEN** a rating badge classifies a score from 85 to below 90
- **THEN** it renders in the excellent rating treatment

#### Scenario: Good tier
- **WHEN** a rating badge classifies a score from 80 to below 85
- **THEN** it renders in the good rating treatment

#### Scenario: Commercial tier
- **WHEN** a rating badge classifies a score below 80
- **THEN** it renders in the commercial rating treatment

### Requirement: Verification status badge
A verification status badge SHALL report an offering's verification state — verified or provisional — with an icon and a label in the state's status treatment: a check icon with the verified label for a verified offering, a clock icon with the provisional label for a provisional offering.

#### Scenario: Verified state
- **WHEN** a verification status badge reports a verified offering
- **THEN** it renders a check icon and the verified label in the verified status treatment

#### Scenario: Provisional state
- **WHEN** a verification status badge reports a provisional offering
- **THEN** it renders a clock icon and the provisional label in the provisional status treatment

### Requirement: Taxonomy badge
A taxonomy badge SHALL render its label on the taxonomy's data color as its background. In each theme, its label SHALL be white when the relative luminance of the rendered background (the data color at its depth opacity over that theme's card surface) is at most 0.179, and black above it. A badge at taxonomy level 1 SHALL render its background at 92% opacity and one at level 2 at 85% opacity.

#### Scenario: Data color background
- **WHEN** a taxonomy badge renders for a taxonomy
- **THEN** its background is that taxonomy's color

#### Scenario: White text on dark colors
- **WHEN** in the active theme the rendered background's relative luminance is at most 0.179
- **THEN** the badge label renders white

#### Scenario: Black text on light colors
- **WHEN** in the active theme the rendered background's relative luminance is above 0.179
- **THEN** the badge label renders black

#### Scenario: Depth reduces the background
- **WHEN** a taxonomy badge renders at level 1 or level 2
- **THEN** its background renders at 92% or 85% opacity respectively, while its label stays fully opaque

### Requirement: Badge label contrast
Every badge label SHALL keep a contrast ratio of at least 4.5:1 against its rendered background in both themes (WCAG 2.2, SC 1.4.3).

#### Scenario: Rating and status pairs
- **WHEN** a rating or verification status badge renders in either theme
- **THEN** its label measures at least 4.5:1 against its background — the rating pairs measure 4.68–5.13:1 in the traditional theme and 6.42–7.12:1 in the dark theme

#### Scenario: Taxonomy pairs
- **WHEN** a taxonomy badge renders for any data color, at any level, in either theme
- **THEN** its label measures at least 4.5:1 against the rendered background

### Requirement: Shared chip geometry
The badge's geometry — its text treatment, inner padding, icon gap, one-line layout and the field corner radius of the active theme — SHALL have exactly one definition, and every compact chip SHALL render from that shared definition instead of spelling the geometry out again. A chip MAY add its own treatments on top of it.

#### Scenario: Chip matches the badge geometry
- **WHEN** a compact chip other than a badge renders in either theme
- **THEN** it carries the badge's geometry — the badge text treatment, inner padding, icon gap, one-line layout and the field radius of the active theme — while a badge keeps rendering that same geometry

#### Scenario: Second geometry definition detected
- **WHEN** verification finds the badge's geometry spelled out again outside its single definition
- **THEN** verification fails and names the file holding the second definition

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

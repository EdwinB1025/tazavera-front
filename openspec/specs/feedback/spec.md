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
A taxonomy badge SHALL render its label on the taxonomy's data color as its background. In each theme, its label SHALL be white when the relative luminance of the rendered background (the data color at its depth opacity over the surface it renders on: the card surface, or the sidebar surface inside the inverse variant) is at most 0.179, and black above it. A badge at taxonomy level 1 SHALL render its background at 92% opacity and one at level 2 at 85% opacity.

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

#### Scenario: Label over the sidebar surface
- **WHEN** a level-1 taxonomy badge renders inside the inverse variant
- **THEN** in each theme its label is white or black by the rendered background over that theme's sidebar surface, not over the card surface

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

### Requirement: Confirmation dialog
A confirmation dialog SHALL ask the user to confirm one destructive action before the consuming capability runs it, presenting the title, the description and two actions — the destructive action and a cancellation — whose texts the consuming capability supplies. While it is open it SHALL be exposed to assistive technology as an alert dialog named by its title and described by its description, with the content behind it inert.

#### Scenario: Open
- **WHEN** the confirmation dialog opens
- **THEN** its panel renders centred over a dimmed page, it is exposed as an alert dialog named by its title and described by its description, and the content behind it cannot be interacted with

#### Scenario: Initial focus on the cancellation
- **WHEN** the confirmation dialog opens
- **THEN** keyboard focus starts on the cancellation action, the least destructive one

#### Scenario: Confirming
- **WHEN** the user activates the destructive action
- **THEN** the dialog hands the confirmation to the consuming capability, which runs the request and closes the dialog on success

#### Scenario: Cancelling with Escape
- **WHEN** the user presses Escape while no request is running
- **THEN** the dialog cancels, closes and runs no request

#### Scenario: The overlay does not close
- **WHEN** the user activates the overlay or the content behind the dialog
- **THEN** the dialog stays open

#### Scenario: Focus returns to the trigger
- **WHEN** the confirmation dialog closes
- **THEN** keyboard focus returns to the control that opened it

#### Scenario: Request running
- **WHEN** the request is running
- **THEN** the destructive action shows its busy treatment, the cancellation action is disabled and Escape does not close the dialog

#### Scenario: Request failed
- **WHEN** the request fails
- **THEN** the error message supplied by the consuming capability renders in a live alert region below the description, the dialog stays open and the destructive action can be activated again

#### Scenario: Actions on a narrow viewport
- **WHEN** the confirmation dialog renders below the small breakpoint
- **THEN** its actions stack in one column with the destructive action above the cancellation, each filling the panel's width, and the panel stays within the viewport width minus 2rem

#### Scenario: Actions on a wider viewport
- **WHEN** the confirmation dialog renders at or above the small breakpoint
- **THEN** its actions sit in one row aligned to the right with the cancellation before the destructive action, and the panel's width stops growing at 32rem

### Requirement: Request status messages
A view SHALL report the state of a request with the shared status presentations: a loading status for a request still running — a polite status region carrying its text beside a spinner that assistive technology ignores and that does not animate under reduced motion; a form status for a finished write — a success as a polite status region carrying its text beside a check icon that assistive technology ignores, and an error as an alert carrying its text, never colour alone; and a step-up notice for a write answered `403` — an alert carrying its text and a "Confirm identity" action that starts the write-scope sign in synchronously inside its click. Each presentation SHALL add no text of its own.

#### Scenario: Loading status
- **WHEN** a view reports a request that is still running
- **THEN** a polite status region renders its text beside a spinner that is hidden from assistive technology and stays still under reduced motion

#### Scenario: Form status success
- **WHEN** a form's write succeeds and the view reports it
- **THEN** a polite status region renders the success text beside a check icon that is hidden from assistive technology

#### Scenario: Form status error
- **WHEN** a form's write is rejected or fails and the view reports it
- **THEN** an alert renders the error text, conveyed by its text and never by colour alone

#### Scenario: Step-up notice
- **WHEN** a write is answered `403` and the view reports it
- **THEN** an alert renders the notice text with a "Confirm identity" action, and activating that action starts the write-scope sign in synchronously inside that click, keeping the page and its input

#### Scenario: Consumer text only
- **WHEN** any status presentation renders
- **THEN** every visible text comes from the consuming capability's message catalog and no text comes from the presentation itself

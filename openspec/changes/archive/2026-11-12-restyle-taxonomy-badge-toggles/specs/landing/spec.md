## MODIFIED Requirements

### Requirement: Taxonomy badge trees on the offering card
The taxonomy badges of an offering card SHALL come from the offering's consensus — every taxonomy reference of its CATA concordance, including nested children, where the notes marked on several aromatic attributes are already condensed into the single `aromatics` group — and never from its per-attribute sensory taxonomy. Each taxonomy value SHALL render once, however many times its reference appears, with the children of every occurrence nested under that single badge. Each badge SHALL carry the taxonomy's name in the active locale and the taxonomy's data color with the treatment of its own level. The badges SHALL render as nested trees following the concordance tree as the API delivers it: each top-level note starts a tree; its children render below it, indented, in one column behind a left connector line; and each child's own children render below that child, further indented, wrapping. The trees SHALL sit side by side and wrap onto further lines, so that no tree overflows the card at any viewport width. A reference that resolves to no taxonomy SHALL render no badge, and an offering without a consensus SHALL render no taxonomy badge. The hierarchy SHALL be exposed to assistive technologies as nested lists.

Every tree SHALL start closed, showing only its top-level notes. A note that has children SHALL show a toggle button inside its own badge, right after the note's name, as the badge's last element, at its end and separated from the name by a visible gap, whose visible text is `+` while the note is closed and `−` while it is open; a note without children SHALL show no toggle. Only the toggle SHALL be interactive: the badge itself SHALL carry no action, no role and no stop in the tab order. Opening a note SHALL show its direct children, each closed; closing a note SHALL close every descendant, so reopening it shows only its direct children, closed. The toggle SHALL expose its expanded state and the child list it controls, SHALL be named from the active locale's message catalog as showing or hiding the notes under the note's label, and its `+` or `−` glyph SHALL be hidden from assistive technologies. Every toggle SHALL render in one colour treatment on every badge, whatever the badge's own label colour: a small chip filled with the textarea surface colour (white in the traditional theme, the dark textarea surface in the dark theme), its glyph and a 1px ring in the strong text colour, so that its glyph and its boundary (the fill or the ring) reach at least 3:1 against the badge in both themes. Every badge of a tree, with or without a toggle and at every level, SHALL show its name at 12 pixels below the medium breakpoint (48rem) and at 14 pixels from it up, in the badge's weight and line height; every other badge keeps its text size. The toggle's visible chip SHALL be 16 by 16 pixels from the medium breakpoint up and about 14 by 14 pixels below it, with its `+` or `−` glyph at the size of the badge's name, inside a hit area of at least 24 by 24 pixels centred on the chip at every width, and a badge with a toggle SHALL stand as high as a badge without one at every width. The open state SHALL live only on the page: it SHALL NOT be remembered across a reload or a navigation, and opening or closing a note SHALL change neither the address nor any request to the API.

#### Scenario: Names by locale
- **WHEN** an offering card renders in the active locale
- **THEN** each taxonomy badge shows the taxonomy's name in that locale

#### Scenario: Closed at first
- **WHEN** an offering card renders a tree whose top-level note has children
- **THEN** only the top-level notes show and no child of any note shows

#### Scenario: Toggle on notes with children
- **WHEN** an offering card renders a top-level note with children and a top-level note without children
- **THEN** the note with children shows a toggle button inside its own badge, right after the note's name, with the visible text `+`; the badge itself is neither a button nor focusable; and the note without children shows no toggle

#### Scenario: Toggle at the end of its badge
- **WHEN** an offering card renders a top-level note with children whose badge's label is white, and another whose badge's label is black
- **THEN** in each badge the toggle is the last element, after the note's name and separated from it; both toggles carry the same chip treatment: the textarea surface colour as fill (white in the traditional theme, the dark textarea surface in the dark theme), the strong text colour for the glyph and the 1px ring, a visible box of about 14 pixels below the medium breakpoint and 16 pixels from it up, and a hit area of at least 24 by 24 pixels at every width; and each badge's name and glyph show at 12 pixels below the medium breakpoint and 14 pixels from it up

#### Scenario: Opening a note
- **WHEN** the visitor activates the toggle of a top-level note whose child has children of its own
- **THEN** the toggle's visible text becomes `−`, the note's children show, and that child shows its own toggle with `+` and none of its children; activating the child's toggle then shows its children

#### Scenario: Closing a note closes its descendants
- **WHEN** the visitor opens a top-level note and one of its children, closes the top-level note and opens it again
- **THEN** the top-level note's children show, and the child's toggle reads `+` and none of the child's children show

#### Scenario: Accessible toggle
- **WHEN** a note with children renders closed, and then open
- **THEN** its toggle is a button whose expanded state is false and then true, that controls the note's child list, whose accessible name is the catalog's "show the notes under" text with the note's label while closed and the "hide the notes under" text with the label while open, and whose `+` or `−` glyph is hidden from assistive technologies

#### Scenario: Open state stays on the page
- **WHEN** the visitor opens a note and the card renders again after a reload or a navigation
- **THEN** the address did not change, no request was sent when the note opened, and the tree renders closed again

#### Scenario: Nested trees
- **WHEN** an offering's concordance carries a top-level note with a child that has a child of its own, and the visitor opens the top-level note and the child
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

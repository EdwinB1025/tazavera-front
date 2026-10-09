## ADDED Requirements

### Requirement: Action button widths
An action button with a label in the primary or a positional treatment SHALL be at least its size's action width — 10rem for the standard size, 7.5rem for the compact size — at every viewport width, and a longer label SHALL grow the button without wrapping or truncating. Action buttons without a label, the navigation treatment and the pagination controls keep their own geometry.

#### Scenario: Minimum width per size
- **WHEN** an action button with a label renders in the standard or the compact size, directly or as a route button
- **THEN** it is at least 10rem or 7.5rem wide and its label stays on one line

### Requirement: Action group
Two or more action buttons shown together SHALL render in one shared action group. Below the medium breakpoint (768px) the group SHALL be a grid of two equal columns in which each button fills its cell, so the buttons of a group have the same width; three or more buttons wrap two per row and an odd last one keeps the cell width. From 768px the group SHALL be a wrapping row 0.75rem apart, aligned to the start or the end as its consumer chooses, in which each button keeps its size's action width and does not stretch. A status line of the actions SHALL stay outside the group's cells.

#### Scenario: Equal columns on mobile, predefined widths from 768px
- **WHEN** two or more action buttons render in an action group
- **THEN** below 768px they fill two equal columns, and from 768px they form a wrapping row in which each keeps its action width

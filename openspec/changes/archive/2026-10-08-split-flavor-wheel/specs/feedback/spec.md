## ADDED Requirements

### Requirement: Flavor wheel kept as one view
The flavor wheel SHALL render the wheel with its centre total, the group legend when groups are set apart, the description panel and the note list behind its expand control, in that order, with the same segments, labels, structure, texts, accessible names, tree attributes, tab stop, keyboard keys and pointer behaviour for the same notes, total, texts and groups, however the wheel is organised internally. This requirement adds no behaviour: every part keeps what the "Flavor wheel", "Flavor wheel note list" and "Flavor wheel note list disclosure" requirements of this capability state.

#### Scenario: Wheel renders as before
- **WHEN** the wheel renders with resolved notes, a total and texts
- **THEN** the wheel with its segments, arched labels and centre total, the description panel showing the hint and the collapsed note list render in that order, each with its texts and accessible names

#### Scenario: Keyboard and pointer behave as before
- **WHEN** the viewer hovers or clicks a segment or a row, or navigates the expanded note list with Down, Up, Right, Left, Home, End, Enter, Space or Escape
- **THEN** the active note, the expanded notes, the focused row and the single tab stop change exactly as the "Flavor wheel" and "Flavor wheel note list" requirements state

#### Scenario: Empty wheel renders as before
- **WHEN** the evaluation total is 0 or there are no notes
- **THEN** only the empty message renders, in place of the wheel, the panel and the note list

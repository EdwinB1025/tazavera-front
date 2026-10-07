# Spec Delta

## ADDED Requirements

### Requirement: Label/value row
A label/value row SHALL pair one term with its value in a single row: the term at the start of the row and the value at the end, at least 1rem apart, the value wrapping onto its own line when the row is too narrow for both. Rows rendered together SHALL keep description-term and description semantics for assistive technology, and the row SHALL contribute no text or data of its own.

#### Scenario: Term and value
- **WHEN** a label/value row renders where both parts fit on one line
- **THEN** the term sits at the start of the row and its value at the end

#### Scenario: Wrapping row
- **WHEN** the row is too narrow for the term and the value on one line
- **THEN** the value wraps onto its own line below the term and nothing overflows the row

#### Scenario: Description semantics
- **WHEN** several label/value rows render together as a data list
- **THEN** each term is a description term and each value is its description

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a label/value row
- **THEN** the rendered text and data are exactly what the consumer supplied

### Requirement: Tabs
A tabbed content block SHALL present its tab labels and exactly one panel at a time: the selected tab is marked as selected and its panel renders while the other panels render nothing. The arrow keys SHALL move the focus along the tab labels without changing the visible panel, and activating the focused tab SHALL make its panel the visible one. The block SHALL decide nothing about its content: its consumer supplies the tab labels, the panels' content and the selected tab.

#### Scenario: One panel at a time
- **WHEN** a tabbed content block renders
- **THEN** exactly one panel renders and the other tabs' panels render nothing

#### Scenario: Selecting a tab
- **WHEN** the visitor activates a tab label
- **THEN** that tab is marked as selected and its panel becomes the visible one

#### Scenario: Arrow keys move the focus only
- **WHEN** the visitor presses the arrow keys along the tab labels
- **THEN** the focus moves between the tab labels and the visible panel does not change

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a tabbed content block
- **THEN** the rendered text and data are exactly what the consumer supplied

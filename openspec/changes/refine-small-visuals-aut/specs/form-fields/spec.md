## MODIFIED Requirements

### Requirement: Bean scale
A bean scale SHALL let the user choose one affective score from 1 to 9 and show it as a row of nine bean marks whose filled marks run from the first up to the chosen score, the rest rendered empty. It SHALL present its group name above the row and the score as text beside the row, and SHALL accept an optional help text and an optional error message supplied by the consuming capability, marking a required score as required. A bean scale in read-only mode SHALL display a score without offering a choice.

#### Scenario: Choosing a score
- **WHEN** the user activates one of the nine beans
- **THEN** that bean's number becomes the score, the beans from the first up to it render filled and the rest render empty

#### Scenario: Value as text
- **WHEN** a bean scale renders
- **THEN** the score text beside the row shows the value text the consuming capability supplied, whatever the score or its absence

#### Scenario: Group name and options
- **WHEN** a bean scale renders
- **THEN** its group name appears above the row and identifies the group for assistive technology, and the nine options are named "1" to "9"

#### Scenario: Keyboard operation
- **WHEN** the bean scale has keyboard focus
- **THEN** the user chooses with the keyboard alone: Right and Up select one point more, Left and Down one point less, Home selects 1 and End selects 9, and the row offers a single tab stop

#### Scenario: Hover feedback
- **WHEN** the pointer hovers an enabled bean
- **THEN** the only change is the pointer cursor

#### Scenario: Help and error
- **WHEN** a bean scale shows help text and an error message
- **THEN** both render below the row in their typographic roles, assistive technology reads them with the group, help before error, and the error is never conveyed by color alone

#### Scenario: Error state
- **WHEN** a bean scale shows an error message
- **THEN** the message renders below the row and the group is exposed as invalid to assistive technology, the beans offering no boundary of their own to recolor

#### Scenario: Required
- **WHEN** a bean scale is required
- **THEN** its options are marked required

#### Scenario: Read-only display
- **WHEN** a bean scale displays a read-only score
- **THEN** it renders as a meter over 0 to 9 that exposes its numeric value and announces the accessible value text the consuming capability supplied, offers no choice and no tab stop, fills the beans up to the whole part of the score, renders the next bean filled only up to the fraction of the score, and leaves the rest empty

#### Scenario: The mark's background stays inside the bean
- **WHEN** a bean renders
- **THEN** its filled or empty colour shows only inside the bean's outline

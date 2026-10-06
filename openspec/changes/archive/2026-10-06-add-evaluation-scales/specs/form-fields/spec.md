# Spec Delta

## ADDED Requirements

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

### Requirement: Intensity slider
An intensity slider SHALL let the user choose one descriptive intensity from 0 to 15 in whole steps and show it as a slider track filled from the start up to the chosen value in the gradient from the low end to the high end of the scale. It SHALL present its label and the value text the consuming capability supplied in one header row, and the marks 0, 5, 10 and 15 with the three scale labels below the track. It SHALL accept an optional help text and an optional error message supplied by the consuming capability. With no value it SHALL show intensity 0, and in read-only mode it SHALL display an intensity without offering a choice.

#### Scenario: Choosing an intensity
- **WHEN** the user moves the slider
- **THEN** an integer from 0 to 15 becomes the intensity and the track fills from the start to that proportion of its width

#### Scenario: No value shows zero
- **WHEN** an intensity slider renders with no value
- **THEN** it shows intensity 0 with no filled track and the thumb at the start of the track

#### Scenario: Label and value
- **WHEN** an intensity slider renders
- **THEN** its label sits at the left of the header row and the supplied value text at the right

#### Scenario: Marks and scale labels
- **WHEN** an intensity slider renders
- **THEN** the marks 0, 5, 10 and 15 and the three supplied scale labels render below the track, hidden from assistive technology while the slider announces the accessible value text the consuming capability supplied

#### Scenario: Keyboard operation
- **WHEN** the slider has keyboard focus
- **THEN** the user changes the intensity in whole steps with the keyboard alone

#### Scenario: Hover feedback
- **WHEN** the pointer hovers an enabled slider
- **THEN** the only change is the pointer cursor

#### Scenario: Help and error
- **WHEN** an intensity slider shows help text and an error message
- **THEN** both render below it in their typographic roles, assistive technology reads them with the slider, help before error, and the error is never conveyed by color alone

#### Scenario: Error state
- **WHEN** an intensity slider shows an error message
- **THEN** the message renders below it and the slider is exposed as invalid to assistive technology

#### Scenario: Read-only display
- **WHEN** an intensity slider displays a read-only intensity
- **THEN** it renders the same track and fill with no thumb as a meter over 0 to 15 that exposes its numeric value and announces the accessible value text the consuming capability supplied, and offers no choice and no tab stop

### Requirement: Descriptor chip group
A descriptor chip group SHALL let the user choose any number of sensory descriptors from rows of taxonomy options and show each option as a chip, toggling the option in the chosen set each time its chip is activated. It SHALL present its name as the title of the block, present a row's own title as that row's title when it has one, and accept an optional help text and an optional error message supplied by the consuming capability. In read-only mode it SHALL display the chosen options without offering a choice.

#### Scenario: Toggling a descriptor
- **WHEN** the user activates a chip
- **THEN** its option joins the chosen set, and activating a chosen chip removes it from the set

#### Scenario: Unselected chip
- **WHEN** a chip's option is not chosen
- **THEN** the chip shows a neutral boundary, the taxonomy's data-color dot before the label and the label in the strong text treatment

#### Scenario: Chosen chip
- **WHEN** a chip's option is chosen
- **THEN** the chip keeps the same neutral boundary and its content becomes that option's taxonomy badge with a check mark before the label, so the chosen state is carried by the mark and the badge and not by color alone

#### Scenario: Group and row titles
- **WHEN** a descriptor chip group renders
- **THEN** its name is presented as the block's title for assistive technology, each titled row is identified as a group by its title, and the shared row without a title stays part of the block

#### Scenario: Rows wrap
- **WHEN** the chips of a row exceed the width available
- **THEN** they wrap to the next line within their row and the block causes no horizontal scrolling

#### Scenario: Keyboard operation
- **WHEN** the descriptor chip group has keyboard focus
- **THEN** the block offers a single tab stop, the user moves among the chips in reading order with the arrow keys and toggles them with the keyboard alone, and each chip is exposed to assistive technology as pressed or not pressed

#### Scenario: Help and error
- **WHEN** a descriptor chip group shows help text and an error message
- **THEN** both render below it in their typographic roles, assistive technology reads them with the group, help before error, and the error is never conveyed by color alone

#### Scenario: Error state
- **WHEN** a descriptor chip group shows an error message
- **THEN** the message renders below it and the group is exposed as invalid to assistive technology

#### Scenario: Read-only display
- **WHEN** a descriptor chip group displays read-only choices
- **THEN** only the chosen options render, as plain taxonomy badges in their rows, rows with nothing chosen are omitted, with nothing chosen at all the empty text the consuming capability supplied renders, and no chip button renders

## MODIFIED Requirements

### Requirement: Inverse variant on dark surfaces
A field, text input, password input, select, checkbox or radio group placed on a dark surface SHALL render in the inverse variant: readable label, help and option texts, a visible boundary at rest that becomes more prominent on hover where the design defines one, a readable italic placeholder, the inverse error treatment for the error message and the control's error boundary, and the same single shared focus indicator whose colors resolve to the inverse focus tokens of the active theme. The bean scale, intensity slider and descriptor chip group have no inverse variant: they render in their standard treatment on the content surfaces.

#### Scenario: Rest on dark surface
- **WHEN** an inverse control renders on a dark surface in either theme
- **THEN** its texts reach at least 4.5:1 and its boundary at least 3:1 against that surface

#### Scenario: Hover on dark surface
- **WHEN** the pointer hovers an inverse text input or select
- **THEN** its boundary becomes more prominent

#### Scenario: Focus on dark surface
- **WHEN** an inverse control receives keyboard focus
- **THEN** the shared focus ring with its offset renders in the inverse focus colors, with at least 3:1 contrast against the dark surface, and the control renders no focus treatment of its own

#### Scenario: Error on dark surface
- **WHEN** an inverse field, checkbox or radio group shows an error message
- **THEN** the message and the control's error boundary render in the inverse error treatment with at least 4.5:1 contrast against the dark surface, and the error is never conveyed by color alone

#### Scenario: Checked controls on dark surface
- **WHEN** an inverse checkbox or radio option is checked
- **THEN** its fill, check mark and dot render as on light surfaces, the mark or dot identifiable against the fill

#### Scenario: No inverse variant on the scale controls
- **WHEN** a bean scale, intensity slider or descriptor chip group renders in either theme
- **THEN** it renders in its standard treatment on the content surface it is placed on and offers no inverse variant

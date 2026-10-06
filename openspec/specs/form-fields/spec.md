# form-fields Specification

## Purpose
Defines Tazavera's data-entry controls: how a field presents a label, help text and error message and binds them to its control, and how text input, password input, select, textarea, checkbox and radio group accept values in both themes, including on dark surfaces.

## Requirements

### Requirement: Field structure and association
A field SHALL present its label above the control, an optional help text and an optional error message below the control, and SHALL bind the label, the help text and the error message to its control so assistive technology reads them together with the control's state. A field SHALL hold a text input, password input, select or textarea; a checkbox and a radio group carry their own label, help text and error message and are never placed in a field. The texts are supplied by the consuming capability.

#### Scenario: Presentation
- **WHEN** a field renders with a label, a control and help text
- **THEN** the label appears above the control and the help text below it, each in its typographic role

#### Scenario: Label association
- **WHEN** assistive technology reaches the control
- **THEN** the field's label identifies it

#### Scenario: Required marking
- **WHEN** a field is required
- **THEN** a visible asterisk next to the label marks it while the asterisk stays hidden from assistive technology, and the control is marked required

#### Scenario: Error presentation
- **WHEN** a field shows an error message, whether it originates locally or from an API validation response
- **THEN** the message renders below the control, the control's boundary switches to the error treatment, the control is exposed as invalid to assistive technology, and the error is never conveyed by color alone

#### Scenario: Help and error together
- **WHEN** a field shows both help text and an error message
- **THEN** the control is associated with both messages

#### Scenario: Control without a field
- **WHEN** a text input, password input, select or textarea renders without a field around it
- **THEN** it accepts input and shows its own states with no label, help text or error message associated, and the accessible name supplied by the consuming capability identifies it

### Requirement: Text input
A text input SHALL accept single-line text and show its placeholder in italics while it has no value.

#### Scenario: Typing
- **WHEN** the user types into an enabled text input
- **THEN** the typed characters become its value and render in the control text treatment

#### Scenario: Placeholder
- **WHEN** a text input renders without a value
- **THEN** its placeholder renders in italics in the placeholder treatment of the active surface

### Requirement: Password input
A password input SHALL accept single-line secret text, keeping its value masked until the user activates its visibility toggle, which SHALL be named for what activating it does with the text the consuming capability supplies.

#### Scenario: Password masked
- **WHEN** a password input renders
- **THEN** its value is masked regardless of theme

#### Scenario: Reveal and mask
- **WHEN** the user activates the visibility toggle of a password input
- **THEN** the value becomes readable in place, and activating the toggle again masks it

#### Scenario: Visibility toggle is named
- **WHEN** a password input renders with its visibility toggle
- **THEN** the toggle's accessible name is the text the consuming capability supplied for that state and identifies what activating it does

### Requirement: Select
A select SHALL let the user choose one option from the options supplied by the consuming capability, showing the current selection and a chevron indicator in its closed box. The open option list SHALL use the platform's native presentation without custom styling.

#### Scenario: Choosing an option
- **WHEN** the user opens the list and chooses an option
- **THEN** that option becomes the control's value and is shown in the closed box

#### Scenario: Closed box
- **WHEN** a select renders closed
- **THEN** it renders as the input box with the current selection and a chevron indicator

#### Scenario: Native option list
- **WHEN** a select is open
- **THEN** the option list renders in the platform's native presentation without custom styling

### Requirement: Textarea
A textarea SHALL accept multi-line text on its own surface and boundary treatment, visibly distinct from the text input's.

#### Scenario: Multi-line value
- **WHEN** the user types text containing line breaks
- **THEN** the value keeps its line breaks and scrolls within the control when it exceeds the visible area

#### Scenario: Distinct treatment
- **WHEN** a textarea renders beside a text input
- **THEN** their surface and boundary treatments are visibly different

### Requirement: Checkbox
A checkbox SHALL toggle a single choice on and off. Its checked state SHALL be carried by a visible check mark so it does not rest on the fill color alone, and its label SHALL be clickable so the hit area is at least 24 by 24 pixels. It SHALL render its own label and accept an optional help text and an optional error message supplied by the consuming capability, binding them to its input so assistive technology reads them together with its state, and marking a required choice as required.

#### Scenario: Toggling
- **WHEN** the user activates the checkbox or its label
- **THEN** the choice flips between checked and unchecked

#### Scenario: Checked state identification
- **WHEN** a checkbox is checked
- **THEN** a check mark renders on the fill so the state is carried by the mark and not by the fill color alone

#### Scenario: Label click target
- **WHEN** the user clicks the label text
- **THEN** the checkbox toggles and the clickable area measures at least 24 by 24 pixels

#### Scenario: Help and error
- **WHEN** a checkbox shows help text and an error message
- **THEN** both render below it in their typographic roles, assistive technology reads them with the input, help before error, and the error is never conveyed by color alone

#### Scenario: Error state
- **WHEN** a checkbox shows an error message
- **THEN** its boundary switches to the error treatment and the input is exposed as invalid to assistive technology

#### Scenario: Required
- **WHEN** a checkbox is required
- **THEN** its input is marked required

### Requirement: Radio group
A radio group SHALL offer one choice among mutually exclusive options, present its group name as the title of the group, and keep exactly one option selected once the user chooses. Selecting an option SHALL clear the previously selected one. It SHALL accept an optional help text and an optional error message supplied by the consuming capability, binding them to the group so assistive technology reads them together with the group's state, and marking the choice as required when it is.

#### Scenario: Group name
- **WHEN** a radio group renders
- **THEN** its group name is presented above the options and identified as the group's title for assistive technology

#### Scenario: Single choice
- **WHEN** the user chooses an option
- **THEN** it becomes selected and any previously selected option is cleared

#### Scenario: Selected state identification
- **WHEN** an option is selected
- **THEN** a dot renders inside its circle so the state is carried by the dot and not by the fill color alone

#### Scenario: Keyboard operation
- **WHEN** the radio group has keyboard focus
- **THEN** the user moves the selection among the options with the keyboard alone

#### Scenario: Option click target
- **WHEN** the user clicks an option's label
- **THEN** that option is chosen and the clickable area measures at least 24 by 24 pixels

#### Scenario: Help and error
- **WHEN** a radio group shows help text and an error message
- **THEN** both render below the options in their typographic roles, assistive technology reads them with the group, help before error, and the error is never conveyed by color alone

#### Scenario: Error state
- **WHEN** a radio group shows an error message
- **THEN** its boundary switches to the error treatment and the group is exposed as invalid to assistive technology

#### Scenario: Required
- **WHEN** a radio group is required
- **THEN** its options are marked required

### Requirement: Data-entry control states
Every interactive data-entry control SHALL show the shared keyboard focus indicator of the theming capability, a disabled state that rejects input, and pointer feedback where the design defines one.

#### Scenario: Keyboard focus
- **WHEN** a data-entry control receives keyboard focus
- **THEN** the shared focus ring with its offset renders around it, with at least 3:1 contrast against each adjacent color in both themes

#### Scenario: Disabled
- **WHEN** a data-entry control is disabled
- **THEN** it renders at 50% opacity with a not-allowed cursor, shows no hover change, rejects input, leaves the keyboard focus order, and is exempt from contrast requirements

#### Scenario: Hover on light surfaces
- **WHEN** the pointer hovers an enabled text input, select or textarea on a light surface
- **THEN** it shows no visual change, its state being shown on focus

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

### Requirement: Theme-driven rendering
Every data-entry control SHALL take its colors and corner radii from semantic tokens that resolve per theme, and switching themes SHALL change only those resolved values, never the control's structure or behavior. The tokens this capability introduces SHALL be defined in both themes.

#### Scenario: Theme switch
- **WHEN** the theme switches
- **THEN** each control keeps identical structure and behavior and only its token-resolved colors and radii change

#### Scenario: Token completeness detected
- **WHEN** verification finds a token these controls introduce defined in one theme and missing from the other
- **THEN** verification fails and reports the missing token

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

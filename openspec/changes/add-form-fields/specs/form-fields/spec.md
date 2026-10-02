# Spec Delta

## Purpose

Defines Tazavera's data-entry controls: how a field presents a label, help text and error message and binds them to its control, and how text input (with password reveal), select, textarea, checkbox and radio group accept values in both themes, including on dark surfaces.

## ADDED Requirements

### Requirement: Field structure and association
A field SHALL present its label above the control, an optional help text and an optional error message below the control, and SHALL bind the label, the help text and the error message to its control so assistive technology reads them together with the control's state. A field SHALL hold a text input, select or textarea; a checkbox and a radio group carry their own label, help text and error message and are never placed in a field. The texts are supplied by the consuming capability.

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
- **WHEN** a text input, select or textarea renders without a field around it
- **THEN** it accepts input and shows its own states with no label, help text or error message associated, and the accessible name supplied by the consuming capability identifies it

### Requirement: Text input
A text input SHALL accept single-line text, show its placeholder in italics while it has no value, and offer a password mode in which the value stays masked until the user activates a visibility toggle.

#### Scenario: Typing
- **WHEN** the user types into an enabled text input
- **THEN** the typed characters become its value and render in the control text treatment

#### Scenario: Placeholder
- **WHEN** a text input renders without a value
- **THEN** its placeholder renders in italics in the placeholder treatment of the active surface

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
Data-entry controls placed on a dark surface SHALL render in the inverse variant: readable label, help and option texts, a visible boundary at rest that becomes more prominent on hover where the design defines one, a readable italic placeholder, the inverse error treatment for the error message and the control's error boundary, and the same single shared focus indicator whose colors resolve to the inverse focus tokens of the active theme.

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

### Requirement: Theme-driven rendering
Every data-entry control SHALL take its colors and corner radii from semantic tokens that resolve per theme, and switching themes SHALL change only those resolved values, never the control's structure or behavior. The tokens this capability introduces SHALL be defined in both themes.

#### Scenario: Theme switch
- **WHEN** the theme switches
- **THEN** each control keeps identical structure and behavior and only its token-resolved colors and radii change

#### Scenario: Token completeness detected
- **WHEN** verification finds a token these controls introduce defined in one theme and missing from the other
- **THEN** verification fails and reports the missing token

# Spec Delta

## Purpose

Defines Tazavera's action controls (buttons and links): the treatments, sizes and interaction states they render in both themes, the corner-radius token family that shapes every component, and the single shared source of icon artwork.

## ADDED Requirements

### Requirement: Action button treatments
Action buttons SHALL render in one of the defined action treatments — primary action, positional actions 1 through 4, and the navigation action used in the header — and each treatment SHALL take its background, text, border and hover colors from semantic tokens that resolve per theme.

#### Scenario: Primary action
- **WHEN** an action button with the primary treatment renders in either theme
- **THEN** its background, label and hover colors resolve to the primary action values of the active theme

#### Scenario: Positional actions
- **WHEN** an action button with positional treatment 1, 2, 3 or 4 renders in either theme
- **THEN** its background, label and hover colors resolve to that position's action values of the active theme

#### Scenario: Navigation action in the header
- **WHEN** an action button with the navigation treatment renders in the header
- **THEN** its background, label and border colors resolve to the navigation action values of the active theme

### Requirement: Action button sizes
Action buttons SHALL come in two context-chosen sizes with identical label typography: a standard size 40px high with 16px horizontal padding, and a compact size 32px high with 12px horizontal padding. Icons SHALL render at 16px with an 8px gap to the label, and an action button without a label SHALL stay square.

#### Scenario: Standard and compact sizes
- **WHEN** an action button renders in the standard or the compact size
- **THEN** it measures 40px or 32px in height with 16px or 12px horizontal padding and keeps the same label typography

#### Scenario: Icon-only shape
- **WHEN** an action button renders without a label
- **THEN** its width equals its height so the control stays square at 40px or 32px

#### Scenario: Icon and label layout
- **WHEN** an action button renders with an icon and a label
- **THEN** the icon renders at 16px separated from the label by 8px

### Requirement: Action button interaction states
Action buttons SHALL show pointer feedback, a visible keyboard focus indicator, a disabled state and a busy state, and SHALL perform their action only when enabled and not busy.

#### Scenario: Hover feedback
- **WHEN** the pointer hovers an enabled action button
- **THEN** its colors switch to its treatment's hover values and return to the rest values when the pointer leaves

#### Scenario: Keyboard focus
- **WHEN** an action button receives keyboard focus
- **THEN** a focus ring with an offset renders around it from the focus tokens, with at least 3:1 contrast against each adjacent color in both themes

#### Scenario: Activation
- **WHEN** the user activates an enabled action button that is not busy
- **THEN** the action it labels is performed

#### Scenario: Disabled
- **WHEN** an action button is disabled
- **THEN** it renders at 50% opacity with a not-allowed cursor, shows no hover change, rejects activation, leaves the keyboard focus order, and is exempt from contrast requirements

#### Scenario: Busy
- **WHEN** an action button enters the busy state
- **THEN** a spinner icon renders before the label, the label stays visible so the control's width does not change, the button rejects activation while keeping keyboard focus, and its busy state is announced to assistive technology

#### Scenario: Busy under reduced motion
- **WHEN** the user prefers reduced motion and an action button is busy
- **THEN** the spinner renders without animation

### Requirement: Accessible naming of icon-only actions
An action control shown without visible text SHALL carry an accessible name that identifies its action.

#### Scenario: Icon-only action is named
- **WHEN** an action button renders without a label
- **THEN** its accessible name identifies the action for assistive technology

#### Scenario: Unnamed icon-only action detected
- **WHEN** verification finds an icon-only action control without an accessible name
- **THEN** verification fails and names the offending control

### Requirement: Link navigation
Links SHALL address internal routes only and SHALL always render underlined. Navigation that leaves the application, such as the authorization-server redirect, SHALL NOT use this link treatment.

#### Scenario: Internal navigation
- **WHEN** the user activates a link
- **THEN** the application opens the internal route it addresses

#### Scenario: Always underlined
- **WHEN** a link renders in any state
- **THEN** its text is underlined and its colors come from the link tokens of the active theme

#### Scenario: External destination refused
- **WHEN** code supplies a link destination outside the application, such as an absolute URL
- **THEN** it is rejected at compile time (destinations accept in-application routes only) and no runtime check is involved

### Requirement: Link states and back variant
Links SHALL show rest, hover and keyboard focus states, and SHALL offer a back variant that pairs a leading arrow icon with its text.

#### Scenario: Hover feedback
- **WHEN** the pointer hovers a link
- **THEN** its color switches to the link hover value of the active theme

#### Scenario: Keyboard focus
- **WHEN** a link receives keyboard focus
- **THEN** a focus ring with an offset renders around it from the focus tokens, with at least 3:1 contrast against each adjacent color in both themes

#### Scenario: Back variant
- **WHEN** a link renders with the back variant
- **THEN** a leading arrow icon at 16px precedes its text with an 8px gap

### Requirement: Theme-driven corner radii
Corner radii SHALL come from the radius token family — `radius-pill` for action buttons and pill shapes, `radius-container` for containers, `radius-field` for fields and menus, `radius-check` for checkboxes — and every radius token SHALL have a value in both themes.

#### Scenario: Traditional shapes
- **WHEN** the traditional theme is active
- **THEN** action buttons render fully rounded, containers at 16px corner radius, fields and menus at 8px, and checkboxes at 4px

#### Scenario: Dark theme shapes
- **WHEN** the dark theme is active
- **THEN** every radius token resolves to 0 and those controls render square

#### Scenario: Intrinsic circular shapes are exempt
- **WHEN** a shape that is intrinsically circular (avatar, coffee bean, slider thumb) renders in the dark theme
- **THEN** it stays circular, because its shape does not come from a radius token

#### Scenario: Radius completeness detected
- **WHEN** verification finds a radius token defined in one theme and missing from the other
- **THEN** verification fails and reports the missing token

### Requirement: Shared icon source
Icon artwork SHALL render from one shared source, and an icon inside a control SHALL take the control's current text color so it switches with state and theme.

#### Scenario: Icon color follows the control
- **WHEN** an icon renders inside an action control in any state or theme
- **THEN** its color resolves to the control's current text color

#### Scenario: One source per artwork
- **WHEN** verification finds one icon artwork defined in more than one place
- **THEN** verification fails and reports the duplicated source

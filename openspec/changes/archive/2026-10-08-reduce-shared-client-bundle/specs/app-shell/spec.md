## ADDED Requirements

### Requirement: Client code loaded per route
A route SHALL load the client code of a shared control only when it renders that control: the command-menu library behind the combobox, and each interface primitive behind a dialog, tabs, slider, toggle group or radio group, stay out of the routes that render none of them. Which controls each route renders, and how they behave, stay unchanged.

#### Scenario: Route without a combobox
- **WHEN** a route that renders no combobox, such as the entry page of a locale, is loaded
- **THEN** the JavaScript it loads contains no command-menu library code

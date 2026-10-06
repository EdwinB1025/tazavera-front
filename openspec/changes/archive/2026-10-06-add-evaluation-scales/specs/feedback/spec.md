# Spec Delta

## ADDED Requirements

### Requirement: Confirmation dialog
A confirmation dialog SHALL ask the user to confirm one destructive action before the consuming capability runs it, presenting the title, the description and two actions — the destructive action and a cancellation — whose texts the consuming capability supplies. While it is open it SHALL be exposed to assistive technology as an alert dialog named by its title and described by its description, with the content behind it inert.

#### Scenario: Open
- **WHEN** the confirmation dialog opens
- **THEN** its panel renders centred over a dimmed page, it is exposed as an alert dialog named by its title and described by its description, and the content behind it cannot be interacted with

#### Scenario: Initial focus on the cancellation
- **WHEN** the confirmation dialog opens
- **THEN** keyboard focus starts on the cancellation action, the least destructive one

#### Scenario: Confirming
- **WHEN** the user activates the destructive action
- **THEN** the dialog hands the confirmation to the consuming capability, which runs the request and closes the dialog on success

#### Scenario: Cancelling with Escape
- **WHEN** the user presses Escape while no request is running
- **THEN** the dialog cancels, closes and runs no request

#### Scenario: The overlay does not close
- **WHEN** the user activates the overlay or the content behind the dialog
- **THEN** the dialog stays open

#### Scenario: Focus returns to the trigger
- **WHEN** the confirmation dialog closes
- **THEN** keyboard focus returns to the control that opened it

#### Scenario: Request running
- **WHEN** the request is running
- **THEN** the destructive action shows its busy treatment, the cancellation action is disabled and Escape does not close the dialog

#### Scenario: Request failed
- **WHEN** the request fails
- **THEN** the error message supplied by the consuming capability renders in a live alert region below the description, the dialog stays open and the destructive action can be activated again

#### Scenario: Actions on a narrow viewport
- **WHEN** the confirmation dialog renders below the small breakpoint
- **THEN** its actions stack in one column with the destructive action above the cancellation, each filling the panel's width, and the panel stays within the viewport width minus 2rem

#### Scenario: Actions on a wider viewport
- **WHEN** the confirmation dialog renders at or above the small breakpoint
- **THEN** its actions sit in one row aligned to the right with the cancellation before the destructive action, and the panel's width stops growing at 32rem

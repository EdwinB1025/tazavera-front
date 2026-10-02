# Spec Delta

## ADDED Requirements

### Requirement: Shared focus indicator
Every interactive control SHALL render the same focus indicator when it receives keyboard focus: one ring with one offset, whose colors come from the focus tokens of the active theme. No control SHALL render a focus treatment of its own.

#### Scenario: Same indicator on every interactive control
- **WHEN** interactive controls of different kinds receive keyboard focus in the same theme
- **THEN** each renders the same focus indicator, identical in ring width, offset and colors

#### Scenario: Indicator follows the active theme
- **WHEN** the active theme changes and an interactive control receives keyboard focus
- **THEN** the indicator's ring and offset resolve to the focus token values of the active theme while its shape and size stay identical

#### Scenario: Divergent indicator detected
- **WHEN** verification finds an interactive control rendering a focus indicator that differs from the shared one or is built from anything but the focus tokens
- **THEN** verification fails and names the offending control

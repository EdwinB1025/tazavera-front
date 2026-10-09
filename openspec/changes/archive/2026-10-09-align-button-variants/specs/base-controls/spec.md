## ADDED Requirements

### Requirement: Action variants by kind
Every action button of the application SHALL take the treatment of its kind of action: the primary treatment for the main action of a form or dialog (Save, Confirm, Sign in, Create offering, Register); positional treatment 1 for an action that creates or starts something (Evaluate, New offering, Add location, Add contact details); positional treatment 2 for a destructive or irreversible action (Delete, Deactivate, Delete account, Close evaluation); positional treatment 3 for an action that navigates or consults (View, View evaluations, View offerings, Show on map, Back, pagination); and positional treatment 4 for a secondary or in-page edit action (Cancel, Edit, Edit profile, Change password, Done). An action that fits more than one kind SHALL take the most specific, in this order: destructive, main action of a form or dialog, create, edit or cancel, navigate.

#### Scenario: Main action of a form or dialog
- **WHEN** a step-up notice renders its "Confirm identity" action
- **THEN** the action renders in the primary treatment

#### Scenario: Create or start
- **WHEN** the account's Contact details section renders its "Add contact details" action
- **THEN** the action renders in positional treatment 1

#### Scenario: Destructive or irreversible
- **WHEN** an open row of My evaluations renders its "Close evaluation" action
- **THEN** the action renders in positional treatment 2, as Delete does

#### Scenario: Navigate or consult
- **WHEN** a closed row of My evaluations renders its "View" action
- **THEN** the action renders in positional treatment 3

#### Scenario: Secondary or in-page edit
- **WHEN** an open row of My evaluations renders its "Edit" action
- **THEN** the action renders in positional treatment 4

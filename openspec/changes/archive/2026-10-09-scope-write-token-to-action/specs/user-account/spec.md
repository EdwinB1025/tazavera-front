## MODIFIED Requirements

### Requirement: Writes and the step-up
The profile update, the password change and the account deactivation and deletion SHALL be sent with the current token. The identity check — the write-scope sign in — SHALL also start before edit mode opens and before the Change password view opens; the front SHALL not track which scope the token holds, so it starts on every "Edit profile" and "Change password" activation. When one of the writes answers `403`, the step-up notice — its text and a "Confirm identity" action — SHALL render inside the section that sent the write, above its actions row, or inside the open dialog's error area for the destructive actions. Activating "Confirm identity" SHALL start the write-scope sign in synchronously inside that click for the account route, keeping the page and any input typed on it; after signing in again the user activates the action again and the write carries the new token. No other account write SHALL show the step-up notice. The write permission of a granted step-up SHALL last only its action: the action SHALL end, and the write tokens be discarded, when the profile form saves, when edit mode is closed, when the password form saves, when the user leaves edit mode or the Change password view by any navigation, and when a Danger zone dialog is cancelled; the next write then needs a new step-up.

#### Scenario: A write is rejected for its scope
- **WHEN** the profile update, the password change, or a confirmed deactivation or deletion answers `403`
- **THEN** the step-up notice renders inside the section that sent the write, above its actions row, or inside the open dialog's error area, and the dialog stays open

#### Scenario: Confirming identity
- **WHEN** the user activates "Confirm identity"
- **THEN** the write-scope sign in starts synchronously inside that click for the account route, keeping the page and any input typed on it

#### Scenario: The write is activated again
- **WHEN** the write-scope sign in has completed and the user activates the action again
- **THEN** the write is sent with the new token

#### Scenario: The action ends
- **WHEN** after a granted step-up the profile form saves, edit mode is closed, the password form saves, the user leaves edit mode or the Change password view, or a Danger zone dialog is cancelled
- **THEN** the write tokens are discarded and the next write needs a new step-up

# Spec Delta

## ADDED Requirements

### Requirement: Clear all action for an empty filtered list

A filtered list that is empty while at least one filter value is applied MAY show a "Clear all" button below its empty message, with the text the list provides. Activating it SHALL remove every query parameter of the list's address except the ones the list keeps, SHALL always remove the page, and SHALL open the result without a full page reload and without moving the scroll position. The button SHALL add no text of its own and SHALL NOT be shown while no filter value is applied.

#### Scenario: Keeps the list's kept parameters
- **WHEN** the list keeps the sort parameters, the address is `?process=washed&orderBy=cupping_avg&orderDirection=desc&page=2` and the visitor activates "Clear all"
- **THEN** the address becomes `?orderBy=cupping_avg&orderDirection=desc` and the scroll position does not move

#### Scenario: No parameter kept
- **WHEN** the list keeps no parameter, the address carries `?status=open` and the visitor activates "Clear all"
- **THEN** the address becomes the bare path, with no query

#### Scenario: Text from the list
- **WHEN** the list provides the text "Clear all"
- **THEN** the button's accessible name and visible text are exactly "Clear all"

#### Scenario: No filter applied
- **WHEN** the list is empty and no filter value is applied
- **THEN** no "Clear all" button is shown below the empty message

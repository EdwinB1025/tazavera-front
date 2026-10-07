# Spec Delta

## ADDED Requirements

### Requirement: Filtered offerings scoped by a host
A view that lists offerings with the catalog's filters MAY fix query keys of the offerings request. A fixed key SHALL override the same key in the address, and the facets, "Clear all" and paging SHALL never remove it from the request. Every other key of the request SHALL follow the catalog's query rules. With no fixed key the request SHALL be the catalog's for the same address.

#### Scenario: Fixed key overrides the address
- **WHEN** a view fixes `coffeeshopUlid` to `Y` and the address carries `coffeeshopUlid=X&process=washed`
- **THEN** the request carries `coffeeshopUlid=Y` and `process=washed`

#### Scenario: Fixed key survives Clear all and paging
- **WHEN** the visitor of a view that fixes `coffeeshopUlid` activates "Clear all" or opens another page
- **THEN** the following request still carries the fixed `coffeeshopUlid`

#### Scenario: Catalog without fixed keys unchanged
- **WHEN** the visitor opens the offerings route with any address
- **THEN** the request is the one the catalog's query rules build from that address, with no key added

#### Scenario: Scoped list fails
- **WHEN** the request of a view with a fixed key fails
- **THEN** the view shows the catalog's error state and the facets keep their values

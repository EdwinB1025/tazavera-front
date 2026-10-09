# Spec Delta

## ADDED Requirements

### Requirement: Public reads through the shared public request client
Every public read of the front (the coffees, roasteries, evaluations, taxonomies and offerings reads) SHALL be sent through the shared public request client, the one place that builds the API URL from the configured base. The requests sent to the API SHALL stay the same: method, path, query string, headers and request options.

#### Scenario: Public read sent through the shared client
- **WHEN** a public read of the front is sent
- **THEN** it goes through the shared public request client and no other module builds its URL from the configured API base

#### Scenario: Requests unchanged
- **WHEN** a public read is sent with the API base configured
- **THEN** the API receives the same method, URL, query string, headers and request options as before the refactor, and the read returns the same result

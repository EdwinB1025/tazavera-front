# Spec Delta

## ADDED Requirements

### Requirement: Acyclic shared segment imports
Every non-test module of a shared segment SHALL import the sibling modules it uses directly, never through the segment's own public index, and no module of the front SHALL consist only of re-exports of another module. The public exports of each shared segment SHALL stay the same.

#### Scenario: Sibling import inside a segment
- **WHEN** a non-test module of a shared segment uses a sibling module of the same segment
- **THEN** it imports that sibling module directly and its import graph contains no path back through the segment's public index

#### Scenario: No re-export-only module
- **WHEN** the front's source modules are inspected
- **THEN** none of them consists only of re-exports of another module, other than a segment's or slice's public index

#### Scenario: Public exports kept
- **WHEN** a consumer imports from a shared segment's public index
- **THEN** every name it exported before the change is still exported with the same meaning

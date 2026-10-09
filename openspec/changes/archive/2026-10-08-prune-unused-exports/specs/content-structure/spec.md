# Spec Delta

## MODIFIED Requirements

### Requirement: Acyclic shared segment imports
Every non-test module of a shared segment SHALL import the sibling modules it uses directly, never through the segment's own public index, and no module of the front SHALL consist only of re-exports of another module. Every name a consumer imports from a shared segment's public index SHALL stay exported with the same meaning.

#### Scenario: Sibling import inside a segment
- **WHEN** a non-test module of a shared segment uses a sibling module of the same segment
- **THEN** it imports that sibling module directly and its import graph contains no path back through the segment's public index

#### Scenario: No re-export-only module
- **WHEN** the front's source modules are inspected
- **THEN** none of them consists only of re-exports of another module, other than a segment's or slice's public index

#### Scenario: Public exports kept
- **WHEN** a consumer imports from a shared segment's public index
- **THEN** every name it imports is still exported with the same meaning

## ADDED Requirements

### Requirement: Public indexes export only what is imported
The public index of every slice and shared segment SHALL export only the values and types that a module of another slice or layer imports, and no source module SHALL export a value that no other module or test imports. What users see and the requests sent to the API SHALL stay the same.

#### Scenario: No unused public export
- **WHEN** the public index of a slice or shared segment is inspected
- **THEN** every value and type it exports is imported by at least one module outside that slice or segment

#### Scenario: No unused value export
- **WHEN** the front's source modules are inspected
- **THEN** every exported value is imported by another module or by a test

#### Scenario: Behaviour unchanged
- **WHEN** any screen renders or any request is sent
- **THEN** the user sees the same content and the API receives the same request as before the change

## ADDED Requirements

### Requirement: Flavor wheel types shared without import cycles
The flavor wheel's parts SHALL share the note and group types through one module that imports nothing from the wheel, so that no import cycle exists among the modules of the shared UI segment, while the wheel keeps its public exports and renders and behaves as the "Flavor wheel kept as one view" requirement states. This requirement adds no behaviour.

#### Scenario: No import cycle in the shared UI segment
- **WHEN** the import graph of the shared UI segment is checked for circular dependencies, type-only imports included
- **THEN** no cycle is reported, and every part of the flavor wheel takes the note and group types from the one types module

#### Scenario: Public exports unchanged
- **WHEN** a consumer imports the flavor wheel, its props type or its note type from the shared UI public index
- **THEN** the same names resolve as before the refactor, and the wheel renders as before for the same notes, total, texts and groups

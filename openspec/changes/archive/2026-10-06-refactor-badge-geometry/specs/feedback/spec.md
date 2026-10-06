# Spec Delta

## ADDED Requirements

### Requirement: Shared chip geometry
The badge's geometry — its text treatment, inner padding, icon gap, one-line layout and the field corner radius of the active theme — SHALL have exactly one definition, and every compact chip SHALL render from that shared definition instead of spelling the geometry out again. A chip MAY add its own treatments on top of it.

#### Scenario: Chip matches the badge geometry
- **WHEN** a compact chip other than a badge renders in either theme
- **THEN** it carries the badge's geometry — the badge text treatment, inner padding, icon gap, one-line layout and the field radius of the active theme — while a badge keeps rendering that same geometry

#### Scenario: Second geometry definition detected
- **WHEN** verification finds the badge's geometry spelled out again outside its single definition
- **THEN** verification fails and names the file holding the second definition

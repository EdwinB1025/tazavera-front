## ADDED Requirements

### Requirement: Code-structure rules reported by lint
The lint run SHALL report, as warnings and never as errors, every production unit over the size and complexity limits (a function or component over 80 lines, a file over 300 lines, a cyclomatic complexity over 15, counting non-blank, non-comment lines) and every production import that reaches another slice of the same layer or re-enters the public index of its own slice or segment. Test files are outside the import rules.

#### Scenario: Unit over a limit
- **WHEN** a production file holds a function of more than 80 lines, more than 300 lines in total, or a function with a cyclomatic complexity above 15
- **THEN** the lint run reports a warning for that unit naming the broken limit, and still reports zero errors for it

#### Scenario: Import across slices or into the own public index
- **WHEN** a production file imports another slice of its own layer, or the public index of its own slice or segment
- **THEN** the lint run reports a warning for that import, and still reports zero errors for it

#### Scenario: Code within the rules
- **WHEN** a production file stays within the limits and imports sibling files directly
- **THEN** the lint run reports no code-structure warning for it

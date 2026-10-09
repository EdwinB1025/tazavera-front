# testing Specification

## Purpose
Defines the repository's two test suites, the validation suite and the QA suite, and requires that any change to how the test environment is set up leaves each suite running the same test files and tests with the same results, with every test file isolated from the others.

## Requirements

### Requirement: Test environment set-up keeps the suites' results
The repository SHALL keep two test suites, the validation suite and the QA suite, and any change to how the test environment is set up SHALL leave each suite running the same test files and tests, each with the same result, with every file isolated from the others.

#### Scenario: Same tests and results after an environment change
- **WHEN** verification runs the validation suite and the QA suite after a change to the test environment set-up
- **THEN** each suite reports the same number of test files and tests as before the change, and all of them pass

#### Scenario: State leak between test files
- **WHEN** a test passes alone but fails in its suite because another file's state reached it
- **THEN** verification fails naming the failing test

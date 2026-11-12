## MODIFIED Requirements

### Requirement: Test environment set-up keeps the suites' results
The repository SHALL keep two unit and component test suites, the validation suite and the QA suite, next to a separate end-to-end suite, and any change to how the test environment is set up SHALL leave the validation suite and the QA suite each running the same test files and tests, each with the same result, with every file isolated from the others.

#### Scenario: Same tests and results after an environment change
- **WHEN** verification runs the validation suite and the QA suite after a change to the test environment set-up
- **THEN** each suite reports the same number of test files and tests as before the change, and all of them pass

#### Scenario: State leak between test files
- **WHEN** a test passes alone but fails in its suite because another file's state reached it
- **THEN** verification fails naming the failing test

## ADDED Requirements

### Requirement: End-to-end suite runs against the running front
The repository SHALL keep an end-to-end suite for the spec scenarios that need a real browser and the running application. It SHALL run by its own command, reaching the application only through the front's origin, and its tests SHALL never be counted in the validation or QA suite totals.

#### Scenario: End-to-end suite passes
- **WHEN** verification runs the end-to-end suite's command
- **THEN** the application is reached through the front's origin, each end-to-end test runs in a real browser, and the command reports every test passed

#### Scenario: Failing end-to-end scenario
- **WHEN** the observable result of an end-to-end test's scenario does not occur in the browser
- **THEN** the end-to-end suite's command fails naming the failing test

#### Scenario: End-to-end tests stay out of the other suites
- **WHEN** an end-to-end test is added to the repository
- **THEN** the validation suite and the QA suite report the same number of test files and tests as before it was added

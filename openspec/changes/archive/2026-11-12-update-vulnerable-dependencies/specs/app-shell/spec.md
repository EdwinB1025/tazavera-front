## MODIFIED Requirements

### Requirement: No known high or critical framework advisory
The installed framework, and every other installed dependency, whether the application ships it to production or uses it only for development, SHALL carry no known advisory of high or critical severity. Advisories of moderate or low severity SHALL be reported without failing verification.

#### Scenario: Production dependency audit is clean for high and critical
- **WHEN** verification audits the installed production dependencies, the framework included
- **THEN** the audit reports no advisory of high or critical severity

#### Scenario: Development dependency audit is clean for high and critical
- **WHEN** verification audits every installed dependency, the development dependencies included
- **THEN** the audit reports no advisory of high or critical severity

#### Scenario: High or critical advisory detected
- **WHEN** the audit of the installed dependencies, production or development, reports an advisory of high or critical severity
- **THEN** verification fails naming the affected package

#### Scenario: Moderate or low advisory is reported only
- **WHEN** the audit of the installed dependencies reports advisories of moderate or low severity and none of high or critical severity
- **THEN** verification passes and reports each moderate or low advisory with its affected package

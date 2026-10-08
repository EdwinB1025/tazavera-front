# Spec Delta

## MODIFIED Requirements

### Requirement: Catalog query pass-through
The catalog SHALL forward to the API only the query parameter names the contract declares for `GET /offerings` plus `page`, keeping every value of a repeated key, and SHALL drop any other key. Each array parameter of `GET /offerings` (`cataRef`, `fragranceCata`, `aromaCata`, `flavorCata`, `aftertasteCata`, `mouthfeelCata`) SHALL be sent with brackets, as `name[]=value` once per value in the address's order; every other parameter SHALL be sent as `name=value`. With no query it SHALL request the offering list as it is and add no filter or sort of its own.

#### Scenario: Contract names kept
- **WHEN** the address carries contract parameter names such as `verified`, `orderBy`, `orderDirection`, or repeated `cataRef` values
- **THEN** the API request carries exactly those names and values plus the current page, with each `cataRef` value sent as `cataRef[]` (brackets percent-encoded)

#### Scenario: Unknown keys dropped
- **WHEN** the address carries a key the contract does not declare for `GET /offerings`
- **THEN** the request omits that key and the rest of the query applies

#### Scenario: No default filter
- **WHEN** the visitor opens the offerings route without a query
- **THEN** the request carries no verification filter and verified and provisional offerings show together in the API's order

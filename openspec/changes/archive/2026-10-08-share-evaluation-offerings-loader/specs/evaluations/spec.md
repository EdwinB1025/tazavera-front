# Spec Delta

## ADDED Requirements

### Requirement: Offerings of an evaluations page

"My evaluations" and the public evaluations list SHALL read the offerings of a page of evaluations the same way: one offering request per distinct non-null `offeringId` of the page, made in parallel after the page arrives. An evaluation without an `offeringId` SHALL request nothing and show its offering-missing row; an evaluation whose offering read is not found or fails SHALL show its offering-unavailable row. The rows keep the order of the page.

#### Scenario: Shared offering on one page

- **WHEN** a page of either list holds several evaluations of the same offering
- **THEN** that offering is requested once and every one of those rows shows it

#### Scenario: Evaluation without an offering

- **WHEN** an evaluation of the page has a `null` `offeringId`
- **THEN** no offering request is sent for it and its row is the offering-missing row

#### Scenario: Offering read not found or failed

- **WHEN** the offering read of an evaluation of the page is not found or fails
- **THEN** its row is the offering-unavailable row and the other rows still show their offerings

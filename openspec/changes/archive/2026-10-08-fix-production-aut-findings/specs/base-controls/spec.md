## ADDED Requirements

### Requirement: Back link to the previous page
A back link SHALL open the previous page of the application — the page the user came from, with its query — and SHALL open its fallback destination, a fixed route of the active locale, when the user has no previous page of the application, such as a page opened in a new tab or from outside the application. Changing only the query of the page in view, such as a tab, a filter or a page number, SHALL NOT make that page its own previous page, and changing the language SHALL keep the previous page, in the new language.

#### Scenario: Back to the previous page
- **WHEN** the user moved from one page of the application, such as a filtered list on its second page, to a page with a back link
- **THEN** the back link addresses that previous page with its query

#### Scenario: No previous page
- **WHEN** the page with the back link is the first page the user opened in the application
- **THEN** the back link addresses its fallback destination

#### Scenario: Query changes on the page in view
- **WHEN** the user, on a page with a back link, changes only its query, such as switching a tab
- **THEN** the back link still addresses the page the user came from before that page

#### Scenario: Language change
- **WHEN** the user changes the language on a page with a back link
- **THEN** the back link addresses the same previous page in the new language

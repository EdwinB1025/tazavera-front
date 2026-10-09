## MODIFIED Requirements

### Requirement: Back link to the previous page
A back button SHALL open the previous page of the application — the page the user came from, with its query — and SHALL open its fallback destination, a fixed route of the active locale, when the user has no previous page of the application, such as a page opened in a new tab or from outside the application. Changing only the query of the page in view, such as a tab, a filter or a page number, SHALL NOT make that page its own previous page, and changing the language SHALL keep the previous page, in the new language.

#### Scenario: Back to the previous page
- **WHEN** the user moved from one page of the application, such as a filtered list on its second page, to a page with a back button
- **THEN** the back button addresses that previous page with its query

#### Scenario: No previous page
- **WHEN** the page with the back button is the first page the user opened in the application
- **THEN** the back button addresses its fallback destination

#### Scenario: Query changes on the page in view
- **WHEN** the user, on a page with a back button, changes only its query, such as switching a tab
- **THEN** the back button still addresses the page the user came from before that page

#### Scenario: Language change
- **WHEN** the user changes the language on a page with a back button
- **THEN** the back button addresses the same previous page in the new language

#### Scenario: Back control is a button
- **WHEN** a page with a back button renders
- **THEN** the back control is a button with the back text, not a link, and activating it navigates within the application to the destination it addresses

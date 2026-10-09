## ADDED Requirements

### Requirement: Navigation controls by position
A navigation control on the first line of a page header, the back control above the eyebrow and the title, SHALL be a link. Every other navigation control — in a page header but not on its first line, or among the actions at the end of a view, a list or a card — SHALL be an action button that opens its in-application route, with the treatment of its kind ("Action variants by kind"). Links inside running text are not navigation controls and stay links.

#### Scenario: Header link, other navigation as buttons
- **WHEN** a page header shows a back control on its first line and a navigation action after its title, and its view ends with a back control
- **THEN** the first-line back control is a link, and the navigation action after the title and the back control at the end are buttons

## MODIFIED Requirements

### Requirement: Back link to the previous page
A back control SHALL open the previous page of the application — the page the user came from, with its query — and SHALL open its fallback destination, a fixed route of the active locale, when the user has no previous page of the application, such as a page opened in a new tab or from outside the application. The back control on the first line of a page header SHALL be a link with the back treatment, its leading back arrow; the back control repeated at the end of a view SHALL be an action button in positional treatment 3 with the same text, arrow and destination. Changing only the query of the page in view, such as a tab, a filter or a page number, SHALL NOT make that page its own previous page, and changing the language SHALL keep the previous page, in the new language.

#### Scenario: Back to the previous page
- **WHEN** the user moved from one page of the application, such as a filtered list on its second page, to a page with a back control
- **THEN** the back control addresses that previous page with its query

#### Scenario: No previous page
- **WHEN** the page with the back control is the first page the user opened in the application
- **THEN** the back control addresses its fallback destination

#### Scenario: Query changes on the page in view
- **WHEN** the user, on a page with a back control, changes only its query, such as switching a tab
- **THEN** the back control still addresses the page the user came from before that page

#### Scenario: Language change
- **WHEN** the user changes the language on a page with a back control
- **THEN** the back control addresses the same previous page in the new language

#### Scenario: Back control is a button
- **WHEN** a page renders a back control on the first line of its header and the same back control at the end of the view
- **THEN** the header's back control is a link with the back arrow and the one at the end is a button, both with the back text and addressing the same destination

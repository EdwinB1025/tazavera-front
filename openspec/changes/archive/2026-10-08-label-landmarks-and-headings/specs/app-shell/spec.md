## ADDED Requirements

### Requirement: Named navigation landmarks
Every navigation landmark of the application SHALL carry an accessible name from the message catalog of the active locale, and no two navigation landmarks shown on the same page SHALL share a name: the header's primary navigation is named "Main", the sidebar's navigation "Management", and the registration links of the entry page and of the About us page "Registration" (in Spanish "Principal", "Gestión" and "Registro"; in Catalan "Principal", "Gestió" and "Registre"). Naming a landmark SHALL NOT change any visible text or presentation.

#### Scenario: Header navigation named
- **WHEN** the header renders on a medium or larger viewport in English
- **THEN** its primary navigation is a navigation landmark named "Main"

#### Scenario: Sidebar navigation named
- **WHEN** the sidebar shows navigation entries in English
- **THEN** they sit in a navigation landmark named "Management"

#### Scenario: Registration links named
- **WHEN** the entry page or the About us page renders in English
- **THEN** its two registration links sit in a navigation landmark named "Registration"

#### Scenario: Names follow the locale
- **WHEN** the locale changes
- **THEN** every navigation landmark's name renders from the new locale's catalog

### Requirement: Result count announced inside the sidebar overlay
While the sidebar is open as the full-screen overlay on a small viewport, the overlay SHALL carry a visually hidden polite status that repeats the result count of the list behind it, so the count announced after each committed change is heard while the overlay stays open. While the overlay is closed, the list's own status SHALL announce the count as before.

#### Scenario: Facet change with the overlay open
- **WHEN** a visitor on a small viewport changes a facet in the open overlay and the list behind it loads with 12 results in total
- **THEN** a polite status inside the overlay reads "Results: 12"

#### Scenario: Overlay closed
- **WHEN** the overlay is closed and the list loads with 12 results in total
- **THEN** the list's own polite status reads "Results: 12" and no overlay status is rendered

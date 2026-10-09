## ADDED Requirements

### Requirement: Locale chosen only by the user
The application SHALL take the locale of a request only from the locale prefix of its URL, and the user SHALL change it only with the header's language selector. The browser's language preferences and any locale cookie SHALL NOT select or change the locale, and no response SHALL set a locale cookie.

#### Scenario: Browser language ignored
- **WHEN** a browser whose language preference is English and which carries a locale cookie for English opens the root URL
- **THEN** the application redirects to the default locale and its response sets no cookie

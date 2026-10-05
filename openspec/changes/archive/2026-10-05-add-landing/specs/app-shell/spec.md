# Spec Delta

## MODIFIED Requirements

### Requirement: Locale routing
Every application route SHALL live under a locale prefix, for the supported locales `es`, `en` and `ca`, with `es` as the default. The root URL SHALL redirect to the default locale, and a URL whose prefix is not a supported locale SHALL be reported as not found.

#### Scenario: Route under a locale prefix
- **WHEN** the user opens a route of the application
- **THEN** the URL carries one of the supported locale prefixes and the screen renders in that locale

#### Scenario: Root URL
- **WHEN** the user opens the root URL
- **THEN** the application redirects to the default locale

#### Scenario: Root of a supported locale
- **WHEN** the user opens the root of a supported locale
- **THEN** the shell renders the entry page in its main area instead of reporting the page as not found

#### Scenario: Unsupported locale
- **WHEN** the user opens a URL whose locale prefix is not supported
- **THEN** the application redirects it to the same path under the default locale, where it resolves to a not-found page, instead of rendering a screen in an unknown locale

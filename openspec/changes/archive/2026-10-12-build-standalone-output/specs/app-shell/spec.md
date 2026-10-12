## ADDED Requirements

### Requirement: Self-contained production server
The production build SHALL produce a self-contained server that runs with Node.js alone, without the project's sources or development dependencies. Started with the build's static assets placed next to it, that server SHALL serve every locale page with its localized texts and its stylesheets, exactly as the regular production server does. If a locale's texts are missing from the self-contained output, its page fails to render and the build does not meet this requirement.

#### Scenario: Locale page served by the self-contained server
- **WHEN** the self-contained server, started with the static assets next to it, answers a request for `/es`, `/en` or `/ca`
- **THEN** the response has status 200 and carries the page in that locale's language, and the stylesheet the page references answers with status 200

#### Scenario: Message catalogs missing from the output
- **WHEN** a locale's message catalogs are not part of the self-contained output
- **THEN** that locale's page fails to render, and the build is not accepted until the catalogs are included

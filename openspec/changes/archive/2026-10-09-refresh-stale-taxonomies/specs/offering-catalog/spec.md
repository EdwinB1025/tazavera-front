## MODIFIED Requirements

### Requirement: Reference data cached with a one-hour refresh
The taxonomy read and the coffee catalog read SHALL be served from a server-side cache that is refreshed at most one hour after it was filled, so repeated renders within the hour send no new request for them. Their method, path, query string and results SHALL stay the same, and every other public read SHALL stay uncached. When a screen resolves taxonomy references of data it already holds and the cached taxonomy read lacks any of them, the taxonomy read SHALL be sent to the API once more bypassing the cache before rendering, and that fresh result SHALL be used; references still missing after it are left out as before, and no further request is sent.

#### Scenario: Repeated renders within the hour
- **WHEN** pages that read the taxonomies or the coffee catalog are rendered several times within one hour of the cached read
- **THEN** the API receives no new request for that reference read and the pages show the same data

#### Scenario: Refresh after the hour
- **WHEN** a page reads the taxonomies or the coffee catalog more than one hour after the cached read
- **THEN** the reference read is sent to the API again with the same method and URL, and the refreshed data replaces the cached one

#### Scenario: Cached taxonomies lack a shown reference
- **WHEN** a screen resolves the taxonomy references of its data and the cached taxonomy read lacks one of them
- **THEN** the taxonomy read is sent to the API once more bypassing the cache, and the note of that reference renders from the fresh result

#### Scenario: Cached taxonomies hold every shown reference
- **WHEN** a screen resolves the taxonomy references of its data and the cached taxonomy read holds all of them
- **THEN** the API receives no extra taxonomy request

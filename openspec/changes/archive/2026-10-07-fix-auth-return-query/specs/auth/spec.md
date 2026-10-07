## MODIFIED Requirements

### Requirement: Return through the callback
The route the API returns to SHALL render no text and no status region, and SHALL NOT show the API's error text or any error page, whatever the outcome. With an opener of the application's origin it SHALL forward the result to the application and close itself; without one it SHALL complete the flow and open the return destination through client-side navigation. The return destination SHALL be the route where the flow started, with its path and its query string and without its hash, and SHALL be opened only when it is a route of the application; any other return destination SHALL be replaced by the root of the default locale.

#### Scenario: Forwarding the result to the application
- **WHEN** the callback has an opener of the application's origin and receives the result of an authorization
- **THEN** it posts the result to the application's origin and closes itself, without exchanging the code

#### Scenario: Completing on the callback
- **WHEN** the callback has no opener and receives a completed authorization
- **THEN** it exchanges the code for tokens, replaces its history entry so no code remains in the URL, and opens the return destination through client-side navigation

#### Scenario: The authorization comes back with an error
- **WHEN** the callback receives an error response from the authorization
- **THEN** it shows no error text and the user continues at the return destination as anonymous

#### Scenario: The response does not answer a pending request
- **WHEN** the callback receives a response whose `state` does not match the pending request, or receives nothing that belongs to one
- **THEN** it shows no error text and the user continues at the return destination as anonymous, or at the root of the default locale when there is no pending request

#### Scenario: The return destination keeps the query
- **WHEN** a flow that returns through the callback starts on a route with a query string, such as a reload of `/es/manage/evaluations/new?offering=01J0` with the silent restore
- **THEN** the callback opens `/es/manage/evaluations/new?offering=01J0`, path and query, without any hash the route had

#### Scenario: A query that only carries data
- **WHEN** the callback completes a flow whose return destination has a supported locale prefix and a query whose values name another site, such as `/es/offerings?next=https://evil.example`
- **THEN** it opens that same route of the application, and never navigates to the site named in the query

#### Scenario: A return destination that is not an application route
- **WHEN** the callback completes a flow whose return destination is not a route of the application — an absolute URL such as `https://evil.example/es`, a protocol-relative route such as `//evil.example/es`, a route with a backslash such as `/\evil.example` or `/es?next=\evil.example`, a route with a control character, or a route whose path resolves outside a supported locale prefix such as `/es/../evil` or `/xx/offerings`
- **THEN** it opens the root of the default locale instead, and the outcome of the flow is otherwise unchanged

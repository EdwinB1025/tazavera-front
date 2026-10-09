# Spec Delta

## ADDED Requirements

### Requirement: One active-locale derivation for the auth flows

Sign in, sign out and the return route SHALL take the active locale from the locale segment of the route through one shared derivation: the first segment of the route's path when it is a supported locale. Where no supported locale is found, sign in and sign out SHALL use the default locale and the return route SHALL be refused, as the requirements "Sign in", "Sign out" and "Return through the callback" state. This requirement adds no behaviour.

#### Scenario: The same locale for every auth flow

- **WHEN** a user on a route under a supported locale prefix, such as `/en/offerings`, signs in or signs out, or a flow returns to such a route
- **THEN** the authorization request carries that locale, sign out opens the root of that locale, and the return route is accepted

#### Scenario: A route without a supported locale

- **WHEN** the first segment of the route is not a supported locale, such as `/callback` or `/xx/offerings`
- **THEN** the authorization request carries the default locale, sign out opens the root of the default locale, and that return route is refused

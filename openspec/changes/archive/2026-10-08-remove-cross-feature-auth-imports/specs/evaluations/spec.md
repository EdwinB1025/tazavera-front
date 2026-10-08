# Spec Delta

## ADDED Requirements

### Requirement: Evaluation routes as protected views

Every `/manage/evaluations` route SHALL be a protected view of the application's protected content gate: its loading presentation SHALL be empty, its signed-out message SHALL be the evaluations access message with the "Sign in" action, and the specialist role SHALL be the only role it allows. The signed-out block of these routes SHALL look and behave the same as the signed-out block of every other protected view.

#### Scenario: Session resolving on an evaluation route

- **WHEN** an evaluation route opens while the session is still resolving
- **THEN** nothing renders in place of the content and no signed-out message shows

#### Scenario: Signed-out block of an evaluation route

- **WHEN** an anonymous visitor opens an evaluation route
- **THEN** the evaluations access message and a primary "Sign in" button render in a column 1rem apart, with the button at its own width, and activating it starts sign in for that route inside the click

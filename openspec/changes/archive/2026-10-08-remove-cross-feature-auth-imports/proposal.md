Type: Refactor (fast lane)

## Why

Two feature slices read the session from another feature slice: the evaluation routes' access gate (`src/features/manage-evaluations/ui/EvaluationsAccess.tsx`) imports `useSession` and `signIn` from `@/features/auth`, and the offering card's Evaluate link (`src/features/evaluate-offering/ui/EvaluateLink.tsx`) imports `useSession` from it. These same-layer imports are the only Feature-Sliced Design violations left in production code. The access gate also repeats the loading / signed-out / role-check logic that `SessionGate` and `SignedOutPrompt` in `src/shared/ui` already provide (backlog entries R23 and R13; technical review §3.1 row R23).

## What Changes

- `EvaluationsAccess` receives the session and the sign-in action as props and renders the shared `SessionGate` with `SignedOutPrompt`, instead of reading the session itself and repeating the gate.
- `EvaluateLink` receives the session as a prop instead of reading it itself.
- The session is read in a client component of a higher layer than the features, following `src/pages/account/ui/AccountClient.tsx`: a new `evaluations-gate` widget for the three evaluation screens, and a client component inside the `offering-list` widget for the Evaluate link.
- No feature slice imports another feature slice anymore.
- No behaviour change: what users see (markup, classes, texts, the 404 for a role other than specialist), the requests sent to the API and every requirement in `openspec/specs/` stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: adds the observable property that the evaluation routes behave as protected views of the shared protected content gate. No requirement's behaviour changes.

## Non-goals

- No change to the `auth` feature, `SessionGate`, `SignedOutPrompt` or the texts of the evaluation routes.
- No change to the offering card, the other actions of its actions slot, or the pages that render the offering list.
- No new tests; the existing tests keep their cases, names, assertions and expected values.
- No other backlog entry is folded in.

## Impact

- New: `src/widgets/evaluations-gate/index.ts`, `src/widgets/evaluations-gate/ui/EvaluationsGate.tsx`, `src/widgets/offering-list/ui/EvaluateAction.tsx`.
- Modified: `src/features/manage-evaluations/ui/EvaluationsAccess.tsx`, `src/features/evaluate-offering/ui/EvaluateLink.tsx`, `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx`, `src/pages/evaluation-form/ui/EvaluationScreen.tsx`, `src/pages/evaluation-form/ui/NewEvaluationScreen.tsx`, `src/widgets/offering-list/ui/OfferingList.tsx`.
- Tests whose render setup changes (render props or mock setup only): `EvaluationsAccess.test.tsx` and `EvaluateLink.test.tsx`, in `src/` and in `qa/`. `OfferingList.test.tsx` (in `src/` and `qa/`) may gain a mock of `@/features/auth` (mock setup only).

## Propose status

- Change-id: `remove-cross-feature-auth-imports`
- Date: 2026-10-08
- `openspec validate remove-cross-feature-auth-imports --strict`: valid
- Resolves backlog entries: R23, R13
- Resolved: `EvaluationsAccess` keeps its place and renders `SessionGate` with `SignedOutPrompt` from injected `session` and `signIn` props (design.md D1); the evaluation screens read the session through a new `evaluations-gate` widget (D2); `EvaluateLink` takes the session as a prop and the `offering-list` widget reads it in an internal client component (D3); both feature modules are kept (D4); tests change only their render setup (D5, orchestrator's decision of 2026-10-08).
- Open: nothing.

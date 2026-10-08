## Context

`EvaluationsAccess` (`src/features/manage-evaluations`) and `EvaluateLink` (`src/features/evaluate-offering`) call `useSession()` from `@/features/auth`, and `EvaluationsAccess` also calls `signIn` from it (backlog R23). `EvaluationsAccess` repeats the gate that `SessionGate` and `SignedOutPrompt` (`src/shared/ui`) already implement (backlog R13). `src/pages/account/ui/AccountClient.tsx` shows the target pattern: a client component of a higher layer reads `useSession()` and `signIn` and passes them down.

Their callers are Server Components: the three evaluation screens (`EvaluationsListScreen`, `EvaluationScreen`, `NewEvaluationScreen`, two of them `async`) and `OfferingList` (rendered by many pages). The session hook only runs in a client component, so each caller needs a client component, of a layer above `features`, that reads the session.

No API endpoint, request or error presentation changes.

## Goals / Non-Goals

**Goals:** no feature imports another feature; the evaluation routes use the shared gate; same markup, texts, classes, 404 and requests.

**Non-Goals:** changing `auth`, `SessionGate`, `SignedOutPrompt`, the offering card or the screens' content.

## Decisions

### D1. The access gate on the shared pieces (`features/manage-evaluations`)

`src/features/manage-evaluations/ui/EvaluationsAccess.tsx` (layer `features`) stays, with no import from `@/features/auth`. Its props become:

```ts
import type { Session } from "@/shared/api";

export type EvaluationsAccessProps = {
  session: Session;
  /** Starts sign in for a return route: the auth feature's `signIn`. */
  signIn: (returnRoute: string) => void;
  texts: EvaluationsAccessTexts;
  children: ReactNode;
};
```

It renders `SessionGate` with `loading={null}`, `signedOut` set to `SignedOutPrompt` with `texts.message`, `texts.signInLabel` and an `onSignIn` that calls `signIn(window.location.pathname + window.location.search)` inside the click, `allows` true only for `role === "specialist"`, and `children` returning its children. Today's block (`flex flex-col items-start gap-4`, a `type-body` paragraph, a `Button` with the default `primary` variant and `button` type) is exactly what `SignedOutPrompt` renders, and `SessionGate` calls `notFound()` for a rejected role as today, so the output does not change. The return route is still computed inside the click by this component.

### D2. Where the evaluation routes read the session (`widgets/evaluations-gate`)

New widget slice `src/widgets/evaluations-gate` (layer `widgets`): `ui/EvaluationsGate.tsx` is a `"use client"` component with props `{ texts: EvaluationsAccessTexts; children: ReactNode }`; it calls `useSession()` and passes it with `signIn`, both from `@/features/auth`, to `EvaluationsAccess` from `@/features/manage-evaluations`. `index.ts` exports `EvaluationsGate` and its props type. The three screens (`src/pages/evaluations-list/ui/EvaluationsListScreen.tsx`, `src/pages/evaluation-form/ui/EvaluationScreen.tsx`, `src/pages/evaluation-form/ui/NewEvaluationScreen.tsx`) render `EvaluationsGate` in place of `EvaluationsAccess`, with the same `texts` and children; they stay Server Components. A widget, not a client component in each page slice, because the screens live in two page slices that cannot share code; the content passed as children stays server-rendered.

### D3. The Evaluate link (`features/evaluate-offering`, `widgets/offering-list`)

`src/features/evaluate-offering/ui/EvaluateLink.tsx` stays, with no import from `@/features/auth`, and gains a `session: Session` prop; its rule (a link for an authenticated specialist, nothing otherwise) does not change. New `src/widgets/offering-list/ui/EvaluateAction.tsx` (layer `widgets`, internal to the slice, not exported) is a `"use client"` component with `EvaluateLink`'s props except `session`; it calls `useSession()` from `@/features/auth` and renders `EvaluateLink` with it. `OfferingList` (still a Server Component) fills the card's actions slot with `EvaluateAction` instead of `EvaluateLink`, with the same props.

### D4. Modules kept

Both feature modules and their public indexes are kept; `EvaluationsSidebarEntry` is untouched. `src/features/manage-evaluations/index.ts` and `src/features/evaluate-offering/index.ts` keep their exports (the prop types change with D1 and D3).

### D5. Tests (orchestrator's decision, 2026-10-08)

No test is added or deleted, and no case, name, assertion or expected value changes. `EvaluationsAccess` and `EvaluateLink` stay as thin components that receive the session (and the sign-in action) from their caller; their tests (`src/features/manage-evaluations/ui/EvaluationsAccess.test.tsx`, `src/features/evaluate-offering/ui/EvaluateLink.test.tsx` and their `qa/` copies) change only how they render the component: they pass `session` from their existing session mock (and `signIn` from their existing `signIn` mock) as props, and drop the `vi.mock("@/features/auth", …)` the component no longer uses. `OfferingList.test.tsx` (`src/` and `qa/`) keeps its `@/features/evaluate-offering` mock; if `EvaluateAction`'s real `useSession` makes it fail or warn, it gains a `vi.mock("@/features/auth", …)` returning an anonymous session (mock setup only). Each such change is stated in the commit body.

## Risks / Trade-offs

- `SessionGate` returns `notFound()` where the old code called it as a statement; both throw the same Next.js error, and the 404 test keeps its assertion.
- The new widget holds a single client wrapper; it is the only place the evaluation screens can share a client component without a same-layer import.

## Context

Backlog R8 and the decisions log entry "escrituras, rutas protegidas y 422" (2026-10-06): every form shows one generic form-level error for any `422`. Since `2bdde09` the contract documents the `422` of every write in Laravel's shape `{"message", "errors": {key: [messages]}}` (`registerAUser`, `updateAUser`, `updateUserPassword`, `createMyPrimaryContact`, `createALocation`, `createOfferings`, `createAnEvaluation`, `updateAnEvaluation`). Product owner (2026-10-08) scheduled this change once that was done. The messages are already localised by the API (`Accept-Language`).

Today each `api` segment maps a `422` to `{ ok: false, kind: "error" }` (`src/shared/api/result.ts`); the forms render their errors through `Field`'s `error` prop (`src/shared/ui/Field.tsx`), which already sets `aria-invalid`, `aria-describedby` and the error text.

## Goals / Non-Goals

**Goals:** one shared, pure mapping from a `422` body to per-field messages; each writing form shows the API's message under the field it names, keeps its existing form-level error for keys that name no field, and clears a field's message when the user edits it.

**Non-Goals:** no new token, dependency, catalog text or route; no change to non-`422` handling, to the client checks, to `contracts/` or `schema.ts`; the read paths of offerings and evaluations (another change, `show-item-not-found-message`, works there).

## API endpoints

| Method and path | Response used | Errors |
|---|---|---|
| `POST /register`, `PUT /users/{ulid}`, `PUT /users/{ulid}/password`, `POST /users/{ulid}/contacts`, `POST /locations`, `POST /offerings`, `POST /user/evaluations`, `PUT /user/evaluations/{ulid}` | as today | `422` `errors`: each key's first message; every other status as today |

## Decisions

### D1. The shared result kind (`src/shared/api/result.ts`)

`ApiFailureKind` gains `"validation"`. `ApiResult<T, K>` gains a third member, present only when `K` includes `"validation"`: `{ ok: false; kind: "validation"; errors: FieldErrors }`. The plain failure member keeps `kind: Exclude<K, "validation"> | "error"`. A function that never names `"validation"` keeps its type unchanged.

### D2. The mapping (`src/shared/lib/field-errors.ts`, imported as `@/shared/lib/field-errors`)

```ts
/** A 422's messages: each API key → its first message. */
export type FieldErrors = Record<string, string>;
```

- `toFieldErrors(body: unknown): FieldErrors` — pure: for each key of `body.errors` whose value is an array whose first item is a non-empty string, that string; anything else (no `errors`, not an object) gives `{}`.
- `readFieldErrors(response: Response): Promise<FieldErrors>` — reads the JSON body and returns `toFieldErrors`; a body that cannot be read gives `{}`.
- `splitFieldErrors<F extends string>(errors: FieldErrors, fields: readonly F[], aliases?: Readonly<Record<string, F>>): { fields: Partial<Record<F, string>>; unmatched: boolean }` — pure: a key maps to `aliases[key]` when given, else to itself when it is in `fields`. `unmatched` is `true` when a key maps to no field or when no field received a message (an empty map), so the form-level error shows.

It lives in `shared` because every `api` segment (features, entities) and the forms (features, pages) import it; in `shared/lib` rather than `shared/api` because many tests replace `@/shared/api` with a mock that holds only `request`, which would drop the mapping (found while building task 2.2). `result.ts` imports the `FieldErrors` type from it.

### D3. The form state (`useServerFieldErrors`, `src/shared/lib/hooks/index.ts`)

`useServerFieldErrors<F extends string>(fields: readonly F[], aliases?)` returns `{ errors, unmatched, show, clear, reset }`: `show(map)` stores `splitFieldErrors`'s result, `clear(field)` drops that field's message (`unmatched` is kept), `reset()` clears both. Each form shows `localError ?? errors[field]` in the field's existing `error` slot, renders its existing form-level error when its own failure state is set or `unmatched` is `true`, calls `clear(field)` from the field's change handler and `reset()` at the start of each submit. No new text: the form-level error is each form's existing generic line.

### D4. The `api` segments report `validation`

A `422` returns `{ ok: false, kind: "validation", errors: await readFieldErrors(response) }` in: `registerUser` (`RegisterResult`), the account `write` (`AccountWriteResult`, profile and password), `submitContact` (`ContactWrite`), `createLocation`, `createOfferings`, and the evaluation `call` (`EvaluationCallResult`, create and update). Every other status maps as today.

### D5. The forms' field names

| Form | Fields (API keys) | Aliases | Unmatched (form-level) |
|---|---|---|---|
| Registration | `name`, `surname`, `email`, `password`, `passwordConfirmation` | — | any other key, e.g. `role` |
| Profile | `name`, `surname`, `email` | — | — |
| Password | `currentPassword`, `password`, `passwordConfirmation` | — | — |
| Contact | the eight contact fields | `postal_code` → `postalCode` | — |
| Location | `name`, `description` and the eight contact fields | `contact.<key>` → its field, `contact.postal_code` → `postalCode` | `latitud`, `longitud` |
| New offering | `coffeeInventoryId` (the inventory field) | — | `locations` (the locations fieldset has no field error slot) |
| Evaluation | `descriptive.roastLevel`, `extractionMethod` (the context card's two `Field`s) | — | every other key |

The evaluation form maps only the two always-visible fields of its context card: its other controls sit inside collapsible groups that start collapsed, so a message there could be hidden; their keys show the generic failure message as today. The registration and password forms keep clearing their password fields on a `422`, as on any failure.

### D6. Where each form holds the state

- Registration, profile, password: the form component uses the hook.
- Contact: `useContactForm` uses the hook and returns the merged errors and `unmatched`.
- Location: `LocationsPanel` keeps the request; `submitLocation` returns `{ status: "invalid", errors }` on a `422`, and the panel passes it to `LocationForm` as an `onSubmit` result: `onSubmit` resolves the `FieldErrors` of a `422`, else `null`; `LocationForm` uses the hook. The panel's `submitState` goes back to `"idle"` on a `422`.
- New offering: `useCreateFlow` uses the hook with `coffeeInventoryId`; it exposes `fieldErrors` and `serverUnmatched`, a `422` leaves `status` at `idle`, and `choose` clears `coffeeInventoryId`. `NewOfferingForm` shows the alert when `status` is `failed` or `serverUnmatched` is `true`, and the inventory field's error as `itemMissing ? inventoryRequired : fieldErrors.coffeeInventoryId`.
- Evaluation: `useEvaluationForm` uses the hook; a `422` dispatches `fail` with the failure message only when `unmatched`, and exposes `fieldErrors` and `clearFieldError`. `ContextFieldsCard` gains `fieldErrors` and `onFieldEdit(key)`, called from the two selects' change handlers.

## Risks / Trade-offs

- `RegisterForm`, `PasswordForm` and `ProfileForm` are already above 80 lines per component; the change adds a few lines to each. The build reports the units it cannot keep within the limits.
- QA tests that assert a `422` maps to `kind: "error"` become stale; they are listed, never edited.

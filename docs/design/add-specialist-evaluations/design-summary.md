# Design summary — add-specialist-evaluations

Input for `/opsx:propose`. Decisions taken by the product owner (Augusto) on 2026-10-04 unless listed under Open.

- Change-id: `add-specialist-evaluations`
- Capability: `evaluations`
- Depends on: `add-app-shell` (routes, catalogs, session source), `add-auth` (HTTP client with token, `useSession()`), `add-form-fields` (Field, Select, Checkbox, Textarea), `add-landing` (taxonomy `Badge` variant, `Card`), and the generic filtering change (filter components; name pending).
- Reference: SCA Coffee Value Assessment, Combined Form v2 (June 2024), adapted to the `POST /evaluations` contract.

## 1. Scope

A signed-in specialist creates, edits, closes, lists and deletes their own evaluations.

| Endpoint | Use |
|---|---|
| `GET /offerings/{ulid}` | Offering header on the form (coffee, coffeeshop, roaster) |
| `GET /taxonomies` | Descriptor options |
| `POST /evaluations` | First save (draft, status `open`) |
| `PUT /evaluations/{ulid}` | Later saves |
| `PATCH /evaluations/{ulid}/close` | Close |
| `GET /evaluations/{ulid}` | Load for edit, or read-only view when closed |
| `GET /evaluations?evaluatorId={me}` | My evaluations list |
| `DELETE /evaluations/{ulid}` | Delete from the list |

Data loading follows criterion A: public endpoints (`/offerings/{ulid}`, `/taxonomies`) are fetched on the server and passed as props; everything tied to the user goes through the add-auth HTTP client on the client.

## 2. Form structure (CVA Combined Form)

Header: roast level (`descriptive.roastLevel`, required, five values) and extraction method (`extractionMethod`, optional select).

Groups, in CVA order. Each group has a descriptive part (intensity 0–15, slider) and an affective part (impression 1–9, bean scale):

| Group | Descriptive | Affective |
|---|---|---|
| Fragrance / Aroma | two sliders, one shared descriptor block | two bean scales |
| Flavor / Aftertaste | two sliders, one shared descriptor block, main tastes (max 2) | two bean scales |
| Acidity | slider | bean scale |
| Sweetness | slider | bean scale |
| Mouthfeel | slider, descriptor block | bean scale |
| Overall | — | bean scale (required) |
| Defects | — | descriptor block (`affective.defects`) |
| Extrinsic | one optional notes field → `extrinsics.generalObservation` | — |

- **Fragrance is optional.** A visible option ("Fragrance not evaluated — use aroma values") copies the aroma descriptive and affective scores into fragrance on send. The API close rule needs all 15 scores.
- **Shared descriptor blocks** (option a): one selection per pair, sent as `cata` on both axes of the pair. The aromatic consensus counts a descriptor once per evaluation (union), so the duplicate does not inflate it.
- **Notes:** optional, one per axis and per part, hidden behind an "Add note" control.
- **Not in the form:** non-uniform and defective cup counts (not in the contract), the four other extrinsic fields, taxonomy level 2.

## 3. Descriptors

- Options come from `GET /taxonomies` by its `categories` field (aromatics, main tastes, mouthfeel, defects), levels 0 and 1, one row per level-0 category with its level-1 children, as in the CVA.
- Control: shadcn/ui **Toggle Group** (Radix), multiple selection. Each descriptor is a chip: outline when unselected, filled with the taxonomy data color when selected (the add-landing taxonomy `Badge` look). Rows wrap (`flex-wrap`). Main tastes disable the remaining chips once two are selected.

## 4. Scales

Bean scale and intensity slider as decided for `add-evaluation-scales` (2026-10-02): bean scale as a radio group with arrows and Home/End, cumulative fill, value shown as text outside the bean ("6/9"), bean tokens `evaluation-bean-on/off` and `evaluation-bean-mark-on/off`; native `range` slider 0–15, 6px track with `radius-pill`, 20px thumb, marks drawn by the component and labels by props; both with a `readOnly` version. Bean size: `md` (24px, the WCAG 2.5.8 minimum target) below `md`, `lg` from `md` up.

## 5. Layout (mobile-first)

- Below `md`: one column; each group is a collapsible section with descriptive above affective; sticky bottom bar with the two actions.
- From `md`: the CVA layout, each group in two columns (descriptive left, affective right) aligned by row.
- Each group header shows a completeness indicator, because the close request fails (409) if any score or required descriptor is missing.

## 6. Actions and states

- **Save draft:** `POST` the first time, `PUT` afterwards. **Close:** save, then `PATCH …/close`.
- 409 on close: message plus the incomplete groups highlighted. 403 (not the owner) and 409 on update (already closed): message, no retry.
- A closed evaluation opens read-only (scales in `readOnly`); no edit or close actions.
- The list shows my evaluations (offering, status, score, date) with edit for open ones, view for closed ones, and delete with an explicit confirmation.

## 7. Evaluations filter

The generic filter components belong to their own change; each feature composes its own filter from them. This change builds the evaluations filter for the list, composing those components and mapping them to the `GET /evaluations` query. `evaluatorId` is always the signed-in specialist and is not shown. Coffee search uses `GET /coffees?name=` as an autocomplete and sends the chosen coffee as `coffeeId`.

## Open

1. **Absorbing `add-evaluation-scales` into this change** (bean scale and slider built here). Needs Augusto's yes.
2. **Routes:** proposed `/{locale}/manage/evaluations` (list), `/new?offering={ulid}` (already used by the add-landing Evaluate link) and `/{ulid}` (edit or view).
3. **API precondition — `roastLevel` and cata on read:** `GET /evaluations/{ulid}` does not return `descriptive.roastLevel`, and returns tastes as a flat `{ref, type}` list. Loading a draft for edit would lose the roast level, which `PUT` requires. Either the API returns `roastLevel` (the symmetric `EvaluationResource` backlog item) or the form maps the flat list back and asks for the roast level again.
4. **Evaluations filter fields:** proposed coffee (autocomplete), status (open/closed), score range (`scoreMin`/`scoreMax`) and order (`orderBy`/`orderDirection`); `city`, `locationId` and `process` left out of "my evaluations". Needs Augusto's choice.
5. **Evaluate link on the offering card (handover from add-landing):** add-landing ships the link gated by the anonymous session constant, so it never renders. This change makes it session-aware on the client: a small client component reads `useSession()` (add-auth) and renders the link only for role `specialist`, pointing at `/{locale}/manage/evaluations/new?offering={ulid}`.
6. **Scope for evaluation writes:** the contract states the `specialist` role but not the scope. If writes need `profile:write`, the form requests the step-up on entering the screen, as decided for account editing.
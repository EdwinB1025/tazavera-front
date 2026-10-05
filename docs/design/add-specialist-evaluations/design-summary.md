# Design summary — add-specialist-evaluations

Input for `/opsx:propose`. Decisions taken by the product owner (Augusto) on 2026-10-04, updated after the explore on 2026-10-05, unless listed under Open.

- Change-id: `add-specialist-evaluations`
- Capability: `evaluations`
- Depends on: `add-app-shell` (routes, catalogs, session source), `add-auth` (HTTP client with token, `useSession()`), `add-form-fields` (Field, Select, Checkbox, Textarea), `add-landing` (taxonomy `Badge` variant, `Card`, `OfferingCard`), and `add-evaluation-scales` (bean scale and slider, capability `form-fields`, built before this change).
- The propose may reference the designs of `add-auth` and `add-landing`. The apply starts only after both are archived and merged into `develop`, and `develop` is merged into this branch.
- Reference: SCA Coffee Value Assessment, Combined Form v2 (June 2024), adapted to the `POST /evaluations` contract.

## 1. Scope

A signed-in specialist creates, edits, closes, lists and deletes their own evaluations.

| Endpoint | Use |
|---|---|
| `GET /offerings/{ulid}` | Offering header on the form (coffee, coffeeshop, roaster) and offering data for each list row |
| `GET /taxonomies` | Descriptor options |
| `GET /user` | The signed-in user's `ulid`, sent as `evaluatorId` |
| `POST /evaluations` | First save (draft, status `open`) |
| `PUT /evaluations/{ulid}` | Later saves |
| `PATCH /evaluations/{ulid}/close` | Close |
| `GET /evaluations/{ulid}` | Load for edit, or read-only view when closed |
| `GET /evaluations?evaluatorId={me}` | My evaluations list |
| `DELETE /evaluations/{ulid}` | Delete from the list |

- Data loading follows criterion A: public endpoints (`/offerings/{ulid}`, `/taxonomies`) are fetched on the server and passed as props; everything tied to the user goes through the add-auth HTTP client on the client.
- `GET /evaluations` and `GET /evaluations/{ulid}` are public (`security: []`).
- Writes (`POST`, `PUT`, `PATCH …/close`, `DELETE`) need the `specialist` role and, except `POST`, ownership (policy). The contract requires no `profile:write` scope for them, so the plain token is enough and there is no step-up.
- An evaluation carries only `offeringId` (a ULID string), not the offering. The list recovers each offering with `GET /offerings/{ulid}`, one request per distinct `offeringId` on the page.

## 2. Form structure (CVA Combined Form)

Header: roast level (`descriptive.roastLevel`, required by `POST` and `PUT`, five values) and extraction method (`extractionMethod`, optional select).

- Roast level is prefilled from the offering's coffee (`coffeeInventory.coffee.roastLevel`), for new drafts and for drafts loaded for edit, because `GET /evaluations/{ulid}` does not return it. It is shown as the API value, with no front translation.

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
- **Loading a draft:** `tastes` returns `{ref, type}` with `type` per axis (`fragrance`, `aroma`, `flavor`, `aftertaste`, `mouthfeel`, `main_tastes`, `defects`), so each selection maps back to its block by `type`.
- **Notes:** optional, one per axis and per part, hidden behind an "Add note" control.
- **Not in the form:** non-uniform and defective cup counts (not in the contract), the four other extrinsic fields, taxonomy level 2.

## 3. Descriptors

- Options come from `GET /taxonomies` by its `categories` field (aromatics, main tastes, mouthfeel, defects), levels 0 and 1, one row per level-0 category with its level-1 children, as in the CVA.
- Control: shadcn/ui **Toggle Group** (Radix), multiple selection. Each descriptor is a chip: outline when unselected, filled with the taxonomy data color when selected (the add-landing taxonomy `Badge` look). Rows wrap (`flex-wrap`). Main tastes disable the remaining chips once two are selected.

## 4. Scales

Built in `add-evaluation-scales` (capability `form-fields`); this change only uses them.

- Decisions of 2026-10-02 stand: bean scale as a radio group with arrows and Home/End, cumulative fill, value shown as text outside the bean ("6/9"), bean tokens `evaluation-bean-on/off` and `evaluation-bean-mark-on/off`; native `range` slider 0–15, 6px track with `radius-pill`, 20px thumb, marks drawn by the component and labels by props; both with a `readOnly` version. Bean size: `md` (24px, the WCAG 2.5.8 minimum target) below `md`, `lg` from `md` up.
- Both are ported from the MVC and adjusted to the front's theming, using the colour decisions already taken (bean on/off, slider off-track, moss → sage-800 gradient, thumb, and their dark values). If an SVG cannot be adjusted, it is redesigned on the basis of the original.
- MVC bean (`flux/icon/coffee-bean.blade.php`): SVG `viewBox="-2.4 -2.4 28.80 28.80"`, background `rect` 28.8 with `rx=14.4` scaled `scale(0.58)` (hence the drawing overflows; the front enlarges it), bean path with `fill`/`stroke` = line colour. Consensus (`consensus-axis`) fraction: `color-mix` between on/off in the MVC; a geometric cut in the front.
- MVC slider (`descriptive-intensity`): `input range` 0–15 step 1, filled via `--fill` (fixed moss → sage-800 gradient under an off layer), value "x/15" in underlined italics, marks 0/5/10/15 and LOW/MEDIUM/HIGH; static version is a `div` with the same `--fill`.
- Labels (LOW/MEDIUM/HIGH, the "/15" and "/9" suffixes) are interface text: they come from the front catalog and reach the components as props. Field values from the API are shown as the API returns them.

## 5. Layout (mobile-first)

- Below `md`: one column; each group is a collapsible section with descriptive above affective; sticky bottom bar with the two actions.
- From `md`: the CVA layout, each group in two columns (descriptive left, affective right) aligned by row.
- Each group header shows a completeness indicator, because the close request fails (409) if any score or required descriptor is missing.

## 6. Actions and states

- **Save draft:** `POST` the first time, `PUT` afterwards. **Close:** save, then `PATCH …/close`.
- 409 on close: message plus the incomplete groups highlighted. 403 (not the owner) and 409 on update (already closed): message, no retry.
- A closed evaluation opens read-only (scales in `readOnly`); no edit or close actions.
- The list shows my evaluations (offering, status, score, date) with edit for open ones, view for closed ones, and delete with an explicit confirmation. The list is always fixed to `evaluatorId` = the signed-in user's `ulid`; it is not a visible filter.

## 7. Routes

- `/{locale}/manage/evaluations`: list.
- `/{locale}/manage/evaluations/new?offering={ulid}`: reached only from the Evaluate action, which always carries `offering`. Without `offering`, or with an unknown one, the route shows the 404 page.
- `/{locale}/manage/evaluations/{ulid}`: edit (open) or read-only view (closed).

## 8. Evaluate link on the offering card

- add-landing ships the link gated by the anonymous session constant, so it never renders.
- `OfferingCard` gets a consumer-supplied action slot. The consumer passes a feature component (`EvaluateLink`) that reads `useSession()` (add-auth) and renders the link only for role `specialist`, pointing at `/{locale}/manage/evaluations/new?offering={ulid}`. The entity stays free of auth.
- The card change is made in this change, after add-landing is archived.

## Out of scope

- **Evaluations filter:** moved to `add-filter-controls`. It takes every `GET /evaluations` query field except the ID-based ones (`evaluatorId`, `coffeeId`, `locationId`): `city`, `process`, `status`, `scoreMin`/`scoreMax`, `orderBy`/`orderDirection`. Facets that do not exist yet are added there.
- Bean scale and slider: `add-evaluation-scales`.

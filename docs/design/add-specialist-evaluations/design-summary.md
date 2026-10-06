Status: draft — pending Product owner review

# Design summary — add-specialist-evaluations

Input for `/opsx:propose`. Decisions taken by the product owner (Augusto) on 2026-10-04, updated after the explore on 2026-10-05 and by the product owner's decisions of 2026-10-06, unless listed under Open.

- Change-id: `add-specialist-evaluations`
- Capability: `evaluations`
- Depends on: `add-app-shell` (routes, catalogs, session source, management sidebar region), `add-auth` (HTTP client with token, `useSession()`), `add-form-fields` (Field, Select, Checkbox, Textarea), `add-landing` (taxonomy `Badge` variant, `Card`, `OfferingCard`), and `add-evaluation-scales` (bean scale, slider, descriptor chip group and confirmation dialog, capability `form-fields`, built before this change).
- The propose may reference the designs of `add-auth` and `add-landing`. The apply starts only after both are archived and merged into `develop`, and `develop` is merged into this branch. (`add-landing` is merged into `develop` since 2026-10-06; `add-auth` is in apply.)
- Reference: SCA Coffee Value Assessment, Combined Form v2 (June 2024), adapted to the `POST /evaluations` contract.
- Visual reference: the MVC form and list (see §11). The capture files are not yet in this folder (Open 12).

## 1. Scope

A signed-in specialist creates, edits, closes, lists and deletes their own evaluations.

| Endpoint | `operationId` | Use |
|---|---|---|
| `GET /offerings/{ulid}` | `getAnOffering` | Offering header on the form (coffee, coffeeshop, roaster) and offering data for each list row |
| `GET /taxonomies` | `listOlfactoryTaxonomies` | Descriptor options |
| `GET /user` | `getTheAuthenticatedUser` | The signed-in user's `ulid`, sent as the `evaluatorId` query of the list (through the add-auth session, which already loads it) |
| `POST /evaluations` | `createAnEvaluation` | First save (draft, status `open`) |
| `PUT /evaluations/{ulid}` | `updateAnEvaluation` | Later saves |
| `PATCH /evaluations/{ulid}/close` | `closeAnEvaluation` | Close (no request body) |
| `GET /evaluations/{ulid}` | `getAnEvaluation` | Load for edit, or read-only view when closed |
| `GET /evaluations?evaluatorId={me}` | `listEvaluations` | My evaluations list (paginated: `meta.current_page`, `meta.last_page`, 15 per page) |
| `DELETE /evaluations/{ulid}` | `deleteAnEvaluation` | Delete from the list |

- Data loading follows the settled rule: public endpoints are fetched on the server and passed as props; everything that needs the token goes through the add-auth HTTP client on the client.
- `GET /evaluations`, `GET /evaluations/{ulid}`, `GET /offerings/{ulid}` and `GET /taxonomies` are public (`security: []`). The list's `evaluatorId` exists only in the client session (tokens live in browser memory), so the list and its per-row offerings are requested on the client, without a token. Whether the edit page loads on the server or the client is Open 6.
- Writes (`POST`, `PUT`, `PATCH …/close`, `DELETE`) need the `specialist` role and, except `POST`, ownership (policy). The contract requires no `profile:write` scope for them, so the plain token is enough and there is no step-up.
- An evaluation carries only `offeringId` (a ULID string), not the offering. The list recovers each offering with `GET /offerings/{ulid}`, one request per distinct `offeringId` on the page.

## 2. Form structure (CVA Combined Form)

Header: roast level (`descriptive.roastLevel`, required by `POST` and `PUT`, five values: `light`, `medium_light`, `medium`, `medium_dark`, `dark`) and extraction method (`extractionMethod`, optional select, at most 60 characters).

- Roast level is prefilled from the offering's coffee (`coffeeInventory.coffee.roastLevel`), for new drafts and for drafts loaded for edit, because `GET /evaluations/{ulid}` does not return it. It is shown as the API value, with no front translation.
- The extraction method options are not in the contract (free string); see Open 3.

Groups, in CVA order. Each group has a descriptive part (intensity 0–15, slider) and an affective part (impression 1–9, bean scale):

| Group | Descriptive | Affective |
|---|---|---|
| Fragrance / Aroma | two sliders, one shared descriptor block | two bean scales |
| Flavor / Aftertaste | two sliders, one shared descriptor block, main tastes (no limit) | two bean scales |
| Acidity | slider | bean scale |
| Sweetness | slider | bean scale |
| Mouthfeel | slider, descriptor block | bean scale |
| Overall | — | bean scale |
| Defects | — | descriptor block (`affective.defects`) |
| Extrinsic | one optional notes field → `extrinsics.generalObservation` | — |

- **Completeness for close** (contract, `closeAnEvaluation`): all 15 scores greater than 0 (7 descriptive + 8 affective), plus at least one descriptor for main tastes, for mouthfeel, and for the aromatic set (fragrance/aroma/flavor/aftertaste). Saving a draft requires only the roast level. Defects and extrinsic notes are never required.
- **Fragrance is optional.** A visible option ("Fragrance not evaluated — use aroma values") copies the aroma descriptive and affective scores into fragrance on send. The API close rule needs all 15 scores.
- **Shared descriptor blocks** (option a): one selection per pair, sent as `cata` on both axes of the pair. The aromatic consensus counts a descriptor once per evaluation (union), so the duplicate does not inflate it.
- **Loading a draft:** `tastes` returns `{ref, type}` with `type` per axis (`fragrance`, `aroma`, `flavor`, `aftertaste`, `mouthfeel`, `main_tastes`, `defects`), so each selection maps back to its block by `type`. (Verified read-only in `tazavera-api` `EvaluationService`: the stored type is the axis name; the contract example shows only `defects`, `main_tastes` and `mouthfeel`.)
- **Notes:** optional, one per axis and per part, hidden behind an "Add note" control.
- **Not in the form:** non-uniform and defective cup counts (not in the contract), the four other extrinsic fields, taxonomy level 2. `isDefective` is a read-only response field; the form has no "defective cup" checkbox (the MVC's checkbox is not ported).

## 3. Descriptors

- Options come from `GET /taxonomies`, which returns the whole tree with no query filter. For each block, the front keeps the level-0 and level-1 nodes whose `categories` contains the block's value (`aromatics`, `main_tastes`, `mouthfeel`, `defects`); a node with several categories appears in each matching block.
- Each level-0 node with at least one matching level-1 child is a row, with those children as chips (the row is shown even when the level-0 node itself does not match).
- Matching level-0 nodes with no matching child are chips themselves, together in one row.
- Level 2 is not shown.
- Chip labels use the node name for the route's locale (`nameEs`, `nameEn`, `nameCa`), as the landing taxonomy lookup does.
- Control: shadcn/ui **Toggle Group** (Radix), multiple selection, built in `add-evaluation-scales`. Each descriptor is a chip: outline when unselected, filled with the taxonomy data color when selected (the add-landing taxonomy `Badge` look). Rows wrap (`flex-wrap`). Main tastes have no selection limit.
- How the row's level-0 name is shown (row heading text or first chip) is defined by the chip group in `add-evaluation-scales`.

## 4. Scales

Built in `add-evaluation-scales` (capability `form-fields`); this change only uses them.

- Decisions of 2026-10-02 stand: bean scale as a radio group with arrows and Home/End, cumulative fill, value shown as text outside the bean ("6/9"), bean tokens `evaluation-bean-on/off` and `evaluation-bean-mark-on/off`; native `range` slider 0–15, 6px track with `radius-pill`, 20px thumb, marks drawn by the component and labels by props; both with a `readOnly` version. Bean size: `md` (24px, the WCAG 2.5.8 minimum target) below `md`, `lg` from `md` up.
- Both are ported from the MVC and adjusted to the front's theming, using the colour decisions already taken (bean on/off, slider off-track, moss → sage-800 gradient, thumb, and their dark values). If an SVG cannot be adjusted, it is redesigned on the basis of the original.
- MVC bean (`flux/icon/coffee-bean.blade.php`): SVG `viewBox="-2.4 -2.4 28.80 28.80"`, background `rect` 28.8 with `rx=14.4` scaled `scale(0.58)` (hence the drawing overflows; the front enlarges it), bean path with `fill`/`stroke` = line colour. Consensus (`consensus-axis`) fraction: `color-mix` between on/off in the MVC; a geometric cut in the front.
- MVC slider (`descriptive-intensity`): `input range` 0–15 step 1, filled via `--fill` (fixed moss → sage-800 gradient under an off layer), value "x/15" in underlined italics, marks 0/5/10/15 and LOW/MEDIUM/HIGH; static version is a `div` with the same `--fill`.
- Labels (LOW/MEDIUM/HIGH, the "/15" and "/9" suffixes) are interface text: they come from the front catalog and reach the components as props. Field values from the API are shown as the API returns them.
- An unset score: the contract allows `null` scores on a draft, and 0 is a valid descriptive value that the close rule rejects. How the slider shows "not yet scored" is Open 4.

## 5. Layout (mobile-first)

- Below `md`: one column; each group is a collapsible section with descriptive above affective; sticky bottom bar with the two actions.
- From `md`: the CVA layout, each group in two columns (descriptive left, affective right) aligned by row.
- Each group header shows a completeness indicator, because the close request fails (409) if any score or required descriptor is missing. The indicator is text plus an icon, never colour alone (Open 5 for its wording and icon).

## 6. Actions and states

- **Save draft:** `POST` the first time, `PUT` afterwards. **Close:** save, then `PATCH …/close`.
- 409 on close: message plus the incomplete groups highlighted. 403 (not the owner) and 409 on update (already closed): message, no retry.
- A closed evaluation opens read-only (scales in `readOnly`); no edit or close actions.
- The list shows my evaluations (offering, status, score) with edit for open ones, view for closed ones, and delete with an explicit confirmation (the dialog of `add-evaluation-scales`). The list is always fixed to `evaluatorId` = the signed-in user's `ulid`; it is not a visible filter. The contract returns no date for an evaluation (Open 1).

### Response states by operation

| `operationId` | Loading | Success | Errors in the contract | Other failure (network, 5xx, undocumented 422) |
|---|---|---|---|---|
| `listEvaluations` | Open 7 | Rows; empty state when `data` is empty (Open 7) | none | Open 7 |
| `getAnOffering` (list row) | Row placeholder (Open 7) | Coffee name, coffeeshop, roaster | none | Open 7 |
| `getAnOffering` (new form) | — | Form header | unknown `offering` → 404 page (§7) | Open 7 |
| `getAnEvaluation` | Open 6 | Form (open) or read-only view (closed) | unknown evaluation → 404 page (Open 6) | Open 7 |
| `listOlfactoryTaxonomies` | — | Descriptor blocks | none | Open 7 |
| `createAnEvaluation` | Save button in its `loading` state | Stays on the form, now at `/manage/evaluations/{ulid}` (Open 8) with a saved confirmation (Open 8) | none documented | Open 7 |
| `updateAnEvaluation` | Save button `loading` | Saved confirmation (Open 8) | 403, 409: message, no retry | Open 7 |
| `closeAnEvaluation` | Close button `loading` | Read-only view (Open 8) | 403: message; 409: message + incomplete groups highlighted | Open 7 |
| `deleteAnEvaluation` | Confirm button `loading` | Row removed, list refreshed | 403: message | Open 7 |

- The API `message` strings are English only; the interface shows a catalog text for each status instead of the API text (settled rule: every interface text comes from a message catalog), so each status has one catalog message.
- A `401` enters the add-auth client's recovery chain; no message here.

## 7. Routes

- `/{locale}/manage/evaluations`: list. The add-app-shell user menu's "Manage evaluations" entry already points here.
- `/{locale}/manage/evaluations/new?offering={ulid}`: reached only from the Evaluate action, which always carries `offering`. Without `offering`, or with an unknown one, the route shows the 404 page.
- `/{locale}/manage/evaluations/{ulid}`: edit (open) or read-only view (closed).
- Access by an anonymous user or a non-specialist: Open 9. The management sidebar entries this area contributes: Open 10.

## 8. Evaluate link on the offering card

- add-landing ships `OfferingCard` with a `session: Session` prop and renders the link when that session's role is `specialist`; `HomeScreen` passes the anonymous session constant, so the link never renders. The cards are rendered by the async Server Component `VerifiedOfferings`, where `useSession()` (client only) cannot run.
- `OfferingCard` gets a consumer-supplied action slot that replaces the `session` prop and its role check. The consumer passes a feature component (`EvaluateLink`) that reads `useSession()` (add-auth) and renders the link only for role `specialist`, pointing at `/{locale}/manage/evaluations/new?offering={ulid}`. The entity stays free of auth.
- The card change is made in this change, after add-landing is archived (done). The tests of `OfferingCard`, `OfferingList` and `HomeScreen` that pass a `session` change with it.

## 9. Page layout and spacing

Values translated from the MVC (`livewire/evaluations/evaluation-form.blade.php`, `layouts/evaluations/partials/evaluation-axis.blade.php`, `evaluation-list.blade.php`, `evaluation-card.blade.php`, classes `tz-form-main` and `tz-card-section` in `resources/css/app.css`) to the front's tokens, and from the D14 page layout of the decisions log. Every value is an end state; the build picks the utility.

**Page (both routes), D14:** one full-width section on `surface-page`; content in a centered container at most 72rem wide; horizontal padding 1rem below `md`, 2rem from `md`; vertical padding 3rem below `md`, 4rem from `md`. The page contents stack with explicit gaps below.

**Form page:**
- Page header block, top of the container: back link (`Link` variant `back`, to the list), the eyebrow, the coffee name (`type-heading`), and the coffeeshop and roaster captions (`type-label`). Back link and eyebrow 1rem apart; eyebrow and heading 1rem apart; heading and captions with no gap between them (MVC `gap-0`), captions 0.25rem apart. No border, no background of its own. 2rem between the header block and the first card.
- Context card (roast level, extraction method): `Card` layout `stacked`, `CardContent` only (padding 1.5rem, radius `radius-container`, accent left border 4px `border-accent` and shadow, as the Card owns them). The two `Field`s stack 1rem apart below `md` and sit in two equal columns 1.5rem apart from `md`.
- One `Card` (layout `stacked`) per group, in CVA order, 1rem between cards (MVC `gap-4`).
  - Header in `CardAside` (padding 1.5rem, 1px bottom border `border-subtle`, both owned by the Card): group name (`type-subheading`) and the completeness indicator on one row, space between them, 0.5rem gap, wrapping. Below `md` the header is the collapse toggle: a full-width button carrying the name, the indicator and a `ChevronDown` icon (rotated when open), `focus-visible:focus-ring`, `aria-expanded`, accessible name = the group name. From `md` the header is not interactive.
  - Body in `CardContent` (padding 1.5rem): the descriptive and affective parts. Below `md` they stack, 1.5rem apart, separated by a 1px top border `border-subtle` on the affective part with 1.5rem padding above it. From `md` two equal columns 1.5rem apart, the descriptive column with a 1px right border `border-subtle` and 1.5rem padding to its right (MVC `tz-right-border-card`, `gap-6`). Groups without a descriptive part (Overall, Defects) use one full-width column.
  - Inside each part: part heading (`type-label`), score panel, descriptor block, note, 1rem apart (MVC `gap-4`).
  - Score panel: background `surface-section`, radius `radius-container`, 1px border `border-subtle`, padding 1rem; two scales of a pair 0.5rem apart (MVC `tz-card-section`, `gap-2`).
  - Descriptor block: same panel treatment (padding 1rem); its rows and chips follow the chip group of `add-evaluation-scales` (the landing values for badge rows are 0.5rem between chips and between rows).
  - Note: "Add note" is a `Link`-styled button (`type-body`, `text-link`); opened, a `Field` with a `Textarea` (label, control and remove action owned by `Field`), remove action aligned to the end.
- "Fragrance not evaluated" option: a `Checkbox` with its label at the top of the Fragrance / Aroma body, 1rem above the parts.
- Actions:
  - Below `md`: a sticky bar fixed to the bottom of the viewport, full width, background `surface-card`, 1px top border `border-subtle`, padding 0.75rem vertical and 1rem horizontal, the two buttons sharing the width 1rem apart. The page's last card keeps a bottom margin equal to the bar's height so nothing hides behind it.
  - From `md`: an actions row after the last card, 2rem below it, 1px top border `border-subtle` with 1.5rem padding above the buttons, buttons aligned to the end, 1rem apart (MVC `tz-top-border-card`). The MVC's duplicate actions row at the top is not ported.
  - Button variants: Open 2.
- Read-only view: the same layout without the actions bar or row, scales in `readOnly`, no "Add note" control; existing notes shown as `type-body` text.

**List page:**
- Header row: page heading (`type-heading`), 2rem above the list.
- List: one column at every width, one row card per evaluation, 1rem between cards. Each row is a `Card` layout `default` (the MVC row card): `CardAside` with the score (`type-score` + "/100" `type-meta` + rating `Badge`, as `OfferingCard` shows it), `CardContent` with the status badge (Open 11), the coffee name (`type-card-heading`) and the coffeeshop and roaster captions (`type-label`), 0.5rem apart; `CardFooter` with the actions on one wrapping row, aligned to the end, 1rem apart.
- Pagination: Previous/Next centred below the list, 2rem below it, 1rem apart (the landing values). Reuse is Open 13.
- Empty and error states: `type-body` text in the list's place, at the top of the list area (Open 7).

## 10. Texts (message catalog area `evaluations`, es/en/ca, passed as props)

New area `messages/{locale}/evaluations.json`. Keys (the wording is drafted by the architect, translated in the three locales):
- page: list heading, form eyebrow, back link label, coffeeshop and roaster captions;
- header fields: roast level label, extraction method label and placeholder;
- groups: the eight group names; descriptive and affective part headings; descriptor block labels (aromatics, main tastes, mouthfeel, defects); "Fragrance not evaluated — use aroma values"; completeness indicator texts (Open 5);
- notes: "Add note", note label, "Remove note"; extrinsic notes label;
- scales (passed to `add-evaluation-scales` components): LOW/MEDIUM/HIGH, "/15", "/9", the scale accessible names per axis;
- actions: Save draft, Close evaluation, Edit, View, Delete, Previous, Next; the delete dialog's title, body, confirm and cancel;
- status: Open, Closed (Open 11);
- messages: saved, closed, deleted, not the owner (403), already closed (409 update), incomplete (409 close), generic failure, empty list (Open 7, 8);
- the group toggle's accessible names, if the visible name is not enough.

Not in the catalog: roast level values, taxonomy names (from the API per locale), coffee, coffeeshop and roaster names, scores.

## 11. Visual reference

MVC views to capture at 375px and 1280px (Product owner adds them to this folder): the evaluation form (`livewire/evaluations/evaluation-form.blade.php`, one group expanded, from `evaluation-axis.blade.php`) and the evaluation list (`layouts/evaluations/partials/evaluation-list.blade.php` with `evaluation-card.blade.php`). The MVC filter bar (`evaluation-filterbar.blade.php`) belongs to `add-filter-controls`.

## 12. Contrast

This change adds no colour token. Its own text roles sit on `surface-page`, `surface-card` (cards), `surface-section` (score and descriptor panels) and `surface-section-hover`. Measured with an executed script by the design lead on 2026-10-06 (design lead's numbers):
- Traditional: `text-primary` 5.37–6.81, `text-secondary` 5.06–6.42, `text-accent` 5.73–7.27, `text-label` 5.00–6.34, `feedback-error` 5.64–7.16, `text-link` 5.37–6.81 across those surfaces and `surface-form` — all pass 4.5:1.
- Dark: `text-primary` 10.52–14.28, `text-secondary` 6.31–8.57, `text-accent` 5.43–7.37, `text-label` 7.57–10.28, `feedback-error` 4.52–6.13 (lowest on `surface-section-hover`), `text-link` 10.52–14.28 — all pass 4.5:1.
- Focus ring on those surfaces: 9.65–12.24 traditional, 10.52–14.28 dark (3:1 gate).
- Buttons, scales, chips and the dialog are measured in their own changes (`add-base-control`, `add-evaluation-scales`). Panel borders `border-subtle` are decorative and not gated.
- No new guard pairs are registered by this change.

## Out of scope

- **Evaluations filter:** moved to `add-filter-controls`. It takes every `GET /evaluations` query field except the ID-based ones (`evaluatorId`, `coffeeId`, `locationId`): `city`, `process`, `status`, `scoreMin`/`scoreMax`, `orderBy`/`orderDirection`. Facets that do not exist yet are added there.
- Bean scale, slider, descriptor chip group and confirmation dialog: `add-evaluation-scales`.

## Open

1. **List date.** §6 listed a date per row, but the evaluation resource has no date field (`listEvaluations` only orders by `created_at`). Options: a) drop the date and order the list by `created_at desc` (`orderBy=created_at&orderDirection=desc`); b) ask the backend to add `createdAt`/`closedAt` to the resource, then update the contract. Recommendation: a) for the delivery (contract on `develop`, AGENTS.md "never invent API fields"); b) as a backend backlog item. Blocks propose: yes.
2. **Action button variants.** Save draft and Close (form), Edit/View and Delete (list), Confirm/Cancel (dialog). The MVC uses one outline style for all. Options: a) Close = `primary`, Save draft = `action-3`, Edit/View = `action-3`, Delete = `action-2`; b) all `action-*` with Close as `action-1`. Recommendation: a): one primary action per screen (`base-controls` primary), and `action-2` is the oxblood family the MVC uses for removal (`--color-oxblood` on "Eliminar nota"). Blocks propose: no (the architect can state the variant per button once chosen; tasks change only in class names).
3. **Extraction method options.** The contract takes a free string (max 60). The MVC uses a fixed list (`EXTRACTION_METHODS` in the Livewire component, values like V60, Espresso, Chemex). Options: a) a `Select` with the MVC's list, values sent as the MVC sends them; b) a text `Input` with a placeholder. Recommendation: a) if Product owner confirms the list (the summary already says "select"); the list's labels then go in the catalog. Unverified: the exact MVC list (in the PHP component, not read). Blocks propose: yes.
4. **Unscored state.** A new draft has no scores; the slider's native range always holds a value, and 0 is a valid descriptive value that fails the close rule. Options: a) start sliders at 0 and send 0 (close rule flags them as incomplete); b) send `null` until the user moves the slider, shown with a "not scored" text beside it. Recommendation: a): simplest, matches the MVC and the API's 409 semantics; the completeness indicator already explains it. Belongs partly to `add-evaluation-scales` (slider props). Blocks propose: yes.
5. **Completeness indicator wording and icon.** Options: a) `Check` icon + "Complete" / no icon + "Incomplete" text; b) a count "3/4". Recommendation: a) with `Check` (already in `icons.ts`); an icon for "incomplete" would need a new export from `icons.ts` (e.g. `CircleAlert`), which is a small entry-point change in this change. Blocks propose: no.
6. **Edit page loading and ownership.** `getAnEvaluation` is public, so the page could load on the server; but ownership is known only on the client (session). Options: a) server load of the evaluation and its offering, the client hides the actions when the session user is not the owner (shows read-only); b) everything on the client after the session resolves. Also: an unknown `{ulid}` → 404 page (as `/new`). Recommendation: a) with the read-only view for non-owners: follows the settled data-loading rule and needs no new state. Blocks propose: yes.
7. **Loading, empty and generic error states.** None is designed. Options: reuse the landing patterns (skeleton cards while loading, one `type-body` empty message, an error message with a retry `Button`, as `OfferingList`/`RetryButton` do). Recommendation: reuse the landing pattern in this slice, and register the duplication of `RetryButton`/skeleton in the backlog if it is copied. Blocks propose: yes.
8. **After a successful save, close or delete.** Options: after the first `POST`, replace the URL with `/manage/evaluations/{ulid}` (so later saves `PUT`); after save, a confirmation message in a status region (`role="status"`); after close, show the read-only view; after delete, refresh the list page. Recommendation: as listed. A shared toast does not exist; a status region next to the actions needs no new component. Blocks propose: yes.
9. **Access to `/manage/evaluations*` by an anonymous user or a non-specialist.** Options: a) anonymous → start sign-in (add-auth `signIn` with the route); non-specialist → 404 page; b) both → a message with a link home. Recommendation: a), pending add-auth's final API; touches the auth flow, so it is Product owner's. Blocks propose: yes.
10. **Management sidebar entries.** The app-shell sidebar shows the entries of the management area in view; this change must supply them. Options: a) one entry "My evaluations" → the list; b) none (sidebar empty). Recommendation: a). Blocks propose: no.
11. **Status badge in the list.** The MVC uses the verified/provisional badges (`clock` for open, `check` for closed). Options: a) reuse `Badge` `provisional` (Clock) for open and `verified` (Check) for closed, with catalog labels "Open"/"Closed"; b) new badge variants. Recommendation: a) (criterion C; no new tokens). Blocks propose: no.
12. **Visual reference captures.** The folder has no capture yet. Product owner adds the MVC captures named in §11. Blocks propose: no.
13. **Reuse of the landing pieces (backlog).** `fetchTaxonomies` and `buildTaxonomyLookup` (`src/widgets/offering-list/api/offerings.ts`, `lib/resolve-taxonomies.ts`) and `OfferingPagination` (route hard-wired to `/{locale}?page=`) live in the `offering-list` widget; this change cannot import them from another widget or page slice without breaking FSD. Options: a) a refactor change first that moves the taxonomy read and lookup to `entities/taxonomy` (or `shared/api`) and makes the pagination route-agnostic in `shared/ui`; b) copy them here and register the duplication in `docs/backlog.md`. Recommendation: a), as its own change before this apply (criterion C; `add-offering-catalog` and `add-filter-controls` will need the same pieces). Product owner adds the backlog entry. Blocks propose: yes (decides the files this change creates).

### Answers of 2026-10-06 (Product owner with the orchestrator)

1. **b)** The backend adds `createdAt` and `closedAt` to the evaluation resource. The list shows the date once the updated `contracts/openapi.yaml` is on `develop` and `src/shared/api/schema.ts` is regenerated. The propose waits for that contract.
2. a), settled by the orchestrator: Close `primary`; Save draft and Edit/View `action-3`; Delete `action-2`.
3. a), settled by the orchestrator: a `Select` with the MVC list (`EvaluationForm.php:114`: `espresso`, `v60`, `chemex`, `aeropress`, `french_press`, `moka`, `cold_brew`, `siphon`, `kalita`), sent as these values; labels in the catalog.
4. a), follows Product owner's answer to `add-evaluation-scales` Open 4: sliders start at 0 and send 0; the completeness indicator flags them.
5. a), settled by the orchestrator: `Check` + "Complete"; "Incomplete" as text with no icon.
6. a), settled by the orchestrator: server load, read-only view for non-owners, unknown `{ulid}` → 404 page.
7. Settled by the orchestrator: reuse the landing loading, empty and error patterns.
8. Settled by the orchestrator: as listed in the point.
9. **a)** Anonymous → sign-in with return to the route; non-specialist → 404 page.
10. a), settled by the orchestrator: one entry "My evaluations". The evaluations list also shows the evaluation facets in the sidebar (`add-filter-controls`, Product owner's answer of 2026-10-06).
11. a), settled by the orchestrator.
12. Still open: proposed MVC captures for the list, and a CVA mock-up by the design lead as the form reference (the MVC form only for spacing), because the form follows the CVA Combined Form, not the MVC layout.
13. **a)** A refactor change first moves the taxonomy read and lookup to `entities/taxonomy` and makes the pagination route-agnostic in `shared/ui`.

## Review log

### 2026-10-06 — design lead review
Settled (criterion B), with the source:
- §2/§3: "main tastes (max 2)" and "disable the remaining chips once two are selected" removed; the 6 Oct decision is "unlimited basic tastes" (decisions in `docs/general-context.md`).
- §2: "Overall … (required)" replaced by the contract's completeness rule (`closeAnEvaluation`: all 15 scores > 0 plus main tastes, mouthfeel and aromatic descriptors); scores are optional on save, only `roastLevel` is required (`createAnEvaluation`, `updateAnEvaluation`).
- §2: `isDefective` noted as read-only; the MVC's defective-cup checkbox not ported (no request field).
- §1: `operationId`s added; pagination noted; "criterion A" reworded to the settled data-loading rule; the list's public reads placed on the client because `evaluatorId` exists only in the in-memory session (verified constraint).
- §6: "date" removed from the list row because the contract has no date field; kept as Open 1.
- §8: corrected to the code on `develop`: add-landing gates the link through a `session` prop, not an anonymous constant inside the card; `VerifiedOfferings` is an async Server Component, so the slot decision stands and replaces that prop.
- §7: the user menu already links to the list route (add-app-shell `UserMenu`).
- Added: status line, response states table, page layout and spacing (§9, from the MVC and D14), texts by catalog area (§10), visual reference (§11), contrast (§12), Open list, this log.
Changed since the last review: the Product owner's 6 Oct descriptor rules (§3) and dependency on the chip group and dialog were already in the file and are kept as written.

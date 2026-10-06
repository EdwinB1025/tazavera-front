Status: draft — pending Product owner review

# Design summary — add-offering-management

Capability: `offering-management`. Change-id: `add-offering-management`. Branch (when created): `feature/add-offering-management`.

Drafted by the design lead on 2026-10-06 (generation mode). Sources:
- `contracts/openapi.yaml` on `develop`;
- the main specs in `openspec/specs/`;
- the code on `develop` and on `feature/add-auth`;
- the active drafts of `add-offering-catalog` (`develop`), `add-evaluation-scales` (worktree `tazavera-front-scales`) and `add-specialist-evaluations` (worktree `tazavera-front-evaluations`);
- the MVC.

Numbers marked *(measured)* come from a script the design lead executed; *(computed)* are the design lead's arithmetic; *(unverified)* was not checked.

**The MVC has no coffeeshop management screen.** `routes/web.php:11` exposes only `offerings.index` and `offerings.show`. `resources/views` has no create, delete or "my offerings" view. The visual language below is therefore translated from the closest MVC patterns, each cited:
- the management list: `layouts/evaluations/index.blade.php`, `partials/evaluation-list.blade.php`;
- card actions and their colours: `partials/evaluation-card.blade.php:62-83`, `resources/css/app.css:835-882`;
- the form panel: `resources/css/app.css:487-491` (`tz-form-main`);
- the confirmation: `livewire/settings/delete-user-form.blade.php`, as mapped by add-evaluation-scales §5.

## 1. Scope

A coffeeshop manages its own offerings in the management area:

1. **My offerings** at `/{locale}/manage/offerings`: the coffeeshop's own offerings as cards, with pagination, selection, deleting one, and deleting several.
2. **New offering** at `/{locale}/manage/offerings/new`: create one offering per chosen location from one coffee-inventory item, narrowed by roaster and coffee.
3. **Sidebar entries** this area contributes to the `app-shell` management sidebar: "My offerings" and "New offering" (mechanism: Open 1).

Already settled elsewhere:
- **The list route.** The user menu's "Manage offerings" entry points at `/{locale}/manage/offerings` for role `coffeeshop` (`src/widgets/app-header/ui/UserMenu.tsx:116-117`; `openspec/specs/app-shell/spec.md`, "Management entry for a coffeeshop").
- **Management routes.** `/[locale]/manage/*` is the management route pattern the sidebar shows on (`src/widgets/app-sidebar/ui/AppSidebar.tsx:25`).
- **The sidebar region.** The region and its presentation belong to `app-shell`; the entries come from the area in view (`app-shell` spec, "Management sidebar").
- **The confirmation dialog.** `ConfirmDialog` comes from `add-evaluation-scales` (general context, "El diálogo de borrado va en add-evaluation-scales"; scales summary §5).

Out of scope:
- editing an offering (the contract has no update operation);
- managing locations or inventory (read-only here);
- filter controls on the own-offerings list (`add-filter-controls` owns the offering filters);
- the public catalog and the detail page (`add-offering-catalog`);
- the step-up mechanism itself (`add-auth`).

## 2. Contract operations consumed

| operationId | Route | Security (contract) | Used by | Fetched |
|---|---|---|---|---|
| `listOfferings` | `GET /offerings?coffeeshopUlid={user.ulid}&page=n` | public | My offerings | Client, `publicRequest` (see note) |
| `deleteAnOffering` | `DELETE /offerings/{offering_ulid}` | coffeeshop role, `profile:write`, owns the offering | My offerings, single delete | Client, `request` |
| `deleteMultipleOfferings` | `DELETE /offerings`, body `{ offerings: string[] }`, max 50 | coffeeshop role, `profile:write`, owns all | My offerings, bulk delete | Client, `request` |
| `listMyLocations` | `GET /locations` | coffeeshop role, `profile:read` or `profile:write` | New offering, locations | Client, `request` |
| `listCoffeeInventory` | `GET /coffeeInventory?coffeeName=` | coffeeshop role, read or write | New offering, inventory item | Client, `request` |
| `createOfferings` | `POST /offerings`, body `{ coffeeInventoryId, locations[] }` | coffeeshop role, `profile:write`, owns every location | New offering, submit | Client, `request` |
| `listRoasteries` | `GET /roasteries` | public | New offering, roaster narrowing | Server, plain `fetch` |
| `listCoffees` | `GET /coffees` | public | New offering, coffee narrowing | Server, plain `fetch` |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | public | Card taste badges (Open 12) | Server, plain `fetch` |

**Fetching rule** (settled, `.claude/CLAUDE.md` §2): public endpoints run on the server with plain `fetch`; token endpoints run on the client through add-auth's client.

**Note on `listOfferings`** (criterion B, closed with a verified constraint). The own list is public, but its filter value is the signed-in user's `ulid` from `GET /user`. That value lives only in the browser session: tokens are kept only in browser memory and the front has no auth cookie (`.claude/CLAUDE.md` §2). So the server cannot build this request. It runs on the client through `publicRequest`, with no credential. This keeps the intent of the rule (no token on a public endpoint), adds nothing and changes nothing visible. The orchestrator may record it under "Closed for review".

**add-auth interface used** (add-auth is not merged: names verified on `feature/add-auth`, unverified against its final merge):
- `request(path, init)` from `@/shared/api` (`src/shared/api/client.ts`): sends `Authorization: Bearer`; on a `401` it refreshes once and retries.
- `publicRequest(path, init)` from `@/shared/api`: no credential.
- `useSession()` from `@/features/auth`: `Session` = `loading | anonymous | authenticated { user }`, where `user` carries `ulid` and `role` (`src/shared/api/index.ts`).
- `signIn(returnRoute?)` and `requestProfileWrite(returnRoute)` from `@/features/auth`. The step-up opens a popup inside the click and returns `void` (`src/features/auth/api/authorize.ts`).

**Response states, per operation:**

| Operation | Loading | Success | Empty | Error (any non-2xx, transport) | 403 | 422 |
|---|---|---|---|---|---|---|
| `listOfferings` (own) | 3 skeleton cards in the grid | Cards, toolbar, pagination | Empty message + "Create an offering" link | Message + Retry (refetch) | n/a (public) | Same as error. The contract documents none |
| `deleteAnOffering` | Dialog confirm `Button loading`, Cancel disabled | Dialog closes; status "Offerings deleted: 1"; the page refetches | — | Dialog stays open with its error text; retry allowed | Open 6 (step-up) | Not expected (no body); same as error |
| `deleteMultipleOfferings` | Same | Dialog closes; status "Offerings deleted: {n}"; selection cleared; refetch | — | Same | Open 6 | Same as error (Open 7) |
| `listMyLocations` | `type-meta` line "Loading your locations…" in the group's place | One checkbox per location | "You have no locations registered."; submit disabled | Error line + Retry (`action-4` sm) | Open 5 (role) | n/a |
| `listCoffeeInventory` | "Loading the inventory…" in the group's place | One radio per item | "No inventory items match." | Error line + Retry | Open 5 | Same as error |
| `createOfferings` | Submit `Button loading` | Success status region (Open 9) | — | Form-level error, values kept | Open 6 | Form-level error (Open 7) |
| `listRoasteries`, `listCoffees` | The two selects render after the server fetch, inside `Suspense`; fallback: the selects disabled | Options | Only the "All …" option | The select keeps only "All …" and a help line "The list could not be loaded." The form stays usable | n/a | n/a |

API values are shown as they are (general context, "Forma de trabajar"): names, `roastLot`, `productionDate`, `verificationStatus` through the status badge.

The API `message` strings ("Offering(s) deleted.", "Offering(s) created.") are not shown. Every text comes from the catalog.

**After a delete:**
- the current page is fetched again;
- when the current page comes back empty and it is not page 1, the list moves to the previous page.

**Bulk limit:**
- selection is limited to the current page;
- the page holds `meta.per_page` items (15 in the contract example), so a bulk request never exceeds the documented 50 *(per_page value unverified against the API default)*.

## 3. Routes and composition (FSD)

| Layer | Piece | Notes |
|---|---|---|
| `app/[locale]/manage/offerings/page.tsx` | Route: passes the locale and the `page` search param to the screen. No logic | As `app/[locale]/page.tsx` |
| `app/[locale]/manage/offerings/new/page.tsx` | Route: passes the locale | Route name: Open 11 |
| `src/pages/manage-offerings` | `ManageOfferingsScreen`: loads the catalog texts and the taxonomies (server), renders the page layout and the client list | New |
| `src/pages/new-offering` | `NewOfferingScreen`: loads the texts, roasteries and coffees (server, `Suspense`), renders the form | New |
| `src/features/offering-management` | Client pieces: own-offering list state (fetch, selection, delete flows), `DeleteOfferingAction`, `BulkDeleteToolbar`, `CreateOfferingForm`, the sidebar entries | New. Uses `useSession`, `request`, `publicRequest` |
| `src/entities/offering` | `OfferingCard` with an action slot (Open 2) | Existing |
| `src/entities/coffee`, `src/entities/roastery` | Server fetchers for `listCoffees` and `listRoasteries` | New. Shared with `add-filter-controls` (Open 16) |
| `src/widgets/offering-list` | Grid constant, `OfferingSkeletonCard`, `OfferingPagination` generalized (Open 3) | Existing |
| `src/shared/ui` | `Button`, `Link`, `Checkbox`, `RadioGroup`, `Field`, `Select`, `Badge`, `Card`, `ConfirmDialog` (add-evaluation-scales), Sidebar parts | Existing / scales |
| `src/shared/ui/icons.ts` | Add `Trash2` and `Plus` to the existing lucide entry | No new dependency (`lucide-react` installed) |

## 4. Components and reuse

| Part | Component and variant | States | Accessible name / semantics |
|---|---|---|---|
| Eyebrow | `<p className="type-eyebrow-strong">` (as `HomeHero`) | — | text |
| Heading | `<h1 className="type-heading">`, `tabIndex={-1}` as the focus target after a delete (Open 18) | — | heading text |
| "New offering" (list header) | `Link` default → `/{locale}/manage/offerings/new` (`base-controls`: internal navigation is a link) | rest, hover, focus | label |
| Status region | `<p role="status">`, `type-body` | empty: renders nothing | live, polite |
| Select all (page) | `Checkbox` default, label "Select all on this page" | unchecked; checked when every card on the page is selected; activating it on a partial selection selects all | own label |
| Selected count | `<span className="type-meta">` "Selected: {n}" | — | inside the toolbar |
| Bulk delete | `Button variant="action-4" size="sm" icon={Trash2}` "Delete selected" | disabled (50% opacity) at 0 selected | label |
| Offering card | `OfferingCard` (`Card layout="stacked"`) with the action slot (Open 2) | as landing | `h3` coffee name |
| Select one | `Checkbox` default. Visible label "Select", plus a visually hidden " {coffee name} — {location name}" | checked / unchecked | "Select Huila El Mirador — Tazavera Gràcia" |
| Delete one | `Button variant="action-4" size="sm" icon={Trash2}` "Delete", `aria-label` "Delete {coffee name} — {location name}" (starts with the visible text, WCAG 2.5.3) | rest, hover, focus | as given |
| Confirmation | `ConfirmDialog` (add-evaluation-scales §5): `title`, `description`, `confirmLabel`, `cancelLabel`, `pending`, `error` | closed, open, pending, error | `alertdialog`, name = title, description bound |
| Pagination | `OfferingPagination`, generalized to a base path (Open 3) | disabled at the boundaries | button labels |
| Skeleton | `OfferingSkeletonCard` ×3 | loading | shapes only |
| Retry (list) | `Button variant="primary"` with an `onClick` refetch. Not `RetryButton`, which calls `router.refresh()` for server data | — | label |
| Back link (form) | `Link variant="back"` → `/{locale}/manage/offerings` | — | "Back to my offerings" |
| Roaster | `Field` + `Select`; first option "All roasters" (value "") | rest, disabled while loading | Field label |
| Coffee | `Field` + `Select`; first option "All coffees" | same | Field label |
| Inventory item | `RadioGroup`, legend "Inventory item", `required` | loading, empty, error, selected, error message | fieldset + legend |
| Locations | `<fieldset>` + `<legend className="type-label">` with the required asterisk (Field's pattern), one `Checkbox` per location (Open 19) | loading, empty, error, error message | fieldset + legend; the error bound with `aria-describedby` |
| Form error | `<p role="alert" className="type-error">` | renders nothing when empty | alert |
| Submit | `Button variant="primary"` type submit "Create offerings" | rest, hover, `loading` while pending | label |
| Cancel | `Link` default → list | — | label |
| Step-up action | `Button variant="primary" size="sm"` "Confirm your identity", in the dialog's `error` region or the form error (Open 6) | — | label |
| Sidebar entries | link entries in `SidebarMenu`/`SidebarMenuItem` (Open 1) | rest, hover, current (`aria-current="page"`), focus | labels |

**Delete colour.** The MVC's delete is a translucent muted fill (`app.css:873-882`, `--color-ui-muted` 35%). In this project that is `action-4` (`petrol-600` 35% over `cream-100`). The view link stays the card's existing `Link`.

**New components in `src/shared/ui`:** none from this change. `ConfirmDialog` comes from add-evaluation-scales.

## 5. Semantic tokens and contrast

Only existing semantic tokens are used. No new primitive or semantic token is proposed by this change.

| Part | Token(s) | Sits on |
|---|---|---|
| Page section | `bg-surface-page` | — |
| Eyebrow | `text-label` (`type-eyebrow-strong`) | surface-page |
| h1 | `text-primary` (`type-heading`) | surface-page |
| Status text, empty and error messages | `text-primary` (`type-body`) | surface-page |
| Toolbar count | `text-secondary` (`type-meta`) | surface-page |
| Checkbox label | `text-label` (`type-label`) | surface-page (select all), surface-card (per card), surface-form (locations) |
| Checkbox / radio box | `border-strong`, checked `surface-checked` + `checked-mark` | same surfaces |
| Links | `text-link`, hover `text-link-hover` | surface-page, surface-card, surface-form |
| Delete buttons | `action-4-bg` / `action-4-text`; hover `action-4-bg-hover` / `action-4-text-hover` | surface-page, surface-card |
| Primary buttons | `action-primary` / `action-primary-text`; hover `action-primary-hover` | surface-page, surface-form |
| Form panel | `bg-surface-form`; border 2px `border-subtle` (decorative, not gated); `rounded-container`; `shadow-lg` | surface-page |
| Field labels, legends | `text-label` (`type-label`) | surface-form |
| Help, loading lines | `text-secondary` (`type-meta`) | surface-form |
| Errors | `feedback-error` (`type-error`) | surface-page, surface-card, surface-form |
| Select box | `bg-surface-input`, `border-strong` (Select's own) | surface-form |
| Card | the card's own: `surface-card`, 4px left `border-accent`, `rounded-container`, `shadow-lg` | surface-page |
| Focus | `focus-visible:focus-ring` | every surface above |
| Sidebar | `nav-surface-dark`, `nav-text-dark`, `nav-hover`, `nav-current-dark` (existing Sidebar) | — (see F2) |

**Contrast of the gated pairs** *(measured, design lead's scripts `contrast-offering-mgmt.mjs`, `contrast-actions.mjs`, `contrast-sidebar*.mjs` in the scratch directory; WCAG 2.2 relative luminance; `color-mix` in sRGB)*:

| Pair | Gate | Traditional | Dark | Registered today |
|---|---|---|---|---|
| text-primary / surface-page | 4.5 | 6.41 | 14.28 | yes |
| text-primary / surface-card | 4.5 | 6.41 | 13.22 | yes |
| text-secondary / surface-page | 4.5 | 6.05 | 8.57 *(add-offering-catalog's measure)* | yes |
| **text-secondary / surface-form** | 4.5 | 6.42 | 7.93 | no |
| text-label / surface-page | 4.5 | 5.97 | 10.28 | yes |
| **text-label / surface-card** | 4.5 | 5.97 | 9.51 | no (also named by add-offering-catalog) |
| **text-label / surface-form** | 4.5 | 6.34 | 9.51 | no |
| **text-link / surface-form** | 4.5 | 6.81 | 13.22 | no |
| **text-link-hover / surface-form** | 4.5 | 12.24 | 14.75 | no |
| feedback-error / surface-page, surface-card | 4.5 | 6.75 / 6.75 | 6.13 / 5.67 | yes |
| feedback-error / surface-form | 4.5 | — | — | yes |
| text-link / surface-card | 4.5 | 6.41 | 13.22 | yes |
| **text-link / surface-page** | 4.5 | 6.41 | 14.28 | no (also named by add-offering-catalog) |
| text-link-hover / surface-card | 4.5 | 11.53 | 14.75 | yes |
| action-primary-text / action-primary, hover | 4.5 | 6.85 / 11.67 | 5.38 / 6.64 | yes |
| action-4-text / action-4-bg | 4.5 | 5.36 | 5.52 | yes |
| border-strong / surface-card | 3 | 11.53 | 4.52 | yes |
| focus-ring / surface-page, surface-card | 3 | 11.53 / 11.53 | 14.28 / 13.22 | yes |
| **action-primary / surface-page, surface-card, surface-form** (button boundary) | 3 | 6.85 / 6.85 / 7.27 | **2.96 / 2.74 / 2.74 FAIL** | no |
| **action-4-bg / surface-page, surface-card** (button boundary) | 3 | **1.46 / 1.46 FAIL** | **1.29 / 1.29 FAIL** | no |

Notes:
- **Every text pair passes its gate in both themes.**
- **Button boundaries.** These failures are not introduced here: they are the merged `Button` (add-evaluation-scales findings F1 and F2, and Finding F3 below for action-1 and action-2). They follow the path add-evaluation-scales recommends: a new change in `base-controls` (Open 15). This change does not register them.

**Guard pairs this change registers, in both matrices:**
- `text-label` / `surface-card`;
- `text-label` / `surface-form`;
- `text-secondary` / `surface-form`;
- `text-link` / `surface-page`;
- `text-link` / `surface-form`;
- `text-link-hover` / `surface-form`.

Whichever of this change and add-offering-catalog lands second drops the pairs already registered. Badge pairs are already registered.

## 6. Layout and spacing (criterion A)

Breakpoints: Tailwind defaults as the project uses them: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

### 6.1 Page layout (decisions log D14, `openspec/specs/landing/spec.md` "Page layout")

Both routes render inside the shell's content column, beside the sidebar from `md` (sidebar 16rem wide, `Sidebar.tsx:66-75`; overlay below `md`).
- **One full-width section** on `surface-page`, vertical padding 3rem below `md` and 4rem from `md`. One section, as the evaluations management area (add-specialist-evaluations summary §9, "one full-width section on `surface-page`") and the MVC's single block (`layouts/evaluations/index.blade.php:2`).
- **Container:** centred, at most 72rem wide, full width below; side padding 1rem below `md` and 2rem from `md`.
- **Section and container:** no border, no radius.
- **Shared classes:** today they are copied in `HomeScreen.tsx:36-43` and `AboutContent.tsx` (Open 4).

### 6.2 My offerings `/{locale}/manage/offerings`

The container holds a flex column. Gaps between its blocks:
- header → status region: 2rem;
- status region → toolbar: 1rem;
- toolbar → grid: 1.5rem;
- grid → pagination: 2rem.

A block that renders nothing adds no gap (an empty status region is not rendered).

**Header block:**
- One flex row, wrapping, space between, aligned to the bottom, gap 1rem. Below `md` it stacks, gap 1rem, left-aligned.
- **Title group:** a flex column, eyebrow and h1 0.5rem apart (MVC `layouts/offerings/index.blade.php:3-6` `gap-0 mb-2`, as add-offering-catalog §6.2).
- **"New offering" link:** no box, no padding, no border, no radius.

**Status region:** a text line. No box, padding, border or radius.

**Selection toolbar** (rendered only in the success state):
- a flex row, wrapping, centre-aligned, gap 1rem;
- no padding, no border, no radius, no background (it sits on `surface-page`);
- order: select-all checkbox, selected count, bulk delete button;
- from `md`, the bulk delete button is pushed to the end of the row; below `md` it wraps under the other two, left-aligned.

**Grid:**
- gap 1.5rem (as `OFFERING_GRID_CLASSES`); cards of a row share their height;
- 1 column below `lg`, 2 from `lg`, 3 from `2xl` (Open 13). Landing's 2-from-`md` grid would leave cards about 212px wide at 768px beside the 16rem sidebar *(computed: 768 − 256 − 64 − 24 = 424, ÷ 2)*.

**Card:** `OfferingCard`'s own regions, unchanged:
- padding 1.5rem per region;
- 4px `border-accent` on the left;
- `rounded-container` (16px traditional, 0 dark);
- `shadow-lg`.

**Card action slot** (Open 2), inside the existing footer row (`flex-wrap`, centre-aligned, gap 1rem):
- the slot is a flex row, centre-aligned, gap 0.5rem (MVC `[data-flux-card-actions]` `gap-2`, `app.css:835-837`), at the end of the footer after the View link, wrapping onto its own line when narrow;
- it holds the select checkbox and the Delete button;
- no padding, border or radius of its own.

**Pagination:** as landing: centred, buttons 1rem apart, wrapping.

**Empty state:**
- a centred column, 1rem apart: the message, then the "Create an offering" link;
- no box.

**Error state:**
- a centred column, 1rem apart: the message, then Retry;
- no box (the `OfferingList` error pattern, `OfferingList.tsx:48`).

**Loading:**
- three `OfferingSkeletonCard`s in the grid;
- the header renders; the toolbar does not.

**Dialog:** add-evaluation-scales §5 owns every value:
- panel up to 32rem, padding 1.5rem, `rounded-container`;
- description 0.5rem below the title, error 0.75rem below the description;
- actions 1.5rem below, 0.75rem apart.

### 6.3 New offering `/{locale}/manage/offerings/new`

The container holds a flex column:
- back link → header block: 1.5rem (as add-offering-catalog §6.3);
- header block → form panel: 2rem.

**Header block:** eyebrow and h1, 0.5rem apart. No box.

**Form panel** (`<form>`, MVC `tz-form-main`, `app.css:487-491`, translated):
- width 100% below `md`; from `md`, at most 40rem, left-aligned (Open 14);
- background `surface-form`;
- border 2px `border-subtle`, decorative;
- `rounded-container`;
- `shadow-lg` (the MVC's `shadow-xl` maps to the project's single card shadow);
- padding 1rem with 1.25rem at the bottom below `md` (MVC `p-4 pb-5`), 1.5rem from `md`.
- Children: a flex column, 1.5rem apart, in this order:
  1. **Narrowing group** (roaster and coffee):
     - a grid, 1 column below `md` and 2 from `md`, gap 1rem;
     - each is a `Field` with its own spacing: label 0.5rem above the control, help 0.25rem below (`Field.tsx:57,68`).
  2. **Inventory item** (`RadioGroup`):
     - the group's own spacing: legend 0.5rem above, messages 0.25rem below;
     - each option label reads "{coffee.name} · {roastery.name} · {roastLot} · {productionDate}" and wraps when long;
     - loading, empty and error lines take the options' place. Error: `type-error` line and Retry, a flex row, wrapping, gap 0.5rem.
  3. **Locations** (fieldset):
     - legend `type-label`, 0.5rem above the options, with the required asterisk;
     - checkboxes in a column, 0.5rem apart;
     - error message 0.25rem below;
     - no fieldset border, padding or radius (the native ones reset);
     - loading, empty and error as for the inventory item.
  4. **Form error** (`role="alert"`): a text line, no box; rendered only with content.
  5. **Success status** (`role="status"`, Open 9): a flex column, 0.5rem apart: the message, then the "View my offerings" link; no box.
  6. **Actions:** a flex row, wrapping, centre-aligned, gap 0.75rem (the dialog's button gap, scales §5): Submit first, then the Cancel link. From `sm`, the row is aligned to the end.

### 6.4 Sidebar entries (Open 1)

The existing `Sidebar` parts and values, unchanged:
- column 16rem wide, `nav-surface-dark`;
- content padding 0.5rem;
- menu items 0.25rem apart;
- each entry: padding 0.75rem horizontal and 0.5rem vertical, icon-to-label gap 0.5rem, `rounded-field`.

Two entries, in this order: "My offerings", then "New offering". The current entry takes `nav-current-dark` and `aria-current="page"`. Hover and focus colours: see F2.

### 6.5 At 375px

*(computed)*
- The container is 343px wide.
- The form panel's content is 311px wide; the narrowing selects stack.
- Toolbar, card footer, actions and pagination wrap.
- The dialog panel is 343px wide (scales §5).
- No horizontal scroll: option labels, names and API values wrap (`break-words` on the long API strings).

### 6.6 Visual reference (mock-ups, ASCII: there is no MVC screen to capture)

My offerings, 1280px, sidebar open:
```
┌ header ── Logo  Top rated  About us ───────────────── ES ▾  (EB) ▾ ┐
├ sidebar 16rem ┬ surface-page  py-16 ────────────────────────────────┤
│ ▣ My offerings│  MANAGEMENT                                          │
│ ＋ New offering│  My offerings                        New offering   │
│               │  Offerings deleted: 2           (status, polite)     │
│               │  ☐ Select all on this page  Selected: 1   [🗑 Delete selected]
│               │  ┃ 84.25 /100 [84.25]   ┃ [Provisional]               │
│               │  ┃ [✓ Verified]          ┃ Sidama Bensa               │
│               │  ┃ Huila El Mirador      ┃ Cafetería: Tazavera Born   │
│               │  ┃ …                     ┃ …                          │
│               │  ┃ Evaluaciones: 5  View  ☑ Select [🗑 Delete]         │
│               │            [Previous] [Next]                          │
└───────────────┴───────────────────────────────────────────────────────┘
```
New offering, 375px (sidebar as overlay, closed):
```
│ surface-page  py-12  px-4                 │
│ ← Back to my offerings                    │
│ MANAGEMENT                                │
│ New offering                              │
│ ╭ form panel (surface-form) ───────────╮  │
│ │ Roaster        [All roasters     ▾]  │  │
│ │ Coffee         [All coffees      ▾]  │  │
│ │ Inventory item *                     │  │
│ │ ◉ Huila El Mirador · Nómada Roasters │  │
│ │   · L-2026-014 · 2026-09-19          │  │
│ │ ○ Sidama Bensa · Nómada Roasters …   │  │
│ │ Locations *                          │  │
│ │ ☑ Tazavera Gràcia                    │  │
│ │ ☐ Tazavera Born                      │  │
│ │ [Create offerings]  Cancel           │  │
│ ╰──────────────────────────────────────╯  │
```
An MVC capture is not possible (no such screen). The verification task captures both routes at 375px and 1280px.

## 7. Behaviour

**Session and role gate** (Open 5):
- **`loading`:** the list shows its skeleton; the form shows its header and the disabled selects.
- **`anonymous`:** recommended: start sign-in with the current route.
- **`authenticated`, role ≠ `coffeeshop`:** recommended: the 404 page.

**Own list:**
- it fetches `GET /offerings?coffeeshopUlid={session.user.ulid}` plus `page` from the URL;
- `page` lives in the URL query (`?page=n`), as on landing.

**Selection:**
- a set of offering ulids for the current page;
- cleared on a page change and after a successful delete (Open 17).

**Single delete:**
1. Delete → dialog: "Delete this offering?" / "{coffee} at {location} will be deleted. This cannot be undone."
2. Confirm → `deleteAnOffering`.
3. On 200: the dialog closes, the status region announces, the page refetches, and focus moves to the h1 (Open 18).

**Bulk delete:**
1. "Delete selected" → dialog: "Delete {n} offerings?" / "The selected offerings will be deleted. This cannot be undone."
2. Confirm → `deleteMultipleOfferings` with the selected ulids.
3. On 200: as for the single delete.

The dialog texts follow the contract's "This action cannot be undone."

**Create:**
- **Narrowing:**
  - choosing a coffee refetches the inventory with `coffeeName={coffee.name}`;
  - choosing a roaster filters the fetched items by `roastery.ulid` on the front, because `listCoffeeInventory` has no roastery parameter (Open 8);
  - a selected item that the new narrowing excludes is cleared.
- **Local validation on submit** (no disabled submit, except when the user has no locations):
  - no inventory item → "Choose an inventory item.";
  - no location → "Choose at least one location.".

  These are shown in the group's error slot, with the group marked invalid. Not by colour alone: the text is always shown.
- **On 201:** the success status (Open 9), "Offerings created: {n}", where n = `data.length`.

**Write scope** (Open 6):
- deletes need `profile:write` (contract and API);
- `createOfferings` needs it per the contract (but see F1, M1).

## 8. Texts (message catalog, es / en / ca, passed as props)

New area `offering-management` (`messages/{locale}/offering-management.json`). The card texts (captions, counts, View, status labels) and the pagination labels come from the existing `landing` keys, as add-offering-catalog Open 3. Spanish follows the MVC wording where it exists ("Eliminar", "Cafetería", "Tostador"). The rest, and every English and Catalan string, are proposals (Open 20).

| Key | es | en | ca |
|---|---|---|---|
| `sidebarMyOfferings` | Mis ofertas | My offerings | Les meves ofertes |
| `sidebarNewOffering` | Nueva oferta | New offering | Nova oferta |
| `eyebrow` | Gestión | Management | Gestió |
| `listHeading` | Mis ofertas | My offerings | Les meves ofertes |
| `newOfferingLink` | Nueva oferta | New offering | Nova oferta |
| `listEmptyMessage` | Aún no tienes ofertas. | You have no offerings yet. | Encara no tens ofertes. |
| `listEmptyCreateLink` | Crear una oferta | Create an offering | Crear una oferta |
| `listErrorMessage` | No se pudieron cargar tus ofertas. | Your offerings could not be loaded. | No s'han pogut carregar les teves ofertes. |
| `retryLabel` | Reintentar | Retry | Tornar-ho a provar |
| `selectAllLabel` | Seleccionar todas las de esta página | Select all on this page | Selecciona totes les d'aquesta pàgina |
| `selectedCount` | Seleccionadas: | Selected: | Seleccionades: |
| `selectLabel` | Seleccionar | Select | Selecciona |
| `deleteLabel` | Eliminar | Delete | Elimina |
| `deleteSelectedLabel` | Eliminar seleccionadas | Delete selected | Elimina les seleccionades |
| `deleteOneTitle` | ¿Eliminar esta oferta? | Delete this offering? | Vols eliminar aquesta oferta? |
| `deleteOneDescription` | Se eliminará la oferta. Esta acción no se puede deshacer. | The offering will be deleted. This cannot be undone. | S'eliminarà l'oferta. Aquesta acció no es pot desfer. |
| `deleteManyTitle` | ¿Eliminar las ofertas seleccionadas? | Delete the selected offerings? | Vols eliminar les ofertes seleccionades? |
| `deleteManyDescription` | Se eliminarán las ofertas seleccionadas. Esta acción no se puede deshacer. | The selected offerings will be deleted. This cannot be undone. | S'eliminaran les ofertes seleccionades. Aquesta acció no es pot desfer. |
| `deleteConfirmLabel` | Eliminar | Delete | Elimina |
| `cancelLabel` | Cancelar | Cancel | Cancel·la |
| `deleteError` | No se pudo eliminar. Inténtalo de nuevo. | It could not be deleted. Try again. | No s'ha pogut eliminar. Torna-ho a provar. |
| `deletedStatus` | Ofertas eliminadas: | Offerings deleted: | Ofertes eliminades: |
| `stepUpMessage` | Para continuar, confirma tu identidad. | To continue, confirm your identity. | Per continuar, confirma la teva identitat. |
| `stepUpLabel` | Confirmar identidad | Confirm your identity | Confirma la identitat |
| `newHeading` | Nueva oferta | New offering | Nova oferta |
| `backLabel` | Volver a mis ofertas | Back to my offerings | Torna a les meves ofertes |
| `roasterLabel` | Tostador | Roaster | Torrador |
| `roasterAll` | Todos los tostadores | All roasters | Tots els torradors |
| `coffeeLabel` | Café | Coffee | Cafè |
| `coffeeAll` | Todos los cafés | All coffees | Tots els cafès |
| `listLoadError` | No se pudo cargar la lista. | The list could not be loaded. | No s'ha pogut carregar la llista. |
| `inventoryLegend` | Café del inventario | Inventory item | Cafè de l'inventari |
| `inventoryLoading` | Cargando el inventario… | Loading the inventory… | Carregant l'inventari… |
| `inventoryEmpty` | No hay cafés del inventario que coincidan. | No inventory items match. | No hi ha cafès de l'inventari que coincideixin. |
| `inventoryError` | No se pudo cargar el inventario. | The inventory could not be loaded. | No s'ha pogut carregar l'inventari. |
| `inventoryRequired` | Elige un café del inventario. | Choose an inventory item. | Tria un cafè de l'inventari. |
| `locationsLegend` | Locales | Locations | Locals |
| `locationsLoading` | Cargando tus locales… | Loading your locations… | Carregant els teus locals… |
| `locationsEmpty` | No tienes locales registrados. | You have no locations registered. | No tens locals registrats. |
| `locationsError` | No se pudieron cargar tus locales. | Your locations could not be loaded. | No s'han pogut carregar els teus locals. |
| `locationsRequired` | Elige al menos un local. | Choose at least one location. | Tria almenys un local. |
| `submitLabel` | Crear ofertas | Create offerings | Crea les ofertes |
| `createError` | No se pudieron crear las ofertas. Revisa los datos e inténtalo de nuevo. | The offerings could not be created. Check the data and try again. | No s'han pogut crear les ofertes. Revisa les dades i torna-ho a provar. |
| `createdStatus` | Ofertas creadas: | Offerings created: | Ofertes creades: |
| `viewMyOfferings` | Ver mis ofertas | View my offerings | Mostra les meves ofertes |

Numbers and names are appended to the catalog word by concatenation, as `OfferingCard` composes its captions. This needs no plural rules.

## 9. Accessibility

- **Headings:** one `h1` per screen; the cards keep their `h3`.
- **Names:**
  - every per-card control has a unique accessible name that starts with its visible text (section 4);
  - the toolbar controls have visible labels;
  - the sidebar entries are links with visible text.
- **Selection:**
  - native checkboxes with their check mark (`form-fields` "Checkbox");
  - the count is plain text inside the toolbar;
  - the result of an action is announced by the status region.
- **Errors:**
  - always text: `type-error`, bound to its group (`aria-describedby`, `aria-invalid`), or `role="alert"` for the form error;
  - never colour alone.
- **Dialog:** add-evaluation-scales §5: `alertdialog`, initial focus on Cancel, Escape cancels, the overlay does not close it, focus returns to the trigger.
  - After a successful delete the trigger may no longer exist, so focus moves to the `h1` (Open 18).
- **Disabled:** bulk delete at 0 selected and submit with no locations use the native `disabled` (50% opacity, `Button`).
- **Busy:** confirm and submit use `Button`'s `loading` (`aria-busy`, label kept).
- **Focus:** every control is an existing one with `focus-visible:focus-ring`, except the sidebar entries (see F2).

## 10. Dependencies

**Capability layer:** `theming` → `base-controls` (`Button`, `Link`) → `form-fields` (`Field`, `Select`, `Checkbox`, `RadioGroup`), `feedback` (`Badge`, `ConfirmDialog` from scales), `content-structure` (`Card`) → `app-shell` (sidebar region and entries mechanism) → `offering-management`.

**Changes:**
- **add-auth (Apply):** `request`, `publicRequest`, `useSession`, `signIn`, `requestProfileWrite`; `SessionShell` is where sidebar entries would be wired (Open 1). This change starts after add-auth merges. The decisions-log entry Q-merge does not name this change.
- **add-evaluation-scales (Summary — draft):** owns `ConfirmDialog`. Its §1 consumer list names add-specialist-evaluations and add-user-account but not this change (F4).
- **add-offering-catalog (Summary — draft):** the offering-list widget generalization (its Open 1 → here Open 3) and the section primitive (its Open 2 → here Open 4) apply here too. It also registers two of the same guard pairs.
- **add-specialist-evaluations (Summary — in review):**
  - proposes an `OfferingCard` action slot that replaces the `session` prop (its summary line 123). This change uses the same slot (Open 2);
  - its Open 8 (status region after writes), Open 9 (access by role) and Open 10 (sidebar entries) are the same questions as Open 9, Open 5 and Open 1 here. One answer should serve both.
- **add-filter-controls (Summary — draft):** also consumes `listCoffees` and `listRoasteries` (decisions log 2026-10-06). The fetchers should live once, in `src/entities` (Open 16).
- **add-user-account (draft):** its open 9.3 (step-up timing) and 9.7 (403) are the same mechanism as Open 6 here.

**Backlog:** R1–R4 do not name this change. The candidate "shared section primitive" (general context, "Al retomar" 8) is pending Product owner and affects this change (Open 4).

**Decisions log:**
- D14 (2026-10-06): applied in §6.1;
- "cobertura del contrato" (2026-10-06): applied, `listCoffees` and `listRoasteries` are consumed here.

**Contract coverage:** this change consumes the six operations the board assigns to it, plus `listCoffees` and `listRoasteries`. The board's *(supuesto)* marks for `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations` and `listCoffeeInventory` are confirmed by this draft.

## 11. Tests (expected coverage)

- **Own-list fetch (pure function):**
  - builds `GET /offerings?coffeeshopUlid={ulid}&page={n}`;
  - maps non-2xx and transport failures to error and `data: []` to empty.
- **List presentation:**
  - success with cards, toolbar and pagination;
  - empty with the create link;
  - error with Retry calling the refetch;
  - loading with three skeletons and no toolbar.
- **Selection:**
  - toggling one card;
  - select all on the page;
  - select all on a partial selection selects all;
  - the count text;
  - bulk delete disabled at 0;
  - selection cleared on a page change and after a delete.
- **Single delete:**
  - nothing is sent before confirmation;
  - confirm sends `DELETE /offerings/{ulid}` through `request`;
  - pending state;
  - on 200: dialog closed, status text, refetch, focus on the h1;
  - on failure: the dialog stays open with `deleteError`;
  - on 403: the step-up action (per Open 6's answer).
- **Bulk delete:** same, with body `{ "offerings": [...] }`; and the empty-last-page step back.
- **Create form:**
  - roaster and coffee options from the server props;
  - choosing a coffee refetches with `coffeeName`;
  - choosing a roaster filters by `roastery.ulid`;
  - an excluded selection is cleared;
  - local validation messages, bound and `aria-invalid`;
  - submit sends `{ coffeeInventoryId, locations }` through `request`;
  - 201 shows the created count;
  - failure keeps values and shows `createError`;
  - no locations disables submit;
  - loading, empty and error of locations and inventory.
- **Access:** loading, anonymous and non-coffeeshop branches (per Open 5).
- **Sidebar entries:** both links, `aria-current` on the current one (per Open 1).
- **Catalog guard:** the `offering-management` area is present in es, en and ca with the same keys.
- **Contrast guard:** the pairs listed in §5, in both matrices.
- **Layout classes:** the exact classes the build chooses for every §6 value (jsdom has no CSS engine).
- **Verification task:** captures of `/es/manage/offerings` (with items, empty, dialog open) and `/es/manage/offerings/new`, at 375px and 1280px, in both themes, with a coffeeshop session and the local read mock. The local database has no offerings.

## 12. Findings on existing code and the contract

- **F1: contract and API mismatches** (report to Product owner; the front follows the contract, `AGENTS.md`):
  - M1: the contract requires `profile:write` for `createOfferings`. The API route applies only the group's read-or-write check (`tazavera-api/routes/api.php:26,38-39`), so a read token can create.
  - M2: the contract does not mark `locations` as required. The API requires a non-empty, distinct array (`StoreOfferingRequest.php:30-31`).
  - M3: no `422` is documented for `createOfferings`, `deleteAnOffering` or `deleteMultipleOfferings`, although the FormRequests validate (`StoreOfferingRequest`, `MassDeleteOfferingRequest`).
  - M4: no `403` is documented for the three writes, although `OwnsOffering` aborts with 403 (`OwnsOffering.php:34-36`) and the role and scope middleware reject. The scope failure's status and body are *(unverified)*.
  - M5: `deleteMultipleOfferings`' 50-item maximum is only in the description, not in the schema (`maxItems`).

  Path: none of these is front code. They are contract questions for Product owner (Open 6 and Open 7 depend on M3 and M4).
- **F2: sidebar entry contrast in the traditional theme** (merged `app-shell`, `Sidebar.tsx:265-277`). *(measured)*
  - The hover text `nav-text-dark` on `nav-hover` is 2.49 (gate 4.5; dark 10.11).
  - The focus ring (`focus-ring`, petrol-900) on `nav-surface-dark` is 1.80, and on `nav-current-dark` 2.35 (gate 3; dark 12.27 and 10.50).
  - Existing tokens pass everywhere, so no new token is needed:
    - hover text `nav-text-hover` on `nav-hover`: 4.63 / 4.68, already registered;
    - the inverse focus ring, by giving the sidebar the `variant-inverse` scope (`globals.css:698-705`): `focus-ring-inverse` against its offset and against `nav-surface-dark` is 6.41 / 12.27, already registered. The ring's neighbours are the offset band and the sidebar surface, not the entry fill.
  - No route renders entries yet, so no user has seen it.
  - Path (workflow §4): defect in merged code → **new change** in `app-shell`, best folded into the change that adds link entries (Open 1).
- **F3: tinted action-button boundaries fail too** *(measured)*. Against surface-page, card and section:
  - `action-1-bg`: 1.09–1.22 traditional, 1.16–1.39 dark;
  - `action-2-bg`: 1.76–1.97 traditional, 1.13–1.35 dark.

  This extends add-evaluation-scales F2 (action-3 and action-4) to all four tinted treatments. Path: **new change** in `base-controls`, as scales recommends (Open 15).
- **F4: add-evaluation-scales' consumer list** (its summary §1) omits this change, which needs `ConfirmDialog` with `pending` and `error`. Semantic: the orchestrator adds this change to that list at its next review. This draft does not edit another change's folder.
- **F5: `SidebarMenuButton` renders only a `<button>`** (`Sidebar.tsx:279-300`). Management entries are navigation and need a link. Part of Open 1.

## Open

1. **How a management area supplies its sidebar entries, and link entries.**
   - Context: `AppShell` and add-auth's `SessionShell` mount `AppSidebar` without `entries`; no route can pass them today. `SidebarMenuButton` is a button only (F5).
   - Options:
     - (a) The shell chooses the entries by the session's role (coffeeshop → this feature's entries component, specialist → evaluations'), and `SidebarMenuButton` gains a link form (`asChild`, as the shadcn original). One `app-shell` change, after add-auth, that also fixes F2.
     - (b) Each management layout (`app/[locale]/manage/offerings/layout.tsx`) fills the shell's region through a context or a slot.
     - (c) No entries (the spec allows an empty region).
   - Recommendation: (a). The role already decides the user-menu entry (`UserMenu.tsx:115-120`), so the same rule picks the area; it needs no new routing mechanism. It is shared with add-specialist-evaluations Open 10. Source: `app-shell` spec "Management sidebar"; criterion C.
   - **Answered 2026-10-06 (Product owner): (b).** Each management area fills the sidebar through the same `@sidebar` parallel-route slot that `add-filter-controls` adds (its Open 4b): `/manage/offerings` supplies its entries, `/manage/evaluations` its own. `SidebarMenuButton` gains a link form (`asChild`), which fixes F5. One mechanism for facets and management entries.
   - Blocks propose: no (waits for `add-filter-controls`' slot to be merged).
2. **`OfferingCard` action slot.**
   - Options:
     - (a) The slot add-specialist-evaluations proposes (its summary line 123): a consumer-supplied node in the footer, replacing the `session` prop. This change passes the select checkbox and the Delete button.
     - (b) A separate management row component (a second offering presentation: duplication).
   - Recommendation: (a), done once, as a refactor change in the owning capability (`landing`, the entity's owner) before both feature changes. That follows the backlog rule; it should be added to `docs/backlog.md`. Source: criterion C; `OfferingCard.tsx:138-155`.
   - **Answered 2026-10-06 (Product owner): (a).** A refactor change in `landing` adds the consumer-supplied action slot to `OfferingCard` and removes the `session` prop, before this change and add-specialist-evaluations.
   - Blocks propose: no (waits for the refactor to be merged).
3. **Generalizing the offering-list widget** (add-offering-catalog Open 1): `OfferingPagination` pushes `/{locale}?page=n` (`OfferingPagination.tsx`), and the taxonomy resolution lives in the widget.
   - Options:
     - (a) The same refactor catalog recommends, before both changes: a base path for pagination, and the taxonomy resolution moved down to an entity.
     - (b) A local pagination for this change (duplication).
   - Recommendation: (a). One answer for both changes.
   - **Answered 2026-10-06 (Product owner): covered.** `extract-offering-list-parts` already moved the pagination to `Pagination` (`@/shared/ui`, `path` + `query`) and the taxonomy read and lookup to `src/entities/taxonomy`; this change uses them. The offerings fetch with a query is generalized by `add-offering-catalog` (its Open 1).
   - Blocks propose: no.
4. **Shared section and container primitive** (add-offering-catalog Open 2). These two screens would be the fifth and sixth copies.
   - Options:
     - (a) The backlog entry and the refactor first.
     - (b) Copy again.
   - Recommendation: (a).
   - **Answered 2026-10-06 (Product owner): (a).** Refactor first; this change uses the shared primitive.
   - Blocks propose: no (waits for the refactor to be merged).
5. **Access to `/manage/offerings*` by an anonymous user or a non-coffeeshop.** The API answers 403 for the role; the front has no rule yet.
   - Options:
     - (a) `loading` → skeleton; `anonymous` → `signIn(currentRoute)`; another role → the 404 page.
     - (b) A message with a link home for both.
   - Recommendation: (a), the same answer as add-specialist-evaluations Open 9. It touches the auth flow, so it is Product owner's.
   - **Answered 2026-10-06 (Product owner): neither as written.** `loading` → skeleton; `anonymous` → a message with a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route), no automatic redirect; another role → the 404 page. Same rule as add-user-account Open 5 and `/manage/evaluations*`.
   - Blocks propose: no.
6. **Write scope (`profile:write`) and the step-up.** Sign-in grants only `profile:read` (add-auth summary, "Sign in"), so the first delete of a session fails. `requestProfileWrite` returns `void` and the session does not expose the scope.
   - Options:
     - (a) Reactive: on a 403 from a write, show `stepUpMessage` with a "Confirm your identity" button that calls `requestProfileWrite(currentRoute)` inside the click. In the popup mode the dialog or form keeps its state, and the user confirms again. No add-auth change.
     - (b) Proactive: add-auth exposes whether a write grant is held, and the write action starts the step-up first. This changes add-auth, so it is a security point.
     - (c) Step-up on entering the management area (a forced login on every visit).
   - Recommendation: (a). It needs no auth change and handles M1 either way. Risk: a 403 for ownership or role also shows the step-up prompt, because the contract documents no body to tell them apart (M4). Align with add-user-account 9.3 and 9.7.
   - **Answered 2026-10-06 (Product owner): (a).** Reactive step-up after a `403`, as in add-user-account Open 2.
   - Blocks propose: no.
7. **422 handling.** No 422 body is documented for the three writes (M3).
   - Options:
     - (a) Any 422 shows the generic form or dialog error. Local validation prevents the known cases (no item, no location).
     - (b) Map `errors` to fields: this needs the contract updated first (Product owner's).
   - Recommendation: (a). It invents no error format (`AGENTS.md`).
   - **Answered 2026-10-06 (Product owner): (a).** Generic error; field mapping in `docs/backlog.md` R8.
   - Blocks propose: no.
8. **Roaster narrowing.** `listCoffeeInventory` has no roastery parameter (contract lines 49-115; `FilterCoffeeInventoryRequest.php:26-31`).
   - Options:
     - (a) Roaster select filters the fetched items by `roastery.ulid` on the front; coffee select uses the `coffeeName` parameter.
     - (b) Roaster select only, shown as labels; coffee via `coffeeName`.
     - (c) Ask the API for a `roasteryUlid` parameter (a contract change).
   - Recommendation: (a). It uses only documented fields and keeps both settled consumptions. Note: `coffeeName` is a name filter, so similar names may also match *(matching mode unverified)*.
   - **Answered 2026-10-06 (Product owner): none of these.** The Roaster and Coffee selects and the inventory-item radio group are replaced by one search-as-you-type combobox over `GET /coffeeInventory?coffeeName=` (client, `request`), the reusable combobox built by `add-filter-controls` (its Open 16). Choosing a row chooses the inventory item (`coffeeInventoryId` for `POST /offerings`). Row: coffee name, then `roastery · country · process`. This change no longer consumes `listCoffees` or `listRoasteries`; `add-filter-controls` still does. §2, §4, §6 and the states table describe the old selects and must be redrafted.
   - Blocks propose: yes, until those sections are redrafted.
9. **After a successful create.**
   - Options:
     - (a) Stay on the form: the success status with the count and the "View my offerings" link; reset the selection.
     - (b) Navigate to the list with a notice. That needs a cross-route message mechanism.
   - Recommendation: (a), consistent with add-specialist-evaluations Open 8 (status region, no toast).
   - Blocks propose: no.
10. **Single location.**
    - Options:
      - (a) Preselect it when the user has exactly one.
      - (b) Never preselect.
    - Recommendation: (a). It saves a step and still shows the choice.
    - Blocks propose: no.
11. **Create route name.**
    - Options:
      - (a) `/{locale}/manage/offerings/new`, matching `/manage/evaluations/new`.
      - (b) A create panel inside the list page.
    - Recommendation: (a).
    - Blocks propose: no.
12. **Taste badges on management cards.**
    - Options:
      - (a) Resolve them as landing does (one more public call, server).
      - (b) Pass none (an empty list renders no badge rows).
    - Recommendation: (a), so the coffeeshop sees what the public sees, once Open 3 moves the resolution down.
    - Blocks propose: no.
13. **Grid columns beside the sidebar.**
    - Options:
      - (a) 1 / 2 from `lg` / 3 from `2xl`.
      - (b) Reuse `OFFERING_GRID_CLASSES` (2 from `md`, 3 from `xl`), with cards about 212px wide at 768px and 304px at 1280px *(computed)* while the sidebar is open.
    - Recommendation: (a). It is a second grid constant, kept beside the first in the widget.
    - Blocks propose: no.
14. **Form panel width.**
    - Options:
      - (a) At most 40rem from `md`, left-aligned.
      - (b) Full container width.
    - Recommendation: (a), for readable option labels. The MVC sets no width.
    - Blocks propose: no.
15. **Button boundaries** (scales F1 and F2, F3 here).
    - Options:
      - (a) Ship on `Button` as it is and fix all treatments in one `base-controls` change.
      - (b) Add borders in this change.
    - Recommendation: (a), as scales Open 6.
    - Blocks propose: no.
16. **Where the `listCoffees` and `listRoasteries` fetchers live.**
    - Options:
      - (a) `src/entities/coffee` and `src/entities/roastery`, built by whichever of this change and add-filter-controls goes first, and reused by the other.
      - (b) Each change its own copy.
    - Recommendation: (a). Product owner or the orchestrator orders the two changes.
    - Blocks propose: no.
17. **Selection scope.**
    - Options:
      - (a) Current page only, cleared on a page change.
      - (b) Kept across pages, up to 50.
    - Recommendation: (a). It is simpler, keeps the 50 limit by construction, and matches what the user sees.
    - Blocks propose: no.
18. **Focus after a successful delete.**
    - Options:
      - (a) Move it to the `h1` (`tabIndex={-1}`).
      - (b) Leave it to the dialog's focus return, which falls to the document when the trigger is gone.
    - Recommendation: (a).
    - Blocks propose: no.
19. **Checkbox group for the locations.** `form-fields` has a radio group with a fieldset contract, but no checkbox group.
    - Options:
      - (a) Compose the fieldset in this feature.
      - (b) Add a `CheckboxGroup` to `form-fields` first, if add-specialist-evaluations or add-filter-controls also needs one.
    - Recommendation: (a) now, and report it to the backlog if a second copy appears.
    - Blocks propose: no.
20. **Texts.** The keys and strings in §8 are proposals. Product owner confirms or edits them.
    - Blocks propose: no.

## Review log

- 2026-10-06, design lead, generation mode.
  - **Settled from sources:**
    - the list route (`UserMenu.tsx:117`) and the management route pattern (`AppSidebar.tsx:25`);
    - the fetching rule (CLAUDE.md §2);
    - the add-auth interface (`feature/add-auth`);
    - `ConfirmDialog` from add-evaluation-scales §5;
    - D14 layout (decisions log), with one section per page as the evaluations management area;
    - the delete treatment `action-4` from the MVC's delete colour (`app.css:873-882`);
    - the card-action gap and the form panel from the MVC (`app.css:487-491, 835-837`);
    - the dialog texts from the contract's "cannot be undone";
    - reuse of `OfferingCard`, `OfferingSkeletonCard`, `OfferingPagination`, `Checkbox`, `RadioGroup`, `Field`, `Select`, `Button`, `Link` and Sidebar parts.
  - **Closed with a verified constraint (criterion B), for the orchestrator's "Closed for review":** the own-offerings list runs on the client through `publicRequest`, because its filter value (the user's ulid) exists only in the browser session. No visible change, no security or API change.
  - **Measured:** every gated pair in §5, including those on `surface-form`, and the sidebar pairs in F2, in both themes (scripts in the design lead's scratch directory).
  - **Board assumptions:** confirmed for the five operations marked *(supuesto)*.

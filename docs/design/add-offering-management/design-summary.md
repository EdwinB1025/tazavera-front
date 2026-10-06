Status: approved — by the orchestrator on 2026-10-06, on Product owner's instruction to approve every summary with no decision pending from him (non-blocking Open points accepted with their recommendations)

# Design summary — add-offering-management

Capability: `offering-management`. Change-id: `add-offering-management`. Branch (when created): `feature/add-offering-management`.

Drafted by the design lead on 2026-10-06 (generation mode) and redrafted the same day to Product owner's answers (see "Review log"). Sources:
- `contracts/openapi.yaml` on `develop` (re-checked 2026-10-06 after today's update: the operations used here are unchanged);
- the main specs in `openspec/specs/` and the code on `develop` (which now holds `add-auth`, `extract-offering-list-parts`, `extract-page-section`, `fix-button-boundaries`, `refactor-badge-geometry`);
- the approved summaries of `add-filter-controls` (combobox, `@sidebar` slot), `replace-offering-card-session` (`actions` slot) and `add-offering-catalog`; the `add-evaluation-scales` summary and its propose (`ConfirmDialog`);
- the decisions log of `docs/general-context.md`;
- the MVC.

Numbers marked *(measured)* come from a script the design lead executed; *(computed)* are the design lead's arithmetic; *(unverified)* was not checked.

**The MVC has no coffeeshop management screen.** `routes/web.php:11` exposes only `offerings.index` and `offerings.show`. The visual language below is translated from the closest MVC patterns, each cited:
- the management list: `layouts/evaluations/index.blade.php`, `partials/evaluation-list.blade.php`;
- card actions and their colours: `partials/evaluation-card.blade.php:62-83`, `resources/css/app.css:835-882`;
- the form panel: `resources/css/app.css:487-491` (`tz-form-main`);
- the confirmation: `livewire/settings/delete-user-form.blade.php`, as mapped by add-evaluation-scales §5.

## 1. Scope

A coffeeshop manages its own offerings in the management area:

1. **My offerings** at `/{locale}/manage/offerings`: the coffeeshop's own offerings as cards, with pagination, selection, deleting one, and deleting several.
2. **New offering** at `/{locale}/manage/offerings/new`: create one offering per chosen location from one coffee-inventory item, chosen in a search-as-you-type combobox over `GET /coffeeInventory?coffeeName=` (Open 8).
3. **Sidebar entries** this area puts in the shell sidebar through the `@sidebar` parallel-route slot of `add-filter-controls`: "My offerings" and "New offering" (Open 1).

Already settled elsewhere:
- **The list route.** The user menu's "Manage offerings" entry points at `/{locale}/manage/offerings` for role `coffeeshop` (`UserMenu.tsx:116-117`; `app-shell` spec, "Management entry for a coffeeshop").
- **Management routes.** `/[locale]/manage/*` is the pattern the sidebar shows on (`AppSidebar.tsx:25`).
- **The sidebar mechanism.** The `@sidebar` slot under `app/[locale]/` and the link form of `SidebarMenuButton` (`asChild`) are built by `add-filter-controls` (its Open 4b; decisions log "entradas del sidebar de gestión").
- **The combobox.** Generic, in `src/shared/ui` with its search hook, built by `add-filter-controls` (its Open 16; decisions log "add-filter-controls: resto de puntos"). The consumer passes the search function and the row content.
- **The card action slot.** `OfferingCard`'s `actions` prop, built by `replace-offering-card-session` (its §4).
- **The confirmation dialog.** `ConfirmDialog` from `add-evaluation-scales` (§5; base settled at its propose: shadcn AlertDialog, design.md D8).
- **Pagination and taxonomies.** `Pagination` from `@/shared/ui` (`path`, `query`, `currentPage`, `lastPage`, texts) and `fetchTaxonomies` / `buildTaxonomyLookup` from `src/entities/taxonomy` (`extract-offering-list-parts`, merged).
- **Page section.** `PageSection` from `@/shared/ui` (`extract-page-section`, merged).

Out of scope:
- editing an offering (the contract has no update operation);
- managing locations or inventory (read-only here);
- filter controls on the own-offerings list (`add-filter-controls` owns the offering filters);
- the public catalog and the detail page (`add-offering-catalog`);
- the step-up mechanism itself (`add-auth`);
- `listCoffees` and `listRoasteries`: no longer consumed here (Open 8 answer); `add-filter-controls` still consumes them.

## 2. Contract operations consumed

| operationId | Route | Security (contract) | Used by | Fetched |
|---|---|---|---|---|
| `listOfferings` | `GET /offerings?coffeeshopUlid={user.ulid}&page=n` | public | My offerings | Client, `publicRequest` (see note) |
| `deleteAnOffering` | `DELETE /offerings/{offering_ulid}` | coffeeshop role, `profile:write`, owns the offering | My offerings, single delete | Client, `request` |
| `deleteMultipleOfferings` | `DELETE /offerings`, body `{ offerings: string[] }`, max 50 | coffeeshop role, `profile:write`, owns all | My offerings, bulk delete | Client, `request` |
| `listMyLocations` | `GET /locations` | coffeeshop role, `profile:read` or `profile:write` | New offering, locations | Client, `request` |
| `listCoffeeInventory` | `GET /coffeeInventory?coffeeName={typed text}` | coffeeshop role, read or write | New offering, the inventory combobox | Client, `request`, while the user types (combobox hook: 2 characters, 300 ms, older request aborted) |
| `createOfferings` | `POST /offerings`, body `{ coffeeInventoryId, locations[] }` | coffeeshop role, `profile:write`, owns every location | New offering, submit | Client, `request` |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | public | Card taste badges (Open 12) | Server, `fetchTaxonomies` (`src/entities/taxonomy`) |

**Fetching rule** (settled, `.claude/CLAUDE.md` §2): public endpoints run on the server with plain `fetch`; token endpoints run on the client through add-auth's client. `listCoffeeInventory` needs the token, so the search-as-you-type exception of the decisions log does not even apply to it.

**Note on `listOfferings`** (criterion B, closed with a verified constraint). The own list is public, but its filter value is the signed-in user's `ulid` from the session. That value lives only in the browser (tokens in memory, no auth cookie), so the server cannot build this request. It runs on the client through `publicRequest`, with no credential. No visible change, no security or API change. The orchestrator may record it under "Closed for review".

**add-auth interface used** (merged on `develop`):
- `request(path, init)` and `publicRequest(path, init)` from `@/shared/api`;
- `useSession()`, `signIn(returnRoute?)`, `requestProfileWrite(returnRoute)` from `@/features/auth` (`src/features/auth/index.ts`).

**Response states, per operation:**

| Operation | Loading | Success | Empty | Error (any non-2xx, transport) | 403 | 422 |
|---|---|---|---|---|---|---|
| `listOfferings` (own) | 3 skeleton cards in the grid | Cards, toolbar, pagination | Empty message + "Create an offering" link | Message + Retry (refetch) | n/a (public) | Same as error (Open 7) |
| `deleteAnOffering` | Dialog confirm `Button loading`, Cancel disabled | Dialog closes; status "Offerings deleted: 1"; the page refetches | — | Dialog stays open with `deleteError`; retry allowed | Step-up notice in the dialog's `error` (Open 6) | Same as error |
| `deleteMultipleOfferings` | Same | Dialog closes; status "Offerings deleted: {n}"; selection cleared; refetch | — | Same | Same | Same as error |
| `listMyLocations` | `type-meta` line "Loading your locations…" in the group's place | One checkbox per location | "You have no locations registered."; submit disabled | Error line + Retry | Error line + Retry | n/a |
| `listCoffeeInventory` (combobox) | Popup row "Searching…" | One result row per item | Popup row "No matches" | Popup row "Results could not be loaded" | Same as error | Same as error |
| `createOfferings` | Submit `Button loading` | Success status region (Open 9) | — | Form-level error, values kept | Step-up notice above the actions (Open 6) | Form-level error (Open 7) |

The combobox state rows are the combobox's own (add-filter-controls Open 16), non-selectable, announced through the listbox's polite status. Their texts come from this change's catalog area and reach the combobox as props.

API values are shown as they are: names, `country`, `process`, `verificationStatus` through the status badge.

The API `message` strings are not shown. Every text comes from the catalog.

**After a delete:**
- the current page is fetched again;
- when the current page comes back empty and it is not page 1, the list moves to the previous page.

**Bulk limit:** selection is limited to the current page; the page holds `meta.per_page` items (15 in the contract example), so a bulk request never exceeds the documented 50 *(per_page value unverified against the API default)*.

## 3. Routes and composition (FSD)

| Layer | Piece | Notes |
|---|---|---|
| `app/[locale]/manage/offerings/page.tsx` | Route: passes the locale and the `page` search param to the screen. No logic | |
| `app/[locale]/manage/offerings/new/page.tsx` | Route: passes the locale | |
| `app/[locale]/@sidebar/manage/offerings/…` | The area's sidebar entries in the `@sidebar` slot, for both routes | Slot and its `default`/catch-all from `add-filter-controls` |
| `src/pages/manage-offerings` | `ManageOfferingsScreen`: loads the catalog texts and the taxonomies (server), renders the page and the client list | New |
| `src/pages/new-offering` | `NewOfferingScreen`: loads the texts (server), renders the page and the client form | New. No server fetch of options any more |
| `src/features/offering-management` | Client pieces: own-offering list state (fetch, selection, delete flows), the card actions, `BulkDeleteToolbar`, `CreateOfferingForm` (inventory search function and row content for the combobox), `ManagementSidebarEntries`, the session gate, the step-up notice | New. Uses `useSession`, `request`, `publicRequest` |
| `src/entities/offering` | `OfferingCard` with `actions` (`replace-offering-card-session`) | Existing |
| `src/entities/taxonomy` | `fetchTaxonomies`, `buildTaxonomyLookup` | Existing |
| `src/widgets/offering-list` | `OfferingSkeletonCard`; the grid (Open 13) | Existing |
| `src/shared/ui` | `PageSection`, `Pagination`, `Button`, `Link`, `Checkbox`, `Field`, `Badge`, `Card`, `ConfirmDialog` (scales), the combobox (filter-controls), Sidebar parts (link form from filter-controls) | Existing / dependencies |
| `src/shared/ui/icons.ts` | Add `Trash2`, `Plus` and `List` to the existing lucide entry | No new dependency (`lucide-react` installed) |

## 4. Components and reuse

| Part | Component and variant | States | Accessible name / semantics |
|---|---|---|---|
| Eyebrow | `<p className="type-eyebrow-strong">` (as `HomeHero`) | — | text |
| Heading | `<h1 className="type-heading">`, `tabIndex={-1}` as the focus target after a delete (Open 18) | — | heading text |
| "New offering" (list header) | `Link` default → `/{locale}/manage/offerings/new` | rest, hover, focus | label |
| Status region | `<p role="status">`, `type-body` | empty: renders nothing | live, polite |
| Select all (page) | `Checkbox` default, label "Select all on this page" | unchecked; checked when every card on the page is selected; activating it on a partial selection selects all | own label |
| Selected count | `<span className="type-meta">` "Selected: {n}" | — | inside the toolbar |
| Bulk delete | `Button variant="action-2" size="sm" icon={Trash2}` "Delete selected" | disabled (50% opacity) at 0 selected | label |
| Offering card | `OfferingCard` (`Card layout="stacked"`) with `actions` | as landing | `h3` coffee name |
| Card actions (the `actions` content) | a wrapper of this feature holding Select and Delete | — | — |
| Select one | `Checkbox` default. Visible label "Select", plus a visually hidden " {coffee name} — {location name}" | checked / unchecked | "Select Huila El Mirador — Tazavera Gràcia" |
| Delete one | `Button variant="action-2" size="sm" icon={Trash2}` "Delete", `aria-label` "Delete {coffee name} — {location name}" (starts with the visible text, WCAG 2.5.3) | rest, hover, focus | as given |
| Confirmation | `ConfirmDialog`: `title`, `description`, `confirmLabel`, `cancelLabel`, `pending`, `error` | closed, open, pending, error | `alertdialog`, name = title, description bound |
| Pagination | `Pagination` (`@/shared/ui`), `path` `/{locale}/manage/offerings`, `query` the other URL keys (none today) | disabled at the boundaries | button labels |
| Skeleton | `OfferingSkeletonCard` ×3 | loading | shapes only |
| Retry (list) | `Button variant="primary"` with an `onClick` refetch. Not `RetryButton`, which calls `router.refresh()` for server data | — | label |
| Back link (form) | `Link variant="back"` → `/{locale}/manage/offerings` | — | "Back to my offerings" |
| Inventory item | the shared combobox (add-filter-controls), inside `Field` with `required`, `Input` variant `default` (Open 21), `maxLength` 150 (contract `coffeeName`) | closed, open, searching, results, no matches, failure, option active, selected, invalid | Field label "Inventory item"; `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; options `role="option"` with `aria-selected` |
| Result row | the combobox's two-line row: line 1 `coffee.name`; line 2 `roastery.name · coffee.country · coffee.process`, empty parts skipped | rest, active, selected (`Check` at the end) | the option's text |
| Locations | `<fieldset>` + `<legend className="type-label">` with the required asterisk (Field's pattern), one `Checkbox` per location (Open 19) | loading, empty, error | fieldset + legend |
| Form error | `<p role="alert" className="type-error">` | renders nothing when empty | alert |
| Submit | `Button variant="primary"` type submit "Create offerings" | rest, hover, `loading` while pending | label |
| Cancel | `Link` default → list | — | label |
| Step-up notice | `stepUpMessage` (`role="alert"`) and `Button variant="primary" size="sm"` "Confirm your identity", in the dialog's `error` slot or above the form actions | — | label |
| Session gate | `anonymous`: `signedOutMessage` and `Button variant="primary"` "Sign in" | — | label |
| Sidebar entries | `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton` in its link form (`asChild` + `Link`), with `List` and `Plus` icons (Open 1) | rest, hover, current (`aria-current="page"`), focus | labels |

**Delete colour.** The removal treatment is `action-2`, the one settled for Delete in `add-specialist-evaluations` (its answer 2: "Delete `action-2`"), so both management areas delete with the same treatment. The first draft used `action-4` only because the tinted boundaries failed; `fix-button-boundaries` is now merged and every action treatment has its boundary (`Button.tsx:47-80`).

**New components in `src/shared/ui`:** none from this change. `ConfirmDialog` comes from add-evaluation-scales, the combobox and the sidebar link form from add-filter-controls.

## 5. Semantic tokens and contrast

Only existing semantic tokens are used. No new primitive or semantic token is proposed by this change.

| Part | Token(s) | Sits on |
|---|---|---|
| Page section | `bg-surface-page` (`PageSection surface="page"`) | — |
| Eyebrow | `text-label` (`type-eyebrow-strong`) | surface-page |
| h1 | `text-primary` (`type-heading`) | surface-page |
| Status text, empty and error messages | `text-primary` (`type-body`) | surface-page |
| Toolbar count | `text-secondary` (`type-meta`) | surface-page |
| Checkbox label | `text-label` (`type-label`) | surface-page (select all), surface-card (per card), surface-form (locations) |
| Checkbox box | `border-strong`, checked `surface-checked` + `checked-mark` | same surfaces |
| Links | `text-link`, hover `text-link-hover` | surface-page, surface-card, surface-form |
| Delete buttons | `action-2-bg` / `action-2-text` / `action-2-border`; hover `action-2-bg-hover` / `action-2-text-hover` | surface-page, surface-card |
| Primary buttons | `action-primary` / `action-primary-text` / `action-primary-border`; hover `action-primary-hover` | surface-page, surface-form, surface-card (dialog) |
| Form panel | `bg-surface-form`; border 2px `border-subtle` (decorative, not gated); `rounded-container`; `shadow-lg` | surface-page |
| Field labels, legends | `text-label` (`type-label`) | surface-form |
| Help, loading lines | `text-secondary` (`type-meta`) | surface-form |
| Errors | `feedback-error` (`type-error`) | surface-page, surface-card, surface-form |
| Combobox input | `Input` default: `bg-surface-input`, `border-strong` (its own) | surface-form |
| Combobox popup | `nav-surface`, `nav-text`; active row `nav-hover` + `nav-text-hover` (add-filter-controls §6.2) | — |
| Card | the card's own: `surface-card`, 4px left `border-accent`, `rounded-container`, `shadow-lg` | surface-page |
| Focus | `focus-visible:focus-ring` | every surface above |
| Sidebar | `nav-surface-dark`, `nav-text-dark`, `nav-hover`, `nav-current-dark` (existing Sidebar) | — (see F2) |

**Contrast of the gated pairs** *(measured in the first draft, design lead's scripts `contrast-offering-mgmt.mjs`, `contrast-actions.mjs`, `contrast-sidebar*.mjs`; WCAG 2.2 relative luminance; `color-mix` in sRGB. Not re-run in this redraft: no shell in this session; new elements use pairs already measured or registered)*:

| Pair | Gate | Traditional | Dark | Registered today |
|---|---|---|---|---|
| text-primary / surface-page | 4.5 | 6.41 | 14.28 | yes |
| text-primary / surface-card | 4.5 | 6.41 | 13.22 | yes |
| text-secondary / surface-page | 4.5 | 6.05 | 8.57 | yes |
| **text-secondary / surface-form** | 4.5 | 6.42 | 7.93 | no |
| text-label / surface-page | 4.5 | 5.97 | 10.28 | yes |
| **text-label / surface-card** | 4.5 | 5.97 | 9.51 | no |
| **text-label / surface-form** | 4.5 | 6.34 | 9.51 | no |
| **text-link / surface-form** | 4.5 | 6.81 | 13.22 | no |
| **text-link-hover / surface-form** | 4.5 | 12.24 | 14.75 | no |
| **text-link / surface-page** | 4.5 | 6.41 | 14.28 | no |
| text-link / surface-card, text-link-hover / surface-card | 4.5 | 6.41 / 11.53 | 13.22 / 14.75 | yes |
| feedback-error / surface-page, surface-card, surface-form | 4.5 | 6.75 / 6.75 / — | 6.13 / 5.67 / — | yes |
| action-primary-text / action-primary, hover | 4.5 | 6.85 / 11.67 | 5.38 / 6.64 | yes |
| action-2-text / action-2-bg, hover | 4.5 | guard | guard | yes |
| action-2-border / surface-page, surface-card; action-primary-border / surface-page, surface-form, surface-card | 3 | guard | guard | yes (`fix-button-boundaries`) |
| border-strong / surface-card | 3 | 11.53 | 4.52 | yes |
| nav-text / nav-surface, nav-text-hover / nav-hover (combobox popup) | 4.5 | registered | registered | yes (add-filter-controls §8) |
| focus-ring / surface-page, surface-card | 3 | 11.53 / 11.53 | 14.28 / 13.22 | yes |

"guard": measured by `theme-tokens.test.ts` on every run; no ratio is quoted here.

**Every text pair passes its gate in both themes. Button boundaries:** resolved on `develop` by `fix-button-boundaries` (old F3 and Open 15 closed).

**Guard pairs this change registers, in both matrices:**
- `text-label` / `surface-card`;
- `text-label` / `surface-form`;
- `text-secondary` / `surface-form`;
- `text-link` / `surface-page`;
- `text-link` / `surface-form`;
- `text-link-hover` / `surface-form`.

Whichever of this change, add-offering-catalog and add-user-account lands later drops the pairs already registered.

## 6. Layout and spacing (criterion A)

Breakpoints: Tailwind defaults as the project uses them: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

### 6.1 Page layout (`PageSection`, decisions log D14)

Both routes render inside the shell's content column, beside the sidebar from `md` (16rem, `Sidebar.tsx:66-75`; overlay below `md`).
- **One `PageSection surface="page"`** per route: full width, `surface-page`, vertical padding 3rem below `md` and 4rem from `md`; container centred, at most 72rem, side padding 1rem below `md` and 2rem from `md`; no border, no radius. These are `PageSection`'s own values; the screens add none.
- The container's children are laid out through `containerClassName` (layout only): a flex column with the gaps below.

### 6.2 My offerings `/{locale}/manage/offerings`

The container holds a flex column. Gaps between its blocks:
- header → status region: 2rem;
- status region → toolbar: 1rem;
- toolbar → grid: 1.5rem;
- grid → pagination: 2rem.

A block that renders nothing adds no gap.

**Header block:**
- One flex row, wrapping, space between, aligned to the bottom, gap 1rem. Below `md` it stacks, gap 1rem, left-aligned.
- **Title group:** a flex column, eyebrow and h1 0.5rem apart (MVC `layouts/offerings/index.blade.php:3-6`, as add-offering-catalog §6.2).
- **"New offering" link:** no box, padding, border or radius.

**Status region:** a text line. No box, padding, border or radius.

**Selection toolbar** (rendered only in the success state):
- a flex row, wrapping, centre-aligned, gap 1rem; no padding, border, radius or background;
- order: select-all checkbox, selected count, bulk delete button;
- from `md`, the bulk delete button is pushed to the end of the row; below `md` it wraps under the other two, left-aligned.

**Grid:** gap 1.5rem; cards of a row share their height; columns per Open 13.

**Card:** `OfferingCard`'s own regions, unchanged: padding 1.5rem per region; 4px `border-accent` on the left; `rounded-container`; `shadow-lg`.

**Card actions** (the `actions` content; the entity renders it after View inside its links group, `ml-auto flex gap-4`, `replace-offering-card-session` §4):
- one wrapper of this feature: a flex row, centre-aligned, gap 0.5rem (MVC `[data-flux-card-actions]` `gap-2`, `app.css:835-837`), holding Select then Delete;
- no padding, border or radius of its own; the footer wraps the links group onto its own line when narrow.

**Pagination:** `Pagination` as shipped: centred, buttons 1rem apart, wrapping, 2rem below the grid.

**Empty state:** a centred column, 1rem apart: the message, then the "Create an offering" link; no box.

**Error state:** a centred column, 1rem apart: the message, then Retry; no box (the `OfferingList` error pattern).

**Loading:** three `OfferingSkeletonCard`s in the grid; the header renders; the toolbar does not.

**Dialog:** add-evaluation-scales §5 owns every value: panel up to 32rem, padding 1.5rem, `rounded-container`; description 0.5rem below the title, error 0.75rem below the description; actions 1.5rem below, 0.75rem apart.

**Session gate** (`anonymous`): in place of the toolbar, grid and pagination, a column, 1rem apart: `signedOutMessage` (`type-body`), then the "Sign in" button at its own width. No box.

### 6.3 New offering `/{locale}/manage/offerings/new`

The container holds a flex column:
- back link → header block: 1.5rem (as add-offering-catalog §6.3);
- header block → form panel: 2rem.

**Header block:** eyebrow and h1, 0.5rem apart. No box.

**Form panel** (`<form noValidate>`, MVC `tz-form-main`, `app.css:487-491`, translated):
- width 100% below `md`; from `md`, at most 40rem, left-aligned (Open 14);
- background `surface-form`; border 2px `border-subtle`, decorative; `rounded-container`; `shadow-lg`;
- padding 1rem with 1.25rem at the bottom below `md` (MVC `p-4 pb-5`), 1.5rem from `md`.
- Children: a flex column, 1.5rem apart, in this order:
  1. **Inventory item** (combobox in `Field`):
     - `Field` internals as shipped: label 0.5rem above the 2.5rem control, help and error 0.25rem below (`Field.tsx:57,68`);
     - full panel width;
     - help line (`type-meta`): `inventoryHelp` ("Type at least 2 letters of the coffee name.");
     - the popup: add-filter-controls §6.2 and its Open 16 row values, unchanged: opens 0.25rem below the input, as wide as the input, at most 15rem tall and scrolling; fill `nav-surface`, `radius-field`, padding 0.25rem; rows padding 0.5rem 0.75rem, no gap between rows, min height 2.75rem, two lines 0.125rem apart (`type-option`, `type-option-detail`), the `Check` icon (1rem) of the selected row at its end.
  2. **Locations** (fieldset):
     - legend `type-label`, 0.5rem above the options, with the required asterisk;
     - checkboxes in a column, 0.5rem apart;
     - no fieldset border, padding or radius (the native ones reset);
     - loading, empty and error lines take the options' place. Error: `type-error` line and Retry (`Button variant="primary" size="sm"`), a flex row, wrapping, gap 0.5rem.
  3. **Form error** (`role="alert"`) or **step-up notice**: a text line, or a column of the text and its button 0.75rem apart; no box; rendered only with content.
  4. **Success status** (`role="status"`, Open 9): a flex column, 0.5rem apart: the message, then the "View my offerings" link; no box.
  5. **Actions:** a flex row, wrapping, centre-aligned, gap 0.75rem (the dialog's button gap, scales §5): Submit first, then the Cancel link. From `sm`, the row is aligned to the end.

### 6.4 Sidebar entries (Open 1)

The existing `Sidebar` parts and values, unchanged, rendered from the `@sidebar` slot:
- column 16rem wide, `nav-surface-dark`;
- content padding 0.5rem;
- menu items 0.25rem apart;
- each entry: `SidebarMenuButton` in its link form; padding 0.75rem horizontal and 0.5rem vertical, icon (1rem) to label gap 0.5rem, `rounded-field`.

Two entries, in this order: "My offerings" (`List` icon), then "New offering" (`Plus`). Neither is exported by `icons.ts` today (it exports `Loader2`, `ArrowLeft`, `Eye`, `EyeOff`, `Globe`, `ChevronDown`, `ChevronRight`, `Check`, `Clock`, `PanelLeft`): this change adds `List`, `Plus` and `Trash2` to that single entry point. The current entry takes `nav-current-dark` and `aria-current="page"`. Hover and focus colours: see F2.

### 6.5 At 375px

*(computed)*
- The container is 343px wide.
- The form panel's content is 311px wide; the combobox input and its popup take that width.
- Toolbar, card footer, actions and pagination wrap.
- The dialog panel is 343px wide (scales §5).
- No horizontal scroll: names and API values wrap in the list; the combobox rows truncate with an ellipsis (add-filter-controls Open 16).

### 6.6 Visual reference (mock-ups, ASCII: there is no MVC screen to capture)

My offerings, 1280px, sidebar open:
```
┌ header ── Logo  Top rated  About us ───────────────── ES ▾  (EB) ▾ ┐
├ sidebar 16rem ┬ PageSection surface-page  py-16 ─────────────────────┤
│ ▣ My offerings│  MANAGEMENT                                          │
│ ＋ New offering│  My offerings                        New offering   │
│               │  Offerings deleted: 2           (status, polite)     │
│               │  ☐ Select all on this page  Selected: 1   [🗑 Delete selected]
│               │  ┃ 84.25 /100 [Good]    ┃ [Provisional]               │
│               │  ┃ [✓ Verified]          ┃ Sidama Bensa               │
│               │  ┃ Huila El Mirador      ┃ Cafetería: Tazavera Born   │
│               │  ┃ …                     ┃ …                          │
│               │  ┃ Evaluaciones: 5   View  ☑ Select [🗑 Delete]        │
│               │            [Previous] [Next]                          │
└───────────────┴───────────────────────────────────────────────────────┘
```
New offering, 375px (sidebar as overlay, closed):
```
│ PageSection surface-page  py-12  px-4     │
│ ← Back to my offerings                    │
│ MANAGEMENT                                │
│ New offering                              │
│ ╭ form panel (surface-form) ───────────╮  │
│ │ Inventory item *                     │  │
│ │ [ hui                            ]   │  │
│ │ ╭ popup (nav-surface) ────────────╮  │  │
│ │ │ Huila El Mirador             ✓  │  │  │
│ │ │ Nómada Roasters · Colombia · wa…│  │  │
│ │ │ Huila Pink Bourbon              │  │  │
│ │ │ Nómada Roasters · Colombia · na…│  │  │
│ │ ╰─────────────────────────────────╯  │  │
│ │ Type at least 2 letters…             │  │
│ │ Locations *                          │  │
│ │ ☑ Tazavera Gràcia                    │  │
│ │ ☐ Tazavera Born                      │  │
│ │ [Create offerings]  Cancel           │  │
│ ╰──────────────────────────────────────╯  │
```
An MVC capture is not possible (no such screen). The verification task captures both routes at 375px and 1280px.

## 7. Behaviour

**Session and role gate** (Open 5; decisions log "rutas protegidas sin sesión: mensaje con botón"):
- **`loading`:** the list shows its skeleton; the form shows its header and the panel with the combobox and the locations group disabled.
- **`anonymous`:** `signedOutMessage` and a "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the user stays on the route). No automatic redirect.
- **`authenticated`, role ≠ `coffeeshop`:** the 404 page.

**Own list:**
- it fetches `GET /offerings?coffeeshopUlid={session.user.ulid}` plus `page` from the URL;
- `page` lives in the URL query (`?page=n`), as on landing; `Pagination` replaces only `page`.

**Selection:** a set of offering ulids for the current page; cleared on a page change and after a successful delete (Open 17).

**Single delete:**
1. Delete → dialog: "Delete this offering?" / "The offering will be deleted. This cannot be undone."
2. Confirm → `deleteAnOffering`.
3. On 200: the dialog closes, the status region announces, the page refetches, and focus moves to the h1 (Open 18).

**Bulk delete:**
1. "Delete selected" → dialog: "Delete the selected offerings?" / "The selected offerings will be deleted. This cannot be undone."
2. Confirm → `deleteMultipleOfferings` with the selected ulids.
3. On 200: as for the single delete.

**Create:**
- **Choosing the inventory item** (Open 8 answer): the user types in the combobox; the shared hook sends `GET /coffeeInventory?coffeeName={text}` through `request` after 2 characters and 300 ms without typing, aborting an older request; the results replace the list. Choosing a row sets the form's `coffeeInventoryId` to the row's `ulid` and shows `coffee.name` in the input. Clearing the input clears the choice.
- **Client checks on submit** (decisions log "validación de formularios en el navegador"; contract `requestBody` of `createOfferings`): no inventory item chosen → `inventoryRequired` under the field, field marked invalid, focus on it, nothing sent. The contract does not mark `locations` as required (M2), so an empty location set is not checked on the client: the API answers and the generic error shows (Open 22).
- **Locations:** one checkbox per location from `listMyLocations`; preselected when there is exactly one (Open 10); submit disabled when the user has none.
- **On 201:** the success status "Offerings created: {n}" (n = `data.length`) with the "View my offerings" link; the combobox and the location checkboxes are reset (Open 9).

**Writes and the step-up** (Open 6; decisions log "escrituras, rutas protegidas y 422"):
1. The write is sent with the current token through `request`.
2. A `403` shows the step-up notice: `stepUpMessage` and "Confirm your identity", whose click calls `requestProfileWrite(currentRoute)` synchronously. Deletes: in the dialog's `error` slot (the dialog stays open). Create: above the actions.
3. The popup keeps the page, the open dialog and the form state; after signing in again the user confirms or submits again.
4. A declined step-up makes the session `anonymous`; the page shows the signed-out state.

The step-up also shows for a 403 caused by ownership or role, because the contract documents no body to tell them apart (M4); accepted with Open 6.

## 8. Texts (message catalog, es / en / ca, passed as props)

New area `offering-management` (`messages/{locale}/offering-management.json`). The card texts (captions, counts, View, status and rating labels) and the pagination labels come from the existing `landing` keys, as add-offering-catalog Open 3. Spanish follows the MVC wording where it exists ("Eliminar", "Cafetería"). The rest, and every English and Catalan string, are proposals (Open 20).

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
| `signedOutMessage` | Inicia sesión para gestionar tus ofertas. | Sign in to manage your offerings. | Inicia sessió per gestionar les teves ofertes. |
| `signInLabel` | Iniciar sesión | Sign in | Iniciar sessió |
| `newHeading` | Nueva oferta | New offering | Nova oferta |
| `backLabel` | Volver a mis ofertas | Back to my offerings | Torna a les meves ofertes |
| `inventoryLabel` | Café del inventario | Inventory item | Cafè de l'inventari |
| `inventoryHelp` | Escribe al menos 2 letras del nombre del café. | Type at least 2 letters of the coffee name. | Escriu almenys 2 lletres del nom del cafè. |
| `inventorySearching` | Buscando… | Searching… | Cercant… |
| `inventoryNoMatches` | Sin coincidencias | No matches | Cap coincidència |
| `inventorySearchError` | No se pudieron cargar los resultados | Results could not be loaded | No s'han pogut carregar els resultats |
| `inventoryRequired` | Elige un café del inventario. | Choose an inventory item. | Tria un cafè de l'inventari. |
| `locationsLegend` | Locales | Locations | Locals |
| `locationsLoading` | Cargando tus locales… | Loading your locations… | Carregant els teus locals… |
| `locationsEmpty` | No tienes locales registrados. | You have no locations registered. | No tens locals registrats. |
| `locationsError` | No se pudieron cargar tus locales. | Your locations could not be loaded. | No s'han pogut carregar els teus locals. |
| `submitLabel` | Crear ofertas | Create offerings | Crea les ofertes |
| `createError` | No se pudieron crear las ofertas. Revisa los datos e inténtalo de nuevo. | The offerings could not be created. Check the data and try again. | No s'han pogut crear les ofertes. Revisa les dades i torna-ho a provar. |
| `createdStatus` | Ofertas creadas: | Offerings created: | Ofertes creades: |
| `viewMyOfferings` | Ver mis ofertas | View my offerings | Mostra les meves ofertes |

Removed from the first draft (Open 8 answer): `roasterLabel`, `roasterAll`, `coffeeLabel`, `coffeeAll`, `listLoadError`, `inventoryLegend`, `inventoryLoading`, `inventoryEmpty`, `inventoryError`, `locationsRequired` (the last one by the validation decision, Open 22).

Numbers and names are appended to the catalog word by concatenation, as `OfferingCard` composes its captions. API values in the combobox rows are shown as returned, untranslated.

## 9. Accessibility

- **Headings:** one `h1` per screen; the cards keep their `h3`.
- **Names:** every per-card control has a unique accessible name that starts with its visible text (§4); the toolbar controls and the combobox have visible labels; the sidebar entries are links with visible text.
- **Combobox:** the WAI-ARIA APG combobox with listbox popup, as built by add-filter-controls (Down/Up, Enter, Escape; the popup never traps focus); state rows announced through its polite status.
- **Selection:** native checkboxes with their check mark; the count is plain text; the result of an action is announced by the status region.
- **Errors:** always text: `type-error` bound to its field (`aria-describedby`, `aria-invalid`), or `role="alert"` for the form error and the step-up notice; never colour alone.
- **Dialog:** add-evaluation-scales §5: `alertdialog`, initial focus on Cancel, Escape cancels, the overlay does not close it, focus returns to the trigger. After a successful delete the trigger may be gone, so focus moves to the `h1` (Open 18).
- **Disabled:** bulk delete at 0 selected and submit with no locations use the native `disabled` (50% opacity, `Button`).
- **Busy:** confirm and submit use `Button`'s `loading` (`aria-busy`, label kept).
- **Focus:** every control is an existing one with `focus-visible:focus-ring`; the sidebar entries' traditional-theme ring is F2.

## 10. Dependencies

**Capability layer:** `theming` → `base-controls` (`Button`, `Link`) → `form-fields` (`Field`, `Input`, `Checkbox`, the combobox), `feedback` (`Badge`, `ConfirmDialog`), `content-structure` (`Card`, `PageSection`, `Pagination`) → `app-shell` (`@sidebar` slot, sidebar link form) → `landing` (`OfferingCard` `actions`) → `offering-management`.

**Changes this one waits for (apply order; none blocks the propose):**
- **add-auth:** merged.
- **extract-offering-list-parts, extract-page-section, fix-button-boundaries:** merged.
- **add-evaluation-scales** (Apply): `ConfirmDialog`. Its §1 consumer list omits this change (F4).
- **replace-offering-card-session** (Summary — approved): the `actions` slot.
- **add-filter-controls** (Summary — approved): the combobox (with the `default` input variant, Open 21), the `@sidebar` slot and the `SidebarMenuButton` link form. Its apply waits for `add-offering-catalog`.
- **add-specialist-evaluations:** shares the step-up rule, the access rule, the sidebar mechanism and the Delete treatment; no file shared.

**Backlog:** R1, R3, R4, R5 do not name this change. R8 (422 field mapping) is cited by the decisions log but missing from `docs/backlog.md` (F6).

**Decisions log entries applied:** D14; "cobertura del contrato" (superseded here by "add-filter-controls: resto de puntos": management no longer consumes `listCoffees`/`listRoasteries`); "acceso a rutas protegidas" and "rutas protegidas sin sesión: mensaje con botón"; "escrituras, rutas protegidas y 422"; "primitivo compartido de sección"; "ranura de acción de `OfferingCard`"; "librería del combobox"; "add-filter-controls: resto de puntos"; "piezas extraídas disponibles"; "validación de formularios en el navegador"; "entradas del sidebar de gestión"; "petición de ofertas con query"; "CORS de la API para el navegador" (the browser calls here need it).

**Contract coverage:** this change consumes `listOfferings` (own), `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`, `listCoffeeInventory`, `createOfferings` and `listOlfactoryTaxonomies`. The board's coverage row for `listCoffees` and `listRoasteries` must drop this change (F7).

## 11. Tests (expected coverage)

- **Own-list fetch (pure function):** builds `GET /offerings?coffeeshopUlid={ulid}&page={n}`; maps non-2xx and transport failures to error and `data: []` to empty.
- **List presentation:** success with cards, toolbar and pagination (`Pagination` with path `/{locale}/manage/offerings`); empty with the create link; error with Retry calling the refetch; loading with three skeletons and no toolbar.
- **Card actions:** each card receives `actions` with Select then Delete, named with the coffee and location.
- **Selection:** toggling one card; select all on the page; select all on a partial selection selects all; the count text; bulk delete disabled at 0; selection cleared on a page change and after a delete.
- **Single delete:** nothing is sent before confirmation; confirm sends `DELETE /offerings/{ulid}` through `request`; pending state; on 200: dialog closed, status text, refetch, focus on the h1; on failure: the dialog stays open with `deleteError`; on 403: the step-up notice in the dialog, and its button calls `requestProfileWrite` with the current route synchronously in the click.
- **Bulk delete:** same, with body `{ "offerings": [...] }`; and the empty-last-page step back.
- **Create form:**
  - the search function passed to the combobox builds `GET /coffeeInventory?coffeeName={text}` through `request`;
  - the row content: line 1 the coffee name, line 2 `roastery · country · process` with empty parts skipped;
  - choosing a row sets `coffeeInventoryId`; clearing the input clears it;
  - submit without an item shows `inventoryRequired`, `aria-invalid`, focus on the combobox, nothing sent;
  - submit sends `{ coffeeInventoryId, locations }` through `request`;
  - 201 shows the created count and resets the form; failure and 422 keep values and show `createError`; 403 shows the step-up notice above the actions;
  - one location is preselected; no locations disables submit; loading, empty and error of the locations.
- **Access:** loading, anonymous (message and "Sign in" calling `signIn` with the current route in the click) and non-coffeeshop (404) branches.
- **Sidebar entries:** both links through the `@sidebar` slot, `aria-current` on the current one.
- **Catalog guard:** the `offering-management` area is present in es, en and ca with the same keys.
- **Contrast guard:** the pairs listed in §5, in both matrices.
- **Layout classes:** the exact classes the build chooses for every §6 value (jsdom has no CSS engine).
- **Verification task:** captures of `/es/manage/offerings` (with items, empty, dialog open) and `/es/manage/offerings/new` (combobox open with results), at 375px and 1280px, in both themes, with a coffeeshop session and the local read mock. The local database has no offerings.

## 12. Findings on existing code and the contract

- **F1: contract and API mismatches** (report to Product owner; the front follows the contract, `AGENTS.md`):
  - M1: the contract requires `profile:write` for `createOfferings`; the API route applies only the group's read-or-write check (`tazavera-api/routes/api.php:26,38-39`), so a read token can create.
  - M2: the contract does not mark `locations` as required; the API requires a non-empty, distinct array (`StoreOfferingRequest.php:30-31`). With the validation decision, the client cannot check it (Open 22).
  - M3: no `422` documented for `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`.
  - M4: no `403` documented for the three writes, although `OwnsOffering` aborts with 403 and the role and scope middleware reject.
  - M5: `deleteMultipleOfferings`' 50-item maximum is only in the description, not in the schema (`maxItems`).
  - M6: `listCoffeeInventory`'s `coffeeName` does not say whether it is a partial match (`listCoffees`' `name` does). Search-as-you-type assumes a partial match *(unverified in `FilterCoffeeInventoryRequest` / its query)*.
- **F2: sidebar entry contrast in the traditional theme** (merged `app-shell`, `Sidebar.tsx:265-277`) *(measured in the first draft)*:
  - hover text `nav-text-dark` on `nav-hover`: 2.49 (gate 4.5; dark 10.11);
  - focus ring `focus-ring` on `nav-surface-dark`: 1.80, on `nav-current-dark`: 2.35 (gate 3; dark 12.27 and 10.50).
  - Existing tokens pass: hover text `nav-text-hover` on `nav-hover` 4.63 / 4.68 (registered); the inverse ring via the `variant-inverse` scope, `focus-ring-inverse` 6.41 / 12.27 (registered). No new token.
  - No route renders entries yet. Path (workflow §4): defect in merged code → **new change** in `app-shell`, best folded into `add-filter-controls`' app-shell delta, which already rewrites `SidebarMenuButton` (link form) and fixes the sidebar's F1/F2 there (Open 1, sub-point).
- **F3: closed.** Tinted action boundaries fixed by `fix-button-boundaries` (merged `756c58b`).
- **F4: add-evaluation-scales' consumer list** (its summary §1) omits this change. Semantic: the orchestrator adds it at the next review of that folder.
- **F5: closed.** `SidebarMenuButton` gains its link form in `add-filter-controls` (decisions log "entradas del sidebar de gestión").
- **F6: backlog R8 missing.** The decisions log and Open 7 refer to `docs/backlog.md` R8 (422 field mapping); the file on `develop` holds R1, R3, R4, R5 only. Path: backlog (orchestrator).
- **F7: board coverage table out of date.** `docs/change-progress.md` still lists this change for `listCoffees` and `listRoasteries`, and still counts 23 operations (today's contract adds `listMyEvaluations`, `getMyEvaluation`, `listTheEvaluationsOfAUser`). Path: board update (orchestrator).

## Open

1. **How a management area supplies its sidebar entries, and link entries.**
   - **Answered 2026-10-06 (Product owner): (b).** Each management area fills the sidebar through the `@sidebar` parallel-route slot of `add-filter-controls`; `SidebarMenuButton` gains a link form (`asChild`). One mechanism for facets and entries (§3, §6.4).
   - Sub-point (F2): the traditional-theme hover text and focus ring of `SidebarMenuButton` fail their gates. Recommendation: fold the fix (hover label `nav-text-hover`; the sidebar under the `variant-inverse` scope for the ring, both existing tokens) into add-filter-controls' app-shell delta, which already edits that component; otherwise this change's own app-shell delta. Source: F2 measurements; criterion C.
   - Blocks propose: no (waits for `add-filter-controls`' slot to be merged).
2. **`OfferingCard` action slot.**
   - **Answered 2026-10-06 (Product owner): (a).** `replace-offering-card-session` (approved) adds `actions` and removes `session`; this change passes its Select and Delete wrapper (§6.2).
   - Blocks propose: no (waits for the refactor to be merged).
3. **Generalizing the offering-list widget.**
   - **Answered 2026-10-06 (Product owner): covered.** `Pagination` (`@/shared/ui`) and `src/entities/taxonomy` are on `develop`; this change uses them (§3, §4).
   - Blocks propose: no.
4. **Shared section and container primitive.**
   - **Answered 2026-10-06 (Product owner): (a).** Done: `PageSection` is on `develop`; this change uses it (§6.1).
   - Blocks propose: no.
5. **Access to `/manage/offerings*` by an anonymous user or a non-coffeeshop.**
   - **Answered 2026-10-06 (Product owner):** `loading` → skeleton; `anonymous` → a message with a "Sign in" button that calls `signIn(currentRoute)` inside the click, no automatic redirect; another role → the 404 page (§7).
   - Blocks propose: no.
6. **Write scope (`profile:write`) and the step-up.**
   - **Answered 2026-10-06 (Product owner): (a).** Reactive step-up after a `403` (§7).
   - Blocks propose: no.
7. **422 handling.**
   - **Answered 2026-10-06 (Product owner): (a).** Generic error; field mapping in backlog R8 (F6).
   - Blocks propose: no.
8. **Roaster narrowing.**
   - Options: (a) roaster filters on the front, coffee via `coffeeName`; (b) roaster as labels; (c) a `roasteryUlid` parameter in the API.
   - **Answered 2026-10-06 (Product owner): none of these.** One search-as-you-type combobox over `GET /coffeeInventory?coffeeName=` (client, `request`), the reusable combobox built by `add-filter-controls`, replaces the Roaster and Coffee selects and the inventory radio group. Choosing a row chooses the inventory item (`coffeeInventoryId`). Row: coffee name, then `roastery · country · process`. This change no longer consumes `listCoffees` or `listRoasteries`.
   - Redrafted 2026-10-06 by the design lead: §1, §2 (operations and states), §3, §4, §5, §6.3, §6.5, §6.6, §7, §8, §10, §11, §12.
   - Blocks propose: no.
9. **After a successful create.**
   - Options: (a) stay on the form with the success status and the "View my offerings" link, reset the choice; (b) navigate to the list with a notice (needs a cross-route message mechanism).
   - Recommendation: (a), consistent with add-specialist-evaluations answer 8 (status region, no toast). The body follows (a).
   - Blocks propose: no.
10. **Single location.**
    - Options: (a) preselect it when the user has exactly one; (b) never preselect.
    - Recommendation: (a). The body follows (a).
    - Blocks propose: no.
11. **Create route name.**
    - Options: (a) `/{locale}/manage/offerings/new`, matching `/manage/evaluations/new`; (b) a create panel inside the list page.
    - Recommendation: (a). The body follows (a).
    - Blocks propose: no.
12. **Taste badges on management cards.**
    - Options: (a) resolve them as landing does, with `fetchTaxonomies` on the server; (b) pass none.
    - Recommendation: (a), so the coffeeshop sees what the public sees. The body follows (a).
    - Blocks propose: no.
13. **Grid columns beside the sidebar.**
    - Options: (a) 1 / 2 from `lg` / 3 from `2xl` (a second grid constant); (b) `OFFERING_GRID_CLASSES` as is (cards about 212px wide at 768px with the sidebar open *(computed)*); (c) the grid `add-offering-catalog` defines for the open sidebar ("columns by available width", decisions log "add-filter-controls: resto de puntos").
    - Recommendation: (c): one grid owner for every offering grid beside the sidebar (criterion C); (a) as the fallback if the catalog's grid is not merged first.
    - Blocks propose: no.
14. **Form panel width.**
    - Options: (a) at most 40rem from `md`, left-aligned; (b) full container width.
    - Recommendation: (a), for readable rows. The body follows (a).
    - Blocks propose: no.
15. **Button boundaries.** Closed: fixed on `develop` by `fix-button-boundaries`.
    - Blocks propose: no.
16. **Where the `listCoffees` and `listRoasteries` fetchers live.** Obsolete: this change no longer consumes them (Open 8). They are `add-filter-controls`' own.
    - Blocks propose: no.
17. **Selection scope.**
    - Options: (a) current page only, cleared on a page change; (b) kept across pages, up to 50.
    - Recommendation: (a). The body follows (a).
    - Blocks propose: no.
18. **Focus after a successful delete.**
    - Options: (a) move it to the `h1` (`tabIndex={-1}`); (b) leave it to the dialog's focus return.
    - Recommendation: (a). The body follows (a).
    - Blocks propose: no.
19. **Checkbox group for the locations.** `form-fields` has no checkbox group.
    - Options: (a) compose the fieldset in this feature; (b) a `CheckboxGroup` in `form-fields` first.
    - Recommendation: (a) now, and report it to the backlog if a second copy appears.
    - Blocks propose: no.
20. **Texts.** The keys and strings in §8 are proposals. Product owner confirms or edits them.
    - Blocks propose: no.
21. **Combobox input variant on a light form.** add-filter-controls specifies its combobox input as `Input` `inverse` (sidebar). Here it sits on `surface-form`.
    - Options: (a) the shared combobox accepts `Input`'s existing `variant` (`default` | `inverse`) and passes it through; the popup keeps the header-menu treatment in both; (b) a second combobox.
    - Recommendation: (a): no token, no copy; to be passed to add-filter-controls' propose by the orchestrator. Source: `Input.tsx` variants (`InputVariant` in `@/shared/ui`); criterion C.
    - Blocks propose: no.
22. **Empty location set (M2 and the validation decision).** The contract does not mark `locations` as required, so the client may not check it (decisions log "validación de formularios en el navegador"); the API rejects an empty set (422 → generic `createError`).
    - Options: (a) accept the generic error until the contract marks `locations` required, then add the client check; (b) ask the API to document `locations` as required and non-empty now (contract change, Product owner's).
    - Recommendation: (b) as an API item, with (a) meanwhile. The body follows (a).
    - Blocks propose: no.
23. **Telling inventory items of the same coffee apart.** The settled row (`coffee name` / `roastery · country · process`) is identical for two roast lots of one coffee; the contract returns `roastLot` and `productionDate` for each item.
    - Options: (a) keep the settled row; (b) append `roastLot · productionDate` to line 2 (it truncates); (c) after choosing, show the chosen item's `roastLot · productionDate` as the field's help.
    - Recommendation: (c): it keeps Product owner's row and still lets the user confirm the lot. The body follows (a) until Product owner chooses.
    - Blocks propose: no.

## Review log

- 2026-10-06, design lead, generation mode.
  - **Settled from sources:** the list route and the management route pattern; the fetching rule; the add-auth interface; `ConfirmDialog` from add-evaluation-scales §5; D14 layout; the card-action gap and the form panel from the MVC; the dialog texts from the contract's "cannot be undone"; reuse of the offering-list pieces, form fields and Sidebar parts.
  - **Closed with a verified constraint (criterion B):** the own-offerings list runs on the client through `publicRequest`.
  - **Measured:** every gated pair in §5 and the sidebar pairs in F2, in both themes.
- 2026-10-06, design lead, redraft to Product owner's answers.
  - **Open 8 (answered):** the Roaster and Coffee selects and the inventory radio group replaced by the shared search-as-you-type combobox over `listCoffeeInventory`; `listCoffees` and `listRoasteries` removed from §2, the states table, §3 (`src/entities/coffee` and `src/entities/roastery` no longer created here), §4, §5, §6.3, §6.5, the mock-up, §7, §8 (keys removed, combobox keys added), §10, §11. Open 8 set to "Blocks propose: no"; Open 16 obsolete.
  - **Aligned with the other answers:** `@sidebar` slot and the `SidebarMenuButton` link form (Open 1; F5 closed); `OfferingCard` `actions` with its placement from `replace-offering-card-session` (Open 2); `Pagination` and `src/entities/taxonomy` (Open 3); `PageSection` (Open 4); signed-out message with a "Sign in" button (Open 5); reactive step-up in the dialog and above the form actions (Open 6); generic 422 (Open 7).
  - **Criterion B, semantic:** the Delete treatment moved from `action-4` to `action-2`, the one settled for Delete in add-specialist-evaluations; the first draft chose `action-4` only to dodge the boundary failure that `fix-button-boundaries` has since fixed (old F3, Open 15 closed). Product owner may reopen it.
  - **Criterion B, consequence of the validation decision:** the client check "Choose at least one location" removed, because the contract does not mark `locations` required (Open 22 records the gap).
  - **Added:** Open 21 (combobox input variant), Open 22 (empty location set), Open 23 (same-coffee items); findings M6, F6 (R8 missing), F7 (board coverage).
  - **Not re-measured:** no shell in this session; new parts use pairs measured in the first draft or registered in the guard.
  - No Open point blocks propose: line 1 set to "ready for approval".

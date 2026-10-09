## Context

Fast-lane refactor from backlog R32 (with R17) and technical review §3.1 row R32. Product owner settled on 2026-10-08: every `<nav>` gets an accessible name from new catalog texts in es, en and ca that reach the components as props; card headings that skip a level follow the page outline and keep their look through the existing type classes; the signed-out prompt gets an `h1`; the `treeitem` gets `aria-selected`; and the result count is announced while the sidebar overlay is open. Nothing a sighted user sees changes. The architect writes the labels and the spec wording.

The backlog's line numbers predate the AUT corrections; the findings were re-located in the current code: the `treeitem` now lives in `src/shared/ui/FlavorWheelNoteList.tsx`, and the only gated view without an `h1` is the evaluation routes' gate (`EvaluationsAccess`): the account, location, offering-management and new-offering screens already render their `h1` above the gate.

## Goals / Non-Goals

**Goals:** no unnamed `<nav>`; no heading more than one level below the previous one on the catalog, home, coffee shop directory and detail, manage offerings and "My evaluations" pages; one `h1` on every evaluation route in every session state; a `treeitem` with every required ARIA attribute; the result count announced inside the open overlay.

**Non-Goals:** moving the sidebar `aside` out of `main`; renaming the sidebar `aside`; changing any visible text, class or position.

## API endpoints

None: no request changes.

## Decisions

### D1 — Navigation names: four catalog keys, passed as optional props

| Landmark | Component | Catalog key | es | en | ca |
|---|---|---|---|---|---|
| Header primary navigation | `PrimaryNav` (prop `texts.primaryNavigation`) | `shell.primaryNavigation` | Principal | Main | Principal |
| Sidebar navigation | `AppSidebar` (context `navigationLabel`) | `shell.sidebarNavigation` | Gestión | Management | Gestió |
| Entry page registration links | `HomeHero` (prop `texts.registerNavigation`) | `landing.heroRegisterNavigation` | Registro | Registration | Registre |
| About us registration links | `AboutContent` (prop `texts.registerNavigation`) | `landing.aboutRegisterNavigation` | Registro | Registration | Registre |

The names leave out the word "navigation": assistive technology announces the landmark role after the name. The pagination's `nav` is already named and does not change. Each name renders as the `nav`'s `aria-label`. `AppShell` reads the two shell keys and passes them down (`AppHeaderTexts.primaryNavigation`, `SessionShell` → `AppSidebarProvider navigationLabel`); `HomeScreen` and the About us screen read the landing keys. The new props are optional (`?: string`), so the existing test fixtures, including the QA copies that cannot be edited, stay valid; every production caller passes them.

### D2 — Headings follow the page outline

Every page that shows these cards has its `h1` directly above the list, so the card headings become level 2:

| Element | File | Before | After |
|---|---|---|---|
| Offering card title (home, catalog, coffee shop Offerings tab, manage offerings) | `src/entities/offering/ui/OfferingCard.tsx` | `h3` | `h2` |
| Coffee shop card title (directory) | `src/entities/coffeeshop/ui/CoffeeshopCard.tsx` | `h3` | `h2` |
| Map location panel title (directory map view, coffee shop Locations tab) | `src/shared/ui/LocationsMap.tsx` | `h3` | `h2` |
| "My evaluations" list heading | `src/pages/evaluations-list/ui/EvaluationsList.tsx` | `h2` | `h1` |
| "My evaluations" row title | `src/widgets/evaluation-row/ui/SpecialistEvaluationRowCard.tsx` | `h3` | `h2` |

Each element keeps its classes (`type-card-heading`, `type-heading`), which set the font size, weight and line height, so the look does not change. The public evaluations row is already `h2` under the page's `h1`.

### D3 — The signed-out view of the evaluation routes: the access message is the `h1`

`SignedOutPrompt` gets an optional `messageAs?: "p" | "h1"` prop (default `"p"`) that picks the element of its message; the element keeps `type-body`, and Tailwind's preflight resets the heading's own size and weight, so the look does not change. `EvaluationsAccess` passes `"h1"`. The other gated screens keep `"p"`, since their `h1` already renders above the gate. No text is added: the gate still adds no text of its own (app-shell "Protected content gate").

### D4 — The note list's active row is the selected row

Each `treeitem` of `FlavorWheelNoteList` carries `aria-selected`, `true` for the row of the active note and `false` for every other row. The active note and its highlight do not change.

### D5 — The overlay repeats the result count in its own status region

A new client module `src/shared/ui/ResultStatus.tsx` holds a small context and three parts:

- `SidebarAnnouncementProvider`: holds the current announcement string; `SidebarProvider` renders it around its children.
- `ResultStatus({ text })`: renders the list's existing `<div role="status" className="sr-only">` with `text`, and publishes `text` to the provider (an empty string on unmount). Without a provider it only renders the region, so components rendered outside the shell behave as today.
- `OverlayStatus`: a `<div role="status" className="sr-only">` with the provider's announcement, rendered by `Sidebar` inside the small-viewport sheet only.

`OfferingList`, `CoffeeshopList`, `EvaluationListPresentation` and `EvaluationsList` render `ResultStatus` in place of their own status `div`, with the same text in the same states. While the overlay is closed the overlay region is not mounted and the page's region announces as today; while it is open, the page is hidden from assistive technology and the overlay's region changes with the count, so the count is announced there. The module stays outside `Sidebar.tsx`, which is already above the 300-line limit.

### D6 — Test queries that change

No assertion's expected value changes. The only edits to existing tests swap a heading level in a query whose target this change moves (D2):

- `src/entities/coffeeshop/ui/CoffeeshopCard.test.tsx`: `level: 3` → `level: 2`.
- `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx`: the offering card queries `level: 3` → `level: 2`.
- `src/pages/evaluations-list/ui/EvaluationsList.test.tsx`: the row queries `level: 3` → `level: 2`; the list heading query `level: 2` → `level: 1`.
- `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`: `level: 3` → `level: 2`.

The build lists any other query it has to swap, and every QA copy that targets the old levels (not edited), in its final report.

## Risks / Trade-offs

- A level-2 query on a page that also renders another `h2` (for example an open confirmation dialog's title) can match more elements than before; the build narrows such a query with the heading's name rather than changing what it asserts.
- Some screen readers read a polite region's content when it is inserted; the overlay region mounts with the current count when the overlay opens, so a reader may hear the count once on opening.

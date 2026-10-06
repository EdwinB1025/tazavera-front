## 1. Types

No type is derived from `src/shared/api/schema.ts`; this group declares the UI-specific types of design.md "Types".

- [x] 1.1 Declare the UI types before their components: `present: boolean` and `register: () => () => void` in `SidebarContextValue` (`src/shared/ui/Sidebar.tsx`, not yet provided: the provider keeps compiling by supplying `present: false` and a no-op `register` until task 2.2), the exported type `AppSidebarContextValue = { session: Session; entries?: ReactNode; toggleLabel: string }` in a new `src/widgets/app-sidebar/ui/AppSidebarContext.tsx` (type only), and `leading?: ReactNode` in `AppHeaderProps` (unused until task 5.2). Commit `feat(app-shell): add types for the sidebar context`. Verify: `npx tsc --noEmit`, `npm run lint` and `npm run test:run` pass.

## 2. Sidebar state, presence and scope (shared)

design.md D3, D8; spec "Management sidebar" (Expanded on arrival, Closed on arrival), "Sidebar entry presentation" (Focus inside the sidebar).

- [x] 2.1 Write the tests in `src/shared/ui/Sidebar.test.tsx` (test before implementation), with `window.matchMedia` mocked per case:
  - desktop (`matches: false`): `Sidebar` renders an `<aside>` (role `complementary`) named by its `label`, with `id` equal to the exported `SIDEBAR_ID`, its class containing `variant-inverse`, and `SidebarTrigger` reports `aria-expanded="true"` on mount; the existing case "is collapsible from md" keeps passing unchanged;
  - mobile (`matches: true`): on mount no `dialog` is in the document and `SidebarTrigger` reports `aria-expanded="false"`; activating it opens the `dialog` (id `SIDEBAR_ID`, its inner container's class containing `variant-inverse`); toggling there does not change the desktop state (switch the mock back to desktop and the column is still expanded);
  - presence: a probe component calling `useSidebar()` inside `SidebarProvider` reads `present === false` with no `Sidebar` mounted, `true` once a `Sidebar` is mounted (also while collapsed from `md`, when it renders nothing) and `false` again after it unmounts;
  - `src/shared/ui/index.test.tsx` (or the existing exports test): `useSidebar` and `SIDEBAR_ID` are exported from `@/shared/ui`.
  Verify: `npm run test:run` fails only on these new assertions and the missing `SIDEBAR_ID` export.
- [x] 2.2 Implement design.md D3 and D8 in `src/shared/ui/Sidebar.tsx` (two states, `register`/`present`, `SIDEBAR_ID`, `<aside aria-label={label}>` root, `variant-inverse` on the root and the sheet container) and export `useSidebar` and `SIDEBAR_ID` from `src/shared/ui/index.ts`. Verify: `npm run test:run` passes completely (the color, radius, focus and client-boundary guards included); `npm run lint` and `npx tsc --noEmit` are clean.

## 3. Sidebar entries (shared)

design.md D7, D10; spec "Sidebar entry presentation" (Entry is a link, Current entry marked, Entry hover label).

- [x] 3.1 Write the tests in `src/shared/ui/Sidebar.test.tsx` (test before implementation): `SidebarMenuButton` without `asChild` renders a `button` whose class contains `hover:bg-nav-hover` and `hover:text-nav-text-hover`; with `asChild` and an `<a href="/es/manage/offerings" aria-current="page">` child it renders that anchor (no `button`) carrying the menu button classes (both hover classes included), `data-active` from `isActive`, the `aria-current` the child set, and, given `icon`, an `svg` inside the anchor before its label text. If `add-specialist-evaluations` already added the link form (design.md D10), keep its test and add only the missing assertions. Verify: `npm run test:run` fails only on the new assertions (none if the form already satisfies them, in which case note it in the commit body).
- [ ] 3.2 Implement design.md D7 in `SidebarMenuButton` (`hover:text-nav-text-hover`; `asChild` with `Slot.Root` and `Slot.Slottable` from `radix-ui`), or complete the existing link form per D10. Verify: `npm run test:run` passes completely; `npm run lint` and `npx tsc --noEmit` are clean.

## 4. Sidebar frame at shell level

design.md D4, D5, D10; spec "Shell layout and main area", "Management sidebar" (Shown on a management route, Hidden outside the management area, No entries contributed).

- [ ] 4.1 Write the tests (test before implementation):
  - Rewrite `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` to the frame API (no `session`/`toggleLabel` props; a test helper wraps it in `SidebarProvider` and `AppSidebarProvider`): the frame renders a `complementary` landmark named by the provider's `toggleLabel` and a collapse button with that name; on `/es/manage/offerings` with an authenticated session it renders a `navigation` holding the provider's entries followed by the `entries` prop, and an empty `navigation` when neither is given ("No entries contributed"); on `/es/offerings` with an anonymous session it renders the frame, its `children`, and no `navigation`; it renders `children` after the navigation.
  - New `src/widgets/app-sidebar/ui/DefaultSidebar.test.tsx`: the four cases of today's visibility rule move here unchanged in substance — shown for an authenticated session on `/es/manage/offerings` and `/es/manage/evaluations`, nothing on `/es` and `/es/account/profile`, nothing for an anonymous session on `/es/manage/evaluations`.
  - `src/app/shell/AppShell.test.tsx`, named updates: "holds the content in one column when no sidebar is present" asserts no `complementary` landmark and the placeholder child inside `main` (it no longer asserts the absence of `md:flex`); "gives the sidebar its own column beside the content from md" passes `<AppSidebar />` as `sidebar` and asserts `main` contains `md:flex` and a `complementary` landmark whose class contains `hidden` and `md:flex` and `w-64` (the `Sidebar` root), instead of the old `md:block` column; "labels the sidebar collapse control from the catalog in es, en and ca" keeps its assertions. If `add-specialist-evaluations` already wired role entries in `SessionShell`, keep its cases and point them at the provider (design.md D10).
  Verify: `npm run test:run` fails only on these new or changed assertions and the missing `DefaultSidebar`/`AppSidebarProvider` exports.
- [ ] 4.2 Implement design.md D4 and D5: `AppSidebarProvider` and its hook in `AppSidebarContext.tsx`, the `AppSidebar` frame, `DefaultSidebar`, exports in `src/widgets/app-sidebar/index.ts`, and `SessionShell` rendering `SidebarProvider` > `AppSidebarProvider` around the chrome and `main`, the region `sidebar ?? <DefaultSidebar />` in a plain `shrink-0` column and `main` always `md:flex`. Verify: `npm run test:run` passes completely; `npm run lint` and `npx tsc --noEmit` are clean.

## 5. Re-open control

design.md D3, D6; spec "Sidebar re-open control".

- [ ] 5.1 Write the tests (test before implementation):
  - `src/widgets/app-header/ui/AppHeader.test.tsx`: given `leading`, the header renders it first in its left group, before the logotype link; without it the left group is unchanged.
  - New `src/widgets/app-sidebar/ui/SidebarReopenControl.test.tsx` (inside `SidebarProvider` and `AppSidebarProvider`): desktop with no `Sidebar` mounted → nothing; desktop with a mounted, expanded `AppSidebar` → nothing; after activating the frame's collapse button → a button named `toggleLabel` with `aria-expanded="false"`, `aria-controls` equal to `SIDEBAR_ID`, class containing the `nav-button` variant classes (`bg-nav-button-bg`), and it has focus; activating it → the frame is expanded, the control is gone and focus is on the frame's collapse button; mobile (`matchMedia` matching) with a mounted sidebar → the control is shown while the sheet is closed, opens the `dialog`, and closing the dialog with Escape returns focus to it.
  - `src/app/shell/AppShell.test.tsx`: with `/es/manage/offerings` and an authenticated session, collapsing the sidebar shows the header's re-open control named by `toggleSidebar` of the locale, for `es`, `en` and `ca`; on `/es` with an authenticated session no button named `toggleSidebar` exists.
  Verify: `npm run test:run` fails only on these new assertions and the missing `SidebarReopenControl` export.
- [ ] 5.2 Implement design.md D6: `SidebarReopenControl` (exported from `@/widgets/app-sidebar`), the focus moves of D6, `AppHeader`'s `leading` slot, `ShellChrome` forwarding it, and `SessionShell` passing `<SidebarReopenControl />`. Verify: `npm run test:run` passes completely; `npm run lint` and `npx tsc --noEmit` are clean.

## 6. The `@sidebar` slot

design.md D1, D2, D9; spec "Management sidebar" (Shown on the offerings list, Sidebar follows in-app navigation, Unknown route stays not found). Read the Next.js guides cited in design.md Context before writing the route files.

- [ ] 6.1 Write the screen tests (test before implementation): `src/pages/default-sidebar/ui/DefaultSidebarScreen.test.tsx` renders the `DefaultSidebar` rule (authenticated on `/es/manage/offerings` → a `complementary` landmark; `/es/about` → nothing); `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.test.tsx`, on `/es/offerings`, renders the `complementary` landmark with no `navigation` for an anonymous session, for a `loading` session and for an authenticated `coffeeshop` session. Both inside `SidebarProvider` and `AppSidebarProvider`. Verify: `npm run test:run` fails only on the missing `@/pages/default-sidebar` and `@/pages/offerings-sidebar` modules.
- [ ] 6.2 Implement the two page slices and the route files of design.md "Files": `app/[locale]/@sidebar/default.tsx`, `app/[locale]/@sidebar/[[...rest]]/page.tsx`, `app/[locale]/@sidebar/offerings/page.tsx` (each only renders its screen), `app/[locale]/default.tsx` (calls `notFound()`), and `app/[locale]/layout.tsx` passing the `sidebar` slot to `AppShell`. Verify: `npm run test:run` passes; `npm run lint` and `npx tsc --noEmit` are clean after `npx next typegen` (the slot appears in `LayoutProps<"/[locale]">`).
- [ ] 6.3 Check the routing end states (no file changes; checked off in the next commit). Run `npm run build` (passes; no error about slots mixing static and dynamic rendering), then `npm run start` and: `curl -s -o /dev/null -w "%{http_code}"` answers 200 for `/es` and `/es/about` and 404 for `/es/nope`; the HTML of `/es` and `/es/about` contains no element with `id` equal to `SIDEBAR_ID`. In a browser at 1280px: from `/es/about`, the header shows no re-open control. `/es/offerings` answers 404 until `add-offering-catalog` adds the route (design.md D9); note it in the final report.

## 7. Integration checks

- [ ] 7.1 Run `npm run test:run`, `npm run lint`, `npx tsc --noEmit` and `npm run build` on the branch: all four pass, the color, radius, focus, client-boundary and catalog guards included. Check off 6.3 and 7.1 in a commit containing only the checkboxes, `chore(app-shell): complete tasks for add-sidebar-slot`.

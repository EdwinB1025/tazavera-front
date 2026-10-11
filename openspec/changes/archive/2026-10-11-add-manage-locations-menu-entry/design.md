## Context

Backlog entry R67 settles the change: for the `coffeeshop` role the user menu adds "Manage locations" right after "Manage offerings", pointing at `/{locale}/manage/locations`, with an icon from `src/shared/ui/icons.ts`, the look of the other entries, and texts in the shell catalogs. The user menu (`src/widgets/app-header/ui/UserMenu.tsx`) lists one management entry per role today; its texts arrive as props from `AppShell`, which reads the `shell` catalog.

## Goals / Non-Goals

**Goals:** the coffee shop reaches Manage locations from the user menu on every viewport.

**Non-Goals:** no change for other roles, to the management sidebar, to the Manage locations screen or to any request.

## Decisions

### D1 — One entry in the user menu covers the mobile submenu

The header has one user menu on every viewport; below `md` it opens from the initials circle alone (spec "Initials circle alone on a small viewport"). The small-viewport navigation menu lists only the primary navigation. So the entry is added once, in the user menu, as a menu item over `next/link` right after "Manage offerings", and only when `user.role` is `coffeeshop`. It reuses the entries' existing markup, so it takes the header menu entry treatment unchanged.

### D2 — Icon and texts

- Icon: `MapPin`, already exported by `src/shared/ui/icons.ts` and already shown by the Manage locations sidebar entry, so the same destination keeps one icon.
- Text key `manageLocations` in `messages/{es,en,ca}/shell.json`, with the wording of the Manage locations sidebar entry: es "Administrar ubicaciones", en "Manage locations", ca "Administra les ubicacions". `UserMenuTexts` and `AppHeaderTexts` gain `manageLocations: string`; `AppShell` passes `texts.manageLocations`.

## Risks / Trade-offs

- None: the change adds one conditional menu item and one text; other roles render exactly as before.

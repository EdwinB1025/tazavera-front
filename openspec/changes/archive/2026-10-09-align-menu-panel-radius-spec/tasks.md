# Tasks

## 1. Verify existing code

- [x] 1.1 Confirm that the code and tests already match the amended requirement: in `src/shared/ui/DropdownMenu.tsx` the card panel carries `rounded-container` and the nav panel `rounded-field`; `src/shared/ui/Select.tsx` and `src/shared/ui/Combobox.tsx` panels carry `rounded-field`; their tests assert those classes. Run, each on its own: `npm run test:run`, `npx tsc --noEmit`, `npm run lint`. Expected: every one exits 0 and no file changes. This task changes no files: check it off in a commit containing only the checkbox, `chore(base-controls): complete tasks for align-menu-panel-radius-spec`.

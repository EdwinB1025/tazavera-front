## Context

See proposal.md (Why) and backlog entry R85, whose settled end state this design implements. Current state:

- `src/app/styles/globals.css` (app layer) holds the design tokens and one `@layer base { ... }` block with the dark theme's variables. Tailwind 4's preflight gives buttons the default cursor.
- Only `BeanScale`, `DescriptorChipGroup`, `FlavorWheelChart`, `FlavorWheelNoteList`, `IntensitySlider`, `Tabs` and `facet-row` set `cursor-pointer`; their tests assert it.
- Disabled controls set `disabled:cursor-not-allowed` or `cursor-not-allowed` (base-controls "Action button interaction states", form-fields disabled states). The busy action button sets `aria-disabled="true"`, not the native `disabled`.
- `src/shared/ui/DropdownMenu.tsx` (item variants `card` and `nav`) and `src/shared/ui/ComboboxPopup.tsx` (`OPTION_CLASSES`) set `cursor-default`, a utility that would override a base-layer rule. Radix menu items mark a disabled item with `data-disabled=""` and set no attribute when enabled; cmdk options always carry `data-disabled`, `"true"` or `"false"`, and `aria-disabled` with the same value.

API endpoints: none. No derived API type is needed.

## Goals / Non-Goals

**Goals:** R85's end state, from one base-layer rule plus the removal of the three `cursor-default` tokens.

**Non-Goals:** no change to the controls that already set `cursor-pointer`, to `data-disabled:pointer-events-none`, to the dark theme's base block or to any other file.

## Decisions

### D1 — One base-layer rule with the disabled exclusions

`globals.css` gets its own `@layer base { ... }` block, after the dark theme's block, introduced by a comment naming R85's end state. It holds exactly this rule:

```css
:is(
    a[href], button, summary, label[for], select,
    input:is([type="checkbox"], [type="radio"], [type="range"], [type="submit"], [type="button"], [type="reset"]),
    [role="button"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"],
    [role="option"], [role="switch"], [role="checkbox"], [role="radio"]
):not(:disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"])) {
    cursor: pointer;
}
```

Utilities sit in a later cascade layer than base, so `disabled:cursor-not-allowed`, `cursor-not-allowed` and the existing `cursor-pointer` classes keep winning. The select trigger is a `button` (with role `combobox`), so it is reached as a button; the combobox's text input carries role `combobox` and is not named, so it keeps the text cursor, as do text inputs and textareas.

The data-attribute exclusion reads "`data-disabled` present and not `false`" instead of a bare `[data-disabled]`: cmdk writes `data-disabled="false"` on every enabled option, so a bare `[data-disabled]` would leave every enabled combobox option without the pointer, against the end state. A disabled cmdk option also carries `aria-disabled="true"`, and a disabled Radix item carries `data-disabled=""`; both stay excluded.

Alternative considered: a bare `[data-disabled]` as listed in the backlog's rule shape; rejected for the reason above.

### D2 — Menu items and combobox options take the base rule

The `cursor-default` token is removed from the `card` and `nav` item variants of `src/shared/ui/DropdownMenu.tsx` and from `OPTION_CLASSES` in `src/shared/ui/ComboboxPopup.tsx`; nothing else in those files changes, `data-disabled:pointer-events-none` included. These three removals are the only edits outside `globals.css`.

## Risks / Trade-offs

- [The `:is()` / `:not()` selector lists are rewritten by the CSS build] → `npm run build` must succeed; the scenario test reads the source stylesheet, not the built one.
- [A clickable element outside the named roles and elements] → it would keep the arrow; the backlog's rule shape names the set, and anything beyond it is reported, not added.

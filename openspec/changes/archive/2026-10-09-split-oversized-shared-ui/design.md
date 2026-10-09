# Design

Sources: technical review 2026-10-09 (`docs/review/technical-review-2026-10-09.md`), top risk 6 and Appendix B.1/B.2; the AGENTS.md size limits; the `form-fields` requirements "Checkbox", "Radio group", "Bean scale", "Intensity slider" and "Descriptor chip group"; the `offering-catalog` requirements "Map interaction and accessibility" and "Selected location panel". Fast lane: no design folder.

## Context

`npm run lint` on `develop` reports, under `src/shared/`, eight size or complexity warnings in `src/shared/ui`: `BeanScale` (135 lines), `Checkbox` (complexity 19), `Combobox` (183 lines, complexity 27), `DescriptorChipGroup` (124 lines), `IntensitySlider` (99 lines), `LocationsMap` (147 lines), `RadioGroup` (108 lines, complexity 18) and `ScoreRangeFacet` (95 lines). No file is over 300 lines. `Combobox` and `ScoreRangeFacet` are out of scope.

`Checkbox`, `RadioGroup`, `BeanScale`, `IntensitySlider` and `DescriptorChipGroup` each compute `hasHelp` / `hasError` (an empty string is not a message), the help and error ids, and render the help paragraph (`type-meta mt-1`) before the error paragraph (`type-error mt-1`); the facet-row presentation of `Checkbox` and `RadioGroup` appends `FACET_MESSAGE_CLASSES`.

## Goals / Non-Goals

**Goals:** every unit of the scope at most 80 lines and complexity at most 15, every file at most 300 lines, with no lint warning left in the scope; identical props, exports, DOM, classes, texts, accessible names and emitted values.

**Non-Goals:** no change to `src/shared/ui/index.ts`, the facet and filter files, any consumer, message key or test.

## API

None. The units consume no endpoint.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/ControlMessages.tsx` | shared (ui) | New | `useControlMessages` and `ControlMessages` (D2) |
| `src/shared/ui/Checkbox.tsx` | shared (ui) | Modified | D3 |
| `src/shared/ui/RadioGroup.tsx` | shared (ui) | Modified | D4 |
| `src/shared/ui/RadioOptionRow.tsx` | shared (ui) | New | One radio option (D4) |
| `src/shared/ui/BeanScale.tsx` | shared (ui) | Modified | D5 |
| `src/shared/ui/BeanScaleBeans.tsx` | shared (ui) | New | The read-only and the interactive bean rows (D5) |
| `src/shared/ui/IntensitySlider.tsx` | shared (ui) | Modified | D6 |
| `src/shared/ui/IntensitySliderParts.tsx` | shared (ui) | New | The read-only and the interactive track, and the scale (D6) |
| `src/shared/ui/DescriptorChipGroup.tsx` | shared (ui) | Modified | D7 |
| `src/shared/ui/DescriptorChipRows.tsx` | shared (ui) | New | Chip content, row, read-only rows and toggle rows (D7) |
| `src/shared/ui/LocationsMap.tsx` | shared (ui) | Modified | D8 |
| `src/shared/ui/LocationsMapPanel.tsx` | shared (ui) | New | The selected-location panel (D8) |
| `src/shared/ui/locations-map-view.tsx` | shared (ui) | New | Creating the Leaflet map, its view and its markers (D8) |

No test file and no route file changes.

## Decisions

### D1 — Placement and imports

Every new unit is a sibling file in `src/shared/ui`, imported by relative path, never through the segment's public index, which does not change (no new unit is imported by another slice). A new file with hooks, handlers or browser APIs starts with `"use client"`, as the file it comes from.

### D2 — Shared help and error messages

`useControlMessages(help, error)` returns the two generated ids, `hasHelp`, `hasError` (null, undefined and the empty string are not messages) and `describedBy` (help id before error id, `undefined` when neither). `ControlMessages` renders the help paragraph then the error paragraph with exactly today's ids and classes, an optional extra class appended (`FACET_MESSAGE_CLASSES` in the facet-row presentation). Each control keeps the order of its `useId` calls.

### D3 — Checkbox

The box class list (box treatment, border by state, consumer class) moves to a helper beside the component; the messages render through D2. `Checkbox` keeps `useFieldControl` and its props.

### D4 — Radio group

The inner `renderOption` becomes `RadioOptionRow`, receiving the option, the group's name, value, default value, change handler, required, disabled, error state and presentation; the messages render through D2.

### D5 — Bean scale

The read-only meter row (with the partial bean cut) and the interactive Radix row (with its key handler and refs) become two components, one per variant; `BeanScale` renders the label, the chosen row, the value text and the messages (D2). `scoreForKey` moves with the interactive row.

### D6 — Intensity slider

The read-only meter track and the interactive range track become two components sharing the gradient and off layers; the marks and scale labels become one component. `IntensitySlider` renders the header, the chosen track, the scale and the messages (D2).

### D7 — Descriptor chip group

`ChipContent` and `Row` move to a sibling file with two new components, one per variant: the read-only chosen rows (or the empty text) and the toggle-group rows with their key handler. `DescriptorChipGroup` renders the fieldset, legend, the chosen variant and the messages (D2).

### D8 — Locations map

The selected-location panel becomes `LocationsMapPanel`. Creating the map (options, reduced motion), setting its view and adding the named, wired markers moves to a function in `locations-map-view.tsx` that the mount effect calls and whose returned cleanup it returns. `LocationsMap` keeps its state, refs, effects, zoom buttons and attribution.

## Risks / Trade-offs

- Moving `useId` calls into a hook could reorder the generated ids; D2 keeps each control's call order, and no test asserts a generated id value.

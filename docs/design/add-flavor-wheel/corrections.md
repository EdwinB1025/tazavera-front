# Corrections — add-flavor-wheel

## Round 1

Product owner's review of the visual verification captures, 2026-10-06. Item 8 was decided by the orchestrator while Product owner was away (overnight mandate); Product owner may reopen it.

1. The note list is collapsed by default, behind a visible expand control (a button with an accessible name, `aria-expanded` and `aria-controls`). The user can expand and collapse it. Only the note list collapses: the description panel is never collapsed and stays beside the wheel.
2. With the note list collapsed, the wheel gains prominence and grows in size: the wheel takes the space the collapsed list leaves (the `max-w-100` / 25rem cap of design-summary §6.2 is raised accordingly). The architect settles the new size and breakpoints in design.md.
3. Every segment carries its label (supersedes the fit rule's "no label" outcome of design-summary §4.2 and Open 13's "no label" branch).
4. A visible gap separates each segment from its neighbours, for aesthetics (in place of or in addition to the 2-unit `stroke-surface-card` separator).
5. The centre hole is larger.
6. Each label is arched: it follows the curve of its segment, set along the segment's outer edge (supersedes the tangential and radial orientations of design-summary §4.2).
7. Each ring is thinner (ring height reduced).
8. A label that does not fit even when arched on a very narrow segment shows its name only while that note is active (hover, focus or activation): it is never truncated with an ellipsis (Open 13 keeps forbidding the ellipsis) and the font size is not reduced. The note list and the description panel keep carrying every name, so no note becomes unreachable.

Unchanged: the colour rule (design.md D4), the keyboard model (D6), the description panel content (D7), the empty state, the texts and the contrast gates. A new or changed colour pair, if any, is measured and registered as the existing gates require.

### Status

2026-10-06. `openspec validate add-flavor-wheel --strict`: valid with `@fission-ai/openspec@1.13.2` (the version the project's skills were generated with). With `@latest` (1.14.1) it reports one WARNING, "Flavor wheel" requirement text over 500 characters, which predates this round (the same result on `9002291`); this round adds no new warning (its disclosure text is its own requirement).

1. spec.md: new requirement "Flavor wheel note list disclosure" with "Note list collapsed at first" and "Expanding and collapsing the note list"; "One tab stop" now reads "the expanded list". design.md: D1 (`FlavorWheelTexts.notesToggle`), D7 "Note list disclosure", D8 (control's row treatment), D9 (new text `notesToggle`, proposed host key `wheelNotes`: es "Notas", en "Notes", ca "Notes", Product owner's to confirm); proposal.md requirement list. Tasks 8.1, 8.2.
2. design.md D8: cap 25rem → 32rem, column 1 `minmax(0, 32rem)`, column 2 `minmax(16rem, 1fr)`, breakpoint unchanged at 42rem; 291px at 375px, 512px at 1280px. Tasks 9.1, 9.2.
3. spec.md: "Labels only where they fit" replaced by "Every segment carries an arched label"; "Every note is reachable" reworded. design.md D5 (`fitLabel` loses `"none"`). Tasks 10.1, 10.2 (with correction 6).
4. spec.md: new scenario "Segments separated by a gap". design.md D5: separator stroke 2 → 4 units, `stroke-surface-card`. Tasks 11.1, 11.2.
5. design.md D5 ring table: hole 40 → 80. Tasks 12.1, 12.2 (with correction 7).
6. design.md D5 "Arched labels": `<textPath>` along `labelPath`, name on the outer line at `labelRadius`, upright flip at mid-angle 90°–270°, arc-length fit rule; `labelPlacement` removed. Tasks 10.1, 10.2.
7. design.md D5 ring table: `D` = 0: 80–200; `D` = 1: 80–140, 140–200; `D` = 2: 80–120, 120–160, 160–200. Tasks 12.1, 12.2.
8. spec.md: new scenario "Name shown on activation when it cannot fit". design.md D5 "Name shown on activation": name alone on a half-circle path, `fill-text-primary` with a 4-unit `stroke-surface-card` halo, so it uses the registered `text-primary`/`surface-card` pair; no new colour pair or token. Tasks 13.1, 13.2.

Round verification: tasks 14.1 (checks) and 14.2 (captures, design lead).

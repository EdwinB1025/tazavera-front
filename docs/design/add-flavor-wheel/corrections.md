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

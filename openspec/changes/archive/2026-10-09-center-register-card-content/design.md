# Design

## Context

`RegisterClient` renders one section card whose content is a `w-full md:max-w-160` column (`widen-account-cards`, R51). The column is start-aligned, so on wide screens the form sits to the left of the card. Product owner decided on 2026-10-09 that it is centred from the medium breakpoint.

## Decisions

### D1. Centre the existing column from the medium breakpoint

The column keeps `w-full md:max-w-160` and gains a horizontal auto-margin utility prefixed with `md:`, so the 40rem column is centred with equal space on both sides from `md` and stays full width below it. The section card, its padding and the account page's start-aligned columns do not change. No token is added.

## Risks / Trade-offs

None: one class on one element; the existing registration test covers it.

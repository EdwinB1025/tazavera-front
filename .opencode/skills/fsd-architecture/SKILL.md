---
name: fsd-architecture
description: Feature-Sliced Design details for tazavera-front. Use when deciding in which layer or slice a file goes, creating a new slice, or writing imports between slices. Complements the architecture rules in AGENTS.md.
metadata:
  opencode/slash: "true"
---

# Feature-Sliced Design details

The layer order, the import direction and the Next.js routing rules are in AGENTS.md. This skill adds what AGENTS.md does not cover.

## What each layer holds

| Layer | Slices? | Holds |
|---|---|---|
| `src/app` | No | Providers, global styles, app-wide setup and layout wiring |
| `src/pages` | Yes | One screen per route. Composition only |
| `src/widgets` | Yes | Self-contained blocks that combine several features or entities |
| `src/features` | Yes | User actions with business value (filter, create, submit) |
| `src/entities` | Yes | Business concepts: their data, how they look, their rules |
| `src/shared` | No | Business-agnostic code, split into segments: `ui`, `api`, `lib`, `config` |

## Slices and public API

- Every slice exposes a public API in `index.ts` at its root. Export only what other layers may use.
- Import a slice only through that public API: `@/entities/offering`, never `@/entities/offering/ui/OfferingCard`.
- Layers without slices (`app`, `shared`) are imported by segment: `@/shared/ui`, `@/shared/api`.

## Segments inside a slice

Create a segment only when the slice needs it:

- `ui/` components
- `model/` state, types and business logic
- `api/` requests specific to this slice
- `lib/` helpers used only by this slice

Tests live next to the file they test: `OfferingCard.test.tsx`.

## Where does it go?

Ask in this order and stop at the first yes:

1. Is it a full screen? `pages`.
2. Does it combine several features or entities into one block? `widgets`.
3. Is it something the user does (an action with business value)? `features`.
4. Does it represent a business concept (data, appearance, rules)? `entities`.
5. Is it generic and business-agnostic? `shared`.

## UI components: generic part and business part

Split every UI piece in two:

- The generic part, with no business knowledge (buttons, inputs, card shells with sections, layout shells, navigation shells), lives in `src/shared/ui`.
- The business part, which fills a generic block with real data, lives in the layer that owns that data: `entities` for one concept, `features` for a user action, `widgets` for a block that combines several (e.g. the app header with its navigation, a filters panel).

## Naming

- Slice names use the business domain in kebab-case.
- Entities are singular nouns: `offering`, `evaluation`.
- Features are verb-object: `filter-offerings`, `create-evaluation`.
- Named API type aliases are exported from `src/shared/api/index.ts`, built on top of the generated `schema.ts`.
# Proposal

## Why

The token layer (`add-theme-tokens`, merged) gives Tazavera its colors, themes and typographic roles, but nothing consumes it yet: there is no component layer. Screens cannot be built until action controls exist with consistent shape, states and accessibility. This change lays the first block of that layer — the action controls every screen needs (button, link), the corner-radius system shared by all later components, and a single icon entry point. It is change 1 of the component roadmap.

## What Changes

- **Button action control**: variants `primary`, `action-1`…`action-4`, `nav-button` (existing semantic tokens); sizes `base` (`h-10`, `px-4`) and `sm` (`h-8`, `px-3`); states rest, hover, `focus-visible`, disabled and loading; optional icon (16px, `gap-2`); icon-only form (square `w-10`/`w-8`) requiring an accessible label. Loading keeps the label, disables the button and announces `aria-busy="true"`; no spinner animation under `prefers-reduced-motion`.
- **Link action control**: internal routes only (`next/link`), always underlined, with a `back` variant (arrow icon + text); states rest, hover, `focus-visible`.
- **Radius token family** (new tokens only, no existing token modified): `radius-pill`, `radius-container`, `radius-field`, `radius-check`. Values live in the theme layer and are reassigned per theme: rounded in the traditional theme, `0` in the dark theme.
- **Icon entry point**: one `shared` entry point through which all icons are consumed — `lucide-react` icons now; the project's own SVGs (app logo, coffee-bean) join it in later changes.
- **Verification**: the theme-token test harness gains a radius completeness check (every radius token defined in both themes) and the documented `nav-button` focus pairs.

No breaking changes: existing tokens, utilities and tests keep their current meaning.

## Capabilities

### New Capabilities

- `base-controls`: action controls (button, link) — their variants, sizes and interaction states — plus the corner-radius token family shared by all components and the single icon entry point.

### Modified Capabilities

None. The `theming` requirements are unchanged; radius is specified under `base-controls` per the capability split.

## Out of Scope (non-goals)

- Data-entry controls — field, input (incl. password reveal), select, textarea, checkbox, radio — and their inverse variant: change `add-form-fields`.
- Inverse-surface tokens (`border-inverse`, `text-placeholder-inverse`, `focus-ring-inverse`, `focus-offset-inverse`) and `checked-mark`: change `add-form-fields`.
- Coffee-bean scale and intensity slider: change 2.
- Facet subcomponents — combobox, range, chips, show more, taxonomy cascade, facet option rows: change 3.
- Feedback components — badge, callout, toast, modal, empty state: change 4.
- Content containers — card, collapsible, tabs, label/value row, pagination: change 5.
- Layouts, sidebar/header placement and app logo: change 6 (`app-shell`). If a later change places `nav-button` on the dark sidebar, its focus treatment is revisited there.
- Labels, help texts and error copy: each consuming capability supplies them.
- External navigation (e.g. the OAuth redirect to the authorization server): handled by the component that needs it, not by Link.

## Impact

- **Code (all under `src/`)**: new files in `src/shared/ui` — Button, Link and the icon entry point (FSD layer `shared`); modified: `src/app/styles/globals.css` (four radius tokens added; no existing token modified) and `src/app/styles/theme-tokens.test.ts` (radius completeness check, `nav-button` focus pairs).
- **Dependencies**: `lucide-react` added to `package.json` (approved by the product owner). No other dependency changes.
- **API**: none. This change consumes no API endpoints and touches no generated types; controls take their content as props supplied by consuming capabilities.
- **Existing behavior**: unchanged. No screen consumes the new controls yet; placement happens in later changes.

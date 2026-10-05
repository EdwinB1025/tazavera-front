# Design

## Context

See `proposal.md` — Why. The constraints that shape the approach:

- The design summary (`docs/design/refine-app-header/design-summary.md`, sections 7 and 8) settles every product decision. This document works out the implementation and records what the summary leaves open.
- One capability, `app-shell`. `base-controls` and `theming` requirements are unchanged; `contracts/openapi.yaml` and `src/shared/api/schema.ts` are not touched.
- The shared menu was pulled by `add-app-shell` from the shadcn registry (Radix base) and remapped to semantic and radius tokens. `radix-ui ^1.6.7` and `lucide-react ^1.49.0` are already installed; no dependency changes.
- `cn` (`src/shared/lib/utils.ts`) is a plain joiner with no tailwind-merge, so a caller's `className` cannot override the treatment classes baked into a shared component (explore finding F3). Any treatment swap must happen inside the component.
- The guard tests enforce the project conventions and must stay green: `color-guard.test.ts`, `radius-guard.test.ts`, `focus-guard.test.ts`, `icons.test.ts`, `xss-guard.test.ts`, `client-boundary.test.ts`, `catalog-guard.test.ts` and `src/app/styles/theme-tokens.test.ts`.
- Tailwind 4.12 (`tailwindcss ^4`) generates every utility from `@theme` variables and `@utility` roles in `src/app/styles/globals.css`; there is no `tailwind.config`.

## Goals / Non-Goals

**Goals:**

- Two header controls that read as one family with the header they sit in, in both themes.
- The dark avatar defect closed by moving the avatar tokens' dark values onto the "Sign in" pair and adding the single boundary token the failing fill pair requires.
- The menu semantics carry the accessibility weight (single-choice language list, per-language `lang`), with no new dependency.

**Non-Goals:**

- Any change to the traditional theme's rendering, or to any token outside the avatar tokens of D5 and their one new boundary token.
- Any change to the shared menu's default rendering (the card surface other screens will use).
- Making the header's primary navigation links part of this refinement (out of scope per design summary §1).

## Decisions

### D1 — One capability; header menu triggers are not action controls

The `app-shell` delta states the rule (spec: "Header menu triggers") and `base-controls` gets no delta. The alternative — a reusable ghost/header-control treatment in `base-controls` — was rejected: it would add a second capability and a reusable treatment no other change needs yet (design summary §8). The trigger shape (non-square from `md`, no fill) is therefore covered by `app-shell` alone.

### D2 — The shared menu gains a `surface` variant; the nav surface is a second class set

`src/shared/ui/DropdownMenu.tsx` gains `surface?: "card" | "nav"` on `DropdownMenuContent`, default `"card"` (design summary §8: "Its defaults stay as they are"). Because `cn` does not merge classes, the surface selects between two complete class sets inside the component instead of letting callers override one set. The parts that carry treatment classes (content, the item family, label, separator, shortcut, sub trigger, sub content) read the surface from an internal React context provided by `DropdownMenuContent`, so a caller states it once per menu.

- **Card (default):** exactly today's classes.
- **Nav:** the panel takes `bg-nav-surface` and `text-nav-text` in place of `bg-surface-card` and `text-text-primary`, and `rounded-field` in place of `rounded-container` (design summary §8: `radius-field` in the nav variant only). Its boundary (`border-border-strong`), shadow, `min-w-48`, `p-1` and `z-50` are unchanged. The rows take the typographic role `type-navlist-item` — which binds `nav-text`, so one class owns the colour — with `nav-text-hover` text over `nav-hover` on hover and focus, and keep `rounded-field`.

`type-control` is deliberately not reused for nav rows: it binds `text-strong`, and pairing it with an explicit `text-nav-text` would put two colour declarations on one element with the cascade deciding. `type-navlist-item` is `theming`'s nav-row role and binds the token the design summary names. Label, shortcut and separator keep their current treatment; the header menus do not use them.

Both header menus pass `surface="nav"`.

### D3 — Ghost triggers switch content colour, with no fill in any state

Each trigger's content — icons, the name or the locale code, the chevron — takes `nav-text` and switches to `nav-text-hover` while hovered; focus stays the visible focus ring `base-controls` defines — the shared `focus-visible:focus-ring` (`theming`, "Shared focus indicator"), one ring with its offset from the focus tokens — and the trigger defines no focus of its own (spec: "Header menu triggers", the artifact review's condition on open reading 2; asserted in task 3.1). The trigger draws no fill and no border at rest **and none on hover** (spec: "Header menu triggers"). The design summary §2 calls this "header hover and focus treatment"; the header's own controls hover by switching only the text colour (the primary navigation links do exactly that) and sections 7 and 8 describe the hover as the `nav-text` → `nav-text-hover` switch, so no hover fill is added. See open item 2.

### D4 — User control content and breakpoints

The control is one trigger: an initials circle, and from `md` up the user's name (`data.name` + `data.surname`, the same string as the accessible name) and a `ChevronDown` after the circle; below `md` the circle alone (spec: "Name and chevron on a medium or larger viewport", "Initials circle alone on a small viewport"). The trigger is one hit target, so the circle's hover pair applies while the pointer is anywhere on the control (a `group` on the trigger, `group-hover:` treatment on the circle, or an equivalent the build chooses).

### D5 — One class list for the circle; the two arms are the avatar tokens' per-theme values

The circle carries **one** class list in both themes — `bg-nav-avatar`, `text-nav-text-dark`, the hover class of D4 resolving to `nav-avatar-hover`, and the boundary `border` (1px, the "Sign in" boundary width) with `border-nav-avatar-border` — and the theme difference lives entirely in the token values (artifact review of 2026-10-05, replacing the theme-scoped variant this decision first proposed):

- **Traditional values, unchanged:** `nav-avatar` `sage-800`, `nav-avatar-hover` `oxblood-800`, `nav-text-dark` `cream-100`, and `nav-avatar-border` **transparent**, so no boundary shows (the boundary width class is unconditional and only the colour is transparent).
- **Dark values, moved onto the "Sign in" pair (design summary §8):** `nav-avatar` `night-oxblood-700` (the `nav-button-bg` value), `nav-avatar-hover` `night-oxblood-800` (the `action-primary-hover` value), `nav-text-dark` `night-cream-100` (the value `nav-button-text` and `action-primary-text` share), and `nav-avatar-border` `night-cream-100` (the `nav-button-border` value).

`src/app/styles/globals.css` therefore changes by three reassigned dark values and one token defined in both themes: `--color-nav-avatar-border` as `transparent` in `@theme` and as `var(--color-night-cream-100)` in the dark block. Per-theme token values are the system's own vehicle for a theme-only change (`theming`, "Two complete color themes"), and `ThemeSelect` switches themes without a reload by flipping `data-theme` on the document root, so no class is chosen at render and no styling mechanism is added to the theme file.

One token is added because design summary §4's rule fires: the circle fill `nav-avatar` measures about 2.3:1 against `nav-surface` in the dark theme (the product owner's measurement in the artifact review), below the 3:1 a perceivable boundary needs, so the boundary is state-identifying and gets its token. In the traditional theme the fill measures ≈3.4:1 against `nav-surface`, which already identifies the circle, so the boundary is exempt there (`theming`, "UI boundary and focus contrast": borders whose component fill already identifies the component at 3:1 or more are exempt) and the token is transparent. The contrasts of every pair are recorded in D13.

One consequence is recorded: `nav-text-dark` also serves `type-sidebar-item`, `variant-inverse` and the inverse controls' hover border, so those shift to `night-cream-100` in the dark theme — a lighter text on the same dark surfaces, with every asserted pair (`nav-text-dark` on `nav-surface-dark` and `nav-current-dark`) measuring higher than before. The management sidebar's structure and behaviour stay untouched.

Alternatives rejected:

- **A theme-scoped variant in `globals.css`** (`@custom-variant theme-dark (&:is([data-theme="dark"] *));`), the first draft of this decision: rejected in the artifact review of 2026-10-05 — a new styling mechanism in the theme file where per-theme token values express the same thing.
- **A second new token for the initials text** (for example `nav-avatar-text`): the artifact review prescribes exactly one new token, the boundary, and moves the dark values of the existing avatar tokens instead; the initials keep `text-nav-text-dark` in the one class list.
- **Choosing the arm at render from the theme**: `ThemeSelect` switches the theme without a reload, so render-time classes would go stale — an objection to any class-level arm split, and not to per-theme token values.

### D6 — Language names are data; the shell composes the trigger's name

The languages' own names and their `lang` codes are data, not interface text (design summary §7). They live beside `locales.ts`:

```ts
// src/shared/config/locale-names.ts
import type { Locale } from "./locales";

export type LocaleName = { name: string; lang: string };

export const LOCALE_NAMES: Record<Locale, LocaleName> = {
  es: { name: "Español", lang: "es" },
  en: { name: "English", lang: "en" },
  ca: { name: "Català", lang: "ca" },
};
```

The `lang` values are each language's own BCP 47 tag, identical to the locale codes today; keeping them as data keeps routing codes and language identity separate.

The shell composes the trigger's accessible name as `"<catalog word>: <own name>"` — the example of design summary §3, "Language: Español" — in `src/app/shell/AppShell.tsx`, where the catalog and the active locale already meet, and passes one string down in the existing `languageSelector` slot of `AppHeaderTexts`. The widget never joins text, so "Localized interface texts" keeps holding. No message key changes.

### D7 — The language menu is a single-choice radio group

Each supported locale is one entry of a radio group (design summary §7): the current language is `aria-checked` and shows the check indicator, and no other entry is marked (spec: "Current language is marked"). The indicator takes the entry's text colour (`nav-text`, `nav-text-hover` on hover) through `currentColor` — no row background, no `nav-current`, no `nav-indicator`, no new tokens (design summary §8). Each entry shows its language's own name with its own `lang` attribute. Choosing an entry calls back with the locale; `src/app/shell/ShellChrome.tsx` keeps today's behaviour (same route under the new locale prefix). No flags (design summary §3).

### D8 — Icons

`Globe` and `ChevronDown`, re-exported from `src/shared/ui/icons.ts` (`ChevronDown` is already there; `Globe` is added). Both are present in the installed `lucide-react` (`declare const Globe` / `declare const ChevronDown` in `node_modules/lucide-react/dist/lucide-react.d.ts`). `Languages` was the alternative globe; `Globe` matches "globe icon" in design summary §3 and §7. Icons render with `currentColor`, so they follow the control's text colour (`base-controls`, "Shared icon source") — not `nav-icon`, which measures 2.57:1 on `nav-hover` in the traditional theme.

### D9 — The theme selector is restyled with the menu (case a)

Design summary §8 asks the propose to state which case applies: it is **case (a), a token/class change scoped to the selector**, so it is restyled with the menu and no backlog entry is opened. `src/widgets/app-header/ui/ThemeSelect.tsx` is a widget-local component whose whole treatment is its own `SELECT_CLASSES` constant and it does not use the shared `Select` control of `form-fields`; nothing outside the file changes.

It keeps its geometry (`h-10`, `w-full`, `px-3`, `rounded-field`, `focus-visible:focus-ring`) and takes the menu row treatment of D2 — `type-navlist-item` with `bg-nav-surface` and the `border-strong` boundary in place of `bg-surface-input` and its cream block — so no panel-coloured block sits inside the menu (spec: "Theme selector inside the menu"). Its behaviour (cookie, `data-theme`, fallback) is untouched.

### D10 — Types: data and UI-specific, defined before any component

`src/shared/api/schema.ts` is untouched and no derived API type is added: `Session`, `SessionUser` and `UserRole` from `src/shared/api` already carry everything the header reads. The change adds one data type (`LocaleName`, D6) and revises UI-specific prop types only — `LanguageSelectProps` (its `label` becomes the composed accessible name; the widget reads `LOCALE_NAMES` itself for the entries) and the `AppHeaderTexts` comment on `languageSelector`. Types are declared before the components that use them, in their modules.

### D11 — API endpoints consumed, and how errors reach the user

This change issues **no** request and adds no endpoint to what `add-app-shell` already documented. In full, for the design rule:

**`GET /user`** — issued by `add-auth`; this change keeps reading three fields of its payload through the session contract.

| | |
|---|---|
| Method and path | `GET /user` |
| Auth | `Authorization: Bearer <access token>`; scope `profile:read` or `profile:write` |
| Request | No parameters, no body |
| Response `200` | `{ "data": { "ulid": string, "name": string, "surname": string, "email": string, "role": string } }` |
| Errors | `401` when the token is missing, expired past refresh, or lacks the scope |

Field mapping (every piece of data the refined controls show):

| UI element | API field |
|---|---|
| Initials circle content | `data.name`, `data.surname` (first letters) |
| User control's visible name from `md` | `data.name`, `data.surname` |
| User control's accessible name | `data.name`, `data.surname` |
| Choice of management entry | `data.role` (`coffeeshop`, `specialist`) |

The language entries' names and `lang` codes are data of the front end (D6), not API fields. `data.ulid` and `data.email` stay unrendered.

**`{NEXT_PUBLIC_API_URL}/user/security`** — the API's web page (Fortify), opened as an external link from the user menu and rendered natively, unchanged from `add-app-shell`. It is intentionally absent from `contracts/openapi.yaml`.

**Error presentation.** The change shows no new API error: an unresolvable session still renders the anonymous header ("Session unresolvable" in `app-shell`), and the controls themselves fetch nothing, so there is no loading, empty or error state inside them beyond what the spec already covers ("No management entry for the role" is their empty case). No state is invented for missing `data.name` or `data.surname`: the contract's fields feed the controls exactly as today.

The shared card is not used by this change, so the card field-mapping rule does not apply.

### D12 — Files created and modified

| Path | FSD layer | Action |
|---|---|---|
| `src/shared/config/locale-names.ts` | shared (segment `config`) | created — `LocaleName` and `LOCALE_NAMES` (D6) |
| `src/shared/ui/DropdownMenu.tsx` | shared (segment `ui`) | modified — `surface` variant and its two class sets (D2) |
| `src/shared/ui/DropdownMenu.test.tsx` | shared (segment `ui`) | modified — nav-surface cases; the existing cases stay |
| `src/shared/ui/icons.ts` | shared (segment `ui`) | modified — re-export `Globe` (D8) |
| `src/shared/ui/icons.test.ts` | shared (segment `ui`) | modified — assert `Globe` beside the existing icons |
| `src/app/shell/AppShell.tsx` | app | modified — compose the language trigger's name (D6) |
| `src/app/shell/AppShell.test.tsx` | app | modified — assert the composed name passes down |
| `src/app/styles/globals.css` | app | modified — the dark values of `nav-avatar`, `nav-avatar-hover` and `nav-text-dark`, and `nav-avatar-border` defined in both themes (D5) |
| `src/app/styles/theme-tokens.test.ts` | app | modified — the contrast pairs this change introduces (D13) |
| `src/widgets/app-header/ui/AppHeader.tsx` | widgets (slice `app-header`) | modified — ghost triggers, circle content and breakpoints (D3, D4) |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | widgets (slice `app-header`) | modified — rewritten language cases, new user-control and menu cases |
| `src/widgets/app-header/ui/LanguageSelect.tsx` | widgets (slice `app-header`) | modified — menu control (D7) |
| `src/widgets/app-header/ui/UserMenu.tsx` | widgets (slice `app-header`) | modified — trigger with the circle class list (D4, D5), nav surface (D2) |
| `src/widgets/app-header/ui/ThemeSelect.tsx` | widgets (slice `app-header`) | modified — menu treatment (D9) |
| `src/widgets/app-header/ui/ThemeSelect.test.tsx` | widgets (slice `app-header`) | modified — its class assertions follow the restyle |

No route file changes; the root `app/` folder keeps routing only. `src/shared/ui/index.ts` already exports the dropdown menu parts; it is unchanged.

### D13 — Contrast evidence (design summary §4: token names mapped, contrasts recorded; artifact review of 2026-10-05: every pair in both themes)

Every colour resolves through a semantic token. Design summary §4's "new token only when a pair on the header surface fails" rule fires exactly once: the circle fill `nav-avatar` measures ≈2.3:1 against `nav-surface` in the dark theme, so the avatar boundary gets the one new token, `nav-avatar-border` (D5). The failing pairs the explore found stay unused — `nav-indicator` on `nav-hover` (2.75:1 traditional), `nav-current` (1:1 traditional, 1.47:1 dark) and `nav-icon` on `nav-hover` (2.57:1 traditional) are not rendered by any settled choice — so no further token is added or changed; only the three dark values of D5 move.

| Pair (foreground on background) | Kind | Min | Traditional | Dark | Status |
|---|---|---|---|---|---|
| `nav-text-dark` on `nav-avatar` — initials at rest | text | 4.5 | ≈6.4:1 (`cream-100` on `sage-800`) | 5.38:1 (`night-cream-100` #f2eadd on `night-oxblood-700` #a03f3c — the `nav-button-text` on `nav-button-bg` pair, design summary §8) | registered in both matrices by the tasks |
| `nav-text-dark` on `nav-avatar-hover` — initials on hover | text | 4.5 | ≈6.9:1 (`cream-100` on `oxblood-800`) | 6.64:1 (#f2eadd on `night-oxblood-800` #90302e — the `action-primary-text` on `action-primary-hover` pair) | registered in both matrices by the tasks |
| `nav-avatar-border` on `nav-surface` — boundary against the header | boundary | 3 | exempt — the token is transparent and the fill gate below holds | ≈12:1 (`night-cream-100` on `night-sage-900` #142b28) | dark registered by the tasks; traditional exempt |
| `nav-avatar-border` on `nav-avatar` — boundary against the fill | boundary | 3 | exempt | 5.38:1 | dark registered by the tasks; traditional exempt |
| `nav-avatar-border` on `nav-avatar-hover` — boundary against the hover fill | boundary | 3 | exempt | 6.64:1 | dark registered by the tasks; traditional exempt |
| `nav-avatar` on `nav-surface` — the fill without a boundary | boundary | 3 | ≈3.4:1 (`sage-800` on `sage-400`) — passes, the gate for the transparent traditional boundary | ≈2.3:1 — fails, the pair that fires the new-token rule | traditional gate asserted by the tasks; dark recorded only, the boundary is the boundary |
| `nav-text` on `nav-surface` — trigger content, panel text | text | 4.5 | asserted | asserted | both matrices |
| `nav-text-hover` on `nav-surface` — trigger content on hover | text | 4.5 | ≈6.1:1 | ≈5.8:1 | registered in both matrices by the tasks |
| `nav-text-hover` on `nav-hover` — row hover text | text | 4.5 | asserted | asserted | both matrices |
| `border-strong` on `nav-surface` — menu panel and in-menu select boundary | boundary | 3 | ≈6.1:1 | ≈3.8:1 | registered in both matrices by the tasks |

The marked `≈` values are the recorded measurements. The tasks register the undocumented pairs in `theme-tokens.test.ts` so the thresholds are enforced from then on, assert the traditional fill gate beside the existing `nav-button-bg` gate, and assert that `--color-nav-avatar-border` is defined in both theme blocks — its `transparent` traditional value falls outside the relational completeness check's `var()`/`color-mix()` filter, so its completeness is asserted explicitly.

## Risks / Trade-offs

- **Link rows carry two colour treatments.** A user-menu entry rendered with the internal link treatment carries the row's `nav-text` and the link's `text-text-link` on one element, and the CSS cascade decides which colour shows. This is the same shape `add-app-shell` accepted (its tests assert the classes, not the computed colour) → Mitigation: the class-level assertions stay the project's convention (jsdom has no CSS engine); the rendered colour is checked in the browser during review (open reading 1, accepted in the artifact review of 2026-10-05).
- **The initials text token is shared.** `nav-text-dark`'s dark value also serves `type-sidebar-item`, `variant-inverse` and the inverse controls' hover border → Mitigation: recorded in D5 — the change is a lighter text on the same dark surfaces, every asserted pair measures higher, and nothing but the token value moves.
- **Menu semantics come from the shared Radix menu.** The single-choice language list relies on its `menuitemradio` behaviour → Mitigation: the shared menu is already the project's accessibility surface (`add-app-shell` design.md D6) and the tests assert `aria-checked` on the current entry.

## Open Questions

None open. The three readings the propose left open were resolved by the artifact review of 2026-10-05:

1. **Design summary §4 "text" and the user menu's link rows** — accepted: rows that render the internal `Link` treatment keep that treatment's colours (the `AppHeader.test.tsx` link-treatment cases survive unchanged, as the design summary §7 test list rewrites only the language cases), and rows without their own treatment take `nav-text` → `nav-text-hover`.
2. **Design summary §2 "header hover and focus treatment"** — accepted with a condition: the trigger's content switches `nav-text` → `nav-text-hover` with no hover fill (D3), and on keyboard focus the trigger keeps the visible focus ring defined by `base-controls` (D3; spec "Header menu triggers", with its scenario; asserted in task 3.1).
3. **The dark-only mechanism** — rejected as proposed: no theme-scoped variant in `globals.css`. The avatar tokens' dark values carry the "Sign in" pair and one new boundary token completes the circle (D5, rewritten; contrasts in D13, both themes).

Pending outside the propose (design summary §8): the `docs/backlog.md` entry for the panel-radius mismatch between `base-controls` ("fields and menus" at `radius-field`) and the shared card-surface panel (`rounded-container`) — added by the product owner, since agents only read that file — and the MVC dropdown check in the browser before the archive.

# Design

## Context

See `proposal.md` — Why. Current state: `add-theme-tokens` is merged; `src/app/styles/globals.css` holds primitive and semantic color tokens for both themes and the `type-*` typographic utilities; `src/shared/ui/` is empty; no screen exists yet (root `app/` holds only `layout.tsx` and `page.tsx`; root `pages/` stays empty). `lucide-react` is approved but not yet installed.

Design source of truth is `docs/design/add-base-control/design-summary.md`, narrowed by the product owner's later decisions: the summary's form-field scope (Field, Input, Select, Textarea, Checkbox, Radio), the inverse variant and its tokens moved to `add-form-fields`; what remains here is Button, Link, the radius family and the icon entry point. Contrast figures below were re-verified with the WCAG relative-luminance formula.

This change consumes no API and creates no routes. It delivers reusable controls that later changes place on screens.

## Goals / Non-Goals

**Goals:**
- Action controls usable in any later screen without rework: treatments map 1:1 to existing semantic token sets, states are complete (rest, hover, focus, disabled, busy), accessibility is enforced by construction where possible (icon-only naming).
- One shape system (radius tokens) and one icon source, both designed to survive all six component changes.

**Non-Goals:**
- Screen placement, layout or navigation shells (change 6, `app-shell`).
- Form controls and the inverse variant (`add-form-fields`).
- Responsive behaviour: both controls are size-stable at all breakpoints (design rule 5: each component declares whether it needs responsive behaviour — these do not).
- Theme switching mechanics: components stay theme-agnostic; themes apply only through token reassignment (design rule 9).

## Decisions

### UI-specific types (defined before any component)

No generated API type is used (nothing consumes the API). The only types are UI-specific, declared at the top of their file before the component:

```ts
// src/shared/ui/Button.tsx
type ButtonVariant = "primary" | "action-1" | "action-2" | "action-3" | "action-4" | "nav-button";
type ButtonSize = "base" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; // default "primary"
  size?: ButtonSize;       // default "base"
  icon?: LucideIcon;       // from the shared icon entry point
  loading?: boolean;       // busy state — never the native `disabled` (D4)
} & (
  | { children: ReactNode; "aria-label"?: string }
  | { children?: never; "aria-label": string } // icon-only buttons must be named
);
// `type`, `disabled`, `form`, `name`, `value`, `aria-*` and all native button
// events come from ButtonHTMLAttributes and pass through to the element;
// `type` defaults to "button" so forms never get accidental submits.

// src/shared/ui/Link.tsx
type LinkProps = {
  href: `/${string}`;      // in-application route — an absolute URL is a compile error
  variant?: "default" | "back"; // default "default"
  children: ReactNode;
};

// src/shared/ui/icons.ts — the only module that imports lucide-react
export { Loader2, ArrowLeft, type LucideIcon } from "lucide-react";
// the project's own SVGs (app logo, coffee-bean) are added here by changes 6 and 2
```

The `ButtonProps` union makes an unnamed icon-only button a compile error, while extending `ButtonHTMLAttributes<HTMLButtonElement>` keeps the native button surface (`form`, `name`, `value`, `aria-*`, events) passing through to the element — spread props are forwarded unchanged rather than acting as a bypass. The runtime test asserts the accessible name as a second line of defence. Typing `href` as `` `/${string}` `` makes an absolute URL a compile error, so Link needs no runtime branch for external destinations.

### D1. Radius tokens follow the color pattern

Four tokens in a new `@theme` block, each reassigned to `0` under `[data-theme="dark"]`, exactly like semantic colors: `radius-pill: 9999px`, `radius-container: 16px`, `radius-field: 8px`, `radius-check: 4px` (checkbox only; its consumer arrives in `add-form-fields`). Tailwind 4 generates `rounded-pill`, `rounded-container`, `rounded-field`, `rounded-check` from the `--radius-*` namespace. `radius-pill` is `9999px`, not `3.25rem`, so no content can outgrow the pill shape.

*Why:* the dark theme is square by design (design summary §3); reusing the established reassignment pattern keeps one mechanism for themes. Shipping the whole family (including `radius-check`) here means one completeness check covers it once. *Alternatives:* a literal `4px` for the checkbox (rejected: design rule 1 — radii come from tokens); per-component radius values (rejected: shape must be switchable per theme).

### D2. Component API: neutral props, token-mapped values

`variant` and `size` with the values above; no domain names (design rule 2). The variant values map 1:1 to existing token families (`action-primary-*`, `action-{n}-*`, `nav-button-*`), so no new color tokens are needed. Sizes are chosen by context, never by breakpoint.

### D3. Button geometry (product-owner decision)

`base` = `h-10 px-4`, `sm` = `h-8 px-3`; icon–label gap `gap-2`; icons 16px; icon-only buttons are square (`w-10` / `w-8`). Both sizes use the `type-button` typographic role. Radius `radius-pill`.

### D4. Button busy state (product-owner decision)

A spinner (Lucide `Loader2`) renders before the label; the label stays so the width does not change. The button is **not** disabled while busy: it sets `aria-busy="true"` and `aria-disabled="true"`, ignores activation (pointer and keyboard), and keeps keyboard focus. Under `prefers-reduced-motion` the spinner renders without rotation (`motion-reduce:animate-none`). For icon-only buttons the spinner replaces the icon, keeping the square footprint. *Alternatives:* the native `disabled` attribute while loading (rejected: it drops keyboard focus mid-interaction); a spinner overlay on top of the label (rejected: width shift and stacking complexity for no user benefit).

### D5. Disabled treatment (product-owner decision, all controls)

The native `disabled` attribute plus `opacity-50`, `cursor-not-allowed` and no hover change. A disabled control leaves the keyboard focus order — which is exactly why the busy state (D4) uses `aria-disabled` instead. Disabled controls are exempt from WCAG contrast (SC 1.4.3 / 1.4.11 inactive-component exception), so no contrast pairs are added for this state.

### D6. Focus treatment — `focus-ring` + `focus-offset` everywhere

The navigation-action button renders in the header (`nav-header`), not on the sidebar, so the standard focus tokens apply to every variant. Documented pairs (verified):

| Pair | Traditional | Dark |
|---|---|---|
| `focus-ring` / `nav-header` | 4.63 | 12.27 |
| `focus-ring` / `focus-offset` | 11.53 | 14.28 |

`focus-ring-inverse` and `focus-offset-inverse` stay in `add-form-fields`. *Alternative:* pulling the inverse focus tokens into this change (rejected: no in-scope consumer). If `app-shell` later places `nav-button` on the dark sidebar, its focus treatment is revisited there (its background, text and border tokens already target dark surfaces).

### D7. Link behaviour

Internal routes only, rendered with `next/link`; always underlined in every state (CSS `underline`, not a hover effect). Variant `back` renders a leading Lucide `ArrowLeft` at 16px with `gap-2` before the text. External navigation (e.g. the authorization-server redirect) is done by the component that needs it — `Link` cannot accept one at all (`href` is typed `` `/${string}` ``, so an absolute URL is a compile error, with no runtime branch). *Alternative:* an `external` variant with `target="_blank"` (rejected: out of scope by design, and it invites misuse).

### D8. Single icon entry point

`src/shared/ui/icons.ts` is the only module allowed to import `lucide-react`; every icon is consumed through it, and it is where the project's own SVGs (app logo, coffee-bean) will join in changes 6 and 2. Icons render with `currentColor` so they follow the control's text color through every state and theme. *Alternative:* importing `lucide-react` per component (rejected: no single audit point, artwork and sizing drift, harder to swap libraries).

### D9. Dependency

Add `lucide-react` to `package.json` (product-owner approved). No other dependency changes. Icons are imported by name through `icons.ts`, which keeps tree-shaking effective.

### D10. Verification strategy

Component tests (Vitest + React Testing Library) are written before the implementation they cover. `src/app/styles/theme-tokens.test.ts` gains a radius completeness check (every `--radius-*` defined in an `@theme` block is reassigned under `[data-theme="dark"]`) and the four documented `nav-button` focus pairs from D6 in both theme matrices. The "verification fails" spec scenarios map to these checks and to the `ButtonProps` union plus the accessible-name test. A guard test (`src/shared/ui/radius-guard.test.ts`) fails if any file in `src/shared/ui` uses a default Tailwind radius utility (`rounded-sm|md|lg|xl|2xl|full`) instead of the radius tokens, enforcing design rule 1 at the code level.

## Files (full paths, FSD layer)

**API endpoints consumed:** none. **API errors presented to the user:** none — no request is made; error copy belongs to the consuming capabilities. **Shared card mapping:** not used in this change.

Created:

| Path | Layer | Contents |
|---|---|---|
| `src/shared/ui/Button.tsx` | `shared` | Types + Button component |
| `src/shared/ui/Button.test.tsx` | `shared` | States, sizing, busy/disabled semantics, attribute passthrough, accessible name |
| `src/shared/ui/Link.tsx` | `shared` | Types + Link component (`next/link`) |
| `src/shared/ui/Link.test.tsx` | `shared` | Underline, back variant, compile-time rejection of external URLs |
| `src/shared/ui/icons.ts` | `shared` | Icon entry point (only `lucide-react` import site) |
| `src/shared/ui/index.ts` | `shared` | Segment entry: exports Button, Link, icon module |
| `src/shared/ui/radius-guard.test.ts` | `shared` | Fails on default radius utilities used in `src/shared/ui` |

Modified:

| Path | Layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | `app` | New `@theme` radius block + `0` reassignments in the dark block; no existing token or utility modified |
| `src/app/styles/theme-tokens.test.ts` | `app` | Radius completeness check; `nav-button` focus pairs in both matrices |
| `package.json`, `package-lock.json` | — | `lucide-react` added |

No route files are created; the root `app/` folder is untouched. No files in `src/pages/`, `src/widgets/`, `src/features/` or `src/entities/` are involved.

## Risks / Trade-offs

- [Radius utilities could inline their values, ignoring the dark reassignment] → verify the compiled `rounded-*` utilities reference `var(--radius-*)` as the color utilities do; if Tailwind inlines them, fall back to `@utility` definitions that read the variable. Covered by the completeness check plus a dark-theme render assertion in tests.
- [Three of four radius tokens (`container`, `field`, `check`) ship without a consumer] → deliberate: the family is specified and verified once here; consumers arrive in changes 2–5. Accept dead tokens for one cycle.
- [50% opacity on disabled controls can drop text below contrast minimums] → accepted trade-off: WCAG exempts inactive controls, and the state is never carried by color alone (opacity + cursor + no hover).
- [lucide-react grows the bundle] → only two icons are imported in this change, by name, through one module.

## Migration Plan

None. The controls land unused; no existing screen or token changes behaviour. Rollback is a straight revert of the change's commits.

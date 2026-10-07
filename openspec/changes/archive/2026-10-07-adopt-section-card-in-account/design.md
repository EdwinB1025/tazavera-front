# Design

## Context

See proposal.md (Why) for the motivation. The design source of truth is `docs/design/adopt-section-card-in-account/design-summary.md` (`Status: approved`; the note under the title closes Open 1 as (b): the account's loading and signed-out cards and the register form card also become section cards, without a band). This design records only how the summary's end states land in the code; it does not re-decide them.

Current state on `develop`:
- `src/shared/ui/Card.tsx` offers `variant="section"` (refine-page-surfaces D2–D4): the root carries `bg-surface-card rounded-container border border-border-subtle shadow-lg overflow-hidden` (no `border-l-4`, no `border-border-accent`); `CardAside` is the band (`bg-surface-section`, `border-b border-border-subtle`, a flex column `gap-2`, `p-4 md:px-6`); `CardContent` is the body (`px-4 pt-4 pb-5 md:p-6`). The variant stacks its parts at every width and a consumer may render a body-only card (`add-offering-management`'s `NewOfferingForm.tsx` already composes `Card variant="section"` with only `CardContent`).
- `src/features/user-account/ui/AccountSection.tsx` renders `<section aria-labelledby>` > `Card` (default variant) > `CardContent` (`flex flex-col gap-6`) holding a heading block (`div.flex.flex-col.gap-2` with the `h2` `type-subheading` and the optional description `type-body`) and the children 1.5rem below it.
- `src/pages/account/ui/AccountClient.tsx` returns the four `AccountSection`s as a fragment inside `SessionGate`'s render prop; `src/pages/account/ui/AccountScreen.tsx` renders the heading block and that region in a `max-w-lg` column `gap-8` (2rem) on a `PageSection surface="page"`.
- `src/features/user-account/ui/SessionGate.tsx` and `src/pages/register/ui/RegisterClient.tsx` render `Card` (default variant) with one `CardContent`.
- `src/app/styles/theme-tokens.test.ts` registers `text-accent` / `surface-section` and `text-primary` / `surface-section` in both matrices (the band's two text pairs, summary §2).
- The section card's parts already produce the summary's spacing: band `p-4` below 768px and `px-6 py-4` from `md`, body `px-4 pt-4 pb-5` and `md:p-6`, band children `gap-2`, so no shared class changes.

## Goals / Non-Goals

**Goals:**
- The four account sections render as section cards with their heading block in the static header band, and the seven cards named in the summary (four sections, two gate cards, one register card) lose the accent edge (summary §2, note under the title).
- Every prop, landmark, text and request of the user-account pieces stays exactly as `add-user-account` left it, so `add-user-contact` and R11 apply on top without rework (summary §0.5, §5).

**Non-Goals:**
- No change to `Card.tsx`, `PageSection.tsx`, `Collapsible.tsx`, any guard test, any token or any matrix pair.
- No new derived or UI-specific type: `AccountSectionProps` is unchanged and no other type is added.
- No recomposition of the gate or of the register client beyond the card variant (R11 moves `SessionGate` later).

## API endpoints consumed

None. This change sends no request and alters no request, response or error path; every write, its step-up and its error presentation are those `add-user-account` shipped ("How API errors are presented", add-user-account design.md: unchanged).

## Derived and UI-specific types

None. No generated type is used, derived or edited.

## Card regions filled from the API

No card region is filled from an API field by this change. The bodies keep the content `add-user-account` composes: the profile form fields hold `data.name`, `data.surname` and `data.email`, the Role row shows `data.role`, and the gate and register cards hold catalog texts through props (add-user-account design.md "Card sections filled from the API", unchanged).

## Files

| Path | FSD layer | Change |
|---|---|---|
| `src/features/user-account/ui/AccountSection.tsx` | features (`user-account`) | modified: section card with the heading block in the header band (D1) |
| `src/features/user-account/ui/AccountSection.test.tsx` | tests | modified (D5) |
| `src/features/user-account/ui/SessionGate.tsx` | features (`user-account`) | modified: both gate cards are section cards without a band (D3) |
| `src/features/user-account/ui/SessionGate.test.tsx` | tests | modified (D5) |
| `src/pages/account/ui/AccountClient.tsx` | pages (`account`) | modified: the four sections sit in one sections group (D2) |
| `src/pages/account/ui/AccountClient.test.tsx` | tests | modified (D5) |
| `src/pages/register/ui/RegisterClient.tsx` | pages (`register`) | modified: the card is a section card without a band (D4) |
| `src/pages/register/ui/RegisterClient.test.tsx` | tests | modified (D5) |

No route file, `AccountScreen.tsx`, `RegisterScreen.tsx`, shared component, message catalog, contract or configuration file is created or modified.

## Decisions

### D1 — `AccountSection` renders the section card with its heading block in the band
`AccountSection` renders `Card variant="section"` with `CardAside` holding the heading block — the `h2` (`type-subheading`, keeping `id={headingId}`) and, when the section has one, the description (`type-body`), 0.5rem apart — and `CardContent` holding `children` in a `flex flex-col gap-6`, exactly as summary §2 settles. The heading block's existing `flex flex-col gap-2` wrapper may stay or fold into the band's own flex column; the end state is the summary's (h2 and description 0.5rem apart inside the band). Props (`heading`, `headingId`, `description`, `children`), the `useId` fallback for `headingId` and the `<section aria-labelledby={headingId}>` landmark around the card are unchanged (summary §2, §0.5).
- Alternative: a `band` prop or a second component — rejected: the section variant's `CardAside` is already the band (content-structure "Section card"), and `add-user-contact` keeps consuming `AccountSection` unchanged.

### D2 — The sections group in `AccountClient`
The authenticated branch of `AccountClient` wraps the four `AccountSection`s in one sections-group element instead of the fragment, with exactly the classes `flex flex-col gap-4` (summary §6: "one group element with `flex`, `flex-col`, `gap-4`"). The group has no fill, border, padding or radius (summary §2), and `AccountScreen`'s `gap-8` column is unchanged, so the heading block stays 2rem above the group and the cards sit 1rem apart with the page background between them.
- Alternative: the gap on `SessionGate`'s render-prop wrapper — rejected: the group is the authenticated branch's own structure, and the gate cards are not part of it.

### D3 — The gate cards are section cards without a band
`SessionGate` renders `Card variant="section"` in both of its non-authenticated branches (loading and signed out), with only `CardContent` — the body-only form-panel treatment refine-page-surfaces Open 6 (a) recommends and `add-offering-management`'s `NewOfferingForm.tsx` already uses. The body content is unchanged (`LoadingStatus`; the signed-out `flex flex-col gap-4` stack).

### D4 — The register card is a section card without a band
`RegisterClient` renders `Card variant="section"` with only `CardContent`, wrapping the loading status, the form and the success panel exactly as today (summary, note under the title: the register form card, whose success panel replaces the form inside the same card). Nothing else in the register client changes.

### D5 — What the tests assert
Class assertions name the classes `Card.tsx` already carries (jsdom has no CSS engine; AGENTS.md, Testing):
- `AccountSection.test.tsx`: the two existing cases stay unchanged ("is a region named by its h2, with its description and content"; "shows the heading alone when there is no description"). Added: the card root's class list contains `border` and `border-border-subtle` and does not contain `border-l-4`; the `h2` and, when present, the description are inside an element whose class list contains `bg-surface-section`, and the content is not inside that band element.
- `AccountClient.test.tsx`: the four existing cases stay unchanged. Added: the four regions are the children of one element whose class list contains `flex`, `flex-col` and `gap-4`.
- `SessionGate.test.tsx`: the four existing cases stay unchanged. Added: the loading card and the signed-out card each have a root whose class list contains `border` and `border-border-subtle` and does not contain `border-l-4`, and no element with `bg-surface-section` renders.
- `RegisterClient.test.tsx`: the existing cases stay unchanged. Added: while loading and while anonymous, the card root's class list contains `border` and `border-border-subtle` and does not contain `border-l-4`, and no element with `bg-surface-section` renders.
- Stays green with no edit: `AccountScreen.test.tsx`, `RegisterScreen.test.tsx`, `ProfileForm`, `PasswordForm`, `DangerZone`, `RoleRow`, `ExternalLink`, `LoadingStatus`, `FormStatus`, `StepUpNotice`, `RegisterForm` and `RegisterSuccessPanel` tests, `Card.test.tsx`, `theme-tokens.test.ts` and every guard.

### D6 — No token, text or contrast work; commit scope
The band's pairs (`text-accent` / `surface-section` and `text-primary` / `surface-section`) are already registered in both matrices of `theme-tokens.test.ts` (summary §2), so the change adds no pair and no token. No interface text changes. Every commit of the change uses the scope `user-account` (one capability, AGENTS.md, Git).

## Risks / Trade-offs

- [`add-user-contact` and R11 edit the same files later] → This change keeps every prop and the gate's frame as they are (summary §0.5, §5): `add-user-contact` renders `AccountSection` as it stands when its apply starts, and R11 moves `SessionGate` with the frame this change leaves.
- [The section card clips its content to its own corners (`overflow-hidden`, refine-page-surfaces D3)] → The dialogs and menus of these screens render through portals and nothing in-flow touches the card edge; the same clip already applies to the account sections today through the variant's other consumers.
- [The band styles key off any descendant with `aria-expanded` (refine-page-surfaces D4)] → The account bands hold a heading and a description only, so they render as static bands with no hover surface.
- [jsdom asserts classes, not pixels] → The visual end states of summary §3 are verified in the real-browser capture check (task 4.2), both themes at 375px and 1280px.

## Migration Plan

None: no data, no dependency, no removed route or text. Rolling back is reverting the change's commits.

## Open Questions

None.

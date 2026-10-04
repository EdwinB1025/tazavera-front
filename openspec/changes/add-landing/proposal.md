# Proposal

## Why

The application has no public entry. The shell (`add-app-shell`) renders a header around an empty main area: visitors cannot see the verified coffee offerings this guide exists to present, and nothing explains what Tazavera is or how an offering earns its verified status. The one contract this needs is now settled — locale routing, message catalogs and the session types (`add-app-shell`) — so the entry page and the About us page can be built once, on top of it, and every later change (filters, offering detail, registration) lands on a page that already exists.

## What Changes

- **Entry page** (`/{locale}`, public, fills the shell's empty main area). A hero: the eyebrow "THE GUIDE TO GOOD COFFEE", the heading "Tu café, el que merece cada sorbo" with one word in the accent color, an introduction paragraph, a primary "Explore coffees" action that scrolls to the offerings list on the same page, and two registration links ("Register your coffeeshop" → `/{locale}/register/coffeeshop`, "Register as a specialist" → `/{locale}/register`). The coffee-beans photograph joins the hero from `md` up and is hidden below it; the hero is one column on small screens and two from `md`.
- **Verified offerings list** on the entry page: `GET /offerings?verified=1`, one offering card per item, Previous/Next pagination that selects the page through the route's search params and is driven by `meta.current_page` and `meta.last_page`, and three states — loading (skeleton cards), empty (centered message) and error (message with a retry action).
- **Offering card** (entity `offering`): a score side column (`cuppingAvg` over 100 with a rating badge by range: ≥90 exceptional, ≥85 excellent, ≥80 good, below commercial), a verified or provisional status badge, the coffee name with its coffeeshop and roaster as labeled captions, a "country · region · process · variety" line that skips null values, taxonomy badges in three rows by level, and a footer with the evaluation and defective-evaluation counts, a "View" link for everyone (`/{locale}/offerings/{ulid}`, page in a later change) and an "Evaluate" link only for a signed-in specialist (`/{locale}/manage/evaluations/new?offering={ulid}`). Taxonomy names and colors are resolved once per load from `GET /taxonomies` by each `ref`, the name picked by locale (`nameEs`, `nameEn`, `nameCa`).
- **Card** (capability `content-structure`, its first requirement): a generic content container with a main content region, an optional side column behind a separator border, and an optional footer; the side column stacks under the content below `lg`. No knowledge of offerings: the consumer fills it.
- **Badge** (capability `feedback`, its first requirement): small chips in three families — rating tiers (the four score ranges), verified/provisional status (check and clock icons on the existing badge tokens), and taxonomy chips whose background comes from the taxonomy's data color with white or black text chosen by luminance (white at L ≤ 0.179), level-1 and level-2 chips rendering their background at 92% and 85%.
- **About us page** (`/{locale}/about`, public): five sections alternating `bg-surface-page` and `bg-surface-section` — a brief hero ("OUR STORY" eyebrow, heading with one accent word), the story of the gap between a coffee label and what is in the cup, "how we evaluate" as three cards (the coffeeshop registers a provisional offering, specialists cup it with the SCA method, the consensus verifies it), who it is for (coffeeshops and specialists, each with its registration link), and a closing primary "Explore coffees" action to the entry page. The copy is written in Spanish from these outlines and then translated to English and Catalan.
- **Texts and asset**: all copy lives in `messages/{locale}/landing.json` (es, en, ca) and components receive texts as props; the hero photograph `coffee-beans.png` is copied into `public/images/`.

## Capabilities

### New Capabilities

- `landing`: the public entry page — hero and verified offerings list with its loading, empty and error states — and the About us page. Its spec covers both screens' observable behaviour and the data each shows.
- `content-structure`: content containers. This change creates its spec with the card as its first requirement (regions, side column, stacking). Later changes add collapsible, tabs, label/value row and pagination.
- `feedback`: status and messaging components. This change creates its spec with the badge as its first requirement (rating tiers, verification states, taxonomy chips). Later changes add callout, toast, modal and empty state.

### Modified Capabilities

None. `theming` is unchanged: the badge and card take existing semantic tokens only (the taxonomy chips render data colors as inline styles, not tokens). `base-controls` is unchanged: its button, link and shared icon source are reused, and the clock icon joins the existing icon entry point without a requirement change. `form-fields` is not touched.

## Out of Scope (non-goals)

- **Offering detail page and the full offerings listing page** (later changes): "View" points at the future `/{locale}/offerings/{ulid}` route.
- **Offering filters and sorting** (`filtering`): the list shows verified offerings only, in the API's default order.
- **Registration pages** (`add-user-account`): the hero and About links point at its future routes.
- **Authentication UI and session mechanics** (`add-auth`): this change takes the session as an input to decide whether "Evaluate" appears and never reads a session module itself.
- **Management screens and the evaluation form** (later changes): "Evaluate" points at the future `/{locale}/manage/evaluations/new` route.
- **Forum.**
- **Any change to `contracts/openapi.yaml` or `src/shared/api/schema.ts`.** The design summary's §7 preconditions (`GET /offerings` accepting `verified=1`, `GET /taxonomies` returning `nameCa`) are in the contract and the types since `bff523c`; no commit after it modifies either file.

## Impact

- **Code (created):** route file `app/[locale]/about/page.tsx` (FSD layer `app`); the About screen under `src/pages/about/` and the hero of the entry screen under `src/pages/home/` (layer `pages`); the verified-offerings block under `src/widgets/` (layer `widgets`); the offering entity — card and rating-range rule — under `src/entities/offering/` (layer `entities`); the card and badge under `src/shared/ui/` with tests beside every file (layer `shared`); the message catalogs `messages/es/landing.json`, `messages/en/landing.json`, `messages/ca/landing.json`; and the hero photograph copied from `docs/design/add-landing/coffee-beans.png` to `public/images/coffee-beans.png`.
- **Code (modified):** `src/pages/home/ui/HomeScreen.tsx` (its empty main area gains hero and list), `app/[locale]/page.tsx` (the route file passes the search-param page to the home screen), `src/shared/ui/index.ts` (card and badge exports), `src/shared/ui/icons.ts` (clock icon for the provisional badge).
- **Dependencies:** none added, removed or upgraded. The card and badge start from the shadcn base exactly like `add-app-shell`'s pulled components and are rewired to the project's tokens and variant-map pattern; the `cn` helper they use arrives with the `add-app-shell` merge.
- **API:** consumes the public `GET /offerings` (`listOfferings`) and `GET /taxonomies` (`listOlfactoryTaxonomies`); both are public and are fetched on the server with plain `fetch` against `NEXT_PUBLIC_API_URL`. Every displayed value maps to a contract field (`cuppingAvg`, `evaluationCount`, `defectiveEvaluationCount`, `verificationStatus`, `location.name`, `coffeeInventory.coffee.name`, `coffeeInventory.coffee.country|region|process|variety`, `coffeeInventory.roastery.name`, `sensoryTaxonomy[].ref` with its `children`, `meta.current_page`, `meta.last_page`; taxonomy `ulid`, `level`, `color`, `nameEs`, `nameEn`, `nameCa`). `src/shared/api/schema.ts` is never edited: the change defines derived types in `src/shared/api/index.ts`.
- **Existing behavior:** `base-controls`, `form-fields` and `theming` are reused unchanged; the shell gains content in its main area and is otherwise untouched; the session is received as a prop and never read from a session module.
- **Cross-change:** builds only on the contracts of `add-app-shell` (routes under `[locale]`, messages per area, the `Session` types in `src/shared/api`). The only merge precondition is `develop` containing `add-app-shell`; nothing here depends on `add-auth`.

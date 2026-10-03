# add-landing — Design summary

Capabilities: `landing`, `content-structure` (Card), `feedback` (Badge). Builds on the contracts of `add-app-shell` (routes under `[locale]`, messages per area) and `add-auth` (session module, API client).

## 1. Entry page (`/[locale]`, public)

- Background `bg-surface-page`. Mobile-first: one column; from `md`, two columns (text left, image right), as in the previous app's welcome.
- **Hero:**
  - Eyebrow "THE GUIDE TO GOOD COFFEE" with `type-eyebrow-strong`.
  - Heading with `type-heading` and one highlighted word in `text-text-accent` (Spanish copy fixed: "Tu café, el que merece cada sorbo").
  - Paragraph with `type-body` (SCA-based objective evaluations).
  - Primary Button "Explore coffees": scrolls to the offerings list on the same page.
  - Two Links below the button: "Register your coffeeshop" → `/[locale]/register/coffeeshop` and "Register as a specialist" → `/[locale]/register` (pages owned by `add-user-account`).
  - Image `coffee-beans.png` (copied from `docs/design/add-landing/` to `public/images/`), descriptive `alt`; hidden below `md`.
- **Verified offerings list:** `GET /offerings?verified=1`, one `OfferingCard` per item. Pagination with Previous/Next buttons driven by `meta.current_page` and `meta.last_page`.
- **States:** loading (skeleton cards), empty (`type-body`, centered) and error (text message with a retry button).
- **Taxonomy names and colors:** the page requests `GET /taxonomies` once and resolves each `ref` of `sensoryTaxonomy`; the name comes from `nameEs`, `nameEn` or `nameCa` by locale.

## 2. Card (`src/shared/ui`, shadcn base)

- Parts: `Card`, `CardAside` (side column with a separator border, for the score), `CardContent` and `CardFooter` (actions). They stack below `lg`.
- Look: `bg-surface-card`, `rounded-container`, left border `border-l-4 border-border-accent`, `shadow-lg`. Separator of `CardAside`: `border-border-subtle`.
- Generic: no knowledge of offerings; texts and content come from the consumer.

## 3. Badge (`src/shared/ui`, shadcn base)

- `type-badge`, `rounded-field`. Variants:
  - `rating-exceptional`, `rating-excellent`, `rating-good`, `rating-commercial`: backgrounds `evaluation-rating-*`, text `badge-text`. Contrast checked: 4.7–4.9:1 in traditional, 6.6–7.1:1 in black.
  - `verified` (check icon) and `provisional` (clock icon): existing `badge-verified-*` and `badge-provisional-*` tokens.
  - `taxonomy`: background from the API's taxonomy `color` as inline style (the only inline color allowed in `src/`, because it is data); text white or black by luminance (white if L ≤ 0.179). The level-1 and level-2 badges lower the background opacity to 92% and 85%.

## 4. OfferingCard (`src/entities/offering/ui`)

- **Aside:** `cuppingAvg` with `type-score` and "/100" with `type-meta`; rating Badge by range ≥90 / ≥85 / ≥80 / below. The range logic lives in `src/entities/offering/lib`, not in the component.
- **Content:** verified/provisional Badge; coffee name with `type-card-heading`; coffeeshop (`location.name`) and roaster (`coffeeInventory.roastery.name`) as plain text with `type-label` captions; "country · region · process · variety" line with `type-meta` (null values are skipped); taxonomy Badges in three rows by level.
- **Footer:** evaluation count and defective count (`type-meta`); "View" Link → `/[locale]/offerings/{ulid}` (page in a later change) for everyone; "Evaluate" → `/[locale]/manage/evaluations/new?offering={ulid}`, only for a signed-in `specialist`.

## 5. About us (`/[locale]/about`, public)

- Sections alternate `bg-surface-page` and `bg-surface-section`.
1. Brief hero: `type-eyebrow-strong` ("OUR STORY"), `type-heading` with one accent word.
2. Story: the gap between what a coffee label promises and what is in the cup, and why a guide built on objective evaluations.
3. How we evaluate: three Cards (the coffeeshop registers its offering as provisional; specialists cup it with the SCA method; the consensus verifies it).
4. Who it is for: coffeeshops and specialists, each with its registration Link.
5. Closing: primary Button "Explore coffees" → `/[locale]`.
- Copy written by the developer from these outlines in Spanish, then translated to English and Catalan.

## 6. Texts and responsive

- All texts in `messages/{locale}/landing.json` (es, en, ca). Components receive texts as props.
- Declared breakpoints: hero `md`, Card `lg`. Focus with `focus-visible:focus-ring` on every Button and Link.

## 7. API preconditions (contract updated before apply)

- `GET /offerings` accepts `verified=1`.
- `GET /taxonomies` returns `nameCa`.

## 8. Out of scope

Offering detail page and listing page (later changes); offering filters (`filtering`); registration pages (`add-user-account`); forum.
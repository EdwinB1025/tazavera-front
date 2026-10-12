<p align="center">
  <img src="app/icon.svg" width="120">
</p>


Web front end for **Tazavera**, the specialty coffee verification platform. This app is where consumers browse verified coffee, coffee shops manage what they offer, and specialists cup and evaluate it — all on top of the Tazavera REST API.

> This repository is **the front end only**. The REST API it consumes (data model, OAuth2/PKCE, consensus engine) is `tazzavera-api` (Laravel, separate repository).

## 🕵️ What it is for

Tazavera **verifies** what a specialty coffee shop claims to sell: several specialists cup the actual product and the API derives a consensus that confirms or refutes the shop's claim. The front makes that verification visible and workable:

- 👀 **Anyone** (no account) — explores the top-rated verified offerings, the public coffee shop directory with its map, offering details with their consensus, and the public specialist evaluations.
- 🏪 **Coffee shop** — registers its business, manages its locations, browses the coffee inventory and publishes the offerings it serves.
- 🔬 **Specialist** — registers, explores offerings and records, edits and closes its own evaluations (descriptive and affective).

The evaluation model, the consensus formulas and the verification threshold live in the API; the front never recomputes them, it shows what the API returns.

## 📚 Documentation

- 📖 **API docs:** [View documentation](https://edwinb1025.github.io/tazzavera-api/public/docs/index.html)
- 📄 **API contract used by this front:** `contracts/openapi.yaml` (OpenAPI 3.0.3, a copy of the API's Scribe spec)
- 🧭 **Development process:** `docs/agents/workflow_sdd.md`
- 📐 **What the app does today:** `openspec/specs/<capability>/spec.md`

> 🔄 `contracts/openapi.yaml` is the **only source of truth** for endpoints, fields and error formats on this side. It is never edited here: when the API changes, the file is copied again and the types are regenerated.

## 🛠️ Stack

- ⚛️ **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- 🎨 **Styles:** Tailwind CSS 4 (tokens with `@theme` in `src/app/styles/globals.css`, no `tailwind.config`), Radix UI primitives, `lucide-react` icons, `cmdk` comboboxes
- 🌍 **i18n:** `next-intl` 4 (locales `es`, `en`, `ca`)
- 🔐 **Auth:** `oauth4webapi` (OAuth2 Authorization Code + PKCE, public client)
- 🗺️ **Maps:** Leaflet with OpenStreetMap tiles; address geocoding with Nominatim
- 🔗 **API types:** `openapi-typescript`, generated from `contracts/openapi.yaml`
- 🧪 **Tests:** Vitest + React Testing Library (jsdom)
- 🧹 **Lint:** ESLint 9 with `eslint-config-next` (kept on v9: its plugins do not support ESLint 10 yet)
- 📦 **Package manager:** npm

## ✅ Prerequisites

- Node.js and npm (the Docker image uses `node:22-alpine`)
- The **Tazavera API** running and reachable (locally `http://localhost:8000`, see the API README)
- A **public (PKCE) Passport client** created on the API (`php artisan passport:client --public`) whose redirect URI is `<NEXT_PUBLIC_APP_URL>/callback`

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/EdwinB1025/tazavera-front.git
cd tazavera-front
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

The front reads four variables. There is no `.env.example`; create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_OAUTH_CLIENT_ID=<the public client's id>
API_INTERNAL_URL=http://localhost:8000
```

| Variable | Read by | Role |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `src/shared/api/forwarding.ts`, `web-pages.ts`, `tokens.ts`, `src/features/auth/api/authorize.ts` | The front's public origin: OAuth `redirect_uri` (`/callback`), the API web pages' addresses, the `X-Forwarded-*` headers |
| `NEXT_PUBLIC_API_URL` | `src/shared/api/client.ts`, `tokens.ts` | Base of the browser's JSON calls and of the token endpoint; always `{NEXT_PUBLIC_APP_URL}/api` |
| `NEXT_PUBLIC_OAUTH_CLIENT_ID` | `tokens.ts`, `authorize.ts` | The API's public PKCE client |
| `API_INTERNAL_URL` | `src/shared/api/forwarding.ts`, `client.ts` | **Server-only.** The address the front's server uses to reach the API (forwarding and server-side requests). Unset or empty → forwarded paths answer `502` |

> ⚠️ `NEXT_PUBLIC_*` values are inlined into the bundle at **build** time; `API_INTERNAL_URL` is read per request at **run** time.

### 4. Generate the API types

Only needed when `contracts/openapi.yaml` changes (the generated file is committed):

```bash
npm run types:api
```

It writes `src/shared/api/schema.ts`. Never edit that file by hand; API types are imported only from `src/shared/api/`.

## ▶️ Running the project

### Development server

```bash
npm run dev
```

The front is available at `http://localhost:3000`; `/` redirects to the default locale (`/es`).

### Production build

```bash
npm run build
npm run start
```

> 🔒 A production build signs in only when the front is served over `https`: `oauth4webapi` refuses an `http` token endpoint outside development.

### Tests

```bash
npm run test:run
```

The **validation suite**: one test per spec scenario plus the guard tests for project rules (tokens, contrast, colours, radii, focus, icons, XSS…). `qa/` is excluded.

```bash
npm run test:qa
```

The validation suite **plus the QA suite** under `qa/`, which mirrors the paths of the code it tests (`vitest.qa.config.mts`). `npm test` runs Vitest in watch mode.

### Lint

```bash
npm run lint
```

## 🐳 Docker

`next.config.ts` sets `output: "standalone"` (a self-contained server in `.next/standalone`) and `poweredByHeader: false`. The `Dockerfile` has three stages on `node:22-alpine` (`deps` → `build` → `run`) and serves on port `3000`:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://<front-host>/api \
  --build-arg NEXT_PUBLIC_APP_URL=https://<front-host> \
  --build-arg NEXT_PUBLIC_OAUTH_CLIENT_ID=<client-id> \
  -t tazavera-front .
docker run -p 3000:3000 -e API_INTERNAL_URL=http://api:80 tazavera-front
```

The three `NEXT_PUBLIC_*` values are build arguments; `API_INTERNAL_URL` is given to the running container (in Docker, the API service's internal address, e.g. `http://api:80`). `.dockerignore` leaves out `.env*`, `node_modules`, `.next`, `coverage` and `qa`.

## 🚪 One public entry point

The front is the **only public address**: `proxy.ts` (Next 16's replacement for `middleware`) forwards the API's surface to `API_INTERNAL_URL` before anything else, keeping the browser's URL.

- `/api/…` → forwarded with `/api` removed (the JSON calls and `POST /oauth/token`).
- The API's **web routes** → forwarded unchanged: `/oauth/authorize`, `/login`, `/two-factor-challenge`, `/forgot-password`, `/reset-password/{token}`, `/email/verify`, `/email/verify/{id}/{hash}`, `/user/security`, the two-factor and passkey routes, and the assets of those pages (`/build/`, `/flux/`, `/livewire-<hex>/`, `/favicon.svg`). The full list is `src/shared/api/forwarding.ts`.
- Every forwarded request carries the front's origin in `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port`, so the API's redirects and forms stay on the front's origin. Same origin means no CORS.

Everything else goes through the front's own handling:

- 🌍 **Locale routing** (`next-intl` middleware): every route carries a locale prefix; a bare path or `/` redirects to `es`. No browser detection, no locale cookie.
- 🛡️ **Security headers**: a Content-Security-Policy with a fresh nonce per request, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (geolocation only), and `Cross-Origin-Opener-Policy: same-origin-allow-popups` so the sign-in popup keeps its opener. `/callback` sits outside the locale routing and gets no COOP.
- `/_next/*` and paths with a file extension pass untouched.

## 🔑 Authentication (OAuth2 / PKCE)

The front is a **public OAuth2 client** of the API (Authorization Code + PKCE, no secret), built on `oauth4webapi`:

1. **Sign in** opens a popup on `/oauth/authorize` (the API's login page, served through the front). If no popup can open, the same flow runs as a full-page redirect.
2. The API redirects to `/callback`, which hands the `code` back to the opener (or completes the full-page flow).
3. `POST /api/oauth/token` exchanges `code` + `code_verifier` for `access_token` + `refresh_token`; the session then resolves with `GET /user`.

- 🧠 **Tokens live in memory only** (`src/shared/api/tokens.ts`): never in `localStorage`, `sessionStorage` or cookies. A reload restores the session silently (`prompt=none`) or leaves it anonymous. A refresh replaces the whole pair.
- ✍️ **Step-up**: sensitive actions ask for a `profile:write` grant in a fresh login, bound to the signed-in user (`login_hint`); the write grant is set aside afterwards and the read grant restored.
- 🔗 Links to the API's own pages (`/user/security`, `/email/verify`, `/forgot-password`) are built with `apiWebPageUrl` and carry `login_hint` when signed in.
- 🆕 Registering (`/register`, `/register/coffeeshop`) keeps the grant the API returns and signs the user in.

The flow lives in `src/features/auth` (`api/authorize.ts`, `model/session.ts`); the token memory and every request go through the shared client in `src/shared/api` — no API URL is built by hand.

## 🧱 Architecture (Feature-Sliced Design)

- `app/` (root) — **Next.js routing only**. Each `page.tsx` imports its screen from `src/pages/` and holds no logic. The `@sidebar` parallel route fills the shell's sidebar per route.
- `pages/` (root) — **empty on purpose**, so Next.js does not treat `src/pages` as Pages Router routes.
- `src/` — application code in FSD layers, top to bottom; a layer imports only from layers below it, never between slices of the same layer:

| Layer | Content |
|---|---|
| `src/app` | Shell (`shell/`: header, sidebar, session seam), fonts, global styles and tokens |
| `src/pages` | One screen per route (`home`, `offerings`, `offering-detail`, `coffeeshops`, `evaluation-form`, `manage-inventory`…) |
| `src/widgets` | Composite blocks (`app-header`, `app-sidebar`, `offering-list`, `coffeeshop-detail`, `evaluation-sheet`…) |
| `src/features` | User actions (`auth`, `evaluate-offering`, `manage-evaluations`, `offering-management`, `location-management`, `user-account`, the `*-facets` filters) |
| `src/entities` | Business objects (`offering`, `evaluation`, `coffeeshop`, `location`, `contact`, `coffee-inventory`, `taxonomy`) |
| `src/shared` | `api` (request client, tokens, forwarding, generated `schema.ts`), `ui` (base controls), `lib` (i18n, theme, geocoding, leaflet…), `config` (locales) |

The import alias `@/*` maps to `src/*`. Each external asset library has a single entry point in `src/shared` (icons in `src/shared/ui/icons.ts`, Leaflet in `src/shared/lib/leaflet`).

## 🖥️ Screens

All routes live under `app/[locale]` (`/es/…`, `/en/…`, `/ca/…`), except `/callback`.

### Public

| Route | Screen |
|---|---|
| `/` | Home |
| `/offerings` | Offering catalog with filters ("Top rated" = verified, ordered by cupping average) |
| `/offerings/{ulid}` | Offering detail with its consensus |
| `/coffeeshops` | Coffee shop directory with filters and map |
| `/coffeeshops/{ulid}` | Coffee shop detail (offerings and locations) |
| `/evaluations`, `/evaluations/{ulid}` | Public specialist evaluations |
| `/about` | About us |
| `/register`, `/register/coffeeshop` | Sign up as specialist / as coffee shop |

### Signed in

| Route | Role | Screen |
|---|---|---|
| `/account`, `/account/password` | Any | My account (profile, business name for a coffee shop, contact, security, password) |
| `/manage/offerings`, `/manage/offerings/new` | Coffee shop | Manage offerings, create offerings |
| `/manage/locations` | Coffee shop | Manage locations (coordinates geocoded client-side) |
| `/manage/inventory`, `/manage/inventory/{ulid}` | Coffee shop | Explore the coffee inventory |
| `/manage/evaluations`, `/manage/evaluations/new`, `/manage/evaluations/{ulid}` | Specialist | Manage evaluations: list, create, edit and close |

The user menu shows the management entries of the session's role; on `/manage/*` routes the sidebar holds the role's navigation and the list's filters. Unknown paths render the not-found page.

## 🌍 Internationalisation

- Locales: `es` (default), `en`, `ca` (`src/shared/config/locales.ts`). The locale is chosen **only by the user** with the header's language selector.
- Texts live in `messages/{es,en,ca}/*.json`, one file per area (`shell`, `landing`, `catalog`, `coffeeshops`, `evaluations`, `account`…).

## 🎨 Theming

- Two themes: **traditional** (light, the default) and **dark**, switched from the header. The choice is a `theme` cookie, read on the server so `data-theme` is in the first HTML — no flash, no inline script (`src/shared/lib/theme.ts`).
- `src/app/styles/globals.css` defines the tokens with `@theme` in layers: **primitives** (cream, sage, petrol, moss, oxblood…), the **semantic** layer for the traditional theme, and its `[data-theme="dark"]` redefinition.
- Components use **only semantic tokens**, never primitives, hex values or Tailwind's default scales. Guard tests enforce it, and `src/app/styles/theme-tokens.test.ts` checks the contrast of every token pair.

## 🔁 Development workflow

Changes follow **spec-driven development with OpenSpec** (`docs/agents/workflow_sdd.md`):

- `openspec/specs/<capability>/` — what the app does today, per capability (`app-shell`, `auth`, `theming`, `offering-catalog`, `evaluations`…).
- `openspec/changes/<change-id>/` — proposal, delta specs, design and tasks of an open change; `openspec/changes/archive/` — the finished ones.
- `docs/design/<change-id>/` — design summary, corrections and handoff of a change; `docs/design/backlog.md` — refactor candidates.
- Two workflows: **traditional** (`Change`) and **refactor / fast lane** (`Refactor (fast lane)`). Roles (architect, build, orchestrator, design lead) and their rules are in `AGENTS.md` and `docs/agents/`.
- Branches: `master` (production), `develop` (integration), `qa` (refactor rounds), `feature/<change-id>` (one per change).
- Commits: Conventional Commits, `<type>(<capability>): <description>` with the footer `Refs: <change-id>`.

## 📝 Notes

- 📛 This is **not** the Next.js of older guides: read the docs shipped in `node_modules/next/dist/docs/` before touching routing, `next/*` APIs or the server/client boundary (`proxy.ts` replaces `middleware`).
- 🚫 Never create a `tailwind.config` or add files to the root `pages/`.
- 🧪 Async Server Components cannot be tested with Vitest; keep them thin and move logic into testable components or functions.
- 🩹 If forwarded paths (`/login`, `/api/…`) answer `502`, `API_INTERNAL_URL` is unset or empty.

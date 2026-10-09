# Design

## Context

Backlog R28: cmdk and the Radix primitives load on every route. Measured on `origin/qa` (`75ec9cd`) with `npm run build` (Next.js 16.4.0, Turbopack): the build output prints no First Load JS column, so it is computed from `.next`: for each route, the union of `build-manifest.json` `rootMainFiles` and the `entryJSFiles` of its page's client reference manifest, plus those of its `@sidebar` slot page, each file gzipped (Node `zlib.gzipSync`, default level).

Before: every locale route carried one 69 KB (gzipped) layout chunk holding cmdk, Popover, AlertDialog, Tabs, Slider, ToggleGroup, RadioGroup, DropdownMenu and Dialog, whatever the route rendered.

## Decisions

### D1. Declare the project's side effects in `package.json`

The `[locale]` layout reaches `src/shared/ui/index.ts` through the shell (`SidebarProvider`), the header (DropdownMenu, Button, Logo) and the sidebar widgets. A module of the project carries no `sideEffects` information, so the bundler keeps every module the entry point re-exports, with their imports. `package.json` declares `"sideEffects": ["*.css", "./src/shared/lib/leaflet/index.ts"]`, which tells it the opposite for every other module of the project; unused re-exports are then dropped. The project's only side-effect imports are two stylesheets: `globals.css`, imported by `app/layout.tsx` and kept by `*.css`, and `leaflet/dist/leaflet.css`, imported by `src/shared/lib/leaflet/index.ts`. With `*.css` alone the bundler treated that entry point as pure and dropped its stylesheet import (measured: no built CSS file held the Leaflet rules), so the entry point is listed by path. Packages in `node_modules` keep their own `sideEffects` fields.

Alternatives measured or checked first, in the order the session prompt preferred:

- Importing the heavy controls by module path (`@/shared/ui/Combobox`) in the slices that use them: rejected, the FSD skill imports layers without slices by segment (`@/shared/ui`), and the entry point's documentation says every consumer imports through it. Making each heavy control a segment of its own would move files and split `shared/ui` without a backlog decision.
- `experimental.optimizePackageImports: ["@/shared/ui"]` in `next.config.ts`: measured, no route changed (the option takes package names; `@/shared/ui` is a path alias). `radix-ui` and `cmdk` already declare `"sideEffects": false`, so listing them adds nothing.

`next.config.ts` stays as it is, `poweredByHeader: false` included.

## Measurement

First Load JS per route, gzipped, before (`origin/qa`) and after D1:

| Route | Before (KB gz) | After (KB gz) | Change | cmdk after |
|---|---:|---:|---:|---|
| `/[locale]/[...rest]` | 219.2 | 191.5 | -27.7 | no |
| `/[locale]/about` | 219.4 | 192.3 | -27.1 | no |
| `/[locale]/account` | 224.7 | 199.3 | -25.4 | no |
| `/[locale]/coffeeshops/[ulid]` | 222.7 | 215.6 | -7.1 | yes |
| `/[locale]/coffeeshops` | 224.9 | 204.4 | -20.5 | no |
| `/[locale]/evaluations/[ulid]` | 219.2 | 199.1 | -20.1 | no |
| `/[locale]/evaluations` | 220.9 | 204.5 | -16.4 | no |
| `/[locale]/manage/evaluations/[ulid]` | 226.5 | 207.4 | -19.1 | no |
| `/[locale]/manage/evaluations/new` | 226.5 | 206.5 | -20.0 | no |
| `/[locale]/manage/evaluations` | 223.8 | 207.0 | -16.8 | no |
| `/[locale]/manage/locations` | 226.4 | 198.1 | -28.3 | no |
| `/[locale]/manage/offerings/new` | 226.8 | 203.3 | -23.5 | yes |
| `/[locale]/manage/offerings` | 230.4 | 200.8 | -29.6 | no |
| `/[locale]/offerings/[ulid]` | 222.7 | 204.0 | -18.7 | no |
| `/[locale]/offerings` | 222.5 | 212.6 | -9.9 | yes |
| `/[locale]` | 227.8 | 198.8 | -29.0 | no |
| `/[locale]/register/coffeeshop` | 224.4 | 195.1 | -29.3 | no |
| `/[locale]/register` | 224.4 | 195.1 | -29.3 | no |
| `/_global-error` | 132.3 | 132.6 | 0.3 | no |
| `/_not-found` | 132.3 | 132.6 | 0.3 | no |
| `/callback` | 141.0 | 140.6 | -0.4 | no |

cmdk now loads only where a Combobox renders: the offering facets (`/offerings` and its `@sidebar` slot on `/coffeeshops/[ulid]`) and the new-offering form. `/_global-error` and `/_not-found` load the same framework code before and after (456,077 bytes uncompressed in both builds); the bundler groups it into different chunks, and the 0.3 KB is gzip compressing across the new chunk boundaries, not added code.

## Behaviour check

With the production server (`next start`) of both builds, the server-rendered markup of `/es`, `/es/about`, `/es/register`, `/es/coffeeshops`, `/es/evaluations`, `/es/account`, `/es/manage/offerings`, an unknown locale path and `/callback` is identical once scripts and links are removed; the two builds emit the same CSS files (same content hashes, Leaflet rules included). In Chromium the first five pages hydrate without console errors and the header's navigation menu opens.

## Risks

- A future module of the project that relies on an import side effect other than a stylesheet (a polyfill, a global registration) would be dropped when nothing it exports is used. It must then be added to the `sideEffects` list.

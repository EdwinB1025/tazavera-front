import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { AppShell } from "@/app/shell";

// The shell's client chrome drives navigation through the app router hooks,
// which need the router context jsdom does not provide. Test infrastructure
// only: no assertion below depends on it.
let shellPathname = "/es";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => shellPathname,
  // Read by the shell's navigation tracker (fix-production-aut-findings
  // design.md D5); no assertion depends on it.
  useSearchParams: () => new URLSearchParams(),
}));

// The language selector switches locale through next-intl's navigation
// (adopt-next-intl-routing design.md D6), which needs the same router
// context. Test infrastructure only: no assertion below depends on it.
vi.mock("@/shared/lib/locale-navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => shellPathname.replace(/^\/[^/]*/, "") || "/",
}));

// The session hook reads the route's locale with `useLocale()` under the
// `[locale]` layout's provider (adopt-next-intl-routing design.md D7), which
// these renders do not mount. Test infrastructure only.
vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useLocale: () => shellPathname.split("/")[1],
}));

// The header actions call the public entries of `@/features/auth` (design.md
// D1) through `ShellChrome`'s handlers. Only those two entries are replaced
// by spies: the session hook and `completeCallback` keep their real
// behaviour for the cases above. Test infrastructure only.
vi.mock("@/features/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth")>();
  return { ...actual, signIn: vi.fn(), signOut: vi.fn() };
});

// jsdom has no matchMedia; the sidebar reads the md breakpoint through it.
// Test infrastructure only.
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  pathname: "/es",
};

/**
 * `crypto.subtle.digest` as this realm offers it, copied into an
 * `ArrayBuffer` of the test's own realm (`authorize.test.ts`: the jsdom
 * worker's digest is rejected by `oauth4webapi`'s base64url encoder).
 */
const realDigest = crypto.subtle.digest.bind(crypto.subtle);
const realmDigest: SubtleCrypto["digest"] = (algorithm, data) =>
  realDigest(algorithm, data).then(
    (value) => new Uint8Array(value).slice().buffer as ArrayBuffer,
  );

beforeEach(() => {
  localStorage.clear();
  locationMock.assign.mockReset();
  locationMock.pathname = "/es";
  vi.stubGlobal("location", locationMock);
  vi.spyOn(crypto.subtle, "digest").mockImplementation(realmDigest);
});

/**
 * App shell tests (design.md D1, D3, D5, D11; spec "Shell layout and main
 * area", "Session states in the shell" and "Root of a supported locale").
 * Written before the shell exists (task 6.4); the imports fail to resolve
 * until then, so the file runs and fails as required.
 *
 * jsdom has no CSS engine: the sidebar column and its `md` breakpoint are
 * asserted through their exact class names. The shell resolves its texts
 * from the message catalog (design.md D1, D10), so the tests name controls
 * through the same catalog.
 *
 * Deviations from the tasks.md wording, decided by the product owner:
 * - The "authenticated showing the user menu" assertion is deferred to task
 *   7.1 (the user menu lands with UserMenu.tsx at task 7.2): this file
 *   asserts loading, anonymous and unresolvable only.
 * - "Session unresolvable" has no state of its own (D4 is unchanged): it is
 *   represented by { state: "anonymous" } and named after the spec scenario.
 *
 * add-auth task 4.1: the "Session resolving" and "Session unresolvable"
 * expectations drive the real session instead of a supplied session — the
 * sign-in marker of `src/features/auth/model/flow` (design.md D3) makes it
 * resolve silently and stay `loading` while that request is pending, and a
 * callback answer that resolves nothing settles it to `anonymous`. The silent
 * request is the authorization request of design.md D5 (`prompt=none`),
 * started as the full-page redirect of D3, so `location` and
 * `crypto.subtle.digest` are stubbed like in
 * `src/features/auth/api/authorize.test.ts`.
 *
 * add-auth task 5.2b (review round 3, item 1): the two header-action cases
 * assert only the wiring review round 3 settles (design.md D1) — activating
 * the header's "Sign in" and the user menu's "Sign out" reaches `signIn` and
 * `signOut` of `@/features/auth` — so those two entries are the spies
 * declared above and no case here asserts anything of the flows themselves.
 */

const LOCALE = "es";
const texts = getMessages("shell", LOCALE);

// The main area holds the entry page in the application (spec: "Root of a
// supported locale"). The shell tests fill it with a plain placeholder child
// instead, so they do not depend on the home screen.
const PLACEHOLDER_TEXT = "placeholder child";
const placeholderChild = <p data-testid="main-area-child">{PLACEHOLDER_TEXT}</p>;

function renderShell(session?: Session, sidebar?: ReactNode) {
  return render(
    <AppShell locale={LOCALE} session={session} sidebar={sidebar}>
      {placeholderChild}
    </AppShell>,
  );
}

describe("AppShell session states (spec: Session states in the shell)", () => {
  it("shows the user menu when the session is authenticated", () => {
    // The deferred assertion of task 6.3 (product owner, recorded there):
    // it lands here with the user menu at task 7.2.
    renderShell({
      state: "authenticated",
      user: { name: "Andrés", surname: "Gómez", role: "specialist" },
    });
    expect(screen.queryByRole("button", { name: texts.signIn })).toBeNull();
    expect(screen.getByRole("button", { name: "Andrés Gómez" })).toBeDefined();
  });

  it("labels the sidebar collapse control from the catalog in es, en and ca", () => {
    for (const locale of ["es", "en", "ca"]) {
      shellPathname = `/${locale}/manage/offerings`;
      const catalog = getMessages("shell", locale);
      expect(
        catalog.toggleSidebar,
        `messages/${locale}/shell.json defines no toggleSidebar key`,
      ).toBeTypeOf("string");
      const { unmount } = render(
        <AppShell
          locale={locale}
          session={{
            state: "authenticated",
            user: { name: "Andrés", surname: "Gómez", role: "specialist" },
          }}
        >
          {placeholderChild}
        </AppShell>,
      );
      expect(
        screen.getByRole("button", { name: catalog.toggleSidebar }),
      ).toBeDefined();
      unmount();
    }
  });
});

describe("AppShell language control name (refine-app-header design.md D6)", () => {
  it("composes the default locale's name for an unsupported locale", () => {
    // design.md D6 (correction 3 of round 1): the shell resolves the locale
    // with `isSupportedLocale`, and an unsupported locale resolves to
    // DEFAULT_LOCALE (es) for the whole composition — catalog word, code and
    // own name — so the shell renders without throwing and the name reads
    // "ES — Idioma: Español".
    expect(() =>
      render(
        <AppShell locale="fr">
          {placeholderChild}
        </AppShell>,
      ),
    ).not.toThrow();
    const composed = `ES — ${texts.languageSelector}: Español`;
    expect(screen.getByRole("button", { name: composed })).toBeDefined();
  });
});

describe("route files (architecture rule: routing only)", () => {
  function collectPages(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = pathResolve(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...collectPages(full));
      } else if (entry === "page.tsx") {
        files.push(full);
      }
    }
    return files;
  }

  it("import only their view from src/ and hold no logic", () => {
    const offenders: string[] = [];
    for (const file of collectPages(pathResolve(process.cwd(), "app"))) {
      const content = readFileSync(file, "utf-8");
      // A route file that only answers not found (add-not-found-page
      // design.md D7: the locale catch-all calls `notFound()`) has no view.
      const answersNotFound = /\bnotFound\(\)/.test(content);
      if (!answersNotFound && !/from\s+"@\//.test(content)) {
        offenders.push(`${file}: imports nothing from src/`);
      }
      if (/\buse[A-Z]/.test(content)) {
        offenders.push(`${file}: uses a React hook`);
      }
      if (/\bon[A-Z]/.test(content)) {
        offenders.push(`${file}: declares an event handler`);
      }
      if (/\bif\s*\(/.test(content)) {
        offenders.push(`${file}: holds conditional logic`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

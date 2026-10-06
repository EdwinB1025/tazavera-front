import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { completeCallback, signIn, signOut } from "@/features/auth";
import { AppShell } from "@/app/shell";

// The shell's client chrome drives navigation through the app router hooks,
// which need the router context jsdom does not provide. Test infrastructure
// only: no assertion below depends on it.
let shellPathname = "/es";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => shellPathname,
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

/** The sign-in marker of `src/features/auth/model/flow` (design.md D3). */
const MARKER_KEY = "tazavera.signed-in";

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

describe("AppShell (spec: Shell layout and main area)", () => {
  it("renders the header above a main area using bg-surface-page", () => {
    renderShell();
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    expect(main.className).toContain("bg-surface-page");
    expect(
      header.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("holds the content in one column when no sidebar is present (spec: Single column)", () => {
    renderShell();
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getByRole("main").className).not.toContain("md:flex");
  });

  it("gives the sidebar its own column beside the content from md (spec: Sidebar column)", () => {
    renderShell(undefined, <div data-testid="sidebar-region" />);
    const main = screen.getByRole("main");
    expect(main.className).toContain("md:flex");
    const sidebarColumn = screen.getByRole("complementary");
    expect(sidebarColumn.className).toContain("hidden");
    expect(sidebarColumn.className).toContain("md:block");
    expect(screen.getByTestId("sidebar-region")).toBeDefined();
  });

  it("renders the shell with the child it was given in its main area (spec: Root of a supported locale)", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeDefined();
    const main = screen.getByRole("main");
    expect(within(main).getByTestId("main-area-child")).toBeDefined();
    expect(main.textContent).toBe(PLACEHOLDER_TEXT);
  });

  it("grows to the body's height so the main area reaches the bottom (spec: Main area fills the viewport)", () => {
    const { container } = renderShell();
    // refine-app-header design.md D15: the root is a flex child of the body's
    // column, so it grows instead of relying on an unresolvable min-h-full
    const root = container.firstElementChild as HTMLElement;
    for (const cls of ["flex", "flex-1", "flex-col"]) {
      expect(root.classList.contains(cls)).toBe(true);
    }
    expect(root.classList.contains("min-h-full")).toBe(false);
    const main = screen.getByRole("main");
    expect(main.classList.contains("bg-surface-page")).toBe(true);
    expect(main.classList.contains("flex-1")).toBe(true);
  });
});

describe("AppShell session states (spec: Session states in the shell)", () => {
  it("Session resolving shows neither the Sign in action nor the user menu", () => {
    // The real session (add-auth task 4.1): the marker records a previous
    // sign in, so the session restores it silently (design.md D5) and stays
    // `loading` while that request is pending.
    localStorage.setItem(MARKER_KEY, "1");
    renderShell();
    expect(screen.queryByRole("button", { name: texts.signIn })).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("shows the signed-out header while the session is anonymous (spec: Signed-out header renders)", () => {
    renderShell({ state: "anonymous" });
    expect(screen.getByRole("button", { name: texts.signIn })).toBeDefined();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Session unresolvable renders as anonymous with no error message and no retry affordance", async () => {
    // design.md D5: a session that cannot be resolved renders as the
    // anonymous shell — there is no error message, no error page and no
    // retry affordance. The real session (add-auth task 4.1): the marker
    // records a previous sign in, but the callback answers nothing that
    // belongs to it, so the silent restore cannot resolve the session
    // (design.md D4 outcome table) and the shell renders as anonymous.
    localStorage.setItem(MARKER_KEY, "1");
    await completeCallback({}, () => {});
    renderShell();
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: texts.signIn })).toBeDefined();
    });
    // spec "Language selection": the language control is a button trigger,
    // named with the composed name the shell passes (design.md D6, correction
    // 1 of round 1 — code first)
    expect(
      screen.getByRole("button", {
        name: `ES — ${texts.languageSelector}: Español`,
      }),
    ).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    // exactly these two buttons: a third one would be a retry affordance
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

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

describe("AppShell header actions (spec: Sign in starts from the current route, Sign out)", () => {
  // The two header-action cases of add-auth task 5.2b (review round 3,
  // item 1): the actions call `signIn` and `signOut` of `@/features/auth`
  // (design.md D1). They fail while `ShellChrome`'s handlers are empty and
  // pass over the shell as task 5.2c leaves it.

  it("starts sign in for the route the user is on (spec: Sign in starts from the current route)", () => {
    shellPathname = "/es/manage/offerings";
    renderShell({ state: "anonymous" });
    fireEvent.click(screen.getByRole("button", { name: texts.signIn }));
    expect(vi.mocked(signIn)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(signIn)).toHaveBeenCalledWith("/es/manage/offerings");
  });

  it("signs the user out from the user menu (spec: Sign out)", () => {
    renderShell({
      state: "authenticated",
      user: { name: "Andrés", surname: "Gómez", role: "specialist" },
    });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Andrés Gómez" }));
    fireEvent.click(screen.getByRole("menuitem", { name: texts.signOut }));
    expect(vi.mocked(signOut)).toHaveBeenCalledTimes(1);
  });
});

describe("AppShell language control name (refine-app-header design.md D6)", () => {
  it("passes the language control one composed name, never two parts (spec: Selector is named)", () => {
    renderShell();
    // The shell composes "<CODE uppercase> — <catalog word>: <own name>" —
    // "ES — Idioma: Español" for es (design.md D6, correction 1 of round 1) —
    // and passes it down as one string, so the trigger's accessible name is
    // that composed name.
    const composed = `ES — ${texts.languageSelector}: Español`;
    expect(screen.getByRole("button", { name: composed })).toBeDefined();
    // one composed name: never the catalog word and the own name as two parts
    expect(
      screen.queryByRole("button", { name: texts.languageSelector! }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Español" })).toBeNull();
  });

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
      if (!/from\s+"@\//.test(content)) {
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

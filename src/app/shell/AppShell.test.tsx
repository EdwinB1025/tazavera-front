import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { AppShell } from "@/app/shell";
import { HomeScreen } from "@/pages/home";

// The shell's client chrome drives navigation through the app router hooks,
// which need the router context jsdom does not provide. Test infrastructure
// only: no assertion below depends on it.
let shellPathname = "/es";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => shellPathname,
}));

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
 *   add-auth task 4.1 rewires this test to the real session later.
 */

const LOCALE = "es";
const texts = getMessages("shell", LOCALE);

function renderShell(session?: Session, sidebar?: ReactNode) {
  return render(
    <AppShell locale={LOCALE} session={session} sidebar={sidebar}>
      <HomeScreen />
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

  it("renders the shell with an empty main area (spec: Root of a supported locale)", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main").textContent).toBe("");
  });
});

describe("AppShell session states (spec: Session states in the shell)", () => {
  it("Session resolving shows neither the Sign in action nor the user menu", () => {
    renderShell({ state: "loading" });
    expect(screen.queryByRole("button", { name: texts.signIn })).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("shows the signed-out header while the session is anonymous (spec: Signed-out header renders)", () => {
    renderShell({ state: "anonymous" });
    expect(screen.getByRole("button", { name: texts.signIn })).toBeDefined();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Session unresolvable renders as anonymous with no error message and no retry affordance", () => {
    // design.md D5: a session that cannot be resolved renders as the
    // anonymous shell — there is no error message, no error page and no
    // retry affordance.
    renderShell({ state: "anonymous" });
    expect(screen.getByRole("button", { name: texts.signIn })).toBeDefined();
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
          <HomeScreen />
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

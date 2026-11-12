import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { completeCallback } from "@/features/auth";
import { RegisterLandingScreen } from "@/pages/register";

/**
 * Registration landing (design.md D1, D2 and D3; specs "Registration landing"
 * and "Registration landing session gate"). The session and the router are
 * mocked at their entry points, as in `RegisterScreen.test.tsx`. The
 * unresolvable-session case keeps the real session instead (design.md D2):
 * `auth.real` makes the mocked `useSession` delegate to the actual hook, which
 * is driven as `src/app/shell/AppShell.test.tsx` does.
 */

const auth = vi.hoisted(() => ({
  session: { state: "anonymous" } as Session,
  real: false,
}));

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("@/features/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth")>();
  return {
    ...actual,
    useSession: () => (auth.real ? actual.useSession() : auth.session),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

// The real session reads the route's locale with `useLocale()`, whose
// provider these renders do not mount. Test infrastructure only.
vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useLocale: () => "es",
}));

/** The sign-in marker of `src/features/auth/model/flow`. */
const MARKER_KEY = "tazavera.signed-in";

/**
 * `crypto.subtle.digest` copied into an `ArrayBuffer` of the test's own realm,
 * as in `AppShell.test.tsx`. Test infrastructure only.
 */
const realDigest = crypto.subtle.digest.bind(crypto.subtle);
const realmDigest: SubtleCrypto["digest"] = (algorithm, data) =>
  realDigest(algorithm, data).then(
    (value) => new Uint8Array(value).slice().buffer as ArrayBuffer,
  );

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("location", { assign: vi.fn(), pathname: "/es/join" });
  vi.spyOn(crypto.subtle, "digest").mockImplementation(realmDigest);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  router.push.mockReset();
  router.replace.mockReset();
  auth.session = { state: "anonymous" };
  auth.real = false;
});

const es = getMessages("account", "es");

function levelTwoHeadings(): string[] {
  return screen
    .queryAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent ?? "");
}

describe("RegisterLandingScreen (spec: Registration landing)", () => {
  it("The landing offers both ways to join", () => {
    render(<RegisterLandingScreen locale="es" />);
    expect(
      screen.getByRole("heading", { level: 1, name: es.registerLandingTitle }),
    ).toBeDefined();
    expect(screen.getByText(es.registerLandingIntro)).toBeDefined();
    expect(levelTwoHeadings()).toEqual([
      es.registerLandingSpecialistTitle,
      es.registerLandingCoffeeshopTitle,
    ]);
    expect(screen.getByText(es.registerLandingSpecialistText)).toBeDefined();
    expect(screen.getByText(es.registerLandingCoffeeshopText)).toBeDefined();
    expect(
      screen.getByRole("button", { name: es.registerLandingSpecialistAction }),
    ).toBeDefined();
    const coffeeshop = screen.getByRole("button", {
      name: es.registerLandingCoffeeshopAction,
    });
    const grid = coffeeshop.closest(".grid")!;
    expect(grid.classList.contains("gap-6")).toBe(true);
    expect(grid.classList.contains("md:grid-cols-2")).toBe(true);
  });

  it("Each option opens its form", () => {
    render(<RegisterLandingScreen locale="es" />);
    fireEvent.click(
      screen.getByRole("button", { name: es.registerLandingSpecialistAction }),
    );
    expect(router.push).toHaveBeenLastCalledWith("/es/register");
    fireEvent.click(
      screen.getByRole("button", { name: es.registerLandingCoffeeshopAction }),
    );
    expect(router.push).toHaveBeenLastCalledWith("/es/register/coffeeshop");
  });
});

describe("RegisterLandingScreen (spec: Registration landing session gate)", () => {
  it("The landing waits while the session resolves", () => {
    auth.session = { state: "loading" };
    render(<RegisterLandingScreen locale="es" />);
    expect(
      screen.getByRole("heading", { level: 1, name: es.registerLandingTitle }),
    ).toBeDefined();
    expect(screen.getByText(es.registerLandingIntro)).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain(es.loading);
    expect(levelTwoHeadings()).toEqual([]);
  });

  it("A signed-in visitor is taken from the landing to the entry page", () => {
    auth.session = {
      state: "authenticated",
      user: {} as Extract<Session, { state: "authenticated" }>["user"],
    };
    render(<RegisterLandingScreen locale="es" />);
    expect(levelTwoHeadings()).toEqual([]);
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/es");
  });

  it("The landing shows its options when the session cannot be resolved", async () => {
    // The real session: the marker records a previous sign in, but the
    // callback answers nothing that belongs to it, so the session cannot be
    // resolved and settles as anonymous with no error.
    auth.real = true;
    localStorage.setItem(MARKER_KEY, "1");
    await completeCallback({}, () => {});
    render(<RegisterLandingScreen locale="es" />);
    await vi.waitFor(() => {
      expect(levelTwoHeadings()).toEqual([
        es.registerLandingSpecialistTitle,
        es.registerLandingCoffeeshopTitle,
      ]);
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

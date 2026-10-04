import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getMessages } from "@/shared/lib/i18n";
import { DEFAULT_LOCALE } from "@/shared/config/locales";
import { CallbackScreen } from "./CallbackScreen";

/**
 * The callback screen (design.md D4 and D6; spec "Return through the
 * callback"). Written before `./CallbackScreen` exists (task 3.1): the import
 * fails to resolve until then, so the file runs and fails as required — as do
 * the catalog reads below, which need `messages/{locale}/auth.json`.
 *
 * The screen renders exactly the status region of design.md D6: one status
 * region carrying `callback.status`, in the language of the pending flow's
 * return route with the default locale as fallback, and no error text
 * whatever the outcome (spec: "Return through the callback"). The three texts
 * are the ones of design.md D6, asserted on the catalogs themselves here and
 * on the rendering below. The pending-flow record is written straight to
 * `sessionStorage` under `tazavera.pending-flow`, the storage contract of
 * `src/features/auth/model/flow.test.ts`; the exchange and the openings run
 * through the stubbed `fetch` and `location` globals.
 */

const FLOW_KEY = "tazavera.pending-flow";

const GRANT = {
  access_token: "access-1",
  token_type: "Bearer",
  refresh_token: "refresh-1",
  expires_in: 3600,
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  pathname: "/callback",
};

/** The pending-flow record a sign-in leaves behind, under the flow key. */
function seedFlow(locale: string): { state: string } {
  const pending = {
    verifier: "verifier-123",
    state: "state-123",
    returnRoute: `/${locale}/offerings/1`,
  };
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(pending));
  return pending;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "https://api.tazavera.test";
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID = "client-ulid-1";
  process.env.NEXT_PUBLIC_APP_URL = "https://app.tazavera.test";
  sessionStorage.clear();
  localStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(GRANT), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  locationMock.assign.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the announced status text (design.md D6; spec: The wait is announced)", () => {
  it("messages/{locale}/auth.json defines callback.status with exactly the text of design.md D6 in es, en and ca", () => {
    expect(getMessages("auth", "es")["callback.status"]).toBe(
      "Completando el inicio de sesión…",
    );
    expect(getMessages("auth", "en")["callback.status"]).toBe(
      "Completing sign in…",
    );
    expect(getMessages("auth", "ca")["callback.status"]).toBe(
      "Completant l'inici de sessió…",
    );
  });

  it("announces the wait as status text in the locale of the return route", () => {
    for (const locale of ["es", "en", "ca"] as const) {
      sessionStorage.clear();
      seedFlow(locale);
      const text = getMessages("auth", locale)["callback.status"];

      const { container, unmount } = render(
        <CallbackScreen searchParams={{ code: "code-123", state: "state-123" }} />,
      );

      expect(screen.getAllByRole("status")).toHaveLength(1);
      expect(screen.getByRole("status").textContent?.trim()).toBe(text);
      expect(container.textContent?.trim()).toBe(text);
      unmount();
    }
  });

  it("falls back to the default locale when no flow is pending (design.md D6)", () => {
    const text = getMessages("auth", DEFAULT_LOCALE)["callback.status"];

    const { container } = render(<CallbackScreen searchParams={{}} />);

    expect(screen.getByRole("status").textContent?.trim()).toBe(text);
    expect(container.textContent?.trim()).toBe(text);
  });
});

describe("only the loading indicator, whatever the outcome (spec: Return through the callback)", () => {
  it("renders no error text when the authorization comes back with an error", () => {
    const pending = seedFlow("en");
    const text = getMessages("auth", "en")["callback.status"];

    const { container } = render(
      <CallbackScreen
        searchParams={{
          error: "access_denied",
          error_description: "The user denied access",
          state: pending.state,
        }}
      />,
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent?.trim()).toBe(text);
    expect(container.textContent).not.toContain("The user denied access");
  });

  it("renders no error text when the response does not answer a pending request", () => {
    seedFlow("en");
    const text = getMessages("auth", "en")["callback.status"];

    const { container } = render(
      <CallbackScreen searchParams={{ code: "code-123", state: "not-the-state" }} />,
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent?.trim()).toBe(text);
  });

  it("renders no error text when no flow is pending", () => {
    const text = getMessages("auth", DEFAULT_LOCALE)["callback.status"];

    const { container } = render(<CallbackScreen searchParams={{}} />);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent?.trim()).toBe(text);
  });
});

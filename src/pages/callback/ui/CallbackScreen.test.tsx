import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

/**
 * The callback screen (design.md D4 and D6; spec "Return through the
 * callback"). Written before `./CallbackScreen` exists (task 3.1) and updated
 * to the two modes of design.md D4 and the no-text rule of design.md D6 (task
 * 3.2): with an opener of the front's origin the screen posts `{ code, state }`
 * or `{ error, state }` to the front's origin and closes itself, performing no
 * exchange; with no opener it runs the D4 outcomes and opens the return route
 * through the App Router's `replace`, client-side navigation that replaces the
 * `/callback` entry so the code does not remain in the URL, never a full page
 * load nor a native `history` call (which only changes the URL and leaves the
 * empty callback screen rendered). Whatever the outcome the
 * screen renders no text and no status region.
 *
 * The screen is imported fresh in every test (`vi.resetModules()`), because the
 * completion runs at most once per page load behind a module-level guard
 * (design.md D4 idempotency) and each test stands for one page load. The
 * pending-flow record is written straight to `sessionStorage` under
 * `tazavera.pending-flow`, the storage contract of
 * `src/features/auth/model/flow.test.ts`; the exchange, the history calls and
 * the openings run through the stubbed `fetch`, `history`, `location`, `open`
 * and `close` globals, and the router through a mocked `next/navigation`.
 */

const FLOW_KEY = "tazavera.pending-flow";

const APP_URL = "https://app.tazavera.test";

const GRANT = {
  access_token: "access-1",
  token_type: "Bearer",
  refresh_token: "refresh-1",
  expires_in: 3600,
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
const popupMock = { location: { assign: vi.fn<(url: string) => void>() }, closed: false };
const openMock = vi.fn<Window["open"]>();
const pushMock = vi.fn<History["pushState"]>();
const replaceMock = vi.fn<History["replaceState"]>();
const routerReplaceMock = vi.fn<(href: string) => void>();
const router = { replace: routerReplaceMock };

vi.mock("next/navigation", () => ({ useRouter: () => router }));
const closeMock = vi.fn<() => void>();
const openerMock = {
  location: { origin: APP_URL },
  postMessage: vi.fn<(message: unknown, targetOrigin: string) => void>(),
};
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  reload: vi.fn<() => void>(),
  pathname: "/callback",
};

/** The pending-flow record a full-page sign-in leaves behind, under the flow key. */
function seedFlow(locale: string): { state: string } {
  const pending = {
    verifier: "verifier-123",
    state: "state-123",
    returnRoute: `/${locale}/offerings/1`,
  };
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(pending));
  return pending;
}

/**
 * Lets any exchange the screen may have started reach `fetch`: the token
 * request is sent after asynchronous steps, so a synchronous check alone would
 * miss it.
 */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/** One page load of the callback screen. */
async function loadScreen() {
  vi.resetModules();
  const { CallbackScreen } = await import("./CallbackScreen");
  return CallbackScreen;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "https://api.tazavera.test";
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID = "client-ulid-1";
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  sessionStorage.clear();
  localStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(GRANT), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  popupMock.location.assign.mockReset();
  openMock.mockReset();
  openMock.mockReturnValue(popupMock as unknown as Window);
  pushMock.mockReset();
  replaceMock.mockReset();
  routerReplaceMock.mockReset();
  closeMock.mockReset();
  openerMock.postMessage.mockReset();
  locationMock.assign.mockReset();
  locationMock.reload.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
  vi.spyOn(window, "open").mockImplementation(openMock);
  vi.spyOn(window, "close").mockImplementation(closeMock);
  vi.spyOn(window.history, "pushState").mockImplementation(pushMock);
  vi.spyOn(window.history, "replaceState").mockImplementation(replaceMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("popup mode — an opener of the front's origin (design.md D4)", () => {
  it("posts { code, state } to the front's origin and closes itself, exchanging nothing", async () => {
    vi.stubGlobal("opener", openerMock);
    const CallbackScreen = await loadScreen();

    const { container } = render(
      <CallbackScreen searchParams={{ code: "code-123", state: "state-123" }} />,
    );

    expect(openerMock.postMessage).toHaveBeenCalledTimes(1);
    expect(openerMock.postMessage).toHaveBeenCalledWith(
      { code: "code-123", state: "state-123" },
      APP_URL,
    );
    expect(closeMock).toHaveBeenCalledTimes(1);
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(container.textContent).toBe("");
  });

  it("posts { error, state } to the front's origin and closes itself, exchanging nothing", async () => {
    vi.stubGlobal("opener", openerMock);
    const CallbackScreen = await loadScreen();

    render(
      <CallbackScreen
        searchParams={{
          error: "access_denied",
          error_description: "The user denied access",
          state: "state-123",
        }}
      />,
    );

    expect(openerMock.postMessage).toHaveBeenCalledTimes(1);
    expect(openerMock.postMessage).toHaveBeenCalledWith(
      { error: "access_denied", state: "state-123" },
      APP_URL,
    );
    expect(closeMock).toHaveBeenCalledTimes(1);
    await settle();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("redirect mode — no opener (design.md D4)", () => {
  it("exchanges the code, leaves no code in the URL and opens the return route without a full page load (spec: Completing on the callback)", async () => {
    const CallbackScreen = await loadScreen();
    const pending = seedFlow("en");

    render(
      <CallbackScreen searchParams={{ code: "code-123", state: pending.state }} />,
    );

    await vi.waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(1);
    expect(routerReplaceMock).toHaveBeenCalledWith("/en/offerings/1");
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(locationMock.reload).not.toHaveBeenCalled();
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("renders no text and no status region whatever the outcome (design.md D6; spec: The authorization comes back with an error)", async () => {
    const CallbackScreen = await loadScreen();
    const pending = seedFlow("en");

    const { container } = render(
      <CallbackScreen
        searchParams={{
          error: "access_denied",
          error_description: "The user denied access",
          state: pending.state,
        }}
      />,
    );

    await vi.waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledTimes(1);
    });

    expect(routerReplaceMock).toHaveBeenCalledWith("/en/offerings/1");
    expect(container.textContent).toBe("");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

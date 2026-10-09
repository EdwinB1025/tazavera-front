import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

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
  search: "",
};

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
  const { CallbackScreen } = await import("@/pages/callback/ui/CallbackScreen");
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

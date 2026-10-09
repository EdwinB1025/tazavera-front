import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { RegisterClient, type RegisterClientTexts } from "@/pages/register/ui/RegisterClient";

/**
 * The registration route's client region (design.md D1 and D8; spec
 * "Registration routes"). It is the injection seam: the session comes from
 * `useSession()` and `signIn` from `@/features/auth`, both mocked here. While
 * `loading` it shows the loading status and no form, while `anonymous` the
 * form, and while `authenticated` it opens `/${locale}` through the App
 * Router's `replace` and shows no form — never a reload or `location.assign`.
 */

const auth = vi.hoisted(() => ({
  session: { state: "loading" } as Session,
  signIn: vi.fn<(returnRoute?: string) => void>(),
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: auth.signIn,
}));

const routerReplace = vi.hoisted(() => vi.fn<(href: string) => void>());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
}));

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  reload: vi.fn<() => void>(),
  replace: vi.fn<(url: string) => void>(),
  pathname: "/es/register",
};

beforeEach(() => {
  auth.session = { state: "loading" };
  auth.signIn.mockReset();
  routerReplace.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
  locationMock.assign.mockReset();
  locationMock.reload.mockReset();
  locationMock.replace.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const TEXTS: RegisterClientTexts = {
  nameLabel: "fx-name",
  surnameLabel: "fx-surname",
  emailLabel: "fx-email",
  passwordLabel: "fx-password",
  passwordConfirmationLabel: "fx-confirmation",
  passwordHelp: "fx-password-help",
  showPassword: "fx-show",
  hidePassword: "fx-hide",
  requiredError: "fx-required",
  emailFormatError: "fx-email-format",
  passwordMismatchError: "fx-mismatch",
  registerSubmit: "fx-submit",
  genericError: "fx-generic",
  registerSuccessTitle: "fx-success-title",
  registerSuccessText: "fx-success-text",
  signIn: "fx-sign-in",
  loading: "fx-loading",
  cancelLabel: "fx-cancel",
};

function renderClient(role: "specialist" | "coffeeshop" = "specialist") {
  return render(
    <RegisterClient
      locale="es"
      role={role}
      labelledBy="register-title"
      texts={TEXTS}
    />,
  );
}

describe("RegisterClient — the session gate", () => {
  it("while loading shows the loading status and no form", () => {
    renderClient();
    expect(screen.getByRole("status").textContent).toBe(TEXTS.loading);
    expect(document.querySelector("form")).toBeNull();
  });

  it("while anonymous renders the form", () => {
    auth.session = { state: "anonymous" };
    renderClient();
    expect(document.querySelector("form")).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("RegisterClient — injection", () => {
  it("passes the route's role to the form", async () => {
    auth.session = { state: "anonymous" };
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));
    renderClient("coffeeshop");
    for (const [label, value] of [
      [TEXTS.nameLabel, "Ana"],
      [TEXTS.surnameLabel, "López"],
      [TEXTS.emailLabel, "ana@example.com"],
      [TEXTS.passwordLabel, "Secret123"],
      [TEXTS.passwordConfirmationLabel, "Secret123"],
    ] as const) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
        target: { value },
      });
    }
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: TEXTS.registerSubmit }));
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body)) as {
      role: string;
    };
    expect(body.role).toBe("coffeeshop");
  });

  it("the success panel's Sign in calls the auth signIn once, inside the click", async () => {
    auth.session = { state: "anonymous" };
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }));
    renderClient();
    for (const [label, value] of [
      [TEXTS.nameLabel, "Ana"],
      [TEXTS.surnameLabel, "López"],
      [TEXTS.emailLabel, "ana@example.com"],
      [TEXTS.passwordLabel, "Secret123"],
      [TEXTS.passwordConfirmationLabel, "Secret123"],
    ] as const) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
        target: { value },
      });
    }
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: TEXTS.registerSubmit }));
    });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.signIn }));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
  });
});

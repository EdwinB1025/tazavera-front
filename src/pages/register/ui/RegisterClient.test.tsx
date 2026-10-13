import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import type { Session } from "@/shared/api";
import { RegisterClient, type RegisterClientTexts } from "./RegisterClient";

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
  signInWithRegistration: vi.fn<(token: unknown) => Promise<boolean>>(),
}));

vi.mock("@/features/auth", () => ({
  useSession: () => auth.session,
  signIn: auth.signIn,
  signInWithRegistration: auth.signInWithRegistration,
}));

const routerReplace = vi.hoisted(() => vi.fn<(href: string) => void>());
// Cancel is a route button (render-navigation-actions-as-buttons).
const routerPush = vi.hoisted(() => vi.fn<(href: string) => void>());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
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
  auth.signInWithRegistration.mockReset();
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
  businessNameLabel: "fx-business-name",
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
  cancelLabel: "fx-cancel",
  genericError: "fx-generic",
  registerSuccessTitle: "fx-success-title",
  registerSuccessText: "fx-success-text",
  signIn: "fx-sign-in",
  loading: "fx-loading",
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
  it("while authenticated replaces the route with /{locale} through the router and renders no form", () => {
    auth.session = {
      state: "authenticated",
      user: { ulid: "u1", name: "Ana", surname: "López", email: "a@b.c", role: "specialist" },
    };
    renderClient();
    expect(routerReplace).toHaveBeenCalledWith("/es");
    expect(document.querySelector("form")).toBeNull();
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(locationMock.reload).not.toHaveBeenCalled();
    expect(locationMock.replace).not.toHaveBeenCalled();
  });
});

describe("RegisterClient — the card", () => {
  it("while loading and while anonymous is a section card with a subtle border, no accent edge and no header band", () => {
    for (const session of [
      { state: "loading" },
      { state: "anonymous" },
    ] satisfies Session[]) {
      auth.session = session;
      const { container } = renderClient();
      const card = container.firstElementChild!;
      expect(card.classList.contains("border")).toBe(true);
      expect(card.classList.contains("border-border-subtle")).toBe(true);
      expect(card.classList.contains("border-l-4")).toBe(false);
      expect(container.querySelector(".bg-surface-section")).toBeNull();
      cleanup();
    }
  });
});

describe("RegisterClient — cancelling (add-form-cancel-actions design.md D3)", () => {
  it("Cancel opens the locale root without sending anything", () => {
    auth.session = { state: "anonymous" };
    renderClient();
    const cancel = screen.getByRole("button", { name: TEXTS.cancelLabel });
    expect(cancel.parentElement!.className).toContain("grid-cols-2");
    fireEvent.click(cancel);
    expect(routerPush).toHaveBeenCalledWith("/es");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("RegisterClient — the registration result (sign-in-after-registration design.md D4)", () => {
  const TOKEN = {
    token_type: "Bearer",
    expires_in: 1800,
    access_token: "access-1",
    refresh_token: "refresh-1",
  };

  async function register(body: unknown): Promise<void> {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    for (const [label, value] of [
      [TEXTS.nameLabel, "Ana"],
      [TEXTS.surnameLabel, "López"],
      [TEXTS.emailLabel, "ana@example.com"],
      [TEXTS.passwordLabel, "Secret123"],
      [TEXTS.passwordConfirmationLabel, "Secret123"],
    ]) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
        target: { value },
      });
    }
    const businessName = screen.queryByLabelText(new RegExp(`^${TEXTS.businessNameLabel}`));
    if (businessName) fireEvent.change(businessName, { target: { value: "Nomad Coffee" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: TEXTS.registerSubmit }));
    });
  }

  it("signs in with the token block and opens /{locale} through the router (spec: Signed in by the registration)", async () => {
    auth.session = { state: "anonymous" };
    const view = renderClient("coffeeshop");
    auth.signInWithRegistration.mockImplementation(async () => {
      auth.session = {
        state: "authenticated",
        user: { ulid: "u1", name: "Ana", surname: "López", email: "a@b.c", role: "coffeeshop" },
      };
      view.rerender(
        <RegisterClient locale="es" role="coffeeshop" labelledBy="register-title" texts={TEXTS} />,
      );
      return true;
    });

    await register({ data: {}, message: "m", token: TOKEN });

    expect(auth.signInWithRegistration).toHaveBeenCalledWith(TOKEN);
    expect(routerReplace).toHaveBeenCalledWith("/es");
    expect(routerReplace).not.toHaveBeenCalledWith("/es/account");
    expect(screen.queryByRole("heading", { name: TEXTS.registerSuccessTitle })).toBeNull();
    expect(locationMock.assign).not.toHaveBeenCalled();
  });

  it("shows the success panel when the 201 carries no token block (spec: The account is created)", async () => {
    auth.session = { state: "anonymous" };
    renderClient();

    await register({ data: {}, message: "m" });

    expect(screen.getByRole("heading", { name: TEXTS.registerSuccessTitle })).toBeTruthy();
    expect(auth.signInWithRegistration).not.toHaveBeenCalled();
  });
});

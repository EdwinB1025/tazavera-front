import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
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

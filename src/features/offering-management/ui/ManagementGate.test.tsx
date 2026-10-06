import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";

// notFound() is the behaviour under test for another role; a spy replaces the
// routing module so the call can be observed. Test infrastructure only.
const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

import { ManagementGate } from "./ManagementGate";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  notFound.mockReset();
});

/**
 * The session gate (design.md D6; spec "Access to the management area").
 * Written before `./ManagementGate` exists (task 3.1). The session and the
 * sign-in action arrive as props from the page, which reads them from
 * `@/features/auth` (features never import another feature).
 */

const TEXTS = {
  signedOutMessage: "Sign in to manage your offerings.",
  signInLabel: "Sign in",
};
const ROUTE = "/en/manage/offerings";

function coffeeshop(): Session {
  return {
    state: "authenticated",
    user: { ulid: "01USER", role: "coffeeshop", name: "Tazavera" },
  };
}

function renderGate(session: Session, onSignIn = vi.fn()) {
  render(
    <ManagementGate
      session={session}
      route={ROUTE}
      texts={TEXTS}
      onSignIn={onSignIn}
      loading={<p>loading branch</p>}
    >
      {() => <p>gated content</p>}
    </ManagementGate>,
  );
  return onSignIn;
}

describe("ManagementGate (design.md D6)", () => {
  it("renders the loading branch of its route while the session resolves, with no gate message", () => {
    renderGate({ state: "loading" });

    expect(screen.getByText("loading branch")).toBeTruthy();
    expect(screen.queryByText("gated content")).toBeNull();
    expect(screen.queryByText(TEXTS.signedOutMessage)).toBeNull();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("renders the signed-out message and the Sign in button in place of the content for an anonymous visitor", () => {
    renderGate({ state: "anonymous" });

    expect(screen.getByText(TEXTS.signedOutMessage)).toBeTruthy();
    expect(screen.getByRole("button", { name: TEXTS.signInLabel })).toBeTruthy();
    expect(screen.queryByText("gated content")).toBeNull();
    expect(screen.queryByText("loading branch")).toBeNull();
  });

  it("lays the signed-out branch out as a column 1rem apart, the button at its own width", () => {
    renderGate({ state: "anonymous" });

    const message = screen.getByText(TEXTS.signedOutMessage);
    expect(message.className).toBe("type-body");
    expect(message.parentElement!.className).toBe(
      "flex flex-col items-start gap-4",
    );
  });

  it("calls signIn with the current route synchronously within the Sign in click", () => {
    const onSignIn = renderGate({ state: "anonymous" });

    fireEvent.click(screen.getByRole("button", { name: TEXTS.signInLabel }));

    // Asserted right after the click, before any await: the popup must open
    // within the activation.
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith(ROUTE);
  });

  it("renders the content for a signed-in coffeeshop", () => {
    renderGate(coffeeshop());

    expect(screen.getByText("gated content")).toBeTruthy();
    expect(screen.queryByText(TEXTS.signedOutMessage)).toBeNull();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("passes the signed-in user to the content", () => {
    const children = vi.fn(() => null);
    render(
      <ManagementGate
        session={coffeeshop()}
        route={ROUTE}
        texts={TEXTS}
        onSignIn={vi.fn()}
        loading={null}
      >
        {children}
      </ManagementGate>,
    );

    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ ulid: "01USER", role: "coffeeshop" }),
    );
  });

  it.each(["specialist", "user"])(
    "renders the 404 for a signed-in %s",
    (role) => {
      renderGate({
        state: "authenticated",
        user: { ulid: "01OTHER", role },
      });

      expect(notFound).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("gated content")).toBeNull();
    },
  );
});

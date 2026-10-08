import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Session, SessionUser } from "@/shared/api";

// notFound() is the behaviour under test for a user the route does not
// allow; a spy replaces the routing module so the call can be observed.
// Test infrastructure only.
const { notFound } = vi.hoisted(() => ({ notFound: vi.fn() }));
vi.mock("next/navigation", () => ({ notFound }));

import { SessionGate } from "@/shared/ui";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  notFound.mockReset();
});

/**
 * The protected content gate (app-shell "Protected content gate"; design.md
 * D1): the consumer's `loading` node while the session resolves, its
 * `signedOut` node while it is anonymous, the application's 404 for a
 * signed-in user `allows` rejects and `children(user)` for an allowed one.
 * The gate renders no element and no text of its own.
 */

const USER: SessionUser = {
  ulid: "01USER",
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  role: "coffeeshop",
};

function renderGate(
  session: Session,
  allows?: (user: SessionUser) => boolean,
) {
  return render(
    <SessionGate
      session={session}
      loading={<p>loading branch</p>}
      signedOut={<p>signed-out branch</p>}
      allows={allows}
    >
      {(user) => <p data-testid="content">{user.name}</p>}
    </SessionGate>,
  );
}

describe("SessionGate", () => {
  it("renders the content for a signed-in coffeeshop", () => {
    renderGate(
      { state: "authenticated", user: USER },
      (user) => user.role === "coffeeshop",
    );

    expect(screen.getByTestId("content").textContent).toBe("Ana");
    expect(notFound).not.toHaveBeenCalled();
  });

  it.each(["coffeeshop", "specialist", "user"] as const)(
    "with no allows lets a signed-in %s through",
    (role) => {
      renderGate({ state: "authenticated", user: { ...USER, role } });

      expect(screen.getByTestId("content").textContent).toBe("Ana");
      expect(notFound).not.toHaveBeenCalled();
    },
  );

  it.each(["user"] as const)(
    "renders the 404 for a signed-in %s the route does not allow",
    (role) => {
      renderGate(
        { state: "authenticated", user: { ...USER, role } },
        (user) => user.role === "coffeeshop",
      );

      expect(notFound).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId("content")).toBeNull();
    },
  );
});

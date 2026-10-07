import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { RoleRow } from "@/features/user-account";

/**
 * The role row (spec "Profile settings"; design.md D9 and D10): a `dl` whose
 * `dt` is the role label and whose `dd` is `data.role` exactly as the API
 * returns it.
 */

afterEach(() => {
  cleanup();
});

describe("RoleRow", () => {
  it("is a dl with the label as dt and the role exactly as returned as dd", () => {
    const { container } = render(<RoleRow label="fx-role" role="coffeeshop" />);
    const list = container.querySelector("dl")!;
    expect(list).not.toBeNull();
    expect(list.querySelector("dt")?.textContent).toBe("fx-role");
    expect(list.querySelector("dd")?.textContent).toBe("coffeeshop");
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ManagementSidebarEntries } from "@/features/offering-management";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/**
 * The management sidebar entry (design.md D8 as revised by review round 1;
 * spec "Management sidebar entry"): one "Manage offerings" link to the list
 * route, marked as the current entry.
 */
describe("ManagementSidebarEntries (design.md D8)", () => {
  it("renders one link to the list route with its label, icon and current state", () => {
    render(<ManagementSidebarEntries locale="es" label="texts.sidebarManageOfferings" />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    const link = screen.getByRole("link", { name: "texts.sidebarManageOfferings" });
    expect(link.getAttribute("href")).toBe("/es/manage/offerings");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("data-active")).toBe("true");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent).toBe("texts.sidebarManageOfferings");
  });

  it("builds the target from the locale", () => {
    render(<ManagementSidebarEntries locale="ca" label="label" />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/ca/manage/offerings");
  });

  it("with current={false} has no aria-current and no active state (add-coffeeshop-location D8)", () => {
    render(<ManagementSidebarEntries locale="es" label="label" current={false} />);
    const link = screen.getByRole("link");
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.getAttribute("data-active")).toBe("false");
  });

  it("renders its children after its entry in the same list (add-coffeeshop-location D8)", () => {
    render(
      <ManagementSidebarEntries locale="es" label="label">
        <li data-testid="child" />
      </ManagementSidebarEntries>,
    );
    const list = screen.getByRole("list");
    const items = Array.from(list.children);
    expect(items).toHaveLength(2);
    expect(items[0].contains(screen.getByRole("link"))).toBe(true);
    expect(items[1]).toBe(screen.getByTestId("child"));
  });
});

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

/**
 * The "My evaluations" sidebar entry (design.md D5; spec "Management sidebar
 * entry"; tasks 9.3): a link to the list, marked as the current page on the
 * list route and unmarked on a form route.
 */

let pathname = "/es/manage/evaluations";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import { EvaluationsSidebarEntry } from "./EvaluationsSidebarEntry";

afterEach(cleanup);

function renderEntry() {
  render(<EvaluationsSidebarEntry locale="es" texts={{ label: "Mis evaluaciones", explore: "Explorar ofertas" }} />);
  return screen.getByRole("link", { name: "Mis evaluaciones" });
}

describe("EvaluationsSidebarEntry (design.md D5)", () => {
  it("links to the list and marks itself the current page on the list route", () => {
    pathname = "/es/manage/evaluations";
    const entry = renderEntry();
    expect(entry.getAttribute("href")).toBe("/es/manage/evaluations");
    expect(entry.getAttribute("aria-current")).toBe("page");
    expect(entry.getAttribute("data-slot")).toBe("sidebar-menu-button");
    expect(entry.closest("li")).not.toBeNull();
    expect(entry.closest("ul")).not.toBeNull();
  });

  it("lists Explore offerings second, to /es/offerings, never marked current (spec: The explore entry)", () => {
    pathname = "/es/manage/evaluations";
    const evaluations = renderEntry();
    const explore = screen.getByRole("link", { name: "Explorar ofertas" });
    expect(explore.getAttribute("href")).toBe("/es/offerings");
    expect(explore.getAttribute("aria-current")).toBeNull();
    const links = Array.from(evaluations.closest("ul")!.querySelectorAll("a"));
    expect(links).toEqual([evaluations, explore]);
  });

  it("is not marked on a form route", () => {
    for (const route of ["/es/manage/evaluations/new", "/es/manage/evaluations/01JEVAL"]) {
      pathname = route;
      const entry = renderEntry();
      expect(entry.getAttribute("aria-current")).toBeNull();
      cleanup();
    }
  });
});

import { describe, it, expect, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// Top-level import: the whole file fails to load until `src/shared/ui/icons`
// exists, which is the "verification fails" expectation of task 1.2.
import {
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Clock,
  Globe,
  SlidersHorizontal,
  X,
  Trash2,
  List,
  BeanMark,
  type LucideIcon,
} from "@/shared/ui/icons";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

describe("icon entry point (src/shared/ui/icons.ts)", () => {
  it("exports the required icons and the LucideIcon type", () => {
    expect(Loader2).toBeDefined();
    expect(ArrowLeft).toBeDefined();
    // `LucideIcon` is a type-only export, verified at compile time by
    // `npx tsc --noEmit`; the assignment below keeps it referenced.
    const icon: LucideIcon = ArrowLeft;
    expect(icon).toBe(ArrowLeft);
  });

  it("exports the form-field icons (form-fields design.md D6)", () => {
    // Password visibility toggle (Eye / EyeOff), select chevron (ChevronDown)
    // and the checkbox check mark (Check). They are not exported yet, so this
    // test runs and fails until task 1.7 re-exports them.
    expect(Eye).toBeDefined();
    expect(EyeOff).toBeDefined();
    expect(ChevronDown).toBeDefined();
    expect(Check).toBeDefined();
  });

  it("exports the clock icon of the provisional badge (add-landing design.md D7)", () => {
    // `Clock` joins the entry for the provisional badge's icon. It is not
    // exported yet, so this test runs and fails until the badge slice
    // re-exports it beside the other icons.
    expect(Clock).toBeDefined();
  });

  it("exports Globe beside ChevronDown (refine-app-header design.md D8)", () => {
    // The language control's globe icon. It is not exported yet, so this test
    // runs and fails until task 2.2 re-exports it beside `ChevronDown`.
    expect(Globe).toBeDefined();
  });

  it("exports SlidersHorizontal and X (add-facet-controls design.md D10)", () => {
    // The facet sets' "Filters" trigger icon and the applied-filter chip's
    // remove icon. They are not exported yet, so this test fails until task
    // 2.2 re-exports them.
    expect(SlidersHorizontal).toBeDefined();
    expect(X).toBeDefined();
  });

  it("exports Trash2 (add-offering-management design.md D7)", () => {
    // The Delete actions' icon of the management list. It is not exported
    // yet, so this test fails until task 4.2 re-exports it.
    expect(Trash2).toBeDefined();
  });

  it("exports List (add-offering-management design.md D8)", () => {
    // The "Manage offerings" sidebar entry's icon. It is not exported yet,
    // so this test fails until task 8.2 re-exports it.
    expect(List).toBeDefined();
  });

  it("is the only module under src/ that imports lucide-react", () => {
    const srcRoot = pathResolve(process.cwd(), "src");
    const offenders: string[] = [];

    const visit = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = pathResolve(dir, entry);
        if (statSync(full).isDirectory()) {
          visit(full);
        } else if (
          (full.endsWith(".ts") || full.endsWith(".tsx")) &&
          // Exclude test files: the guard targets component import sites, and
          // tests reference lucide-react in prose/comments/patterns.
          !full.endsWith(".test.ts") &&
          !full.endsWith(".test.tsx")
        ) {
          const content = readFileSync(full, "utf-8");
          // Correction 9 (review round 1): catch the bare module import, the
          // subpath import (lucide-react/…) and the dynamic import. The
          // single audit point is icons.ts.
          if (
            /from\s+["']lucide-react(?:\/[^"']+)?["']/.test(content) ||
            /import\(\s*["']lucide-react(?:\/[^"']+)?["']\s*\)/.test(content)
          ) {
            offenders.push(full);
          }
        }
      }
    };

    visit(srcRoot);

    const allowed = pathResolve(srcRoot, "shared/ui/icons.ts");
    expect(offenders).toEqual([allowed]);
  });
});

describe("BeanMark bean artwork (add-evaluation-scales design.md D4)", () => {
  // Written before the artwork exists (task 1.6): `BeanMark` is not exported
  // from `src/shared/ui/icons.ts` yet, so these tests run and fail until
  // task 1.7 adds it. jsdom has no CSS engine, so the artwork is verified by
  // its exact token classes (design.md D4: the disc a full circle in
  // `fill-evaluation-bean-on`/`-off`, the bean path in the matching
  // `fill-`/`stroke-evaluation-bean-mark-on`/`-mark-off`).

  it("is exported from the icon entry point", () => {
    expect(BeanMark).toBeDefined();
  });

  it("renders aria-hidden, being decorative artwork", () => {
    const { container } = render(createElement(BeanMark, { variant: "on" }));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-hidden")).not.toBeNull();
  });

  it('variant "on": the disc in fill-evaluation-bean-on, the path in the matching mark tokens', () => {
    const { container } = render(createElement(BeanMark, { variant: "on" }));
    const svg = container.querySelector("svg");
    const disc = svg!.querySelector(".fill-evaluation-bean-on");
    const mark = svg!.querySelector(
      "path.fill-evaluation-bean-mark-on.stroke-evaluation-bean-mark-on",
    );
    expect(disc).not.toBeNull();
    expect(mark).not.toBeNull();
    // the disc is the background shape and the path draws the bean on it
    expect(disc).not.toBe(mark);
  });

  it('variant "off": the disc in fill-evaluation-bean-off, the path in the matching mark tokens', () => {
    const { container } = render(createElement(BeanMark, { variant: "off" }));
    const svg = container.querySelector("svg");
    const disc = svg!.querySelector(".fill-evaluation-bean-off");
    const mark = svg!.querySelector(
      "path.fill-evaluation-bean-mark-off.stroke-evaluation-bean-mark-off",
    );
    expect(disc).not.toBeNull();
    expect(mark).not.toBeNull();
    // the disc is the background shape and the path draws the bean on it
    expect(disc).not.toBe(mark);
  });
});

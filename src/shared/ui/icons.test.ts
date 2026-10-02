import { describe, it, expect } from "vitest";
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
  type LucideIcon,
} from "@/shared/ui/icons";

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

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// Top-level import: the whole file fails to load until `src/shared/ui/icons`
// exists, which is the "verification fails" expectation of task 1.2.
import { Loader2, ArrowLeft, type LucideIcon } from "@/shared/ui/icons";

describe("icon entry point (src/shared/ui/icons.ts)", () => {
  it("exports the required icons and the LucideIcon type", () => {
    expect(Loader2).toBeDefined();
    expect(ArrowLeft).toBeDefined();
    // `LucideIcon` is a type-only export, verified at compile time by
    // `npx tsc --noEmit`; the assignment below keeps it referenced.
    const icon: LucideIcon = ArrowLeft;
    expect(icon).toBe(ArrowLeft);
  });

  it("is the only module under src/ that imports lucide-react", () => {
    const srcRoot = pathResolve(process.cwd(), "src");
    const offenders: string[] = [];

    const visit = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = pathResolve(dir, entry);
        if (statSync(full).isDirectory()) {
          visit(full);
        } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
          const content = readFileSync(full, "utf-8");
          if (/from\s+["']lucide-react["']/.test(content)) {
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

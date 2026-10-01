import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing design rule 1 at the code level: radii in
 * `src/shared/ui` component code come from the radius tokens
 * (`rounded-pill`, `rounded-container`, `rounded-field`, `rounded-check`) —
 * never from Tailwind's built-in radius utilities.
 *
 * The dark theme reassigns every `--radius-*` token to 0; a hardcoded
 * built-in radius utility would ignore that reassignment and stay round, so
 * the shape would not switch with the theme. Test files are excluded from the
 * scan: the guard targets component source where styling lives; a test that
 * references a forbidden class only does so in prose, never as styling.
 */
describe("radius-utility guard", () => {
  const uiDir = pathResolve(process.cwd(), "src/shared/ui");

  // The six built-in radius utilities the tokens replace. Each is anchored as
  // a complete class name so it does not match the token utilities above.
  const FORBIDDEN = /\brounded-(?:sm|md|lg|xl|2xl|full)\b/;

  /** Recursively collect component source files (excluding tests) in a dir. */
  function collectSourceFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = pathResolve(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...collectSourceFiles(full));
      } else if (
        (full.endsWith(".ts") || full.endsWith(".tsx")) &&
        !full.endsWith(".test.ts") &&
        !full.endsWith(".test.tsx")
      ) {
        files.push(full);
      }
    }
    return files;
  }

  it("no component file in src/shared/ui uses a built-in Tailwind radius utility", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(uiDir)) {
      const content = readFileSync(file, "utf-8");
      // Report each offending file once with the class that triggered it,
      // so the failure names the offending control.
      const match = content.match(FORBIDDEN);
      if (match) {
        offenders.push(`${file} (uses "${match[0]}")`);
      }
    }
    expect(
      offenders,
      `built-in radius utilities are forbidden in src/shared/ui: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

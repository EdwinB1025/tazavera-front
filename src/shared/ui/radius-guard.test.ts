import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing design rule 1 at the code level (correction 8, review
 * round 1): radii in `src/shared/ui` component code come from the radius
 * tokens only. The guard is an ALLOWLIST — the only `rounded-*` utilities
 * permitted are:
 *
 *   rounded-pill, rounded-container, rounded-field, rounded-check (the tokens),
 *   rounded-full     (intrinsic circles: radio, coffee bean, slider thumb,
 *                     avatar — whose shape is not a corner radius),
 *   rounded-none     (the documented no-radius cases).
 *
 * Any other rounded utility fails: bare `rounded`, any size suffix
 * (`rounded-sm`/`md`/`lg`/`xl`/`2xl`), directional variants (`rounded-t-*`,
 * `rounded-s-*`, `rounded-tl-*`, …) and arbitrary values (`rounded-[…]`).
 *
 * The dark theme reassigns every `--radius-*` token to 0; a hardcoded
 * built-in radius utility would ignore that reassignment and stay round, so
 * the shape would not switch with the theme. Test files are excluded from the
 * scan: the guard targets component source where styling lives; a test that
 * references a forbidden class only does so in prose, never as styling.
 */
describe("radius-utility guard (allowlist)", () => {
  const uiDir = pathResolve(process.cwd(), "src/shared/ui");

  // The exact set of rounded utilities permitted in src/shared/ui component
  // source. Anything else is a violation.
  const ALLOWED = new Set([
    "rounded-pill",
    "rounded-container",
    "rounded-field",
    "rounded-check",
    "rounded-full",
    "rounded-none",
  ]);

  // A rounded utility token is `rounded` optionally preceded by state prefixes
  // (hover:, focus:, enabled:, …) and followed by a non-space boundary. We
  // capture the bare `rounded[-suffix]` part and check it against the allowlist.
  // This matches bare `rounded`, `rounded-sm`, `rounded-tl-lg`, `rounded-[8px]`
  // and `rounded-full` alike; the allowlist decides what passes.
  const ROUNDED_TOKEN = /(?<![\w-])((?:[a-z-]+:)*rounded(?:-[a-z0-9]+)?(?:-\[[^\]]+\])?)/g;

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

  it("uses only allowlisted rounded utilities in src/shared/ui", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(uiDir)) {
      const content = readFileSync(file, "utf-8");
      for (const match of content.matchAll(ROUNDED_TOKEN)) {
        const token = match[1]!;
        // Strip state prefixes (hover:, enabled:, …) before checking.
        const bare = token.replace(/^[a-z-]+:/, "");
        if (!ALLOWED.has(bare)) {
          offenders.push(`${file} (uses "${token}")`);
        }
      }
    }
    expect(
      offenders,
      `non-allowlisted rounded utilities are forbidden in src/shared/ui: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

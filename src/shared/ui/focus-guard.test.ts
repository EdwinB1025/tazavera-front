import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing the shared focus indicator (design.md D4) at the code
 * level (spec: "Shared focus indicator"): no interactive control in
 * `src/shared/ui` renders a focus treatment of its own. A hand-rolled focus
 * set — `outline-none`, `ring-*` or `ring-offset-*` utilities in any state
 * prefix — diverges from the shared indicator the moment that indicator
 * changes, so it fails naming the offending class and file. The migrated
 * controls must carry the shared `focus-visible:focus-ring` class instead.
 *
 * Test files are excluded: the guard targets component source where styling
 * lives; a test that references a forbidden class only does so in prose or
 * assertions. Class strings are scanned as string literals (the color-guard
 * pattern): utilities live inside strings, so prose in comments cannot
 * trip the guard.
 */

// ─── Hand-rolled focus grammar ───
// A Tailwind class token is `[state:]?*<utility>`, state prefixes stacking and
// always ending in `:`. The forbidden utilities are `outline-none` and the
// `ring-*` family (which includes `ring-offset-*`: a compound `ring-` suffix).
// Bare `ring` with no suffix is not a utility and is not forbidden. The token
// must match whole, so `focus-ring` and `focus-visible:focus-ring` — the
// shared indicator itself — never trip the guard.
const HAND_ROLLED_FOCUS = /^(?:[a-z-]+:)*(?:outline-none|ring(?:-[a-z0-9]+)+)$/;

/** The shared indicator class every migrated control carries (D3). */
const SHARED_FOCUS_CLASS = "focus-visible:focus-ring";

describe("focus-indicator guard", () => {
  const uiDir = pathResolve(process.cwd(), "src/shared/ui");

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

  /**
   * Extract className tokens from a source file: whitespace-separated tokens
   * inside single-quoted, double-quoted and backtick strings (the color-guard
   * pattern). Over-inclusive by design; the matcher decides what is a
   * hand-rolled focus utility.
   */
  function extractClassTokens(content: string): string[] {
    const tokens: string[] = [];
    const stringLiteral = /(["'`])((?:\\.|(?!\1).)*)\1/g;
    let lit: RegExpExecArray | null;
    while ((lit = stringLiteral.exec(content)) !== null) {
      for (const tok of lit[2]!.split(/\s+/)) {
        if (tok.length > 0) tokens.push(tok);
      }
    }
    return tokens;
  }

  it("no src/shared/ui control defines its own focus treatment", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(uiDir)) {
      const content = readFileSync(file, "utf-8");
      for (const tok of extractClassTokens(content)) {
        if (HAND_ROLLED_FOCUS.test(tok)) {
          offenders.push(`${file} (uses "${tok}")`);
        }
      }
    }
    expect(
      offenders,
      `hand-rolled focus indicators are forbidden in src/shared/ui: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the migrated controls carry focus-visible:focus-ring", () => {
    for (const name of [
      "Button.tsx",
      "Link.tsx",
      "Input.tsx",
      "Select.tsx",
      "Textarea.tsx",
      "Checkbox.tsx",
      "RadioGroup.tsx",
    ]) {
      const content = readFileSync(pathResolve(uiDir, name), "utf-8");
      expect(
        extractClassTokens(content).includes(SHARED_FOCUS_CLASS),
        `${name} must apply the shared ${SHARED_FOCUS_CLASS} (design.md D3)`,
      ).toBe(true);
    }
  });
});

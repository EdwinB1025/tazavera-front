import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing design rule 1 (semantic tokens only) at the code level
 * for color utilities (correction 5, review round 1). Every color utility used
 * in `src/shared/ui` component source — `bg-`, `text-`, `border-`, `ring-`,
 * `ring-offset-`, including state-prefixed variants like `hover:` or
 * `enabled:` — must map to a `--color-*` token defined in
 * `src/app/styles/globals.css` or to a Tailwind built-in color (e.g. white,
 * black). A utility whose token does not exist (e.g. `text-link` when only
 * `--color-text-link` is defined) generates no CSS, so the color would silently
 * not apply. The guard fails naming the offending class and file.
 *
 * Test files are excluded: the guard targets component source where styling
 * lives; a test that references a class only does so in prose or assertions.
 */

// ─── Color utilities grammar ───
// A Tailwind color utility has the shape [state:]?(bg|text|border|ring|ring-offset)-<name>
// where <name> is a token name (kebab, may include digits like `cream-100`) or
// `<name>/<shade>`. State prefixes can stack and include things like `hover:`,
// `focus:`, `enabled:`, `disabled:`, `motion-reduce:`, etc., always ending in
// `:`. We capture the property group and the color name after it.
//
// `ring-offset` must be tried before `ring` (alternation is ordered) so
// `ring-offset-focus-offset` parses as property `ring-offset` + name
// `focus-offset`, not `ring` + `offset-focus-offset`.
//
// A purely-numeric name (e.g. `2` in `ring-2`, `ring-offset-2`) is a ring WIDTH
// utility, not a color utility, and is skipped: color token names are always
// alphabetic at the start.
const COLOR_UTILITY =
  /^(?:[a-z-]+:)*(bg|text|border|ring-offset|ring)-([a-z0-9][a-z0-9-]*)(?:\/[a-z0-9]+)?$/;

// ─── Built-in Tailwind color names that exist without a --color-* token in
// this project (Tailwind ships them by default). Only the ones actually used.
const BUILTIN_COLOR_NAMES = new Set(["white", "black", "transparent", "current"]);

describe("color-utility guard", () => {
  const uiDir = pathResolve(process.cwd(), "src/shared/ui");
  const globalsPath = pathResolve(
    process.cwd(),
    "src/app/styles/globals.css",
  );
  const globalsCss = readFileSync(globalsPath, "utf-8");

  // Collect every --color-* token name (without the leading --color-) defined
  // anywhere in globals.css (traditional @theme + dark [data-theme] block).
  const definedColorTokens = new Set<string>();
  for (const match of globalsCss.matchAll(/(--color-([a-z0-9-]+))\s*:/g)) {
    definedColorTokens.add(match[2]!);
  }

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
   * Extract className tokens from a source file. We scan string literals and
   * template literals for whitespace-separated tokens; this is intentionally
   * simple and over-inclusive (it may pick up non-class strings), but any token
   * that does not look like a color utility is ignored by the matcher, so the
   * only way to fail is to actually use a color utility that maps to no token.
   */
  function extractClassTokens(content: string): string[] {
    // Match the contents of single-quoted, double-quoted and backtick strings.
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

  it("every color utility in src/shared/ui maps to a --color-* token or a built-in color", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(uiDir)) {
      const content = readFileSync(file, "utf-8");
      for (const tok of extractClassTokens(content)) {
        const m = tok.match(COLOR_UTILITY);
        if (!m) continue;
        const colorName = m[2]!;
        // Purely-numeric names are ring WIDTH utilities (ring-2, ring-offset-2),
        // not color utilities; skip them.
        if (/^\d+$/.test(colorName)) continue;
        if (BUILTIN_COLOR_NAMES.has(colorName)) continue;
        if (definedColorTokens.has(colorName)) continue;
        offenders.push(`${file} (uses "${tok}" → no --color-${colorName} token)`);
      }
    }

    expect(
      offenders,
      `color utilities with no matching --color-* token in src/shared/ui: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

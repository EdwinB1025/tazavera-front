import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing "Shared chip geometry" at the code level (spec scenario
 * "Second geometry definition detected"): the badge's geometry has exactly one
 * definition. `src/shared/ui/Badge.tsx` exports it as `BADGE_GEOMETRY_CLASSES`
 * and is the only file allowed to spell it out; a second spelling of the seven
 * tokens as literal class names — in one string or collected in a class array —
 * would silently drift the moment the geometry changes, so the guard fails
 * naming the file holding it (design.md D4).
 *
 * Scope: the non-test `.ts` and `.tsx` files under `src/`. Test files are
 * excluded: they reference class names in prose and assertions only, never as
 * styling. `src/app/styles/globals.css` defines `@utility type-badge`, the
 * text treatment's own definition, and is outside the scan.
 *
 * A file holding only some of the tokens passes: a partial set is not a second
 * definition of the geometry. A chip that imports `BADGE_GEOMETRY_CLASSES` and
 * adds its own classes passes too — the geometry arrives from the single
 * definition, not from literals.
 */
describe("badge-geometry guard (one geometry definition)", () => {
  const srcDir = pathResolve(process.cwd(), "src");
  // The single definition of the geometry (design.md D1).
  const definitionFile = pathResolve(process.cwd(), "src/shared/ui/Badge.tsx");

  // The seven geometry tokens `BADGE_GEOMETRY_CLASSES` holds, in the order
  // `Badge.test.tsx` pins (design.md D2).
  const GEOMETRY_TOKENS = [
    "type-badge",
    "rounded-field",
    "inline-flex",
    "items-center",
    "gap-1",
    "px-2",
    "py-0.5",
  ];

  /** Recursively collect source files (excluding tests) under src/. */
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
   * pattern). Over-inclusive by design; the check below decides what is a
   * second geometry definition. Tokens are compared whole, so a class array
   * and one class string are caught alike.
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

  it("holds all seven geometry tokens in no file but src/shared/ui/Badge.tsx", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(srcDir)) {
      if (file === definitionFile) continue;
      const tokens = new Set(extractClassTokens(readFileSync(file, "utf-8")));
      if (GEOMETRY_TOKENS.every((token) => tokens.has(token))) {
        offenders.push(file);
      }
    }
    expect(
      offenders,
      `the badge geometry is defined once, in src/shared/ui/Badge.tsx; a second definition is forbidden: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

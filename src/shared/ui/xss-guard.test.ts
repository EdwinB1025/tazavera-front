import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing spec requirement "No injected raw HTML" at the code
 * level. No rendering under `src/` may inject markup as raw HTML, which in
 * React means the `dangerouslySetInnerHTML` prop. The guard is a source scan
 * over `src/` in the pattern of `color-guard.test.ts`: test files are
 * excluded, and comments and string literals are ignored so the guard reports
 * code that actually injects raw HTML, never prose about it. It fails naming
 * the offending file and rendering.
 */

/** The React prop that injects markup as raw HTML. */
const RAW_HTML_PROP = /\bdangerouslySetInnerHTML\b/g;

describe("xss guard (no injected raw HTML)", () => {
  const srcRoot = pathResolve(process.cwd(), "src");

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
   * Blank out comments and the contents of string and template literals, so
   * only real code is matched (the client-boundary guard's pattern). The
   * `dangerouslySetInnerHTML` prop name is code — a JSX attribute or a
   * property — so it stays visible; a mention inside a comment or string
   * does not.
   */
  function stripCommentsAndStrings(src: string): string {
    let code = "";
    let i = 0;
    while (i < src.length) {
      const c = src[i]!;
      const next = src[i + 1];
      if (c === "/" && next === "/") {
        while (i < src.length && src[i] !== "\n") i++;
        code += " ";
        continue;
      }
      if (c === "/" && next === "*") {
        i += 2;
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
        i = Math.min(i + 2, src.length);
        code += " ";
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        const start = i;
        const quote = c;
        i++;
        while (i < src.length) {
          if (src[i] === "\\") {
            i += 2;
            continue;
          }
          if (src[i] === quote) {
            i++;
            break;
          }
          i++;
        }
        code += " ".repeat(i - start);
        continue;
      }
      code += c;
      i++;
    }
    return code;
  }

  it("no rendering under src/ injects markup as raw HTML", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(srcRoot)) {
      const code = stripCommentsAndStrings(readFileSync(file, "utf-8"));
      for (const match of code.matchAll(RAW_HTML_PROP)) {
        const line = code.slice(0, match.index).split("\n").length;
        offenders.push(`${file}:${line} (renders with "${match[0]}")`);
      }
    }

    expect(
      offenders,
      `renderings that inject markup as raw HTML are forbidden under src/: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

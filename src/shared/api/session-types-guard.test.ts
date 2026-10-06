import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Guard test enforcing design.md D1 and D7 of `add-auth`: `Session`,
 * `SessionUser` and `UserRole` are the session contract `add-app-shell`
 * declares in `src/shared/api/index.ts` and this change only imports them.
 * A second declaration would silently redefine the contract and drift from
 * it, so no file under `src/` except `src/shared/api/index.ts` may declare a
 * type or interface with one of those names. The guard is a source scan over
 * `src/` in the pattern of `color-guard.test.ts`: test files are excluded,
 * and comments and string literals are ignored so the guard reports real
 * declarations, never prose about them. It fails naming the offending file.
 */

// A type or interface declaration of one of the guarded names. The name must
// follow `type` or `interface` directly, so imports (`import type { Session }`)
// and re-exports (`export type { Session }`) match nothing. The names are
// tried longest first so `SessionUser` wins over `Session`.
const SESSION_TYPE_DECLARATION =
  /\b(?:type|interface)\s+(SessionUser|UserRole|Session)\b/g;

// The single file allowed to declare them (its own design.md D4).
const CONTRACT_FILE = pathResolve(process.cwd(), "src/shared/api/index.ts");

describe("session-types guard", () => {
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
   * only real code is matched (the client-boundary guard's pattern). A
   * declaration is code, so it stays visible; a mention inside a comment or
   * string does not.
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

  it("no file under src/ except src/shared/api/index.ts declares Session, SessionUser or UserRole", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(srcRoot)) {
      if (file === CONTRACT_FILE) continue;
      const code = stripCommentsAndStrings(readFileSync(file, "utf-8"));
      for (const match of code.matchAll(SESSION_TYPE_DECLARATION)) {
        const line = code.slice(0, match.index).split("\n").length;
        offenders.push(`${file}:${line} (declares "${match[1]}")`);
      }
    }

    expect(
      offenders,
      `the session contract types are declared only in src/shared/api/index.ts: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Client-boundary guard for `src/shared/ui`.
 *
 * A source file that declares client-only behaviour — an `onX` event-handler
 * prop, a React hook (`use[A-Z]…`) or a browser global (`window`, `document`)
 * — must have `"use client"` as its first statement. Without the directive
 * Next.js treats the module as part of the Server Component graph, and a
 * component that defines its own event handler (such as `Button`) cannot be
 * rendered from a Server Component. The guard fails naming the offending file.
 *
 * Test files are excluded: they never cross the boundary. Comments and string
 * literals are ignored, so the guard reports code that actually uses a client
 * construct, not prose about it.
 */

// ─── Client-only constructs (matched against code, not comments/strings) ───
// `on` + uppercase catches props and handlers (onClick, onSubmit, …) without
// matching the tail of identifiers such as `MouseEventHandler`.
const EVENT_HANDLER = /\bon[A-Z][A-Za-z0-9]*\b/;
// `use` + uppercase catches hook calls (useState, useEffect, …).
const REACT_HOOK = /\buse[A-Z][A-Za-z0-9]*\b/;
const BROWSER_GLOBAL = /\b(?:window|document)\b/;

/** The directive itself, as the first statement of the file. */
const USE_CLIENT = /^["']use client["']\s*;?/;

describe("client-boundary guard", () => {
  const uiDir = pathResolve(process.cwd(), "src/shared/ui");

  /** Recursively collect source files (excluding tests) in a dir. */
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
   * Single pass over the source.
   * `prologue` has comments removed but string literals kept, so the
   * `"use client"` directive stays visible; `code` has both comments and
   * string/template literal contents blanked out, so only real code is
   * matched against the client-only constructs.
   */
  function strip(src: string): { prologue: string; code: string } {
    let prologue = "";
    let code = "";
    let i = 0;
    while (i < src.length) {
      const c = src[i]!;
      const next = src[i + 1];
      if (c === "/" && next === "/") {
        // line comment: consumed up to (not including) the newline
        while (i < src.length && src[i] !== "\n") i++;
        prologue += " ";
        code += " ";
        continue;
      }
      if (c === "/" && next === "*") {
        i += 2;
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
        i = Math.min(i + 2, src.length);
        prologue += " ";
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
        prologue += src.slice(start, i);
        code += " ".repeat(i - start);
        continue;
      }
      prologue += c;
      code += c;
      i++;
    }
    return { prologue, code };
  }

  /** True when the file opens with the `"use client"` directive. */
  function hasUseClientDirective(prologue: string): boolean {
    return USE_CLIENT.test(prologue.replace(/^\uFEFF/, "").trimStart());
  }

  it('every src/shared/ui source file with client-only constructs starts with "use client"', () => {
    const offenders: string[] = [];

    for (const file of collectSourceFiles(uiDir)) {
      const { prologue, code } = strip(readFileSync(file, "utf-8"));
      if (hasUseClientDirective(prologue)) continue;

      const found = [
        EVENT_HANDLER.test(code) && "an onX event-handler prop",
        REACT_HOOK.test(code) && "a React hook (use[A-Z]…)",
        BROWSER_GLOBAL.test(code) && "a browser global (window, document)",
      ].filter((reason): reason is string => Boolean(reason));

      if (found.length > 0) {
        offenders.push(
          `${file}: uses ${found.join(", ")} without "use client" as its first statement`,
        );
      }
    }

    expect(
      offenders,
      `src/shared/ui files that must declare "use client" as their first statement:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

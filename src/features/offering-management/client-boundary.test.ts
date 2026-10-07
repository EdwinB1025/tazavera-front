import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Client-boundary guard for the `offering-management` slice.
 *
 * The slice's public API is imported by Server Components (the `@sidebar`
 * entry blocks of `src/pages/manage-offerings` and `src/pages/new-offering`),
 * so every module it re-exports is part of the Server Component graph unless
 * it declares `"use client"`. A module that imports a React hook from `react`
 * without the directive makes `next build` fail on both management routes,
 * and a module passing an icon component as a prop (`icon={…}`) to a client
 * component without it fails the render of both routes (a function cannot
 * cross from a Server Component to a Client Component). The guard fails
 * naming the offending file.
 */

/** A named import of a hook (`use…`) from `react`. */
const REACT_HOOK_IMPORT = /import\s*\{[^}]*\buse[A-Z]\w*[^}]*\}\s*from\s*["']react["']/;
/** An icon component passed as a JSX prop. */
const ICON_PROP = /\bicon=\{[A-Z]\w*\}/;
/** The directive as the first statement, after leading comments. */
const USE_CLIENT = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/;

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = pathResolve(dir, entry);
    if (statSync(full).isDirectory()) files.push(...collectSourceFiles(full));
    else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) files.push(full);
  }
  return files;
}

describe("offering-management client-boundary guard", () => {
  it('every module importing a React hook starts with "use client"', () => {
    const dir = pathResolve(process.cwd(), "src/features/offering-management");
    const offenders = collectSourceFiles(dir).filter((file) => {
      const src = readFileSync(file, "utf-8");
      return REACT_HOOK_IMPORT.test(src) && !USE_CLIENT.test(src);
    });
    expect(offenders).toEqual([]);
  });
  it('every module passing an icon component as a prop starts with "use client"', () => {
    const dir = pathResolve(process.cwd(), "src/features/offering-management");
    const offenders = collectSourceFiles(dir).filter((file) => {
      const src = readFileSync(file, "utf-8");
      return ICON_PROP.test(src) && !USE_CLIENT.test(src);
    });
    expect(offenders).toEqual([]);
  });
});

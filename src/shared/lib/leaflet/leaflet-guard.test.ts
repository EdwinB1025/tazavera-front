import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

/**
 * Leaflet entry point guard (add-coffeeshop-directory design.md D16; AGENTS.md
 * "each external asset library has a single entry point in src/shared"). Any
 * import of `leaflet` or a `leaflet/…` path — static, type-only, side-effect,
 * re-export or dynamic — outside the entry point fails. Test files are left
 * out: they may mock the entry point.
 */

const SRC_ROOT = pathResolve(process.cwd(), "src");
const ENTRY_POINT = pathResolve(SRC_ROOT, "shared/lib/leaflet/index.ts");
const LEAFLET_IMPORT = /(?:from\s+|import\s+|import\(\s*)["']leaflet(?:\/[^"']*)?["']/;

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = pathResolve(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) {
      files.push(full);
    }
  }
  return files;
}

describe("leaflet entry point (src/shared/lib/leaflet)", () => {
  it("is the only module under src/ that imports leaflet", () => {
    const importers = sourceFiles(SRC_ROOT).filter((file) =>
      LEAFLET_IMPORT.test(readFileSync(file, "utf-8")),
    );
    expect(importers).toEqual([ENTRY_POINT]);
  });

  it("exists and imports the Leaflet stylesheet", () => {
    expect(existsSync(ENTRY_POINT)).toBe(true);
    expect(readFileSync(ENTRY_POINT, "utf-8")).toMatch(/import\s+["']leaflet\/dist\/leaflet\.css["']/);
  });
});

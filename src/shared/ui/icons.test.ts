import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import * as icons from "@/shared/ui/icons";

/**
 * Shared icon source guard (base-controls spec "Shared icon source"; design.md
 * D6 of add-base-control and every change that added an icon). One general
 * test: it scans every non-test module under src/ and lists the offending
 * items. A module offends when it imports lucide-react and is not the entry
 * point, and an icon offends when a module imports it from the entry point
 * (or the entry point's own icons are required by a design) and the entry
 * point does not export it.
 */

const SRC_ROOT = pathResolve(process.cwd(), "src");
const ENTRY = pathResolve(SRC_ROOT, "shared/ui/icons.ts");

// Icons the designs require from the entry point, whether or not a module
// imports them today (design.md D6 of add-base-control, form-fields D6,
// add-landing D7, refine-app-header D8, add-facet-controls D10,
// add-offering-management D7 and D8, refine-list-pagination D6,
// add-user-contact D8, add-coffeeshop-location D8 and D9,
// add-coffeeshop-directory D15, add-evaluation-scales D4).
const REQUIRED = [
  "Loader2",
  "ArrowLeft",
  "LucideIcon",
  "Eye",
  "EyeOff",
  "ChevronDown",
  "Check",
  "Clock",
  "Globe",
  "SlidersHorizontal",
  "X",
  "Trash2",
  "List",
  "ChevronLeft",
  "Plus",
  "MapPin",
  "MapPinOff",
  "MapIcon",
  "Minus",
  "BeanMark",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = pathResolve(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    const isSource = full.endsWith(".ts") || full.endsWith(".tsx");
    // Test files reference lucide-react in prose and patterns.
    const isTest = full.endsWith(".test.ts") || full.endsWith(".test.tsx");
    return isSource && !isTest ? [full] : [];
  });
}

/** Names a module imports from the icon entry point, by alias or relative path. */
function importedIconNames(file: string, content: string): string[] {
  const names: string[] = [];
  const importPattern = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g;
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[3];
    const target = specifier.startsWith(".")
      ? pathResolve(dirname(file), specifier)
      : specifier.replace(/^@\//, `${SRC_ROOT}/`);
    if (pathResolve(target) !== ENTRY.replace(/\.ts$/, "")) continue;
    for (const part of match[2].split(",")) {
      const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      if (name) names.push(name);
    }
  }
  return names;
}

describe("icon entry point (src/shared/ui/icons.ts)", () => {
  it("is the only module under src/ that imports lucide-react, and exports every icon the app uses", () => {
    const entrySource = readFileSync(ENTRY, "utf-8");
    const exported = (name: string): boolean =>
      name in icons ||
      // Type-only exports (LucideIcon) have no runtime value.
      new RegExp(`export\\s*\\{[^}]*\\btype\\s+${name}\\b`).test(entrySource);

    const offenders: string[] = [];
    const used = new Set(REQUIRED);
    for (const file of sourceFiles(SRC_ROOT)) {
      const content = readFileSync(file, "utf-8");
      // Correction 9 (review round 1): the bare module import, the subpath
      // import (lucide-react/…) and the dynamic import.
      const importsLucide =
        /from\s+["']lucide-react(?:\/[^"']+)?["']/.test(content) ||
        /import\(\s*["']lucide-react(?:\/[^"']+)?["']\s*\)/.test(content);
      if (importsLucide && file !== ENTRY) {
        offenders.push(`imports lucide-react: ${file}`);
      }
      for (const name of importedIconNames(file, content)) used.add(name);
    }
    for (const name of used) {
      if (!exported(name)) offenders.push(`not exported by the entry point: ${name}`);
    }

    expect(offenders).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// jsdom computes no cursor, so the scenario reads the stylesheet and the two
// shared popups as text, as theme-tokens.test.ts reads globals.css.
function read(path: string): string {
  return readFileSync(pathResolve(process.cwd(), path), "utf-8");
}

/** The selector of the base-layer rule whose body is `cursor: pointer;`, or null. */
function basePointerSelector(css: string): string | null {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of source.matchAll(/@layer base\s*\{/g)) {
    let depth = 0;
    let ruleStart = match.index + match[0].length;
    for (let i = ruleStart; i < source.length; i += 1) {
      if (source[i] === "{") {
        depth += 1;
        const end = source.indexOf("}", i);
        if (depth === 1 && source.slice(i + 1, end).trim() === "cursor: pointer;") {
          return source.slice(ruleStart, i).trim();
        }
      } else if (source[i] === "}") {
        if (depth === 0) break;
        depth -= 1;
        ruleStart = i + 1;
      }
    }
  }
  return null;
}

const ELEMENTS = ["a[href]", "button", "summary", "label[for]", "select"];
const INPUT_TYPES = ["checkbox", "radio", "range", "submit", "button", "reset"];
const ROLES = [
  "button", "tab", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "switch", "checkbox", "radio",
];
const EXCLUSION =
  ':not(:disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"]))';

describe("Pointer cursor (spec 'Pointer cursor on actions')", () => {
  it("Pointer on enabled actions only: one base-layer rule with the disabled exclusions", () => {
    const selector = basePointerSelector(read("src/app/styles/globals.css"));
    expect(selector).not.toBeNull();
    const named = [
      ...ELEMENTS,
      ...INPUT_TYPES.map((type) => `[type="${type}"]`),
      ...ROLES.map((role) => `[role="${role}"]`),
      EXCLUSION,
    ];
    expect(named.filter((part) => !selector!.includes(part))).toEqual([]);
    expect(['[role="combobox"]', "textarea", '[type="text"]'].filter((part) => selector!.includes(part))).toEqual([]);
    expect(
      ["src/shared/ui/DropdownMenu.tsx", "src/shared/ui/ComboboxPopup.tsx"].filter((path) =>
        read(path).includes("cursor-default"),
      ),
    ).toEqual([]);
  });
});

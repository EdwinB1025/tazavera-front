import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// ═══════════════════════════════════════════════════════════════════════════════
// CSS parsing: extract custom properties from globals.css
// ═══════════════════════════════════════════════════════════════════════════════

const GLOBALS_PATH = pathResolve(process.cwd(), "src/app/styles/globals.css");

function readGlobals(): string {
  return readFileSync(GLOBALS_PATH, "utf-8");
}

/** Extract content between the first "{" after startIdx and its matching "}". */
function extractBlock(source: string, startIdx: number): string {
  let depth = 0;
  for (let i = startIdx; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(startIdx + 1, i);
    }
  }
  throw new Error("Unbalanced braces in CSS");
}

/** Extract all --custom-property: value; declarations from a CSS block. */
function extractProperties(block: string): Map<string, string> {
  const props = new Map<string, string>();
  const regex = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    props.set(match[1]!.trim(), match[2]!.trim());
  }
  return props;
}

/** Extract traditional theme properties from all @theme blocks. */
function extractTraditional(css: string): Map<string, string> {
  const props = new Map<string, string>();
  const themeRegex = /@theme(?:\s+inline)?\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = themeRegex.exec(css)) !== null) {
    const block = extractBlock(css, match.index + match[0].length - 1);
    const blockProps = extractProperties(block);
    for (const [k, v] of blockProps) props.set(k, v);
  }
  return props;
}

/** Extract dark theme overrides from [data-theme="dark"] blocks. */
function extractDark(css: string): Map<string, string> {
  const props = new Map<string, string>();
  const darkRegex = /\[data-theme="dark"\]\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = darkRegex.exec(css)) !== null) {
    const block = extractBlock(css, match.index + match[0].length - 1);
    const blockProps = extractProperties(block);
    for (const [k, v] of blockProps) props.set(k, v);
  }
  return props;
}

describe("Page backdrop token (refine-page-surfaces D6)", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  it("traditional --color-surface-page is var(--color-sage-100)", () => {
    expect(tradProps.get("--color-surface-page")).toBe("var(--color-sage-100)");
  });

  it("dark --color-surface-page is var(--color-night-petrol-950)", () => {
    expect(darkProps.get("--color-surface-page")).toBe("var(--color-night-petrol-950)");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inverse variant scope utility (form-fields design.md D2)
// One scope utility reassigns the tokens the inverse variant swaps, so every
// control keeps one class set across both variants and the inverse surface
// resolves through the same semantic names. The block is normative: exactly
// the eight reassignments of design.md D2 plus --color-border-muted
// (refine-offering-facets-aut design.md), nothing else.
// ═══════════════════════════════════════════════════════════════════════════════

/** Extract every @utility variant-inverse block from globals.css. */
function extractVariantInverseUtilities(css: string): string[] {
  const blocks: string[] = [];
  const regex = /@utility\s+variant-inverse\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    blocks.push(extractBlock(css, match.index + match[0].length - 1));
  }
  return blocks;
}

/** The exact reassignment block of form-fields design.md D2, plus border-muted (refine-offering-facets-aut). */
const VARIANT_INVERSE_REASSIGNMENTS: Record<string, string> = {
  "--color-text-label": "var(--color-nav-text-dark)",
  "--color-text-secondary": "var(--color-nav-text-dark)",
  "--color-text-strong": "var(--color-nav-text-dark)",
  "--color-text-placeholder": "var(--color-text-placeholder-inverse)",
  "--color-border-strong": "var(--color-border-inverse)",
  "--color-border-muted": "var(--color-border-inverse)",
  "--color-feedback-error": "var(--color-feedback-error-inverse)",
  "--color-focus-ring": "var(--color-focus-ring-inverse)",
  "--color-focus-offset": "var(--color-focus-offset-inverse)",
};

describe("Inverse variant scope utility: @utility variant-inverse (form-fields design.md D2)", () => {
  const css = readGlobals();
  const blocks = extractVariantInverseUtilities(css);
  const block = blocks[0] ?? "";

  it("@utility variant-inverse is defined exactly once", () => {
    expect(blocks).toHaveLength(1);
  });

  it("reassigns exactly the nine tokens of design.md D2 and refine-offering-facets-aut", () => {
    expect(Object.fromEntries(extractProperties(block))).toEqual(
      VARIANT_INVERSE_REASSIGNMENTS,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Facet-row shadow tokens (add-facet-controls design.md D10)
// Traditional: Tailwind's default shadow-md and inset-shadow-sm; dark: none.
// ═══════════════════════════════════════════════════════════════════════════════

describe("Facet-row shadow tokens (add-facet-controls design.md D10)", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  it("traditional @theme defines --shadow-nav-current as a medium drop shadow", () => {
    expect(tradProps.get("--shadow-nav-current")).toBe(
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    );
  });

  it("traditional @theme defines --shadow-nav-hover as a small inner shadow", () => {
    expect(tradProps.get("--shadow-nav-hover")).toBe("inset 0 2px 4px rgb(0 0 0 / 0.05)");
  });

  it("dark theme defines --shadow-nav-current as none", () => {
    expect(darkProps.get("--shadow-nav-current")).toBe("none");
  });

  it("dark theme defines --shadow-nav-hover as none", () => {
    expect(darkProps.get("--shadow-nav-hover")).toBe("none");
  });

  // Tailwind 4 inlines a --shadow-* theme value into its shadow-* utility, so
  // the dark reassignment only applies if the utility reads the variable.
  for (const name of ["nav-current", "nav-hover"]) {
    it(`@utility shadow-${name} is defined once and reads var(--shadow-${name})`, () => {
      const regex = new RegExp(`@utility\\s+shadow-${name}\\s*\\{`, "g");
      const blocks: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(css)) !== null) {
        blocks.push(extractBlock(css, match.index + match[0].length - 1));
      }
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatch(
        new RegExp(`box-shadow\\s*:\\s*var\\(--shadow-${name}\\)\\s*;`),
      );
    });
  }
});

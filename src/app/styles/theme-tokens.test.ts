import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

// ═══════════════════════════════════════════════════════════════════════════════
// Color engine: parse, resolve and measure colors from globals.css
// Handles only the two syntaxes used in this project: var() references and
// color-mix(in srgb, ...). Any other syntax fails loudly.
// ═══════════════════════════════════════════════════════════════════════════════

type RGB = { r: number; g: number; b: number; a: number };

const NAMED_COLORS: Record<string, RGB> = {
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
};

/** Tokens provided by Tailwind's built-in theme, not redefined in our @theme. */
const BUILTIN_TOKENS: Map<string, string> = new Map([
  ["--color-white", "#ffffff"],
  ["--color-black", "#000000"],
]);

function parseHex(h: string): RGB {
  const hex = h.replace("#", "");
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0]! + hex[0], 16),
      g: parseInt(hex[1]! + hex[1], 16),
      b: parseInt(hex[2]! + hex[2], 16),
      a: 1,
    };
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function parseRgb(str: string): RGB {
  const inner = str.replace(/^rgba?\(/, "").replace(/\)$/, "");
  const parts = inner.replace(/\//g, " ").replace(/,/g, " ").trim().split(/\s+/);
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts.length >= 4 ? Number(parts[3]) : 1;
  return { r, g, b, a };
}

/** Parse a direct color value (no var() or color-mix()). */
function parseAtom(s: string): RGB {
  const trimmed = s.trim();
  if (trimmed.startsWith("#")) return parseHex(trimmed);
  if (/^rgba?\(/.test(trimmed)) return parseRgb(trimmed);
  if (trimmed in NAMED_COLORS) return { ...NAMED_COLORS[trimmed] };
  throw new Error(`Unknown color syntax: "${trimmed}"`);
}

/**
 * Split the arguments of color-mix(in srgb, A p%, B) into { a, p, b }.
 * A and B may contain nested parentheses (var(), color-mix()).
 */
function parseColorMixArgs(inner: string): { a: string; p: number; b: string } {
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "%" && depth === 0) {
      const before = inner.slice(0, i).trim();
      const m = before.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (!m) throw new Error(`Cannot parse color-mix percentage in: ${inner}`);
      return {
        a: m[1]!.trim(),
        p: parseFloat(m[2]!),
        b: inner.slice(i + 1).replace(/^,\s*/, "").trim(),
      };
    }
  }
  throw new Error(`Cannot parse color-mix arguments: ${inner}`);
}

/** Premultiplied-alpha color mix: interpolates in sRGB with premultiplied alpha. */
function mixColors(a: RGB, p: number, b: RGB): RGB {
  const premul = (c: RGB) => ({ r: c.r * c.a, g: c.g * c.a, b: c.b * c.a, a: c.a });
  const pa = premul(a);
  const pb = premul(b);
  const mixed = {
    r: pa.r * p + pb.r * (1 - p),
    g: pa.g * p + pb.g * (1 - p),
    b: pa.b * p + pb.b * (1 - p),
    a: pa.a * p + pb.a * (1 - p),
  };
  if (mixed.a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: mixed.r / mixed.a,
    g: mixed.g / mixed.a,
    b: mixed.b / mixed.a,
    a: mixed.a,
  };
}

/** Recursively resolve a raw CSS value to an RGB color. */
function resolve(raw: string, props: Map<string, string>): RGB {
  const s = raw.trim();

  const varMatch = s.match(/^var\((--[^)]+)\)$/);
  if (varMatch) {
    const name = varMatch[1]!.trim();
    const ref = props.get(name) ?? BUILTIN_TOKENS.get(name);
    if (ref === undefined) throw new Error(`Token not defined: ${name}`);
    return resolve(ref, props);
  }

  const mixMatch = s.match(/^color-mix\(in\s+srgb,\s*(.+)\)$/);
  if (mixMatch) {
    const { a, p, b } = parseColorMixArgs(mixMatch[1]!);
    return mixColors(resolve(a, props), p / 100, resolve(b, props));
  }

  return parseAtom(s);
}

/** Composite a translucent color (alpha < 1) over an opaque base. */
function composite(color: RGB, base: RGB): RGB {
  const a = color.a;
  return {
    r: Math.round(color.r * a + base.r * (1 - a)),
    g: Math.round(color.g * a + base.g * (1 - a)),
    b: Math.round(color.b * a + base.b * (1 - a)),
    a: 1,
  };
}

/** WCAG 2.2 relative luminance of an sRGB color. */
function luminance(rgb: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

/** WCAG 2.2 contrast ratio between two colors. */
function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

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

/** Resolve a semantic token name (e.g. "text-primary") to an RGB color. */
function resolveToken(name: string, props: Map<string, string>): RGB {
  const fullName = `--color-${name}`;
  const raw = props.get(fullName);
  if (raw === undefined) throw new Error(`Token not defined: ${fullName}`);
  return resolve(raw, props);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Documented bases for translucent tokens (design.md Decision 10)
// A translucent token is measured composited over the surface it renders on.
// ═══════════════════════════════════════════════════════════════════════════════

const DOCUMENTED_BASES: Record<string, string[]> = {
  "surface-filter-field-hover": ["surface-filter"],
  "surface-filter-option": ["surface-filter"],
  "nav-toggle-bg": ["nav-surface", "nav-header"],
  "nav-button-bg-hover": ["nav-button-bg"],
  "nav-tabs-hover": ["nav-tabs-surface"],
  "nav-tabs-current": ["nav-tabs-surface"],
  "evaluation-rating-exceptional": ["surface-card"],
  "evaluation-rating-excellent": ["surface-card"],
  "evaluation-rating-good": ["surface-card"],
  "evaluation-rating-commercial": ["surface-card"],
  // border-subtle, border-filter-separator, nav-tabs-border: exempt from 3:1
};

// ═══════════════════════════════════════════════════════════════════════════════
// Contrast matrix (from design.md Evidence section)
// Tokens without a defined pairing are excluded and verified in the component
// change: text-inverse, text-input-icon, surface-checked, nav-icon, nav-underline,
// evaluation-bean-*, evaluation-slider-*
// ═══════════════════════════════════════════════════════════════════════════════

type PairKind = "text" | "bound" | "icon";

interface ContrastPair {
  fg: string;
  bg: string;
  kind: PairKind;
  /** Override the documented bases for this pair's bg. */
  bgBases?: string[];
  /** If true, the pair is decorative and exempt from its threshold. */
  exempt?: boolean;
}

function threshold(kind: PairKind): number {
  return kind === "text" ? 4.5 : 3.0;
}

interface TestCase {
  fg: string;
  bg: string;
  base: string | null;
  kind: PairKind;
}

/** Expand pairs with multiple documented bases into individual test cases. */
function expandPairs(pairs: ContrastPair[]): TestCase[] {
  const cases: TestCase[] = [];
  for (const pair of pairs) {
    if (pair.exempt) continue;
    const bases = pair.bgBases ?? DOCUMENTED_BASES[pair.bg];
    if (bases && bases.length > 0) {
      for (const base of bases) {
        cases.push({ fg: pair.fg, bg: pair.bg, base, kind: pair.kind });
      }
    } else {
      cases.push({ fg: pair.fg, bg: pair.bg, base: null, kind: pair.kind });
    }
  }
  return cases;
}

// ── Traditional theme contrast pairs (design.md Evidence) ──

const TRADITIONAL_PAIRS: ContrastPair[] = [
  // Text pairs (>= 4.5:1)
  { fg: "text-primary", bg: "surface-page", kind: "text" },
  { fg: "text-primary", bg: "surface-card", kind: "text" },
  { fg: "text-primary", bg: "surface-section", kind: "text" },
  { fg: "text-primary", bg: "surface-section-hover", kind: "text" },
  { fg: "text-secondary", bg: "surface-page", kind: "text" },
  { fg: "text-secondary", bg: "surface-section", kind: "text" },
  { fg: "text-accent", bg: "surface-card", kind: "text" },
  { fg: "text-label", bg: "surface-page", kind: "text" },
  { fg: "text-strong", bg: "surface-form", kind: "text" },
  { fg: "text-placeholder", bg: "surface-input", kind: "text" },
  { fg: "text-link", bg: "surface-card", kind: "text" },
  { fg: "text-link-hover", bg: "surface-card", kind: "text" },
  { fg: "action-primary-text", bg: "action-primary", kind: "text" },
  { fg: "action-primary-text", bg: "action-primary-hover", kind: "text" },
  { fg: "action-1-text", bg: "action-1-bg", kind: "text" },
  { fg: "action-2-text", bg: "action-2-bg", kind: "text" },
  { fg: "action-3-text", bg: "action-3-bg", kind: "text" },
  { fg: "action-4-text", bg: "action-4-bg", kind: "text" },
  { fg: "action-1-text-hover", bg: "action-1-bg-hover", kind: "text" },
  { fg: "action-2-text-hover", bg: "action-2-bg-hover", kind: "text" },
  { fg: "action-3-text-hover", bg: "action-3-bg-hover", kind: "text" },
  { fg: "action-4-text-hover", bg: "action-4-bg-hover", kind: "text" },
  { fg: "nav-text", bg: "nav-header", kind: "text" },
  { fg: "nav-text", bg: "nav-surface", kind: "text" },
  { fg: "nav-text", bg: "nav-current", kind: "text" },
  { fg: "nav-text-hover", bg: "nav-hover", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-surface-dark", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-current-dark", kind: "text" },
  // Icon pair: measured over two documented bases (Decision 14)
  { fg: "nav-toggle-icon", bg: "nav-toggle-bg", kind: "icon" },
  // Text on translucent hover bg: composited over nav-button-bg (Decision 10)
  { fg: "nav-button-text-hover", bg: "nav-button-bg-hover", kind: "text" },
  { fg: "nav-button-text", bg: "nav-button-bg", kind: "text" },
  { fg: "feedback-error", bg: "surface-page", kind: "text" },
  { fg: "feedback-error", bg: "surface-card", kind: "text" },
  { fg: "feedback-error", bg: "surface-form", kind: "text" },
  { fg: "badge-verified-text", bg: "badge-verified-bg", kind: "text" },
  { fg: "badge-provisional-text", bg: "badge-provisional-bg", kind: "text" },
  // Evaluation ratings: translucent bg composited over surface-card
  { fg: "text-primary", bg: "evaluation-rating-exceptional", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-excellent", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-good", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-commercial", kind: "text" },

  // Boundary pairs (>= 3:1)
  { fg: "border-strong", bg: "surface-page", kind: "bound" },
  { fg: "border-strong", bg: "surface-card", kind: "bound" },
  { fg: "border-strong", bg: "surface-form", kind: "bound" },
  { fg: "border-muted", bg: "surface-textarea", kind: "bound" },
  { fg: "border-accent", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-page", kind: "bound" },
  { fg: "focus-ring", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-section", kind: "bound" },
  { fg: "focus-ring", bg: "surface-form", kind: "bound" },
  { fg: "focus-ring", bg: "surface-filter", kind: "bound" },
  { fg: "focus-ring", bg: "nav-surface", kind: "bound" },
  { fg: "focus-ring", bg: "focus-offset", kind: "bound" },
  // nav-tabs-current is translucent, composited over nav-tabs-surface
  { fg: "nav-tabs-current-border", bg: "nav-tabs-current", kind: "bound" },

  // Exempt: nav-button-border is decorative in traditional (Decision 8 + 14)
  // The gate (fill >= 3:1 vs header) is verified in a separate test below.
  { fg: "nav-button-border", bg: "nav-button-bg", kind: "bound", exempt: true },
  { fg: "nav-button-border", bg: "nav-header", kind: "bound", exempt: true },
  { fg: "nav-button-border-hover", bg: "nav-button-bg-hover", kind: "bound", exempt: true },
  { fg: "nav-button-border-hover", bg: "nav-header", kind: "bound", exempt: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe("Traditional theme contrast matrix", () => {
  const css = readGlobals();
  const props = extractTraditional(css);
  const cases = expandPairs(TRADITIONAL_PAIRS);

  for (const tc of cases) {
    const baseLabel = tc.base ? ` over ${tc.base}` : "";
    it(`traditional ${tc.kind}: ${tc.fg} / ${tc.bg}${baseLabel} >= ${threshold(tc.kind)}:1`, () => {
      const fg = resolveToken(tc.fg, props);
      let bg = resolveToken(tc.bg, props);
      if (tc.base) {
        bg = composite(bg, resolveToken(tc.base, props));
      } else if (bg.a < 1) {
        throw new Error(`Translucent token ${tc.bg} has no documented base`);
      }
      const ratio = contrast(fg, bg);
      expect(ratio).toBeGreaterThanOrEqual(threshold(tc.kind));
    });
  }
});

describe("Traditional theme decorative exemptions (Decision 8 + 14)", () => {
  const css = readGlobals();
  const props = extractTraditional(css);

  // Gate condition: the fill reaches >= 3:1 against the header, making the
  // border decorative and exempt from the 3:1 boundary rule.
  it("nav-button-bg vs nav-header >= 3:1 (gate for decorative border)", () => {
    const fill = resolveToken("nav-button-bg", props);
    const header = resolveToken("nav-header", props);
    expect(contrast(fill, header)).toBeGreaterThanOrEqual(3.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Dark theme contrast matrix (design.md Evidence)
// ═══════════════════════════════════════════════════════════════════════════════

// The dark pair matrix mirrors the traditional one. The dark theme reassigns
// every semantic token to the night-* palette; the same pairs are measured
// against the dark values. In the dark theme nav-button-border is NOT decorative
// (the fill does not reach 3:1 against the header), so the border pairs are
// included and measured.

const DARK_PAIRS: ContrastPair[] = [
  // Text pairs (>= 4.5:1)
  { fg: "text-primary", bg: "surface-page", kind: "text" },
  { fg: "text-primary", bg: "surface-card", kind: "text" },
  { fg: "text-primary", bg: "surface-section", kind: "text" },
  { fg: "text-primary", bg: "surface-section-hover", kind: "text" },
  { fg: "text-secondary", bg: "surface-page", kind: "text" },
  { fg: "text-secondary", bg: "surface-section", kind: "text" },
  { fg: "text-accent", bg: "surface-card", kind: "text" },
  { fg: "text-label", bg: "surface-page", kind: "text" },
  { fg: "text-strong", bg: "surface-form", kind: "text" },
  { fg: "text-placeholder", bg: "surface-input", kind: "text" },
  { fg: "text-link", bg: "surface-card", kind: "text" },
  { fg: "text-link-hover", bg: "surface-card", kind: "text" },
  { fg: "action-primary-text", bg: "action-primary", kind: "text" },
  { fg: "action-primary-text", bg: "action-primary-hover", kind: "text" },
  { fg: "action-1-text", bg: "action-1-bg", kind: "text" },
  { fg: "action-2-text", bg: "action-2-bg", kind: "text" },
  { fg: "action-3-text", bg: "action-3-bg", kind: "text" },
  { fg: "action-4-text", bg: "action-4-bg", kind: "text" },
  { fg: "action-1-text-hover", bg: "action-1-bg-hover", kind: "text" },
  { fg: "action-2-text-hover", bg: "action-2-bg-hover", kind: "text" },
  { fg: "action-3-text-hover", bg: "action-3-bg-hover", kind: "text" },
  { fg: "action-4-text-hover", bg: "action-4-bg-hover", kind: "text" },
  { fg: "nav-text", bg: "nav-header", kind: "text" },
  { fg: "nav-text", bg: "nav-surface", kind: "text" },
  { fg: "nav-text", bg: "nav-current", kind: "text" },
  { fg: "nav-text-hover", bg: "nav-hover", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-surface-dark", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-current-dark", kind: "text" },
  { fg: "nav-toggle-icon", bg: "nav-toggle-bg", kind: "icon" },
  { fg: "nav-button-text", bg: "nav-button-bg", kind: "text" },
  { fg: "nav-button-text-hover", bg: "nav-button-bg-hover", kind: "text" },
  { fg: "feedback-error", bg: "surface-page", kind: "text" },
  { fg: "feedback-error", bg: "surface-card", kind: "text" },
  { fg: "feedback-error", bg: "surface-form", kind: "text" },
  { fg: "badge-verified-text", bg: "badge-verified-bg", kind: "text" },
  { fg: "badge-provisional-text", bg: "badge-provisional-bg", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-exceptional", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-excellent", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-good", kind: "text" },
  { fg: "text-primary", bg: "evaluation-rating-commercial", kind: "text" },

  // Boundary pairs (>= 3:1)
  { fg: "border-strong", bg: "surface-page", kind: "bound" },
  { fg: "border-strong", bg: "surface-card", kind: "bound" },
  { fg: "border-strong", bg: "surface-form", kind: "bound" },
  { fg: "border-muted", bg: "surface-textarea", kind: "bound" },
  { fg: "border-accent", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-page", kind: "bound" },
  { fg: "focus-ring", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-section", kind: "bound" },
  { fg: "focus-ring", bg: "surface-form", kind: "bound" },
  { fg: "focus-ring", bg: "surface-filter", kind: "bound" },
  { fg: "focus-ring", bg: "nav-surface", kind: "bound" },
  { fg: "focus-ring", bg: "focus-offset", kind: "bound" },
  { fg: "nav-tabs-current-border", bg: "nav-tabs-current", kind: "bound" },
  // In dark, nav-button-border is state-identifying (not decorative): measured
  { fg: "nav-button-border", bg: "nav-button-bg", kind: "bound" },
  { fg: "nav-button-border", bg: "nav-header", kind: "bound" },
  { fg: "nav-button-border-hover", bg: "nav-button-bg-hover", kind: "bound" },
  { fg: "nav-button-border-hover", bg: "nav-header", kind: "bound" },
];

describe("Dark theme contrast matrix", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);
  // Dark resolution: dark overrides on top of traditional (the @theme primitives
  // are shared, the [data-theme="dark"] block reassigns semantics).
  const merged = new Map(tradProps);
  for (const [k, v] of darkProps) merged.set(k, v);
  const cases = expandPairs(DARK_PAIRS);

  for (const tc of cases) {
    const baseLabel = tc.base ? ` over ${tc.base}` : "";
    it(`dark ${tc.kind}: ${tc.fg} / ${tc.bg}${baseLabel} >= ${threshold(tc.kind)}:1`, () => {
      const fg = resolveToken(tc.fg, merged);
      let bg = resolveToken(tc.bg, merged);
      if (tc.base) {
        bg = composite(bg, resolveToken(tc.base, merged));
      } else if (bg.a < 1) {
        throw new Error(`Translucent token ${tc.bg} has no documented base`);
      }
      const ratio = contrast(fg, bg);
      expect(ratio).toBeGreaterThanOrEqual(threshold(tc.kind));
    });
  }
});

describe("Theme completeness: every traditional semantic token defined in dark", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  // Collect all semantic token names (those that start with --color- but are
  // not primitives: they reference other tokens or use color-mix).
  const semanticNames: string[] = [];
  for (const [name, value] of tradProps) {
    // Primitives are hex values; semantic tokens reference var() or color-mix()
    if (value.includes("var(") || value.includes("color-mix(")) {
      semanticNames.push(name);
    }
  }

  for (const name of semanticNames) {
    it(`dark theme defines ${name}`, () => {
      expect(darkProps.has(name)).toBe(true);
    });
  }
});

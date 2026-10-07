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
  // add-evaluation-scales D9: the translucent on-bean disc is documented over
  // the content surfaces it renders on (the traditional theme)
  "evaluation-bean-on": ["surface-form", "surface-card"],
  // border-subtle, border-filter-separator, nav-tabs-border: exempt from 3:1
};

// ═══════════════════════════════════════════════════════════════════════════════
// Contrast matrix (from design.md Evidence section)
// Tokens without a defined pairing are excluded and verified in the component
// change: text-inverse, text-input-icon, surface-checked, nav-icon, nav-underline.
// add-evaluation-scales D9 registers the measured evaluation-bean-* and
// evaluation-slider-* pairs in both matrices below; their unmeasured
// combinations stay ungated (design summary §4), and other host surfaces are
// registered by the consumer that uses them.
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
  // add-offering-management design.md D12
  { fg: "text-secondary", bg: "surface-form", kind: "text" },
  { fg: "text-accent", bg: "surface-card", kind: "text" },
  // add-collapsible-section D8: the section title on the legend panel, at
  // rest and on hover
  { fg: "text-accent", bg: "surface-section", kind: "text" },
  { fg: "text-accent", bg: "surface-section-hover", kind: "text" },
  { fg: "text-label", bg: "surface-page", kind: "text" },
  // add-offering-management design.md D12 and add-user-account design.md D11
  // (field labels and help on cards)
  { fg: "text-label", bg: "surface-card", kind: "text" },
  { fg: "text-label", bg: "surface-form", kind: "text" },
  { fg: "text-secondary", bg: "surface-card", kind: "text" },
  { fg: "text-strong", bg: "surface-form", kind: "text" },
  { fg: "text-placeholder", bg: "surface-input", kind: "text" },
  { fg: "text-link", bg: "surface-card", kind: "text" },
  { fg: "text-link-hover", bg: "surface-card", kind: "text" },
  // add-offering-management design.md D12
  { fg: "text-link", bg: "surface-page", kind: "text" },
  { fg: "text-link", bg: "surface-form", kind: "text" },
  { fg: "text-link-hover", bg: "surface-form", kind: "text" },
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
  // refine-app-header D13: the trigger's hover text on the header surface
  { fg: "nav-text-hover", bg: "nav-surface", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-surface-dark", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-current-dark", kind: "text" },
  // refine-app-header D13: the initials on the avatar circle, at rest and
  // while the pointer is on the trigger
  { fg: "nav-text-dark", bg: "nav-avatar", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-avatar-hover", kind: "text" },
  // refine-app-header D13 (corrections.md round 1, correction 4): the
  // destructive entry on the nav surface, at rest and on hover and focus
  { fg: "nav-text-destructive", bg: "nav-surface", kind: "text" },
  { fg: "nav-text-destructive", bg: "nav-hover", kind: "text" },
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
  // refine-app-header D13: the header menu panel and in-menu select boundary
  { fg: "border-strong", bg: "nav-surface", kind: "bound" },
  // refine-app-header D14: the current navigation entry's bar
  { fg: "nav-indicator", bg: "nav-surface", kind: "bound" },
  { fg: "border-muted", bg: "surface-textarea", kind: "bound" },
  { fg: "border-accent", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-page", kind: "bound" },
  { fg: "focus-ring", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-section", kind: "bound" },
  { fg: "focus-ring", bg: "surface-form", kind: "bound" },
  { fg: "focus-ring", bg: "surface-filter", kind: "bound" },
  { fg: "focus-ring", bg: "nav-surface", kind: "bound" },
  // nav-button renders in the header (D6): focus ring against nav-header
  { fg: "focus-ring", bg: "nav-header", kind: "bound" },
  { fg: "focus-ring", bg: "focus-offset", kind: "bound" },
  // nav-tabs-current is translucent, composited over nav-tabs-surface
  { fg: "nav-tabs-current-border", bg: "nav-tabs-current", kind: "bound" },

  // Exempt: nav-button-border is decorative in traditional (Decision 8 + 14)
  // The gate (fill >= 3:1 vs header) is verified in a separate test below.
  { fg: "nav-button-border", bg: "nav-button-bg", kind: "bound", exempt: true },
  { fg: "nav-button-border", bg: "nav-header", kind: "bound", exempt: true },
  { fg: "nav-button-border-hover", bg: "nav-button-bg-hover", kind: "bound", exempt: true },
  { fg: "nav-button-border-hover", bg: "nav-header", kind: "bound", exempt: true },

  // refine-app-header D13: the avatar boundary is transparent in the
  // traditional theme (design.md D5), so no boundary shows there — exempt,
  // the fill gate asserted beside the nav-button gate below holds.
  { fg: "nav-avatar-border", bg: "nav-surface", kind: "bound", exempt: true },
  { fg: "nav-avatar-border", bg: "nav-avatar", kind: "bound", exempt: true },
  { fg: "nav-avatar-border", bg: "nav-avatar-hover", kind: "bound", exempt: true },

  // ── Action button boundaries (fix-button-boundaries design.md D2 + D6) ──
  // The D2 exemption gate: the primary fill identifies the button at rest and
  // on hover, making the transparent primary border decorative.
  { fg: "action-primary", bg: "surface-page", kind: "bound" },
  { fg: "action-primary", bg: "surface-card", kind: "bound" },
  { fg: "action-primary", bg: "surface-section", kind: "bound" },
  { fg: "action-primary", bg: "surface-form", kind: "bound" },
  { fg: "action-primary-hover", bg: "surface-page", kind: "bound" },
  { fg: "action-primary-hover", bg: "surface-card", kind: "bound" },
  { fg: "action-primary-hover", bg: "surface-section", kind: "bound" },
  { fg: "action-primary-hover", bg: "surface-form", kind: "bound" },

  // action-primary-border is transparent in the traditional theme (D2, the
  // nav-avatar-border precedent): exempt, the fill gate above holds.
  { fg: "action-primary-border", bg: "surface-page", kind: "bound", exempt: true },
  { fg: "action-primary-border", bg: "action-primary", kind: "bound", exempt: true },

  // Positional borders identify the button at rest against every host surface
  // and against the rest fill; the hover fill identifies it on hover, so the
  // border against the hover fill is not registered here (D6).
  { fg: "action-1-border", bg: "surface-page", kind: "bound" },
  { fg: "action-1-border", bg: "surface-card", kind: "bound" },
  { fg: "action-1-border", bg: "surface-section", kind: "bound" },
  { fg: "action-1-border", bg: "surface-form", kind: "bound" },
  { fg: "action-1-border", bg: "action-1-bg", kind: "bound" },
  { fg: "action-2-border", bg: "surface-page", kind: "bound" },
  { fg: "action-2-border", bg: "surface-card", kind: "bound" },
  { fg: "action-2-border", bg: "surface-section", kind: "bound" },
  { fg: "action-2-border", bg: "surface-form", kind: "bound" },
  { fg: "action-2-border", bg: "action-2-bg", kind: "bound" },
  { fg: "action-3-border", bg: "surface-page", kind: "bound" },
  { fg: "action-3-border", bg: "surface-card", kind: "bound" },
  { fg: "action-3-border", bg: "surface-section", kind: "bound" },
  { fg: "action-3-border", bg: "surface-form", kind: "bound" },
  { fg: "action-3-border", bg: "action-3-bg", kind: "bound" },
  { fg: "action-4-border", bg: "surface-page", kind: "bound" },
  { fg: "action-4-border", bg: "surface-card", kind: "bound" },
  { fg: "action-4-border", bg: "surface-section", kind: "bound" },
  { fg: "action-4-border", bg: "surface-form", kind: "bound" },
  { fg: "action-4-border", bg: "action-4-bg", kind: "bound" },

  // D2 exemption gate on hover: the hover fill identifies the button.
  { fg: "action-1-bg-hover", bg: "surface-page", kind: "bound" },
  { fg: "action-1-bg-hover", bg: "surface-card", kind: "bound" },
  { fg: "action-1-bg-hover", bg: "surface-section", kind: "bound" },
  { fg: "action-1-bg-hover", bg: "surface-form", kind: "bound" },
  { fg: "action-2-bg-hover", bg: "surface-page", kind: "bound" },
  { fg: "action-2-bg-hover", bg: "surface-card", kind: "bound" },
  { fg: "action-2-bg-hover", bg: "surface-section", kind: "bound" },
  { fg: "action-2-bg-hover", bg: "surface-form", kind: "bound" },
  { fg: "action-3-bg-hover", bg: "surface-page", kind: "bound" },
  { fg: "action-3-bg-hover", bg: "surface-card", kind: "bound" },
  { fg: "action-3-bg-hover", bg: "surface-section", kind: "bound" },
  { fg: "action-3-bg-hover", bg: "surface-form", kind: "bound" },
  { fg: "action-4-bg-hover", bg: "surface-page", kind: "bound" },
  { fg: "action-4-bg-hover", bg: "surface-card", kind: "bound" },
  { fg: "action-4-bg-hover", bg: "surface-section", kind: "bound" },
  { fg: "action-4-bg-hover", bg: "surface-form", kind: "bound" },

  // ── Logotype exemptions (add-app-shell design.md D8) ──
  // A part of the brand logotype is excluded from WCAG 2.2 SC 1.4.11 ("part
  // of a logo or brand name"), so the three logotype pairs are exempt from
  // the 3:1 rule in both themes. Their measured contrasts are asserted in a
  // dedicated block below (design summary §4).
  { fg: "logo-cup", bg: "nav-surface", kind: "bound", exempt: true },
  { fg: "logo-coffee", bg: "nav-surface", kind: "bound", exempt: true },
  { fg: "logo-leaf", bg: "nav-surface", kind: "bound", exempt: true },

  // ── Form-field boxes (form-fields design.md D5) ──
  // Input/select box on the input surface. Pairs the traditional matrix does
  // not already assert (text-placeholder / surface-input and
  // border-muted / surface-textarea are asserted above).
  { fg: "border-strong", bg: "surface-input", kind: "bound" },
  { fg: "feedback-error", bg: "surface-input", kind: "text" },
  { fg: "text-secondary", bg: "surface-input", kind: "text" },

  // ── Checked and inverse states (form-fields design.md D5) ──
  { fg: "checked-mark", bg: "surface-checked", kind: "icon" },
  { fg: "focus-ring-inverse", bg: "nav-surface-dark", kind: "bound" },
  { fg: "border-inverse", bg: "nav-surface-dark", kind: "bound" },
  { fg: "text-placeholder-inverse", bg: "nav-surface-dark", kind: "text" },
  { fg: "feedback-error-inverse", bg: "nav-surface-dark", kind: "text" },
  { fg: "surface-checked", bg: "nav-surface-dark", kind: "bound" },

  // ── Facet rows and sort control (add-facet-controls design.md D12) ──
  { fg: "nav-button-border", bg: "nav-surface-dark", kind: "bound" },
  { fg: "nav-button-border", bg: "nav-current-dark", kind: "bound" },
  { fg: "focus-ring-inverse", bg: "nav-current-dark", kind: "bound" },
  { fg: "focus-ring-inverse", bg: "focus-offset-inverse", kind: "bound" },
  { fg: "text-strong", bg: "surface-input", kind: "text" },

  // ── Evaluation scales (add-evaluation-scales design.md D9) ──
  // The seven measured pairs of the design summary §4, registered in both
  // matrices. Only pairs the matrices do not already assert are added here:
  // border-muted / surface-textarea and text-strong / surface-form are asserted
  // above. The two mark pairs fail until task 1.4 defines
  // --color-evaluation-bean-mark-on/off.
  { fg: "evaluation-bean-mark-off", bg: "evaluation-bean-off", kind: "icon" },
  // evaluation-bean-on is translucent: measured over its documented bases
  { fg: "evaluation-bean-mark-on", bg: "evaluation-bean-on", kind: "icon" },
  { fg: "evaluation-slider-thumb", bg: "surface-form", kind: "bound" },
  { fg: "evaluation-slider-thumb", bg: "surface-card", kind: "bound" },
  { fg: "evaluation-slider-thumb", bg: "evaluation-slider-track", kind: "bound" },
  { fg: "border-muted", bg: "surface-form", kind: "bound" },
  { fg: "border-muted", bg: "surface-card", kind: "bound" },
  { fg: "text-strong", bg: "surface-card", kind: "text" },
  // The thumb edge is decorative (design summary §4): exempt from the 3:1 rule.
  { fg: "evaluation-slider-thumb-border", bg: "evaluation-slider-thumb", kind: "bound", exempt: true },

  // ── Page backdrop and section card band (refine-page-surfaces D6) ──
  { fg: "text-accent", bg: "surface-page", kind: "text" },
  { fg: "text-link", bg: "surface-page", kind: "text" },
  { fg: "text-link-hover", bg: "surface-page", kind: "text" },
  { fg: "text-label", bg: "surface-section", kind: "text" },
  { fg: "text-label", bg: "surface-section-hover", kind: "text" },
  { fg: "focus-ring", bg: "surface-section-hover", kind: "bound" },
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

  // refine-app-header D13: the avatar fill identifies the circle in the
  // traditional theme, the gate for the transparent avatar boundary of
  // design.md D5 beside the nav-button gate above.
  it("nav-avatar vs nav-surface >= 3:1 (gate for the transparent avatar boundary)", () => {
    const fill = resolveToken("nav-avatar", props);
    const surface = resolveToken("nav-surface", props);
    expect(contrast(fill, surface)).toBeGreaterThanOrEqual(3.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Avatar boundary token completeness (refine-app-header design.md D5)
// --color-nav-avatar-border is transparent in the traditional @theme, so its
// value falls outside the relational completeness check's var()/color-mix()
// filter (design.md D13): its presence in both theme blocks is asserted
// explicitly.
// ═══════════════════════════════════════════════════════════════════════════════

describe("Avatar boundary token completeness: --color-nav-avatar-border defined in both themes", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  it("traditional @theme defines --color-nav-avatar-border", () => {
    expect(
      tradProps.has("--color-nav-avatar-border"),
      "avatar boundary token --color-nav-avatar-border is undefined in the traditional theme",
    ).toBe(true);
  });

  it("dark theme defines --color-nav-avatar-border", () => {
    expect(
      darkProps.has("--color-nav-avatar-border"),
      "avatar boundary token --color-nav-avatar-border is undefined in the dark theme",
    ).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Action border token completeness (fix-button-boundaries design.md D5)
// --color-action-primary-border is transparent in the traditional @theme, so
// its value falls outside the relational completeness check's var()/color-mix()
// filter (the avatar boundary gap above): its presence in both theme blocks is
// asserted explicitly. The shared completeness filter is unchanged.
// ═══════════════════════════════════════════════════════════════════════════════

describe("Action border token completeness: --color-action-primary-border defined in both themes", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  it("traditional @theme defines --color-action-primary-border", () => {
    expect(
      tradProps.has("--color-action-primary-border"),
      "action border token --color-action-primary-border is undefined in the traditional theme",
    ).toBe(true);
  });

  it("dark theme defines --color-action-primary-border", () => {
    expect(
      darkProps.has("--color-action-primary-border"),
      "action border token --color-action-primary-border is undefined in the dark theme",
    ).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Logotype exemptions (add-app-shell design.md D8, design summary §4)
// A part of the brand logotype is excluded from the 3:1 non-text rule (WCAG
// 2.2 SC 1.4.11: "part of a logo or brand name"), so the three logotype pairs
// are registered as exemptions beside the decorative exemptions above and are
// measured at their documented contrasts on nav-surface instead. Each logotype
// token must also be defined in both theme blocks (spec: "Logotype token
// missing from one theme").
// ═══════════════════════════════════════════════════════════════════════════════

const LOGOTYPE_PAIRS: Array<{
  fg: string;
  traditional: number;
  dark: number;
}> = [
  { fg: "logo-cup", traditional: 5.9, dark: 11.2 },
  { fg: "logo-coffee", traditional: 5.4, dark: 4.0 },
  { fg: "logo-leaf", traditional: 1.7, dark: 8.1 },
];

describe("Logotype pairs on nav-surface: exempt at their documented contrasts (design summary §4)", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);
  const merged = new Map(tradProps);
  for (const [k, v] of darkProps) merged.set(k, v);

  for (const pair of LOGOTYPE_PAIRS) {
    it(`traditional logotype exemption: ${pair.fg} / nav-surface at ${pair.traditional}:1`, () => {
      const fg = resolveToken(pair.fg, tradProps);
      const bg = resolveToken("nav-surface", tradProps);
      expect(contrast(fg, bg)).toBeCloseTo(pair.traditional, 1);
    });

    it(`dark logotype exemption: ${pair.fg} / nav-surface at ${pair.dark}:1`, () => {
      const fg = resolveToken(pair.fg, merged);
      const bg = resolveToken("nav-surface", merged);
      expect(contrast(fg, bg)).toBeCloseTo(pair.dark, 1);
    });
  }
});

describe("Logotype token completeness: each logotype token defined in both themes", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  for (const name of ["logo-leaf", "logo-cup", "logo-coffee"]) {
    it(`traditional @theme defines --color-${name}`, () => {
      expect(
        tradProps.has(`--color-${name}`),
        `logotype token --color-${name} is undefined in the traditional theme`,
      ).toBe(true);
    });

    it(`dark theme defines --color-${name}`, () => {
      expect(
        darkProps.has(`--color-${name}`),
        `logotype token --color-${name} is undefined in the dark theme`,
      ).toBe(true);
    });
  }
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
  // add-offering-management design.md D12
  { fg: "text-secondary", bg: "surface-form", kind: "text" },
  { fg: "text-accent", bg: "surface-card", kind: "text" },
  // add-collapsible-section D8: the section title on the legend panel, at
  // rest and on hover
  { fg: "text-accent", bg: "surface-section", kind: "text" },
  { fg: "text-accent", bg: "surface-section-hover", kind: "text" },
  { fg: "text-label", bg: "surface-page", kind: "text" },
  // add-offering-management design.md D12 and add-user-account design.md D11
  // (field labels and help on cards)
  { fg: "text-label", bg: "surface-card", kind: "text" },
  { fg: "text-label", bg: "surface-form", kind: "text" },
  { fg: "text-secondary", bg: "surface-card", kind: "text" },
  { fg: "text-strong", bg: "surface-form", kind: "text" },
  { fg: "text-placeholder", bg: "surface-input", kind: "text" },
  { fg: "text-link", bg: "surface-card", kind: "text" },
  { fg: "text-link-hover", bg: "surface-card", kind: "text" },
  // add-offering-management design.md D12
  { fg: "text-link", bg: "surface-page", kind: "text" },
  { fg: "text-link", bg: "surface-form", kind: "text" },
  { fg: "text-link-hover", bg: "surface-form", kind: "text" },
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
  // refine-app-header D13: the trigger's hover text on the header surface
  { fg: "nav-text-hover", bg: "nav-surface", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-surface-dark", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-current-dark", kind: "text" },
  // refine-app-header D13: the initials on the avatar circle, at rest and
  // while the pointer is on the trigger
  { fg: "nav-text-dark", bg: "nav-avatar", kind: "text" },
  { fg: "nav-text-dark", bg: "nav-avatar-hover", kind: "text" },
  // refine-app-header D13 (corrections.md round 1, correction 4): the
  // destructive entry on the nav surface, at rest and on hover and focus
  { fg: "nav-text-destructive", bg: "nav-surface", kind: "text" },
  { fg: "nav-text-destructive", bg: "nav-hover", kind: "text" },
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
  // refine-app-header D13: the header menu panel and in-menu select boundary
  { fg: "border-strong", bg: "nav-surface", kind: "bound" },
  // refine-app-header D14: the current navigation entry's bar
  { fg: "nav-indicator", bg: "nav-surface", kind: "bound" },
  { fg: "border-muted", bg: "surface-textarea", kind: "bound" },
  { fg: "border-accent", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-page", kind: "bound" },
  { fg: "focus-ring", bg: "surface-card", kind: "bound" },
  { fg: "focus-ring", bg: "surface-section", kind: "bound" },
  { fg: "focus-ring", bg: "surface-form", kind: "bound" },
  { fg: "focus-ring", bg: "surface-filter", kind: "bound" },
  { fg: "focus-ring", bg: "nav-surface", kind: "bound" },
  // nav-button renders in the header (D6): focus ring against nav-header
  { fg: "focus-ring", bg: "nav-header", kind: "bound" },
  { fg: "focus-ring", bg: "focus-offset", kind: "bound" },
  { fg: "nav-tabs-current-border", bg: "nav-tabs-current", kind: "bound" },
  // In dark, nav-button-border is state-identifying (not decorative): measured
  { fg: "nav-button-border", bg: "nav-button-bg", kind: "bound" },
  { fg: "nav-button-border", bg: "nav-header", kind: "bound" },
  { fg: "nav-button-border-hover", bg: "nav-button-bg-hover", kind: "bound" },
  { fg: "nav-button-border-hover", bg: "nav-header", kind: "bound" },
  // refine-app-header D13: the avatar boundary is state-identifying in the
  // dark theme (design.md D5), so its pairs are measured there
  { fg: "nav-avatar-border", bg: "nav-surface", kind: "bound" },
  { fg: "nav-avatar-border", bg: "nav-avatar", kind: "bound" },
  { fg: "nav-avatar-border", bg: "nav-avatar-hover", kind: "bound" },

  // ── Action button boundaries (fix-button-boundaries design.md D2 + D6) ──
  // No action fill passes in dark, so each border identifies the button
  // against every host surface and against the rest fill and the hover fill
  // (D3: the rest border is kept on hover).
  { fg: "action-primary-border", bg: "surface-page", kind: "bound" },
  { fg: "action-primary-border", bg: "surface-card", kind: "bound" },
  { fg: "action-primary-border", bg: "surface-section", kind: "bound" },
  { fg: "action-primary-border", bg: "surface-form", kind: "bound" },
  { fg: "action-primary-border", bg: "action-primary", kind: "bound" },
  { fg: "action-primary-border", bg: "action-primary-hover", kind: "bound" },
  { fg: "action-1-border", bg: "surface-page", kind: "bound" },
  { fg: "action-1-border", bg: "surface-card", kind: "bound" },
  { fg: "action-1-border", bg: "surface-section", kind: "bound" },
  { fg: "action-1-border", bg: "surface-form", kind: "bound" },
  { fg: "action-1-border", bg: "action-1-bg", kind: "bound" },
  { fg: "action-1-border", bg: "action-1-bg-hover", kind: "bound" },
  { fg: "action-2-border", bg: "surface-page", kind: "bound" },
  { fg: "action-2-border", bg: "surface-card", kind: "bound" },
  { fg: "action-2-border", bg: "surface-section", kind: "bound" },
  { fg: "action-2-border", bg: "surface-form", kind: "bound" },
  { fg: "action-2-border", bg: "action-2-bg", kind: "bound" },
  { fg: "action-2-border", bg: "action-2-bg-hover", kind: "bound" },
  { fg: "action-3-border", bg: "surface-page", kind: "bound" },
  { fg: "action-3-border", bg: "surface-card", kind: "bound" },
  { fg: "action-3-border", bg: "surface-section", kind: "bound" },
  { fg: "action-3-border", bg: "surface-form", kind: "bound" },
  { fg: "action-3-border", bg: "action-3-bg", kind: "bound" },
  { fg: "action-3-border", bg: "action-3-bg-hover", kind: "bound" },
  { fg: "action-4-border", bg: "surface-page", kind: "bound" },
  { fg: "action-4-border", bg: "surface-card", kind: "bound" },
  { fg: "action-4-border", bg: "surface-section", kind: "bound" },
  { fg: "action-4-border", bg: "surface-form", kind: "bound" },
  { fg: "action-4-border", bg: "action-4-bg", kind: "bound" },
  { fg: "action-4-border", bg: "action-4-bg-hover", kind: "bound" },

  // ── Logotype exemptions (add-app-shell design.md D8) ──
  // Exempt from the 3:1 rule in the dark theme as well; measured at their
  // documented contrasts in the logotype block below.
  { fg: "logo-cup", bg: "nav-surface", kind: "bound", exempt: true },
  { fg: "logo-coffee", bg: "nav-surface", kind: "bound", exempt: true },
  { fg: "logo-leaf", bg: "nav-surface", kind: "bound", exempt: true },

  // ── Checked and inverse states (form-fields design.md D5) ──
  { fg: "checked-mark", bg: "surface-checked", kind: "icon" },
  { fg: "focus-ring-inverse", bg: "nav-surface-dark", kind: "bound" },
  { fg: "border-inverse", bg: "nav-surface-dark", kind: "bound" },
  { fg: "text-placeholder-inverse", bg: "nav-surface-dark", kind: "text" },
  { fg: "feedback-error-inverse", bg: "nav-surface-dark", kind: "text" },
  { fg: "surface-checked", bg: "nav-surface-dark", kind: "bound" },

  // ── Facet rows and sort control (add-facet-controls design.md D12) ──
  { fg: "nav-button-border", bg: "nav-surface-dark", kind: "bound" },
  { fg: "nav-button-border", bg: "nav-current-dark", kind: "bound" },
  { fg: "focus-ring-inverse", bg: "nav-current-dark", kind: "bound" },
  { fg: "focus-ring-inverse", bg: "focus-offset-inverse", kind: "bound" },
  { fg: "text-strong", bg: "surface-input", kind: "text" },

  // ── Evaluation scales (add-evaluation-scales design.md D9) ──
  // The seven measured pairs of the design summary §4, registered in both
  // matrices. Only pairs the matrices do not already assert are added here:
  // border-muted / surface-textarea and text-strong / surface-form are asserted
  // above. The two mark pairs fail until task 1.4 defines
  // --color-evaluation-bean-mark-on/off.
  { fg: "evaluation-bean-mark-off", bg: "evaluation-bean-off", kind: "icon" },
  // rides the documented bases of DOCUMENTED_BASES (evaluation-bean-on is
  // translucent in the traditional theme)
  { fg: "evaluation-bean-mark-on", bg: "evaluation-bean-on", kind: "icon" },
  { fg: "evaluation-slider-thumb", bg: "surface-form", kind: "bound" },
  { fg: "evaluation-slider-thumb", bg: "surface-card", kind: "bound" },
  { fg: "evaluation-slider-thumb", bg: "evaluation-slider-track", kind: "bound" },
  { fg: "border-muted", bg: "surface-form", kind: "bound" },
  { fg: "border-muted", bg: "surface-card", kind: "bound" },
  { fg: "text-strong", bg: "surface-card", kind: "text" },
  // The thumb edge is decorative (design summary §4): exempt from the 3:1 rule.
  { fg: "evaluation-slider-thumb-border", bg: "evaluation-slider-thumb", kind: "bound", exempt: true },

  // ── Page backdrop and section card band (refine-page-surfaces D6) ──
  { fg: "text-accent", bg: "surface-page", kind: "text" },
  { fg: "text-link", bg: "surface-page", kind: "text" },
  { fg: "text-link-hover", bg: "surface-page", kind: "text" },
  { fg: "text-label", bg: "surface-section", kind: "text" },
  { fg: "text-label", bg: "surface-section-hover", kind: "text" },
  { fg: "focus-ring", bg: "surface-section-hover", kind: "bound" },
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

  // Collect all semantic color token names (--color-* that reference other
  // tokens or use color-mix; primitives are plain hex values). Non-color
  // custom properties (font, tracking) are theme-invariant by design and are
  // excluded from the color-theme completeness contract.
  const semanticNames: string[] = [];
  for (const [name, value] of tradProps) {
    if (!name.startsWith("--color-")) continue;
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

// ═══════════════════════════════════════════════════════════════════════════════
// Radius token completeness (design.md D1)
// The four radius tokens live in @theme and are reassigned to 0 under
// [data-theme="dark"]. Completeness: each expected token is defined in the
// traditional @theme and reassigned in the dark theme, so shapes switch with
// the theme. Until the tokens exist (task 4.2), these checks fail.
// ═══════════════════════════════════════════════════════════════════════════════

const EXPECTED_RADIUS_TOKENS = [
  "--radius-pill",
  "--radius-container",
  "--radius-field",
  "--radius-check",
] as const;

// Correction 10 (review round 1): assert the radius VALUES, not only presence.
// Traditional theme: 9999px / 16px / 8px / 4px. Dark theme: 0 for all four.
const EXPECTED_RADIUS_TRADITIONAL: Record<string, string> = {
  "--radius-pill": "9999px",
  "--radius-container": "16px",
  "--radius-field": "8px",
  "--radius-check": "4px",
};

describe("Radius token completeness: every radius token defined in both themes", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  for (const token of EXPECTED_RADIUS_TOKENS) {
    it(`traditional @theme defines ${token}`, () => {
      expect(tradProps.has(token)).toBe(true);
    });

    it(`dark theme reassigns ${token}`, () => {
      expect(darkProps.has(token)).toBe(true);
    });
  }

  // Relational completeness: every --radius-* actually defined in @theme is
  // reassigned under [data-theme="dark"] (catches future drift where a token
  // is added to @theme but forgotten in the dark block).
  it("every --radius-* defined in @theme is reassigned under [data-theme=\"dark\"]", () => {
    const radiusInTraditional = [...tradProps.keys()].filter((k) =>
      k.startsWith("--radius-"),
    );
    for (const token of radiusInTraditional) {
      expect(darkProps.has(token)).toBe(true);
    }
  });
});

describe("Radius token values (correction 10)", () => {
  const css = readGlobals();
  const tradProps = extractTraditional(css);
  const darkProps = extractDark(css);

  it("traditional theme uses the documented radius values", () => {
    for (const [token, value] of Object.entries(EXPECTED_RADIUS_TRADITIONAL)) {
      expect(tradProps.get(token)).toBe(value);
    }
  });

  it("dark theme reassigns every radius token to 0", () => {
    for (const token of EXPECTED_RADIUS_TOKENS) {
      expect(darkProps.get(token)).toBe("0");
    }
  });
});

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
// Typographic role verification (design.md role table)
// Each role is an @utility type-{role} combining family, weight, style, size,
// line height, tracking and a semantic color token. Role metrics are identical
// in both themes (no role changes under [data-theme="dark"]).
// ═══════════════════════════════════════════════════════════════════════════════

interface RoleSpec {
  name: string;
  family?: string; // 'var(--font-sans)' or 'var(--font-serif)'
  weight?: string; // '400', '600', '700'
  style?: "italic";
  transform?: "uppercase";
  numeric?: "tabular-nums";
  sizeBase?: string; // Tailwind size name: 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'
  sizeMd?: string;
  sizeLg?: string;
  lineHeight?: "tight" | "default" | "relaxed" | "none";
  tracking?: string; // tracking token name
  color?: string; // semantic color token name
}

const SIZE_TO_REM: Record<string, number> = {
  xs: 0.75,
  sm: 0.875,
  base: 1,
  lg: 1.125,
  xl: 1.25,
  "2xl": 1.5,
  "3xl": 1.875,
  "4xl": 2.25,
};

const LINE_HEIGHT_VALUES: Record<string, string> = {
  tight: "var(--leading-tight)",
  default: "var(--leading-normal)",
  relaxed: "var(--leading-relaxed)",
  none: "var(--leading-none)",
};

const ROLES: RoleSpec[] = [
  { name: "heading", family: "var(--font-serif)", weight: "700", sizeBase: "2xl", sizeMd: "3xl", sizeLg: "4xl", lineHeight: "tight", color: "text-primary" },
  { name: "card-heading", family: "var(--font-serif)", weight: "700", sizeBase: "xl", sizeMd: "2xl", lineHeight: "tight", color: "text-primary" },
  { name: "card-subtitle", family: "var(--font-serif)", weight: "400", style: "italic", sizeBase: "xs", lineHeight: "default", color: "text-secondary" },
  { name: "score", family: "var(--font-serif)", weight: "700", style: "italic", numeric: "tabular-nums", sizeBase: "3xl", lineHeight: "none", color: "text-primary" },
  { name: "body", family: "var(--font-sans)", weight: "400", sizeBase: "base", lineHeight: "relaxed", color: "text-primary" },
  { name: "body-accent", style: "italic", color: "text-accent" },
  { name: "subheading", family: "var(--font-sans)", weight: "600", sizeBase: "base", lineHeight: "default", tracking: "subheading", color: "text-accent" },
  { name: "eyebrow", family: "var(--font-sans)", weight: "400", sizeBase: "sm", sizeMd: "base", sizeLg: "lg", lineHeight: "tight", tracking: "eyebrow", color: "text-accent" },
  { name: "eyebrow-strong", family: "var(--font-sans)", weight: "600", transform: "uppercase", sizeBase: "sm", sizeMd: "base", sizeLg: "lg", lineHeight: "tight", tracking: "eyebrow", color: "text-label" },
  { name: "brand", family: "var(--font-sans)", weight: "700", transform: "uppercase", sizeBase: "base", sizeLg: "lg", lineHeight: "tight", tracking: "brand", color: "text-strong" },
  { name: "label", family: "var(--font-sans)", weight: "600", sizeBase: "base", lineHeight: "tight", color: "text-label" },
  { name: "control", family: "var(--font-sans)", weight: "400", sizeBase: "base", sizeMd: "sm", lineHeight: "default", color: "text-strong" },
  { name: "meta", family: "var(--font-sans)", weight: "400", sizeBase: "xs", lineHeight: "default", color: "text-secondary" },
  { name: "error", family: "var(--font-sans)", weight: "400", sizeBase: "sm", lineHeight: "default", color: "feedback-error" },
  { name: "navbar-item", family: "var(--font-sans)", weight: "400", style: "italic", sizeBase: "base", lineHeight: "default", color: "nav-text" },
  { name: "navlist-item", family: "var(--font-sans)", weight: "400", sizeBase: "base", lineHeight: "default", color: "nav-text" },
  { name: "sidebar-item", family: "var(--font-sans)", weight: "400", sizeBase: "base", lineHeight: "default", color: "nav-text-dark" },
  { name: "button", family: "var(--font-sans)", weight: "600", sizeBase: "sm", lineHeight: "default" },
  { name: "badge", family: "var(--font-sans)", weight: "600", sizeBase: "sm", lineHeight: "default" },
  // Combobox option lines (add-facet-controls design.md D10): no colour.
  { name: "option", family: "var(--font-sans)", weight: "600", sizeBase: "sm", lineHeight: "tight" },
  { name: "option-detail", family: "var(--font-sans)", weight: "400", sizeBase: "xs", lineHeight: "default" },
];

/** Extract @utility type-{role} blocks: returns map of role name -> block content. */
function extractTypeUtilities(css: string): Map<string, string> {
  const utils = new Map<string, string>();
  const regex = /@utility\s+(type-[a-z-]+)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    const name = match[1]!;
    const block = extractBlock(css, match.index + match[0].length - 1);
    utils.set(name, block);
  }
  return utils;
}

/** Extract a CSS property value from a block (e.g. font-weight: 700;). */
function getProperty(block: string, prop: string): string | null {
  const regex = new RegExp(`${prop}\\s*:\\s*([^;]+);`);
  const match = block.match(regex);
  return match ? match[1]!.trim() : null;
}

/** Extract font-size from a @media (min-width: WIDTHrem) block within a utility. */
function getResponsiveSize(block: string, widthRem: string): string | null {
  const regex = new RegExp(
    `@media\\s*\\(\\s*min-width\\s*:\\s*${widthRem}rem\\s*\\)\\s*\\{[^}]*font-size\\s*:\\s*([^;]+);`,
  );
  const match = block.match(regex);
  return match ? match[1]!.trim() : null;
}

describe("Typographic roles: each role defined as @utility type-{role}", () => {
  const css = readGlobals();
  const utils = extractTypeUtilities(css);

  for (const role of ROLES) {
    it(`@utility type-${role.name} exists`, () => {
      expect(utils.has(`type-${role.name}`)).toBe(true);
    });
  }
});

describe("Typographic roles: role properties match design.md table", () => {
  const css = readGlobals();
  const utils = extractTypeUtilities(css);

  for (const role of ROLES) {
    const block = utils.get(`type-${role.name}`);

    it(`type-${role.name}: font-family`, () => {
      if (!block) return; // skip if not defined (caught by existence test)
      const val = getProperty(block, "font-family");
      if (role.family) {
        expect(val).toBe(role.family);
      } else {
        // body-accent inherits: font-family should not be set
        expect(val).toBeNull();
      }
    });

    it(`type-${role.name}: font-weight`, () => {
      if (!block) return;
      const val = getProperty(block, "font-weight");
      if (role.weight) {
        expect(val).toBe(role.weight);
      } else {
        expect(val).toBeNull();
      }
    });

    it(`type-${role.name}: font-style`, () => {
      if (!block) return;
      const val = getProperty(block, "font-style");
      if (role.style === "italic") {
        expect(val).toBe("italic");
      }
    });

    it(`type-${role.name}: text-transform`, () => {
      if (!block) return;
      const val = getProperty(block, "text-transform");
      if (role.transform === "uppercase") {
        expect(val).toBe("uppercase");
      }
    });

    it(`type-${role.name}: font-variant-numeric`, () => {
      if (!block) return;
      const val = getProperty(block, "font-variant-numeric");
      if (role.numeric === "tabular-nums") {
        expect(val).toBe("tabular-nums");
      }
    });

    it(`type-${role.name}: base font-size`, () => {
      if (!block) return;
      if (!role.sizeBase) return; // body-accent inherits
      const val = getProperty(block, "font-size");
      expect(val).toBe(`var(--text-${role.sizeBase})`);
    });

    it(`type-${role.name}: md font-size`, () => {
      if (!block) return;
      if (!role.sizeMd) return;
      const val = getResponsiveSize(block, "48");
      expect(val).toBe(`var(--text-${role.sizeMd})`);
    });

    it(`type-${role.name}: lg font-size`, () => {
      if (!block) return;
      if (!role.sizeLg) return;
      const val = getResponsiveSize(block, "64");
      expect(val).toBe(`var(--text-${role.sizeLg})`);
    });

    it(`type-${role.name}: line-height`, () => {
      if (!block) return;
      if (!role.lineHeight) return;
      const val = getProperty(block, "line-height");
      expect(val).toBe(LINE_HEIGHT_VALUES[role.lineHeight]);
    });

    it(`type-${role.name}: letter-spacing`, () => {
      if (!block) return;
      if (!role.tracking) return;
      const val = getProperty(block, "letter-spacing");
      expect(val).toBe(`var(--tracking-${role.tracking})`);
    });

    it(`type-${role.name}: color`, () => {
      if (!block) return;
      const val = getProperty(block, "color");
      if (role.color) {
        expect(val).toBe(`var(--color-${role.color})`);
      } else {
        // button/badge: no color (component applies it)
        expect(val).toBeNull();
      }
    });
  }
});

describe("Typographic roles: theme invariance (no role overrides in dark)", () => {
  const css = readGlobals();
  // Extract the dark block content
  const darkRegex = /\[data-theme="dark"\]\s*\{/g;
  let match: RegExpExecArray | null;
  let darkBlock = "";
  while ((match = darkRegex.exec(css)) !== null) {
    darkBlock += extractBlock(css, match.index + match[0].length - 1);
  }

  it("dark block contains no @utility type-* overrides", () => {
    const typeUtilityInDark = /@utility\s+type-/.test(darkBlock);
    expect(typeUtilityInDark).toBe(false);
  });
});

describe("Typographic roles: sizing accessibility rules", () => {
  const css = readGlobals();
  const utils = extractTypeUtilities(css);

  it("control role renders at 16px (text-base) on mobile", () => {
    const block = utils.get("type-control");
    if (!block) return;
    const val = getProperty(block, "font-size");
    expect(val).toBe("var(--text-base)");
    expect(SIZE_TO_REM["base"]).toBe(1); // 1rem = 16px
  });

  it("error role size >= 14px", () => {
    const block = utils.get("type-error");
    if (!block) return;
    const val = getProperty(block, "font-size");
    expect(val).toBe("var(--text-sm)");
    expect(SIZE_TO_REM["sm"]).toBeGreaterThanOrEqual(0.875); // 14px
  });

  it("button role size >= 14px", () => {
    const block = utils.get("type-button");
    if (!block) return;
    const val = getProperty(block, "font-size");
    expect(val).toBe("var(--text-sm)");
    expect(SIZE_TO_REM["sm"]).toBeGreaterThanOrEqual(0.875); // 14px
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Shared focus indicator (design.md D4)
// The indicator is defined exactly once as @utility focus-ring and renders
// exactly the effect of the five-class set the controls carried before:
// outline suppressed, a 2px ring in --color-focus-ring, a 2px offset in
// --color-focus-offset. The ring layer spreads 4px — the 2px offset gap plus
// the 2px ring width. Colors resolve through the token variables, so theme
// reassignment keeps working. Until the utility exists (task 2.2), these
// checks fail.
// ═══════════════════════════════════════════════════════════════════════════════

/** Extract every @utility focus-ring block from globals.css. */
function extractFocusRingUtilities(css: string): string[] {
  const blocks: string[] = [];
  const regex = /@utility\s+focus-ring\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    blocks.push(extractBlock(css, match.index + match[0].length - 1));
  }
  return blocks;
}

describe("Shared focus indicator: @utility focus-ring (design.md D4)", () => {
  const css = readGlobals();
  const blocks = extractFocusRingUtilities(css);
  const block = blocks[0] ?? "";

  it("@utility focus-ring is defined exactly once", () => {
    expect(blocks).toHaveLength(1);
  });

  it("focus-ring suppresses the native outline", () => {
    expect(getProperty(block, "outline")).toBe("none");
  });

  it("focus-ring renders a 2px ring resolving through var(--color-focus-ring)", () => {
    expect(getProperty(block, "box-shadow")).toContain(
      "0 0 0 4px var(--color-focus-ring)",
    );
  });

  it("focus-ring renders a 2px offset resolving through var(--color-focus-offset)", () => {
    expect(getProperty(block, "box-shadow")).toContain(
      "0 0 0 2px var(--color-focus-offset)",
    );
  });

  it("focus-ring renders exactly the five-class effect", () => {
    expect(getProperty(block, "box-shadow")).toBe(
      "0 0 0 2px var(--color-focus-offset), 0 0 0 4px var(--color-focus-ring)",
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Inverse variant scope utility (form-fields design.md D2)
// One scope utility reassigns the tokens the inverse variant swaps, so every
// control keeps one class set across both variants and the inverse surface
// resolves through the same semantic names. The block is normative: exactly
// the eight reassignments of design.md D2, nothing else. Until the utility
// exists (task 1.5), these checks fail.
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

/** The exact reassignment block of form-fields design.md D2. */
const VARIANT_INVERSE_REASSIGNMENTS: Record<string, string> = {
  "--color-text-label": "var(--color-nav-text-dark)",
  "--color-text-secondary": "var(--color-nav-text-dark)",
  "--color-text-strong": "var(--color-nav-text-dark)",
  "--color-text-placeholder": "var(--color-text-placeholder-inverse)",
  "--color-border-strong": "var(--color-border-inverse)",
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

  it("reassigns exactly the eight tokens of design.md D2", () => {
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

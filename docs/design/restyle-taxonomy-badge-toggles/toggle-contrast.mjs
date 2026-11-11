// Contrast of the taxonomy tree toggle on every taxonomy badge colour.
// Usage: node toggle-contrast.mjs <taxonomy seed csv>
// Badge background = data colour at its depth opacity over the card surface
// (as Badge.tsx / taxonomy-color.ts render it). Gate: 3:1 (icon, boundary).
import { readFileSync } from "node:fs";

const csvPath = process.argv[2];
const GATE = 3.0;

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const hex = (h) => { const v = h.replace("#", ""); return [0, 2, 4].map((s) => parseInt(v.slice(s, s + 2), 16)); };
const toHex = (c) => "#" + c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
const lum = (h) => { const [r, g, b] = hex(h).map((x) => { const s = x / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const blend = (fg, alpha, bg) => { const f = hex(fg), b = hex(bg); return toHex(f.map((c, i) => c * alpha + b[i] * (1 - alpha))); };

const SURFACE = { traditional: "#f2e8d9", dark: "#0d1b1e" }; // --color-surface-card
const OPACITY = { 0: 1, 1: 0.92, 2: 0.85 };

// Existing semantic tokens, resolved per theme (globals.css).
const FG = {
  "white (literal)": { traditional: "#ffffff", dark: "#ffffff" },
  "text-input-icon": { traditional: "#ffffff", dark: "#c9e5e0" },
  "nav-text-dark / action-primary-text": { traditional: "#f2e8d9", dark: "#f2eadd" },
  "nav-toggle-icon": { traditional: "#f2e8d9", dark: "#c9e5e0" },
  "text-strong": { traditional: "#1a2f35", dark: "#f2eadd" },
  "text-primary": { traditional: "#2e5a52", dark: "#c9e5e0" },
  "black (literal)": { traditional: "#000000", dark: "#000000" },
};

const rows = parseCsv(readFileSync(csvPath, "utf8")).slice(1);
const nodes = rows.map((r) => ({ id: r[0], parent: r[1], level: Number(r[2]), name: r[3], color: (r[8] || "").trim().toLowerCase(), cats: r[9] }));
const parents = new Set(nodes.map((n) => n.parent).filter(Boolean));
const usable = nodes.filter((n) => /^#[0-9a-f]{6}$/.test(n.color));
const withToggle = usable.filter((n) => parents.has(n.id));

const labelOf = (bg) => (lum(bg) <= 0.179 ? "#ffffff" : "#000000");

console.log(`Nodes: ${nodes.length}; with a colour: ${usable.length}; with children (toggle): ${withToggle.length}`);

for (const set of [["toggle-bearing notes", withToggle], ["every badge", usable]]) {
  const [title, list] = set;
  console.log(`\n## Summary over ${title} (${list.length})`);
  console.log("| Candidate (glyph and border) | Theme | Min ratio | Fails < 3:1 |");
  console.log("|---|---|--:|--:|");
  for (const [name, val] of Object.entries(FG)) {
    for (const theme of ["traditional", "dark"]) {
      let min = Infinity, fails = 0;
      for (const n of list) {
        const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]);
        const r = ratio(val[theme], bg);
        min = Math.min(min, r); if (r < GATE) fails++;
      }
      console.log(`| ${name} | ${theme} | ${min.toFixed(2)} | ${fails} |`);
    }
  }
  for (const theme of ["traditional", "dark"]) {
    let min = Infinity, fails = 0;
    for (const n of list) {
      const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]);
      const r = ratio(labelOf(bg), bg); min = Math.min(min, r); if (r < GATE) fails++;
    }
    console.log(`| label rule, today (border-current) | ${theme} | ${min.toFixed(2)} | ${fails} |`);
  }
  // Option: solid chip in the card surface, glyph text-primary (no border).
  const glyphOnCard = { traditional: ratio("#2e5a52", SURFACE.traditional), dark: ratio("#c9e5e0", SURFACE.dark) };
  for (const theme of ["traditional", "dark"]) {
    let min = Infinity, fails = 0;
    for (const n of list) {
      const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]);
      const r = ratio(SURFACE[theme], bg); min = Math.min(min, r); if (r < GATE) fails++;
    }
    console.log(`| chip: fill surface-card vs badge (glyph text-primary on it ${glyphOnCard[theme].toFixed(2)}) | ${theme} | ${min.toFixed(2)} | ${fails} |`);
  }
  // Option: nav-toggle-bg fill (translucent) + nav-toggle-icon glyph and border.
  const TOG = { traditional: ["#1a2f35", 0.45, "#f2e8d9"], dark: ["#c9e5e0", 0.15, "#c9e5e0"] };
  for (const theme of ["traditional", "dark"]) {
    let gmin = Infinity, bmin = Infinity, gf = 0, bf = 0;
    for (const n of list) {
      const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]);
      const [ov, a, icon] = TOG[theme];
      const fill = blend(ov, a, bg);
      const g = ratio(icon, fill);
      const b = Math.max(ratio(fill, bg), ratio(icon, bg));
      gmin = Math.min(gmin, g); bmin = Math.min(bmin, b); if (g < GATE) gf++; if (b < GATE) bf++;
    }
    console.log(`| nav-toggle pair: glyph on fill / boundary (fill or border vs badge) | ${theme} | ${gmin.toFixed(2)} / ${bmin.toFixed(2)} | ${gf} / ${bf} |`);
  }
}

// Two-tone chips: an opaque fill token, a glyph and a 1px ring token.
// Boundary measured as the better of fill-vs-badge and ring-vs-badge.
const CHIPS = {
  "fill nav-surface-dark, glyph+ring nav-text-dark": { traditional: ["#2e5a52", "#f2e8d9"], dark: ["#112320", "#f2eadd"] },
  "fill nav-surface-dark, glyph+ring white (literal)": { traditional: ["#2e5a52", "#ffffff"], dark: ["#112320", "#ffffff"] },
  "fill surface-card, glyph+ring text-strong": { traditional: ["#f2e8d9", "#1a2f35"], dark: ["#0d1b1e", "#f2eadd"] },
  "fill surface-textarea, glyph+ring text-strong": { traditional: ["#ffffff", "#1a2f35"], dark: ["#051215", "#f2eadd"] },
  "fill surface-card, glyph+ring text-primary": { traditional: ["#f2e8d9", "#2e5a52"], dark: ["#0d1b1e", "#c9e5e0"] },
};
for (const [title, list] of [["toggle-bearing notes", withToggle], ["every badge", usable]]) {
  console.log(`\n## Two-tone chips over ${title}`);
  console.log("| Chip | Theme | Glyph on fill | Min boundary | Fails |");
  console.log("|---|---|--:|--:|--:|");
  for (const [name, val] of Object.entries(CHIPS)) {
    for (const theme of ["traditional", "dark"]) {
      const [fill, ring] = val[theme];
      let bmin = Infinity, bf = 0;
      for (const n of list) {
        const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]);
        const b = Math.max(ratio(fill, bg), ratio(ring, bg));
        bmin = Math.min(bmin, b); if (b < GATE) bf++;
      }
      console.log(`| ${name} | ${theme} | ${ratio(ring, fill).toFixed(2)} | ${bmin.toFixed(2)} | ${bf} |`);
    }
  }
}

for (const [name, val] of Object.entries(CHIPS)) {
  for (const theme of ["traditional", "dark"]) {
    const [fill, ring] = val[theme];
    const fails = withToggle
      .map((n) => { const bg = blend(n.color, OPACITY[n.level], SURFACE[theme]); return [n, Math.max(ratio(fill, bg), ratio(ring, bg))]; })
      .filter(([, b]) => b < GATE)
      .map(([n, b]) => `${n.id} ${n.name} L${n.level} ${b.toFixed(2)}`);
    if (fails.length) console.log(`FAILS ${name} ${theme}: ${fails.join("; ")}`);
  }
}

// Is any single flat colour (glyph and border, no fill) able to pass on every
// toggle-bearing badge? Scan the grey axis of luminance.
for (const theme of ["traditional", "dark"]) {
  const bgs = withToggle.map((n) => blend(n.color, OPACITY[n.level], SURFACE[theme]));
  const ls = bgs.map(lum);
  const lo = Math.min(...ls), hi = Math.max(...ls);
  const needMin = GATE * (lo + 0.05) - 0.05; // lighter than darkest bg
  const needMax = (hi + 0.05) / GATE - 0.05; // darker than lightest bg
  console.log(`\n${theme}: badge luminance ${lo.toFixed(3)}..${hi.toFixed(3)}; a flat colour needs L >= ${needMin.toFixed(3)} (vs darkest) and L <= ${needMax.toFixed(3)} (vs lightest) -> ${needMin <= needMax ? "possible" : "impossible"}`);
}

console.log("\n## White glyph and border, per toggle-bearing note (ratio vs rendered badge)");
console.log("| id | Note (en) | Level | Colour | Badge bg trad | White trad | Badge bg dark | White dark | Label today trad/dark |");
console.log("|---|---|:-:|---|---|--:|---|--:|---|");
for (const n of withToggle) {
  const bt = blend(n.color, OPACITY[n.level], SURFACE.traditional);
  const bd = blend(n.color, OPACITY[n.level], SURFACE.dark);
  const wt = ratio("#ffffff", bt), wd = ratio("#ffffff", bd);
  const mark = (r) => (r < GATE ? `**${r.toFixed(2)}** fail` : r.toFixed(2));
  const lab = (bg) => (labelOf(bg) === "#ffffff" ? "white" : "black");
  console.log(`| ${n.id} | ${n.name} | ${n.level} | ${n.color} | ${bt} | ${mark(wt)} | ${bd} | ${mark(wd)} | ${lab(bt)}/${lab(bd)} |`);
}

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const testFiles = ["**/*.test.ts", "**/*.test.tsx"];

const slicedLayers = ["pages", "widgets", "features", "entities"];

// Non-sliced segments with a public index; a new one adds its line here.
const segments = [
  "shared/ui",
  "shared/api",
  "shared/lib/filter-query",
  "shared/lib/geocoding",
  "shared/lib/hooks",
  "shared/lib/i18n",
  "shared/lib/leaflet",
  "app/shell",
];

const ownIndexMessage =
  "Import sibling files directly, never through the own public index.";

function restrictImports(files, ownIndexNames, layerPatterns = []) {
  const names = [".", "./index", "..", "../index", ...ownIndexNames];
  return {
    files,
    ignores: testFiles,
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: names.map((name) => ({ name, message: ownIndexMessage })),
          patterns: layerPatterns.map((group) => ({
            group: [group],
            message: "Never import between slices of the same layer.",
          })),
        },
      ],
    },
  };
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Interface texts arrive as props (design.md D10): a rendered literal text
  // is a verification failure ("Literal interface text"). The brand wordmark
  // is brand artwork rendered from the WORDMARK constant in Logo.tsx, so no
  // elementOverride is needed for it, and the required-field marker `*` is a
  // glyph, not text. Deviation from design.md D10, directed by the product
  // owner: `elementOverrides` is dropped (its Logo carve-out has no remaining
  // purpose and configuring it re-enables attribute checking on <Logo> and
  // crashes the installed plugin on declarations without initializers) and
  // top-level `allowedStrings: ["*"]` replaces it. The entry reaches only the
  // code that renders the interface — test files pass interface texts as
  // fixtures and are not it. `eslint-config-next` already registers
  // `eslint-plugin-react` under the plugin key `react`, so no `plugins` entry
  // belongs here.
  {
    files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}", "*.ts"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: ["*"],
        },
      ],
    },
  },
  // Code-structure rules of AGENTS.md as warnings (design.md D1–D4 of
  // add-code-structure-lint-rules): the current code breaks them until the
  // refactors land. Size and complexity count non-blank, non-comment lines of
  // the production code; the generated API schema is never edited by hand.
  {
    files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}", "*.ts"],
    ignores: [...testFiles, "src/shared/api/schema.ts"],
    rules: {
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
      complexity: ["warn", { max: 15 }],
    },
  },
  // Each file gets one effective no-restricted-imports entry: flat config
  // replaces the options of a rule, so every entry repeats the relative paths
  // that re-enter a folder's own index. Tests import through the public API.
  restrictImports(["src/**/*.{ts,tsx}"], []),
  ...slicedLayers.map((layer) =>
    restrictImports([`src/${layer}/**`], [], [`@/${layer}/*`]),
  ),
  ...segments.map((segment) =>
    restrictImports([`src/${segment}/**`], [`@/${segment}`, `@/${segment}/index`]),
  ),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

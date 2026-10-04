import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// The request configuration is not at the plugin's default i18n/request.ts
// path, so the path is passed explicitly (design.md D10).
const withNextIntl = createNextIntlPlugin("./src/shared/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);

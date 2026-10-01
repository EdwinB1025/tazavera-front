import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// `href` is typed `/${string}` so an absolute URL is a compile error with no
// runtime branch (spec: "External destination refused"). No generated API type
// is used here.

export type LinkProps = {
  href: `/${string}`; // in-application route — an absolute URL is a compile error
  variant?: "default" | "back"; // default "default"
  children: ReactNode;
};

// The component is implemented in task 3.2 using next/link, always underlined,
// with the back variant per design.md D7.

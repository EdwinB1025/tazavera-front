import type { ReactNode } from "react";

/**
 * Home screen (design.md D13; spec: "Root of a supported locale").
 *
 * It fills the main area with no content until `add-landing` fills it.
 */
export function HomeScreen(): ReactNode {
  return <div className="flex-1" />;
}

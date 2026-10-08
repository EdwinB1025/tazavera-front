"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { setTheme, type Theme } from "@/shared/lib/theme";
import { Moon, Sun } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// Every interface text arrives as a prop (design.md D10 of add-app-shell).

export type ThemeToggleTexts = {
  /** Name while the traditional theme is current (refine-header-aut D2). */
  themeToggleToDark: string;
  /** Name while the dark theme is current (refine-header-aut D2). */
  themeToggleToTraditional: string;
};

export type ThemeToggleProps = {
  /** The theme the server resolved from the cookie (refine-header-aut D3). */
  initialTheme: Theme;
  texts: ThemeToggleTexts;
};

// The ghost icon control of the header (refine-header-aut D1), like the
// navigation menu trigger, on every viewport.
const TOGGLE_CLASSES = [
  "flex",
  "size-10",
  // it never shrinks in the right group (fit-header-at-375)
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-field",
  "text-nav-text",
  "hover:text-nav-text-hover",
  "focus-visible:focus-ring",
].join(" ");

/**
 * Theme switch (refine-header-aut D1–D3; spec "Theme switch").
 *
 * The icon shows the current theme; the accessible name states the current
 * and the target theme, so the button carries no `aria-pressed` (D2). A click
 * keeps the choice in the cookie and applies it to the document root.
 */
export function ThemeToggle({ initialTheme, texts }: ThemeToggleProps): ReactNode {
  const [theme, setCurrent] = useState<Theme>(initialTheme);
  const next: Theme = theme === "dark" ? "traditional" : "dark";
  const Icon = theme === "dark" ? Moon : Sun;

  const handleClick = () => {
    setTheme(next);
    setCurrent(next);
  };

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? texts.themeToggleToTraditional : texts.themeToggleToDark}
      onClick={handleClick}
      className={TOGGLE_CLASSES}
    >
      <Icon aria-hidden className="size-6" />
    </button>
  );
}

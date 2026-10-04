"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { readTheme, setTheme, THEMES, type Theme } from "@/shared/lib/theme";

// ─── UI-specific types (declared before the component) ───
// The accessible name arrives as a prop (design.md D10); the theme values
// themselves are data and render unchanged in every locale.

export type ThemeSelectProps = {
  /** Accessible name (spec: "Selector is named"). */
  label: string;
};

const SELECT_CLASSES = [
  "type-control",
  "h-10",
  "w-full",
  "rounded-field",
  "border",
  "border-border-strong",
  "bg-surface-input",
  "px-3",
  "focus-visible:focus-ring",
].join(" ");

/**
 * Theme selector (design.md D12; spec: "Theme selection").
 *
 * Offers exactly the application's themes. The control is uncontrolled: the
 * stored choice is reflected onto it after mount (the preference cookie does
 * not exist during server rendering) and the user's choice sticks natively.
 * Choosing a theme keeps the preference and applies `data-theme` to the
 * document root immediately, without a reload.
 */
export function ThemeSelect({ label }: ThemeSelectProps): ReactNode {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const select = selectRef.current;
    if (select) select.value = readTheme(document.cookie);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.currentTarget.value as Theme);
  };

  return (
    <select
      ref={selectRef}
      aria-label={label}
      onChange={handleChange}
      className={SELECT_CLASSES}
    >
      {THEMES.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}

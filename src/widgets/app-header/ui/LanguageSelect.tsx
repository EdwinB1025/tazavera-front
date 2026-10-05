"use client";

import type { ChangeEvent, ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// The accessible name arrives as a prop (design.md D10) and the locales are
// data: the selector lists exactly the supported locales and offers no
// locale the application does not support (spec: "Only supported locales are
// offered").

export type LanguageSelectProps = {
  /**
   * The composed accessible name the shell passes (design.md D6), e.g.
   * "Idioma: Español" (spec: "Selector is named").
   */
  label: string;
  /** Exactly the supported locales. */
  locales: string[];
  /** Active locale. */
  value: string;
  /** The caller opens the current route in the chosen locale. */
  onLocaleChange: (locale: string) => void;
};

// Header controls take the nav-button-* treatment (design summary §3) and
// the shared focus indicator (design summary §3: focus-visible:focus-ring).
const SELECT_CLASSES = [
  "type-button",
  "h-10",
  "rounded-pill",
  "border",
  "bg-nav-button-bg",
  "text-nav-button-text",
  "border-nav-button-border",
  "px-3",
  "hover:bg-nav-button-bg-hover",
  "hover:text-nav-button-text-hover",
  "hover:border-nav-button-border-hover",
  "focus-visible:focus-ring",
].join(" ");

/**
 * Header language selector (spec: "Language selection").
 *
 * A select listing the supported locales; choosing one calls back with it so
 * the caller opens the same route in the chosen locale.
 */
export function LanguageSelect({
  label,
  locales,
  value,
  onLocaleChange,
}: LanguageSelectProps): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLocaleChange(event.currentTarget.value);
  };

  return (
    <select
      aria-label={label}
      value={value}
      onChange={handleChange}
      className={SELECT_CLASSES}
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );
}

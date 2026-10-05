"use client";

import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/shared/ui";
import { ChevronDown, Globe } from "@/shared/ui/icons";
import { LOCALE_NAMES } from "@/shared/config/locale-names";
import { isSupportedLocale } from "@/shared/config/locales";

// ─── UI-specific types (declared before the component) ───
// The accessible name arrives as a prop (design.md D10) and the languages'
// own names and `lang` codes are data (design.md D6): the selector lists
// exactly the supported locales and offers no locale the application does
// not support (spec: "Only supported locales are offered").

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

// ─── The ghost trigger (design.md D3) ───
// A menu trigger, not an action control: no fill and no border at rest or on
// hover, the content switching between the header's navigation text colours,
// and focus keeping the shared indicator (spec: "Header menu triggers").
const TRIGGER_CLASSES = [
  "type-button",
  "flex",
  "h-10",
  "items-center",
  "gap-2",
  "rounded-field",
  "px-3",
  "text-nav-text",
  "hover:text-nav-text-hover",
  "focus-visible:focus-ring",
].join(" ");

/**
 * Header language selector (spec: "Language selection").
 *
 * A menu opened from a ghost trigger carrying the globe, the current
 * locale's code and a chevron on every viewport (design.md D7, D8). Each
 * supported locale is one entry of a single-choice group, shown in its own
 * name with its own `lang` attribute, and choosing one calls back with its
 * locale so the caller opens the same route in it. The menu takes the nav
 * surface so it extends the header (spec: "Menu surface extends the header").
 */
export function LanguageSelect({
  label,
  locales,
  value,
  onLocaleChange,
}: LanguageSelectProps): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={TRIGGER_CLASSES} aria-label={label}>
        <Globe className="size-4" />
        {value.toUpperCase()}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent surface="nav">
        <DropdownMenuRadioGroup value={value} onValueChange={onLocaleChange}>
          {locales.filter(isSupportedLocale).map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              lang={LOCALE_NAMES[code].lang}
            >
              {LOCALE_NAMES[code].name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

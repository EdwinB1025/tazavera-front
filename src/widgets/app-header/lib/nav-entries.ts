import { Info, Star, Store, type LucideIcon } from "@/shared/ui/icons";

// ─── Derived types (declared before the function) ───

export type PrimaryNavEntryTexts = {
  topRated: string;
  exploreCoffeeshops: string;
  aboutUs: string;
};

export type PrimaryNavEntry = {
  /** The entry's route without its query; the current entry matches it. */
  path: `/${string}`;
  query: string;
  label: string;
  /** The entry's decorative icon in the navigation menu (add-user-menu-icons D3). */
  icon: LucideIcon;
};

/**
 * The primary navigation's entries, in order (spec: "Header brand and primary
 * navigation"): "Top rated" at the verified offerings ordered by cupping
 * average descending, "Explore coffee shops" at the directory and "About us".
 * Read by the header navigation and by the small-viewport navigation menu
 * (fix-production-aut-findings design.md D7).
 */
export function primaryNavEntries(
  locale: string,
  texts: PrimaryNavEntryTexts,
): PrimaryNavEntry[] {
  return [
    {
      path: `/${locale}/offerings`,
      query: "?verified=1&orderBy=cupping_avg&orderDirection=desc",
      label: texts.topRated,
      icon: Star,
    },
    {
      path: `/${locale}/coffeeshops`,
      query: "",
      label: texts.exploreCoffeeshops,
      icon: Store,
    },
    { path: `/${locale}/about`, query: "", label: texts.aboutUs, icon: Info },
  ];
}

import type { RoasterySummary } from "@/shared/api";
import type { ComboboxOption } from "@/shared/ui";
import { searchByName } from "./search-by-name";

/**
 * Roastery search of the Roastery combobox (design.md D1, D7): `GET
 * /roasteries?name=` through the shared name search, each roastery with its
 * description as the second line.
 */
export const searchRoasteries = searchByName<RoasterySummary>("/roasteries", (roasteries) =>
  roasteries.map((roastery): ComboboxOption => {
    const name = roastery.name ?? "";
    return roastery.description
      ? { value: name, label: name, detail: roastery.description }
      : { value: name, label: name };
  }),
);

import { publicRequest } from "@/shared/api";
import type { ComboboxOption, ComboboxSearch } from "@/shared/ui";

/**
 * A combobox search over a public `?name=` read (search-coffee-facet
 * design.md D1; add-filter-controls Open 16): run from the browser while
 * typing, through `publicRequest` with the combobox's abort signal and no
 * credential header. A non-2xx status throws; the combobox shows its
 * "Results could not be loaded" row.
 */
export function searchByName<T>(
  path: string,
  toOptions: (rows: T[]) => ComboboxOption[],
): ComboboxSearch {
  return async (term, signal) => {
    const response = await publicRequest(`${path}?name=${encodeURIComponent(term)}`, { signal });
    if (!response.ok) {
      throw new Error(`${path} request failed`);
    }
    const payload: { data?: T[] } = await response.json();
    return toOptions(payload.data ?? []);
  };
}

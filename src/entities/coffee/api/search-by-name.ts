import { publicRequest, type ApiResult } from "@/shared/api";
import type { ComboboxOption, ComboboxSearch } from "@/shared/ui";

/**
 * A combobox search over a public `?name=` read (search-coffee-facet
 * design.md D1; add-filter-controls Open 16): run from the browser while
 * typing, through `publicRequest` with the combobox's abort signal and no
 * credential header. The read reports the shared result; a failure
 * rejects the search, so the combobox shows its "Results could not be
 * loaded" row (unify-api-result-shape design.md D3).
 */
export function searchByName<T>(
  path: string,
  toOptions: (rows: T[]) => ComboboxOption[],
): ComboboxSearch {
  return async (term, signal) => {
    const result = await readByName<T>(path, term, signal);
    if (!result.ok) {
      throw new Error(`${path} request failed`);
    }
    return toOptions(result.data);
  };
}

/** The rows of one `?name=` read. */
async function readByName<T>(
  path: string,
  term: string,
  signal: AbortSignal,
): Promise<ApiResult<T[]>> {
  try {
    const response = await publicRequest(`${path}?name=${encodeURIComponent(term)}`, { signal });
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: { data?: T[] } = await response.json();
    return { ok: true, data: payload.data ?? [] };
  } catch {
    return { ok: false, kind: "error" };
  }
}

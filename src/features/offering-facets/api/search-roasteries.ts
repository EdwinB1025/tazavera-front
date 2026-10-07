import type { RoasterySummary } from "@/shared/api";
import type { ComboboxOption, ComboboxSearch } from "@/shared/ui";

/**
 * Roastery search of the Roastery combobox (design.md D1, D7): run from the
 * browser while typing (Open 16), against `NEXT_PUBLIC_API_URL` with the
 * combobox's abort signal and no credential header. A non-2xx status throws;
 * the combobox shows its "Results could not be loaded" row.
 */
export const searchRoasteries: ComboboxSearch = async (term, signal) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/roasteries?name=${encodeURIComponent(term)}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error("roasteries request failed");
  }
  const payload: { data?: RoasterySummary[] } = await response.json();
  return (payload.data ?? []).map((roastery): ComboboxOption => {
    const name = roastery.name ?? "";
    return roastery.description
      ? { value: name, label: name, detail: roastery.description }
      : { value: name, label: name };
  });
};

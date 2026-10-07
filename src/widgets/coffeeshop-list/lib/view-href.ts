/**
 * The address of the directory with view keys changed, every other key — the
 * page included — kept in place (add-coffeeshop-directory design.md D13).
 */
export function viewHref(
  pathname: string,
  current: URLSearchParams,
  changes: Record<string, string | undefined>,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return query === "" ? pathname : `${pathname}?${query}`;
}

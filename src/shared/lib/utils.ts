/**
 * Class-name joiner (the shadcn `utils` alias target, design.md D6).
 * Dependency-free: the approved dependency set covers next-intl and the
 * Radix packages only.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

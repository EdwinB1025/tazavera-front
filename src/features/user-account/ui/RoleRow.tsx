import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───

export type RoleRowProps = {
  label: string;
  /** `data.role` of the session user, shown as the API returns it. */
  role: string;
};

/**
 * The Profile section's read-only role (spec "Profile settings"; design.md
 * D9 and D10): a `dl` with the label as `dt` above the API value as `dd`.
 */
export function RoleRow({ label, role }: RoleRowProps): ReactNode {
  return (
    <dl className="flex flex-col gap-1">
      <dt className="type-label">{label}</dt>
      <dd className="type-body">{role}</dd>
    </dl>
  );
}

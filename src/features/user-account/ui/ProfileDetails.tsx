import type { ReactNode } from "react";
import type { SessionUser } from "@/shared/api";
import { LabelValueRow } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ProfileDetailsTexts = {
  nameLabel: string;
  surnameLabel: string;
  emailLabel: string;
  roleLabel: string;
};

export type ProfileDetailsProps = {
  user: SessionUser;
  texts: ProfileDetailsTexts;
};

/** The rows in order, each with its label key (design.md D2). */
const ROWS: ReadonlyArray<[keyof SessionUser, keyof ProfileDetailsTexts]> = [
  ["name", "nameLabel"],
  ["surname", "surnameLabel"],
  ["email", "emailLabel"],
  ["role", "roleLabel"],
];

/**
 * The read-only Profile section (spec "Profile settings"; design.md D2): one
 * `dl` with one label/value row per session value that is neither `null` nor
 * absent, each as the API returns it.
 */
export function ProfileDetails({ user, texts }: ProfileDetailsProps): ReactNode {
  return (
    <dl className="grid gap-y-3">
      {ROWS.flatMap(([key, labelKey]) => {
        const value = user[key];
        return value == null
          ? []
          : [<LabelValueRow key={key} label={texts[labelKey]} value={String(value)} />];
      })}
    </dl>
  );
}

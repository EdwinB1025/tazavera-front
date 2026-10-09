import type { ReactNode } from "react";
import type { SessionUser } from "@/shared/api";
import { LabelValueRow } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ProfileDetailsTexts = {
  nameLabel: string;
  surnameLabel: string;
  emailLabel: string;
  roleLabel: string;
  emailVerificationLabel: string;
  emailVerified: string;
  emailNotVerified: string;
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

/** The email verification row, as text: none when the field is absent (add-email-verification-status design.md D1). */
function verificationRow(user: SessionUser, texts: ProfileDetailsTexts): ReactNode[] {
  if (user.emailVerifiedAt === undefined) return [];
  const value = user.emailVerifiedAt === null ? texts.emailNotVerified : texts.emailVerified;
  return [
    <LabelValueRow key="emailVerifiedAt" label={texts.emailVerificationLabel} value={value} />,
  ];
}

/**
 * The read-only Profile section (spec "Profile settings"; design.md D2): one
 * `dl` with one label/value row per session value that is neither `null` nor
 * absent, each as the API returns it, and the email verification state right
 * after the email row.
 */
export function ProfileDetails({ user, texts }: ProfileDetailsProps): ReactNode {
  return (
    <dl className="grid gap-y-3">
      {ROWS.flatMap(([key, labelKey]) => {
        const value = user[key];
        const row =
          value == null
            ? []
            : [<LabelValueRow key={key} label={texts[labelKey]} value={String(value)} />];
        return key === "email" ? [...row, ...verificationRow(user, texts)] : row;
      })}
    </dl>
  );
}

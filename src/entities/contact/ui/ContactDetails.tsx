import type { ReactNode } from "react";
import type { Contact } from "@/shared/api";
import { LabelValueRow, LINK_CLASSES } from "@/shared/ui";
import type { ContactFieldKey, ContactTexts } from "../model/types";

// ─── UI-specific types (declared before the component) ───

export type ContactDetailsProps = {
  contact: Contact;
  texts: ContactTexts;
};

/** The rows in field order, each with its label key (design.md D1). */
const ROWS: ReadonlyArray<[ContactFieldKey, keyof ContactTexts]> = [
  ["address", "contactAddressLabel"],
  ["postalCode", "contactPostalCodeLabel"],
  ["city", "contactCityLabel"],
  ["country", "contactCountryLabel"],
  ["phone", "contactPhoneLabel"],
  ["email", "contactEmailLabel"],
  ["web", "contactWebLabel"],
  ["social", "contactSocialLabel"],
];

/** Only an `http(s)` address becomes a link (design.md D1). */
function isWebLink(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

/**
 * The contact's read-only list (spec "Contact details"; design.md D1): one
 * `dl` with one label/value row per value that is neither `null` nor absent,
 * in field order, each value as the API returns it. `web` is a same-tab link
 * only for `http://` and `https://`. With no value at all it renders nothing.
 */
export function ContactDetails({ contact, texts }: ContactDetailsProps): ReactNode {
  const rows = ROWS.flatMap(([key, labelKey]) => {
    const value = contact[key];
    return value == null ? [] : [{ key, label: texts[labelKey], value }];
  });
  if (rows.length === 0) return null;

  return (
    <dl className="grid gap-y-3">
      {rows.map(({ key, label, value }) => (
        <LabelValueRow
          key={key}
          label={label}
          value={
            <span className="break-words">
              {key === "web" && isWebLink(value) ? (
                <a href={value} className={LINK_CLASSES}>
                  {value}
                </a>
              ) : (
                value
              )}
            </span>
          }
        />
      ))}
    </dl>
  );
}

import type { ReactNode } from "react";
import { Field, Input } from "@/shared/ui";
import type {
  ContactFieldErrors,
  ContactFieldKey,
  ContactFieldValues,
  ContactTexts,
} from "../model/types";

// ─── UI-specific types (declared before the component) ───

export type ContactFieldsProps = {
  values: ContactFieldValues;
  errors: ContactFieldErrors;
  onChange: (key: ContactFieldKey, value: string) => void;
  texts: ContactTexts;
  disabled?: boolean;
  /** `paired`: Postal code + City, Phone + Email, Web + Social share a row from `md` (add-coffeeshop-location D12). */
  layout?: "stacked" | "paired";
};

type FieldSpec = {
  key: ContactFieldKey;
  label: keyof ContactTexts;
  type: "text" | "tel" | "email" | "url";
  autoComplete: string;
  maxLength: number;
  required: boolean;
};

/** design.md D1: the fields in order; the maximum lengths are the contract's. */
const FIELDS: readonly FieldSpec[] = [
  { key: "address", label: "contactAddressLabel", type: "text", autoComplete: "street-address", maxLength: 255, required: true },
  { key: "postalCode", label: "contactPostalCodeLabel", type: "text", autoComplete: "postal-code", maxLength: 12, required: false },
  { key: "city", label: "contactCityLabel", type: "text", autoComplete: "address-level2", maxLength: 90, required: true },
  { key: "country", label: "contactCountryLabel", type: "text", autoComplete: "country-name", maxLength: 60, required: false },
  { key: "phone", label: "contactPhoneLabel", type: "tel", autoComplete: "tel", maxLength: 25, required: false },
  { key: "email", label: "contactEmailLabel", type: "email", autoComplete: "email", maxLength: 255, required: false },
  { key: "web", label: "contactWebLabel", type: "url", autoComplete: "url", maxLength: 255, required: false },
  { key: "social", label: "contactSocialLabel", type: "text", autoComplete: "off", maxLength: 255, required: false },
];

/** add-coffeeshop-location D12: the fields that share a row in the paired layout. */
const PAIRED_ROWS: readonly (readonly ContactFieldKey[])[] = [
  ["address"],
  ["postalCode", "city"],
  ["country"],
  ["phone", "email"],
  ["web", "social"],
];

const PAIRED_ROW_CLASSES = "grid gap-6 md:grid-cols-2";

/**
 * The contact field group (spec "Contact details form"; design.md D1): the
 * eight fields as a fragment, so the consuming form's stack spaces them. It
 * holds no state and sends nothing: the consumer owns the values, the checks
 * and the request.
 */
export function ContactFields({
  values,
  errors,
  onChange,
  texts,
  disabled,
  layout = "stacked",
}: ContactFieldsProps): ReactNode {
  const renderField = (field: FieldSpec) => (
    <Field
      key={field.key}
      label={texts[field.label]}
      error={errors[field.key]}
      required={field.required}
    >
      <Input
        name={field.key}
        type={field.type}
        autoComplete={field.autoComplete}
        maxLength={field.maxLength}
        value={values[field.key]}
        disabled={disabled}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    </Field>
  );

  if (layout === "paired") {
    return (
      <>
        {PAIRED_ROWS.map((keys) => {
          const fields = FIELDS.filter((field) => keys.includes(field.key));
          return fields.length === 1 ? (
            renderField(fields[0])
          ) : (
            <div key={keys.join("-")} className={PAIRED_ROW_CLASSES}>
              {fields.map(renderField)}
            </div>
          );
        })}
      </>
    );
  }

  return <>{FIELDS.map(renderField)}</>;
}

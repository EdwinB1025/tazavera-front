import type { ReactNode } from "react";
import { Field, Input } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type BusinessNameFieldProps = {
  label: string;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
};

/** The API's maximum for `businessName` (`registerAUser`, `updateAUser`). */
const BUSINESS_NAME_MAX_LENGTH = 150;

/**
 * The coffee shop's required Business name field, shared by the registration
 * and profile forms (spec "Coffee shop business name";
 * add-coffeeshop-business-name design.md D1).
 */
export function BusinessNameField({
  label,
  value,
  error,
  onChange,
}: BusinessNameFieldProps): ReactNode {
  return (
    <Field label={label} error={error} required>
      <Input
        name="businessName"
        type="text"
        autoComplete="organization"
        maxLength={BUSINESS_NAME_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

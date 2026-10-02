/**
 * Public API of the `shared/ui` segment (Feature-Sliced Design).
 *
 * Exports the action controls (Button, Link) and the icon module so every
 * consumer imports through this entry point. Importing a slice through its
 * public API keeps the internal structure free to change.
 */
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";
export { Link } from "./Link";
export type { LinkProps } from "./Link";
export { Field } from "./Field";
export type { FieldProps } from "./Field";
export { Input } from "./Input";
export type { InputProps, InputVariant } from "./Input";
export { PasswordInput } from "./PasswordInput";
export type {
  PasswordInputProps,
  PasswordInputVariant,
} from "./PasswordInput";
export { Select } from "./Select";
export type { SelectProps, SelectVariant } from "./Select";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
export { Checkbox } from "./Checkbox";
export type { CheckboxProps, CheckboxVariant } from "./Checkbox";
export { RadioGroup } from "./RadioGroup";
export type {
  RadioGroupProps,
  RadioGroupVariant,
  RadioOption,
} from "./RadioGroup";
export { Loader2, ArrowLeft, type LucideIcon } from "./icons";

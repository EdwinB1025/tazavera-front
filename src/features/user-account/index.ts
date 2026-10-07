/**
 * Public API of the `user-account` feature slice (Feature-Sliced Design).
 *
 * The registration and account pieces of design.md D1. The slice imports no
 * other feature: the page slices inject the session and the auth actions as
 * props.
 */
export { RegisterForm } from "./ui/RegisterForm";
export type {
  RegisterFormProps,
  RegisterFormTexts,
  RegisterRole,
} from "./ui/RegisterForm";
export { RegisterSuccessPanel } from "./ui/RegisterSuccessPanel";
export type {
  RegisterSuccessPanelProps,
  RegisterSuccessPanelTexts,
} from "./ui/RegisterSuccessPanel";
export { AccountSection } from "./ui/AccountSection";
export type { AccountSectionProps } from "./ui/AccountSection";
export { ExternalLink } from "./ui/ExternalLink";
export type { ExternalLinkProps } from "./ui/ExternalLink";
export { DangerZone } from "./ui/DangerZone";
export type { DangerZoneProps, DangerZoneTexts } from "./ui/DangerZone";
export { RoleRow } from "./ui/RoleRow";
export type { RoleRowProps } from "./ui/RoleRow";
export { ProfileForm } from "./ui/ProfileForm";
export type { ProfileFormProps, ProfileFormTexts } from "./ui/ProfileForm";
export { PasswordForm } from "./ui/PasswordForm";
export type { PasswordFormProps, PasswordFormTexts } from "./ui/PasswordForm";

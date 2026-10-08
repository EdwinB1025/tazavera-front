/**
 * Public API of the `user-account` feature slice (Feature-Sliced Design).
 *
 * The registration and account pieces of design.md D1. The slice imports no
 * other feature: the page slices inject the session and the auth actions as
 * props.
 */
export { RegisterForm } from "./ui/RegisterForm";
export type { RegisterFormTexts, RegisterRole } from "./ui/RegisterForm";
export { AccountSection } from "./ui/AccountSection";
export { ExternalLink } from "./ui/ExternalLink";
export { DangerZone } from "./ui/DangerZone";
export type { DangerZoneTexts } from "./ui/DangerZone";
export { ProfileForm } from "./ui/ProfileForm";
export type { ProfileFormTexts } from "./ui/ProfileForm";
export { PasswordForm } from "./ui/PasswordForm";
export type { PasswordFormTexts } from "./ui/PasswordForm";
export { ContactSection } from "./ui/ContactSection";
export type { ContactSectionTexts } from "./ui/ContactSection";

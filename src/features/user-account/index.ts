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
export { LoadingStatus } from "./ui/LoadingStatus";
export type { LoadingStatusProps } from "./ui/LoadingStatus";
export { FormStatus } from "./ui/FormStatus";
export type { FormStatusKind, FormStatusProps } from "./ui/FormStatus";

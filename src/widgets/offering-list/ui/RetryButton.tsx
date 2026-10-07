// The retry action lives in the shared segment (add-offering-catalog
// design.md D4); the widget keeps re-exporting it for its consumers.
export { RetryButton } from "@/shared/ui";
export type { RetryButtonProps } from "@/shared/ui";

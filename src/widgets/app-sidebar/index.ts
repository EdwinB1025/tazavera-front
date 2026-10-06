/**
 * Public API of the `app-sidebar` widget (Feature-Sliced Design).
 *
 * Exposes the sidebar frame, the shell's default sidebar and the provider
 * they read, so consumers import through this entry point only:
 * `@/widgets/app-sidebar`.
 */
export { AppSidebar } from "./ui/AppSidebar";
export type { AppSidebarProps } from "./ui/AppSidebar";
export { DefaultSidebar } from "./ui/DefaultSidebar";
export { AppSidebarProvider } from "./ui/AppSidebarContext";
export type {
  AppSidebarContextValue,
  AppSidebarProviderProps,
} from "./ui/AppSidebarContext";

/**
 * Public API of the `app-sidebar` widget (Feature-Sliced Design).
 *
 * Exposes the sidebar frame, the shell's default sidebar, the header's
 * re-open control and the provider they read, so consumers import through this entry point only:
 * `@/widgets/app-sidebar`.
 */
export { AppSidebar } from "./ui/AppSidebar";
export { DefaultSidebar } from "./ui/DefaultSidebar";
export { SidebarReopenControl } from "./ui/SidebarReopenControl";
export { AppSidebarProvider } from "./ui/AppSidebarContext";

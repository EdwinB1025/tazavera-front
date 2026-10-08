"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/lib/hooks";
import { Button } from "./Button";
import { PanelLeft } from "@/shared/ui/icons";
import type { LucideIcon } from "@/shared/ui/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./Sheet";

/**
 * Sidebar, pulled from the shadcn registry (Radix base) and rewired to the
 * project (design.md D6): semantic tokens and radius tokens only, the
 * project's own Button and icon entry, no generated control duplicate and no
 * literal interface text. From `md` it is a collapsible column — collapsing
 * it returns the main area to a single column (spec: "Collapsible on a
 * medium or larger viewport") — and below `md` it opens as the full-screen
 * Sheet overlay (design.md D11).
 */

// ─── Sidebar context ───

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobile: boolean;
  /**
   * Whether a `Sidebar` is mounted under the provider (design.md D3): the
   * shell reads it to know whether the route in view has a sidebar at all.
   */
  present: boolean;
  /**
   * Called by `Sidebar` on mount; the returned function decrements the
   * mounted-sidebar count again (design.md D3).
   */
  register: () => () => void;
};

/**
 * The `id` of the desktop column and of the sheet content (only one renders
 * at a time), for the `aria-controls` of the controls outside the sidebar
 * (design.md D3).
 */
const SIDEBAR_ID = "app-sidebar";

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

function SidebarProvider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  // Two states (design.md D3): expanded on arrival from `md`, closed on
  // arrival below it.
  const [openDesktop, setOpenDesktop] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const isMobile = useIsMobile();

  const open = isMobile ? openMobile : openDesktop;
  const setOpen = isMobile ? setOpenMobile : setOpenDesktop;

  const toggleSidebar = React.useCallback(() => {
    setOpen((value) => !value);
  }, [setOpen]);

  const register = React.useCallback(() => {
    setCount((value) => value + 1);
    return () => setCount((value) => value - 1);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
        isMobile,
        present: count > 0,
        register,
      }}
    >
      <div
        data-slot="sidebar-provider"
        className="flex min-h-full w-full flex-col"
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ─── Layout parts ───

const SIDEBAR_CLASSES = [
  "hidden",
  "md:flex",
  "h-full",
  "w-64",
  "shrink-0",
  "flex-col",
  "bg-nav-surface-dark",
  "text-nav-text-dark",
  "variant-inverse",
].join(" ");

function Sidebar({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"aside"> & { label?: string }) {
  const { open, setOpen, isMobile, register } = useSidebar();

  // The control that opened the sheet sits outside it, so the sheet returns
  // focus to whatever held it on opening (design.md D6: dismissing returns
  // focus to the re-open control).
  const returnFocusRef = React.useRef<HTMLElement | null>(null);

  // Presence (design.md D3): registered whatever this renders below.
  React.useEffect(() => register(), [register]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id={SIDEBAR_ID}
          side="left"
          className="w-full p-0"
          onOpenAutoFocus={() => {
            returnFocusRef.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
            returnFocusRef.current = null;
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="variant-inverse flex h-full w-full flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <aside
      id={SIDEBAR_ID}
      aria-label={label}
      data-slot="sidebar"
      data-state="expanded"
      className={cn(SIDEBAR_CLASSES, className)}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { "aria-label"?: string }) {
  const { open, toggleSidebar } = useSidebar();
  return (
    <Button
      variant="nav-button"
      size="sm"
      icon={PanelLeft}
      aria-expanded={open}
      onClick={toggleSidebar}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("bg-surface-page flex-1", className)}
      {...props}
    />
  );
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex items-center gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-separator"
      className={cn("mx-2 h-px bg-border-inverse", className)}
      {...props}
    />
  );
}

// ─── Navigation parts ──

function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("type-meta px-3 py-1", className)}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  );
}

const MENU_BUTTON_CLASSES = [
  "type-sidebar-item",
  "flex",
  "w-full",
  "items-center",
  "gap-2",
  "rounded-field",
  "px-3",
  "py-2",
  "hover:bg-nav-hover",
  "hover:text-nav-text-hover",
  "focus-visible:focus-ring",
  "data-[active=true]:bg-nav-current-dark",
].join(" ");

function SidebarMenuButton({
  className,
  children,
  icon: Icon,
  isActive = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: LucideIcon;
  isActive?: boolean;
  /** Renders the child link with the entry look (design.md D7). */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(MENU_BUTTON_CLASSES, className)}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  );
}

export {
  SIDEBAR_ID,
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};

"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/lib/hooks";
import { Button } from "@/shared/ui";
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
};

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
  const [open, setOpen] = React.useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = React.useCallback(() => {
    setOpen((value) => !value);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar, isMobile }}>
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
].join(" ");

function Sidebar({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  const { open, setOpen, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <div
      data-slot="sidebar"
      data-state="expanded"
      className={cn(SIDEBAR_CLASSES, className)}
      {...props}
    >
      {children}
    </div>
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
  "focus-visible:focus-ring",
  "data-[active=true]:bg-nav-current-dark",
].join(" ");

function SidebarMenuButton({
  className,
  children,
  icon: Icon,
  isActive = false,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: LucideIcon;
  isActive?: boolean;
}) {
  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(MENU_BUTTON_CLASSES, className)}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </button>
  );
}

export {
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

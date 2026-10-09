"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button";
import type { LucideIcon } from "@/shared/ui/icons";
import type { LinkProps } from "./Link";

// ─── UI-specific types (declared before the component) ───

export type RouteButtonProps = {
  /** An in-application route, with the same type as the shared `Link`'s. */
  href: LinkProps["href"];
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A leading icon, passed to `Button`. */
  icon?: LucideIcon;
  children: ReactNode;
};

/**
 * An action button that opens an in-application route
 * (fix-production-aut-findings design.md D2): the shared `Button`, whose
 * activation pushes `href` through the app router — the project's button
 * navigation (`use-router.md`). Card actions use it in place of links.
 */
export function RouteButton({
  href,
  variant,
  size,
  icon,
  children,
}: RouteButtonProps): ReactNode {
  const router = useRouter();
  return (
    <Button variant={variant} size={size} icon={icon} onClick={() => router.push(href)}>
      {children}
    </Button>
  );
}

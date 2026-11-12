"use client";

import type { ReactNode } from "react";
import { useSession } from "@/features/auth";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type HomeRegisterButtonProps = {
  locale: string;
  label: string;
};

/**
 * The entry page's "Register" action below `lg` (add-register-landing D5;
 * spec "Entry page Register button"), the last action of the hero's actions
 * row. It renders only for an anonymous session, and renders its own
 * `lg:hidden` wrapper so that no empty item stays in the row while the
 * session resolves or once signed in.
 */
export function HomeRegisterButton({
  locale,
  label,
}: HomeRegisterButtonProps): ReactNode {
  const session = useSession();
  if (session.state !== "anonymous") return null;
  return (
    <div className="lg:hidden">
      <RouteButton variant="action-1" size="base" href={`/${locale}/join`}>
        {label}
      </RouteButton>
    </div>
  );
}

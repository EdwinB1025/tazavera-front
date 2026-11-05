import type { ReactNode } from "react";
import { Card, CardContent, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type RegisterOptionProps = {
  title: string;
  text: string;
  actionLabel: string;
  /** An in-application route, as `RouteButton` takes it. */
  href: `/${string}`;
};

/**
 * One option of the registration landing (design.md D3; spec "Registration
 * landing"): its title as a heading, a short text and one action button that
 * opens its registration route. One component for both options.
 */
export function RegisterOption({
  title,
  text,
  actionLabel,
  href,
}: RegisterOptionProps): ReactNode {
  return (
    <Card layout="stacked">
      <CardContent>
        <div className="flex h-full flex-col gap-4">
          <h2 className="type-card-heading">{title}</h2>
          <p className="type-body">{text}</p>
          <div className="mt-auto pt-2">
            <RouteButton variant="action-1" size="base" href={href}>
              {actionLabel}
            </RouteButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

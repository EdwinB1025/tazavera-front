import { useId, type ReactNode } from "react";
import { Card, CardContent } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AccountSectionProps = {
  heading: string;
  description?: string;
  children: ReactNode;
};

/**
 * One section of the account page (design.md D9 and D10): a region labelled
 * by its `h2`, holding one card with the header — the heading and an
 * optional description — 1.5rem above the content.
 */
export function AccountSection({
  heading,
  description,
  children,
}: AccountSectionProps): ReactNode {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id={headingId} className="type-subheading">
              {heading}
            </h2>
            {description && <p className="type-body">{description}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

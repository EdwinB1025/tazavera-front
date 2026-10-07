import { useId, type ReactNode } from "react";
import { Card, CardAside, CardContent } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AccountSectionProps = {
  heading: string;
  /** The heading's id, when the content needs it to name a form (design.md D9). */
  headingId?: string;
  description?: string;
  children: ReactNode;
};

/**
 * One section of the account page (design.md D9 and D10): a region labelled
 * by its `h2`, holding one section card whose header band holds the heading
 * and an optional description, above the content (adopt-section-card-in-account
 * D1).
 */
export function AccountSection({
  heading,
  headingId: headingIdProp,
  description,
  children,
}: AccountSectionProps): ReactNode {
  const generatedId = useId();
  const headingId = headingIdProp ?? generatedId;
  return (
    <section aria-labelledby={headingId}>
      <Card variant="section">
        <CardAside>
          <h2 id={headingId} className="type-subheading">
            {heading}
          </h2>
          {description && <p className="type-body">{description}</p>}
        </CardAside>
        <CardContent className="flex flex-col gap-6">{children}</CardContent>
      </Card>
    </section>
  );
}

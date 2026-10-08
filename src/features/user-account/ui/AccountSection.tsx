import { useId, type ReactNode, type Ref } from "react";
import { Card, CardAside, CardContent } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AccountSectionProps = {
  heading: string;
  /** The heading's id, when the content needs it to name a form (design.md D9). */
  headingId?: string;
  description?: string;
  /**
   * Given when the content moves focus to the heading (add-user-contact D3):
   * the `h2` receives the ref and `tabIndex={-1}`.
   */
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
};

/**
 * One section of the account page (design.md D9 and D10): a region labelled
 * by its `h2`, holding one section card whose header band holds the heading
 * and an optional description, above the content (adopt-section-card-in-account
 * D1), whose width is capped from `md` (widen-account-cards D2).
 */
export function AccountSection({
  heading,
  headingId: headingIdProp,
  description,
  headingRef,
  children,
}: AccountSectionProps): ReactNode {
  const generatedId = useId();
  const headingId = headingIdProp ?? generatedId;
  return (
    <section aria-labelledby={headingId}>
      <Card variant="section">
        <CardAside>
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={headingRef ? -1 : undefined}
            className="type-subheading"
          >
            {heading}
          </h2>
          {description && <p className="type-body">{description}</p>}
        </CardAside>
        <CardContent>
          <div className="flex w-full flex-col gap-6 md:max-w-160">
            {children}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

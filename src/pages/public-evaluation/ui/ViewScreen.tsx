import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { EvaluationSheetView, EvaluationSheetViewSkeleton } from "@/widgets/evaluation-sheet";
import { Link } from "@/shared/ui";
import { viewTexts } from "./texts";

// ─── UI-specific types (declared before the component) ───

export type ViewScreenProps = {
  locale: string;
  ulid: string;
};

/** The route's document metadata: the `public-evaluations` description (design.md D3). */
export function viewMetadata(locale: string): Metadata {
  return { description: getMessages("public-evaluations", locale).metaDescription };
}

/**
 * The read-only evaluation view screen (design.md D5; summary §5.3): the two
 * page sections of the view in one `Suspense` boundary, with the back link to
 * the plain list (no query) in section 1 in every state.
 */
export function ViewScreen({ locale, ulid }: ViewScreenProps): ReactNode {
  const own = getMessages("public-evaluations", locale);
  const back = (
    <Link href={`/${locale}/evaluations`} variant="back">
      {own.backLabel}
    </Link>
  );
  return (
    <div className="flex-1">
      <Suspense fallback={<EvaluationSheetViewSkeleton back={back} />}>
        <EvaluationSheetView locale={locale} ulid={ulid} back={back} texts={viewTexts(locale)} />
      </Suspense>
    </div>
  );
}

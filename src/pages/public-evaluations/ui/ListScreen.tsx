import { Suspense } from "react";
import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import {
  EvaluationsToolbar,
  appliedEvaluationFilters,
  parseEvaluationFilters,
  publicEvaluationsQuery,
} from "@/features/evaluation-facets";
import { PublicEvaluationRowCard } from "@/widgets/evaluation-row";
import { EvaluationListSkeleton, PublicEvaluationList } from "@/widgets/public-evaluation-list";
import type { PublicEvaluationRow } from "@/widgets/public-evaluation-list";
import { PageSection } from "@/shared/ui";
import { appliedTexts, listTexts, toolbarTexts } from "./texts";

// ─── UI-specific types (declared before the component) ───

export type ListScreenProps = {
  locale: string;
  /** The route's raw search params: the facet values, sort and page. */
  searchParams: QueryRecord;
};

// One section: the header column and the list, 1.5rem apart at every width
// (tighten-public-evaluations-spacing, as R64).
const SECTION_CONTAINER_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
// The heading block and the toolbar, 2rem apart (summary §5.2).
const HEADER_CONTAINER_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// The eyebrow and the heading, 0.5rem apart.
const HEADING_BLOCK_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/** The page of the route's `page` query; the first page when absent or invalid. */
function pageFrom(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * The public evaluations list screen (design.md D4, D5; summary §5.2): the
 * heading block and the toolbar, then the list in its own `Suspense`
 * boundary, in one section on the page surface. Thin: texts and the parsed
 * query are resolved here and passed down as props, and the row card is
 * composed here and passed to the list as its row slot (FSD same-layer rule).
 */
export function ListScreen({ locale, searchParams }: ListScreenProps): ReactNode {
  const own = getMessages("public-evaluations", locale);
  const values = parseEvaluationFilters(searchParams, "public");
  const applied = appliedEvaluationFilters(values, appliedTexts(locale));
  const query = publicEvaluationsQuery(values, pageFrom(searchParams.page));
  const texts = listTexts(locale);
  const renderRow = (row: PublicEvaluationRow): ReactNode => (
    <PublicEvaluationRowCard
      evaluation={row.evaluation}
      offering={row.offering}
      locale={locale}
      texts={texts}
    />
  );

  return (
    <div className="flex-1">
      <PageSection surface="page" containerClassName={SECTION_CONTAINER_CLASSES}>
        <div className={HEADER_CONTAINER_CLASSES}>
          <div className={HEADING_BLOCK_CLASSES}>
            <p className="type-eyebrow-strong">{own.listEyebrow}</p>
            <h1 className="type-heading">{own.listHeading}</h1>
          </div>
          <EvaluationsToolbar count={applied.length} sort={values.sort} texts={toolbarTexts(locale)} />
        </div>
        <Suspense key={JSON.stringify(query)} fallback={<EvaluationListSkeleton />}>
          <PublicEvaluationList
            locale={locale}
            query={query}
            searchParams={searchParams}
            filtered={applied.length > 0}
            texts={texts}
            renderRow={renderRow}
          />
        </Suspense>
      </PageSection>
    </div>
  );
}

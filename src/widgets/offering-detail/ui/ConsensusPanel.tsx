import type { ReactNode } from "react";
import type {
  OfferingDetail,
  OfferingTaxonomyNode,
  TaxonomyNode,
} from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { buildDescriptorRows } from "@/entities/taxonomy";
import {
  Badge,
  BeanScale,
  Card,
  CardContent,
  DescriptorChipGroup,
  LabelValueRow,
} from "@/shared/ui";
import { concordanceBand } from "../lib/concordance";
import type { ConcordanceBand } from "../lib/concordance";

// ─── UI-specific types (declared before the component) ───

export type ConsensusPanelTexts = {
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
  detailStatusHeading: string;
  fieldEvaluationCount: string;
  fieldDefectiveCount: string;
  fieldConcordanceAffective: string;
  fieldConcordanceDescriptive: string;
  concordanceLow: string;
  concordanceModerate: string;
  concordanceHigh: string;
  concordanceExcellent: string;
  detailAttributesHeading: string;
  attrFragrance: string;
  attrAroma: string;
  attrFlavor: string;
  attrAftertaste: string;
  attrAcidity: string;
  attrSweetness: string;
  attrMouthfeel: string;
  attrOverall: string;
  /** `{value}/9`, from the shared `scales` area. */
  beanValue: string;
  /** `{value} de 9` / `{value} of 9`, from the shared `scales` area. */
  beanValueLabel: string;
  detailMainTastesHeading: string;
  detailDefectsHeading: string;
  detailTasteEmpty: string;
};

export type ConsensusPanelProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: ConsensusPanelTexts;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

// The score card above the card grid, 1.5rem apart.
const PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The card grid: one column below `lg`, two equal columns from `lg`, with a
// 1.5rem gap; grid items stretch, so the cards of a row share one height.
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(
  " ",
);

// Score, `/100` and rating badge on one row, as on the offering card.
const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(
  " ",
);

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// The label/value rows (design.md D5's grid).
const LIST_CLASSES = ["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"].join(" ");

// A card spanning both grid columns from `lg`.
const WIDE_CARD_CLASSES = "lg:col-span-2";

// The eight attribute scales, 1.5rem apart.
const SCALES_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The SCA attributes in the settled order, with the label key of each.
const ATTRIBUTES = [
  ["fragranceAffectiveAvg", "attrFragrance"],
  ["aromaAffectiveAvg", "attrAroma"],
  ["flavorAffectiveAvg", "attrFlavor"],
  ["aftertasteAffectiveAvg", "attrAftertaste"],
  ["acidityAffectiveAvg", "attrAcidity"],
  ["sweetnessAffectiveAvg", "attrSweetness"],
  ["mouthfeelAffectiveAvg", "attrMouthfeel"],
  ["overallAffectiveAvg", "attrOverall"],
] as const;

// A selection block: the card and its consensus legend beside it from `md`,
// 1.5rem apart, stacking 1rem apart below `md`; it spans both grid columns.
const SELECTION_BLOCK_CLASSES = [
  "flex",
  "flex-col",
  "gap-4",
  "md:flex-row",
  "md:gap-6",
  "lg:col-span-2",
].join(" ");

// The consensus legend: one meta line per identified note.
const LEGEND_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");

/** One line of a consensus legend: a note's name and its count. */
export type ConsensusLegendEntry = { label: string; count: number };

/** `ref` → `count` of every node of the offering's tree of one `type`, descendants included. */
function identifiedCounts(
  nodes: OfferingTaxonomyNode[],
  type: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  function visit(node: OfferingTaxonomyNode) {
    counts.set(node.ref ?? "", node.count ?? 0);
    for (const child of node.children ?? []) {
      visit(child as OfferingTaxonomyNode);
    }
  }
  for (const node of nodes) {
    if (node.type === type) {
      visit(node);
    }
  }
  return counts;
}

// A concordance value and its band word, 0.5rem apart, wrapping.
const CONCORDANCE_CLASSES = ["flex", "flex-wrap", "gap-2"].join(" ");

/**
 * The Consensus panel (add-offering-catalog design.md D12–D14; the spec's
 * "Consensus …" requirements): the score card for a verified offering, then
 * the card grid with the blocks in the settled order. Every text arrives as a
 * prop; the score and the bands never rest on colour alone.
 */
export function ConsensusPanel({
  offering,
  taxonomies,
  locale,
  texts,
}: ConsensusPanelProps): ReactNode {
  const total = offering.evaluationCount ?? 0;
  // One decimal in the route's locale: the settled "7,2 de 9" reading.
  const oneDecimal = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const tier =
    offering.verificationStatus === "verified"
      ? ratingTierFor(offering.cuppingAvg)
      : null;
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  const bandWords: Record<ConcordanceBand, string> = {
    low: texts.concordanceLow,
    moderate: texts.concordanceModerate,
    high: texts.concordanceHigh,
    excellent: texts.concordanceExcellent,
  };

  function concordance(value: string): ReactNode {
    return (
      <span className={CONCORDANCE_CLASSES}>
        <span>{value}</span>
        <span>{bandWords[concordanceBand(value)]}</span>
      </span>
    );
  }

  const statusRows: { label: string; value: ReactNode | undefined }[] = [
    { label: texts.fieldEvaluationCount, value: offering.evaluationCount },
    {
      label: texts.fieldDefectiveCount,
      value: offering.defectiveEvaluationCount,
    },
    {
      label: texts.fieldConcordanceAffective,
      value:
        offering.concordanceAffective != null
          ? concordance(offering.concordanceAffective)
          : undefined,
    },
    {
      label: texts.fieldConcordanceDescriptive,
      value:
        offering.concordanceDescriptive != null
          ? concordance(offering.concordanceDescriptive)
          : undefined,
    },
  ];

  // Main tastes and Defects (design.md D13): the identified notes of one
  // `type` as a read-only selection over the category's descriptor rows, and
  // the consensus legend beside the card, in card order.
  function selectionBlock(category: string, heading: string): ReactNode {
    const rows = buildDescriptorRows(taxonomies, category, locale);
    const counts = identifiedCounts(offering.sensoryTaxonomy ?? [], category);
    const legend: ConsensusLegendEntry[] = rows
      .flatMap((row) => row.options)
      .filter((option) => counts.has(option.value))
      .map((option) => ({
        label: option.label,
        count: counts.get(option.value) ?? 0,
      }));
    return (
      <div className={SELECTION_BLOCK_CLASSES}>
        <Card layout="stacked" className="flex-1">
          <CardContent className={CONTENT_CLASSES}>
            <h2 className="type-subheading">{heading}</h2>
            <DescriptorChipGroup
              readOnly
              legend={heading}
              rows={rows}
              value={[...counts.keys()]}
              emptyText={texts.detailTasteEmpty}
            />
          </CardContent>
        </Card>
        {legend.length > 0 ? (
          <ul className={LEGEND_CLASSES}>
            {legend.map((entry) => {
              const line = `${entry.label} ${entry.count}/${total}`;
              return (
                <li key={entry.label} className="type-meta">
                  {line}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div className={PANEL_CLASSES}>
      {tier !== null ? (
        <Card layout="stacked">
          <CardContent>
            <div className={SCORE_ROW_CLASSES}>
              <div className="type-score">{offering.cuppingAvg}</div>
              <div className="type-meta">{SCORE_SCALE}</div>
              <Badge variant={tier}>{tierWords[tier]}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className={GRID_CLASSES}>
        <div className={WIDE_CARD_CLASSES}>
          <Card layout="stacked">
            <CardContent className={CONTENT_CLASSES}>
              <h2 className="type-subheading">
                {texts.detailAttributesHeading}
              </h2>
              <div className={SCALES_CLASSES}>
                {ATTRIBUTES.map(([field, labelKey]) => {
                  const average = offering[field];
                  if (average == null) {
                    return null;
                  }
                  const value = Number(average);
                  const formatted = oneDecimal.format(value);
                  return (
                    <BeanScale
                      key={field}
                      readOnly
                      size="responsive"
                      label={texts[labelKey]}
                      value={value}
                      valueText={texts.beanValue.replace("{value}", formatted)}
                      valueLabel={texts.beanValueLabel.replace(
                        "{value}",
                        formatted,
                      )}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card layout="stacked">
          <CardContent className={CONTENT_CLASSES}>
            <h2 className="type-subheading">{texts.detailStatusHeading}</h2>
            <dl className={LIST_CLASSES}>
              {statusRows
                .filter((row) => row.value != null)
                .map((row) => (
                  <LabelValueRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                  />
                ))}
            </dl>
          </CardContent>
        </Card>
        {selectionBlock("main_tastes", texts.detailMainTastesHeading)}
        {selectionBlock("defects", texts.detailDefectsHeading)}
      </div>
    </div>
  );
}

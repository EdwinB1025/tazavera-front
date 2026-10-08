import { Fragment } from "react";
import type { ReactNode } from "react";
import type { TaxonomyNode } from "@/shared/api";
import { EVALUATION_GROUPS } from "@/entities/evaluation";
import type { DescriptorBlock as BlockDefinition, DescriptorBlockKey } from "@/entities/evaluation";
import { Checkbox } from "@/shared/ui";
import { withDescriptors, withFragranceNotEvaluated } from "../model/form-updates";
import type { EvaluationFormModel } from "../model/use-evaluation-form";
import { DescriptorBlock } from "./DescriptorBlock";
import { EvaluationGroupCard } from "./EvaluationGroupCard";
import type { EvaluationGroupTexts } from "./group-texts";
import { ScaleLegend } from "./ScaleLegend";
import type { ScaleLegendTexts } from "./ScaleLegend";

// ─── UI-specific types (declared before the component) ───

export type EvaluationGroupListTexts = {
  /** The option of design.md D9. */
  fragranceNotEvaluatedLabel: string;
  /** The 1–9 legend (design.md D16). */
  legend: ScaleLegendTexts;
  /** The legends of the four descriptor blocks. */
  blockLabels: Record<DescriptorBlockKey, string>;
  group: EvaluationGroupTexts;
};

export type EvaluationGroupListProps = {
  locale: string;
  /** The `GET /taxonomies` tree the descriptor blocks filter (design.md D7). */
  taxonomies: TaxonomyNode[];
  /** The form's state and actions (`useEvaluationForm`). */
  form: EvaluationFormModel;
  texts: EvaluationGroupListTexts;
};

// ─── Layout end states (design.md D14; the summary §9) ───
const GROUPS_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

/**
 * The eight group cards in CVA order (design.md D14, D15; spec "Evaluation
 * form"), the "Fragrance not evaluated" option at the top of the first
 * editable group (design.md D9), and the 1–9 legend right after the group
 * holding Main tastes (design.md D16).
 */
export function EvaluationGroupList({
  locale,
  taxonomies,
  form,
  texts,
}: EvaluationGroupListProps): ReactNode {
  const { model, readOnly, completeness, edit } = form;
  const { values, highlighted, openGroups, legendOpen } = model;
  // Each descriptor block, read-only or editable (design.md D7).
  const renderBlock = (block: BlockDefinition) =>
    readOnly ? (
      <DescriptorBlock
        legend={texts.blockLabels[block.key]}
        nodes={taxonomies}
        category={block.key}
        locale={locale}
        value={values.descriptors[block.selection]}
        readOnly
      />
    ) : (
      <DescriptorBlock
        legend={texts.blockLabels[block.key]}
        nodes={taxonomies}
        category={block.key}
        locale={locale}
        value={values.descriptors[block.selection]}
        onValueChange={(value) => edit(withDescriptors(block.selection, value))}
      />
    );
  const fragranceOption = readOnly ? undefined : (
    <Checkbox
      label={texts.fragranceNotEvaluatedLabel}
      checked={values.fragranceNotEvaluated}
      onChange={(event) => edit(withFragranceNotEvaluated(event.target.checked))}
    />
  );
  return (
    <div className={GROUPS_CLASSES}>
      {EVALUATION_GROUPS.map((group) => (
        <Fragment key={group.key}>
          <EvaluationGroupCard
            group={group}
            state={values}
            onChange={edit}
            texts={texts.group}
            complete={completeness[group.key]}
            readOnly={readOnly}
            highlighted={highlighted && completeness[group.key] === false}
            open={openGroups[group.key]}
            onOpenChange={(open) => form.setGroupOpen(group.key, open)}
            top={group.key === "fragranceAroma" ? fragranceOption : undefined}
            renderBlock={renderBlock}
          />
          {/* The legend follows the group holding Main tastes (design.md D16). */}
          {group.key === "flavorAftertaste" ? (
            <ScaleLegend texts={texts.legend} open={legendOpen} onOpenChange={form.setLegendOpen} />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

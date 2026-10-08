import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { BeanScale, Card, CardContent } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type AttributesCardTexts = {
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
};

export type AttributesCardProps = {
  offering: OfferingDetail;
  locale: string;
  texts: AttributesCardTexts;
};

// ─── Fixed pieces (no interface text) ───

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

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

/**
 * The SCA attributes card of the Consensus panel: one read-only bean scale
 * per attribute average present, in the settled order.
 */
export function AttributesCard({
  offering,
  locale,
  texts,
}: AttributesCardProps): ReactNode {
  // One decimal in the route's locale: the settled "7,2 de 9" reading.
  const oneDecimal = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (
    <Card layout="stacked">
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-subheading">{texts.detailAttributesHeading}</h2>
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
                valueLabel={texts.beanValueLabel.replace("{value}", formatted)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

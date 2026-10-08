import type { EvaluationSheetTexts } from "../ui/EvaluationSheet";

/**
 * The sheet's texts from the message areas the host resolved (design.md D3):
 * `public-evaluations`, `evaluations`, `scales` and `landing`. Pure, so both
 * hosts (the view and the offering detail's provisional tab) share one
 * mapping and the widget reads no catalog itself.
 */

type Catalog = Record<string, string>;

export type EvaluationSheetCatalogs = {
  publicEvaluations: Catalog;
  evaluations: Catalog;
  scales: Catalog;
  landing: Catalog;
};

export function evaluationSheetTexts({
  publicEvaluations: own,
  evaluations,
  scales,
  landing,
}: EvaluationSheetCatalogs): EvaluationSheetTexts {
  return {
    summaryHeading: own.summaryHeading,
    closedAtLabel: own.closedAtLabel,
    extractionMethodLabel: own.extractionMethodLabel,
    defectiveCupLabel: own.defectiveCupLabel,
    yes: own.yes,
    no: own.no,
    intensityHeading: own.intensityHeading,
    preferenceHeading: own.preferenceHeading,
    descriptorsHeading: own.descriptorsHeading,
    noDescriptors: own.noDescriptors,
    notesHeading: own.notesHeading,
    extrinsicsHeading: own.extrinsicsHeading,
    extrinsicLabels: {
      farming: own.extrinsicFarming,
      processing: own.extrinsicProcessing,
      trading: own.extrinsicTrading,
      certifications: own.extrinsicCertifications,
      generalObservation: own.extrinsicGeneralObservation,
    },
    extractionLabels: {
      espresso: evaluations.extractionEspresso,
      v60: evaluations.extractionV60,
      chemex: evaluations.extractionChemex,
      aeropress: evaluations.extractionAeropress,
      french_press: evaluations.extractionFrenchPress,
      moka: evaluations.extractionMoka,
      cold_brew: evaluations.extractionColdBrew,
      siphon: evaluations.extractionSiphon,
      kalita: evaluations.extractionKalita,
    },
    axisLabels: {
      fragrance: evaluations.axisFragrance,
      aroma: evaluations.axisAroma,
      flavor: evaluations.axisFlavor,
      aftertaste: evaluations.axisAftertaste,
      acidity: evaluations.axisAcidity,
      sweetness: evaluations.axisSweetness,
      mouthfeel: evaluations.axisMouthfeel,
      overall: evaluations.axisOverall,
    },
    blockLabels: {
      fragranceAroma: evaluations.groupFragranceAroma,
      flavorAftertaste: evaluations.groupFlavorAftertaste,
      mainTastes: evaluations.blockMainTastes,
      mouthfeel: evaluations.groupMouthfeel,
      defects: evaluations.groupDefects,
    },
    scaleLabels: [evaluations.scaleLow, evaluations.scaleMedium, evaluations.scaleHigh],
    intensityValueText: `{value}${evaluations.intensityScale}`,
    // No catalog key reads "{v} of 15": the bean label's pattern over 15.
    intensityValueLabel: scales.beanValueLabel.replace("9", "15"),
    beanValueText: scales.beanValue,
    beanValueLabel: scales.beanValueLabel,
    ratingLabels: {
      "rating-exceptional": landing.cardRatingExceptionalLabel,
      "rating-excellent": landing.cardRatingExcellentLabel,
      "rating-good": landing.cardRatingGoodLabel,
      "rating-commercial": landing.cardRatingCommercialLabel,
    },
  };
}

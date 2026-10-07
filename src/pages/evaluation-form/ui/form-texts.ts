import type { MessageCatalog } from "@/shared/lib/i18n";
import type { EvaluationFormTexts } from "./EvaluationForm";

/**
 * The form texts from the `evaluations` catalog (design.md D14), shared by the
 * `/new` and `/{ulid}` screens so both pass the same props.
 */
export function formTextsFrom(catalog: MessageCatalog): EvaluationFormTexts {
  return {
    eyebrow: catalog.formEyebrow,
    backLabel: catalog.backLabel,
    coffeeshopCaption: catalog.coffeeshopCaption,
    roasterCaption: catalog.roasterCaption,
    roastLevelLabel: catalog.roastLevelLabel,
    roastLevelPlaceholder: catalog.roastLevelPlaceholder,
    extractionMethodLabel: catalog.extractionMethodLabel,
    extractionMethodPlaceholder: catalog.extractionMethodPlaceholder,
    extractionLabels: {
      espresso: catalog.extractionEspresso,
      v60: catalog.extractionV60,
      chemex: catalog.extractionChemex,
      aeropress: catalog.extractionAeropress,
      french_press: catalog.extractionFrenchPress,
      moka: catalog.extractionMoka,
      cold_brew: catalog.extractionColdBrew,
      siphon: catalog.extractionSiphon,
      kalita: catalog.extractionKalita,
    },
    actions: {
      saveLabel: catalog.saveLabel,
      closeLabel: catalog.closeLabel,
      savedMessage: catalog.savedMessage,
      closedMessage: catalog.closedMessage,
      incompleteMessage: catalog.incompleteMessage,
      notYoursMessage: catalog.notYoursMessage,
      alreadyClosedMessage: catalog.alreadyClosedMessage,
      failureMessage: catalog.failureMessage,
      roastLevelRequired: catalog.roastLevelRequired,
    },
    fragranceNotEvaluatedLabel: catalog.fragranceNotEvaluatedLabel,
    offeringMissingLabel: catalog.offeringMissingLabel,
    legend: {
      title: catalog.legendTitle,
      labels: [
        catalog.legend1,
        catalog.legend2,
        catalog.legend3,
        catalog.legend4,
        catalog.legend5,
        catalog.legend6,
        catalog.legend7,
        catalog.legend8,
        catalog.legend9,
      ],
    },
    blockLabels: {
      aromatics: catalog.blockAromatics,
      main_tastes: catalog.blockMainTastes,
      mouthfeel: catalog.blockMouthfeel,
      defects: catalog.blockDefects,
    },
    group: {
      groupNames: {
        fragranceAroma: catalog.groupFragranceAroma,
        flavorAftertaste: catalog.groupFlavorAftertaste,
        acidity: catalog.groupAcidity,
        sweetness: catalog.groupSweetness,
        mouthfeel: catalog.groupMouthfeel,
        overall: catalog.groupOverall,
        defects: catalog.groupDefects,
        extrinsic: catalog.groupExtrinsic,
      },
      descriptiveHeading: catalog.descriptiveHeading,
      affectiveHeading: catalog.affectiveHeading,
      axisLabels: {
        fragrance: catalog.axisFragrance,
        aroma: catalog.axisAroma,
        flavor: catalog.axisFlavor,
        aftertaste: catalog.axisAftertaste,
        acidity: catalog.axisAcidity,
        sweetness: catalog.axisSweetness,
        mouthfeel: catalog.axisMouthfeel,
        overall: catalog.axisOverall,
      },
      scaleLabels: [catalog.scaleLow, catalog.scaleMedium, catalog.scaleHigh],
      intensityScale: catalog.intensityScale,
      preferenceScale: catalog.preferenceScale,
      unsetScore: catalog.unsetScore,
      completeLabel: catalog.completeLabel,
      incompleteLabel: catalog.incompleteLabel,
      addNoteLabel: catalog.addNoteLabel,
      removeNoteLabel: catalog.removeNoteLabel,
      noteLabel: catalog.noteLabel,
      extrinsicNoteLabel: catalog.extrinsicNoteLabel,
    },
  };
}

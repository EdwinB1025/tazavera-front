import type { EvaluationCreateBody, EvaluationUpdateBody } from "@/shared/api";
import type { SendableFormState } from "./state";

/**
 * Form state → write body (design.md D3, D7, D8, D9). A shared aromatics
 * selection travels as `cata` on both axes of its pair; with "Fragrance not
 * evaluated" checked each part's fragrance `score` takes that part's aroma
 * `score` and the disabled fragrance note sends nothing.
 */

/** A note as sent: an open note's text, or `null` when closed or empty. */
function sentNote(note: string | null): string | null {
  return note ? note : null;
}

/** The body of `PUT /user/evaluations/{evaluation_ulid}`. */
export function buildUpdateBody(state: SendableFormState): EvaluationUpdateBody {
  const { descriptive: d, affective: a, descriptors } = state;
  const copied = state.fragranceNotEvaluated;
  const axis = (value: { score: number | null; note: string | null }) => ({
    score: value.score,
    note: sentNote(value.note),
  });
  const fragrance = (
    own: { score: number | null; note: string | null },
    aroma: { score: number | null },
  ) => (copied ? { score: aroma.score, note: null } : axis(own));

  return {
    extractionMethod: state.extractionMethod || null,
    descriptive: {
      roastLevel: state.roastLevel,
      fragrance: { ...fragrance(d.fragrance, d.aroma), cata: descriptors.fragranceAroma },
      aroma: { ...axis(d.aroma), cata: descriptors.fragranceAroma },
      flavor: { ...axis(d.flavor), cata: descriptors.flavorAftertaste },
      aftertaste: { ...axis(d.aftertaste), cata: descriptors.flavorAftertaste },
      acidity: axis(d.acidity),
      sweetness: axis(d.sweetness),
      mouthfeel: { ...axis(d.mouthfeel), cata: descriptors.mouthfeel },
      mainTastes: descriptors.mainTastes,
    },
    affective: {
      overall: axis(a.overall),
      fragrance: fragrance(a.fragrance, a.aroma),
      aroma: axis(a.aroma),
      flavor: axis(a.flavor),
      aftertaste: axis(a.aftertaste),
      acidity: axis(a.acidity),
      sweetness: axis(a.sweetness),
      mouthfeel: axis(a.mouthfeel),
      defects: descriptors.defects,
    },
    extrinsics: {
      farming: sentNote(state.extrinsics.farming),
      processing: sentNote(state.extrinsics.processing),
      trading: sentNote(state.extrinsics.trading),
      certifications: sentNote(state.extrinsics.certifications),
      generalObservation: sentNote(state.generalObservation),
    },
  };
}

/** The body of `POST /user/evaluations`: the update body plus `offeringId`. */
export function buildCreateBody(
  state: SendableFormState,
  offeringId: string,
): EvaluationCreateBody {
  return { offeringId, ...buildUpdateBody(state) };
}

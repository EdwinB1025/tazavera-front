# Design

## Context

`EvaluationGroupList` renders `ScaleLegend` inside its 1rem-gap list, right after the Flavor / Aftertaste group (D16 of the change that introduced the legend). `EvaluationForm` renders the header, the context fields card, the group list and the actions in a 2rem-gap form. Product owner decided on 2026-10-09 that the legend is the form's first section.

## Decisions

### D1. `EvaluationForm` renders the legend after the header

`EvaluationForm` renders `ScaleLegend` between `EvaluationFormHeader` and `ContextFieldsCard`, with the same props it receives today (`texts.legend`, `model.legendOpen`, `form.setLegendOpen`), so it is a direct child of the form and takes the form's existing gap. `EvaluationGroupList` stops rendering it and drops `legend` from its texts type and the per-group `Fragment`. The legend shows in both modes, as today. No token, text or prop is added.

## Risks / Trade-offs

None: one element moves between two components of the same segment; the existing legend tests cover its content and states.

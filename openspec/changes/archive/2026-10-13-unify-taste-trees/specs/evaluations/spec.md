## MODIFIED Requirements

### Requirement: Read-only evaluation presentation
One read-only presentation SHALL render an evaluation's results for the evaluation view and for the provisional evaluation tab. It SHALL show: a summary card with the score and its rating word and a definition list of "Closed on" (`closedAt`, omitted when null), "Extraction method" (`extractionMethod`, labelled from the catalog of the nine values and shown raw otherwise) and "Defective cup" (`isDefective`, Yes/No text); an intensity card with the seven `descriptive.*.score` values as read-only meters over 0 to 15 whose value text reads "{v}/15" and whose accessible value reads "{v} de 15" over the labels LOW, MEDIUM and HIGH, a null score rendering as 0; a preference card with the eight `affective.*.score` values as read-only bean scales over 1 to 9 whose value text reads "{v}/9" and whose accessible value reads "{v} de 9", a null or 0 score omitting its scale; a descriptors card with five blocks (Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects) built from `tastes[]` by `type` (`fragrance`/`aroma`, `flavor`/`aftertaste`, `main_tastes`, `mouthfeel`, `defects`) with the taxonomy names resolved from `GET /taxonomies` at levels 0, 1 and 2 in the route's locale, each block shown as the collapsible taxonomy tree of the offering card (landing, "Taxonomy badge trees on the offering card": closed at first, the toggle inside the badge of a note with children, right after its name) with no share, and an empty text when a block has nothing; a notes list of the non-null `descriptive.*.note` and `affective.*.note` values headed "{Intensity or Preference} · {axis}"; and an extrinsic-attributes list of the non-null `extrinsics.*` fields with their labels. A block's tree SHALL hold the block's references that resolve in the block's taxonomy category, in the taxonomy's order and nested as in the taxonomy; a chosen note whose ancestor is not chosen SHALL show under that ancestor, the ancestor shown as a badge; a reference outside the block's category SHALL render nothing. Scores, notes and descriptors SHALL never be conveyed by color alone: every meter also carries its value as text and every descriptor carries its name.

#### Scenario: Summary values
- **WHEN** a presentation renders an evaluation with `cuppingScore`, `closedAt`, `extractionMethod` and `isDefective`
- **THEN** the summary shows the score once with its rating word and the three definition rows with the values `closedAt` formatted as a date in the route's locale, the extraction label of the catalog and the Yes/No text

#### Scenario: Intensity and preference values
- **WHEN** a presentation renders scores in `descriptive` and `affective`
- **THEN** each descriptive axis shows its read-only meter with its "{v}/15" text and each affective axis with a score from 1 to 9 shows its read-only bean scale with its "{v}/9" text, and an affective axis with a null or 0 score renders no scale

#### Scenario: Descriptor blocks
- **WHEN** a presentation renders `tastes[]` with resolvable references, among them a level-1 and a level-2 reference under a level-0 note that is not chosen
- **THEN** the five blocks group the references by their `type`; each block shows its notes as a taxonomy tree closed at first, with the taxonomy names in the route's locale and no share; the unchosen level-0 note shows as a badge with its toggle reading `+`; opening it shows the level-1 note, and opening that shows the level-2 note under it; and each empty block shows the empty text

#### Scenario: An unresolved descriptor reference
- **WHEN** a `tastes[]` reference does not resolve in the taxonomy catalog
- **THEN** its row renders no chip and no badge and the rest of the block renders normally

#### Scenario: Conditional blocks
- **WHEN** every note is null and every extrinsic field is null
- **THEN** the notes and extrinsic-attributes blocks render nothing at all, and each renders only the entries whose value is not null when some are

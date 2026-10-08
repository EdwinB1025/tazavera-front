## MODIFIED Requirements

### Requirement: Descriptor blocks

Each descriptor block SHALL offer, as a descriptor cascade, the level-0, level-1 and level-2 nodes of `GET /taxonomies` whose `categories` contain the block's value (`aromatics`, `main_tastes`, `mouthfeel`, `defects`), with the node name of the route's locale as the label; a node whose parent is not offered SHALL NOT be offered. Loading a saved draft in which a node is chosen without its parent SHALL also choose every ancestor of that node. A node matching several blocks SHALL appear in each of them. Selection SHALL be multiple with no limit on main tastes.

#### Scenario: A block's options

- **WHEN** the taxonomy tree arrives and a block is rendered
- **THEN** it shows every matching level-0 node as a chip and, while a matching node is chosen, its matching children, down to level 2, and no node whose parent is not offered

#### Scenario: Draft load chooses ancestors

- **WHEN** a saved draft is loaded whose descriptors hold a level-1 or level-2 node without its parent
- **THEN** the block shows that node chosen together with every ancestor of it

#### Scenario: Selecting descriptors

- **WHEN** the specialist selects descriptors in a shared aromatic block
- **THEN** the selection is sent as `cata` on both axes of its pair (`fragrance` and `aroma`, or `flavor` and `aftertaste`), and the mouthfeel block sends `descriptive.mouthfeel.cata`, the main tastes block sends `descriptive.mainTastes` and the defects block sends `affective.defects`

### Requirement: Read-only evaluation presentation
One read-only presentation SHALL render an evaluation's results for the evaluation view and for the provisional evaluation tab. It SHALL show: a summary card with the score and its rating word and a definition list of "Closed on" (`closedAt`, omitted when null), "Extraction method" (`extractionMethod`, labelled from the catalog of the nine values and shown raw otherwise) and "Defective cup" (`isDefective`, Yes/No text); an intensity card with the seven `descriptive.*.score` values as read-only meters over 0 to 15 whose value text reads "{v}/15" and whose accessible value reads "{v} de 15" over the labels LOW, MEDIUM and HIGH, a null score rendering as 0; a preference card with the eight `affective.*.score` values as read-only bean scales over 1 to 9 whose value text reads "{v}/9" and whose accessible value reads "{v} de 9", a null or 0 score omitting its scale; a descriptors card with five blocks (Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects) built from `tastes[]` by `type` (`fragrance`/`aroma`, `flavor`/`aftertaste`, `main_tastes`, `mouthfeel`, `defects`) with the taxonomy names resolved from `GET /taxonomies` at levels 0, 1 and 2 in the route's locale, shown as a read-only descriptor cascade, and an empty text when a block has nothing; a notes list of the non-null `descriptive.*.note` and `affective.*.note` values headed "{Intensity or Preference} · {axis}"; and an extrinsic-attributes list of the non-null `extrinsics.*` fields with their labels. Scores, notes and descriptors SHALL never be conveyed by color alone: every meter also carries its value as text and every descriptor carries its name.

#### Scenario: Summary values
- **WHEN** a presentation renders an evaluation with `cuppingScore`, `closedAt`, `extractionMethod` and `isDefective`
- **THEN** the summary shows the score once with its rating word and the three definition rows with the values `closedAt` formatted as a date in the route's locale, the extraction label of the catalog and the Yes/No text

#### Scenario: Intensity and preference values
- **WHEN** a presentation renders scores in `descriptive` and `affective`
- **THEN** each descriptive axis shows its read-only meter with its "{v}/15" text and each affective axis with a score from 1 to 9 shows its read-only bean scale with its "{v}/9" text, and an affective axis with a null or 0 score renders no scale

#### Scenario: Descriptor blocks
- **WHEN** a presentation renders `tastes[]` with resolvable references
- **THEN** the five blocks group the references by their `type`, each chip shows the taxonomy name in the route's locale under its parent's title, a level-2 reference included, and each empty block shows the empty text

#### Scenario: An unresolved descriptor reference
- **WHEN** a `tastes[]` reference does not resolve in the taxonomy catalog
- **THEN** its row renders no chip and no badge and the rest of the block renders normally

#### Scenario: Conditional blocks
- **WHEN** every note is null and every extrinsic field is null
- **THEN** the notes and extrinsic-attributes blocks render nothing at all, and each renders only the entries whose value is not null when some are

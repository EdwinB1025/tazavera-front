## ADDED Requirements

### Requirement: Facet units kept within the size limits
The combobox, the score range facet, the evaluation facet panel, the offering facet panel and the parsing of the evaluation filters SHALL each be built from components and functions of at most 80 lines and a cyclomatic complexity of at most 15, in files of at most 300 lines, and SHALL render the same structure, class names, texts and accessible names, load the combobox code at the same moment, and write the same query keys for the same input, as the other requirements of this capability state. This requirement adds no behaviour.

#### Scenario: Lint reports no size warning for the facet units
- **WHEN** `npm run lint` runs
- **THEN** it reports no `max-lines-per-function`, `complexity` or `max-lines` warning for the combobox, the score range facet, the evaluation or offering facet panel, the evaluation filter parsing, or the units they use

#### Scenario: A facet commits as before
- **WHEN** a visitor chooses a combobox option, commits a score range, or picks a radio option in the evaluation or offering facet panel
- **THEN** the URL receives the same query keys and values, and the panel renders the same facets in the same order with the same names, as before

## MODIFIED Requirements

### Requirement: Taxonomy badge
A taxonomy badge SHALL render its label on the taxonomy's data color as its background. In each theme, its label SHALL be white when the relative luminance of the rendered background (the data color at its depth opacity over the surface it renders on: the card surface, or the sidebar surface inside the inverse variant) is at most 0.179, and black above it. A badge at taxonomy level 1 SHALL render its background at 92% opacity and one at level 2 at 85% opacity.

#### Scenario: Data color background
- **WHEN** a taxonomy badge renders for a taxonomy
- **THEN** its background is that taxonomy's color

#### Scenario: White text on dark colors
- **WHEN** in the active theme the rendered background's relative luminance is at most 0.179
- **THEN** the badge label renders white

#### Scenario: Black text on light colors
- **WHEN** in the active theme the rendered background's relative luminance is above 0.179
- **THEN** the badge label renders black

#### Scenario: Depth reduces the background
- **WHEN** a taxonomy badge renders at level 1 or level 2
- **THEN** its background renders at 92% or 85% opacity respectively, while its label stays fully opaque

#### Scenario: Label over the sidebar surface
- **WHEN** a level-1 taxonomy badge renders inside the inverse variant
- **THEN** in each theme its label is white or black by the rendered background over that theme's sidebar surface, not over the card surface

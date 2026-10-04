# Spec Delta

## Purpose

Defines Tazavera's status and messaging components: how the interface reports state to the user — evaluation ratings, verification status and sensory taxonomy labels now, callouts, toasts, modals and empty states in later changes.

## ADDED Requirements

### Requirement: Badge presentation
A badge SHALL render as a compact chip carrying its label in the badge text treatment with the field corner radius of the active theme, and SHALL convey meaning through its label and icon as well as its colors.

#### Scenario: Chip presentation
- **WHEN** a badge renders in either theme
- **THEN** it appears as a compact chip with the badge text treatment and the field radius of the active theme

### Requirement: Rating badge
A rating badge SHALL classify a cupping score into one of four tiers — exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, and commercial below 80 — each rendered in its own rating treatment.

#### Scenario: Exceptional tier
- **WHEN** a rating badge classifies a score of 90 or above
- **THEN** it renders in the exceptional rating treatment

#### Scenario: Excellent tier
- **WHEN** a rating badge classifies a score from 85 to below 90
- **THEN** it renders in the excellent rating treatment

#### Scenario: Good tier
- **WHEN** a rating badge classifies a score from 80 to below 85
- **THEN** it renders in the good rating treatment

#### Scenario: Commercial tier
- **WHEN** a rating badge classifies a score below 80
- **THEN** it renders in the commercial rating treatment

### Requirement: Verification status badge
A verification status badge SHALL report an offering's verification state — verified or provisional — with an icon and a label in the state's status treatment: a check icon with the verified label for a verified offering, a clock icon with the provisional label for a provisional offering.

#### Scenario: Verified state
- **WHEN** a verification status badge reports a verified offering
- **THEN** it renders a check icon and the verified label in the verified status treatment

#### Scenario: Provisional state
- **WHEN** a verification status badge reports a provisional offering
- **THEN** it renders a clock icon and the provisional label in the provisional status treatment

### Requirement: Taxonomy badge
A taxonomy badge SHALL render its label on the taxonomy's data color as its background, with white text when the color's relative luminance is at most 0.179 and black text above it. A badge at taxonomy level 1 SHALL render its background at 92% opacity and one at level 2 at 85% opacity.

#### Scenario: Data color background
- **WHEN** a taxonomy badge renders for a taxonomy
- **THEN** its background is that taxonomy's color

#### Scenario: White text on dark colors
- **WHEN** the taxonomy color's relative luminance is at most 0.179
- **THEN** the badge label renders white

#### Scenario: Black text on light colors
- **WHEN** the taxonomy color's relative luminance is above 0.179
- **THEN** the badge label renders black

#### Scenario: Depth reduces the background
- **WHEN** a taxonomy badge renders at level 1 or level 2
- **THEN** its background renders at 92% or 85% opacity respectively, while its label stays fully opaque

### Requirement: Badge label contrast
Every badge label SHALL keep a contrast ratio of at least 4.5:1 against its rendered background in both themes (WCAG 2.2, SC 1.4.3).

#### Scenario: Rating and status pairs
- **WHEN** a rating or verification status badge renders in either theme
- **THEN** its label measures at least 4.5:1 against its background — the rating pairs measure 4.7–4.9:1 in the traditional theme and 6.6–7.1:1 in the dark theme

#### Scenario: Taxonomy pairs
- **WHEN** a taxonomy badge renders for any data color in either theme
- **THEN** its label measures at least 4.5:1 against the rendered background, whatever the luminance rule chose

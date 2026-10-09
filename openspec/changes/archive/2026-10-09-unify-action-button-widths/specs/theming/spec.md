## ADDED Requirements

### Requirement: Action width tokens
The design tokens SHALL define one minimum action width per action button size, the same in both themes: 7.5rem for the compact size and 10rem for the standard size, each available as a minimum-width utility named for its role.

#### Scenario: Width tokens in both themes
- **WHEN** the theme renders in the traditional or the dark theme
- **THEN** the compact action width resolves to 7.5rem and the standard action width to 10rem

## ADDED Requirements

### Requirement: Pointer cursor on actions
Every enabled clickable control — a link with a destination, a button, a disclosure summary, a label bound to a control, a select, a checkbox, radio, range or button-type input, and any element whose role is button, tab, menu item, option, switch, checkbox or radio — SHALL show the pointer cursor on hover, from one rule of the global stylesheet's base layer. A disabled control SHALL NOT get it from that rule, and text fields SHALL keep the text cursor.

#### Scenario: Pointer on enabled actions only
- **WHEN** the global stylesheet is read
- **THEN** one base-layer rule sets `cursor: pointer` on links with `href`, buttons, summaries, labels with `for`, selects, checkbox, radio, range, submit, button and reset inputs, and the roles button, tab, menuitem, menuitemcheckbox, menuitemradio, option, switch, checkbox and radio; it excludes `:disabled`, `[aria-disabled="true"]` and a `data-disabled` attribute whose value is not `false`; it names no bare `combobox` role, text input or textarea; and no menu item or combobox option sets its own `cursor-default`

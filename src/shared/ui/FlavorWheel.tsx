// ─── UI-specific types (declared before the component) ───
// The wheel takes resolved, localized notes as props: no generated API type is
// involved and there is no `locale` (design.md D1). This file carries the type
// only until the wheel slice; `FlavorWheelTexts` and `FlavorWheelProps` join it
// with the component (design.md D1).

export type FlavorWheelNode = {
  id: string; // taxonomy ulid
  name: string; // localized name
  description: string | null; // localized description
  color: string; // #RRGGBB data color
  level: 0 | 1 | 2; // from the offering node's own level
  count: number; // evaluators who identified the note
  countLabel: string; // host-composed accessible text
  children: FlavorWheelNode[];
};

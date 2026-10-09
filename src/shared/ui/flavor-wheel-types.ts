// The flavor wheel's note and group types, shared by the wheel and its parts
// so that no part imports them from `FlavorWheel.tsx`.

export type FlavorWheelNode = {
  id: string; // taxonomy ulid
  name: string; // localized name
  description: string | null; // localized description
  color: string; // #RRGGBB data color
  level: 0 | 1 | 2; // from the offering node's own level
  count: number; // evaluators who identified the note
  countLabel: string; // host-composed accessible text
  group?: string; // the root's group id (add-offering-catalog D19); roots only
  children: FlavorWheelNode[];
};

/** A group of roots set apart on the wheel, in wheel order (D19). */
export type FlavorWheelGroup = { id: string; name: string };

"use client";

import type { ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───

/** `seeMore` holds a `{count}` placeholder. */
export type SeeMoreTexts = { seeMore: string; seeLess: string };

export type SeeMoreButtonProps = {
  expanded: boolean;
  count: number; // options hidden while collapsed
  controls: string; // id of the group it shows and hides
  onToggle: () => void;
  texts: SeeMoreTexts;
};

/** "See more ({count})" / "See less" action of a long facet (design.md D6). */
export function SeeMoreButton({
  expanded,
  count,
  controls,
  onToggle,
  texts,
}: SeeMoreButtonProps): ReactNode {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="type-button mt-1 min-h-6 self-start px-3 text-nav-text-dark underline focus-visible:focus-ring"
    >
      {expanded ? texts.seeLess : texts.seeMore.replace("{count}", String(count))}
    </button>
  );
}

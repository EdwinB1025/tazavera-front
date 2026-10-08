import type { ReactNode } from "react";
import { OfferingSkeletonCard } from "@/widgets/offering-list";

// The grid beside the sidebar (design.md D3): 1 column, 2 from `lg`, 3 from
// `2xl`, 1.5rem gap; grid items stretch, so a row shares its height.
export const GRID_CLASSES = [
  "grid",
  "grid-cols-1",
  "gap-6",
  "lg:grid-cols-2",
  "2xl:grid-cols-3",
].join(" ");

const SKELETON_CARD_KEYS = [0, 1, 2] as const;

/** Three skeleton cards in the list's grid, while the list or the session loads. */
export function SkeletonGrid(): ReactNode {
  return (
    <div className={GRID_CLASSES}>
      {SKELETON_CARD_KEYS.map((key) => (
        <OfferingSkeletonCard key={key} />
      ))}
    </div>
  );
}

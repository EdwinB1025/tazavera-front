"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui";
import { MapPin } from "@/shared/ui/icons";
import { takeFocusRequestFor } from "../lib/map-focus";
import { viewHref } from "../lib/view-href";

export type ShowOnMapButtonProps = {
  ulid: string;
  name: string;
  /** "Show {name} on the map"; `{name}` is replaced. */
  label: string;
};

/**
 * The card's map action (add-coffeeshop-directory design.md D13; spec "Show
 * a coffee shop on the map"): it opens the map view focused on the coffee
 * shop, keeping the filters, the sort and the page. After the full-screen map
 * it opened closes, it takes the focus back.
 */
export function ShowOnMapButton({ ulid, name, label }: ShowOnMapButtonProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (takeFocusRequestFor(`card:${ulid}`)) ref.current?.querySelector("button")?.focus();
  }, [ulid]);

  return (
    <span ref={ref} className="contents">
      <Button
        type="button"
        variant="action-3"
        size="sm"
        icon={MapPin}
        aria-label={label.replace("{name}", name)}
        onClick={() =>
          router.push(
            viewHref(pathname, new URLSearchParams(searchParams?.toString()), { view: "map", focus: ulid }),
            { scroll: false },
          )
        }
      />
    </span>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ViewToggle } from "@/shared/ui";
import { List, MapIcon } from "@/shared/ui/icons";
import { takeFocusRequestFor } from "../lib/map-focus";
import { viewHref } from "../lib/view-href";

export type CoffeeshopsViewToggleTexts = {
  viewToggleLabel: string;
  viewList: string;
  viewMap: string;
};

export type CoffeeshopsViewToggleProps = {
  texts: CoffeeshopsViewToggleTexts;
};

/**
 * The directory's List / Map control (add-coffeeshop-directory design.md
 * D13; spec "Directory view toggle"): Map writes `view=map`, List removes
 * `view` and `focus`; every other key, the page included, stays, and the
 * scroll does not move. After the full-screen map closes, it takes back the
 * focus on its Map item when the map was opened from it.
 */
export function CoffeeshopsViewToggle({ texts }: CoffeeshopsViewToggleProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const view = searchParams?.get("view") === "map" ? "map" : "list";
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === "list" && takeFocusRequestFor("toggle")) {
      groupRef.current?.querySelector<HTMLElement>('[data-view="map"]')?.focus();
    }
  }, [view]);

  return (
    <div ref={groupRef}>
      <ViewToggle
        label={texts.viewToggleLabel}
        value={view}
        items={[
          { value: "list", label: texts.viewList, icon: List },
          { value: "map", label: texts.viewMap, icon: MapIcon },
        ]}
        onValueChange={(next) =>
          router.push(
            viewHref(
              pathname,
              new URLSearchParams(searchParams?.toString()),
              next === "map" ? { view: "map" } : { view: undefined, focus: undefined },
            ),
            { scroll: false },
          )
        }
      />
    </div>
  );
}

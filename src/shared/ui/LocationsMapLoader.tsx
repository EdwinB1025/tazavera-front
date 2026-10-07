"use client";

import { createContext, useContext, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LoadingStatus } from "./LoadingStatus";
import type { LocationsMapProps, LocationsMapTexts } from "./LocationsMap";

// ─── UI-specific types (declared before the component) ───

export type LocationsMapLoaderProps = Omit<LocationsMapProps, "texts"> & {
  texts: LocationsMapTexts & { mapLoading: string };
};

// The placeholder fills the loader's box, which carries the map's size.
const BOX_CLASSES = "relative";
const PLACEHOLDER_CLASSES = "flex size-full items-center justify-center bg-surface-section";

// `loading` receives no props, so the text reaches it through context.
const LoadingTextContext = createContext("");

function MapPlaceholder(): ReactNode {
  return (
    <div className={PLACEHOLDER_CLASSES}>
      <LoadingStatus text={useContext(LoadingTextContext)} />
    </div>
  );
}

const LazyMap = dynamic(() => import("./LocationsMap").then((module) => module.LocationsMap), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

/**
 * The client-only loader of the map (add-coffeeshop-directory design.md D14;
 * spec "Map loading"): Leaflet reads `window`, so the map module loads with
 * `ssr: false`, which only a Client Component may ask for; until it loads, a
 * placeholder of the map's size shows the spinner and the loading text.
 */
export function LocationsMapLoader({ texts, className, ...props }: LocationsMapLoaderProps): ReactNode {
  const { mapLoading, ...mapTexts } = texts;
  return (
    <div className={[BOX_CLASSES, className].filter(Boolean).join(" ")}>
      <LoadingTextContext.Provider value={mapLoading}>
        <LazyMap {...props} className="size-full" texts={mapTexts} />
      </LoadingTextContext.Provider>
    </div>
  );
}

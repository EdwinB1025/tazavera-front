"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { type LeafletMap } from "@/shared/lib/leaflet";
import { cn } from "@/shared/lib/utils";
import { Button } from "./Button";
import { LINK_CLASSES } from "./Link";
import { Minus, Plus } from "./icons";
import { createLocationsMapView } from "./locations-map-view";
import { LocationsMapPanel } from "./LocationsMapPanel";

// ─── UI-specific types (declared before the component) ───

/** One marker of the map (design.md D2; `MapPoint`'s shape, declared here for the shared layer). */
export type LocationsMapPoint = {
  id: string;
  groupId: string;
  lat: number;
  lng: number;
  label: string;
  title: string;
  subtitle: string;
  addressLine: string;
};

export type LocationsMapTexts = {
  mapLabel: string;
  zoomIn: string;
  zoomOut: string;
  closePanel: string;
  /** Holds `{link}`, the place of the contributors link. */
  osmAttribution: string;
  osmContributors: string;
};

export type LocationsMapProps = {
  points: LocationsMapPoint[];
  /** The group to fit, select and open; ignored when no point carries it. */
  focusGroupId?: string;
  /** The panel's link, e.g. the directory's "View coffee shop"; none when absent. */
  renderPanelLink?: (point: LocationsMapPoint) => ReactNode;
  texts: LocationsMapTexts;
  /** The id of the visible help line that describes the map. */
  helpId: string;
  /** The height of the map. */
  className?: string;
};

const COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

// Leaflet's panes stack up to z-index 700; the overlays sit above them.
const OVERLAY_CLASSES = "absolute z-[1000]";
const ZOOM_CLASSES = cn(OVERLAY_CLASSES, "top-3 right-3 flex flex-col gap-2");
const PANEL_CLASSES = cn(OVERLAY_CLASSES, "bottom-8 left-3 right-3 max-w-96");
const ATTRIBUTION_CLASSES = cn(
  OVERLAY_CLASSES,
  "bottom-0 right-0 bg-surface-card px-2 py-1 rounded-field type-meta text-text-primary",
);

/** The OpenStreetMap attribution, its link placed at `{link}`. */
function Attribution({ texts }: { texts: LocationsMapTexts }): ReactNode {
  const [beforeLink, afterLink] = texts.osmAttribution.split("{link}");
  return (
    <p className={ATTRIBUTION_CLASSES}>
      {beforeLink}
      <a href={COPYRIGHT_URL} className={LINK_CLASSES}>
        {texts.osmContributors}
      </a>
      {afterLink}
    </p>
  );
}

/**
 * The shared map of located points (add-coffeeshop-directory design.md D14;
 * specs "Map interaction and accessibility" and "Selected location panel"):
 * Leaflet behind the single entry point, with the project's own zoom buttons,
 * attribution and selected-location panel instead of Leaflet's controls and
 * popups. Each marker is a keyboard-reachable button named by its label;
 * activating it (click, Enter, Space) selects it and opens its panel without
 * moving the focus; Escape or Close closes the panel and focuses the marker.
 */
export function LocationsMap({
  points,
  focusGroupId,
  renderPanelLink,
  texts,
  helpId,
  className,
}: LocationsMapProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef(new Map<string, HTMLElement>());
  const focused = points.filter((point) => point.groupId === focusGroupId);
  const [selected, setSelected] = useState<string[]>(focused.map((point) => point.id));
  const [panelId, setPanelId] = useState<string | null>(focused[0]?.id ?? null);

  const closePanel = (id: string) => {
    setPanelId(null);
    setSelected([]);
    markersRef.current.get(id)?.focus();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markers = markersRef.current;
    const { map, roots } = createLocationsMapView(container, points, focusGroupId, markers, {
      open: (id) => {
        setSelected([id]);
        setPanelId(id);
      },
      close: () => {
        setPanelId(null);
        setSelected([]);
      },
    });
    mapRef.current = map;

    return () => {
      markers.clear();
      mapRef.current = null;
      map.remove();
      // Unmounted after the current render, as React requires.
      queueMicrotask(() => roots.forEach((root) => root.unmount()));
    };
  }, [points, focusGroupId]);

  useEffect(() => {
    for (const [id, element] of markersRef.current) {
      element.setAttribute("data-selected", String(selected.includes(id)));
    }
  }, [selected, points, focusGroupId]);

  const panelPoint = points.find((point) => point.id === panelId);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label={texts.mapLabel}
        aria-describedby={helpId}
        tabIndex={0}
        className="size-full focus-visible:focus-ring"
      />
      <div className={ZOOM_CLASSES}>
        <Button variant="action-3" size="sm" icon={Plus} aria-label={texts.zoomIn} onClick={() => mapRef.current?.zoomIn()} />
        <Button variant="action-3" size="sm" icon={Minus} aria-label={texts.zoomOut} onClick={() => mapRef.current?.zoomOut()} />
      </div>
      {panelPoint ? (
        <LocationsMapPanel
          point={panelPoint}
          headingId={`${helpId}-panel`}
          renderPanelLink={renderPanelLink}
          closeLabel={texts.closePanel}
          onClose={() => closePanel(panelPoint.id)}
          className={PANEL_CLASSES}
        />
      ) : null}
      <Attribution texts={texts} />
    </div>
  );
}

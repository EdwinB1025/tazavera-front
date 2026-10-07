"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { L, type LatLngTuple, type LeafletMap } from "@/shared/lib/leaflet";
import { cn } from "@/shared/lib/utils";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import { LINK_CLASSES } from "./Link";
import { MapPin, Minus, Plus, X } from "./icons";

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

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
const MAX_ZOOM = 19;
const SINGLE_POINT_ZOOM = 16;
const FIT_PADDING: [number, number] = [32, 32];

// The marker: a 2rem pill in the primary action fill with a card-coloured
// border; hover, focus and the selected look take the hover fill.
const MARKER_CLASSES = [
  "size-8",
  "rounded-pill",
  "border-2",
  "border-surface-card",
  "bg-action-primary",
  "text-action-primary-text",
  "flex",
  "items-center",
  "justify-center",
  "hover:bg-action-primary-hover",
  "focus-visible:focus-ring",
  "data-[selected=true]:bg-action-primary-hover",
].join(" ");

const ICON_CLASSES = "flex size-full items-center justify-center";

// Leaflet's panes stack up to z-index 700; the overlays sit above them.
const OVERLAY_CLASSES = "absolute z-[1000]";
const ZOOM_CLASSES = cn(OVERLAY_CLASSES, "top-3 right-3 flex flex-col gap-2");
const PANEL_CLASSES = cn(OVERLAY_CLASSES, "bottom-8 left-3 right-3 max-w-96");
const ATTRIBUTION_CLASSES = cn(
  OVERLAY_CLASSES,
  "bottom-0 right-0 bg-surface-card px-2 py-1 rounded-field type-meta text-text-primary",
);

function latLng(point: LocationsMapPoint): LatLngTuple {
  return [point.lat, point.lng];
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
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      keyboard: true,
      maxZoom: MAX_ZOOM,
      ...(reduceMotion ? { zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false } : {}),
    });
    mapRef.current = map;
    L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM }).addTo(map);

    // The view comes first: Leaflet builds a marker's element only once the
    // map has a view, and the loop below names and wires those elements.
    const target = points.some((point) => point.groupId === focusGroupId)
      ? points.filter((point) => point.groupId === focusGroupId)
      : points;
    if (target.length === 1) {
      map.setView(latLng(target[0]!), SINGLE_POINT_ZOOM);
    } else if (target.length > 1) {
      map.fitBounds(L.latLngBounds(target.map(latLng)), { padding: FIT_PADDING });
    }

    const markers = markersRef.current;
    const roots: Root[] = [];
    for (const point of points) {
      const icon = document.createElement("span");
      // Leaflet's stylesheet makes the marker element a block, so the icon
      // element centres the pin itself.
      icon.className = ICON_CLASSES;
      const root = createRoot(icon);
      root.render(<MapPin className="size-4" aria-hidden="true" />);
      roots.push(root);
      const marker = L.marker(latLng(point), {
        keyboard: true,
        icon: L.divIcon({ className: MARKER_CLASSES, html: icon, iconSize: [32, 32] }),
      }).addTo(map);
      const element = marker.getElement();
      if (!element) continue;
      element.setAttribute("aria-label", point.label);
      markers.set(point.id, element);
      const open = () => {
        setSelected([point.id]);
        setPanelId(point.id);
      };
      marker.on("click", open);
      element.addEventListener("keydown", (event) => {
        // Leaflet maps Enter only to a bound popup, so both keys are ours.
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        } else if (event.key === "Escape") {
          setPanelId(null);
          setSelected([]);
          element.focus();
        }
      });
    }

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
  const [beforeLink, afterLink] = texts.osmAttribution.split("{link}");
  const panelHeadingId = `${helpId}-panel`;

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
        <Button variant="action-4" size="sm" icon={Plus} aria-label={texts.zoomIn} onClick={() => mapRef.current?.zoomIn()} />
        <Button variant="action-4" size="sm" icon={Minus} aria-label={texts.zoomOut} onClick={() => mapRef.current?.zoomOut()} />
      </div>
      {panelPoint ? (
        <div
          role="region"
          aria-labelledby={panelHeadingId}
          className={PANEL_CLASSES}
          onKeyDown={(event) => {
            if (event.key === "Escape") closePanel(panelPoint.id);
          }}
        >
          <Card>
            <CardContent className="relative flex flex-col gap-1 p-4">
              <h3 id={panelHeadingId} className="type-card-heading pr-10">
                {panelPoint.title}
              </h3>
              <p className="type-label">{panelPoint.subtitle}</p>
              <p className="type-meta">{panelPoint.addressLine}</p>
              {renderPanelLink ? <div className="mt-2">{renderPanelLink(panelPoint)}</div> : null}
              <div className="absolute top-2 right-2">
                <Button
                  variant="action-4"
                  size="sm"
                  icon={X}
                  aria-label={texts.closePanel}
                  onClick={() => closePanel(panelPoint.id)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
      <p className={ATTRIBUTION_CLASSES}>
        {beforeLink}
        <a href={COPYRIGHT_URL} className={LINK_CLASSES}>
          {texts.osmContributors}
        </a>
        {afterLink}
      </p>
    </div>
  );
}

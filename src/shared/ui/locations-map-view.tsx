"use client";

import { createRoot, type Root } from "react-dom/client";
import { L, type LatLngTuple, type LeafletMap } from "@/shared/lib/leaflet";
import { MapPin } from "./icons";
import type { LocationsMapPoint } from "./LocationsMap";

// ─── UI-specific types (declared before the functions) ───

export type LocationsMapHandlers = {
  /** Selects the point and opens its panel. */
  open: (id: string) => void;
  /** Closes the panel and clears the selection. */
  close: () => void;
};

export type LocationsMapView = {
  map: LeafletMap;
  roots: Root[];
};

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAX_ZOOM = 19;
const SINGLE_POINT_ZOOM = 16;
// The fit keeps 2rem from every edge and also clears the zoom controls in the
// top-right corner (ZOOM_CLASSES: 0.75rem inset, one 2rem column across, two
// 2rem buttons with a 0.5rem gap down).
const FIT_PADDING = 32;
const ZOOM_CONTROLS_WIDTH = 12 + 32;
const ZOOM_CONTROLS_HEIGHT = 12 + 32 + 8 + 32;
const FIT_OPTIONS: L.FitBoundsOptions = {
  paddingTopLeft: [FIT_PADDING, FIT_PADDING + ZOOM_CONTROLS_HEIGHT],
  paddingBottomRight: [FIT_PADDING + ZOOM_CONTROLS_WIDTH, FIT_PADDING],
};

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

function latLng(point: LocationsMapPoint): LatLngTuple {
  return [point.lat, point.lng];
}

/** A Leaflet map without its own controls, panning without animation on reduced motion. */
function createMap(container: HTMLElement): LeafletMap {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: false,
    keyboard: true,
    maxZoom: MAX_ZOOM,
    ...(reduceMotion
      ? { zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: false }
      : {}),
  });
  if (reduceMotion) {
    // Leaflet has no option for pan animation; its keyboard pans and its
    // panTo / setView pans all go through panBy, so panBy never animates.
    const panBy = map.panBy.bind(map);
    map.panBy = (offset, options) => panBy(offset, { ...options, animate: false });
  }
  L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM }).addTo(map);
  return map;
}

/** Fits the focused group, or every point when no point carries it. */
function setInitialView(
  map: LeafletMap,
  points: LocationsMapPoint[],
  focusGroupId: string | undefined,
): void {
  const target = points.some((point) => point.groupId === focusGroupId)
    ? points.filter((point) => point.groupId === focusGroupId)
    : points;
  if (target.length === 1) {
    map.setView(latLng(target[0]!), SINGLE_POINT_ZOOM);
  } else if (target.length > 1) {
    map.fitBounds(L.latLngBounds(target.map(latLng)), FIT_OPTIONS);
  }
}

/** One marker: a named, keyboard-reachable button wired to the handlers. */
function addMarker(
  map: LeafletMap,
  point: LocationsMapPoint,
  handlers: LocationsMapHandlers,
): { root: Root; element: HTMLElement | undefined } {
  const icon = document.createElement("span");
  // Leaflet's stylesheet makes the marker element a block, so the icon
  // element centres the pin itself.
  icon.className = ICON_CLASSES;
  const root = createRoot(icon);
  root.render(<MapPin className="size-4" aria-hidden="true" />);
  const marker = L.marker(latLng(point), {
    keyboard: true,
    icon: L.divIcon({ className: MARKER_CLASSES, html: icon, iconSize: [32, 32] }),
  }).addTo(map);
  const element = marker.getElement();
  if (!element) return { root, element };
  element.setAttribute("aria-label", point.label);
  const open = () => handlers.open(point.id);
  marker.on("click", open);
  element.addEventListener("keydown", (event) => {
    // Leaflet maps Enter only to a bound popup, so both keys are ours.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    } else if (event.key === "Escape") {
      handlers.close();
      element.focus();
    }
  });
  return { root, element };
}

/**
 * Creates the map in `container`, sets its view, then adds the markers and
 * registers each marker element in `markers` by point id.
 */
export function createLocationsMapView(
  container: HTMLElement,
  points: LocationsMapPoint[],
  focusGroupId: string | undefined,
  markers: Map<string, HTMLElement>,
  handlers: LocationsMapHandlers,
): LocationsMapView {
  const map = createMap(container);
  // The view comes first: Leaflet builds a marker's element only once the
  // map has a view, and the loop below names and wires those elements.
  setInitialView(map, points, focusGroupId);
  const roots: Root[] = [];
  for (const point of points) {
    const { root, element } = addMarker(map, point, handlers);
    roots.push(root);
    if (element) markers.set(point.id, element);
  }
  return { map, roots };
}

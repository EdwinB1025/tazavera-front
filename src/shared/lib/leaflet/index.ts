/**
 * The single entry point of the map library (add-coffeeshop-directory
 * design.md D16): Leaflet and its stylesheet are imported here only, so the
 * guard next to this file can keep every other module off `leaflet`. Leaflet
 * reads `window` when it loads, so only client-only modules loaded without
 * SSR import this entry point.
 */
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export { L };
export type { LatLngTuple, Map as LeafletMap } from "leaflet";

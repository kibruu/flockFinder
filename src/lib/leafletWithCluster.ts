import * as L from "leaflet";

(globalThis as unknown as { L: typeof L }).L = L;

let markerClusterPromise: Promise<unknown> | null = null;

export function ensureMarkerCluster(): Promise<unknown> {
  if (!markerClusterPromise) {
    markerClusterPromise = import("leaflet.markercluster");
  }
  return markerClusterPromise;
}
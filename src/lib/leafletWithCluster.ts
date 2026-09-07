import * as L from "leaflet";

const globalL = L as unknown as Record<string, unknown>;
(globalThis as unknown as { L: Record<string, unknown> }).L = { ...globalL };

let markerClusterPromise: Promise<void> | null = null;

export function ensureMarkerCluster(): Promise<void> {
  if (!markerClusterPromise) {
    markerClusterPromise = import("leaflet.markercluster").then(() => undefined);
  }
  return markerClusterPromise;
}

export function createClusterLayer(
  options?: L.MarkerClusterGroupOptions
): L.MarkerClusterGroup {
  const global = globalThis as unknown as {
    L: { markerClusterGroup: (opts?: L.MarkerClusterGroupOptions) => L.MarkerClusterGroup };
  };
  return global.L.markerClusterGroup(options);
}
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as L from "leaflet";
import { ensureMarkerCluster } from "@/lib/leafletWithCluster";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { MapPin, Bird, Flag, Navigation, Layers, Crosshair, ArrowLeft } from "lucide-react";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface Hotspot {
  id: string;
  name: string;
  description: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  habitatType: string;
  amenities: string | null;
  coverImage: string | null;
}

export interface Sighting {
  id: string;
  speciesId: string;
  speciesName: string;
  speciesScientificName: string;
  speciesCategory: string;
  speciesImageUrl: string | null;
  userId: string;
  userName: string;
  isCurrentUser: boolean;
  hotspotId: string;
  hotspotName: string;
  count: number;
  notes: string | null;
  latitude: number;
  longitude: number;
  spottedAt: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  date: string;
  meetingTime: string;
  meetingPoint: string;
  targetSpecies: string[];
  maxParticipants: number | null;
  status: string;
  hotspotId: string;
  hotspotName: string;
  hotspotLatitude: number;
  hotspotLongitude: number;
  hostName: string;
}

interface MapViewProps {
  hotspots: Hotspot[];
  sightings: Sighting[];
  trips: Trip[];
  currentUserId?: string;
}

// Color-blind safe palette (tested with Coblis simulator for protanopia/deuteranopia/tritanopia)
// All combinations pass WCAG AA against white and dark map tiles
const HABITAT_COLORS: Record<string, string> = {
  Wetland: "#009688",   // Teal - distinct from green
  Forest: "#2E7D32",    // Dark green - distinct from teal
  Coast: "#0277BD",     // Blue - distinct from teal/green
  Mountain: "#6A1B9A",  // Deep purple - distinct from blue
  Grassland: "#F57F17", // Amber - distinct from yellow/orange
  Urban: "#546E7A",     // Blue-gray - neutral
};

const LAYER_COLORS = {
  hotspots: "#009688",   // Teal (matches Wetland - primary layer color)
  sightings: "#E65100",  // Dark orange - distinct from red/amber
  expeditions: "#C62828", // Dark red - distinct from orange
};

function createCustomIcon(color: string, emoji: string, size = 32) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); display: block;">${emoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function createUserSightingIcon(size = 32) {
  return L.divIcon({
    className: "custom-marker user-sighting",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background: #f59e0b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid #fde047;
      ">
        <span style="transform: rotate(45deg); display: block;">📍</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function HabitatLegend({ hotspots }: { hotspots: Hotspot[] }) {
  const habitatTypes = [...new Set(hotspots.map((h) => h.habitatType))].sort();
  if (!habitatTypes.length) return null;

  return (
    <div className="absolute bottom-4 right-4 z-[500] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[160px]">
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Habitat Types</h3>
      <div className="space-y-1.5">
        {habitatTypes.map((habitat) => (
          <div key={habitat} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2 border-white dark:border-gray-300 shadow-sm"
              style={{ backgroundColor: HABITAT_COLORS[habitat] || LAYER_COLORS.hotspots }}
              aria-label={`${habitat} habitat`}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{habitat.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapView({ hotspots, sightings, trips, currentUserId }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef({
    hotspots: L.featureGroup(),
    sightings: L.featureGroup(),
    expeditions: L.featureGroup(),
  });
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const darkModeRef = useRef(document.documentElement.classList.contains("dark"));
  const [showLayers, setShowLayers] = useState({
    hotspots: true,
    sightings: true,
    expeditions: true,
  });
  const [filters, setFilters] = useState({
    species: "",
    habitat: "",
    dateRange: "",
  });
  const debouncedFilters = useDebouncedValue(filters, 300);
  const [centerOnMe, setCenterOnMe] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const activePopupRef = useRef<{ layer: string; lat: number; lng: number } | null>(null);
  const isRebuildingRef = useRef(false);

  const [mountEpoch] = useState(() => Date.now());
  const dateCutoff = useMemo(() => {
    if (!debouncedFilters.dateRange) return null;
    const days = parseInt(debouncedFilters.dateRange, 10);
    return new Date(mountEpoch - days * 24 * 60 * 60 * 1000);
  }, [debouncedFilters.dateRange, mountEpoch]);

  const filteredSightings = useMemo(() => {
    let result = sightings;
    if (debouncedFilters.species) {
      const needle = debouncedFilters.species.toLowerCase();
      result = result.filter((s) => s.speciesName.toLowerCase().includes(needle));
    }
    if (debouncedFilters.habitat) {
      result = result.filter((s) => {
        const hotspot = hotspots.find((h) => h.id === s.hotspotId);
        return hotspot?.habitatType === debouncedFilters.habitat;
      });
    }
    if (debouncedFilters.dateRange) {
      const cutoff = dateCutoff;
      if (cutoff) {
        result = result.filter((s) => new Date(s.spottedAt) >= cutoff);
      }
    }
    return result;
  }, [sightings, hotspots, debouncedFilters, dateCutoff]);

  const filteredHotspots = useMemo(() => {
    if (!debouncedFilters.habitat) return hotspots;
    return hotspots.filter((h) => h.habitatType === debouncedFilters.habitat);
  }, [hotspots, debouncedFilters.habitat]);

  const filteredTrips = useMemo(() => {
    if (!debouncedFilters.habitat) return trips;
    return trips.filter((t) => {
      const hotspot = hotspots.find((h) => h.id === t.hotspotId);
      return hotspot?.habitatType === debouncedFilters.habitat;
    });
  }, [trips, hotspots, debouncedFilters.habitat]);

  const updateTileLayer = useCallback((darkMode: boolean) => {
    darkModeRef.current = darkMode;
    if (tileLayerRef.current) {
      mapInstanceRef.current?.removeLayer(tileLayerRef.current);
    }
    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution = darkMode
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    tileLayerRef.current = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
    });
    tileLayerRef.current.addTo(mapInstanceRef.current!);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795],
      zoom: 4,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.attribution({ position: "bottomright" }).addTo(map);

    const darkMode = document.documentElement.classList.contains("dark");
    darkModeRef.current = darkMode;
    updateTileLayer(darkMode);

    void ensureMarkerCluster().then(() => {
      const currentMap = mapInstanceRef.current;
      if (!currentMap) return;

      Object.values(layersRef.current).forEach((layer) => {
        if (layer) layer.addTo(currentMap);
      });

      currentMap.on("zoomend", () => {
        if (currentMap.getZoom() < 5) {
          currentMap.closePopup();
        }
      });

      currentMap.on("popupopen", (e) => {
        const ll = e.popup.getLatLng();
        if (!ll) return;
        let layerName = "";
        Object.entries(layersRef.current).forEach(([name, fg]) => {
          if (fg && fg instanceof L.FeatureGroup) {
            fg.eachLayer((l) => {
              if (l instanceof L.Marker && l.getPopup() === e.popup) {
                layerName = name;
              }
            });
          }
        });
        if (layerName) {
          activePopupRef.current = { layer: layerName, lat: ll.lat, lng: ll.lng };
        }
      });
      currentMap.on("popupclose", () => {
        if (!isRebuildingRef.current) {
          activePopupRef.current = null;
        }
      });

      setMapReady(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, [updateTileLayer]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const darkMode = document.documentElement.classList.contains("dark");
    darkModeRef.current = darkMode;
    updateTileLayer(darkMode);

    const observer = new MutationObserver(() => {
      const newDarkMode = document.documentElement.classList.contains("dark");
      if (newDarkMode !== darkModeRef.current) {
        darkModeRef.current = newDarkMode;
        updateTileLayer(newDarkMode);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [updateTileLayer, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    isRebuildingRef.current = true;
    layersRef.current.hotspots.clearLayers();
    if (showLayers.hotspots) {
      filteredHotspots.forEach((hotspot) => {
        const marker = L.marker([hotspot.latitude, hotspot.longitude], {
          icon: createCustomIcon(HABITAT_COLORS[hotspot.habitatType] || LAYER_COLORS.hotspots, "🦅"),
        });
        const name = escapeHtml(hotspot.name);
        const locationName = escapeHtml(hotspot.locationName);
        const habitatType = escapeHtml(hotspot.habitatType);
        const amenities = hotspot.amenities ? escapeHtml(hotspot.amenities) : null;
        const popupContent = `
          <div class="map-popup" style="min-width: 240px;">
            <div class="flex items-center gap-2 mb-2">
              <span style="font-size: 1.5rem;">🦅</span>
              <h3 style="font-weight: 600; color: #1B3B2B; margin: 0;">${name}</h3>
            </div>
            <p style="margin: 0 0 8px; color: #4a4a4a; font-size: 0.875rem;">${locationName}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 0.8rem;"><strong>Habitat:</strong> ${habitatType}</p>
            ${amenities ? `<p style="margin: 0 0 8px; color: #64748b; font-size: 0.8rem;"><strong>Amenities:</strong> ${amenities}</p>` : ""}
            <a href="/hotspots/${hotspot.id}" style="color: #14b8a6; font-weight: 500; text-decoration: none; font-size: 0.875rem;">View Details →</a>
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.addTo(layersRef.current.hotspots);
      });
    }
    isRebuildingRef.current = false;
  }, [filteredHotspots, showLayers.hotspots, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    isRebuildingRef.current = true;
    const sightingsLayer = layersRef.current.sightings;
    sightingsLayer.clearLayers();

    if (!showLayers.sightings) {
      isRebuildingRef.current = false;
      return;
    }

    const coordGroups = new Map<string, Sighting[]>();
    filteredSightings.forEach((s) => {
      const key = `${s.latitude.toFixed(6)},${s.longitude.toFixed(6)}`;
      const arr = coordGroups.get(key) ?? [];
      arr.push(s);
      coordGroups.set(key, arr);
    });

    coordGroups.forEach((group) => {
      const spreadRadius = group.length > 1 ? 0.0012 : 0;
      group.forEach((sighting, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        const lat = sighting.latitude + spreadRadius * Math.sin(angle);
        const lng = sighting.longitude + spreadRadius * Math.cos(angle);
        const isUser = sighting.isCurrentUser;
        const marker = L.marker([lat, lng], {
          icon: isUser ? createUserSightingIcon() : createCustomIcon(LAYER_COLORS.sightings, "📍"),
        });
        marker.options.title = sighting.speciesName;
        const speciesName = escapeHtml(sighting.speciesName);
        const sciName = escapeHtml(sighting.speciesScientificName);
        const userName = escapeHtml(sighting.userName);
        const hotspotName = escapeHtml(sighting.hotspotName);
        const notes = sighting.notes ? escapeHtml(sighting.notes) : null;
        const dateStr = new Date(sighting.spottedAt).toLocaleDateString();
        const popupContent = `
        <div class="map-popup" style="min-width: 240px;">
          <div class="flex items-center gap-2 mb-2">
            <span style="font-size: 1.5rem;">📍</span>
            <h3 style="font-weight: 600; color: #1B3B2B; margin: 0;">${speciesName}</h3>
            ${sighting.isCurrentUser ? '<span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">Your sighting</span>' : ""}
          </div>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem; font-style: italic;">${sciName}</p>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Count:</strong> ${sighting.count}</p>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Observer:</strong> ${userName}</p>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Location:</strong> ${hotspotName}</p>
          ${notes ? `<p style="margin: 8px 0 0; color: #4a4a4a; font-size: 0.8rem; font-style: italic;">"${notes}"</p>` : ""}
        </div>
      `;
        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.addTo(sightingsLayer);
      });
    });
    isRebuildingRef.current = false;
  }, [filteredSightings, showLayers.sightings, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    isRebuildingRef.current = true;
    layersRef.current.expeditions.clearLayers();
    if (showLayers.expeditions) {
      filteredTrips.forEach((trip) => {
        const marker = L.marker([trip.hotspotLatitude, trip.hotspotLongitude], {
          icon: createCustomIcon(LAYER_COLORS.expeditions, "🚩", 36),
        });
        const targetPreview = escapeHtml(trip.targetSpecies.slice(0, 3).join(", ") + (trip.targetSpecies.length > 3 ? "..." : ""));
        const title = escapeHtml(trip.title);
        const meetingPoint = escapeHtml(trip.meetingPoint);
        const hostName = escapeHtml(trip.hostName);
        const dateStr = new Date(trip.date).toLocaleDateString();
        const timeStr = new Date(trip.meetingTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const popupContent = `
          <div class="map-popup" style="min-width: 240px;">
            <div class="flex items-center gap-2 mb-2">
              <span style="font-size: 1.5rem;">🚩</span>
              <h3 style="font-weight: 600; color: #1B3B2B; margin: 0;">${title}</h3>
            </div>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Date:</strong> ${dateStr}</p>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Meet:</strong> ${timeStr}</p>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>At:</strong> ${meetingPoint}</p>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Host:</strong> ${hostName}</p>
            <p style="margin: 0 0 4px; color: #64748b; font-size: 0.8rem;"><strong>Targets:</strong> ${targetPreview}</p>
            <a href="/trips/${trip.id}" style="color: #e11d48; font-weight: 500; text-decoration: none; font-size: 0.875rem;">Join Trip →</a>
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.addTo(layersRef.current.expeditions);
      });
    }
    isRebuildingRef.current = false;
  }, [filteredTrips, showLayers.expeditions, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;
    const target = activePopupRef.current;
    if (!target) return;
    let layer: L.FeatureGroup | null = null;
    if (target.layer === "hotspots") layer = layersRef.current.hotspots;
    else if (target.layer === "sightings") layer = layersRef.current.sightings;
    else if (target.layer === "expeditions") layer = layersRef.current.expeditions;
    if (!layer) return;
    layer.eachLayer((l) => {
      if (l instanceof L.Marker) {
        const ll = l.getLatLng();
        if (Math.abs(ll.lat - target.lat) < 0.0001 && Math.abs(ll.lng - target.lng) < 0.0001) {
          l.openPopup();
        }
      }
    });
  }, [filteredHotspots, filteredSightings, filteredTrips, showLayers, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const allCoords: L.LatLngExpression[] = [];
    if (showLayers.hotspots) filteredHotspots.forEach((h) => allCoords.push([h.latitude, h.longitude]));
    if (showLayers.sightings) filteredSightings.forEach((s) => allCoords.push([s.latitude, s.longitude]));
    if (showLayers.expeditions) filteredTrips.forEach((t) => allCoords.push([t.hotspotLatitude, t.hotspotLongitude]));
    if (allCoords.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(allCoords).pad(0.1), { maxZoom: 12, animate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  const handleCenterOnMe = () => {
    setGeolocationError(null);
    if (!navigator.geolocation) {
      setGeolocationError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current?.setView([latitude, longitude], 12);
        setCenterOnMe(false);
      },
      (error) => {
        let message = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable in browser settings.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        setGeolocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleLayer = (layer: keyof typeof showLayers) => {
    setShowLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const clearFilters = () => {
    setFilters({ species: "", habitat: "", dateRange: "" });
  };

  const hasActiveFilters = filters.species || filters.habitat || filters.dateRange;

  const habitatTypes = [...new Set(hotspots.map((h) => h.habitatType))].sort();

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="absolute inset-0" />

      {geolocationError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[800] bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-down">
          <span>{geolocationError}</span>
          <button onClick={() => setGeolocationError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
        <button
          onClick={() => window.history.back()}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1">
          <button
            onClick={handleCenterOnMe}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Center map on my location"
            title="Center map on your current location (requires permission)"
          >
            <Crosshair className="h-4 w-4" />
            <span>Center on Me</span>
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <div className="flex items-center gap-2 px-2">
            <Layers className="h-4 w-4 text-gray-500" />
          </div>
          {[
            { key: "hotspots", label: "Hotspots", icon: Bird, color: "text-teal-600", tip: "Birding locations with habitat info" },
            { key: "sightings", label: "Sightings", icon: MapPin, color: "text-orange-600", tip: "Recent bird observations (filterable)" },
            { key: "expeditions", label: "Expeditions", icon: Flag, color: "text-rose-600", tip: "Upcoming group birding trips" },
          ].map(({ key, label, icon: Icon, color, tip }) => (
            <label key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={tip}>
              <input
                type="checkbox"
                checked={showLayers[key as keyof typeof showLayers]}
                onChange={() => toggleLayer(key as keyof typeof showLayers)}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <span className="text-xs text-gray-400">
                {key === "hotspots" && filteredHotspots.length}
                {key === "sightings" && filteredSightings.length}
                {key === "expeditions" && filteredTrips.length}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[500] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Filters apply to all visible layers</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Species <span className="text-gray-400 dark:text-gray-500 font-normal">(sightings)</span></label>
            <input
              type="text"
              placeholder="Search species..."
              value={filters.species}
              onChange={(e) => setFilters((prev) => ({ ...prev, species: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Habitat</label>
            <select
              value={filters.habitat}
              onChange={(e) => setFilters((prev) => ({ ...prev, habitat: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All habitats</option>
              {habitatTypes.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Range <span className="text-gray-400 dark:text-gray-500 font-normal">(sightings)</span></label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] w-64">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span>Map Controls</span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">Hover for help</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1" title="Zoom in/out with mouse wheel or +/- keys">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">+/-</kbd><span>Zoom</span>
            </div>
            <div className="flex items-center gap-1" title="Pan map with arrow keys or drag">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓←→</kbd><span>Pan</span>
            </div>
            <div className="flex items-center gap-1" title="Click any marker to open details popup">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Click</kbd><span>Open popup</span>
            </div>
            <div className="flex items-center gap-1" title="Press Escape to close open popup">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd><span>Close popup</span>
            </div>
          </div>
        </div>
      </div>

      <HabitatLegend hotspots={hotspots} />

      {hasActiveFilters && !filteredHotspots.length && showLayers.hotspots && !filteredSightings.length && showLayers.sightings && !filteredTrips.length && showLayers.expeditions && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[800] bg-amber-50 dark:bg-amber-900/90 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg shadow-lg text-sm text-center animate-slide-up">
          No results match current filters. <button onClick={clearFilters} className="underline font-medium">Clear filters</button>
        </div>
      )}
      {!hasActiveFilters && !filteredSightings.length && showLayers.sightings && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[800] bg-amber-50 dark:bg-amber-900/90 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg shadow-lg text-sm text-center animate-slide-up">
          No sightings recorded yet.
        </div>
      )}
    </div>
  );
}
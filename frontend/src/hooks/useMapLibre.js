// Custom hooks extracted from MapView to reduce component complexity:
//   useMapInstance  — map creation, base style recolor, terrain, boundaries
//   useMapKeyboard  — global keyboard navigation shortcuts
//   useMapMarkers   — marker lifecycle sync (safe DOM construction, no innerHTML)
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { communityColor, categoryGroup } from "@/lib/constants";
import { buildIconSvgElement } from "@/components/TribalIcons";

export const INDIA_VIEW = { center: [82.5, 22.5], zoom: 3.9, pitch: 25, bearing: 0 };
export const WB_VIEW = { center: [87.9, 24.9], zoom: 6.35, pitch: 55, bearing: 8 };
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function applyEarthyRecolor(map) {
  try {
    const layers = map.getStyle().layers || [];
    for (const l of layers) {
      try {
        if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#151008");
        if (l.id.toLowerCase().includes("water") && l.type === "fill")
          map.setPaintProperty(l.id, "fill-color", "#0e262c");
      } catch (err) {
        console.debug(`Map recolor skipped for layer ${l.id}:`, err?.message || err);
      }
    }
  } catch (err) {
    console.warn("Map base-style recolor failed:", err);
  }
}

function addTerrain(map) {
  try {
    map.addSource("terrain-dem", {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 12,
      encoding: "terrarium",
      attribution: "Terrain: Mapzen/AWS",
    });
    map.setTerrain({ source: "terrain-dem", exaggeration: 1.9 });
    map.addLayer({
      id: "hillshade",
      type: "hillshade",
      source: "terrain-dem",
      paint: {
        "hillshade-exaggeration": 0.35,
        "hillshade-shadow-color": "#0b0703",
        "hillshade-highlight-color": "#3d2f1e",
        "hillshade-accent-color": "#241a0e",
      },
    });
  } catch (err) {
    console.warn("3D terrain unavailable:", err);
  }
}

function addBoundaries(map) {
  map.addSource("india-states", { type: "geojson", data: "/geo/india-states-outline.geojson" });
  map.addLayer({
    id: "india-states-line",
    type: "line",
    source: "india-states",
    paint: { "line-color": "#efe3d0", "line-width": 0.6, "line-opacity": 0.14 },
  });

  map.addSource("wb-outline", { type: "geojson", data: "/geo/west-bengal-outline.geojson" });
  map.addLayer({
    id: "wb-fill",
    type: "fill",
    source: "wb-outline",
    paint: { "fill-color": "#d07a3a", "fill-opacity": 0.05 },
  });
  map.addLayer({
    id: "wb-glow",
    type: "line",
    source: "wb-outline",
    paint: { "line-color": "#e08a4e", "line-width": 10, "line-blur": 8, "line-opacity": 0.45 },
  });
  map.addLayer({
    id: "wb-line",
    type: "line",
    source: "wb-outline",
    paint: { "line-color": "#ffb877", "line-width": 1.8, "line-opacity": 0.95 },
  });

  map.addSource("wb-districts", { type: "geojson", data: "/geo/west-bengal-districts.geojson" });
  map.addLayer({
    id: "wb-districts-line",
    type: "line",
    source: "wb-districts",
    minzoom: 6.2,
    paint: { "line-color": "#c89b6c", "line-width": 0.7, "line-opacity": 0.3, "line-dasharray": [2, 2] },
  });
}

export function useMapInstance(containerRef) {
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INDIA_VIEW.center,
      zoom: INDIA_VIEW.zoom,
      pitch: INDIA_VIEW.pitch,
      bearing: INDIA_VIEW.bearing,
      maxPitch: 80,
      attributionControl: { compact: true },
      antialias: true,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-left");
    map.on("error", (e) => console.warn("MapLibre error:", e?.error?.message || e));

    map.on("load", () => {
      applyEarthyRecolor(map);
      addTerrain(map);
      addBoundaries(map);
      setLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef]);

  return { mapRef, loaded };
}

export function useMapKeyboard(mapRef) {
  useEffect(() => {
    const onKey = (e) => {
      const map = mapRef.current;
      if (!map) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;
      if (document.activeElement?.getAttribute?.("contenteditable")) return;
      const w = map.getContainer().clientWidth;
      const h = map.getContainer().clientHeight;
      const small = 120;
      const opts = { duration: 350 };
      switch (e.key) {
        case "ArrowLeft":
          map.panBy([-small, 0], opts);
          break;
        case "ArrowRight":
          map.panBy([small, 0], opts);
          break;
        case "ArrowUp":
          map.panBy([0, -small], opts);
          break;
        case "ArrowDown":
          map.panBy([0, small], opts);
          break;
        case "+":
        case "=":
          map.zoomIn({ duration: 300 });
          break;
        case "-":
        case "_":
          map.zoomOut({ duration: 300 });
          break;
        case "Home":
          map.panBy([-0.75 * w, 0], { duration: 500 });
          break;
        case "End":
          map.panBy([0.75 * w, 0], { duration: 500 });
          break;
        case "PageUp":
          map.panBy([0, -0.75 * h], { duration: 500 });
          break;
        case "PageDown":
          map.panBy([0, 0.75 * h], { duration: 500 });
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapRef]);
}

// Build a marker DOM element safely — textContent only, no HTML injection.
function buildMarkerElement(place, { color, icon, size, idx, selected }) {
  const el = document.createElement("div");
  el.className = "mmm-marker" + (selected ? " selected" : "");
  el.style.setProperty("--halo", color);
  el.setAttribute("data-testid", `map-marker-${place.place.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`);

  const inner = document.createElement("div");
  inner.className = "mmm-marker-inner";
  inner.style.setProperty("--delay", `${Math.min(idx * 45, 900)}ms`);

  const medallion = document.createElement("div");
  medallion.className = "mmm-marker-medallion";
  medallion.style.setProperty("--size", `${size}px`);
  medallion.appendChild(buildIconSvgElement(icon, "#EED9B8"));

  const count = document.createElement("div");
  count.className = "mmm-marker-count";
  count.textContent = String(place.entries.length);

  const label = document.createElement("div");
  label.className = "mmm-marker-label";
  label.textContent = place.block_village || place.place; // DB text rendered safely

  inner.append(medallion, count, label);
  el.appendChild(inner);
  return el;
}

export function useMapMarkers(mapRef, loaded, { places, showMarkers, selectedPlaceKey, onPlaceSelect }) {
  const markersRef = useRef({});

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    const wanted = {};
    if (showMarkers) {
      for (const p of places) wanted[`${p.lat},${p.lng}`] = p;
    }

    // remove stale
    for (const key of Object.keys(markersRef.current)) {
      if (!wanted[key]) {
        markersRef.current[key].marker.remove();
        delete markersRef.current[key];
      }
    }

    // add new / update existing
    Object.entries(wanted).forEach(([key, p], idx) => {
      const dominant = p.entries[0];
      const color = communityColor(dominant?.community || "");
      const icon = categoryGroup(dominant?.category || "").icon;
      const size = Math.min(64, 42 + Math.min(p.entries.length, 11) * 2);

      if (markersRef.current[key]) {
        const el = markersRef.current[key].el;
        const badge = el.querySelector(".mmm-marker-count");
        if (badge) badge.textContent = String(p.entries.length);
        el.classList.toggle("selected", key === selectedPlaceKey);
        return;
      }

      const el = buildMarkerElement(p, { color, icon, size, idx, selected: key === selectedPlaceKey });
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onPlaceSelect(p);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      markersRef.current[key] = { marker, el };
    });

    // selection highlight refresh
    Object.entries(markersRef.current).forEach(([key, { el }]) => {
      el.classList.toggle("selected", key === selectedPlaceKey);
    });
  }, [mapRef, loaded, places, showMarkers, selectedPlaceKey, onPlaceSelect]);

  // full cleanup on unmount
  useEffect(
    () => () => {
      Object.values(markersRef.current).forEach((m) => m.marker.remove());
      markersRef.current = {};
    },
    []
  );
}

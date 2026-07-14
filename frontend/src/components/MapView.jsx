import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { communityColor, categoryGroup } from "@/lib/constants";
import { iconSvgString } from "@/components/TribalIcons";

const INDIA_VIEW = { center: [82.5, 22.5], zoom: 3.9, pitch: 25, bearing: 0 };
const WB_VIEW = { center: [87.9, 24.9], zoom: 6.35, pitch: 55, bearing: 8 };

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const MapView = forwardRef(function MapView(
  { places, showMarkers, onPlaceSelect, selectedPlaceKey, reducedMotion },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const pulseRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
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

    map.on("load", () => {
      // ---- earthy recolor of the base style
      try {
        const layers = map.getStyle().layers || [];
        for (const l of layers) {
          try {
            if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#151008");
            if (l.id.toLowerCase().includes("water") && l.type === "fill")
              map.setPaintProperty(l.id, "fill-color", "#0e262c");
          } catch (_) {}
        }
      } catch (_) {}

      // ---- 3D terrain (AWS terrarium tiles, free)
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
      } catch (e) {
        console.warn("terrain unavailable", e);
      }

      // ---- India states (faint)
      map.addSource("india-states", { type: "geojson", data: "/geo/india-states-outline.geojson" });
      map.addLayer({
        id: "india-states-line",
        type: "line",
        source: "india-states",
        paint: { "line-color": "#efe3d0", "line-width": 0.6, "line-opacity": 0.14 },
      });

      // ---- West Bengal glow outline
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

      // ---- WB district boundaries (visible when zoomed in)
      map.addSource("wb-districts", { type: "geojson", data: "/geo/west-bengal-districts.geojson" });
      map.addLayer({
        id: "wb-districts-line",
        type: "line",
        source: "wb-districts",
        minzoom: 6.2,
        paint: { "line-color": "#c89b6c", "line-width": 0.7, "line-opacity": 0.3, "line-dasharray": [2, 2] },
      });

      setLoaded(true);
    });

    return () => {
      if (pulseRef.current) cancelAnimationFrame(pulseRef.current);
      Object.values(markersRef.current).forEach((m) => m.marker.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- glow pulse animation on WB outline (runs ~9s during cinematic, then settles)
  const startPulse = () => {
    const t0 = performance.now();
    const tick = (t) => {
      const map = mapRef.current;
      if (!map || !map.getLayer("wb-glow")) return;
      const elapsed = t - t0;
      if (elapsed > 9000) {
        try {
          map.setPaintProperty("wb-glow", "line-opacity", 0.45);
        } catch (_) {}
        pulseRef.current = null;
        return; // stop animating — lets the map go idle
      }
      const phase = (elapsed % 3000) / 3000;
      const op = 0.3 + 0.3 * Math.sin(phase * Math.PI * 2);
      try {
        map.setPaintProperty("wb-glow", "line-opacity", op);
      } catch (_) {}
      pulseRef.current = requestAnimationFrame(tick);
    };
    pulseRef.current = requestAnimationFrame(tick);
  };

  // ---- keyboard shortcuts: arrows pan, +/- zoom, Home/End/PgUp/PgDn jump 75%
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
  }, []);

  useImperativeHandle(ref, () => ({
    startCinematic() {
      const map = mapRef.current;
      if (!map) return;
      startPulse();
      if (reducedMotion) {
        map.jumpTo(WB_VIEW);
        return;
      }
      // slow drift on India first, then sweep into West Bengal
      map.easeTo({ center: [84.2, 23.2], zoom: 4.35, pitch: 32, duration: 1600 });
      setTimeout(() => {
        map.flyTo({ ...WB_VIEW, duration: 4600, essential: true, curve: 1.4 });
      }, 1700);
    },
    flyToPlace(place) {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [place.lng, place.lat],
        zoom: Math.max(map.getZoom(), 9.2),
        pitch: 62,
        bearing: -14,
        duration: reducedMotion ? 0 : 2100,
        essential: true,
      });
    },
    resetToWB() {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({ ...WB_VIEW, duration: reducedMotion ? 0 : 2000, essential: true });
    },
    getViewContext() {
      const map = mapRef.current;
      if (!map) return null;
      const b = map.getBounds();
      const visible = places.filter(
        (p) => p.lng >= b.getWest() && p.lng <= b.getEast() && p.lat >= b.getSouth() && p.lat <= b.getNorth()
      );
      const foods = [];
      const comms = new Set();
      const dists = new Set();
      visible.forEach((p) => {
        dists.add(p.place);
        p.entries.slice(0, 3).forEach((e) => {
          if (foods.length < 12) foods.push(`${e.food_name} (${e.community})`);
          comms.add(e.community);
        });
      });
      const c = map.getCenter();
      return {
        center: [c.lng, c.lat],
        zoom: Math.round(map.getZoom() * 10) / 10,
        district: [...dists].slice(0, 3).join(", ") || null,
        visible_foods: foods,
        visible_communities: [...comms].slice(0, 10),
      };
    },
  }));

  // ---- markers sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    const wanted = {};
    if (showMarkers) {
      for (const p of places) {
        wanted[`${p.lat},${p.lng}`] = p;
      }
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
        // update count + selection state in place
        const el = markersRef.current[key].el;
        const badge = el.querySelector(".mmm-marker-count");
        if (badge) badge.textContent = p.entries.length;
        el.classList.toggle("selected", key === selectedPlaceKey);
        return;
      }

      const el = document.createElement("div");
      el.className = "mmm-marker" + (key === selectedPlaceKey ? " selected" : "");
      el.style.setProperty("--halo", color);
      el.setAttribute("data-testid", `map-marker-${p.place.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`);
      el.innerHTML = `
        <div class="mmm-marker-inner" style="--delay:${Math.min(idx * 45, 900)}ms">
          <div class="mmm-marker-medallion" style="--size:${size}px">${iconSvgString(icon, "#EED9B8")}</div>
          <div class="mmm-marker-count">${p.entries.length}</div>
          <div class="mmm-marker-label">${p.block_village || p.place}</div>
        </div>
      `;
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
  }, [places, showMarkers, loaded, selectedPlaceKey, onPlaceSelect]);

  return (
    <div className="mmm-map-container">
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} data-testid="map-canvas" />
      <div className="mmm-map-vignette" />
      <div className="noise-overlay" />
    </div>
  );
});

export default MapView;

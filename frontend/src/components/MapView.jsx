import "maplibre-gl/dist/maplibre-gl.css";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapInstance, useMapKeyboard, useMapMarkers, WB_VIEW } from "@/hooks/useMapLibre";

const MapView = forwardRef(function MapView(
  { places, showMarkers, onPlaceSelect, selectedPlaceKey, reducedMotion },
  ref
) {
  const containerRef = useRef(null);
  const pulseRef = useRef(null);

  const { mapRef, loaded } = useMapInstance(containerRef);
  useMapKeyboard(mapRef);
  useMapMarkers(mapRef, loaded, { places, showMarkers, selectedPlaceKey, onPlaceSelect });

  // cancel any running pulse animation on unmount
  useEffect(
    () => () => {
      if (pulseRef.current) cancelAnimationFrame(pulseRef.current);
    },
    []
  );

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
        } catch (err) {
          console.debug("Pulse settle skipped:", err?.message || err);
        }
        pulseRef.current = null;
        return; // stop animating — lets the map go idle
      }
      const phase = (elapsed % 3000) / 3000;
      const op = 0.3 + 0.3 * Math.sin(phase * Math.PI * 2);
      try {
        map.setPaintProperty("wb-glow", "line-opacity", op);
      } catch (err) {
        console.debug("Pulse frame skipped:", err?.message || err);
      }
      pulseRef.current = requestAnimationFrame(tick);
    };
    pulseRef.current = requestAnimationFrame(tick);
  };

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

  return (
    <div className="mmm-map-container">
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} data-testid="map-canvas" />
      <div className="mmm-map-vignette" />
      <div className="noise-overlay" />
    </div>
  );
});

export default MapView;

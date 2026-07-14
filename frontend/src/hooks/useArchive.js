// Custom hooks extracted from App.js to reduce component complexity:
//   useArchiveData      — loads all archive collections from the backend
//   useArchiveFilters   — filter state + derived filtered places/counts
//   useResponsiveLayout — window width, user-selectable layout, reduced motion
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchPlaces,
  fetchEntries,
  fetchCommunities,
  fetchLayerGuide,
  fetchCrossReference,
  fetchStats,
} from "@/lib/api";
import { categoryGroup } from "@/lib/constants";

export function useArchiveData() {
  const [places, setPlaces] = useState([]);
  const [entriesById, setEntriesById] = useState({});
  const [communities, setCommunities] = useState([]);
  const [layerGuide, setLayerGuide] = useState([]);
  const [xrefs, setXrefs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([fetchPlaces(), fetchEntries(), fetchCommunities(), fetchLayerGuide(), fetchCrossReference(), fetchStats()])
      .then(([pl, en, co, lg, xr, st]) => {
        setPlaces(pl);
        const byId = {};
        en.forEach((e) => {
          byId[e.entry_id] = e;
        });
        setEntriesById(byId);
        setCommunities(co);
        setLayerGuide(lg);
        setXrefs(xr);
        setStats(st);
      })
      .catch((err) => {
        console.error("Archive data load failed:", err);
        toast.error("Could not load the archive. Please refresh.");
      });
  }, []);

  return { places, entriesById, communities, layerGuide, xrefs, stats };
}

export function useArchiveFilters(places) {
  const [filters, setFilters] = useState({
    communities: new Set(),
    district: null,
    category: null,
    q: "",
    trail: null,
  });

  const entryMatches = useCallback(
    (e) => {
      if (filters.trail && !filters.trail.ids.has(e.entry_id)) return false;
      if (filters.communities.size > 0) {
        const eLower = e.community.toLowerCase();
        let hit = false;
        for (const c of filters.communities) {
          if (eLower.includes(c.toLowerCase().split(" ")[0].replace(/[^a-z]/gi, ""))) {
            hit = true;
            break;
          }
        }
        if (!hit) return false;
      }
      if (filters.district && !e.district.toLowerCase().includes(filters.district.toLowerCase())) return false;
      if (filters.category && categoryGroup(e.category).group !== filters.category) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const hay = `${e.food_name} ${e.local_name} ${e.community} ${e.district} ${e.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    },
    [filters]
  );

  const filteredPlaces = useMemo(
    () =>
      places
        .map((p) => ({ ...p, entries: p.entries.filter(entryMatches) }))
        .filter((p) => p.entries.length > 0),
    [places, entryMatches]
  );

  const visibleCount = useMemo(
    () => filteredPlaces.reduce((acc, p) => acc + p.entries.length, 0),
    [filteredPlaces]
  );

  return { filters, setFilters, filteredPlaces, visibleCount };
}

export function useResponsiveLayout() {
  const [viewMode, setViewMode] = useState("auto"); // auto | desktop | mobile
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = viewMode === "mobile" || (viewMode === "auto" && winW < 768);
  const toggleViewMode = useCallback(() => setViewMode(isMobile ? "desktop" : "mobile"), [isMobile]);

  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  return { isMobile, toggleViewMode, reducedMotion };
}

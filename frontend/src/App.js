import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import MapView from "@/components/MapView";
import IntroOverlay from "@/components/IntroOverlay";
import TopBar from "@/components/TopBar";
import FilterPanel from "@/components/FilterPanel";
import PlaceCard from "@/components/PlaceCard";
import DetailDrawer from "@/components/DetailDrawer";
import TourOverlay from "@/components/TourOverlay";
import SnapshotDialog from "@/components/SnapshotDialog";
import MusicPlayer from "@/components/MusicPlayer";

import {
  fetchPlaces,
  fetchEntries,
  fetchCommunities,
  fetchLayerGuide,
  fetchCrossReference,
  fetchStats,
} from "@/lib/api";
import { categoryGroup } from "@/lib/constants";

export default function App() {
  const mapRef = useRef(null);
  const musicRef = useRef(null);

  const [lang, setLang] = useState("en");
  const [intro, setIntro] = useState(true);
  const [showMarkers, setShowMarkers] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [places, setPlaces] = useState([]);
  const [entriesById, setEntriesById] = useState({});
  const [communities, setCommunities] = useState([]);
  const [layerGuide, setLayerGuide] = useState([]);
  const [xrefs, setXrefs] = useState([]);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    communities: new Set(),
    district: null,
    category: null,
    q: "",
    trail: null,
  });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [tourEntry, setTourEntry] = useState(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [viewContext, setViewContext] = useState(null);

  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  // ---- data load
  useEffect(() => {
    Promise.all([fetchPlaces(), fetchEntries(), fetchCommunities(), fetchLayerGuide(), fetchCrossReference(), fetchStats()])
      .then(([pl, en, co, lg, xr, st]) => {
        setPlaces(pl);
        const map = {};
        en.forEach((e) => (map[e.entry_id] = e));
        setEntriesById(map);
        setCommunities(co);
        setLayerGuide(lg);
        setXrefs(xr);
        setStats(st);
      })
      .catch(() => toast.error("Could not load the archive. Please refresh."));
  }, []);

  // ---- filtering
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

  const filteredPlaces = useMemo(() => {
    return places
      .map((p) => ({ ...p, entries: p.entries.filter(entryMatches) }))
      .filter((p) => p.entries.length > 0);
  }, [places, entryMatches]);

  const visibleCount = useMemo(
    () => filteredPlaces.reduce((acc, p) => acc + p.entries.length, 0),
    [filteredPlaces]
  );

  // ---- handlers
  const handleBegin = () => {
    setIntro(false);
    musicRef.current?.start();
    mapRef.current?.startCinematic();
    setTimeout(() => {
      setShowMarkers(true);
      setFiltersOpen(window.innerWidth > 900);
    }, reducedMotion ? 300 : 4200);
  };

  const handlePlaceSelect = useCallback((place) => {
    setSelectedPlace(place);
    setSelectedEntry(null);
    mapRef.current?.flyToPlace(place);
    const domComm = place.entries?.[0]?.community;
    if (domComm) musicRef.current?.playForCommunity(domComm);
  }, []);

  const handleEntryOpen = (entryId) => {
    const e = entriesById[entryId];
    if (!e) return;
    setSelectedEntry(e);
    musicRef.current?.playForCommunity(e.community);
  };

  const handleStartTour = (entry) => {
    setTourEntry(entry);
  };

  const handleSnapshot = () => {
    const ctx = mapRef.current?.getViewContext();
    setViewContext(ctx);
    setSnapshotOpen(true);
  };

  const handleDuck = useCallback((on) => {
    musicRef.current?.duck(on);
  }, []);

  const selectedPlaceKey = selectedPlace ? `${selectedPlace.lat},${selectedPlace.lng}` : null;

  return (
    <div className="mmm-app" lang={lang}>
      <MapView
        ref={mapRef}
        places={filteredPlaces}
        showMarkers={showMarkers}
        onPlaceSelect={handlePlaceSelect}
        selectedPlaceKey={selectedPlaceKey}
        reducedMotion={reducedMotion}
      />

      {!intro && (
        <TopBar
          lang={lang}
          setLang={setLang}
          q={filters.q}
          setQ={(q) => setFilters((f) => ({ ...f, q }))}
          onSnapshot={handleSnapshot}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          snapshotBusy={false}
        />
      )}

      {!intro && (
        <FilterPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          lang={lang}
          communities={communities}
          districts={[
            "Alipurduar",
            "Jalpaiguri",
            "Darjeeling",
            "Cooch Behar",
            "Jhargram",
            "Paschim Medinipur",
            "Purulia",
            "Bankura",
            "Birbhum",
            "North 24 Paraganas",
          ]}
          xrefs={xrefs}
          layerGuide={layerGuide}
          filters={filters}
          setFilters={setFilters}
          visibleCount={visibleCount}
          totalCount={stats?.entries ?? 100}
        />
      )}

      {!intro && filters.trail && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 mmm-panel px-4 py-2 flex items-center gap-3 fade-in-up" data-testid="trail-banner">
          <span className="text-[12px] text-[#e3b448]">◈ {filters.trail.theme}</span>
          <button
            onClick={() => setFilters((f) => ({ ...f, trail: null }))}
            data-testid="clear-trail-button"
            className="text-[11px] text-[#a08a68] hover:text-[#f2ece1] transition-colors duration-200 underline"
          >
            ✕
          </button>
        </div>
      )}

      <PlaceCard
        place={selectedPlace}
        lang={lang}
        onClose={() => setSelectedPlace(null)}
        onEntryOpen={handleEntryOpen}
      />

      {selectedEntry && (
        <DetailDrawer
          entry={selectedEntry}
          lang={lang}
          onClose={() => setSelectedEntry(null)}
          onStartTour={handleStartTour}
        />
      )}

      {tourEntry && (
        <TourOverlay
          entry={tourEntry}
          lang={lang}
          onClose={() => setTourEntry(null)}
          onDuck={handleDuck}
        />
      )}

      <SnapshotDialog
        open={snapshotOpen}
        onOpenChange={setSnapshotOpen}
        viewContext={viewContext}
        lang={lang}
        onDuck={handleDuck}
      />

      <MusicPlayer ref={musicRef} lang={lang} />

      <IntroOverlay open={intro} onBegin={handleBegin} stats={stats} lang={lang} setLang={setLang} />

      <Toaster position="top-center" richColors />
    </div>
  );
}

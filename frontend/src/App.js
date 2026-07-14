import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import MapView from "@/components/MapView";
import LoadingScreen from "@/components/LoadingScreen";
import IntroOverlay from "@/components/IntroOverlay";
import TopBar from "@/components/TopBar";
import FilterPanel from "@/components/FilterPanel";
import PlaceCard from "@/components/PlaceCard";
import DetailDrawer from "@/components/DetailDrawer";
import TourOverlay from "@/components/TourOverlay";
import SnapshotDialog from "@/components/SnapshotDialog";
import MusicPlayer from "@/components/MusicPlayer";
import HelpDialog from "@/components/HelpDialog";
import AboutDialog from "@/components/AboutDialog";

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
  const [stage, setStage] = useState("loading"); // loading | intro | map
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [viewContext, setViewContext] = useState(null);

  // ---- responsive + user-selectable layout ----
  const [viewMode, setViewMode] = useState("auto"); // auto | desktop | mobile
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = viewMode === "mobile" || (viewMode === "auto" && winW < 768);
  const toggleViewMode = () => setViewMode(isMobile ? "desktop" : "mobile");

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
    setStage("map");
    musicRef.current?.start();
    mapRef.current?.startCinematic();
    setTimeout(() => {
      setShowMarkers(true);
      setFiltersOpen(!isMobile);
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

  const handleHome = () => {
    setSelectedPlace(null);
    setSelectedEntry(null);
    mapRef.current?.resetToWB();
  };

  const handleDuck = useCallback((on) => {
    musicRef.current?.duck(on);
  }, []);

  const selectedPlaceKey = selectedPlace ? `${selectedPlace.lat},${selectedPlace.lng}` : null;

  return (
    <div className={`mmm-app ${isMobile ? "mmm-mobile" : ""}`} lang={lang}>
      <MapView
        ref={mapRef}
        places={filteredPlaces}
        showMarkers={showMarkers}
        onPlaceSelect={handlePlaceSelect}
        selectedPlaceKey={selectedPlaceKey}
        reducedMotion={reducedMotion}
      />

      {stage === "map" && (
        <TopBar
          lang={lang}
          setLang={setLang}
          q={filters.q}
          setQ={(q) => setFilters((f) => ({ ...f, q }))}
          onSnapshot={handleSnapshot}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          onHelp={() => setHelpOpen(true)}
          onAbout={() => setAboutOpen(true)}
          onHome={handleHome}
          snapshotBusy={false}
          viewMode={isMobile ? "mobile" : "desktop"}
          onToggleViewMode={toggleViewMode}
          isMobile={isMobile}
        />
      )}

      {stage === "map" && (
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
          isMobile={isMobile}
        />
      )}

      {stage === "map" && filters.trail && (
        <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-20 mmm-panel px-5 py-2.5 flex items-center gap-3 fade-in-up" data-testid="trail-banner">
          <span className="text-[14px] font-semibold text-[#e3b448]">◈ {filters.trail.theme}</span>
          <button
            onClick={() => setFilters((f) => ({ ...f, trail: null }))}
            data-testid="clear-trail-button"
            className="text-[13px] text-[#a08a68] hover:text-[#f2ece1] transition-colors duration-200 underline"
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
        isMobile={isMobile}
      />

      {selectedEntry && (
        <DetailDrawer
          entry={selectedEntry}
          lang={lang}
          onClose={() => {
            setSelectedEntry(null);
            setSelectedPlace(null);
          }}
          onBack={() => setSelectedEntry(null)}
          onStartTour={handleStartTour}
          isMobile={isMobile}
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

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} lang={lang} />
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

      <MusicPlayer ref={musicRef} lang={lang} />

      {stage === "loading" && <LoadingScreen lang={lang} onDone={() => setStage("intro")} duration={7500} />}

      <IntroOverlay open={stage === "intro"} onBegin={handleBegin} stats={stats} lang={lang} setLang={setLang} />

      <Toaster position="top-center" richColors />
    </div>
  );
}

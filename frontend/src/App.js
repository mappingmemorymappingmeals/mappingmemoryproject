import React, { useCallback, useRef, useState } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";

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

import { useArchiveData, useArchiveFilters, useResponsiveLayout } from "@/hooks/useArchive";

const WB_DISTRICTS = [
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
];

export default function App() {
  const mapRef = useRef(null);
  const musicRef = useRef(null);

  const [lang, setLang] = useState("en");
  const [stage, setStage] = useState("loading"); // loading | intro | map
  const [showMarkers, setShowMarkers] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { places, entriesById, communities, layerGuide, xrefs, stats } = useArchiveData();
  const { filters, setFilters, filteredPlaces, visibleCount } = useArchiveFilters(places);
  const { isMobile, toggleViewMode, reducedMotion } = useResponsiveLayout();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [tourEntry, setTourEntry] = useState(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [viewContext, setViewContext] = useState(null);

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
          districts={WB_DISTRICTS}
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

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TribalIcon } from "@/components/TribalIcons";
import { LABELS } from "@/lib/constants";
import { Search, Info, PanelLeft, HelpCircle, Home, Monitor, Smartphone } from "lucide-react";

export default function TopBar({
  lang,
  setLang,
  q,
  setQ,
  onSnapshot,
  onToggleFilters,
  onHelp,
  onAbout,
  onHome,
  snapshotBusy,
  viewMode,
  onToggleViewMode,
  isMobile,
}) {
  const L = LABELS[lang];

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-3 pointer-events-none flex-wrap">
      {/* Filters toggle + brand */}
      <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
        <button
          onClick={onToggleFilters}
          data-testid="filters-open-button"
          className="mmm-panel flex items-center justify-center w-11 h-11 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
          aria-label="Toggle filters"
        >
          <PanelLeft size={20} color="#d3a273" />
        </button>
        <button
          onClick={onHome}
          data-testid="home-view-button"
          title={L.home}
          className="mmm-panel flex items-center justify-center w-11 h-11 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
          aria-label={L.home}
        >
          <Home size={19} color="#d3a273" />
        </button>
        {!isMobile && (
          <div className="mmm-panel hidden lg:flex items-center gap-3 px-5 py-2 rounded-xl">
            <TribalIcon name="spiral" size={26} color="#d07a3a" />
            <div className="leading-tight">
              <p className="text-[18px] font-bold text-[#f2ece1]" style={{ fontFamily: "var(--font-display)" }}>
                {L.title}
              </p>
              <p className="font-mono text-[12.5px] uppercase tracking-[0.25em] text-[#a08a68]">
                Deep Map · West Bengal
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="pointer-events-auto relative w-36 sm:w-56 md:w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08a68]" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={L.searchPh}
          data-testid="filters-search-input"
          className="pl-10 h-11 rounded-xl bg-[hsl(28_22%_10%)] border-[hsl(26_14%_22%)] text-[17px] text-[#f2ece1] placeholder:text-[#7a6b55] focus-visible:ring-[#d07a3a]"
        />
      </div>

      {/* Language */}
      <div className="pointer-events-auto mmm-panel flex items-center rounded-xl overflow-hidden" data-testid="language-toggle">
        {["en", "bn", "hi"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            data-testid={`language-toggle-${l}`}
            className={`px-3 md:px-4 h-11 text-[17px] transition-colors duration-200 ${
              lang === l ? "bg-[#d07a3a] text-[#1a120a] font-bold" : "text-[#cfc4ae] hover:bg-[hsl(26_14%_16%)]"
            }`}
          >
            {l === "en" ? "EN" : l === "bn" ? "বাং" : "हिं"}
          </button>
        ))}
      </div>

      {/* Snapshot */}
      <Button
        onClick={onSnapshot}
        disabled={snapshotBusy}
        data-testid="snapshot-button"
        className="pointer-events-auto h-11 rounded-xl bg-[#2f6b4f] hover:bg-[#3a8161] text-[#f2ece1] gap-2 px-3 md:px-5 text-[17px] font-semibold transition-colors duration-200"
      >
        <TribalIcon name="camera" size={19} color="#f2ece1" />
        <span className="hidden sm:inline">{L.snapshot}</span>
      </Button>

      {/* Help */}
      <button
        onClick={onHelp}
        data-testid="help-button"
        title={L.help}
        className="pointer-events-auto mmm-panel flex items-center justify-center w-11 h-11 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
        aria-label={L.help}
      >
        <HelpCircle size={19} color="#d3a273" />
      </button>

      {/* About */}
      <button
        onClick={onAbout}
        data-testid="about-button"
        title={L.about}
        className="pointer-events-auto mmm-panel flex items-center justify-center w-11 h-11 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
        aria-label={L.about}
      >
        <Info size={19} color="#d3a273" />
      </button>

      {/* View mode toggle */}
      <button
        onClick={onToggleViewMode}
        data-testid="view-mode-toggle"
        title={viewMode === "mobile" ? L.desktopView : L.mobileView}
        className="pointer-events-auto mmm-panel flex items-center justify-center w-11 h-11 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
        aria-label={L.viewMode}
      >
        {viewMode === "mobile" ? <Monitor size={19} color="#e3b448" /> : <Smartphone size={19} color="#d3a273" />}
      </button>
    </div>
  );
}

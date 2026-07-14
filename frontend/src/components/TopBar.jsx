import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS } from "@/lib/constants";
import { Search, Info, PanelLeft } from "lucide-react";

export default function TopBar({ lang, setLang, q, setQ, onSnapshot, onToggleFilters, snapshotBusy }) {
  const L = LABELS[lang];
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-3 pointer-events-none">
        {/* Filters toggle + brand */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <button
            onClick={onToggleFilters}
            data-testid="filters-open-button"
            className="mmm-panel flex items-center justify-center w-10 h-10 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
            aria-label="Toggle filters"
          >
            <PanelLeft size={17} color="#d3a273" />
          </button>
          <div className="mmm-panel hidden md:flex items-center gap-3 px-4 py-2 rounded-xl">
            <TribalIcon name="spiral" size={20} color="#d07a3a" />
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-[#f2ece1]" style={{ fontFamily: "var(--font-display)" }}>
                {L.title}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#a08a68]">
                Deep Map · West Bengal
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="pointer-events-auto relative w-40 sm:w-56 md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08a68]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L.searchPh}
            data-testid="filters-search-input"
            className="pl-9 h-10 rounded-xl bg-[hsl(28_22%_10%)] border-[hsl(26_14%_22%)] text-sm text-[#f2ece1] placeholder:text-[#7a6b55] focus-visible:ring-[#d07a3a]"
          />
        </div>

        {/* Language */}
        <div className="pointer-events-auto mmm-panel flex items-center rounded-xl overflow-hidden" data-testid="language-toggle">
          {["en", "bn", "hi"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              data-testid={`language-toggle-${l}`}
              className={`px-2.5 md:px-3 h-10 text-[13px] transition-colors duration-200 ${
                lang === l ? "bg-[#d07a3a] text-[#1a120a] font-semibold" : "text-[#cfc4ae] hover:bg-[hsl(26_14%_16%)]"
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
          className="pointer-events-auto h-10 rounded-xl bg-[#2f6b4f] hover:bg-[#3a8161] text-[#f2ece1] gap-2 px-3 md:px-4 transition-colors duration-200"
        >
          <TribalIcon name="camera" size={16} color="#f2ece1" />
          <span className="hidden sm:inline text-sm">{L.snapshot}</span>
        </Button>

        {/* About */}
        <button
          onClick={() => setAboutOpen(true)}
          data-testid="about-button"
          className="pointer-events-auto mmm-panel flex items-center justify-center w-10 h-10 rounded-xl hover:border-[#d07a3a] transition-colors duration-200"
          aria-label="About"
        >
          <Info size={16} color="#d3a273" />
        </button>
      </div>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="mmm-panel border-[hsl(26_14%_22%)] max-w-lg" data-testid="about-dialog">
          <DialogHeader>
            <DialogTitle className="text-[#f2ece1]" style={{ fontFamily: "var(--font-display)" }}>
              {L.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-[#cfc4ae] text-sm space-y-3 pt-2">
                <p>
                  A deep-mapping archive of West Bengal's indigenous tribal food heritage — 100 food traditions across
                  16 communities documented in 14 knowledge layers: ecology, community, ethnobotany, culinary
                  technology, temporality, folklore, lost traditions, sacred foods, medicine, cultural significance and
                  historical origins.
                </p>
                <p>
                  Sources: “Mapping Memory, Mapping Meals” research database — 27 academic papers + field documents.
                  AI narration by Gemini. Voices via your browser's speech engine (EN · বাংলা · हिन्दी).
                </p>
                <p className="font-mono text-[11px] text-[#a08a68]">
                  Music: IGRMS West Bengal field recordings (CC BY-NC) &amp; CC0 tribal percussion · archive.org
                  <br />
                  Map © CARTO · OpenStreetMap contributors · Terrain: Mapzen/AWS
                </p>
                <WarliStrip count={6} />
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

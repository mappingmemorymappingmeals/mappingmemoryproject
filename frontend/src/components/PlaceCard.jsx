import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TribalIcon } from "@/components/TribalIcons";
import { LABELS, communityColor, categoryGroup } from "@/lib/constants";
import { X, ChevronRight } from "lucide-react";

export default function PlaceCard({ place, lang, onClose, onEntryOpen }) {
  const L = LABELS[lang];
  return (
    <AnimatePresence>
      {place && (
        <div className="absolute bottom-24 z-20 w-[92vw] max-w-[400px] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6">
        <motion.div
          key={`${place.lat},${place.lng}`}
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 26, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mmm-panel mmm-panel-carved"
          style={{ boxShadow: "var(--shadow-2), 0 0 60px rgba(208,122,58,0.12)" }}
          data-testid="map-marker-popup"
        >
          {/* 3D top ridge */}
          <div
            className="h-1.5 rounded-t-[18px]"
            style={{ background: `linear-gradient(90deg, ${communityColor(place.entries[0]?.community)}, transparent)` }}
          />
          <div className="flex items-start justify-between px-5 pt-3 pb-2">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#a08a68]">
                {place.geo_note || "Heritage Site"}
              </p>
              <h3 className="text-[17px] font-semibold text-[#f2ece1] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {place.block_village || place.place}
              </h3>
              <p className="text-[12px] text-[#c9bda6]">
                {place.place} · <span className="font-mono text-[10.5px]">{place.lat.toFixed(3)}°N {place.lng.toFixed(3)}°E</span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close popup"
              data-testid="map-marker-popup-close"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(26_14%_16%)] transition-colors duration-200"
            >
              <X size={15} color="#a08a68" />
            </button>
          </div>

          <p className="px-5 text-[11px] font-mono text-[#e3b448]">
            {place.entries.length} {L.placeEntries}
          </p>

          <ScrollArea className="max-h-[34vh] px-3 py-2">
            <div className="space-y-1">
              {place.entries.map((e) => {
                const col = communityColor(e.community);
                const icon = categoryGroup(e.category).icon;
                return (
                  <button
                    key={e.entry_id}
                    onClick={() => onEntryOpen(e.entry_id)}
                    data-testid={`popup-entry-${e.entry_id}`}
                    className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-[hsl(26_16%_14%)] transition-colors duration-200 group"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border"
                      style={{ borderColor: col, background: "hsl(26 20% 12%)" }}
                    >
                      <TribalIcon name={icon} size={16} color={col} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#f2ece1] truncate">{e.food_name}</p>
                      <p className="text-[10.5px] text-[#a08a68] truncate">
                        <span style={{ color: col }}>{e.community}</span>
                        {e.pvtg_status?.toLowerCase().startsWith("yes") && <span className="ml-1 text-[#e3b448]">✦ {L.pvtg}</span>}
                        {" · "}{e.category}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[#7a6b55] group-hover:text-[#d07a3a] transition-colors duration-200 shrink-0" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="px-5 pb-3 pt-1">
            <p className="text-[10px] text-[#7a6b55]">{L.openDetail} →</p>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TribalIcon } from "@/components/TribalIcons";
import { LABELS, communityColor, categoryGroup } from "@/lib/constants";
import { X, ChevronRight } from "lucide-react";

export default function PlaceCard({ place, lang, onClose, onEntryOpen, isMobile }) {
  const L = LABELS[lang];
  return (
    <AnimatePresence>
      {place && (
        <div
          className={`absolute z-20 ${
            isMobile
              ? "bottom-24 left-1/2 -translate-x-1/2 w-[94vw] max-w-[440px]"
              : "bottom-24 right-6 w-[92vw] max-w-[440px]"
          }`}
        >
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
              className="h-2 rounded-t-[18px]"
              style={{ background: `linear-gradient(90deg, ${communityColor(place.entries[0]?.community)}, transparent)` }}
            />
            <div className="flex items-start justify-between px-6 pt-3.5 pb-2">
              <div>
                <p className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#a08a68]">
                  {place.geo_note || "Heritage Site"}
                </p>
                <h3 className="text-[23px] font-bold text-[#f2ece1] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {place.block_village || place.place}
                </h3>
                <p className="text-[16px] text-[#c9bda6]">
                  {place.place} · <span className="font-mono text-[14px]">{place.lat.toFixed(3)}°N {place.lng.toFixed(3)}°E</span>
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close popup"
                data-testid="map-marker-popup-close"
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[hsl(26_14%_16%)] transition-colors duration-200"
              >
                <X size={18} color="#a08a68" />
              </button>
            </div>

            <p className="px-6 text-[15px] font-mono text-[#e3b448] font-semibold">
              {place.entries.length} {L.placeEntries}
            </p>

            <div className="px-3.5 py-2.5 overflow-y-auto" style={{ maxHeight: "36vh" }}>
              <div className="space-y-1.5">
                {place.entries.map((e) => {
                  const col = communityColor(e.community);
                  const icon = categoryGroup(e.category).icon;
                  return (
                    <button
                      key={e.entry_id}
                      onClick={() => onEntryOpen(e.entry_id)}
                      data-testid={`popup-entry-${e.entry_id}`}
                      className="w-full flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-left hover:bg-[hsl(26_16%_14%)] transition-colors duration-200 group"
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2"
                        style={{ borderColor: col, background: "hsl(26 20% 12%)" }}
                      >
                        <TribalIcon name={icon} size={20} color={col} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[17.5px] font-semibold text-[#f2ece1] truncate">{e.food_name}</p>
                        <p className="text-[14.5px] text-[#a08a68] truncate">
                          <span style={{ color: col, fontWeight: 600 }}>{e.community}</span>
                          {e.pvtg_status?.toLowerCase().startsWith("yes") && <span className="ml-1 text-[#e3b448]">✦ {L.pvtg}</span>}
                          {" · "}{e.category}
                        </p>
                      </div>
                      <ChevronRight size={17} className="text-[#7a6b55] group-hover:text-[#d07a3a] transition-colors duration-200 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-6 pb-3.5 pt-1">
              <p className="text-[14px] text-[#7a6b55]">{L.openDetail} →</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

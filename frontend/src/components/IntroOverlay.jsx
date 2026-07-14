import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WarliStrip, TribalIcon } from "@/components/TribalIcons";
import { LABELS, TOUR_BG } from "@/lib/constants";

export default function IntroOverlay({ open, onBegin, stats, lang, setLang }) {
  const L = LABELS[lang];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(12, 8, 4, 0.72)" }}
          data-testid="intro-overlay"
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `url(${TOUR_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.35) saturate(0.85)",
            }}
          />
          <div
            className="absolute inset-0 -z-[5]"
            style={{
              background:
                "radial-gradient(1200px circle at 20% 10%, rgba(198,90,58,.25), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(46,111,122,.2), transparent 60%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } }}
            className="relative max-w-3xl mx-4 px-8 py-12 md:px-14 md:py-14 text-center mmm-panel mmm-panel-carved"
          >
            <div className="flex justify-center mb-6">
              <WarliStrip count={7} size={20} />
            </div>

            <p className="font-mono text-[13.5px] uppercase tracking-[0.3em] text-[#c89b6c] mb-4">
              West Bengal · Indigenous Knowledge System
            </p>

            <h1 className="intro-title-glow text-4xl md:text-6xl font-bold text-[#f2ece1] leading-tight mb-4">
              {L.title}
            </h1>

            <p className="text-base md:text-lg text-[#cfc4ae] mb-2">{L.subtitle}</p>
            <p className="text-sm text-[#a89a80] max-w-xl mx-auto mb-8">{L.tagline}</p>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-9 font-mono text-[15px] text-[#d3a273]">
              <span className="flex items-center gap-2">
                <TribalIcon name="bowl" size={16} color="#e3b448" /> {stats?.entries ?? 100} {L.entries}
              </span>
              <span className="flex items-center gap-2">
                <TribalIcon name="community" size={16} color="#e3b448" /> {stats?.communities ?? "7+"} {L.communities}
              </span>
              <span className="flex items-center gap-2">
                <TribalIcon name="pin" size={16} color="#e3b448" /> {stats?.districts ?? 10} {L.districts}
              </span>
              <span className="flex items-center gap-2">
                <TribalIcon name="weave" size={16} color="#e3b448" /> {stats?.layers ?? 14} {L.layersWord}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 mb-7">
              {["en", "bn", "hi"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  data-testid={`intro-lang-${l}`}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors duration-200 ${
                    lang === l
                      ? "bg-[#d07a3a] border-[#d07a3a] text-[#1a120a] font-semibold"
                      : "border-[#4a3a28] text-[#cfc4ae] hover:border-[#d07a3a]"
                  }`}
                >
                  {l === "en" ? "English" : l === "bn" ? "বাংলা" : "हिन्दी"}
                </button>
              ))}
            </div>

            <div className="inline-block">
              <Button
                onClick={onBegin}
                data-testid="begin-journey-button"
                className="pulse-glow bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a] font-semibold text-base px-10 py-6 rounded-full shadow-[0_10px_40px_rgba(208,122,58,0.4)] transition-colors duration-200"
              >
                {L.begin} →
              </Button>
            </div>

            <div className="flex justify-center mt-8">
              <WarliStrip count={7} size={20} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

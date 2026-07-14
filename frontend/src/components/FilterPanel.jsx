import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS, communityColor, CATEGORY_GROUPS, LAYER_META } from "@/lib/constants";
import { X } from "lucide-react";

const GROUP_ICONS = {
  "Ferments & Beverages": "pot",
  "Pithas & Breads": "pitha",
  "Grains & Rice": "grain",
  "Wild Tubers & Roots": "root",
  "Wild Fungi": "mushroom",
  "Forest Vegetables": "leaf",
  "Fish & Waterfoods": "fish",
  "Meat & Forest Protein": "flame",
  "Insects & Rare Proteins": "ant",
  "Wild Fruits": "fruit",
  "Food as Medicine": "herb",
  "Ritual & Festive": "altar",
  "Traditional Dishes": "bowl",
};

function SectionTrigger({ icon, label }) {
  return (
    <AccordionTrigger className="text-[17.5px] font-semibold text-[#e8dcc5] hover:no-underline py-3.5">
      <span className="flex items-center gap-2">
        <TribalIcon name={icon} size={15} color="#d3a273" /> {label}
      </span>
    </AccordionTrigger>
  );
}

function CommunityChips({ communities, filters, toggleCommunity }) {
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {communities.map((c) => {
          const short = c.community.split("(")[0].trim();
          const active = filters.communities.has(short);
          const col = communityColor(short);
          return (
            <button
              key={c.community}
              onClick={() => toggleCommunity(short)}
              data-testid={`filters-community-chip-${short.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}
              className="rounded-full px-2.5 py-1 text-[15.5px] border transition-colors duration-200"
              style={{
                borderColor: active ? col : "hsl(26 14% 24%)",
                background: active ? col : "transparent",
                color: active ? "#14100b" : "#cfc4ae",
                fontWeight: active ? 600 : 400,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: active ? "#14100b" : col }}
              />
              {short}
              {c.pvtg?.toLowerCase().startsWith("yes") && <span className="ml-1 opacity-70">✦</span>}
            </button>
          );
        })}
      </div>
      <p className="font-mono text-[12px] text-[#7a6b55] mt-2">✦ = PVTG (Particularly Vulnerable Tribal Group)</p>
    </>
  );
}

function DistrictChips({ districts, filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {districts.map((d) => {
        const active = filters.district === d;
        return (
          <button
            key={d}
            onClick={() => setFilters((f) => ({ ...f, district: active ? null : d }))}
            data-testid={`filters-district-${d.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
            className={`rounded-full px-2.5 py-1 text-[15.5px] border transition-colors duration-200 ${
              active
                ? "bg-[#2e6f7a] border-[#2e6f7a] text-[#f2ece1] font-semibold"
                : "border-[hsl(26_14%_24%)] text-[#cfc4ae] hover:border-[#2e6f7a]"
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function CategoryList({ filters, setFilters }) {
  return (
    <div className="space-y-1">
      {CATEGORY_GROUPS.map((g) => {
        const active = filters.category === g;
        return (
          <button
            key={g}
            onClick={() => setFilters((f) => ({ ...f, category: active ? null : g }))}
            data-testid={`filters-category-${g.replace(/[^a-zA-Z]+/g, "-").toLowerCase()}`}
            className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[14.5px] border transition-colors duration-200 ${
              active
                ? "bg-[#d07a3a] border-[#d07a3a] text-[#1a120a] font-semibold"
                : "border-transparent text-[#cfc4ae] hover:bg-[hsl(26_14%_15%)]"
            }`}
          >
            <TribalIcon name={GROUP_ICONS[g]} size={15} color={active ? "#1a120a" : "#c89b6c"} />
            {g}
          </button>
        );
      })}
    </div>
  );
}

function TrailList({ xrefs, filters, setFilters }) {
  return (
    <div className="space-y-1.5">
      {xrefs
        .filter((x) => x.entry_ids?.length)
        .map((x) => {
          const active = filters.trail?.theme === x.theme;
          return (
            <button
              key={x.theme}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  trail: active ? null : { theme: x.theme, ids: new Set(x.entry_ids) },
                }))
              }
              data-testid={`filters-trail-${x.theme.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`}
              className={`w-full text-left rounded-lg px-3 py-2 border text-[14px] leading-snug transition-colors duration-200 ${
                active
                  ? "bg-[#3d3016] border-[#e3b448] text-[#f0e3c0]"
                  : "border-[hsl(26_14%_20%)] text-[#cfc4ae] hover:border-[#e3b448]"
              }`}
            >
              <span className="block font-medium">{x.theme}</span>
              <span className="font-mono text-[12px] text-[#a08a68]">
                {x.entry_ids.length} linked · {x.communities.slice(0, 40)}…
              </span>
            </button>
          );
        })}
    </div>
  );
}

function LayerGuideList({ layerGuide }) {
  return (
    <div className="space-y-2">
      {layerGuide.map((lg) => {
        const meta = LAYER_META.find((m) => m.id === lg.layer);
        return (
          <div key={lg.layer} className="flex gap-2.5 items-start" data-testid={`layer-guide-${lg.layer}`}>
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-[hsl(26_18%_14%)] border border-[hsl(26_14%_22%)] flex items-center justify-center shrink-0">
              <TribalIcon name={meta?.icon || "spiral"} size={14} color="#d3a273" />
            </div>
            <div>
              <p className="text-[16.5px] font-semibold text-[#e8dcc5] leading-tight">{lg.name}</p>
              <p className="text-[14.5px] text-[#8d7e66] leading-snug">{lg.function}</p>
            </div>
          </div>
        );
      })}
      <div className="flex gap-2.5 items-start" data-testid="layer-guide-L14">
        <div className="mt-0.5 w-7 h-7 rounded-lg bg-[hsl(26_18%_14%)] border border-[hsl(26_14%_22%)] flex items-center justify-center shrink-0">
          <TribalIcon name="spiral" size={14} color="#d3a273" />
        </div>
        <div>
          <p className="text-[16.5px] font-semibold text-[#e8dcc5] leading-tight">Historical Food Origins</p>
          <p className="text-[14.5px] text-[#8d7e66] leading-snug">Where each food came from — migration, contact, global parallels.</p>
        </div>
      </div>
    </div>
  );
}

export default function FilterPanel({
  open,
  onClose,
  lang,
  communities,
  districts,
  xrefs,
  layerGuide,
  filters,
  setFilters,
  visibleCount,
  totalCount,
  isMobile,
}) {
  const L = LABELS[lang];

  const toggleCommunity = (name) => {
    setFilters((f) => {
      const s = new Set(f.communities);
      if (s.has(name)) s.delete(name);
      else s.add(name);
      return { ...f, communities: s };
    });
  };

  const clearAll = () =>
    setFilters({ communities: new Set(), district: null, category: null, q: "", trail: null });

  const hasFilters =
    filters.communities.size > 0 || filters.district || filters.category || filters.trail;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -380, opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="absolute left-3 md:left-5 top-24 bottom-24 z-20 w-[86vw] max-w-[330px] mmm-panel mmm-panel-carved flex flex-col"
          data-testid="filter-panel"
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div>
              <h2 className="text-[21px] font-bold text-[#f2ece1]" style={{ fontFamily: "var(--font-display)" }}>{L.explore}</h2>
              <p className="font-mono text-[14px] text-[#a08a68] mt-0.5" data-testid="visible-count">
                {visibleCount} {L.of} {totalCount} {L.visible}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close filters"
              data-testid="filter-panel-close"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(26_14%_16%)] transition-colors duration-200"
            >
              <X size={15} color="#a08a68" />
            </button>
          </div>

          <div className="px-5 pb-1">
            <WarliStrip count={6} size={13} />
          </div>

          {hasFilters && (
            <button
              onClick={clearAll}
              data-testid="clear-filters-button"
              className="mx-5 mt-1 mb-1 text-left text-[14px] text-[#e3b448] hover:text-[#f0c86a] transition-colors duration-200"
            >
              ✕ {L.clearAll}
            </button>
          )}

          <div className="flex-1 min-h-0 px-5 pb-4 overflow-y-auto">
            <Accordion type="multiple" defaultValue={["communities"]} className="w-full">
              <AccordionItem value="communities" className="border-[hsl(26_14%_20%)]">
                <SectionTrigger icon="community" label={L.community} />
                <AccordionContent>
                  <CommunityChips communities={communities} filters={filters} toggleCommunity={toggleCommunity} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="districts" className="border-[hsl(26_14%_20%)]">
                <SectionTrigger icon="pin" label={L.district} />
                <AccordionContent>
                  <DistrictChips districts={districts} filters={filters} setFilters={setFilters} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="categories" className="border-[hsl(26_14%_20%)]">
                <SectionTrigger icon="bowl" label={L.category} />
                <AccordionContent>
                  <CategoryList filters={filters} setFilters={setFilters} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trails" className="border-[hsl(26_14%_20%)]">
                <SectionTrigger icon="spiral" label={L.trails} />
                <AccordionContent>
                  <TrailList xrefs={xrefs} filters={filters} setFilters={setFilters} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="layers" className="border-none">
                <SectionTrigger icon="weave" label={L.layerGuide} />
                <AccordionContent>
                  <LayerGuideList layerGuide={layerGuide} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

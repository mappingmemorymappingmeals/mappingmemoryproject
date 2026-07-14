import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { QaList } from "@/components/QaList";
import { LABELS, communityColor, categoryGroup } from "@/lib/constants";
import { aiQuestions } from "@/lib/api";
import { X, Volume2, HelpCircle, Loader2, ArrowLeft } from "lucide-react";

function LayerBlock({ icon, id, title, children }) {
  return (
    <AccordionItem value={id} className="border-[hsl(26_14%_20%)]">
      <AccordionTrigger className="hover:no-underline py-3.5">
        <span className="flex items-center gap-3 text-[18px] font-semibold text-[#e8dcc5]">
          <span className="w-9 h-9 rounded-lg bg-[hsl(26_18%_14%)] border border-[hsl(26_14%_22%)] flex items-center justify-center">
            <TribalIcon name={icon} size={18} color="#d3a273" />
          </span>
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="text-[17px] leading-relaxed text-[#cfc4ae] space-y-3 pl-12">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Field({ label, value, pre = false }) {
  if (!value || value === "nan") return null;
  return (
    <div>
      {label && <p className="font-mono text-[13.5px] uppercase tracking-[0.2em] text-[#a08a68] mb-1">{label}</p>}
      <p className={pre ? "whitespace-pre-wrap" : ""}>{value}</p>
    </div>
  );
}

// ---- header: icon medallion, names, badges, tour CTA ----
function DrawerHeader({ entry, col, catIcon, L, onClose, onBack, onStartTour }) {
  return (
    <div className="relative overflow-hidden rounded-t-[18px]">
      <div className="h-2.5" style={{ background: `linear-gradient(90deg, ${col}, #e3b448, transparent)` }} />
      <div className="px-7 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack || onClose}
              aria-label={L.back}
              data-testid="food-detail-back"
              className="w-10 h-10 rounded-xl mt-1 flex items-center justify-center border border-[hsl(26_14%_24%)] hover:border-[#d07a3a] hover:bg-[hsl(26_14%_14%)] transition-colors duration-200 shrink-0"
            >
              <ArrowLeft size={19} color="#d3a273" />
            </button>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 mt-0.5"
              style={{ borderColor: col, background: "hsl(26 22% 12%)", boxShadow: `0 0 28px ${col}44` }}
            >
              <TribalIcon name={catIcon} size={30} color={col} />
            </div>
            <div>
              <p className="font-mono text-[14px] text-[#a08a68]">{entry.category}</p>
              <h2 className="text-[28px] font-bold text-[#f2ece1] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {entry.food_name}
              </h2>
              {entry.local_name && entry.local_name !== entry.food_name && (
                <p className="text-[18px] text-[#d3a273] italic">“{entry.local_name}”</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            data-testid="food-detail-close"
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[hsl(26_14%_16%)] transition-colors duration-200 shrink-0"
          >
            <X size={20} color="#a08a68" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3.5">
          <Badge style={{ background: col, color: "#14100b" }} className="rounded-full font-bold text-[15px] px-3.5 py-1">
            {entry.community}
          </Badge>
          {entry.pvtg_status?.toLowerCase().startsWith("yes") && (
            <Badge className="rounded-full bg-[#e3b448] text-[#14100b] font-bold text-[15px] px-3.5 py-1">✦ {L.pvtg}</Badge>
          )}
          <Badge variant="outline" className="rounded-full border-[hsl(26_14%_26%)] text-[#cfc4ae] text-[15px] px-3.5 py-1">
            {entry.district}
          </Badge>
        </div>

        <div className="flex gap-2.5 mt-4">
          <Button
            onClick={() => onStartTour(entry)}
            data-testid="food-detail-start-talking-tour-button"
            className="flex-1 bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a] font-bold text-[18px] h-12 rounded-xl gap-2.5 transition-colors duration-200"
          >
            <Volume2 size={19} /> {L.startTour}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- overview tab: summary fields + pedagogical Q&A ----
function OverviewTab({ entry, col, L, qa, qLoading, loadQa }) {
  return (
    <div className="h-full pr-3 overflow-y-auto">
      <div className="space-y-5 text-[17.5px] leading-relaxed text-[#cfc4ae]">
        <div className="rounded-2xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-5">
          <p className="font-mono text-[13.5px] uppercase tracking-[0.2em] text-[#a08a68] mb-2 flex items-center gap-2">
            <TribalIcon name="ecology" size={15} color="#d3a273" /> {entry.block_village || entry.district}
          </p>
          <p>{entry.ecology}</p>
        </div>
        <Field label="Ingredients" value={entry.ingredients} />
        <Field label="How it is made" value={entry.culinary_technology} pre />
        <Field label="Why it matters" value={entry.cultural_significance} />
        {entry.cultural_memory && (
          <blockquote className="border-l-[3px] pl-5 italic text-[18px] text-[#d9cdb4]" style={{ borderColor: col }}>
            {entry.cultural_memory}
          </blockquote>
        )}
        <WarliStrip count={6} size={16} />

        <div className="rounded-2xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-5">
          <p className="text-[18px] font-bold text-[#e8dcc5] flex items-center gap-2 mb-3" style={{ fontFamily: "var(--font-display)" }}>
            <HelpCircle size={17} color="#e3b448" /> {L.questions}
          </p>
          {!qa && (
            <Button
              onClick={loadQa}
              disabled={qLoading}
              variant="outline"
              data-testid="detail-reveal-questions-button"
              className="rounded-xl h-11 text-[17px] border-[#e3b448] text-[#e3b448] hover:bg-[#e3b448] hover:text-[#14100b] gap-2 transition-colors duration-200"
            >
              {qLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {qLoading ? L.generating : L.revealQuestions}
            </Button>
          )}
          {qa && <QaList qa={qa} testId="detail-questions-list" />}
        </div>
      </div>
    </div>
  );
}

// ---- layers tab: the 13 knowledge layers ----
function LayersTab({ entry }) {
  return (
    <div className="h-full pr-3 overflow-y-auto">
      <Accordion type="multiple" defaultValue={["L1"]} className="w-full" data-testid="detail-layers-accordion">
        <LayerBlock icon="ecology" id="L1" title="District & Ecology">
          <Field label="District" value={`${entry.district}, ${entry.state}`} />
          <Field label="Block / Village" value={entry.block_village} />
          <Field label="Ecology & Landscape" value={entry.ecology} />
        </LayerBlock>
        <LayerBlock icon="community" id="L2" title="Tribal Community & Food">
          <Field label="Community" value={`${entry.community} — PVTG: ${entry.pvtg_status}`} />
          <Field label="Food" value={`${entry.food_name} (${entry.local_name})`} />
          <Field label="Scientific Name" value={entry.scientific_name} />
          <Field label="Category" value={entry.category} />
        </LayerBlock>
        <LayerBlock icon="grain" id="L3" title="Ethnobotanical Ingredients">
          <Field value={entry.ingredients} pre />
        </LayerBlock>
        <LayerBlock icon="pot" id="L4" title="Culinary Technology">
          <Field label="Method" value={entry.culinary_technology} pre />
          <Field label="Vessels & Tools" value={entry.vessel_tool} pre />
        </LayerBlock>
        <LayerBlock icon="sun" id="L5" title="Temporal Context & Scarcity">
          <Field label="Season" value={entry.season} pre />
          <Field label="Scarcity Context" value={entry.scarcity} pre />
        </LayerBlock>
        <LayerBlock icon="drum" id="L6" title="Cultural Memory & Folklore">
          <Field label="Memory & Folklore" value={entry.cultural_memory} pre />
          <Field label="Ritual Use" value={entry.ritual_use} pre />
        </LayerBlock>
        <LayerBlock icon="scroll" id="L7" title="Archival Notes">
          <Field value={entry.notes || "—"} pre />
        </LayerBlock>
        <LayerBlock icon="broken" id="L8" title="Lost & Erased Traditions">
          <Field value={entry.lost_traditions || "—"} pre />
        </LayerBlock>
        <LayerBlock icon="altar" id="L9" title="Sacred Foods & Offerings">
          <Field value={entry.sacred_foods || "—"} pre />
        </LayerBlock>
        <LayerBlock icon="herb" id="L10" title="Medicinal Value">
          <Field value={entry.medicinal_value || "—"} pre />
        </LayerBlock>
        <LayerBlock icon="weave" id="L11" title="Cultural Significance">
          <Field value={entry.cultural_significance || "—"} pre />
        </LayerBlock>
        <LayerBlock icon="pin" id="L12" title="Geo-Location">
          <Field value={entry.lat ? `${entry.lat}°N, ${entry.lng}°E — ${entry.geo_note}` : "Coordinates pending field verification"} />
        </LayerBlock>
        <LayerBlock icon="eye" id="L13" title="Image Reference">
          <Field value={entry.image_reference || "—"} pre />
        </LayerBlock>
      </Accordion>
    </div>
  );
}

// ---- origins tab: Layer 14 deep history ----
function OriginsTab({ entry }) {
  return (
    <div className="h-full pr-3 overflow-y-auto">
      {entry.origin ? (
        <div className="space-y-5 text-[17px] leading-relaxed text-[#cfc4ae]" data-testid="detail-origins-content">
          <div className="rounded-2xl border border-[#e3b44833] bg-[#2a2010] p-5">
            <p className="font-mono text-[13.5px] uppercase tracking-[0.2em] text-[#e3b448] mb-2">Geographic Origin</p>
            <p>{entry.origin.geographic_origin}</p>
          </div>
          <Field label="Deep Historical Narrative" value={entry.origin.origin_narrative} pre />
          <Field label="Adoption Pathway" value={entry.origin.adoption_pathway} pre />
          <Field label="Migration & Cultural Contact" value={entry.origin.migration_contact} pre />
          <Field label="Chronological Timeline" value={entry.origin.timeline} pre />
          <Field label="Global Parallels" value={entry.origin.global_parallels} pre />
        </div>
      ) : (
        <p className="text-[17px] text-[#8d7e66] p-4">Origin research not yet documented for this entry.</p>
      )}
    </div>
  );
}

export default function DetailDrawer({ entry, lang, onClose, onBack, onStartTour, isMobile }) {
  const L = LABELS[lang];
  const [qa, setQa] = useState(null);
  const [qLoading, setQLoading] = useState(false);

  const loadQa = async () => {
    if (qa || qLoading) return;
    setQLoading(true);
    try {
      const res = await aiQuestions({ entry_id: entry.entry_id, language: lang });
      setQa(res.qa || (res.questions || []).map((q) => ({ q, a: "" })));
    } catch (err) {
      console.error("Q&A generation failed:", err);
      setQa([]);
    } finally {
      setQLoading(false);
    }
  };

  if (!entry) return null;
  const col = communityColor(entry.community);
  const catIcon = categoryGroup(entry.category).icon;

  return (
    <aside
      key={entry.entry_id}
      className={`drawer-anim absolute z-40 mmm-panel mmm-panel-carved flex flex-col ${
        isMobile
          ? "inset-0 rounded-none"
          : "right-4 top-24 bottom-4 w-[560px] max-w-[94vw] rounded-[18px]"
      }`}
      data-testid="food-detail-drawer"
    >
      <DrawerHeader entry={entry} col={col} catIcon={catIcon} L={L} onClose={onClose} onBack={onBack} onStartTour={onStartTour} />

      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 px-7 pb-5" data-testid="food-detail-tabs">
        <TabsList className="bg-[hsl(26_16%_14%)] rounded-xl w-full justify-start gap-1 h-11">
          <TabsTrigger value="overview" data-testid="detail-tab-overview" className="rounded-lg text-[16.5px] font-semibold data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b]">
            {L.overview}
          </TabsTrigger>
          <TabsTrigger value="layers" data-testid="detail-tab-layers" className="rounded-lg text-[16.5px] font-semibold data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b]">
            {L.allLayers}
          </TabsTrigger>
          <TabsTrigger value="origins" data-testid="detail-tab-origins" disabled={!entry.origin} className="rounded-lg text-[16.5px] font-semibold data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b] disabled:opacity-35">
            {L.origins}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 min-h-0 mt-3.5">
          <OverviewTab entry={entry} col={col} L={L} qa={qa} qLoading={qLoading} loadQa={loadQa} />
        </TabsContent>

        <TabsContent value="layers" className="flex-1 min-h-0 mt-3.5">
          <LayersTab entry={entry} />
        </TabsContent>

        <TabsContent value="origins" className="flex-1 min-h-0 mt-3.5">
          <OriginsTab entry={entry} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

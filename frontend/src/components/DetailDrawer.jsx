import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS, communityColor, categoryGroup, LAYER_META } from "@/lib/constants";
import { aiQuestions } from "@/lib/api";
import { X, Volume2, HelpCircle, Loader2 } from "lucide-react";

function LayerBlock({ icon, id, title, children }) {
  return (
    <AccordionItem value={id} className="border-[hsl(26_14%_20%)]">
      <AccordionTrigger className="hover:no-underline py-3">
        <span className="flex items-center gap-2.5 text-[13px] text-[#e8dcc5]">
          <span className="w-7 h-7 rounded-lg bg-[hsl(26_18%_14%)] border border-[hsl(26_14%_22%)] flex items-center justify-center">
            <TribalIcon name={icon} size={14} color="#d3a273" />
          </span>
          <span className="font-mono text-[10px] text-[#e3b448] mr-1">{id}</span> {title}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="text-[12.5px] leading-relaxed text-[#cfc4ae] space-y-2 pl-9">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Field({ label, value, pre = false }) {
  if (!value || value === "nan") return null;
  return (
    <div>
      {label && <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#a08a68] mb-0.5">{label}</p>}
      <p className={pre ? "whitespace-pre-wrap" : ""}>{value}</p>
    </div>
  );
}

export default function DetailDrawer({ entry, lang, onClose, onStartTour }) {
  const L = LABELS[lang];
  const [questions, setQuestions] = useState(null);
  const [qLoading, setQLoading] = useState(false);

  const loadQuestions = async () => {
    if (questions || qLoading) return;
    setQLoading(true);
    try {
      const res = await aiQuestions({ entry_id: entry.entry_id, language: lang });
      setQuestions(res.questions);
    } catch (e) {
      setQuestions([]);
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
      className="drawer-anim absolute right-0 md:right-4 top-0 md:top-16 bottom-0 md:bottom-4 z-40 w-full md:w-[480px] mmm-panel mmm-panel-carved flex flex-col md:rounded-[18px] rounded-none"
      data-testid="food-detail-drawer"
    >
        {/* header */}
        <div className="relative overflow-hidden rounded-t-[18px]">
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${col}, #e3b448, transparent)` }} />
          <div className="px-6 pt-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 mt-1"
                  style={{ borderColor: col, background: "hsl(26 22% 12%)", boxShadow: `0 0 24px ${col}44` }}
                >
                  <TribalIcon name={catIcon} size={22} color={col} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-[#a08a68]">{entry.entry_id} · {entry.category}</p>
                  <h2 className="text-[20px] font-bold text-[#f2ece1] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {entry.food_name}
                  </h2>
                  {entry.local_name && entry.local_name !== entry.food_name && (
                    <p className="text-[13px] text-[#d3a273]">“{entry.local_name}”</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close details"
                data-testid="food-detail-close"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(26_14%_16%)] transition-colors duration-200 shrink-0"
              >
                <X size={16} color="#a08a68" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge style={{ background: col, color: "#14100b" }} className="rounded-full font-medium">
                {entry.community}
              </Badge>
              {entry.pvtg_status?.toLowerCase().startsWith("yes") && (
                <Badge className="rounded-full bg-[#e3b448] text-[#14100b] font-medium">✦ {L.pvtg}</Badge>
              )}
              <Badge variant="outline" className="rounded-full border-[hsl(26_14%_26%)] text-[#cfc4ae]">
                {entry.district}
              </Badge>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onStartTour(entry)}
                data-testid="food-detail-start-talking-tour-button"
                className="flex-1 bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a] font-semibold rounded-xl gap-2 transition-colors duration-200"
              >
                <Volume2 size={16} /> {L.startTour}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 px-6 pb-4" data-testid="food-detail-tabs">
          <TabsList className="bg-[hsl(26_16%_14%)] rounded-xl w-full justify-start gap-1 h-9">
            <TabsTrigger value="overview" data-testid="detail-tab-overview" className="rounded-lg text-[12px] data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b]">
              {L.overview}
            </TabsTrigger>
            <TabsTrigger value="layers" data-testid="detail-tab-layers" className="rounded-lg text-[12px] data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b]">
              {L.allLayers}
            </TabsTrigger>
            <TabsTrigger value="origins" data-testid="detail-tab-origins" disabled={!entry.origin} className="rounded-lg text-[12px] data-[state=active]:bg-[#d07a3a] data-[state=active]:text-[#14100b] disabled:opacity-35">
              {L.origins}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-4 text-[13px] leading-relaxed text-[#cfc4ae]">
                <div className="rounded-xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-4">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#a08a68] mb-1.5 flex items-center gap-1.5">
                    <TribalIcon name="ecology" size={12} color="#d3a273" /> {entry.block_village || entry.district}
                  </p>
                  <p>{entry.ecology}</p>
                </div>
                <Field label="Ingredients" value={entry.ingredients} />
                <Field label="Why it matters" value={entry.cultural_significance} />
                {entry.cultural_memory && (
                  <blockquote className="border-l-2 pl-4 italic text-[#d9cdb4]" style={{ borderColor: col }}>
                    {entry.cultural_memory}
                  </blockquote>
                )}
                <WarliStrip count={6} size={14} />

                {/* pedagogical questions */}
                <div className="rounded-xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-4">
                  <p className="text-[13px] text-[#e8dcc5] flex items-center gap-2 mb-2">
                    <HelpCircle size={14} color="#e3b448" /> {L.questions}
                  </p>
                  {!questions && (
                    <Button
                      onClick={loadQuestions}
                      disabled={qLoading}
                      variant="outline"
                      data-testid="detail-reveal-questions-button"
                      className="rounded-xl border-[#e3b448] text-[#e3b448] hover:bg-[#e3b448] hover:text-[#14100b] gap-2 transition-colors duration-200"
                    >
                      {qLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      {qLoading ? L.generating : L.revealQuestions}
                    </Button>
                  )}
                  {questions && (
                    <ol className="space-y-2 list-decimal list-inside" data-testid="detail-questions-list">
                      {questions.map((q, i) => (
                        <li key={i} className="text-[12.5px]">{q}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 13 LAYERS */}
          <TabsContent value="layers" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full pr-3">
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
                  <Field value={entry.ingredients} />
                </LayerBlock>
                <LayerBlock icon="pot" id="L4" title="Culinary Technology">
                  <Field label="Method" value={entry.culinary_technology} pre />
                  <Field label="Vessels & Tools" value={entry.vessel_tool} />
                </LayerBlock>
                <LayerBlock icon="sun" id="L5" title="Temporal Context & Scarcity">
                  <Field label="Season" value={entry.season} />
                  <Field label="Scarcity Context" value={entry.scarcity} />
                </LayerBlock>
                <LayerBlock icon="drum" id="L6" title="Cultural Memory & Folklore">
                  <Field label="Memory & Folklore" value={entry.cultural_memory} />
                  <Field label="Ritual Use" value={entry.ritual_use} />
                </LayerBlock>
                <LayerBlock icon="scroll" id="L7" title="Archival Notes">
                  <Field value={entry.notes || "—"} />
                </LayerBlock>
                <LayerBlock icon="broken" id="L8" title="Lost / Erased Traditions">
                  <Field value={entry.lost_traditions || "—"} />
                </LayerBlock>
                <LayerBlock icon="altar" id="L9" title="Sacred Foods & Offerings">
                  <Field value={entry.sacred_foods || "—"} />
                </LayerBlock>
                <LayerBlock icon="herb" id="L10" title="Medicinal Value">
                  <Field value={entry.medicinal_value || "—"} />
                </LayerBlock>
                <LayerBlock icon="weave" id="L11" title="Cultural Significance">
                  <Field value={entry.cultural_significance || "—"} />
                </LayerBlock>
                <LayerBlock icon="pin" id="L12" title="Geo-Location">
                  <Field value={entry.lat ? `${entry.lat}°N, ${entry.lng}°E — ${entry.geo_note}` : "Coordinates pending field verification"} />
                </LayerBlock>
                <LayerBlock icon="eye" id="L13" title="Image Reference">
                  <Field value={entry.image_reference || "—"} />
                </LayerBlock>
              </Accordion>
            </ScrollArea>
          </TabsContent>

          {/* ORIGINS */}
          <TabsContent value="origins" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full pr-3">
              {entry.origin ? (
                <div className="space-y-4 text-[12.5px] leading-relaxed text-[#cfc4ae]" data-testid="detail-origins-content">
                  <div className="rounded-xl border border-[#e3b44833] bg-[#2a2010] p-4">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#e3b448] mb-1.5">Geographic Origin</p>
                    <p>{entry.origin.geographic_origin}</p>
                  </div>
                  <Field label="Deep Historical Narrative" value={entry.origin.origin_narrative} pre />
                  <Field label="Adoption Pathway" value={entry.origin.adoption_pathway} />
                  <Field label="Migration & Cultural Contact" value={entry.origin.migration_contact} />
                  <Field label="Chronological Timeline" value={entry.origin.timeline} pre />
                  <Field label="Global Parallels" value={entry.origin.global_parallels} />
                </div>
              ) : (
                <p className="text-[13px] text-[#8d7e66] p-4">Origin research not yet documented for this entry.</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
    </aside>
  );
}

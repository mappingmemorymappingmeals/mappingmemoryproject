import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS } from "@/lib/constants";
import { aiSnapshot, aiQuestions } from "@/lib/api";
import { speak, stopSpeaking, hasVoiceFor, isSpeechSupported } from "@/lib/speech";
import { Volume2, Square, RefreshCw, Loader2, HelpCircle } from "lucide-react";

export default function SnapshotDialog({ open, onOpenChange, viewContext, lang, onDuck }) {
  const [script, setScript] = useState(null);
  const [qa, setQa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qLoading, setQLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const L = LABELS[lang];

  const generate = async () => {
    if (!viewContext) return;
    setLoading(true);
    setError(null);
    setScript(null);
    setQa(null);
    try {
      const res = await aiSnapshot({ ...viewContext, language: lang });
      setScript(res.script);
      setQLoading(true);
      const ctx = `Map view of ${viewContext.district || "West Bengal"}. Foods: ${viewContext.visible_foods?.join(", ")}. Communities: ${viewContext.visible_communities?.join(", ")}`;
      aiQuestions({ context: ctx, language: lang })
        .then((r) => setQa(r.qa || (r.questions || []).map((q) => ({ q, a: "" }))))
        .catch(() => setQa([]))
        .finally(() => setQLoading(false));
    } catch (e) {
      setError("Snapshot analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) generate();
    else {
      stopSpeaking();
      setSpeaking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleListen = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      onDuck && onDuck(false);
      return;
    }
    if (!script) return;
    onDuck && onDuck(true);
    speak(script, lang, {
      onEnd: () => {
        setSpeaking(false);
        onDuck && onDuck(false);
      },
      onStart: () => setSpeaking(true),
    });
  };

  const voiceOk = isSpeechSupported() && hasVoiceFor(lang);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="mmm-panel border-[hsl(26_14%_22%)] max-w-2xl max-h-[88vh] flex flex-col"
        data-testid="snapshot-results-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-[#f2ece1] text-xl font-bold flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
            <span className="w-11 h-11 rounded-xl bg-[#2f6b4f] flex items-center justify-center">
              <TribalIcon name="camera" size={21} color="#f2ece1" />
            </span>
            {L.snapshotTitle}
          </DialogTitle>
          <DialogDescription className="font-mono text-[14px] text-[#a08a68]">
            {viewContext?.district || "West Bengal"} · zoom {viewContext?.zoom} · {viewContext?.visible_foods?.length || 0} landmarks in view
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 pr-3 overflow-y-auto" style={{ maxHeight: "50vh" }}>
          {loading && (
            <div className="space-y-3 py-2" data-testid="snapshot-loading">
              <p className="text-[17px] text-[#d3a273] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> {L.generating}
              </p>
              <Skeleton className="h-5 w-full bg-[hsl(26_16%_16%)]" />
              <Skeleton className="h-5 w-10/12 bg-[hsl(26_16%_16%)]" />
              <Skeleton className="h-5 w-full bg-[hsl(26_16%_16%)]" />
            </div>
          )}
          {error && !loading && <p className="text-[17px] text-[#e08a4e] py-2">{error}</p>}
          {script && !loading && (
            <p className="text-[18.5px] leading-[1.95] text-[#e8dcc5] py-1" data-testid="snapshot-script">
              {script}
            </p>
          )}

          {(qLoading || qa) && (
            <div className="mt-4 rounded-2xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-4" data-testid="snapshot-pedagogical-questions">
              <p className="text-[17px] font-bold text-[#e3b448] flex items-center gap-2 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                <HelpCircle size={16} /> {L.questions}
              </p>
              {qLoading && <Skeleton className="h-5 w-2/3 bg-[hsl(26_16%_16%)]" />}
              {qa && (
                <Accordion type="single" collapsible className="w-full">
                  {qa.map((p, i) => (
                    <AccordionItem key={i} value={`q${i}`} className="border-[hsl(26_14%_18%)]">
                      <AccordionTrigger className="text-[16.5px] text-[#d9cdb4] hover:no-underline text-left py-2.5">
                        <span><span className="font-mono text-[#e3b448] mr-2">{i + 1}.</span>{p.q}</span>
                      </AccordionTrigger>
                      {p.a && (
                        <AccordionContent>
                          <p className="text-[16px] leading-relaxed text-[#cfc4ae] pl-6 border-l-2 border-[#e3b44855]">{p.a}</p>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[hsl(26_14%_18%)] flex-wrap">
          <Button
            onClick={handleListen}
            disabled={!script || loading}
            data-testid="snapshot-listen-button"
            className={`rounded-full h-11 text-[17px] gap-2 font-bold transition-colors duration-200 ${
              speaking ? "bg-[#e3b448] hover:bg-[#f0c86a] text-[#14100b]" : "bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a]"
            }`}
          >
            {speaking ? <Square size={16} /> : <Volume2 size={17} />}
            {speaking ? L.stop : L.listen}
          </Button>
          <Button
            onClick={generate}
            disabled={loading}
            variant="outline"
            data-testid="snapshot-regenerate-button"
            className="rounded-full h-11 text-[17px] gap-2 border-[#4a3a28] text-[#e0d4bc] hover:border-[#d07a3a] bg-transparent transition-colors duration-200"
          >
            <RefreshCw size={16} /> {L.regenerate}
          </Button>
          {!voiceOk && script && <span className="text-[14px] text-[#e3b448]">⚠ {L.noVoice}</span>}
          <div className="flex-1" />
          <WarliStrip count={4} size={15} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

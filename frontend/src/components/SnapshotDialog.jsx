import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS } from "@/lib/constants";
import { aiSnapshot, aiQuestions } from "@/lib/api";
import { speak, stopSpeaking, hasVoiceFor, isSpeechSupported } from "@/lib/speech";
import { Volume2, Square, RefreshCw, Loader2, HelpCircle } from "lucide-react";

export default function SnapshotDialog({ open, onOpenChange, viewContext, lang, onDuck }) {
  const [script, setScript] = useState(null);
  const [questions, setQuestions] = useState(null);
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
    setQuestions(null);
    try {
      const res = await aiSnapshot({ ...viewContext, language: lang });
      setScript(res.script);
      setQLoading(true);
      const ctx = `Map view of ${viewContext.district || "West Bengal"}. Foods: ${viewContext.visible_foods?.join(", ")}. Communities: ${viewContext.visible_communities?.join(", ")}`;
      aiQuestions({ context: ctx, language: lang })
        .then((r) => setQuestions(r.questions))
        .catch(() => setQuestions([]))
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
        className="mmm-panel border-[hsl(26_14%_22%)] max-w-xl max-h-[86vh] flex flex-col"
        data-testid="snapshot-results-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-[#f2ece1] flex items-center gap-2.5" style={{ fontFamily: "var(--font-display)" }}>
            <span className="w-9 h-9 rounded-xl bg-[#2f6b4f] flex items-center justify-center">
              <TribalIcon name="camera" size={17} color="#f2ece1" />
            </span>
            {L.snapshotTitle}
          </DialogTitle>
          <DialogDescription className="font-mono text-[10.5px] text-[#a08a68]">
            {viewContext?.district || "West Bengal"} · zoom {viewContext?.zoom} · {viewContext?.visible_foods?.length || 0} landmarks in view
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 max-h-[46vh] pr-3">
          {loading && (
            <div className="space-y-2.5 py-2" data-testid="snapshot-loading">
              <p className="text-[13px] text-[#d3a273] flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> {L.generating}
              </p>
              <Skeleton className="h-4 w-full bg-[hsl(26_16%_16%)]" />
              <Skeleton className="h-4 w-10/12 bg-[hsl(26_16%_16%)]" />
              <Skeleton className="h-4 w-full bg-[hsl(26_16%_16%)]" />
            </div>
          )}
          {error && !loading && <p className="text-[13px] text-[#e08a4e] py-2">{error}</p>}
          {script && !loading && (
            <p className="text-[14px] leading-[1.85] text-[#e8dcc5] py-1" data-testid="snapshot-script">
              {script}
            </p>
          )}

          {(qLoading || questions) && (
            <div className="mt-4 rounded-xl border border-[hsl(26_14%_20%)] bg-[hsl(26_18%_11%)] p-4" data-testid="snapshot-pedagogical-questions">
              <p className="text-[12.5px] font-semibold text-[#e3b448] flex items-center gap-2 mb-2">
                <HelpCircle size={13} /> {L.questions}
              </p>
              {qLoading && <Skeleton className="h-4 w-2/3 bg-[hsl(26_16%_16%)]" />}
              {questions && (
                <ol className="space-y-1.5 list-decimal list-inside text-[12px] text-[#d9cdb4]">
                  {questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center gap-2.5 pt-2 border-t border-[hsl(26_14%_18%)]">
          <Button
            onClick={handleListen}
            disabled={!script || loading}
            data-testid="snapshot-listen-button"
            className={`rounded-full gap-2 font-semibold transition-colors duration-200 ${
              speaking ? "bg-[#e3b448] hover:bg-[#f0c86a] text-[#14100b]" : "bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a]"
            }`}
          >
            {speaking ? <Square size={14} /> : <Volume2 size={15} />}
            {speaking ? L.stop : L.listen}
          </Button>
          <Button
            onClick={generate}
            disabled={loading}
            variant="outline"
            data-testid="snapshot-regenerate-button"
            className="rounded-full gap-2 border-[#4a3a28] text-[#e0d4bc] hover:border-[#d07a3a] bg-transparent transition-colors duration-200"
          >
            <RefreshCw size={14} /> {L.regenerate}
          </Button>
          {!voiceOk && script && <span className="text-[10px] text-[#e3b448]">⚠ {L.noVoice}</span>}
          <div className="flex-1" />
          <WarliStrip count={4} size={13} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LABELS, communityColor, categoryGroup, TOUR_BG, TOUR_BG_ALT } from "@/lib/constants";
import { aiTour, aiQuestions } from "@/lib/api";
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, hasVoiceFor, isSpeechSupported } from "@/lib/speech";
import { X, Play, Pause, RotateCcw, HelpCircle, Loader2, Volume2 } from "lucide-react";

export default function TourOverlay({ entry, lang: appLang, onClose, onDuck }) {
  const [lang, setLang] = useState(appLang);
  const [scripts, setScripts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playState, setPlayState] = useState("idle"); // idle | playing | paused
  const [wordIdx, setWordIdx] = useState(-1);
  const [questions, setQuestions] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const wordsRef = useRef([]);
  const activeWordRef = useRef(null);

  const script = scripts[lang];

  const fetchScript = useCallback(
    async (l) => {
      if (scripts[l]) return;
      setLoading(true);
      setError(null);
      try {
        const res = await aiTour(entry.entry_id, l);
        setScripts((s) => ({ ...s, [l]: res.script }));
      } catch (e) {
        setError("The AI guide could not be reached. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [entry.entry_id, scripts]
  );

  useEffect(() => {
    fetchScript(lang);
  }, [lang, fetchScript]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      onDuck && onDuck(false);
    };
  }, [onDuck]);

  // build char offsets for word highlighting
  const words = script ? script.split(/\s+/) : [];
  const offsets = [];
  if (script) {
    let pos = 0;
    for (const w of words) {
      const idx = script.indexOf(w, pos);
      offsets.push(idx);
      pos = idx + w.length;
    }
  }
  wordsRef.current = offsets;

  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [wordIdx]);

  const handlePlay = () => {
    if (!script) return;
    if (playState === "paused") {
      resumeSpeaking();
      setPlayState("playing");
      return;
    }
    onDuck && onDuck(true);
    const ok = speak(script, lang, {
      onBoundary: (charIndex) => {
        const arr = wordsRef.current;
        let lo = 0;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] <= charIndex) lo = i;
          else break;
        }
        setWordIdx(lo);
      },
      onEnd: () => {
        setPlayState("idle");
        setWordIdx(-1);
        onDuck && onDuck(false);
      },
      onStart: () => setPlayState("playing"),
    });
    if (ok) setPlayState("playing");
  };

  const handlePause = () => {
    pauseSpeaking();
    setPlayState("paused");
  };

  const handleReplay = () => {
    stopSpeaking();
    setWordIdx(-1);
    setTimeout(handlePlay, 150);
  };

  const handleLang = (l) => {
    stopSpeaking();
    setPlayState("idle");
    setWordIdx(-1);
    setQuestions(null);
    setLang(l);
  };

  const loadQuestions = async () => {
    if (qLoading) return;
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

  const L = LABELS[appLang];
  const col = communityColor(entry.community);
  const voiceOk = isSpeechSupported() && hasVoiceFor(lang);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        data-testid="talking-tour-overlay"
      >
        <div className="tour-bg" style={{ backgroundImage: `url(${entry.entry_id.charCodeAt(0) % 2 ? TOUR_BG : TOUR_BG_ALT})` }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(1000px circle at 50% 30%, rgba(16,10,5,0.55), rgba(10,6,3,0.92))" }} />

        <div className="relative w-full max-w-3xl mx-3 md:mx-6 max-h-[92vh] flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${playState === "playing" ? "speaking-pulse" : ""}`}
                style={{ borderColor: col, background: "rgba(20,14,8,0.9)" }}
              >
                <TribalIcon name={categoryGroup(entry.category).icon} size={20} color={col} />
              </div>
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#d3a273]">{L.talkingTour}</p>
                <h2 className="text-lg md:text-2xl font-bold text-[#f7f1e5] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {entry.food_name}
                </h2>
                <p className="text-[11.5px] text-[#c9bda6]">
                  <span style={{ color: col }}>{entry.community}</span> · {entry.block_village || entry.district}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close tour"
              data-testid="talking-tour-close"
              className="w-10 h-10 rounded-xl mmm-panel flex items-center justify-center hover:border-[#d07a3a] transition-colors duration-200"
            >
              <X size={17} color="#d3a273" />
            </button>
          </div>

          {/* language tabs */}
          <div className="flex items-center gap-2 mb-3" data-testid="talking-tour-language-toggle">
            {["en", "bn", "hi"].map((l) => (
              <button
                key={l}
                onClick={() => handleLang(l)}
                data-testid={`talking-tour-lang-${l}`}
                className={`px-4 py-1.5 rounded-full text-[13px] border transition-colors duration-200 ${
                  lang === l
                    ? "bg-[#e3b448] border-[#e3b448] text-[#14100b] font-semibold"
                    : "border-[#4a3a28] text-[#e0d4bc] hover:border-[#e3b448] bg-[rgba(20,14,8,0.7)]"
                }`}
              >
                {l === "en" ? "English" : l === "bn" ? "বাংলা" : "हिन्दी"}
              </button>
            ))}
            {!voiceOk && script && (
              <span className="text-[10.5px] text-[#e3b448] ml-2 hidden md:inline">⚠ {L.noVoice}</span>
            )}
          </div>

          {/* transcript card */}
          <div className="mmm-panel mmm-panel-carved flex-1 min-h-0 flex flex-col" style={{ background: "hsl(28 22% 9%)" }}>
            <ScrollArea className="flex-1 min-h-0 px-6 md:px-8 py-6 max-h-[42vh]">
              {loading && (
                <div className="space-y-3" data-testid="tour-loading">
                  <p className="text-[13px] text-[#d3a273] flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> {L.generating}
                  </p>
                  <Skeleton className="h-4 w-full bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-4 w-11/12 bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-4 w-full bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-4 w-3/4 bg-[hsl(26_16%_16%)]" />
                </div>
              )}
              {error && !loading && (
                <div className="text-[13px] text-[#e08a4e]">
                  {error}{" "}
                  <button onClick={() => fetchScript(lang)} className="underline text-[#e3b448]">Retry</button>
                </div>
              )}
              {script && !loading && (
                <p
                  className="text-[15px] md:text-[17px] leading-[1.9] text-[#e8dcc5]"
                  data-testid="tour-transcript"
                  style={{ fontFamily: lang === "en" ? "var(--font-body)" : undefined }}
                >
                  {words.map((w, i) => (
                    <span key={i} ref={i === wordIdx ? activeWordRef : null} className={`tour-word ${i === wordIdx ? "active" : ""}`}>
                      {w}{" "}
                    </span>
                  ))}
                </p>
              )}
            </ScrollArea>

            {/* controls */}
            <div className="border-t border-[hsl(26_14%_18%)] px-6 py-4 flex items-center gap-3 flex-wrap">
              {playState !== "playing" ? (
                <Button
                  onClick={handlePlay}
                  disabled={!script || loading}
                  data-testid="talking-tour-play-button"
                  className="bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a] font-semibold rounded-full h-11 px-6 gap-2 transition-colors duration-200"
                >
                  <Play size={16} /> {playState === "paused" ? L.play : L.listen}
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  data-testid="talking-tour-pause-button"
                  className="bg-[#e3b448] hover:bg-[#f0c86a] text-[#14100b] font-semibold rounded-full h-11 px-6 gap-2 transition-colors duration-200"
                >
                  <Pause size={16} /> {L.pause}
                </Button>
              )}
              <Button
                onClick={handleReplay}
                disabled={!script || loading}
                variant="outline"
                data-testid="talking-tour-replay-button"
                className="rounded-full h-11 border-[#4a3a28] text-[#e0d4bc] hover:border-[#d07a3a] hover:text-[#f2ece1] gap-2 bg-transparent transition-colors duration-200"
              >
                <RotateCcw size={15} /> {L.replay}
              </Button>

              <div className="flex-1" />

              <Button
                onClick={loadQuestions}
                disabled={qLoading}
                variant="outline"
                data-testid="talking-tour-questions-button"
                className="rounded-full h-11 border-[#e3b448] text-[#e3b448] hover:bg-[#e3b448] hover:text-[#14100b] gap-2 bg-transparent transition-colors duration-200"
              >
                {qLoading ? <Loader2 size={14} className="animate-spin" /> : <HelpCircle size={15} />}
                {L.revealQuestions}
              </Button>
            </div>
          </div>

          {/* questions */}
          <AnimatePresence>
            {questions && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mmm-panel mt-3 px-6 py-4 max-h-[26vh] overflow-y-auto"
                data-testid="tour-questions-panel"
              >
                <p className="text-[13px] font-semibold text-[#e3b448] flex items-center gap-2 mb-2">
                  <HelpCircle size={14} /> {L.questions}
                </p>
                <ol className="space-y-1.5 list-decimal list-inside text-[12.5px] text-[#d9cdb4]">
                  {questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center mt-3 opacity-60">
            <WarliStrip count={9} size={15} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { QaList } from "@/components/QaList";
import { LABELS, communityColor, categoryGroup, backgroundsForCommunity } from "@/lib/constants";
import { aiTour, aiQuestions } from "@/lib/api";
import {
  speak,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  hasVoiceFor,
  isSpeechSupported,
  listVoicesFor,
  setPreferredVoice,
  getPreferredVoiceURI,
} from "@/lib/speech";
import { X, Play, Pause, RotateCcw, HelpCircle, Loader2, ArrowLeft, Mic2 } from "lucide-react";

export default function TourOverlay({ entry, lang: appLang, onClose, onDuck }) {
  const [lang, setLang] = useState(appLang);
  const [scripts, setScripts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playState, setPlayState] = useState("idle"); // idle | playing | paused
  const [wordIdx, setWordIdx] = useState(-1);
  const [qa, setQa] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [bgIdx, setBgIdx] = useState(0);
  const [voiceList, setVoiceList] = useState([]);
  const [voiceURI, setVoiceURI] = useState(null);
  const wordsRef = useRef([]);
  const activeWordRef = useRef(null);

  const script = scripts[lang];
  // memoized so the background-rotation effect has a stable dependency
  const backgrounds = useMemo(() => backgroundsForCommunity(entry.community), [entry.community]);

  // rotating backgrounds crossfade
  useEffect(() => {
    const iv = setInterval(() => setBgIdx((i) => (i + 1) % backgrounds.length), 11000);
    return () => clearInterval(iv);
  }, [backgrounds.length]);

  // voice list per language (voices may load async)
  useEffect(() => {
    const load = () => {
      setVoiceList(listVoicesFor(lang));
      setVoiceURI(getPreferredVoiceURI(lang));
    };
    load();
    const t = setTimeout(load, 600);
    if (window.speechSynthesis) window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      clearTimeout(t);
      if (window.speechSynthesis) window.speechSynthesis.removeEventListener?.("voiceschanged", load);
    };
  }, [lang]);

  const fetchScript = useCallback(
    async (l) => {
      if (scripts[l]) return;
      setLoading(true);
      setError(null);
      try {
        const res = await aiTour(entry.entry_id, l);
        setScripts((s) => ({ ...s, [l]: res.script }));
      } catch (err) {
        console.error("Tour script generation failed:", err);
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
    setQa(null);
    setLang(l);
  };

  const handleVoiceChange = (uri) => {
    setVoiceURI(uri);
    setPreferredVoice(lang, uri);
    if (playState === "playing") {
      handleReplay();
    }
  };

  const loadQa = async () => {
    if (qLoading) return;
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
        {/* rotating immersive backgrounds */}
        {backgrounds.map((b, i) => (
          <div
            key={b.src}
            className="tour-bg-layer"
            style={{ backgroundImage: `url(${b.src})`, opacity: i === bgIdx ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: "radial-gradient(1000px circle at 50% 30%, rgba(16,10,5,0.55), rgba(10,6,3,0.92))" }} />

        <div className="relative w-full max-w-4xl mx-3 md:mx-6 max-h-[94vh] flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={onClose}
                aria-label="Back"
                data-testid="talking-tour-back"
                className="w-11 h-11 rounded-xl mmm-panel flex items-center justify-center hover:border-[#d07a3a] transition-colors duration-200 shrink-0"
              >
                <ArrowLeft size={20} color="#d3a273" />
              </button>
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${playState === "playing" ? "speaking-pulse" : ""}`}
                style={{ borderColor: col, background: "rgba(20,14,8,0.9)" }}
              >
                <TribalIcon name={categoryGroup(entry.category).icon} size={26} color={col} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[13.5px] uppercase tracking-[0.3em] text-[#d3a273]">{L.talkingTour}</p>
                <h2 className="text-xl md:text-3xl font-bold text-[#f7f1e5] leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                  {entry.food_name}
                </h2>
                <p className="text-[16px] text-[#c9bda6] truncate">
                  <span style={{ color: col, fontWeight: 600 }}>{entry.community}</span> · {entry.block_village || entry.district}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close tour"
              data-testid="talking-tour-close"
              className="w-11 h-11 rounded-xl mmm-panel flex items-center justify-center hover:border-[#d07a3a] transition-colors duration-200 shrink-0"
            >
              <X size={20} color="#d3a273" />
            </button>
          </div>

          {/* language tabs + voice picker */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap" data-testid="talking-tour-language-toggle">
            {["en", "bn", "hi"].map((l) => (
              <button
                key={l}
                onClick={() => handleLang(l)}
                data-testid={`talking-tour-lang-${l}`}
                className={`px-5 py-2 rounded-full text-[17px] border transition-colors duration-200 ${
                  lang === l
                    ? "bg-[#e3b448] border-[#e3b448] text-[#14100b] font-bold"
                    : "border-[#4a3a28] text-[#e0d4bc] hover:border-[#e3b448] bg-[rgba(20,14,8,0.7)]"
                }`}
              >
                {l === "en" ? "English" : l === "bn" ? "বাংলা" : "हिन्दी"}
              </button>
            ))}

            {voiceList.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Mic2 size={16} className="text-[#d3a273]" />
                <Select value={voiceURI || voiceList[0]?.voiceURI} onValueChange={handleVoiceChange}>
                  <SelectTrigger
                    className="h-10 rounded-full bg-[rgba(20,14,8,0.8)] border-[#4a3a28] text-[#e0d4bc] text-[15.5px] w-[190px]"
                    data-testid="talking-tour-voice-select"
                  >
                    <SelectValue placeholder={L.voice} />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(28_22%_10%)] border-[hsl(26_14%_22%)] text-[#e0d4bc] max-h-64">
                    {voiceList.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI} className="text-[15.5px]">
                        {v.name.replace(/^(Microsoft|Google)\s*/i, "").slice(0, 28)} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!voiceOk && script && (
              <span className="text-[14.5px] text-[#e3b448] w-full">⚠ {L.noVoice}</span>
            )}
          </div>

          {/* transcript card */}
          <div className="mmm-panel mmm-panel-carved relative flex-1 min-h-0 flex flex-col" style={{ background: "hsl(28 22% 9%)" }}>
            <div className="flex-1 min-h-0 px-6 md:px-10 py-6 overflow-y-auto" style={{ maxHeight: "40vh" }}>
              {loading && (
                <div className="space-y-3" data-testid="tour-loading">
                  <p className="text-[18px] text-[#d3a273] flex items-center gap-2">
                    <Loader2 size={17} className="animate-spin" /> {L.generating}
                  </p>
                  <Skeleton className="h-5 w-full bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-5 w-11/12 bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-5 w-full bg-[hsl(26_16%_16%)]" />
                  <Skeleton className="h-5 w-3/4 bg-[hsl(26_16%_16%)]" />
                </div>
              )}
              {error && !loading && (
                <div className="text-[17px] text-[#e08a4e]">
                  {error}{" "}
                  <button onClick={() => fetchScript(lang)} className="underline text-[#e3b448] font-semibold">Retry</button>
                </div>
              )}
              {script && !loading && (
                <p className="text-[19px] md:text-[22px] leading-[2] text-[#e8dcc5]" data-testid="tour-transcript">
                  {words.map((w, i) => (
                    // char offset is a stable unique key for each word position
                    <span key={offsets[i] ?? `w-${i}`} ref={i === wordIdx ? activeWordRef : null} className={`tour-word ${i === wordIdx ? "active" : ""}`}>
                      {w}{" "}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* controls */}
            <div className="border-t border-[hsl(26_14%_18%)] px-6 py-4 flex items-center gap-3 flex-wrap">
              {playState !== "playing" ? (
                <Button
                  onClick={handlePlay}
                  disabled={!script || loading}
                  data-testid="talking-tour-play-button"
                  className="bg-[#d07a3a] hover:bg-[#e08a4e] text-[#1a120a] font-bold text-[18px] rounded-full h-12 px-7 gap-2 transition-colors duration-200"
                >
                  <Play size={18} /> {playState === "paused" ? L.play : L.listen}
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  data-testid="talking-tour-pause-button"
                  className="bg-[#e3b448] hover:bg-[#f0c86a] text-[#14100b] font-bold text-[18px] rounded-full h-12 px-7 gap-2 transition-colors duration-200"
                >
                  <Pause size={18} /> {L.pause}
                </Button>
              )}
              <Button
                onClick={handleReplay}
                disabled={!script || loading}
                variant="outline"
                data-testid="talking-tour-replay-button"
                className="rounded-full h-12 text-[17px] border-[#4a3a28] text-[#e0d4bc] hover:border-[#d07a3a] hover:text-[#f2ece1] gap-2 bg-transparent transition-colors duration-200"
              >
                <RotateCcw size={17} /> {L.replay}
              </Button>

              <div className="flex-1" />

              <Button
                onClick={loadQa}
                disabled={qLoading}
                variant="outline"
                data-testid="talking-tour-questions-button"
                className="rounded-full h-12 text-[17px] border-[#e3b448] text-[#e3b448] hover:bg-[#e3b448] hover:text-[#14100b] gap-2 bg-transparent transition-colors duration-200"
              >
                {qLoading ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={17} />}
                {L.revealQuestions}
              </Button>
            </div>
          </div>

          {/* Q&A */}
          <AnimatePresence>
            {qa && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mmm-panel mt-3 px-6 py-4 max-h-[30vh] overflow-y-auto"
                data-testid="tour-questions-panel"
              >
                <p className="text-[18px] font-bold text-[#e3b448] flex items-center gap-2 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  <HelpCircle size={17} /> {L.questions}
                </p>
                <QaList qa={qa} triggerClassName="text-[17px] text-[#e8dcc5]" answerClassName="text-[16.5px]" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center mt-3 opacity-60">
            <WarliStrip count={9} size={17} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

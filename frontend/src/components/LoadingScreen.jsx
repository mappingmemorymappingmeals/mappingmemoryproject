import React, { useEffect, useState } from "react";
import { TribalIcon, WarliStrip } from "@/components/TribalIcons";
import { LOADING_MESSAGES, LABELS } from "@/lib/constants";

export default function LoadingScreen({ lang = "en", onDone, duration = 7500 }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = LOADING_MESSAGES[lang] || LOADING_MESSAGES.en;
  const L = LABELS[lang] || LABELS.en;

  useEffect(() => {
    const per = Math.floor(duration / msgs.length);
    const iv = setInterval(() => setMsgIdx((i) => Math.min(i + 1, msgs.length - 1)), per);
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [duration, msgs.length, onDone]);

  return (
    <div className="loading-screen" data-testid="loading-screen">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 30% 20%, rgba(198,90,58,.16), transparent 55%), radial-gradient(700px circle at 75% 80%, rgba(46,111,122,.14), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center text-center px-6">
        <div className="loading-spin mb-8">
          <TribalIcon name="spiral" size={72} color="#d07a3a" strokeWidth={1.2} />
        </div>

        <p className="font-mono text-[15px] uppercase tracking-[0.35em] text-[#c89b6c] mb-3">
          {L.loadingTitle}
        </p>

        <h1 className="text-3xl md:text-5xl font-bold text-[#f2ece1] intro-title-glow mb-8" style={{ fontFamily: "var(--font-display)" }}>
          {L.title}
        </h1>

        <p
          key={msgIdx}
          className="loading-msg text-lg md:text-2xl text-[#e3cfa8] italic max-w-2xl min-h-[64px] leading-relaxed"
          data-testid="loading-message"
          style={{ fontFamily: "var(--font-display)" }}
        >
          “{msgs[msgIdx]}”
        </p>

        <div className="loading-bar mt-8 mb-6">
          <div className="loading-bar-fill" />
        </div>

        <WarliStrip count={9} size={20} />
      </div>
    </div>
  );
}

// Web Speech API helpers — EN / BN / HI with emotional modulation & voice selection
let voices = [];

function refreshVoices() {
  if (window.speechSynthesis) voices = window.speechSynthesis.getVoices() || [];
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

const LANG_PREFS = {
  en: ["en-IN", "en-GB", "en-US", "en"],
  bn: ["bn-IN", "bn-BD", "bn"],
  hi: ["hi-IN", "hi"],
};

// Rank voices: prefer Google/natural/neural voices, then locale match order
function rankVoice(v, lang) {
  const prefs = LANG_PREFS[lang] || ["en"];
  let score = 0;
  const vl = (v.lang || "").toLowerCase();
  const idx = prefs.findIndex((p) => vl.startsWith(p.toLowerCase()));
  if (idx === -1) return -1;
  score += (prefs.length - idx) * 10;
  const name = (v.name || "").toLowerCase();
  if (name.includes("natural") || name.includes("neural")) score += 8;
  if (name.includes("google")) score += 6;
  if (name.includes("microsoft")) score += 4;
  if (!v.localService) score += 3; // cloud voices usually better
  return score;
}

export function listVoicesFor(lang) {
  refreshVoices();
  return voices
    .map((v) => ({ v, s: rankVoice(v, lang) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

const voiceOverride = {}; // lang -> voiceURI (user's choice)

export function setPreferredVoice(lang, voiceURI) {
  voiceOverride[lang] = voiceURI;
  try {
    localStorage.setItem(`mmm-voice-${lang}`, voiceURI);
  } catch (_) {}
}

export function getPreferredVoiceURI(lang) {
  if (voiceOverride[lang]) return voiceOverride[lang];
  try {
    return localStorage.getItem(`mmm-voice-${lang}`);
  } catch (_) {
    return null;
  }
}

export function getVoiceFor(lang) {
  const ranked = listVoicesFor(lang);
  const prefURI = getPreferredVoiceURI(lang);
  if (prefURI) {
    const chosen = ranked.find((v) => v.voiceURI === prefURI);
    if (chosen) return chosen;
  }
  return ranked[0] || null;
}

export function hasVoiceFor(lang) {
  return !!getVoiceFor(lang);
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// ---- Emotional sentence-chunked narration ----
// Splits text into sentences and speaks each with slight pitch/rate variation
// for a warmer, more human delivery. Word-boundary highlighting preserved via
// cumulative character offsets.

let session = { id: 0, cancelled: true };

function splitSentences(text) {
  // split on sentence enders (., !, ?, । danda) keeping the delimiter
  const parts = text.match(/[^.!?।৷]+[.!?।৷]*\s*/g) || [text];
  return parts.filter((s) => s.trim().length > 0);
}

function moodFor(sentence, i, total) {
  const s = sentence.trim();
  let pitch = 1.02;
  let rate = 0.92;
  if (i === 0) {
    pitch = 1.08; // welcoming opening
    rate = 0.9;
  } else if (i === total - 1) {
    pitch = 0.98; // reflective close
    rate = 0.88;
  }
  if (/[?？]\s*$/.test(s)) pitch += 0.07; // questions lift
  if (/[!！]\s*$/.test(s)) {
    pitch += 0.05;
    rate += 0.04; // excitement
  }
  if (/sacred|deity|god|ritual|দেবতা|পবিত্র|देवता|पवित्र/i.test(s)) {
    pitch -= 0.04;
    rate -= 0.05; // reverent slowdown
  }
  // gentle wave across the narration
  pitch += 0.03 * Math.sin(i * 1.3);
  return { pitch: Math.max(0.8, Math.min(1.25, pitch)), rate: Math.max(0.75, Math.min(1.1, rate)) };
}

export function speak(text, lang, { onBoundary, onEnd, onStart } = {}) {
  if (!isSpeechSupported()) return false;
  stopSpeaking();
  const myId = ++session.id;
  session.cancelled = false;

  const voice = getVoiceFor(lang);
  const fallbackLang = lang === "bn" ? "bn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  const sentences = splitSentences(text);

  // cumulative offsets of each sentence within full text
  const offsets = [];
  let cursor = 0;
  for (const s of sentences) {
    const idx = text.indexOf(s, cursor);
    offsets.push(idx === -1 ? cursor : idx);
    cursor = (idx === -1 ? cursor : idx) + s.length;
  }

  let started = false;

  const speakChunk = (i) => {
    if (session.cancelled || myId !== session.id) return;
    if (i >= sentences.length) {
      onEnd && onEnd();
      return;
    }
    const u = new SpeechSynthesisUtterance(sentences[i]);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = fallbackLang;
    }
    const mood = moodFor(sentences[i], i, sentences.length);
    u.pitch = mood.pitch;
    u.rate = mood.rate;
    u.volume = 1;
    if (onBoundary) {
      u.onboundary = (e) => {
        if (session.cancelled || myId !== session.id) return;
        onBoundary(offsets[i] + (e.charIndex ?? 0));
      };
    }
    u.onstart = () => {
      if (!started) {
        started = true;
        onStart && onStart();
      }
      // still highlight sentence start even if boundary events don't fire (common for bn/hi)
      if (onBoundary && !session.cancelled && myId === session.id) onBoundary(offsets[i]);
    };
    u.onend = () => {
      if (session.cancelled || myId !== session.id) return;
      // natural breathing pause between sentences
      setTimeout(() => speakChunk(i + 1), 180);
    };
    u.onerror = () => {
      if (session.cancelled || myId !== session.id) return;
      setTimeout(() => speakChunk(i + 1), 60);
    };
    window.speechSynthesis.speak(u);
  };

  speakChunk(0);
  return true;
}

export function pauseSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.pause();
}

export function resumeSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.resume();
}

export function stopSpeaking() {
  session.cancelled = true;
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}

export function isPaused() {
  return isSpeechSupported() && window.speechSynthesis.paused;
}

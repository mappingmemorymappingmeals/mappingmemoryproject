// Web Speech API helpers — EN / BN / HI
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

export function getVoiceFor(lang) {
  refreshVoices();
  const prefs = LANG_PREFS[lang] || ["en"];
  for (const pref of prefs) {
    const v = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(pref.toLowerCase()));
    if (v) return v;
  }
  return null;
}

export function hasVoiceFor(lang) {
  return !!getVoiceFor(lang);
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let currentUtterance = null;

export function speak(text, lang, { onBoundary, onEnd, onStart } = {}) {
  if (!isSpeechSupported()) return false;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  const voice = getVoiceFor(lang);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = lang === "bn" ? "bn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  }
  u.rate = 0.95;
  u.pitch = 1.0;
  if (onBoundary) u.onboundary = (e) => onBoundary(e.charIndex ?? 0);
  if (onEnd) u.onend = () => onEnd();
  u.onerror = () => onEnd && onEnd();
  if (onStart) u.onstart = () => onStart();
  currentUtterance = u;
  window.speechSynthesis.speak(u);
  return true;
}

export function pauseSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.pause();
}

export function resumeSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.resume();
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}

export function isPaused() {
  return isSpeechSupported() && window.speechSynthesis.paused;
}

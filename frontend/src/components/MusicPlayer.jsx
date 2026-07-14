import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { TribalIcon } from "@/components/TribalIcons";
import { LABELS, TRACKS, trackForCommunity } from "@/lib/constants";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

const MusicPlayer = forwardRef(function MusicPlayer({ lang }, ref) {
  const audioRef = useRef(null);
  const trackIdxRef = useRef(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [ducked, setDucked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const L = LABELS[lang];
  trackIdxRef.current = trackIdx;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = ducked ? Math.min(0.07, volume) : volume;
  }, [volume, ducked]);

  // QUEUE: when a track ends, auto-advance to the next one
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      const next = (trackIdxRef.current + 1) % TRACKS.length;
      setTrackIdx(next);
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = TRACKS[trackIdx].src;
    a.loop = false; // queue mode — no looping, advance on end
    if (playing) {
      a.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  useImperativeHandle(ref, () => ({
    start() {
      const a = audioRef.current;
      if (!a || playing) return;
      a.src = TRACKS[trackIdxRef.current].src;
      a.loop = false;
      a.volume = volume;
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    },
    playForCommunity(community) {
      const idx = trackForCommunity(community);
      if (idx !== trackIdxRef.current) setTrackIdx(idx);
    },
    duck(on) {
      setDucked(on);
    },
  }));

  return (
    <div
      className="absolute bottom-4 right-4 z-30 mmm-panel px-4 py-3 flex items-center gap-3"
      data-testid="tribal-music-player"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <audio ref={audioRef} preload="none" />
      <div className={`eq ${playing ? "" : "paused"}`} aria-hidden="true">
        <span style={{ height: 7 }} />
        <span style={{ height: 14 }} />
        <span style={{ height: 9 }} />
        <span style={{ height: 13 }} />
      </div>

      <button
        onClick={() => setTrackIdx((trackIdx + TRACKS.length - 1) % TRACKS.length)}
        aria-label="Previous track"
        data-testid="tribal-music-prev-button"
        className="text-[#a08a68] hover:text-[#e3b448] transition-colors duration-200"
      >
        <SkipBack size={17} />
      </button>

      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        data-testid="tribal-music-play-button"
        className="w-11 h-11 rounded-full bg-[#d07a3a] hover:bg-[#e08a4e] flex items-center justify-center text-[#1a120a] transition-colors duration-200"
      >
        {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      <button
        onClick={() => setTrackIdx((trackIdx + 1) % TRACKS.length)}
        aria-label="Next track"
        data-testid="tribal-music-next-button"
        className="text-[#a08a68] hover:text-[#e3b448] transition-colors duration-200"
      >
        <SkipForward size={17} />
      </button>

      <div className="leading-tight min-w-0">
        <p className="font-mono text-[12.5px] uppercase tracking-[0.2em] text-[#a08a68] flex items-center gap-1.5">
          <TribalIcon name="music" size={12} color="#a08a68" /> {L.music} · {trackIdx + 1}/{TRACKS.length}
        </p>
        <p className="text-[16px] font-semibold text-[#e8dcc5] truncate max-w-[150px]">{TRACKS[trackIdx].name}</p>
      </div>

      {expanded && (
        <div className="w-24 pl-1" data-testid="tribal-music-volume-slider">
          <Slider
            value={[volume * 100]}
            onValueChange={(v) => setVolume(v[0] / 100)}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-[#e3b448] [&_[role=slider]]:border-[#e3b448] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4"
          />
        </div>
      )}
    </div>
  );
});

export default MusicPlayer;

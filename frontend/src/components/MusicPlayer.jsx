import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { TribalIcon } from "@/components/TribalIcons";
import { LABELS, TRACKS, trackForCommunity } from "@/lib/constants";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

const MusicPlayer = forwardRef(function MusicPlayer({ lang }, ref) {
  const audioRef = useRef(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [ducked, setDucked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const L = LABELS[lang];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = ducked ? Math.min(0.07, volume) : volume;
  }, [volume, ducked]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = TRACKS[trackIdx].src;
    a.loop = true;
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
      a.src = TRACKS[trackIdx].src;
      a.loop = true;
      a.volume = volume;
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    },
    playForCommunity(community) {
      const idx = trackForCommunity(community);
      if (idx !== trackIdx) setTrackIdx(idx);
    },
    duck(on) {
      setDucked(on);
    },
  }));

  return (
    <div
      className="absolute bottom-4 right-4 z-30 mmm-panel px-3.5 py-2.5 flex items-center gap-2.5"
      data-testid="tribal-music-player"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <audio ref={audioRef} preload="none" />
      <div className={`eq ${playing ? "" : "paused"}`} aria-hidden="true">
        <span style={{ height: 6 }} />
        <span style={{ height: 12 }} />
        <span style={{ height: 8 }} />
        <span style={{ height: 11 }} />
      </div>

      <button
        onClick={() => setTrackIdx((trackIdx + TRACKS.length - 1) % TRACKS.length)}
        aria-label="Previous track"
        data-testid="tribal-music-prev-button"
        className="text-[#a08a68] hover:text-[#e3b448] transition-colors duration-200"
      >
        <SkipBack size={14} />
      </button>

      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        data-testid="tribal-music-play-button"
        className="w-9 h-9 rounded-full bg-[#d07a3a] hover:bg-[#e08a4e] flex items-center justify-center text-[#1a120a] transition-colors duration-200"
      >
        {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <button
        onClick={() => setTrackIdx((trackIdx + 1) % TRACKS.length)}
        aria-label="Next track"
        data-testid="tribal-music-next-button"
        className="text-[#a08a68] hover:text-[#e3b448] transition-colors duration-200"
      >
        <SkipForward size={14} />
      </button>

      <div className="leading-tight min-w-0">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#a08a68] flex items-center gap-1">
          <TribalIcon name="music" size={10} color="#a08a68" /> {L.music}
        </p>
        <p className="text-[11.5px] text-[#e8dcc5] truncate max-w-[110px]">{TRACKS[trackIdx].name}</p>
      </div>

      {expanded && (
        <div className="w-20 pl-1" data-testid="tribal-music-volume-slider">
          <Slider
            value={[volume * 100]}
            onValueChange={(v) => setVolume(v[0] / 100)}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-[#e3b448] [&_[role=slider]]:border-[#e3b448] [&_[role=slider]]:w-3.5 [&_[role=slider]]:h-3.5"
          />
        </div>
      )}
    </div>
  );
});

export default MusicPlayer;

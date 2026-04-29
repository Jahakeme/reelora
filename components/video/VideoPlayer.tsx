"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  CornersOutIcon,
  CornersInIcon,
  GearIcon,
  SkipForwardIcon,
  SkipBackIcon,
} from "@phosphor-icons/react";
import { usePlayerStore } from "@/stores/player";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}:${rm.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, poster, title, playing, onPlayingChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const { volume, muted, setVolume: storeSetVolume, toggleMute: storeToggleMute } = usePlayerStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      onPlayingChange(true);
    } else {
      video.pause();
      onPlayingChange(false);
    }
  }, [onPlayingChange]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    storeToggleMute();
  }, [muted, storeToggleMute]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    storeSetVolume(val);
  }, [storeSetVolume]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const bar = progressRef.current;
      if (!video || !bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      video.currentTime = ratio * duration;
    },
    [duration]
  );

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onTimeUpdate() {
      setCurrentTime(video!.currentTime);
      if (video!.buffered.length > 0) {
        setBuffered(video!.buffered.end(video!.buffered.length - 1));
      }
    }

    function onLoadedMetadata() {
      setDuration(video!.duration);
      setIsLoading(false);
    }

    function onWaiting() {
      setIsLoading(true);
    }

    function onCanPlay() {
      setIsLoading(false);
    }

    function onEnded() {
      onPlayingChange(false);
      setShowControls(true);
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("ended", onEnded);
    };
  }, [onPlayingChange]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skip]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 group select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="none"
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-bg-surface/30 border-t-bg-surface rounded-full animate-spin" />
        </div>
      )}

      {/* Click-to-play overlay when paused */}
      {!playing && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-bg-base/60 flex items-center justify-center backdrop-blur-sm">
            <PlayIcon size={28} weight="fill" className="text-text-primary ml-1" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-bg-base/70 via-bg-base/20 to-transparent pt-16 pb-3 px-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1 bg-text-primary/20 rounded-full mb-3 cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 bg-text-primary/30 rounded-full"
            style={{ width: `${bufferProgress}%` }}
          />
          {/* Played */}
          <div
            className="absolute inset-y-0 left-0 bg-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-10)}
              className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
              aria-label="Rewind 10 seconds"
            >
              <SkipBackIcon size={18} weight="bold" />
            </button>

            <button
              onClick={togglePlay}
              className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <PauseIcon size={20} weight="fill" />
              ) : (
                <PlayIcon size={20} weight="fill" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
              aria-label="Forward 10 seconds"
            >
              <SkipForwardIcon size={18} weight="bold" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <SpeakerSlashIcon size={18} weight="fill" />
                ) : (
                  <SpeakerHighIcon size={18} weight="fill" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Time */}
            <span className="text-xs text-text-primary/80 font-mono ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
              aria-label="Settings"
            >
              <GearIcon size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-text-primary/10 transition-base text-text-primary"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <CornersInIcon size={18} weight="bold" />
              ) : (
                <CornersOutIcon size={18} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Title overlay (top) */}
      {title && (
        <div
          className={`absolute inset-x-0 top-0 bg-linear-to-b from-bg-base/50 to-transparent pt-3 pb-8 px-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-text-primary font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
}

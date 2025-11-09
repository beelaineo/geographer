"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

declare global {
  interface HTMLVideoElementEventMap {
    webkitbeginfullscreen: Event;
    webkitendfullscreen: Event;
    webkitpresentationmodechanged: Event;
  }

  interface HTMLVideoElement {
    webkitPresentationMode?: "inline" | "fullscreen" | "picture-in-picture";
    webkitEnterFullscreen?: () => void;
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }
}

type AutoplayVideoProps = {
  playbackId: string;
  className?: string;
};

export default function AutoplayVideo({ playbackId, className }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastPlaybackTimeRef = useRef(0);
  const wasFullscreenRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);
  const posterUrl = useMemo(
    () => `https://image.mux.com/${playbackId}/thumbnail.png?time=0`,
    [playbackId],
  );

  useEffect(() => {
    if (!posterUrl) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = posterUrl;

    return () => {
      image.src = "";
    };
  }, [posterUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const updateLastPlaybackTime = () => {
      lastPlaybackTimeRef.current = video.currentTime;
    };

    const resumeFromLastKnownTime = () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }

      const targetTime = lastPlaybackTimeRef.current;

      if (!Number.isNaN(targetTime) && Math.abs(video.currentTime - targetTime) > 0.1) {
        try {
          video.currentTime = targetTime;
        } catch {
          // ignore seek failures
        }
      }

      if (video.paused || video.ended) {
        resumeTimeoutRef.current = window.setTimeout(() => {
          resumeTimeoutRef.current = null;
          const playPromise = video.play();
          if (playPromise && typeof playPromise.then === "function") {
            playPromise.catch(() => {
              // autoplay might still be blocked; ignore failures
            });
          }
        }, 0);
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === video;

      if (isFullscreen) {
        wasFullscreenRef.current = true;
        return;
      }

      if (wasFullscreenRef.current) {
        wasFullscreenRef.current = false;
        resumeFromLastKnownTime();
      }
    };

    const handleWebkitBeginFullscreen = () => {
      wasFullscreenRef.current = true;
    };

    const handleWebkitEndFullscreen = () => {
      if (wasFullscreenRef.current) {
        wasFullscreenRef.current = false;
        resumeFromLastKnownTime();
      }
    };

    const handleWebkitPresentationModeChanged = () => {
      if (!video.webkitPresentationMode) {
        return;
      }

      if (video.webkitPresentationMode === "fullscreen") {
        wasFullscreenRef.current = true;
        return;
      }

      if (wasFullscreenRef.current && video.webkitPresentationMode === "inline") {
        wasFullscreenRef.current = false;
        resumeFromLastKnownTime();
      }
    };

    video.addEventListener("timeupdate", updateLastPlaybackTime);
    video.addEventListener("pause", updateLastPlaybackTime);
    video.addEventListener("seeked", updateLastPlaybackTime);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitbeginfullscreen", handleWebkitBeginFullscreen);
    video.addEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    video.addEventListener("webkitpresentationmodechanged", handleWebkitPresentationModeChanged);

    return () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      video.removeEventListener("timeupdate", updateLastPlaybackTime);
      video.removeEventListener("pause", updateLastPlaybackTime);
      video.removeEventListener("seeked", updateLastPlaybackTime);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener("webkitbeginfullscreen", handleWebkitBeginFullscreen);
      video.removeEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
      video.removeEventListener("webkitpresentationmodechanged", handleWebkitPresentationModeChanged);
    };
  }, []);

  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const enterFullscreen = () => {
      if (video.requestFullscreen) {
        video
          .requestFullscreen()
          .catch(() => {
            // ignore failures (user gesture requirement, etc.)
          });
        return true;
      }

      if (typeof video.webkitEnterFullscreen === "function") {
        try {
          video.webkitEnterFullscreen();
          return true;
        } catch {
          return false;
        }
      }

      if (typeof video.webkitRequestFullscreen === "function") {
        video.webkitRequestFullscreen().catch(() => {});
        return true;
      }

      if (typeof video.mozRequestFullScreen === "function") {
        video.mozRequestFullScreen().catch(() => {});
        return true;
      }

      if (typeof video.msRequestFullscreen === "function") {
        video.msRequestFullscreen().catch(() => {});
        return true;
      }

      return false;
    };

    const currentFullscreen = document.fullscreenElement;
    if (currentFullscreen === video) {
      lastPlaybackTimeRef.current = video.currentTime;
      document.exitFullscreen?.().catch(() => {});
      return;
    }

    if (enterFullscreen()) {
      wasFullscreenRef.current = true;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
      preload="auto"
      poster={posterUrl}
      className={["cursor-pointer", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      <source
        src={`https://stream.mux.com/${playbackId}.m3u8`}
        type="application/x-mpegURL"
      />
      Your browser does not support the video tag.
    </video>
  );
}


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

const RESUME_ATTEMPT_DELAYS = [0, 150, 300, 600, 1000];
const MAX_RESUME_ATTEMPTS = RESUME_ATTEMPT_DELAYS.length;

type HlsInstance = {
  destroy(): void;
  attachMedia(media: HTMLMediaElement): void;
  loadSource(source: string): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
};

type HlsConstructor = {
  new (config?: unknown): HlsInstance;
  isSupported(): boolean;
  Events: {
    MEDIA_ATTACHED: string;
    ERROR: string;
  };
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
  const hlsPlaybackUrl = useMemo(
    () => `https://stream.mux.com/${playbackId}.m3u8`,
    [playbackId],
  );
  const mp4FallbackUrl = useMemo(
    () => `https://stream.mux.com/${playbackId}/medium.mp4`,
    [playbackId],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let hlsInstance: HlsInstance | null = null;
    let cancelled = false;

    const setMp4Fallback = () => {
      if (video.src !== mp4FallbackUrl) {
        video.src = mp4FallbackUrl;
        video.load();
      }
    };

    const setup = async () => {
      const canPlayHlsNatively =
        video.canPlayType("application/vnd.apple.mpegurl") ||
        video.canPlayType("application/x-mpegURL");

      if (canPlayHlsNatively) {
        if (video.src !== hlsPlaybackUrl) {
          video.src = hlsPlaybackUrl;
          video.load();
        }
        return;
      }

      const { default: HlsModule } = await import("hls.js");
      const Hls = HlsModule as HlsConstructor;
      if (cancelled) {
        return;
      }

      if (!Hls.isSupported()) {
        setMp4Fallback();
        return;
      }

      hlsInstance = new Hls({
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        startPosition: lastPlaybackTimeRef.current || -1,
      });

      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (cancelled) {
          return;
        }
        hlsInstance?.loadSource(hlsPlaybackUrl);
      });

      hlsInstance.on(Hls.Events.ERROR, (...args) => {
        const [, data] = args as [unknown, { fatal?: boolean } | undefined];
        if (data?.fatal) {
          hlsInstance?.destroy();
          hlsInstance = null;
          setMp4Fallback();
        }
      });
    };

    setup().catch(() => {
      setMp4Fallback();
    });

    return () => {
      cancelled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [hlsPlaybackUrl, mp4FallbackUrl]);

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

    const clearResumeTimeout = () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };

    const scheduleResumeAttempt = (attempt: number) => {
      if (attempt >= MAX_RESUME_ATTEMPTS) {
        return;
      }

      clearResumeTimeout();

      const delay = RESUME_ATTEMPT_DELAYS[Math.min(attempt, RESUME_ATTEMPT_DELAYS.length - 1)];
      resumeTimeoutRef.current = window.setTimeout(() => {
        resumeTimeoutRef.current = null;
        performResumeAttempt(attempt);
      }, delay);
    };

    const performResumeAttempt = (attempt: number) => {
      const currentVideo = videoRef.current;
      if (!currentVideo) {
        return;
      }

      const targetTime = lastPlaybackTimeRef.current;
      if (!Number.isNaN(targetTime) && Math.abs(currentVideo.currentTime - targetTime) > 0.1) {
        try {
          currentVideo.currentTime = targetTime;
        } catch {
          // ignore seek failures
        }
      }

      let playPromise: Promise<void> | void;

      try {
        playPromise = currentVideo.play();
      } catch {
        scheduleResumeAttempt(attempt + 1);
        return;
      }

      if (playPromise && typeof (playPromise as Promise<void>).then === "function") {
        (playPromise as Promise<void>)
          .then(() => {
            const latestVideo = videoRef.current;
            if (!latestVideo) {
              return;
            }

            if (latestVideo.paused) {
              scheduleResumeAttempt(attempt + 1);
            }
          })
          .catch(() => {
            scheduleResumeAttempt(attempt + 1);
          });
        return;
      }

      if (currentVideo.paused) {
        scheduleResumeAttempt(attempt + 1);
      }
    };

    const resumeFromLastKnownTime = () => {
      scheduleResumeAttempt(0);
    };

    const updateLastPlaybackTime = () => {
      const currentVideo = videoRef.current;
      if (!currentVideo) {
        return;
      }
      lastPlaybackTimeRef.current = currentVideo.currentTime;
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

    const handlePause = () => {
      updateLastPlaybackTime();

      const currentVideo = videoRef.current;
      if (!currentVideo) {
        return;
      }

      if (!currentVideo.ended) {
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
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", updateLastPlaybackTime);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitbeginfullscreen", handleWebkitBeginFullscreen);
    video.addEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    video.addEventListener("webkitpresentationmodechanged", handleWebkitPresentationModeChanged);

    return () => {
      clearResumeTimeout();
      video.removeEventListener("timeupdate", updateLastPlaybackTime);
      video.removeEventListener("pause", handlePause);
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
      Your browser does not support the video tag.
    </video>
  );
}


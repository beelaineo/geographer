"use client";

import { useCallback, useRef } from "react";

type AutoplayVideoProps = {
  playbackId: string;
  className?: string;
};

export default function AutoplayVideo({ playbackId, className }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

      const anyVideo = video as HTMLElement & {
        webkitEnterFullscreen?: () => void;
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (typeof anyVideo.webkitEnterFullscreen === "function") {
        try {
          anyVideo.webkitEnterFullscreen();
          return true;
        } catch {
          return false;
        }
      }

      if (typeof anyVideo.webkitRequestFullscreen === "function") {
        anyVideo.webkitRequestFullscreen().catch(() => {});
        return true;
      }

      if (typeof anyVideo.mozRequestFullScreen === "function") {
        anyVideo.mozRequestFullScreen().catch(() => {});
        return true;
      }

      if (typeof anyVideo.msRequestFullscreen === "function") {
        anyVideo.msRequestFullscreen().catch(() => {});
        return true;
      }

      return false;
    };

    const currentFullscreen = document.fullscreenElement;
    if (currentFullscreen === video) {
      document.exitFullscreen?.().catch(() => {});
      return;
    }

    enterFullscreen();
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


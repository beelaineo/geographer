"use client";

import { useState } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import type { CSSProperties } from "react";
import Image from "next/image";

import InterviewBody from "./InterviewBody";

const SHARED_GREY_BACKGROUND = "#efeeea";

type InterviewPageBodyWithBgToggleProps = {
  title: string;
  body: PortableTextBlock[] | null | undefined;
  coverUrl: string | null;
  coverAlt: string;
  coverDisplayW: number;
  coverDisplayH: number;
  interviewBackgroundColor?: string;
};

export default function InterviewPageBodyWithBgToggle({
  title,
  body,
  coverUrl,
  coverAlt,
  coverDisplayW,
  coverDisplayH,
  interviewBackgroundColor
}: InterviewPageBodyWithBgToggleProps) {
  const [isGreyBackgroundEnabled, setIsGreyBackgroundEnabled] = useState(false);
  const activeBackgroundColor = isGreyBackgroundEnabled
    ? SHARED_GREY_BACKGROUND
    : interviewBackgroundColor;

  const panelStyle = activeBackgroundColor
    ? ({ ["--interview-bg" as string]: activeBackgroundColor } as CSSProperties)
    : undefined;

  return (
    <main className="relative grid grid-cols-1 md:grid-cols-2">
      {coverUrl && coverAlt ? (
        <div className="relative mx-auto flex w-full max-w-[270px] flex-col items-center justify-center py-28 md:sticky md:top-0 md:h-screen md:max-w-none md:py-0">
          <Image
            src={coverUrl}
            alt={coverAlt}
            width={coverDisplayW}
            height={coverDisplayH}
            className="h-auto max-h-[75vh] max-w-[min(100%,480px)] object-contain"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          <button
            type="button"
            onClick={() => setIsGreyBackgroundEnabled((current) => !current)}
            role="switch"
            aria-checked={isGreyBackgroundEnabled}
            className="absolute bottom-5 left-5 hidden type-body-sans items-center gap-3 bg-white transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:inline-flex"
          >
            <span className="">
             Background
            </span>
            <span
              aria-hidden="true"
              className={[
                "relative h-5 w-9 rounded-full border border-black transition-colors",
                isGreyBackgroundEnabled ? "bg-white" : "bg-black"
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform",
                  isGreyBackgroundEnabled ?  "left-0.5 translate-x-0 bg-black" : "left-0.5 translate-x-4 bg-white"
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      ) : null}

      <div
        className="mx-auto flex w-full flex-col items-center px-8 py-8 md:px-14 md:py-24 md:[background-color:var(--interview-bg)]"
        style={panelStyle}
      >
        <h1 className="hidden">{title}</h1>

        {body?.length ? (
          <div className="w-full text-left">
            <InterviewBody value={body} className="whitespace-pre-line space-y-5" />
          </div>
        ) : null}
      </div>
    </main>
  );
}

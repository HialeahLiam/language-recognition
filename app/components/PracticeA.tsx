"use client";
import React, { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@heroicons/react/20/solid";

interface Props {
  snippet: {
    videoSrc: string;
    words: {
      text: string;
      startTime: number;
      endTime: number;
    }[];
  };
}

function PracticeA({ snippet }: Props) {
  const [currentWord, setCurrentWord] = useState("58.7659.28");
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timer | null>(
    null
  );
  const video = useRef(null);

  function updateCurrentWord(currentTime: number) {
    const match = snippet.words.find(
      (w) => w.startTime <= currentTime && currentTime <= w.endTime
    );
    console.log({ match });

    if (match) {
      const key = `${match.startTime}${match.endTime}`;
      setCurrentWord(key);
    }
  }

  function handlePlay() {
    const videoElement = video.current as unknown as HTMLVideoElement;
    setProgressInterval(
      setInterval(() => {
        console.log("inter");
        if (!videoElement.paused) {
          updateCurrentWord(videoElement.currentTime);
          console.log(videoElement.currentTime);
        }
      }, 100)
    );

    videoElement.play();
  }

  function handleVideoEnd() {
    if (progressInterval) clearInterval(progressInterval);
  }

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col items-center">
      <video
        onProgress={() => console.log("progress")}
        onSeeked={() => console.log("seeked")}
        onEnded={handleVideoEnd}
        ref={video}
        controls
        height={300}
        className="h-60 mb-20"
        src={snippet.videoSrc}
      ></video>
      <p>
        {snippet.words.map((w) => {
          const key = `${w.startTime}${w.endTime}`;
          return (
            <span
              className={`${key === currentWord ? "text-red-500" : ""}`}
              key={key}
            >
              {w.text}
            </span>
          );
        })}
      </p>
      <button
        type="button"
        onClick={handlePlay}
        className="rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <PlayIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default PracticeA;

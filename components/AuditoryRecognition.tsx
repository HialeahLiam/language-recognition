"use client";
import React, { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@heroicons/react/20/solid";
import { Button } from "./ui/button";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface Props {
  snippet: {
    videoSrc: string;
    testedWordId: string;
    wordChoices: string[];
    words: {
      id: string;
      text: string;
      startTime: number;
      endTime: number;
    }[];
  };
  onNextSnippet: () => void;
}

function AuditoryRecognition({ snippet, onNextSnippet }: Props) {
  const [currentWord, setCurrentWord] = useState("");
  const [guessRevealed, setGuessRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [snippetPlaying, setSnippetPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  // const [progressInterval, setProgressInterval] = useState<NodeJS.Timer | null>(
  //   null
  // );

  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);
  const video = useRef(null);
  const progressIntervalRef = useRef<NodeJS.Timer>();

  const testedWord = snippet.words.find(
    (w) => w.id === snippet.testedWordId
  )?.text;

  function updateCurrentWord(currentTime: number) {
    const match = snippet.words.find(
      (w) => w.startTime <= currentTime && currentTime <= w.endTime
    );

    if (match) {
      setCurrentWord(match.id);
    }
  }

  function handleCheckGuess() {
    if (guess === "") return;
    if (
      guess.toLocaleLowerCase().trim() ===
      testedWord?.toLocaleLowerCase().trim()
    )
      setGuessCorrect(true);
    else setGuessCorrect(false);
    setGuessRevealed(true);
  }

  function handlePlay() {
    console.log("play");
    const videoElement = video.current as unknown as HTMLVideoElement;

    progressIntervalRef.current = setInterval(() => {
      if (!videoElement.paused) {
        updateCurrentWord(videoElement.currentTime);
      }
    }, 100);
    videoElement.play();

    setSnippetPlaying(true);
  }

  function handleVideoEnd() {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setCurrentWord("");
    setSnippetPlaying(false);
  }

  function reset() {
    setGuessRevealed(false);
    setGuess("");
    setGuessCorrect(null);
  }

  function handleContinue() {
    reset();
    onNextSnippet();
  }

  return (
    <div className="mx-auto sm:px-6 lg:px-8 flex flex-col items-center ">
      <div className="relative mb-20 lg:h-72 aspect-video ">
        <video
          onEnded={handleVideoEnd}
          onPlay={handlePlay}
          onLoadedData={() => setVideoLoaded(true)}
          ref={video}
          playsInline
          autoPlay
          className=""
          src={snippet.videoSrc}
        ></video>
        <div
          className={cn(
            "absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex  items-center justify-center cursor-pointer",
            (!videoLoaded || snippetPlaying) && "hidden"
          )}
          onClick={handlePlay}
        >
          <button>
            <PlayIcon className="fill-none stroke-white h-12"></PlayIcon>
          </button>
        </div>
      </div>
      {guessCorrect !== null && guessCorrect && <p>Correct!</p>}
      {guessCorrect !== null && !guessCorrect && <p>Incorrect</p>}
      <div className="flex flex-wrap lg:mb-32 mb-20">
        {snippet.words.map((w) => {
          const key = w.id;
          return (
            <span
              className={`
              ${key === currentWord ? "border-b border-red-400" : ""} 
              ${
                key === currentWord && w.id !== snippet.testedWordId
                  ? "text-red-500"
                  : ""
              } 
              ${w.id === snippet.testedWordId ? " mx-2" : ""}
              ${
                w.id === snippet.testedWordId && !guessRevealed
                  ? "text-red-400/0 bg-gray-200 rounded"
                  : ""
              }
              ${
                w.id === snippet.testedWordId && guessRevealed
                  ? `${guessCorrect ? "text-green-400" : "text-red-400"}`
                  : ""
              }
              mr-1
              `}
              key={key}
            >
              {w.text}
            </span>
          );
        })}
      </div>
      <div className="flex items-center">
        <input
          name="guess"
          id="guess"
          className=" mr-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          style={{
            "-webkit-appearance": "none",
          }}
          onChange={(e) => setGuess(e.target.value)}
          value={guess}
          autoComplete="off"
        />

        <Button
          onClick={handleCheckGuess}
          className="rounded-full h-12 aspect-square border-2"
          variant={"outline"}
        >
          <CheckIcon></CheckIcon>
        </Button>
      </div>
      {guessRevealed && (
        // <Button
        //   onClick={handleContinue}
        //   className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        // >
        //   Continue
        // </Button>
        <Button onClick={handleContinue} className="">
          Continue
        </Button>
      )}
    </div>
  );
}

export default AuditoryRecognition;

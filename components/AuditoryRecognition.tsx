"use client";
import React, { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@heroicons/react/20/solid";
import { Button } from "./ui/button";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import defaultTheme from "tailwindcss/defaultTheme";

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

const dialogueTransitionTopPadding = 30; // px

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
  const dialogueRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const testedTextRef = useRef<HTMLSpanElement>(null);
  const dialogueTranslationDistanceRef = useRef<number | null>(null);

  const testedTextWidth = testedTextRef.current?.getBoundingClientRect().width;

  useEffect(() => {
    console.log(`my ref: ${dialogueRef}`);
    const dialoguePosition = dialogueRef.current!.getBoundingClientRect();
    dialogueTranslationDistanceRef.current = dialoguePosition.top - 30;
  }, []);

  useEffect(() => {
    // if (!snippetPlaying && videoLoaded) {
    //   inputRef.current?.focus();
    // }
  }, [snippetPlaying]);

  const testedWord = snippet.words.find(
    (w) => w.id === snippet.testedWordId
  )?.text;

  const isScreenLG = window.matchMedia(
    `(min-width: ${defaultTheme.screens.lg})`
  ).matches;

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
    // window.scrollTo({ top: 0 });
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

  console.log({ snippetPlaying, guessRevealed, isScreenLG });
  return (
    <div className="mx-auto sm:px-6 lg:px-8 flex flex-col items-center ">
      <div
        className={cn(
          "relative mb-20 w-full lg:w-auto lg:h-72 aspect-video",
          !snippetPlaying ? "visible" : "invisible lg:visible"
        )}
      >
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
            "absolute invisible lg:inset-0 z-10 bg-black/50 backdrop-blur-sm flex  items-center justify-center cursor-pointer ",
            videoLoaded && !snippetPlaying && "lg:visible"
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

      <div
        className="flex flex-wrap lg:mb-32 mb-12 text-3xl z-10 transition items-center"
        ref={dialogueRef}
        style={{
          transform: `${
            !snippetPlaying && !guessRevealed && !isScreenLG
              ? `translatey(-${dialogueTranslationDistanceRef.current}px)`
              : ""
          }`,
        }}
      >
        <span className="invisible absolute" ref={testedTextRef}>
          {snippet.words.find((w) => w.id === snippet.testedWordId)?.text}
        </span>
        {testedTextRef.current &&
          snippet.words.map((w) => {
            const key = w.id;
            return w.id === snippet.testedWordId ? (
              <input
                className={cn(
                  "mr-2 pl-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6",
                  w.id === snippet.testedWordId ? " mx-2" : "",

                  w.id === snippet.testedWordId && guessRevealed
                    ? `${guessCorrect ? "text-green-400" : "text-red-400"}`
                    : ""
                )}
                onChange={(e) => setGuess(e.target.value)}
                disabled={snippetPlaying}
                value={guess}
                autoComplete="off"
                ref={inputRef}
                key={key}
                onFocus={() => console.log("focus!")}
                style={{
                  width: `calc(${testedTextWidth}px + 2rem)`,
                  WebkitAppearance: "none",
                }}
              ></input>
            ) : (
              <span
                className={`
                  ${key === currentWord ? "border-b border-red-400" : ""} 
                  ${key === currentWord ? "text-red-500" : ""} 
                 
                  mr-1
                  `}
                key={key}
              >
                {w.text}
              </span>
            );
          })}
      </div>

      {guessRevealed ? (
        // <Button
        //   onClick={handleContinue}
        //   className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        // >
        //   Continue
        // </Button>
        <Button onClick={handleContinue} className="">
          Continue
        </Button>
      ) : (
        <div className="flex items-center">
          <Button
            onClick={handleCheckGuess}
            className="rounded-full h-12 aspect-square border-2"
            variant={"outline"}
          >
            <CheckIcon></CheckIcon>
          </Button>
          <Button
            onClick={handlePlay}
            className="rounded-full h-12 aspect-square border-2"
            variant={"outline"}
          >
            Replay
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuditoryRecognition;

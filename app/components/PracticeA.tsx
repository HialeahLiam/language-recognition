"use client";
import React, { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@heroicons/react/20/solid";

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

function PracticeA({ snippet, onNextSnippet }: Props) {
  const [currentWord, setCurrentWord] = useState("");
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [guessRevealed, setGuessRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timer | null>(
    null
  );
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);
  const video = useRef(null);

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
    const videoElement = video.current as unknown as HTMLVideoElement;
    setProgressInterval(
      setInterval(() => {
        console.log("inter");
        if (!videoElement.paused) {
          updateCurrentWord(videoElement.currentTime);
        }
      }, 100)
    );

    videoElement.play();
  }

  function handleVideoEnd() {
    if (progressInterval) clearInterval(progressInterval);
    setCurrentWord("");
  }

  function handleNeedHelp() {
    setGuess("");
    setMultipleChoice(true);
  }

  function reset() {
    setMultipleChoice(false);
    setGuessRevealed(false);
    setGuess("");
    setGuessCorrect(null);
  }

  function handleContinue() {
    reset();
    onNextSnippet();
  }

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col items-center">
      <video
        onEnded={handleVideoEnd}
        ref={video}
        className="h-60 mb-20"
        src={snippet.videoSrc}
      ></video>

      {guessCorrect !== null && guessCorrect && <p>Correct!</p>}
      {guessCorrect !== null && !guessCorrect && <p>Incorrect</p>}
      <p className="mb-2">
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
      </p>
      {multipleChoice ? (
        <div>
          <fieldset>
            <legend className="sr-only">guess</legend>
            <div className="space-y-5">
              {snippet.wordChoices.map((choice) => (
                <div key={choice} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id={choice}
                      aria-describedby={`${choice}-description`}
                      onChange={(e) => setGuess(e.target.value)}
                      name="guess"
                      value={choice}
                      type="radio"
                      defaultChecked={choice === "small"}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label
                      htmlFor={choice}
                      className="font-medium text-gray-900"
                    >
                      {choice}
                    </label>{" "}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            onClick={handleCheckGuess}
            className="rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Check
          </button>
        </div>
      ) : (
        <div>
          <input
            name="guess"
            id="guess"
            className="mb-4 mr-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(e) => setGuess(e.target.value)}
            value={guess}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleCheckGuess}
            className="rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Check
          </button>
        </div>
      )}
      {!multipleChoice && (
        <button
          type="button"
          onClick={handleNeedHelp}
          className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          I need help
        </button>
      )}
      <button
        type="button"
        onClick={handlePlay}
        className="rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <PlayIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      {guessRevealed && (
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Continue
        </button>
      )}
    </div>
  );
}

export default PracticeA;

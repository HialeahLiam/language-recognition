import { useRef, useState } from "react";
import { useEffect } from "react";

export const useSpeechPlayback = () => {
  const audioRef = useRef<HTMLAudioElement>(document.createElement("audio"));
  const [text, setText] = useState<string>();

  const replay = () => {
    if (text) {
      play(text);
    }
  };

  const statefulPlay = (input: string) => {
    setText(input);
    play(input);
  };

  const play = async (input: string) => {
    const response = await fetch("/api/speech", {
      method: "POST",
      body: JSON.stringify(
        {
          input,
        },
        null,
        4
      ),
    });
    const body = response.body;
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (audioRef.current?.canPlayType("audio/mpeg")) {
      audioRef.current?.setAttribute("src", blobUrl);
    }
    audioRef.current?.play();
  };
  return { play: statefulPlay, replay };
};

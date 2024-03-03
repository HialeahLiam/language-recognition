"use client";

import { useChat, type Message } from "ai/react";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRef } from "react";
import { AIStream, nanoid } from "ai";
import { useSpeechPlayback } from "../lib/hooks/use-speech-playback";
import { useMemo } from "react";
import { useConversation } from "../lib/hooks/use-conversation";
import { Language } from "../lib/types";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
  lang: Language;
}

export interface Answer {
  text: string;
  messageId: string;
  isCorrect: boolean;
  correctAnswer: string;
}

export function Chat({ id, initialMessages, className, lang }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { play, replay } = useSpeechPlayback();
  const [chatStarted, setChatStarted] = useState(false);
  const correctAnswerRef = useRef("");
  const [input, setInput] = useState("");
  const { messages, isLoading, isEnded, next } = useConversation({
    type: "pregenerate",
    lang,
    onFinish: play,
  });

  function replaceRandomWordWithUnderscore(inputString: string) {
    const words = inputString.split(" ");

    if (words.length === 0)
      return { blanked: inputString, blankedWord: inputString };

    let randomIndex = Math.floor(Math.random() * words.length);
    const blankedWord = words[randomIndex];

    words[randomIndex] = "___";

    return { blanked: words.join(" "), blankedWord };
  }

  function cleanTextSelection(text: string) {
    return text.trim().replace(/[\p{P}\s]/gu, "");
  }

  const chatMessages = useMemo(() => {
    const lastMessage = messages[messages.length - 1];

    const lastAnswer = answers[answers.length - 1];
    const lastMessageHasBeenAnswered =
      lastMessage?.id === lastAnswer?.messageId;

    if (!lastMessage || lastMessageHasBeenAnswered) {
      return messages;
    }

    const lastMessageCopy = { ...lastMessage };
    const { blanked, blankedWord } = replaceRandomWordWithUnderscore(
      lastMessageCopy?.content
    );

    correctAnswerRef.current = blankedWord;
    lastMessageCopy.content = blanked;

    return [...messages.slice(0, messages.length - 1), lastMessageCopy];
  }, [messages]);

  const handleGuessSubmit = async (guess: string) => {
    setAnswers((prev) => [
      ...prev,
      {
        isCorrect:
          guess === correctAnswerRef.current ||
          guess === cleanTextSelection(correctAnswerRef.current),
        messageId: messages[messages.length - 1].id,
        text: guess,
        correctAnswer: correctAnswerRef.current,
      },
    ]);

    if (!isEnded) {
      next();
    }
  };

  // console.log({ answers });
  console.log({ isEnded, answers, messages });

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {!chatStarted && (
          <div className=" flex justify-center ">
            <Button
              onClick={() => {
                setChatStarted(true);
                next();
              }}
              className=""
            >
              Begin
            </Button>
          </div>
        )}
        <ChatList
          messages={chatMessages}
          answers={answers}
          replaySpeech={replay}
        />
        {chatStarted && isEnded && answers.length === messages.length && (
          <div className="flex justify-center">
            <span>Conversation has ended.</span>
          </div>
        )}
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        submit={handleGuessSubmit}
        messages={messages}
        input={input}
        setInput={setInput}
        promptDisabled={!chatStarted}
      />
    </>
  );
}

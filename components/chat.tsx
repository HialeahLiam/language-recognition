"use client";

import { useChat, type Message } from "ai/react";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
// import { useLocalStorage } from "@/lib/hooks/use-local-storage";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRef } from "react";
import { AIStream, nanoid } from "ai";
import { useSpeechPlayback } from "../lib/hooks/use-speech-playback";
import { useMemo } from "react";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
  lang: "english" | "german";
}

enum SystemMessage {
  English = "Pretend you are having a conversation. Every reply should be 2 sentences max. Each of your responses should represent one person. When I say 'reply', switch to the other person. The conversation is never-ending. The participants are close friends. Don't try to be polite. Be creative and genuine with your responses. If a topic drags on, switch topics. Always try to ask the opinion of the other person. Kick off the conversation",
  German = "Stell dir vor, du führst ein Gespräch. Jede Antwort sollte maximal 2 Sätze lang sein. Jede deiner Antworten sollte eine Person darstellen. Wenn ich 'Antwort' sage, wechsle zur anderen Person. Das Gespräch endet nie. Die Teilnehmer sind enge Freunde. Versuch nicht, höflich zu sein. Sei kreativ und ehrlich mit deinen Antworten. Wenn ein Thema sich zieht, wechsle das Thema. Versuche immer, die Meinung der anderen Person zu erfragen. Starte das Gespräch.",
}

enum FirstMessage {
  English = "Begin the conversation",
  German = "Beginne das Gespräch",
}
enum ContinueKeyword {
  English = "reply",
  German = "Antwort",
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
  const PromptConfig = useMemo(() => {
    switch (lang) {
      case "english":
        return {
          systemMessage: SystemMessage.English,
          firstMessage: FirstMessage.English,
          continueKeyword: ContinueKeyword.English,
        };
      case "german":
        return {
          systemMessage: SystemMessage.German,
          firstMessage: FirstMessage.German,
          continueKeyword: ContinueKeyword.German,
        };
      default:
        return {
          systemMessage: SystemMessage.English,
          firstMessage: FirstMessage.English,
          continueKeyword: ContinueKeyword.English,
        };
    }
  }, [lang]);

  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    handleSubmit,
  } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: PromptConfig.systemMessage,
      },
      {
        id: nanoid(),
        role: "user",
        content: PromptConfig.firstMessage,
      },
    ],
    id,
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    async onFinish(message) {
      play(message.content);
    },
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
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const lastMessage = assistantMessages[assistantMessages.length - 1];

    const lastAnswer = answers[answers.length - 1];
    const lastMessageHasBeenAnswered =
      lastMessage?.id === lastAnswer?.messageId;

    if (!lastMessage || lastMessageHasBeenAnswered) {
      return assistantMessages;
    }

    const lastMessageCopy = { ...lastMessage };
    const { blanked, blankedWord } = replaceRandomWordWithUnderscore(
      lastMessageCopy?.content
    );

    correctAnswerRef.current = blankedWord;
    lastMessageCopy.content = blanked;

    return [
      ...assistantMessages.slice(0, assistantMessages.length - 1),
      lastMessageCopy,
    ];
  }, [messages]);

  const handleGuessSubmit = async (guess: string) => {
    setAnswers((prev) => [
      ...prev,
      {
        isCorrect:
          guess === correctAnswerRef.current ||
          guess === cleanTextSelection(correctAnswerRef.current),
        messageId: messages.findLast((m) => m.role === "assistant")!.id,
        text: guess,
        correctAnswer: correctAnswerRef.current,
      },
    ]);
    await append({
      content: PromptConfig.continueKeyword, // we told gpt to expect "reply" to continue convo
      role: "user",
    });
  };

  console.log({ answers });

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {!chatStarted && (
          <div className=" flex justify-center ">
            <Button
              onClick={() => {
                setChatStarted(true);
                reload();
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
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        submit={handleGuessSubmit}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        promptDisabled={!chatStarted}
      />
    </>
  );
}

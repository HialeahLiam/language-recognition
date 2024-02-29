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
import { nanoid } from "ai";
import { useSpeechPlayback } from "../lib/hooks/use-speech-playback";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

enum SystemMessage {
  English = "Pretend you are having a conversation. Every reply should be 2 sentences max. Each of your responses should represent one person. When I say 'reply', switch to the other person. The conversation is never-ending. The participants are close friends. Don't try to be polite. Be creative and genuine with your responses. If a topic drags on, switch topics. Always try to ask the opinion of the other person. Kick off the conversation",
  German = "Stell dir vor, du führst ein Gespräch. Jede Antwort sollte maximal 2 Sätze lang sein. Jede deiner Antworten sollte eine Person darstellen. Wenn ich 'Antwort' sage, wechsle zur anderen Person. Das Gespräch endet nie. Die Teilnehmer sind enge Freunde. Versuch nicht, höflich zu sein. Sei kreativ und ehrlich mit deinen Antworten. Wenn ein Thema sich zieht, wechsle das Thema. Versuche immer, die Meinung der anderen Person zu erfragen. Starte das Gespräch.",
}

enum FirstMessage {
  English = "Begin the conversation",
  German = "Beginne das Gespräch",
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const { play } = useSpeechPlayback();
  const [chatStarted, setChatStarted] = useState(false);
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
        content: SystemMessage.German,
      },
      {
        id: nanoid(),
        role: "user",
        content: FirstMessage.German,
      },
    ],
    id,
    //   body: {
    //     id,
    //     previewToken,
    //   },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    async onFinish(message) {
      play(message.content);
    },
  });

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {chatStarted ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen
            begin={() => {
              console.log("beginning");
              setChatStarted(true);
              reload();
            }}
            setInput={setInput}
          />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  );
}

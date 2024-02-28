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

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [chatStarted, setChatStarted] = useState(false);
  //   const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
  //     "ai-token",
  //     null
  //   );
  //   const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
  //   const [previewTokenInput, setPreviewTokenInput] = useState(
  //     previewToken ?? ""
  //   );
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
        content:
          "Pretend you are having a conversation. Every reply should be 2 sentences max. Each of your responses should represent one person. When I say 'reply', switch to the other person. The conversation is never-ending. The participants are close friends. Don't try to be polite. Be creative and genuine with your responses. If a topic drags on, switch topics. Always try to ask the opinion of the other person. Kick off the conversation",
      },
      {
        id: nanoid(),
        role: "user",
        content: "Begin the conversation",
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
      const response = await fetch("/api/speech", {
        method: "POST",
        body: JSON.stringify(
          {
            input: message.content,
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
    },
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <>
      <audio ref={audioRef} autoPlay={false}></audio>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {chatStarted ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen
            begin={() => {
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

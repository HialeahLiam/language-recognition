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

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  //   const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
  //     "ai-token",
  //     null
  //   );
  //   const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
  //   const [previewTokenInput, setPreviewTokenInput] = useState(
  //     previewToken ?? ""
  //   );
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
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
      // onFinish() {
      //   if (!path.includes("chat")) {
      //     window.history.pushState({}, "", `/chat/${id}`);
      //   }
      // },
    });

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch("/api/speech", {
        method: "POST",
        body: JSON.stringify(
          {
            input:
              "My name is Liam, what about yours? I want to smoke cigarrettes and drink coffee. My name is Liam, what about yours? I want to smoke cigarrettes and drink coffee",
          },
          null,
          4
        ),
      });
      const body = response.body;
      console.log({ body });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log({ blobUrl });

      if (audioRef.current?.canPlayType("audio/mpeg")) {
        audioRef.current?.setAttribute("src", blobUrl);
      }
    };
    fetchAudio();
  }, []);

  console.log({ messages });
  return (
    <>
      <audio ref={audioRef} autoPlay={false}></audio>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => audioRef.current?.play()}
      >
        Play
      </button>
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

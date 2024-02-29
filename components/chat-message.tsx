// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from "ai";
import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";

import { cn } from "@/lib/utils";
// import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { ChatMessageActions } from "@/components/chat-message-actions";
import { useMemo } from "react";
import { Check, SpeakerHigh, X } from "@phosphor-icons/react";

export interface ChatMessageProps {
  // message: Message;
  message: string;
  state: "correct" | "incorrect" | "guessing";
  onReplay?: () => void;
}

export function ChatMessage({
  message,
  state,
  onReplay,
  ...props
}: ChatMessageProps) {
  return (
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12 ")}
      {...props}
    >
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <div className="absolute -left-20">
          {state === "correct" && <Check size={32} color="#73A172" />}
          {state === "incorrect" && <X size={32} color="#A96666" />}
        </div>
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
          }}
        >
          {message}
        </MemoizedReactMarkdown>
        {/* <ChatMessageActions message={message} /> */}
      </div>
      {onReplay && (
        <button onClick={onReplay} className="absolute -right-10">
          <SpeakerHigh size={32} />
        </button>
      )}
    </div>
  );
}

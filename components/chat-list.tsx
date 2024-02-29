import { type Message } from "ai";

import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";
import { useMemo } from "react";

export interface ChatList {
  // messages: Message[];
  messages: string[];
  isTestedBlank?: boolean;
}

export function ChatList({ messages, isTestedBlank = true }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;

        return (
          <div key={index}>
            <ChatMessage
              message={message}
              isTestedBlank={isLastMessage && isTestedBlank}
            />
            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { type Message } from "ai";

import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";
import { useMemo } from "react";
import { Answer } from "./chat";

export interface ChatList {
  messages: Message[];
  // messages: string[];
  answers: Answer[];
  isTestedBlank?: boolean;
}

export function ChatList({ messages, answers }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        const answer = answers.find((a) => a.messageId === message.id);

        return (
          <div key={index}>
            <ChatMessage
              message={message.content}
              state={
                answer
                  ? answer.isCorrect
                    ? "correct"
                    : "incorrect"
                  : "guessing"
              }
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

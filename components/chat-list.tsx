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
  replaySpeech: () => void;
}

export function ChatList({ messages, answers, replaySpeech }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
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
              onReplay={isLastMessage ? replaySpeech : undefined}
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

import { useChat } from "ai/react";
import {
  ConvoMesssage,
  UseConversationProps,
  UseConversationReturnType,
} from "./use-conversation";
import { Language } from "../types";
import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

enum FirstMessage {
  English = `You are a screenwriter writing a long-running dialogue between two friends. Your response should strictly follow this format:

  separate the responses with \`---\`
  don't label the responses`,
  German = "Beginne das Gespräch",
}

const PromptConfig = (lang: Language) => {
  switch (lang) {
    case "ENGLISH":
      return {
        firstMessage: FirstMessage.English,
      };
    case "GERMAN":
      return {
        firstMessage: FirstMessage.German,
      };
    default:
      return {
        firstMessage: FirstMessage.English,
      };
  }
};

export const usePregenerated = ({
  lang,
  onFinish,
}: Omit<UseConversationProps, "type">): UseConversationReturnType => {
  const { messages, append, isLoading: isLLMLoading } = useChat({});
  const [chatPosition, setChatPosition] = useState(0);
  const [chatMessages, setChatMessages] = useState<ConvoMesssage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevIsLoading, setPrevIsLoading] = useState(false);

  const promptConfig = useMemo(() => PromptConfig(lang), [lang]);

  const assistantMessages = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    return assistantMessages;
  }, [messages]);

  const splitMessages = assistantMessages.flatMap((am) =>
    am.content.split("---").map((m) => m.trim())
  );

  const recentChatMessage = chatMessages?.[chatPosition - 1];
  const recentMessage: string | undefined = splitMessages?.[chatPosition - 1];

  if (recentMessage && recentChatMessage?.content !== recentMessage) {
    setChatMessages((prev) => [
      ...prev.slice(0, chatPosition - 1),
      {
        ...recentChatMessage,
        id: nanoid(),
        content: recentMessage,
      },
    ]);
  }

  if (prevIsLoading && !isLoading && onFinish && recentChatMessage) {
    setPrevIsLoading(isLoading);
    onFinish(recentChatMessage.content);
  }

  const isChatArrayBehindMessagesArray =
    chatMessages.length < splitMessages.length;
  if (
    isLoading &&
    recentChatMessage?.content === recentMessage &&
    (isChatArrayBehindMessagesArray || !isLLMLoading)
  ) {
    setPrevIsLoading(isLoading);
    setIsLoading(false);
  }

  function next() {
    if (messages.length === 0) {
      append({
        content: promptConfig.firstMessage,
        role: "user",
      });
    }
    setPrevIsLoading(isLoading);
    setIsLoading(true);
    setChatPosition((prev) => prev + 1);
  }

  return {
    isEnded: splitMessages?.length === chatPosition && !isLLMLoading,
    isLoading,
    messages: chatMessages,
    next,
  };
};

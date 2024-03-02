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

  const promptConfig = useMemo(() => PromptConfig(lang), [lang]);

  const assistantMessages = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    return assistantMessages;
  }, [messages]);

  const splitMessages = assistantMessages.flatMap((am) =>
    am.content.split("---").map((m) => m.trim())
  );

  const recentChatMessage = chatMessages?.[chatPosition - 1] || undefined;
  const recentMessage = splitMessages?.[chatPosition - 1] || undefined;

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

  useEffect(() => {
    /**
     * We do this to solve race condition. We might call the LLM API and then setIsLoading(true),
     * but the isLLMLoading sometimes does not become true before we check to set isLoading to false.
     *
     * We know that if isLLMLoading changes false ->, we just fetched an answer from LLM and our chat message
     * MUST be loading.
     */
    if (isLLMLoading) setIsLoading(true);
  }, [isLLMLoading]);

  useEffect(() => {
    /**
     * Sometimes condition is true when recentChatMessage is undefined.
     * This happens when isLoading is switched true -> false before isLLMLoading
     * even has a chance to turn on false -> true
     */
    if (!isLoading && onFinish && recentChatMessage) {
      onFinish(recentChatMessage.content);
    }
  }, [isLoading]);

  useEffect(() => {
    const isChatArrayBehindMessagesArray =
      chatMessages.length < splitMessages.length;
    if (isChatArrayBehindMessagesArray || !isLLMLoading) {
      setIsLoading(false);
    }
  }, [chatMessages, isLLMLoading]);

  function next() {
    if (messages.length === 0) {
      append({
        content: promptConfig.firstMessage,
        role: "user",
      });
    }
    setIsLoading(true);
    setChatPosition((prev) => prev + 1);
  }

  return {
    isEnded: splitMessages?.length === chatPosition,
    isLoading,
    messages: chatMessages,
    next,
  };
};

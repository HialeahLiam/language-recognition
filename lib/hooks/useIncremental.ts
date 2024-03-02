import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { Language } from "../types";
import {
  UseConversationProps,
  UseConversationReturnType,
} from "./use-conversation";

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

export const useIncremental = ({
  lang,
  onFinish,
}: Omit<UseConversationProps, "type">): UseConversationReturnType => {
  const PromptConfig = useMemo(() => {
    switch (lang) {
      case "ENGLISH":
        return {
          systemMessage: SystemMessage.English,
          firstMessage: FirstMessage.English,
          continueKeyword: ContinueKeyword.English,
        };
      case "GERMAN":
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
  const { messages, append, isLoading } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: "system",
        content: PromptConfig.systemMessage,
      },
    ],
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    onFinish(message) {
      if (onFinish) {
        onFinish(message.content);
      }
    },
  });
  const assistantMessages = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    return assistantMessages;
  }, [messages]);

  async function next() {
    if (assistantMessages.length === 0) {
      await append({
        id: nanoid(),
        role: "user",
        content: PromptConfig.firstMessage,
      });
    } else {
      await append({
        content: PromptConfig.continueKeyword, // we told gpt to expect "reply" to continue convo
        role: "user",
      });
    }
  }

  return {
    messages: assistantMessages,
    next,
    isLoading,
    isEnded: false,
  };
};

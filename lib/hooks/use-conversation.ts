import { useChat } from "ai/react/dist";
import { smallNanoId } from "../utils";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { Message } from "ai";
import { useIncremental } from "./useIncremental";
import { Language } from "../types";

export interface UseConversationReturnType {
  messages: ConvoMesssage[];
  isLoading: boolean;
  isEnded: boolean;
  next: () => void;
}

export interface ConvoMesssage extends Pick<Message, "id" | "content"> {
  name?: string;
}

interface UseConversationProps {
  type: "pregenerate" | "incremental";
  lang: Language;
  onFinish?: (messageContent: string) => void;
}

export const useConversation = ({
  type,
  lang,
  onFinish,
}: UseConversationProps): UseConversationReturnType =>
  // type === "pregenerate"
  //   ? usePregenerated()
  //   :
  useIncremental({
    lang,
    onFinish,
  });

const usePregenerated = () => {
  return { messages: [], isLoading: false, isEnded: false, next: () => null };
};

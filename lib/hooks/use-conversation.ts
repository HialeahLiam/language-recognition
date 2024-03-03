import { useChat } from "ai/react/dist";
import { smallNanoId } from "../utils";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { Message } from "ai";
import { useIncremental } from "./useIncremental";
import { Language } from "../types";
import { usePregenerated } from "./usePregenerated";

export interface UseConversationReturnType {
  messages: ConvoMesssage[];
  isLoading: boolean;
  isEnded: boolean;
  newConvo: () => void;
  next: () => void;
}

export interface ConvoMesssage extends Pick<Message, "id" | "content"> {
  name?: string;
}

export interface UseConversationProps {
  type: "pregenerate" | "incremental";
  lang: Language;
  onFinish?: (messageContent: string) => void;
}

export const useConversation = ({
  type,
  lang,
  onFinish,
}: UseConversationProps): UseConversationReturnType =>
  type === "pregenerate"
    ? usePregenerated({
        lang,
        onFinish,
      })
    : useIncremental({
        lang,
        onFinish,
      });

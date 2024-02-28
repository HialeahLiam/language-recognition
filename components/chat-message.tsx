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

export interface ChatMessageProps {
  message: Message;
  isTestedBlank?: boolean;
}

export function ChatMessage({
  message,
  isTestedBlank = true,
  ...props
}: ChatMessageProps) {
  function replaceRandomWordWithUnderscore(inputString: string) {
    const words = inputString.split(" ");

    if (words.length === 0) return inputString;

    let randomIndex = Math.floor(Math.random() * words.length);

    words[randomIndex] = "___";

    return words.join(" ");
  }
  const blankedMessage = useMemo(
    () => replaceRandomWordWithUnderscore(message.content),
    [message, isTestedBlank]
  );
  return (
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12")}
      {...props}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          message.role === "user"
            ? "bg-background"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message.role === "user" ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            // code({ node, inline, className, children, ...props }) {
            //   if (children.length) {
            //     if (children[0] == "▍") {
            //       return (
            //         <span className="mt-1 cursor-default animate-pulse">▍</span>
            //       );
            //     }

            //     children[0] = (children[0] as string).replace("`▍`", "▍");
            //   }

            //   const match = /language-(\w+)/.exec(className || "");

            //   if (inline) {
            //     return (
            //       <code className={className} {...props}>
            //         {children}
            //       </code>
            //     );
            //   }

            //   return (
            //     <CodeBlock
            //       key={Math.random()}
            //       language={(match && match[1]) || ""}
            //       value={String(children).replace(/\n$/, "")}
            //       {...props}
            //     />
            //   );
            // },
          }}
        >
          {blankedMessage}
        </MemoizedReactMarkdown>
        {/* <ChatMessageActions message={message} /> */}
      </div>
    </div>
  );
}

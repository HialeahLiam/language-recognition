import { UseChatHelpers } from "ai/react";

import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "Explain technical concepts",
    message: `What is a "serverless function"?`,
  },
  {
    heading: "Summarize an article",
    message: "Summarize the following article for a 2nd grader: \n",
  },
  {
    heading: "Draft an email",
    message: `Draft an email to my boss about the following: \n`,
  },
];

type EmptyScreenProps = {
  begin: () => void;
};
export function EmptyScreen({
  setInput,
  begin,
}: Pick<UseChatHelpers, "setInput"> & EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 flex justify-center">
      {/* <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Next.js AI Chatbot!
        </h1>
      </div>   */}
      <Button onClick={begin}>Begin</Button>
    </div>
  );
}

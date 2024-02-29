import { UseChatHelpers } from "ai/react";

import { Button } from "@/components/ui/button";

type EmptyScreenProps = {
  begin: (language: "english" | "german") => void;
};
export function EmptyScreen({ begin }: EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 flex justify-center">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          What do you want to practice?
        </h1>
        <ul>
          <li>
            <Button onClick={() => begin("english")} variant={"link"}>
              English
            </Button>
          </li>
          <li>
            <Button onClick={() => begin("german")} variant={"link"}>
              German
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}

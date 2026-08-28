"use client";

import { User as UserIcon, Building2 } from "lucide-react";
import { ModelViewer } from "@/components/generator/ModelViewer";
import { StatusTracker } from "@/components/generator/StatusTracker";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " +
          (isUser
            ? "bg-zinc-200 dark:bg-zinc-700"
            : "bg-gradient-to-br from-architect-500 to-indigo-500")
        }
      >
        {isUser ? (
          <UserIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        ) : (
          <Building2 className="h-4 w-4 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? "text-right" : ""} min-w-0`}>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
          {isUser ? "You" : "Arch3D"}
        </p>

        {isUser && (
          <div className="inline-block max-w-[80%] text-left">
            <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-architect-500 text-white text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        )}

        {!isUser && (
          <div className="space-y-3 max-w-full">
            {message.status && message.status !== "completed" && message.status !== "failed" && (
              <StatusTracker status={message.status} />
            )}

            {message.content && (
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-surface-100 dark:bg-surface-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {message.content}
              </div>
            )}

            {message.model_url && (
              <div className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
                <ModelViewer modelUrl={message.model_url} />
              </div>
            )}

            {message.status === "failed" && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                Generation failed. Please try again with a different description.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
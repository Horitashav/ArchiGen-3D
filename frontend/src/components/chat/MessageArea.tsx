"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/types";

interface MessageAreaProps {
  messages: Message[];
  isGenerating: boolean;
  onSelectSuggestion?: (text: string) => void;
}

export function MessageArea({ messages, isGenerating, onSelectSuggestion }: MessageAreaProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 && !isGenerating && (
        <div className="h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div className="mx-auto mb-6 p-5 rounded-3xl bg-gradient-to-br from-architect-100 to-indigo-100 dark:from-architect-900/30 dark:to-indigo-900/30 w-fit">
              <Building2 className="h-12 w-12 text-architect-500" />
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              What would you like to build?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
              Describe any building in natural language and AI will generate
              an interactive 3D model with specifications.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Modern glass office building",
                "Cozy wooden cabin",
                "Futuristic museum",
                "Japanese tea house",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSelectSuggestion?.(suggestion)}
                  className={
                    "px-4 py-2 rounded-full text-xs font-medium border border-surface-200 dark:border-surface-700 " +
                    "text-zinc-600 dark:text-zinc-400 " +
                    "hover:bg-architect-50 hover:border-architect-200 hover:text-architect-700 " +
                    "dark:hover:bg-architect-950 dark:hover:border-architect-800 dark:hover:text-architect-300 " +
                    "transition-all duration-200"
                  }
                >
                  <Sparkles className="h-3 w-3 inline mr-1.5" />
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-architect-500 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-architect-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-architect-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-architect-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-sm text-zinc-400">Synthesizing 3D geometry...</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div ref={scrollAnchorRef} />
    </div>
  );
}
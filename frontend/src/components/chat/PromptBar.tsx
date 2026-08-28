"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptBarProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function PromptBar({ onSubmit, isLoading, disabled }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (trimmed.length >= 5 && !isLoading) {
      onSubmit(trimmed);
      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = prompt.trim().length >= 5 && !isLoading;

  return (
    <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "flex items-end gap-2 p-2 rounded-2xl border transition-colors",
            "bg-surface-50 dark:bg-surface-800",
            "border-surface-200 dark:border-surface-700",
            "focus-within:border-architect-400 focus-within:ring-1 focus-within:ring-architect-400/30"
          )}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a building to generate in 3D..."
            disabled={isLoading || disabled}
            rows={1}
            className={
              "flex-1 resize-none bg-transparent px-3 py-2 text-sm " +
              "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 " +
              "focus:outline-none disabled:opacity-50 " +
              "max-h-[200px] overflow-y-auto"
            }
          />

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
              canSubmit
                ? "bg-architect-500 text-white hover:bg-architect-600 shadow-sm"
                : "bg-surface-200 dark:bg-surface-700 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line · Interactive 3D preview powered by WebGL
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  onReset: () => void;
}

const EXAMPLE_PROMPTS = [
  "A modern 3-story glass office building with a rooftop garden, minimalist interior, and central atrium connecting all floors",
  "A cozy Scandinavian wooden cabin with a large stone fireplace, wraparound deck, and floor-to-ceiling windows overlooking a forest",
  "A futuristic museum with flowing organic curves, titanium cladding, and a dramatic cantilevered entrance",
  "A traditional Japanese tea house with sliding shoji screens, a zen garden courtyard, and curved wooden roof",
];

export function PromptInput({ onSubmit, isLoading, onReset }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim().length >= 10) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Card variant="bordered" padding="lg" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-architect-500 via-blue-500 to-indigo-500" />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Describe your building
          </label>

          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A modern 3-story glass office building with a rooftop garden..."
            maxLength={2000}
            rows={4}
            disabled={isLoading}
            className={
              "w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 " +
              "bg-surface-50 dark:bg-surface-800 " +
              "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 " +
              "focus:outline-none focus:ring-2 focus:ring-architect-500 focus:border-transparent " +
              "resize-none transition-all duration-200 " +
              "disabled:opacity-50 disabled:cursor-not-allowed"
            }
          />

          <div className="flex justify-between mt-1.5 text-xs text-zinc-400">
            <span>Ctrl+Enter to submit</span>
            <span className={prompt.length > 1800 ? "text-amber-500" : ""}>
              {prompt.length} / 2,000
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className={
                  "px-3 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-700 " +
                  "text-zinc-600 dark:text-zinc-400 hover:bg-architect-50 hover:border-architect-200 " +
                  "hover:text-architect-700 dark:hover:bg-architect-950 dark:hover:border-architect-800 " +
                  "transition-all duration-200 text-left line-clamp-1 max-w-xs " +
                  "disabled:opacity-50"
                }
              >
                {example.slice(0, 60)}...
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={prompt.trim().length < 10}
          >
            <Sparkles className="h-4 w-4" />
            Generate 3D Model
          </Button>

          {isLoading && (
            <Button variant="ghost" size="lg" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
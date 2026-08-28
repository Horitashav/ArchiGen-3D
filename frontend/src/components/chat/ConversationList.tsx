"use client";

import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Last 7 Days";
  if (diffDays <= 30) return "Last 30 Days";
  return "Older";
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    const order = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"];

    for (const conv of conversations) {
      const group = getDateGroup(conv.updated_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(conv);
    }

    return order
      .filter((g) => groups[g]?.length > 0)
      .map((g) => ({ label: g, items: groups[g] }));
  }, [conversations]);

  return (
    <div className="space-y-4 pb-4">
      {grouped.map((group) => (
        <div key={group.label}>
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {group.label}
          </p>

          <div className="space-y-0.5">
            {group.items.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors group",
                  activeId === conv.id
                    ? "bg-architect-50 dark:bg-architect-950/40 text-architect-700 dark:text-architect-300"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-surface-200/60 dark:hover:bg-surface-800/60"
                )}
              >
                <Building2
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    activeId === conv.id ? "text-architect-500" : "text-zinc-400 dark:text-zinc-500"
                  )}
                />
                <span className="flex-1 text-sm truncate">{conv.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
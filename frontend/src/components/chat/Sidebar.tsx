"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConversationList } from "./ConversationList";
import type { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex-shrink-0">
        <Button
          variant="secondary"
          size="md"
          onClick={onNewChat}
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              No conversations yet.
              <br />
              Start by describing a building!
            </p>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
          />
        )}
      </div>

      <div className="p-3 border-t border-surface-200 dark:border-surface-700 flex-shrink-0">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
          Text-to-3D Architect Studio v0.1
        </p>
      </div>
    </div>
  );
}
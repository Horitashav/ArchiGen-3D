"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Sidebar } from "@/components/chat/Sidebar";
import { MessageArea } from "@/components/chat/MessageArea";
import { PromptBar } from "@/components/chat/PromptBar";
import { DetailPanel } from "@/components/chat/DetailPanel";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Conversation, Message, ArchitectureSpec } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec | null>(null);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token) {
      api.getConversations(token).then(setConversations).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (activeConversationId && token) {
      api.getMessages(activeConversationId, token).then((msgs) => {
        setMessages(msgs);
        const lastAssistant = [...msgs].reverse().find(
          (m) => m.role === "assistant" && m.architecture_spec
        );
        if (lastAssistant) {
          setActiveSpec(
            typeof lastAssistant.architecture_spec === "string"
              ? JSON.parse(lastAssistant.architecture_spec)
              : lastAssistant.architecture_spec
          );
          setActiveModelUrl(lastAssistant.model_url);
          setShowDetailPanel(true);
        }
      }).catch(console.error);
    } else {
      setMessages([]);
      setActiveSpec(null);
      setActiveModelUrl(null);
      setShowDetailPanel(false);
    }
  }, [activeConversationId, token]);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setActiveSpec(null);
    setActiveModelUrl(null);
    setShowDetailPanel(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!token) return;

    setIsGenerating(true);

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: activeConversationId || "",
      role: "user",
      content: prompt,
      architecture_spec: null,
      model_url: null,
      status: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.generateArchitecture(prompt, activeConversationId, token);

      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
        api.getConversations(token).then(setConversations);
      }

      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: response.conversation_id || activeConversationId || "",
        role: "assistant",
        content: "Generating your 3D model...",
        architecture_spec: null,
        model_url: null,
        status: response.status,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const taskId = response.task_id;
      const pollInterval = setInterval(async () => {
        try {
          const result = await api.getTaskStatus(taskId);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    status: result.status,
                    content:
                      result.status === "completed"
                        ? "Here's your generated 3D architectural model:"
                        : result.status === "parsing"
                        ? "Analyzing your architectural prompt..."
                        : result.status === "generating_3d"
                        ? "Building procedural 3D model geometry..."
                        : msg.content,
                    architecture_spec: (result.architecture_spec as ArchitectureSpec) || msg.architecture_spec,
                    model_url: result.model_url
                      ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${result.model_url}`
                      : msg.model_url,
                  }
                : msg
            )
          );

          if (result.architecture_spec) {
            const parsed =
              typeof result.architecture_spec === "string"
                ? JSON.parse(result.architecture_spec)
                : result.architecture_spec;
            setActiveSpec(parsed);
            setShowDetailPanel(true);
          }
          if (result.model_url) {
            setActiveModelUrl(
              `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${result.model_url}`
            );
          }

          if (result.status === "completed" || result.status === "failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            api.getConversations(token).then(setConversations);
          }
        } catch {
          clearInterval(pollInterval);
          setIsGenerating(false);
        }
      }, 3000);
    } catch (err) {
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-error-${Date.now()}`,
          conversation_id: activeConversationId || "",
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
          architecture_spec: null,
          model_url: null,
          status: "failed",
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [token, activeConversationId]);

  if (authLoading) return null;

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />
      }
      main={
        <div className="flex flex-col flex-1 min-h-0">
          <MessageArea
            messages={messages}
            isGenerating={isGenerating}
            onSelectSuggestion={handleSubmit}
          />
          <PromptBar onSubmit={handleSubmit} isLoading={isGenerating} />
        </div>
      }
      detailPanel={
        <DetailPanel
          spec={activeSpec}
          modelUrl={activeModelUrl}
          onClose={() => setShowDetailPanel(false)}
        />
      }
      showDetailPanel={showDetailPanel}
      onToggleDetailPanel={() => setShowDetailPanel(!showDetailPanel)}
    />
  );
}
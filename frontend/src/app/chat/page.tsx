"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Sidebar } from "@/components/chat/Sidebar";
import { MessageArea } from "@/components/chat/MessageArea";
import { PromptBar } from "@/components/chat/PromptBar";
import { DetailPanel } from "@/components/chat/DetailPanel";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Conversation, Message, ArchitectureSpec } from "@/types";

// Flag to skip the message-loading useEffect when we just created a conversation
// from handleSubmit (prevents race condition that wipes optimistic messages)
const SKIP_FETCH_FLAG = "__skip__";

export default function ChatPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Generation & Inspection state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpec | null>(null);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Active SSE connection ref to allow clean cancellation
  const eventSourceRef = useRef<EventSource | null>(null);

  // When handleSubmit creates a NEW conversation, we set this to true
  // so the message-loading useEffect skips its next fetch (preventing it
  // from overwriting our optimistic assistant message with stale DB data)
  const skipNextFetchRef = useRef(false);

  // Clean up any open SSE connection on component unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversation history list on token load
  useEffect(() => {
    if (token) {
      api.getConversations(token).then(setConversations).catch(console.error);
    }
  }, [token]);

  // Load message history when selecting a conversation
  useEffect(() => {
    // Skip this fetch if handleSubmit just created the conversation
    // (our optimistic messages are already in state — fetching from DB
    // would overwrite them since the pipeline hasn't saved them yet)
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    if (activeConversationId && token) {
      api.getMessages(activeConversationId, token).then((msgs) => {
        setMessages(msgs);

        // Populate detail panel with the latest generated assistant model in this chat
        const lastAssistant = [...msgs].reverse().find(
          (m) => m.role === "assistant" && m.architecture_spec
        );

        if (lastAssistant) {
          const spec = typeof lastAssistant.architecture_spec === "string"
            ? JSON.parse(lastAssistant.architecture_spec)
            : lastAssistant.architecture_spec;

          setActiveSpec(spec);
          setActiveModelUrl(lastAssistant.model_url);
          if (lastAssistant.model_url) {
            const match = lastAssistant.model_url.match(/\/([^\/]+)\.glb$/);
            if (match) setActiveTaskId(match[1]);
          }
          setShowDetailPanel(true);
        }
      }).catch(console.error);
    } else {
      setMessages([]);
      setActiveSpec(null);
      setActiveModelUrl(null);
      setActiveTaskId(null);
      setShowDetailPanel(false);
    }
  }, [activeConversationId, token]);

  const handleNewChat = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setActiveConversationId(null);
    setMessages([]);
    setActiveSpec(null);
    setActiveModelUrl(null);
    setActiveTaskId(null);
    setShowDetailPanel(false);
    setIsGenerating(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsGenerating(false);
    setActiveConversationId(id);
  }, []);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!token) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsGenerating(true);

    // 1. Optimistic User Message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
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
      // 2. Submit Generation Task to Backend
      const response = await api.generateArchitecture(prompt, activeConversationId, token);

      if (!activeConversationId && response.conversation_id) {
        skipNextFetchRef.current = true;  // Prevent useEffect from overwriting our messages
        setActiveConversationId(response.conversation_id);
        api.getConversations(token).then(setConversations);
      }

      const currentTaskId = response.task_id;
      setActiveTaskId(currentTaskId);

      // 3. Placeholder Assistant Message
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversation_id: response.conversation_id || activeConversationId || "",
        role: "assistant",
        content: "Initializing generation pipeline...",
        architecture_spec: null,
        model_url: null,
        status: response.status,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 4. Connect to Real-Time SSE Stream
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const eventSource = new EventSource(`${API_URL}/architecture/tasks/${currentTaskId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsGenerating(false);
          if (token) api.getConversations(token).then(setConversations);
          return;
        }

        try {
          const result = JSON.parse(event.data);

          if (result.error) {
            eventSource.close();
            setIsGenerating(false);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, status: "failed", content: result.error }
                  : msg
              )
            );
            return;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    status: result.status,
                    content:
                      result.status === "completed"
                        ? "Here is your generated 3D architectural model:"
                        : result.status === "parsing"
                        ? "Analyzing architectural requirements..."
                        : result.status === "generating_2d"
                        ? "Synthesizing spatial massing and room layout..."
                        : result.status === "generating_3d"
                        ? "Building procedural 3D model geometry..."
                        : msg.content,
                    architecture_spec:
                      (typeof result.architecture_spec === "string"
                        ? JSON.parse(result.architecture_spec)
                        : result.architecture_spec) || msg.architecture_spec,
                    model_url: result.model_url
                      ? `${API_URL.replace("/api/v1", "")}${result.model_url}`
                      : msg.model_url,
                  }
                : msg
            )
          );

          if (result.architecture_spec) {
            const parsedSpec = typeof result.architecture_spec === "string"
              ? JSON.parse(result.architecture_spec)
              : result.architecture_spec;
            setActiveSpec(parsedSpec);
            setShowDetailPanel(true);
          }

          if (result.model_url) {
            setActiveModelUrl(`${API_URL.replace("/api/v1", "")}${result.model_url}`);
          }

          if (result.status === "completed" || result.status === "failed") {
            eventSource.close();
            setIsGenerating(false);
            if (token) api.getConversations(token).then(setConversations);
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsGenerating(false);
      };
    } catch (err) {
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          conversation_id: activeConversationId || "",
          role: "assistant",
          content: err instanceof Error ? err.message : "Failed to initiate generation.",
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
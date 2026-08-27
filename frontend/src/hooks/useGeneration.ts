"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { TaskStatus, TaskResult, ArchitectureSpec } from "@/types";

interface GenerationState {
  status: TaskStatus | "idle";
  taskId: string | null;
  spec: ArchitectureSpec | null;
  modelUrl: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    status: "idle",
    taskId: null,
    spec: null,
    modelUrl: null,
    error: null,
    isLoading: false,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (taskId: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const result: TaskResult = await api.getTaskStatus(taskId);

          setState((prev) => ({
            ...prev,
            status: result.status,
            modelUrl: result.model_url
              ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${result.model_url}`
              : null,
            spec: result.architecture_spec
              ? (typeof result.architecture_spec === "string" 
                  ? JSON.parse(result.architecture_spec) 
                  : result.architecture_spec)
              : prev.spec,
          }));

          if (result.status === "completed" || result.status === "failed") {
            stopPolling();
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: result.status === "failed" ? result.error_message : null,
            }));
          }
        } catch (err) {
          stopPolling();
          setState((prev) => ({
            ...prev,
            status: "failed",
            isLoading: false,
            error: err instanceof Error ? err.message : "Polling failed",
          }));
        }
      }, 3000);
    },
    [stopPolling]
  );

  const generate = useCallback(
    async (prompt: string) => {
      stopPolling();
      setState({
        status: "pending",
        taskId: null,
        spec: null,
        modelUrl: null,
        error: null,
        isLoading: true,
      });

      try {
        const response = await api.generateArchitecture(prompt);

        setState((prev) => ({
          ...prev,
          taskId: response.task_id,
          status: response.status,
        }));

        if (response.status !== "completed" && response.status !== "failed") {
          startPolling(response.task_id);
        } else {
          // If task completed immediately, fetch final task payload
          const result = await api.getTaskStatus(response.task_id);
          setState((prev) => ({
            ...prev,
            status: result.status,
            modelUrl: result.model_url
              ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${result.model_url}`
              : null,
            spec: result.architecture_spec
              ? (typeof result.architecture_spec === "string"
                  ? JSON.parse(result.architecture_spec)
                  : result.architecture_spec)
              : null,
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "failed",
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to submit request",
        }));
      }
    },
    [startPolling, stopPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setState({
      status: "idle",
      taskId: null,
      spec: null,
      modelUrl: null,
      error: null,
      isLoading: false,
    });
  }, [stopPolling]);

  return {
    ...state,
    generate,
    reset,
  };
}
import type { GenerationResponse, TaskResult } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || error.detail || "Request failed");
  }
  return response.json();
}

export const api = {
  generateArchitecture: async (prompt: string): Promise<GenerationResponse> => {
    const response = await fetch(`${API_URL}/architecture/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    return handleResponse<GenerationResponse>(response);
  },

  getTaskStatus: async (taskId: string): Promise<TaskResult> => {
    const response = await fetch(`${API_URL}/architecture/tasks/${taskId}`);
    return handleResponse<TaskResult>(response);
  },

  parseOnly: async (prompt: string): Promise<Record<string, unknown>> => {
    const response = await fetch(`${API_URL}/architecture/parse-only`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    return handleResponse<Record<string, unknown>>(response);
  },
};
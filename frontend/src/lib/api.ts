import type {
  GenerationResponse,
  TaskResult,
  User,
  TokenResponse,
  LoginCredentials,
  RegisterData,
  Conversation,
  Message,
} from "@/types";

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
  // ──── Architecture & Generation ────
  generateArchitecture: async (
    prompt: string,
    conversationId: string | null = null,
    token?: string
  ): Promise<GenerationResponse> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/architecture/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        conversation_id: conversationId,
      }),
    });
    return handleResponse<GenerationResponse>(response);
  },

  getTaskStatus: async (taskId: string): Promise<TaskResult> => {
    const response = await fetch(`${API_URL}/architecture/tasks/${taskId}`);
    return handleResponse<TaskResult>(response);
  },

  // ──── Conversations ────
  getConversations: async (token: string): Promise<Conversation[]> => {
    const response = await fetch(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<Conversation[]>(response);
  },

  getMessages: async (conversationId: string, token: string): Promise<Message[]> => {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<Message[]>(response);
  },

  // ──── Authentication ────
  register: async (data: RegisterData): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<TokenResponse>(response);
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(
      `${API_URL}/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return handleResponse<TokenResponse>(response);
  },

  getMe: async (accessToken: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<User>(response);
  },
};
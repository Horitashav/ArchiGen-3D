export interface RoomSpec {
  name: string;
  floor_level: number;
  dimensions_approx: string;
}

export interface ArchitectureSpec {
  building_type: string;
  architectural_style: string;
  total_floors: number;
  materials: string[];
  key_features: string[];
  color_palette: string[];
  rooms: RoomSpec[] | null;
  refined_3d_prompt: string;
}

export type TaskStatus =
  | "pending"
  | "parsing"
  | "generating_2d"
  | "generating_3d"
  | "completed"
  | "failed";

export interface GenerationRequest {
  prompt: string;
  conversation_id?: string | null;
}

export interface GenerationResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
  conversation_id?: string;
}

export interface TaskResult {
  task_id: string;
  status: TaskStatus;
  architecture_spec: string | ArchitectureSpec | null;
  model_url: string | null;
  preview_url: string | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_preview: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  architecture_spec: ArchitectureSpec | null;
  model_url: string | null;
  status: TaskStatus | null;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}
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
}

export interface GenerationResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
}

export interface TaskResult {
  task_id: string;
  status: TaskStatus;
  architecture_spec: string | null;
  model_url: string | null;
  preview_url: string | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}
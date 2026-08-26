import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/architecture";

export const generateArchitecture = async (prompt) => {
  const response = await axios.post(`${API_BASE_URL}/generate`, { prompt });
  return response.data;
};

export const parseBlueprintOnly = async (prompt) => {
  const response = await axios.post(`${API_BASE_URL}/parse-only`, { prompt });
  return response.data;
};

export const fetchRecentTasks = async (limit = 6) => {
  const response = await axios.get(`${API_BASE_URL}/tasks?limit=${limit}`);
  return response.data;
};

export const fetchTaskById = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
  return response.data;
};
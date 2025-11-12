import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  timeout: 10_000,
});

let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;

  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

apiClient.interceptors.request.use((config) => {
  if (currentToken && !config.headers?.Authorization) {
    config.headers.set("Authorization", `Bearer ${currentToken}`);
  }
  return config;
});

export default apiClient;


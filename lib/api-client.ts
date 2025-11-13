import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  timeout: 10_000,
});

let currentToken: string | null = null;
let logoutCallback: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;

  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function setLogoutCallback(callback: (() => void) | null) {
  logoutCallback = callback;
}

apiClient.interceptors.request.use((config) => {
  if (currentToken && !config.headers?.Authorization) {
    config.headers.set("Authorization", `Bearer ${currentToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), deslogar o usuário
    if (error.response?.status === 401) {
      console.warn("🔒 Token expirado ou inválido. Deslogando usuário...");
      
      // Limpar token
      currentToken = null;
      delete apiClient.defaults.headers.common.Authorization;
      
      // Chamar callback de logout se estiver registrado
      if (logoutCallback) {
        logoutCallback();
      }
      
      // Redirecionar para login apenas se estiver no browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;


import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { useAuthStore } from "../state/auth.ts";

export const apiClient = axios.create({ timeout: 15000 });

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.token.accessToken;
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.request<T>({ ...config, ...options });
  return data;
}

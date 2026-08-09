import axios from "axios";
import type { ApiError } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("libman_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized: ApiError = error.response?.data ?? {
      error: {
        code: "NETWORK_ERROR",
        message: error.message ?? "Something went wrong. Please try again.",
      },
    };
    return Promise.reject(normalized);
  }
);

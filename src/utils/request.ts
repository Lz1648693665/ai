import axios, { type AxiosError, type AxiosResponse } from "axios";

import { useUserStore } from "../store/userStore";
import { clearToken, getToken } from "./token";

interface ApiEnvelope {
  code?: number | string;
  status?: number | string;
  success?: boolean;
  message?: string;
  msg?: string;
  data?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeCode(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return undefined;
}

function unwrapResponse(data: unknown): AxiosResponse["data"] {
  if (!isObject(data)) {
    return data;
  }

  const envelope = data as ApiEnvelope;
  const hasBusinessCode = "code" in envelope || "status" in envelope || "success" in envelope;

  if (!hasBusinessCode) {
    return data;
  }

  const code = normalizeCode(envelope.code ?? envelope.status);
  const isFailed =
    envelope.success === false ||
    (typeof code === "number" && Number.isFinite(code) && code !== 0 && code !== 200);

  if (isFailed) {
    throw new Error(envelope.message || envelope.msg || "请求失败");
  }

  return "data" in envelope ? envelope.data : data;
}

function getResponseMessage(data: unknown) {
  if (isObject(data)) {
    const envelope = data as ApiEnvelope;
    return envelope.message || envelope.msg;
  }

  return typeof data === "string" ? data : "";
}

function createRequestError(error: AxiosError) {
  const responseMessage = getResponseMessage(error.response?.data);

  if (responseMessage) {
    return new Error(responseMessage);
  }

  if (error.response?.status) {
    return new Error(`请求失败（${error.response.status}）`);
  }

  return error;
}

function clearAuthState() {
  clearToken();
  useUserStore.setState({ token: null, user: null });
}

export const request = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 60000,
});

request.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => unwrapResponse(response.data),
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthState();
    }

    console.error("请求错误：", error);
    return Promise.reject(createRequestError(error));
  },
);

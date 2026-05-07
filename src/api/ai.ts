import { request } from "../utils/request";

import type { TemplateId } from "../types/template";

export interface AiResult {
  result: string;
  historyId?: string | number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatParams {
  message: string;
  model?: string;
  messages: ChatMessage[];
}

export interface AiModelOption {
  name: string;
  label?: string;
  provider?: string;
  description?: string;
  available?: boolean;
}

export interface AiModelsResponse {
  defaultModel?: string;
  models: Array<string | AiModelOption>;
}

export type ChatResponse =
  | string
  | {
      result?: string;
      content?: string;
      message?: string;
      model?: string;
      modelName?: string;
      historyId?: string | number;
    };

export interface RunTemplateParams {
  templateId: TemplateId;
  variables: Record<string, string>;
  prompt: string;
}

export interface JsonToTsParams {
  json: string;
}

export interface BugAnalyzeParams {
  problemDescription: string;
  code: string;
  error: string;
  runtime: string;
  expected: string;
  actual: string;
}

export interface AiSettingsParams {
  provider: string;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

export function runTemplateApi(data: RunTemplateParams) {
  return request.post<unknown, AiResult, RunTemplateParams>("/ai/template/run", data);
}

export function chatApi(data: ChatParams) {
  return request.post<unknown, ChatResponse, ChatParams>("/ai/chat", data);
}

export function getAiModelsApi() {
  return request.get<unknown, AiModelsResponse>("/ai/models");
}

export function jsonToTsApi(data: JsonToTsParams) {
  return request.post<unknown, AiResult, JsonToTsParams>("/tools/json-to-ts", data);
}

export function bugAnalyzeApi(data: BugAnalyzeParams) {
  return request.post<unknown, AiResult, BugAnalyzeParams>("/tools/bug-analyze", data);
}

export function saveAiSettingsApi(data: AiSettingsParams) {
  return request.post<unknown, { success?: boolean }, AiSettingsParams>("/settings/ai", data);
}

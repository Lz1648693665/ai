import { request } from "../utils/request";

import type { Template, TemplateId, TemplatePayload } from "../types/template";

export function getTemplatesApi() {
  return request.get<unknown, Template[]>("/templates");
}

export function getTemplateApi(id: TemplateId) {
  return request.get<unknown, Template>(`/templates/${id}`);
}

export function createTemplateApi(data: TemplatePayload) {
  return request.post<unknown, Template, TemplatePayload>("/templates", data);
}

export function updateTemplateApi(id: TemplateId, data: TemplatePayload) {
  return request.put<unknown, Template, TemplatePayload>(`/templates/${id}`, data);
}

export function deleteTemplateApi(id: TemplateId) {
  return request.delete<unknown, void>(`/templates/${id}`);
}

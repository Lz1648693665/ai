export type TemplateId = string | number;

export interface Template {
  id: TemplateId;
  title: string;
  category?: string;
  description?: string;
  tags?: string[];
  content?: string;
  useCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplatePayload {
  title: string;
  category: string;
  tags: string[];
  description: string;
  content: string;
}

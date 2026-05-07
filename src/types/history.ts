export type HistoryType = "template" | "json_to_ts" | "bug_analyzer" | "chat" | string;

export interface HistoryItem {
  id: string | number;
  type: HistoryType;
  templateName?: string;
  title?: string;
  finalPrompt?: string;
  input?: unknown;
  inputContent?: unknown;
  result?: string;
  aiResult?: string;
  createdAt?: string;
  favoriteAt?: string;
}

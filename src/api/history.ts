import { request } from "../utils/request";

import type { HistoryItem } from "../types/history";

export function getHistoryApi() {
  return request.get<unknown, HistoryItem[]>("/history");
}

export function getHistoryDetailApi(id: string | number) {
  return request.get<unknown, HistoryItem>(`/history/${id}`);
}

export function deleteHistoryApi(id: string | number) {
  return request.delete<unknown, void>(`/history/${id}`);
}

export function favoriteHistoriesApi(historyIds: Array<string | number>) {
  return request.post<unknown, { success?: boolean }, { historyIds: Array<string | number> }>(
    "/history/favorites",
    { historyIds },
  );
}

export function getFavoriteHistoryApi() {
  return request.get<unknown, HistoryItem[]>("/history/favorites");
}

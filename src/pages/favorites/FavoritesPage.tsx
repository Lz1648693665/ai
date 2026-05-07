import { useEffect, useState } from "react";

import { getFavoriteHistoryApi, getHistoryDetailApi } from "../../api/history";
import { Empty } from "../../components/common/Empty";
import { Loading } from "../../components/common/Loading";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer";
import type { HistoryItem } from "../../types/history";

function formatPayload(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

function getHistoryTitle(item: HistoryItem) {
  return item.templateName || item.title || String(item.type);
}

export function FavoritesPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFavorites = async () => {
      try {
        const response = await getFavoriteHistoryApi();

        if (active) {
          setItems(response);
          setSelected(response[0] ?? null);
        }
      } catch {
        if (active) {
          setError("收藏记录加载失败，请确认后端收藏接口是否可用。");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  const handleSelect = async (item: HistoryItem) => {
    try {
      const response = await getHistoryDetailApi(item.id);
      setSelected({ ...response, favoriteAt: item.favoriteAt ?? response.favoriteAt });
    } catch {
      setSelected(item);
    }
  };

  if (loading) {
    return <Loading text="正在加载收藏记录..." />;
  }

  if (items.length === 0) {
    return <Empty title="暂无收藏" description={error || "在运行历史里选择记录并收藏后，会显示在这里。"} />;
  }

  return (
    <div className="history-layout">
      <section className="section-panel history-list">
        {error ? <p className="error-text">{error}</p> : null}
        {items.map((item) => (
          <article
            className={selected?.id === item.id ? "history-item favorite-history-item active" : "history-item favorite-history-item"}
            key={item.id}
          >
            <button type="button" onClick={() => void handleSelect(item)}>
              <strong>{getHistoryTitle(item)}</strong>
              <span>收藏时间：{formatDate(item.favoriteAt)}</span>
              <small>创建时间：{formatDate(item.createdAt)}</small>
            </button>
          </article>
        ))}
      </section>

      <section className="section-panel result-panel">
        <p className="eyebrow">收藏详情</p>
        <h2>{selected ? getHistoryTitle(selected) : "收藏详情"}</h2>
        <div className="detail-block">
          <strong>收藏时间</strong>
          <p className="muted-text">{formatDate(selected?.favoriteAt)}</p>
        </div>
        <div className="detail-block">
          <strong>输入内容</strong>
          <pre>{formatPayload(selected?.finalPrompt ?? selected?.inputContent ?? selected?.input)}</pre>
        </div>
        <div className="detail-block">
          <strong>AI 结果</strong>
          <MarkdownViewer content={selected?.aiResult ?? selected?.result ?? ""} />
        </div>
      </section>
    </div>
  );
}

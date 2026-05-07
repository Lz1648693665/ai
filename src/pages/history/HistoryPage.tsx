import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteHistoryApi, favoriteHistoriesApi, getHistoryApi, getHistoryDetailApi } from "../../api/history";
import { Empty } from "../../components/common/Empty";
import { Loading } from "../../components/common/Loading";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer";
import type { HistoryItem } from "../../types/history";

function formatHistoryType(type: string) {
  const map: Record<string, string> = {
    template: "模板运行",
    json_to_ts: "JSON 转 TS",
    bug_analyzer: "Bug 分析器",
    chat: "对话",
  };

  return map[type] ?? type;
}

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

export function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [checkedIds, setCheckedIds] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState("");

  const allChecked = items.length > 0 && checkedIds.length === items.length;

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const response = await getHistoryApi();

        if (active) {
          setItems(response);
          setSelected(response[0] ?? null);
        }
      } catch {
        if (active) {
          setError("历史记录加载失败，请确认后端服务是否启动。");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const handleSelect = async (item: HistoryItem) => {
    try {
      const response = await getHistoryDetailApi(item.id);
      setSelected(response);
    } catch {
      setSelected(item);
    }
  };

  const handleToggleCheck = (id: string | number) => {
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleAll = () => {
    setCheckedIds(allChecked ? [] : items.map((item) => item.id));
  };

  const handleDelete = async (item: HistoryItem) => {
    const confirmed = window.confirm("确认删除这条历史记录吗？");

    if (!confirmed) {
      return;
    }

    await deleteHistoryApi(item.id);
    setItems((prev) => prev.filter((history) => history.id !== item.id));
    setCheckedIds((prev) => prev.filter((id) => id !== item.id));
    setSelected((prev) => (prev?.id === item.id ? null : prev));
  };

  const handleBatchDelete = async () => {
    if (checkedIds.length === 0) {
      return;
    }

    setBatchLoading(true);
    setError("");

    try {
      await Promise.all(checkedIds.map((id) => deleteHistoryApi(id)));
      setItems((prev) => prev.filter((item) => !checkedIds.includes(item.id)));
      setSelected((prev) => (prev && checkedIds.includes(prev.id) ? null : prev));
      setCheckedIds([]);
    } catch {
      setError("批量删除失败，请稍后重试。");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchFavorite = async () => {
    if (checkedIds.length === 0) {
      return;
    }

    setBatchLoading(true);
    setError("");

    try {
      await favoriteHistoriesApi(checkedIds);
      setCheckedIds([]);
      navigate("/favorites");
    } catch {
      setError("收藏失败，请确认后端收藏接口是否可用。");
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading) {
    return <Loading text="正在加载历史记录..." />;
  }

  if (items.length === 0) {
    return <Empty title="暂无运行历史" description={error || "运行模板或工具后会在这里看到记录。"} />;
  }

  return (
    <div className="history-layout">
      <section className="section-panel history-list">
        <div className="history-toolbar">
          <button className="secondary-button compact-button" type="button" onClick={handleToggleAll}>
            {allChecked ? "取消全选" : "全选"}
          </button>
          <span>{checkedIds.length} 项已选</span>
          <button
            className="danger-button compact-button"
            type="button"
            onClick={() => void handleBatchDelete()}
            disabled={checkedIds.length === 0 || batchLoading}
          >
            删除所选
          </button>
          <button
            className="primary-button compact-button"
            type="button"
            onClick={() => void handleBatchFavorite()}
            disabled={checkedIds.length === 0 || batchLoading}
          >
            收藏所选
          </button>
          <button className="ghost-button compact-button" type="button" onClick={() => navigate("/favorites")}>
            查看收藏
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {items.map((item) => (
          <article
            className={selected?.id === item.id ? "history-item selectable-history-item active" : "history-item selectable-history-item"}
            key={item.id}
          >
            <label className="history-checkbox">
              <input
                type="checkbox"
                checked={checkedIds.includes(item.id)}
                onChange={() => handleToggleCheck(item.id)}
                aria-label={`选择 ${item.templateName || item.title || formatHistoryType(item.type)}`}
              />
            </label>
            <button type="button" onClick={() => void handleSelect(item)}>
              <strong>{item.templateName || item.title || formatHistoryType(item.type)}</strong>
              <span>{formatHistoryType(item.type)}</span>
              <small>{formatDate(item.createdAt)}</small>
            </button>
            <button className="danger-button compact-button" type="button" onClick={() => void handleDelete(item)}>
              删除
            </button>
          </article>
        ))}
      </section>

      <section className="section-panel result-panel">
        <p className="eyebrow">查看详情</p>
        <h2>{selected?.templateName || selected?.title || "历史详情"}</h2>
        <div className="detail-block">
          <strong>输入内容</strong>
          <pre>{formatPayload(selected?.finalPrompt)}</pre>
        </div>
        <div className="detail-block">
          <strong>AI 结果</strong>
          <MarkdownViewer content={selected?.aiResult ?? selected?.result ?? ""} />
        </div>
      </section>
    </div>
  );
}

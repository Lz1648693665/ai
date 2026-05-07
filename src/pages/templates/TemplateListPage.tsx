import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { deleteTemplateApi, getTemplatesApi } from "../../api/template";
import { Empty } from "../../components/common/Empty";
import { Loading } from "../../components/common/Loading";
import type { Template } from "../../types/template";

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function TemplateListPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTemplates = async () => {
      try {
        const response = await getTemplatesApi();

        if (active) {
          setTemplates(response);
        }
      } catch {
        if (active) {
          setError("模板列表加载失败，请确认后端服务是否启动。");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) {
      return templates;
    }

    return templates.filter((template) => {
      return [template.title, template.category, template.description, ...(template.tags ?? [])]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(text));
    });
  }, [keyword, templates]);

  const handleDelete = async (template: Template) => {
    const confirmed = window.confirm(`确认删除模板「${template.title}」吗？`);

    if (!confirmed) {
      return;
    }

    await deleteTemplateApi(template.id);
    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
  };

  if (loading) {
    return <Loading text="正在加载模板..." />;
  }

  return (
    <div className="page-stack">
      <section className="toolbar">
        <input
          className="search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索标题、分类、描述或标签"
        />
        <Link className="primary-button" to="/templates/create">
          新增模板
        </Link>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      {filteredTemplates.length === 0 ? (
        <Empty
          title="还没有模板"
          description="先创建一个 Prompt 模板，再进入运行页填写变量。"
          action={
            <Link className="primary-button" to="/templates/create">
              新增模板
            </Link>
          }
        />
      ) : (
        <section className="card-grid">
          {filteredTemplates.map((template) => (
            <article className="template-card" key={template.id}>
              <div className="card-header">
                <div>
                  <h3>{template.title}</h3>
                  <p>{template.category || "未分类"}</p>
                </div>
                <span className="count-badge">{template.useCount ?? 0} 次</span>
              </div>

              <p className="card-description">{template.description || "暂无描述"}</p>

              <div className="tag-row">
                {(template.tags ?? []).length > 0 ? (
                  template.tags?.map((tag) => <span key={tag}>{tag}</span>)
                ) : (
                  <span>无标签</span>
                )}
              </div>

              <div className="card-meta">创建时间：{formatDate(template.createdAt)}</div>

              <div className="button-row">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => navigate(`/templates/${template.id}/run`)}
                >
                  运行
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  编辑
                </button>
                <button className="danger-button" type="button" onClick={() => void handleDelete(template)}>
                  删除
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

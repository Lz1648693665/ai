import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { createTemplateApi, getTemplateApi, updateTemplateApi } from "../../api/template";
import { Loading } from "../../components/common/Loading";
import type { Template, TemplatePayload } from "../../types/template";
import { parseVariables } from "../../utils/prompt";

const defaultContent = `你是资深前端工程师，请分析下面的问题。

问题描述：
{{description}}

相关代码：
{{code}}

报错信息：
{{error}}

请输出：
1. 最可能原因
2. 排查步骤
3. 修改建议
4. 修改后的代码`;

const defaultForm: TemplatePayload = {
  title: "",
  category: "",
  tags: [],
  description: "",
  content: defaultContent,
};

function toPayload(template: Template): TemplatePayload {
  return {
    title: template.title,
    category: template.category ?? "",
    tags: template.tags ?? [],
    description: template.description ?? "",
    content: template.content ?? "",
  };
}

export function TemplateEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<TemplatePayload>(defaultForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!id) {
      Promise.resolve().then(() => {
        if (active) {
          setForm(defaultForm);
          setLoading(false);
          setError("");
        }
      });

      return () => {
        active = false;
      };
    }

    const loadTemplate = async () => {
      Promise.resolve().then(() => {
        if (active) {
          setLoading(true);
          setError("");
        }
      });

      try {
        const response = await getTemplateApi(id);

        if (active) {
          setForm(toPayload(response));
        }
      } catch {
        if (active) {
          setError("模板详情加载失败。");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTemplate();

    return () => {
      active = false;
    };
  }, [id]);

  const variables = useMemo(() => parseVariables(form.content), [form.content]);

  const updateField = <K extends keyof TemplatePayload>(field: K, value: TemplatePayload[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    updateField(
      "tags",
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (id) {
        await updateTemplateApi(id, form);
      } else {
        await createTemplateApi(form);
      }

      navigate("/templates");
    } catch {
      setError("模板保存失败，请检查表单或后端接口。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="正在加载模板详情..." />;
  }

  return (
    <form className="editor-layout" onSubmit={handleSubmit}>
      <section className="section-panel form-stack">
        <label className="field">
          <span>模板标题</span>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="例如：前端 Bug 排查助手"
            required
          />
        </label>

        <div className="two-column">
          <label className="field">
            <span>分类</span>
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="例如：前端"
            />
          </label>

          <label className="field">
            <span>标签</span>
            <input
              value={form.tags.join(", ")}
              onChange={(event) => handleTagsChange(event.target.value)}
              placeholder="React, TypeScript"
            />
          </label>
        </div>

        <label className="field">
          <span>描述</span>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            placeholder="说明这个模板适合什么场景"
          />
        </label>

        <label className="field">
          <span>模板内容</span>
          <textarea
            className="prompt-editor"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
            rows={18}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="button-row">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存模板"}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate("/templates")}>
            返回列表
          </button>
        </div>
      </section>

      <aside className="section-panel side-panel">
        <p className="eyebrow">变量预览</p>
        <h2>{variables.length} 个变量</h2>
        <div className="variable-list">
          {variables.length > 0 ? variables.map((name) => <span key={name}>{name}</span>) : <p>暂无变量</p>}
        </div>
      </aside>
    </form>
  );
}

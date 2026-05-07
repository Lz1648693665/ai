import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { runTemplateApi } from "../../api/ai";
import { getTemplateApi } from "../../api/template";
import { Empty } from "../../components/common/Empty";
import { Loading } from "../../components/common/Loading";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer";
import type { Template } from "../../types/template";
import { fillPrompt, parseVariables } from "../../utils/prompt";

export function TemplateRunPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

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
          setTemplate(response);
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

  const variables = useMemo(() => parseVariables(template?.content ?? ""), [template?.content]);
  const promptPreview = useMemo(() => fillPrompt(template?.content ?? "", values), [template?.content, values]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = async () => {
    if (!id) {
      return;
    }

    setRunning(true);
    setError("");

    try {
      const response = await runTemplateApi({
        templateId: id,
        variables: values,
        prompt: promptPreview,
      });
      setResult(response.result);
    } catch {
      setError("模板运行失败，请确认后端 AI 接口是否可用。");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <Loading text="正在加载模板..." />;
  }

  if (!template) {
    return (
      <Empty
        title="模板不存在"
        description={error || "请返回模板列表选择一个可运行的模板。"}
        action={
          <button className="primary-button" type="button" onClick={() => navigate("/templates")}>
            返回模板列表
          </button>
        }
      />
    );
  }

  return (
    <div className="run-layout">
      <section className="section-panel form-stack">
        <div>
          <p className="eyebrow">变量表单</p>
          <h2>{template.title}</h2>
          <p className="muted-text">{template.description || "填写变量后运行模板。"}</p>
        </div>

        {variables.length > 0 ? (
          variables.map((name) => (
            <label className="field" key={name}>
              <span>{name}</span>
              <textarea
                rows={5}
                value={values[name] ?? ""}
                onChange={(event) => handleChange(name, event.target.value)}
                placeholder={`请输入 ${name}`}
              />
            </label>
          ))
        ) : (
          <Empty title="模板里没有变量" description="可以直接运行，或回到编辑页添加 {{variable}}。" />
        )}

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="button" onClick={() => void handleRun()} disabled={running}>
          {running ? "运行中..." : "运行模板"}
        </button>
      </section>

      <section className="section-panel result-panel">
        <p className="eyebrow">AI 返回结果</p>
        <MarkdownViewer content={result} />
      </section>

      <section className="section-panel prompt-preview">
        <p className="eyebrow">最终 Prompt 预览</p>
        <pre>{promptPreview}</pre>
      </section>
    </div>
  );
}

import { useState } from "react";

import { bugAnalyzeApi, type BugAnalyzeParams } from "../../api/ai";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer";

const fields: Array<{ name: keyof BugAnalyzeParams; label: string; rows: number }> = [
  { name: "problemDescription", label: "问题描述", rows: 4 },
  { name: "code", label: "相关代码", rows: 8 },
  { name: "error", label: "报错信息", rows: 4 },
  { name: "runtime", label: "运行环境", rows: 3 },
  { name: "expected", label: "期望结果", rows: 3 },
  { name: "actual", label: "实际结果", rows: 3 },
];

const initialForm: BugAnalyzeParams = {
  problemDescription: "",
  code: "",
  error: "",
  runtime: "",
  expected: "",
  actual: "",
};

export function BugAnalyzerPage() {
  const [form, setForm] = useState<BugAnalyzeParams>(initialForm);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (name: keyof BugAnalyzeParams, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await bugAnalyzeApi(form);
      setResult(response.result);
    } catch {
      setError("分析失败，请确认 /api/tools/bug-analyze 接口是否可用。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-layout wide-output">
      <section className="section-panel form-stack">
        {fields.map((field) => (
          <label className="field" key={field.name}>
            <span>{field.label}</span>
            <textarea
              value={form[field.name]}
              onChange={(event) => updateField(field.name, event.target.value)}
              rows={field.rows}
              placeholder={`请输入${field.label}`}
            />
          </label>
        ))}

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="button" onClick={() => void handleAnalyze()} disabled={loading}>
          {loading ? "分析中..." : "开始分析"}
        </button>
      </section>

      <section className="section-panel result-panel">
        <p className="eyebrow">AI 分析结果</p>
        <MarkdownViewer content={result} />
      </section>
    </div>
  );
}

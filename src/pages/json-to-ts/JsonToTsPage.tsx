import { useState } from "react";

import { jsonToTsApi } from "../../api/ai";

const sampleJson = `{
  "id": 1,
  "name": "张三"
}`;

export function JsonToTsPage() {
  const [jsonText, setJsonText] = useState(sampleJson);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");

    try {
      JSON.parse(jsonText);
    } catch {
      setError("请输入合法 JSON 后再生成。");
      return;
    }

    setLoading(true);

    try {
      const response = await jsonToTsApi({ json: jsonText });
      setResult(response.result);
    } catch {
      setError("生成失败，请确认 /api/tools/json-to-ts 接口是否可用。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="tool-layout">
      <section className="section-panel form-stack">
        <div className="tool-header">
          <div>
            <p className="eyebrow">输入</p>
            <h2>JSON</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => setJsonText("")}>
            清空
          </button>
        </div>

        <textarea
          className="code-editor"
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          rows={20}
          spellCheck={false}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="button" onClick={() => void handleGenerate()} disabled={loading}>
          {loading ? "生成中..." : "生成"}
        </button>
      </section>

      <section className="section-panel form-stack">
        <div className="tool-header">
          <div>
            <p className="eyebrow">输出</p>
            <h2>TypeScript</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => void handleCopy()} disabled={!result}>
            复制
          </button>
        </div>

        <pre className="code-output">{result || "生成结果会显示在这里"}</pre>
      </section>
    </div>
  );
}

import { useState, type FormEvent } from "react";

import { saveAiSettingsApi, type AiSettingsParams } from "../../api/ai";

const initialSettings: AiSettingsParams = {
  provider: "",
  apiKey: "",
  baseUrl: "",
  modelName: "",
};

export function SettingsPage() {
  const [form, setForm] = useState<AiSettingsParams>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = <K extends keyof AiSettingsParams>(field: K, value: AiSettingsParams[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await saveAiSettingsApi(form);
      setMessage("配置已提交给后端保存。");
    } catch {
      setError("保存失败，请确认 /api/settings/ai 接口是否可用。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="section-panel settings-form form-stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>模型服务商</span>
        <input
          value={form.provider}
          onChange={(event) => updateField("provider", event.target.value)}
          placeholder="例如：OpenAI、通义千问、DeepSeek"
        />
      </label>

      <label className="field">
        <span>API Key</span>
        <input
          value={form.apiKey}
          onChange={(event) => updateField("apiKey", event.target.value)}
          placeholder="提交给后端保存，前端不直接调用 AI 服务"
          type="password"
        />
      </label>

      <label className="field">
        <span>Base URL</span>
        <input
          value={form.baseUrl}
          onChange={(event) => updateField("baseUrl", event.target.value)}
          placeholder="例如：https://api.openai.com/v1"
        />
      </label>

      <label className="field">
        <span>模型名称</span>
        <input
          value={form.modelName}
          onChange={(event) => updateField("modelName", event.target.value)}
          placeholder="例如：gpt-4o-mini"
        />
      </label>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? "保存中..." : "保存配置"}
      </button>
    </form>
  );
}

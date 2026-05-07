import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerApi, type RegisterParams } from "../../api/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterParams>({
    username: "",
    password: "",
    nickname: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof RegisterParams>(field: K, value: RegisterParams[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerApi(form);
      navigate("/login", {
        replace: true,
        state: { message: "注册成功，请使用新账号登录。" },
      });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "注册失败，请检查表单或后端服务。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <span className="brand-mark">D</span>
          <h1>创建账号</h1>
          <p>注册后回到登录页获取 token，再进入 DevPilot 工作台。</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>用户名</span>
            <input
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>昵称</span>
            <input
              value={form.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
              placeholder="请输入昵称"
              required
            />
          </label>

          <label className="field">
            <span>密码</span>
            <input
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="请输入密码"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button full-button" type="submit" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </button>

          <Link className="secondary-button full-button" to="/login">
            返回登录
          </Link>
        </form>
      </section>
    </main>
  );
}

import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginApi, type LoginParams, type LoginResponse } from "../../api/auth";
import { useUserStore } from "../../store/userStore";
import { saveToken } from "../../utils/token";

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
  message?: string;
}

function getLoginPayload(response: LoginResponse | { data?: LoginResponse }): LoginResponse {
  if ("data" in response && response.data) {
    return response.data;
  }

  return response as LoginResponse;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useUserStore((state) => state.setAuth);
  const logout = useUserStore((state) => state.logout);
  const [form, setForm] = useState<LoginParams>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const notice = (location.state as LoginLocationState | null)?.message;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    logout();
    setError("");
    setLoading(true);

    try {
      const response = await loginApi(form);
      const payload = getLoginPayload(response);
      const token = saveToken(payload.token);
      setAuth(token, payload.user ?? { username: form.username });

      const from = (location.state as LoginLocationState | null)?.from;
      const redirectTo = from
        ? `${from.pathname ?? "/chat"}${from.search ?? ""}${from.hash ?? ""}`
        : "/chat";

      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      logout();
      submittingRef.current = false;
      setLoading(false);
      setError(loginError instanceof Error ? loginError.message : "登录失败，请检查用户名、密码或后端服务。");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <span className="brand-mark">D</span>
          <h1>DevPilot</h1>
          <p>登录后管理 Prompt 模板、运行 AI 工具并查看历史记录。</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>用户名</span>
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>密码</span>
            <input
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="请输入密码"
              type="password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {!error && notice ? <p className="success-text">{notice}</p> : null}

          <button className="primary-button full-button" type="submit" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>

          <Link className="secondary-button full-button" to="/register">
            注册账号
          </Link>
        </form>
      </section>
    </main>
  );
}

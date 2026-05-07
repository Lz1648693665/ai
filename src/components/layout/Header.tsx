import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUserStore } from "../../store/userStore";
import { clearToken } from "../../utils/token";

const pageTitles = [
  { title: "AI 聊天", match: (path: string) => path === "/chat" },
  { title: "模板运行", match: (path: string) => path.startsWith("/templates/") && path.endsWith("/run") },
  { title: "模板编辑", match: (path: string) => path.startsWith("/templates/") && path.endsWith("/edit") },
  { title: "新建模板", match: (path: string) => path === "/templates/create" },
  { title: "Prompt 模板", match: (path: string) => path === "/templates" },
  { title: "JSON 转 TypeScript", match: (path: string) => path === "/json-to-ts" },
  { title: "Bug 分析器", match: (path: string) => path === "/bug-analyzer" },
  { title: "运行历史", match: (path: string) => path === "/history" },
  { title: "收藏", match: (path: string) => path === "/favorites" },
  { title: "设置", match: (path: string) => path === "/settings" },
  { title: "工作台", match: (path: string) => path === "/dashboard" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useUserStore((state) => state.token);
  const logout = useUserStore((state) => state.logout);

  const title = useMemo(() => {
    return pageTitles.find((item) => item.match(location.pathname))?.title ?? "DevPilot";
  }, [location.pathname]);

  const handleLogout = () => {
    clearToken();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>把常用 Prompt、固定工具和运行历史放在一个清晰的工作流里。</p>
      </div>
      {token ? (
        <button className="ghost-button" type="button" onClick={handleLogout}>
          退出登录
        </button>
      ) : null}
    </header>
  );
}

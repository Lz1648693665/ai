import { NavLink } from "react-router-dom";

const navItems = [
  { label: "AI 聊天", path: "/chat", icon: "/favicon.svg" },
  { label: "工作台", path: "/dashboard" },
  { label: "Prompt 模板", path: "/templates" },
  { label: "JSON 转 TS", path: "/json-to-ts" },
  { label: "Bug 分析器", path: "/bug-analyzer" },
  { label: "运行历史", path: "/history" },
  { label: "收藏", path: "/favorites" },
  { label: "设置", path: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-icon" src="/favicon.svg" alt="" />
        <div>
          <strong>DevPilot</strong>
          <small>AI 开发助手</small>
        </div>
      </div>

      <nav className="side-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "side-link active" : "side-link")}
          >
            {"icon" in item ? <img src={item.icon} alt="" /> : null}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

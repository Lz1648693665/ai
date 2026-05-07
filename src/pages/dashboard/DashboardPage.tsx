import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "新建 Prompt 模板",
    description: "沉淀常用分析、生成和排查流程。",
    path: "/templates/create",
  },
  {
    title: "JSON 转 TS",
    description: "把接口示例快速整理成 TypeScript 类型。",
    path: "/json-to-ts",
  },
  {
    title: "Bug 分析器",
    description: "提交问题上下文，让后端 AI 服务给出排查建议。",
    path: "/bug-analyzer",
  },
];

export function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="section-panel">
        <div>
          <p className="eyebrow">工作台</p>
          <h2>模板和固定工具入口集中在这里</h2>
          <p className="muted-text">
            当前前端只负责组织输入和调用 Java 后端接口，AI API Key 不会放在浏览器代码里。
          </p>
        </div>
      </section>

      <section className="card-grid three-columns">
        {quickActions.map((action) => (
          <Link className="feature-card" to={action.path} key={action.path}>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

import type { ReactNode } from "react";

interface EmptyProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Empty({ title = "暂无数据", description, action }: EmptyProps) {
  return (
    <div className="empty-box">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}

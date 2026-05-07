interface LoadingProps {
  text?: string;
}

export function Loading({ text = "加载中..." }: LoadingProps) {
  return (
    <div className="state-box">
      <span className="loading-dot" />
      <span>{text}</span>
    </div>
  );
}

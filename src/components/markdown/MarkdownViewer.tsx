import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import ReactMarkdown, { type Components } from "react-markdown";

interface MarkdownViewerProps {
  content: string;
}

const components: Components = {
  code(props) {
    const codeText = String(props.children ?? "");
    const language = /language-(\w+)/.exec(props.className ?? "")?.[1];

    if (language && hljs.getLanguage(language)) {
      const highlighted = hljs.highlight(codeText, { language }).value;

      return (
        <code
          className={props.className}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    }

    return <code className={props.className}>{props.children}</code>;
  },
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content.trim()) {
    return <div className="markdown-placeholder">AI 结果会显示在这里</div>;
  }

  return (
    <div className="markdown-viewer">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

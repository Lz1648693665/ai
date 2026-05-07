import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";

import {
  chatApi,
  getAiModelsApi,
  type AiModelOption,
  type AiModelsResponse,
  type ChatMessage,
  type ChatResponse,
} from "../../api/ai";
import { MarkdownViewer } from "../markdown/MarkdownViewer";

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  input: string;
  modelName: string;
  updatedAt: string;
  archived: boolean;
}

interface ChatWorkspaceState {
  sessions: ChatSession[];
  activeSessionId: string;
}

interface LegacyChatStorageState {
  messages?: ChatMessage[];
  input?: string;
  modelName?: string;
}

const workspaceStorageKey = "devpilot.chat.workspace";
const legacyStorageKey = "devpilot.chat.state";

interface ModelItem {
  name: string;
  label: string;
}

function getAssistantContent(response: ChatResponse) {
  if (typeof response === "string") {
    return response;
  }

  return response.result || response.content || response.message || "";
}

function getResponseModel(response: ChatResponse) {
  if (typeof response === "string") {
    return "";
  }

  return response.modelName || response.model || "";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "AI 聊天请求失败";
}

function normalizeModelOption(model: string | AiModelOption): ModelItem | null {
  if (typeof model === "string") {
    const name = model.trim();
    return name ? { name, label: name } : null;
  }

  const name = model.name?.trim();

  if (!name) {
    return null;
  }

  return {
    name,
    label: model.label?.trim() || name,
  };
}

function normalizeModelsResponse(response: AiModelsResponse) {
  const models = response.models.map(normalizeModelOption).filter((model): model is ModelItem => Boolean(model));
  const defaultModel = response.defaultModel?.trim() || models[0]?.name || "";

  return { models, defaultModel };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function createSession(overrides: Partial<ChatSession> = {}): ChatSession {
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "New chat",
    messages: overrides.messages ?? [],
    input: overrides.input ?? "",
    modelName: overrides.modelName ?? "",
    updatedAt: overrides.updatedAt ?? now,
    archived: overrides.archived ?? false,
  };
}

function getTitleFromMessages(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();

  if (!firstUserMessage) {
    return "New chat";
  }

  return firstUserMessage.length > 24 ? `${firstUserMessage.slice(0, 24)}...` : firstUserMessage;
}

function normalizeSession(value: unknown): ChatSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<ChatSession>;
  const messages = Array.isArray(session.messages) ? session.messages.filter(isChatMessage) : [];

  return createSession({
    id: typeof session.id === "string" ? session.id : undefined,
    title: typeof session.title === "string" && session.title.trim() ? session.title : getTitleFromMessages(messages),
    messages,
    input: typeof session.input === "string" ? session.input : "",
    modelName: typeof session.modelName === "string" && session.modelName.trim() ? session.modelName : "",
    updatedAt: typeof session.updatedAt === "string" ? session.updatedAt : undefined,
    archived: Boolean(session.archived),
  });
}

function loadLegacySession() {
  try {
    const rawValue = localStorage.getItem(legacyStorageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as LegacyChatStorageState;
    const messages = Array.isArray(parsedValue.messages) ? parsedValue.messages.filter(isChatMessage) : [];

    if (messages.length === 0 && !parsedValue.input) {
      return null;
    }

    return createSession({
      title: getTitleFromMessages(messages),
      messages,
      input: typeof parsedValue.input === "string" ? parsedValue.input : "",
      modelName: typeof parsedValue.modelName === "string" ? parsedValue.modelName : "",
    });
  } catch {
    return null;
  }
}

function loadWorkspaceState(): ChatWorkspaceState {
  try {
    const rawValue = localStorage.getItem(workspaceStorageKey);

    if (rawValue) {
      const parsedValue = JSON.parse(rawValue) as Partial<ChatWorkspaceState>;
      const sessions = Array.isArray(parsedValue.sessions)
        ? parsedValue.sessions.map(normalizeSession).filter((session): session is ChatSession => Boolean(session))
        : [];

      if (sessions.length > 0) {
        const activeSessionId =
          typeof parsedValue.activeSessionId === "string" &&
          sessions.some((session) => session.id === parsedValue.activeSessionId)
            ? parsedValue.activeSessionId
            : sessions[0].id;

        return { sessions, activeSessionId };
      }
    }
  } catch {
    // Fall through to legacy migration.
  }

  const legacySession = loadLegacySession();

  if (legacySession) {
    return {
      sessions: [legacySession],
      activeSessionId: legacySession.id,
    };
  }

  const session = createSession();
  return {
    sessions: [session],
    activeSessionId: session.id,
  };
}

function sortSessions(sessions: ChatSession[]) {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function getSessionPreview(session: ChatSession) {
  return session.messages.at(-1)?.content || session.input || "开始一个新的 AI 对话";
}

function getSessionTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

export function AiChatWindow() {
  const initialWorkspace = useMemo(() => loadWorkspaceState(), []);
  const [sessions, setSessions] = useState(initialWorkspace.sessions);
  const [activeSessionId, setActiveSessionId] = useState(initialWorkspace.activeSessionId);
  const [keyword, setKeyword] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [modelOptions, setModelOptions] = useState<ModelItem[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelError, setModelError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeSession = useMemo(() => {
    return sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  }, [activeSessionId, sessions]);

  const modelList = useMemo(() => {
    const currentModel = activeSession?.modelName.trim();

    if (!activeSession) {
      return modelOptions;
    }

    if (currentModel && !modelOptions.some((model) => model.name === currentModel)) {
      return [{ name: currentModel, label: currentModel }, ...modelOptions];
    }

    return modelOptions;
  }, [activeSession, modelOptions]);

  const visibleSessions = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return sortSessions(sessions).filter((session) => {
      const matchesArchive = showArchived ? session.archived : !session.archived;
      const matchesKeyword =
        !text ||
        session.title.toLowerCase().includes(text) ||
        session.messages.some((message) => message.content.toLowerCase().includes(text));

      return matchesArchive && matchesKeyword;
    });
  }, [keyword, sessions, showArchived]);

  useEffect(() => {
    localStorage.setItem(
      workspaceStorageKey,
      JSON.stringify({
        sessions,
        activeSessionId,
      }),
    );
  }, [activeSessionId, sessions]);

  useEffect(() => {
    let active = true;

    const loadModels = async () => {
      try {
        const response = await getAiModelsApi();
        const { models, defaultModel } = normalizeModelsResponse(response);

        if (!active) {
          return;
        }

        setModelOptions(models);
        setSessions((prev) =>
          prev.map((session) => {
            const currentModel = session.modelName.trim();
            const canKeepCurrent = currentModel && models.some((model) => model.name === currentModel);

            return {
              ...session,
              modelName: canKeepCurrent ? currentModel : defaultModel,
            };
          }),
        );
      } catch (modelsError) {
        if (active) {
          setModelError(getErrorMessage(modelsError));
        }
      } finally {
        if (active) {
          setModelsLoading(false);
        }
      }
    };

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  const updateActiveSession = (updater: (session: ChatSession) => ChatSession) => {
    if (!activeSession) {
      return;
    }

    setSessions((prev) =>
      prev.map((session) => (session.id === activeSession.id ? updater(session) : session)),
    );
  };

  const handleNewChat = () => {
    const session = createSession({ modelName: modelOptions[0]?.name ?? "" });
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setShowArchived(false);
    setError("");
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setShowArchived(session.archived);
    setError("");
  };

  const handleArchiveSession = (session: ChatSession) => {
    setSessions((prev) =>
      prev.map((item) =>
        item.id === session.id
          ? { ...item, archived: !item.archived, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const handleDeleteSession = (session: ChatSession) => {
    setDeleteTarget(session);
  };

  const confirmDeleteSession = () => {
    if (!deleteTarget) {
      return;
    }

    const targetId = deleteTarget.id;
    setSessions((prev) => {
      const nextSessions = prev.filter((item) => item.id !== targetId);

      if (nextSessions.length === 0) {
        const nextSession = createSession({ modelName: modelOptions[0]?.name ?? "" });
        setActiveSessionId(nextSession.id);
        return [nextSession];
      }

      if (activeSessionId === targetId) {
        setActiveSessionId(nextSessions[0].id);
      }

      return nextSessions;
    });
    setDeleteTarget(null);
  };

  const handleInputChange = (value: string) => {
    updateActiveSession((session) => ({
      ...session,
      input: value,
    }));
  };

  const handleModelChange = (value: string) => {
    updateActiveSession((session) => ({
      ...session,
      modelName: value,
      updatedAt: new Date().toISOString(),
    }));
    setModelMenuOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendCurrentMessage();
  };

  const sendCurrentMessage = async () => {
    if (!activeSession) {
      return;
    }

    const content = activeSession.input.trim();
    const currentModel = activeSession.modelName.trim();

    if (!content || loading) {
      return;
    }

    if (modelsLoading || !currentModel) {
      setError(modelsLoading ? "模型列表加载中，请稍后再发送。" : "后端没有返回可用模型。");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...activeSession.messages, userMessage];
    const nextTitle =
      activeSession.title === "New chat" ? getTitleFromMessages(nextMessages) : activeSession.title;
    const currentSessionId = activeSession.id;

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              title: nextTitle,
              messages: nextMessages,
              input: "",
              updatedAt: new Date().toISOString(),
            }
          : session,
      ),
    );
    setError("");
    setLoading(true);

    try {
      const response = await chatApi({
        message: content,
        model: currentModel,
        messages: nextMessages,
      });
      const answer = getAssistantContent(response) || "后端没有返回内容。";
      const responseModel = getResponseModel(response);
      const assistantMessage: ChatMessage = { role: "assistant", content: answer };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                modelName: responseModel || session.modelName,
                messages: [...session.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : session,
        ),
      );
    } catch (chatError) {
      setError(getErrorMessage(chatError));
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    void sendCurrentMessage();
  };

  const messages = activeSession?.messages ?? [];
  const input = activeSession?.input ?? "";
  const modelName = activeSession?.modelName?.trim() ?? "";
  const modelDisplayName = modelsLoading ? "加载模型中..." : modelName || "暂无可用模型";
  const archivedCount = sessions.filter((session) => session.archived).length;

  return (
    <section className="chat-workspace">
      <aside className="conversation-sidebar">
        <div className="conversation-search-row">
          <button className="conversation-menu-button" type="button" aria-label="会话菜单">
            =
          </button>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search"
          />
          <button className="conversation-new-button" type="button" onClick={handleNewChat}>
            New
          </button>
        </div>

        <button
          className={showArchived ? "archive-toggle active" : "archive-toggle"}
          type="button"
          onClick={() => setShowArchived((prev) => !prev)}
        >
          <span>Archived chats</span>
          <strong>{archivedCount}</strong>
        </button>

        <div className="conversation-list">
          {visibleSessions.length === 0 ? (
            <div className="conversation-empty">没有匹配的会话</div>
          ) : (
            visibleSessions.map((session) => (
              <article
                className={session.id === activeSessionId ? "conversation-item active" : "conversation-item"}
                key={session.id}
              >
                <button type="button" onClick={() => handleSelectSession(session)}>
                  <strong>{session.title}</strong>
                  <span>{getSessionPreview(session)}</span>
                  <small>{getSessionTime(session.updatedAt)}</small>
                </button>
                <div className="conversation-actions">
                  <button type="button" onClick={() => handleArchiveSession(session)}>
                    {session.archived ? "还原" : "归档"}
                  </button>
                  <button type="button" onClick={() => handleDeleteSession(session)}>
                    删除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>

      <section className="codex-chat">
        <div className="codex-chat-scroll">
          {messages.length === 0 ? (
            <div className="codex-empty">
              <img src="/favicon.svg" alt="DevPilot" />
            </div>
          ) : (
            <div className="codex-messages">
              {messages.map((message, index) => (
                <article className={`codex-message ${message.role}`} key={`${message.role}-${index}`}>
                  <span className="codex-message-avatar">
                    {message.role === "assistant" ? <img src="/favicon.svg" alt="" /> : "你"}
                  </span>
                  <div className="codex-message-content">
                    {message.role === "assistant" ? (
                      <MarkdownViewer content={message.content} />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </article>
              ))}

              {loading ? (
                <article className="codex-message assistant">
                  <span className="codex-message-avatar">
                    <img src="/favicon.svg" alt="" />
                  </span>
                  <div className="codex-message-content codex-thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </article>
              ) : null}
            </div>
          )}
        </div>

        <form className="codex-composer" onSubmit={handleSubmit}>
          <textarea
            aria-label="AI 聊天输入"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Send a message"
            rows={2}
          />
          {error || modelError ? <p className="codex-chat-error">{error || modelError}</p> : null}
          <div className="codex-composer-actions">
            <button className="icon-button" type="button" aria-label="添加上下文">
              +
            </button>
            <div className="codex-model-picker">
              <button
                className={modelMenuOpen ? "model-trigger active" : "model-trigger"}
                type="button"
                title={modelDisplayName}
                disabled={modelsLoading || modelList.length === 0}
                onClick={() => setModelMenuOpen((prev) => !prev)}
              >
                <span className="model-status-dot" />
                <span className="model-trigger-text">{modelDisplayName}</span>
                <span className="model-chevron">v</span>
              </button>
              {modelMenuOpen ? (
                <div className="model-menu">
                  {modelList.map((model) => (
                    <button
                      className={model.name === modelName ? "model-option active" : "model-option"}
                      key={model.name}
                      type="button"
                      onClick={() => handleModelChange(model.name)}
                    >
                      <span className="model-option-dot" />
                      <span>{model.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              className="send-circle"
              type="submit"
              disabled={loading || modelsLoading || !modelName || !input.trim()}
              aria-label="发送消息"
            >
              ↑
            </button>
          </div>
        </form>
      </section>

      {deleteTarget ? (
        <div className="chat-modal-backdrop" role="presentation">
          <section className="chat-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-chat-title">
            <h2 id="delete-chat-title">删除会话</h2>
            <p>确认删除「{deleteTarget.title}」吗？这个操作不会影响其他会话。</p>
            <div className="chat-confirm-actions">
              <button className="secondary-button" type="button" onClick={() => setDeleteTarget(null)}>
                取消
              </button>
              <button className="danger-button" type="button" onClick={confirmDeleteSession}>
                删除
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.ChatMessage;
import com.devpilot.dto.ChatRequest;
import com.devpilot.dto.ChatSessionArchiveRequest;
import com.devpilot.dto.ChatSessionCreateRequest;
import com.devpilot.dto.ChatSessionDetailResponse;
import com.devpilot.dto.ChatSessionSummaryResponse;
import com.devpilot.entity.AiChatSession;
import com.devpilot.entity.AiChatSessionMessage;
import com.devpilot.entity.PromptRunHistory;
import com.devpilot.repository.AiChatSessionMessageRepository;
import com.devpilot.repository.AiChatSessionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ChatService {

	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private final AiService aiService;
	private final HistoryService historyService;
	private final AiChatSessionRepository sessionRepository;
	private final AiChatSessionMessageRepository messageRepository;
	private final ObjectMapper objectMapper;

	@Transactional(readOnly = true)
	public List<ChatSessionSummaryResponse> listSessions(Long userId, String keyword, Boolean archived) {
		return sessionRepository.search(userId, keyword, Boolean.TRUE.equals(archived)).stream()
				.map(this::summary)
				.toList();
	}

	@Transactional(readOnly = true)
	public ChatSessionDetailResponse getSession(Long userId, Long sessionId) {
		AiChatSession session = getOwnedSession(userId, sessionId);
		ChatSessionDetailResponse response = new ChatSessionDetailResponse();
		response.setId(session.getId());
		response.setTitle(session.getTitle());
		response.setModel(session.getModel());
		response.setArchived(session.getArchived());
		response.setMessages(messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
				.map(this::message)
				.toList());
		return response;
	}

	@Transactional
	public ChatSessionSummaryResponse createSession(Long userId, ChatSessionCreateRequest request) {
		AiChatSession session = new AiChatSession();
		session.setUserId(userId);
		session.setTitle(StringUtils.hasText(request.getTitle()) ? request.getTitle() : "New chat");
		session.setModel(request.getModel());
		session.setArchived(false);
		session.setLastMessage("");
		return summary(sessionRepository.save(session));
	}

	@Transactional
	public ChatSessionSummaryResponse archiveSession(Long userId, Long sessionId, ChatSessionArchiveRequest request) {
		AiChatSession session = getOwnedSession(userId, sessionId);
		session.setArchived(Boolean.TRUE.equals(request.getArchived()));
		return summary(sessionRepository.save(session));
	}

	@Transactional
	public void deleteSession(Long userId, Long sessionId) {
		AiChatSession session = getOwnedSession(userId, sessionId);
		messageRepository.deleteBySessionId(session.getId());
		sessionRepository.delete(session);
	}

	@Transactional
	public AiChatResponse chat(Long userId, ChatRequest request) {
		List<ChatMessage> messages = messagesWithCurrentInput(request);

		AiChatRequest aiRequest = new AiChatRequest();
		aiRequest.setPrompt(request.getMessage());
		aiRequest.setModelName(request.getModel());
		aiRequest.setMessages(messages);

		AiChatResponse response = aiService.chat(aiRequest);
		PromptRunHistory history = historyService.saveRun(
				userId,
				null,
				"AI Chat",
				"chat",
				toJson(messages),
				request.getMessage(),
				response.getContent());
		AiChatSession session = saveSessionMessages(userId, request, response);
		response.setSessionId(session.getId());
		response.setTitle(session.getTitle());
		response.setUpdatedAt(format(session.getUpdatedAt()));
		response.setHistoryId(history.getId());
		return response;
	}

	private List<ChatMessage> messagesWithCurrentInput(ChatRequest request) {
		List<ChatMessage> messages = new ArrayList<>();
		if (request.getMessages() != null) {
			for (ChatMessage item : request.getMessages()) {
				if (item != null && StringUtils.hasText(item.getRole()) && StringUtils.hasText(item.getContent())) {
					messages.add(item);
				}
			}
		}
		ChatMessage current = new ChatMessage();
		current.setRole("user");
		current.setContent(request.getMessage());
		if (messages.isEmpty() || !sameMessage(messages.get(messages.size() - 1), current)) {
			messages.add(current);
		}
		return messages;
	}

	private AiChatSession saveSessionMessages(Long userId, ChatRequest request, AiChatResponse response) {
		AiChatSession session = request.getSessionId() == null
				? newSession(userId, request)
				: getOwnedSession(userId, request.getSessionId());

		ChatMessage userMessage = new ChatMessage();
		userMessage.setRole("user");
		userMessage.setContent(request.getMessage());
		saveMessage(session.getId(), userMessage);

		ChatMessage assistantMessage = new ChatMessage();
		assistantMessage.setRole("assistant");
		assistantMessage.setContent(response.getContent());
		saveMessage(session.getId(), assistantMessage);

		session.setLastMessage(response.getContent());
		session.setModel(StringUtils.hasText(response.getModelName()) ? response.getModelName() : request.getModel());
		if (!StringUtils.hasText(session.getTitle()) || "New chat".equals(session.getTitle())) {
			session.setTitle(titleFrom(request.getMessage()));
		}
		session.setUpdatedAt(LocalDateTime.now());
		return sessionRepository.save(session);
	}

	private AiChatSession newSession(Long userId, ChatRequest request) {
		AiChatSession session = new AiChatSession();
		session.setUserId(userId);
		session.setTitle(titleFrom(request.getMessage()));
		session.setModel(request.getModel());
		session.setArchived(false);
		session.setLastMessage("");
		return sessionRepository.save(session);
	}

	private AiChatSession getOwnedSession(Long userId, Long sessionId) {
		return sessionRepository.findByIdAndUserId(sessionId, userId)
				.orElseThrow(() -> new BusinessException("会话不存在"));
	}

	private void saveMessage(Long sessionId, ChatMessage message) {
		AiChatSessionMessage entity = new AiChatSessionMessage();
		entity.setSessionId(sessionId);
		entity.setRole(message.getRole());
		entity.setContent(message.getContent());
		messageRepository.save(entity);
	}

	private ChatSessionSummaryResponse summary(AiChatSession session) {
		ChatSessionSummaryResponse response = new ChatSessionSummaryResponse();
		response.setId(session.getId());
		response.setTitle(session.getTitle());
		response.setLastMessage(session.getLastMessage());
		response.setModel(session.getModel());
		response.setArchived(session.getArchived());
		response.setUpdatedAt(format(session.getUpdatedAt()));
		return response;
	}

	private ChatMessage message(AiChatSessionMessage entity) {
		ChatMessage message = new ChatMessage();
		message.setRole(entity.getRole());
		message.setContent(entity.getContent());
		return message;
	}

	private boolean sameMessage(ChatMessage left, ChatMessage right) {
		return left != null
				&& right != null
				&& right.getRole().equals(left.getRole())
				&& right.getContent().equals(left.getContent());
	}

	private String titleFrom(String message) {
		if (!StringUtils.hasText(message)) {
			return "New chat";
		}
		String normalized = message.trim().replaceAll("\\s+", " ");
		return normalized.length() <= 30 ? normalized : normalized.substring(0, 30);
	}

	private String format(LocalDateTime value) {
		return value == null ? null : value.format(DATE_TIME_FORMATTER);
	}

	private String toJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (JsonProcessingException exception) {
			return "[]";
		}
	}
}

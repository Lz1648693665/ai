package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.AiModelsResponse;
import com.devpilot.dto.ChatRequest;
import com.devpilot.dto.ChatSessionArchiveRequest;
import com.devpilot.dto.ChatSessionCreateRequest;
import com.devpilot.dto.ChatSessionDetailResponse;
import com.devpilot.dto.ChatSessionSummaryResponse;
import com.devpilot.security.SecurityUtils;
import com.devpilot.service.AiModelConfigService;
import com.devpilot.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

	private final ChatService chatService;
	private final AiModelConfigService aiModelConfigService;

	@GetMapping("/models")
	public Result<AiModelsResponse> models() {
		return Result.success(aiModelConfigService.models());
	}

	@PostMapping("/chat")
	public Result<AiChatResponse> chat(@Valid @RequestBody ChatRequest request) {
		return Result.success(chatService.chat(SecurityUtils.currentUserId(), request));
	}

	@GetMapping("/chat/sessions")
	public Result<List<ChatSessionSummaryResponse>> listSessions(
			@RequestParam(required = false) String keyword,
			@RequestParam(defaultValue = "false") Boolean archived) {
		return Result.success(chatService.listSessions(SecurityUtils.currentUserId(), keyword, archived));
	}

	@GetMapping("/chat/sessions/{sessionId}")
	public Result<ChatSessionDetailResponse> getSession(@PathVariable Long sessionId) {
		return Result.success(chatService.getSession(SecurityUtils.currentUserId(), sessionId));
	}

	@PostMapping("/chat/sessions")
	public Result<ChatSessionSummaryResponse> createSession(@RequestBody ChatSessionCreateRequest request) {
		return Result.success(chatService.createSession(SecurityUtils.currentUserId(), request));
	}

	@PatchMapping("/chat/sessions/{sessionId}/archive")
	public Result<ChatSessionSummaryResponse> archiveSession(
			@PathVariable Long sessionId,
			@RequestBody ChatSessionArchiveRequest request) {
		return Result.success(chatService.archiveSession(SecurityUtils.currentUserId(), sessionId, request));
	}

	@DeleteMapping("/chat/sessions/{sessionId}")
	public Result<Void> deleteSession(@PathVariable Long sessionId) {
		chatService.deleteSession(SecurityUtils.currentUserId(), sessionId);
		return Result.success(null);
	}
}

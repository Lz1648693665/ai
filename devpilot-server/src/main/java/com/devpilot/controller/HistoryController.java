package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.FavoriteHistoryRequest;
import com.devpilot.dto.FavoriteHistoryResponse;
import com.devpilot.entity.PromptRunHistory;
import com.devpilot.security.SecurityUtils;
import com.devpilot.service.HistoryService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

	private final HistoryService historyService;

	@GetMapping
	public Result<List<PromptRunHistory>> list() {
		return Result.success(historyService.list(SecurityUtils.currentUserId()));
	}

	@GetMapping("/{id}")
	public Result<PromptRunHistory> get(@PathVariable Long id) {
		return Result.success(historyService.get(SecurityUtils.currentUserId(), id));
	}

	@GetMapping("/favorites")
	public Result<List<FavoriteHistoryResponse>> favorites() {
		return Result.success(historyService.favorites(SecurityUtils.currentUserId()));
	}

	@PostMapping("/favorites")
	public Result<Map<String, Object>> favorite(@RequestBody FavoriteHistoryRequest request) {
		return Result.success(historyService.favorite(SecurityUtils.currentUserId(), request));
	}

	@DeleteMapping("/{id}")
	public Result<Void> delete(@PathVariable Long id) {
		historyService.delete(SecurityUtils.currentUserId(), id);
		return Result.success(null);
	}
}

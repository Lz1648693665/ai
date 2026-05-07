package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.FavoriteHistoryRequest;
import com.devpilot.dto.FavoriteHistoryResponse;
import com.devpilot.entity.PromptRunHistory;
import com.devpilot.repository.PromptRunHistoryRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HistoryService {

	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private final PromptRunHistoryRepository historyRepository;

	@Transactional(readOnly = true)
	public List<PromptRunHistory> list(Long userId) {
		return historyRepository.findByUserIdOrderByCreatedAtDesc(userId);
	}

	@Transactional(readOnly = true)
	public PromptRunHistory get(Long userId, Long id) {
		return historyRepository.findByIdAndUserId(id, userId)
				.orElseThrow(() -> new BusinessException("历史记录不存在"));
	}

	@Transactional(readOnly = true)
	public List<FavoriteHistoryResponse> favorites(Long userId) {
		return historyRepository.findByUserIdAndFavoriteTrueOrderByFavoriteAtDesc(userId).stream()
				.map(this::favoriteResponse)
				.toList();
	}

	@Transactional
	public Map<String, Object> favorite(Long userId, FavoriteHistoryRequest request) {
		if (request.getHistoryIds() == null || request.getHistoryIds().isEmpty()) {
			throw new BusinessException("请选择要收藏的历史记录");
		}
		LocalDateTime now = LocalDateTime.now();
		for (Long historyId : request.getHistoryIds()) {
			PromptRunHistory history = get(userId, historyId);
			history.setFavorite(true);
			if (history.getFavoriteAt() == null) {
				history.setFavoriteAt(now);
			}
			historyRepository.save(history);
		}
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("success", true);
		return result;
	}

	@Transactional
	public void delete(Long userId, Long id) {
		PromptRunHistory history = get(userId, id);
		historyRepository.delete(history);
	}

	@Transactional
	public PromptRunHistory saveRun(
			Long userId,
			Long templateId,
			String templateTitle,
			String runType,
			String variablesJson,
			String finalPrompt,
			String aiResult) {
		PromptRunHistory history = new PromptRunHistory();
		history.setUserId(userId);
		history.setTemplateId(templateId);
		history.setTemplateTitle(templateTitle);
		history.setRunType(runType);
		history.setVariablesJson(variablesJson);
		history.setFinalPrompt(finalPrompt);
		history.setAiResult(aiResult);
		return historyRepository.save(history);
	}

	private FavoriteHistoryResponse favoriteResponse(PromptRunHistory history) {
		FavoriteHistoryResponse response = new FavoriteHistoryResponse();
		response.setId(history.getId());
		response.setType(history.getRunType());
		response.setTemplateName(history.getTemplateTitle());
		response.setTitle(history.getTemplateTitle());
		response.setFinalPrompt(history.getFinalPrompt());
		response.setAiResult(history.getAiResult());
		response.setResult(history.getAiResult());
		response.setCreatedAt(format(history.getCreatedAt()));
		response.setFavoriteAt(format(history.getFavoriteAt()));
		return response;
	}

	private String format(LocalDateTime value) {
		return value == null ? null : value.format(DATE_TIME_FORMATTER);
	}
}

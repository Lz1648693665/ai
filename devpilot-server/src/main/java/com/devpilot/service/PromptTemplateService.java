package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.TemplateCreateRequest;
import com.devpilot.dto.TemplateRunRequest;
import com.devpilot.entity.PromptTemplate;
import com.devpilot.repository.PromptTemplateRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PromptTemplateService {

	private final PromptTemplateRepository templateRepository;
	private final PromptRenderService promptRenderService;
	private final AiService aiService;
	private final HistoryService historyService;
	private final ObjectMapper objectMapper;

	@Transactional(readOnly = true)
	public List<PromptTemplate> list(Long userId) {
		return templateRepository.findByUserIdOrderByUpdatedAtDesc(userId);
	}

	@Transactional(readOnly = true)
	public PromptTemplate get(Long userId, Long id) {
		return templateRepository.findByIdAndUserId(id, userId)
				.orElseThrow(() -> new BusinessException("模板不存在"));
	}

	@Transactional
	public PromptTemplate create(Long userId, TemplateCreateRequest request) {
		PromptTemplate template = new PromptTemplate();
		template.setUserId(userId);
		applyRequest(template, request);
		return templateRepository.save(template);
	}

	@Transactional
	public PromptTemplate update(Long userId, Long id, TemplateCreateRequest request) {
		PromptTemplate template = get(userId, id);
		applyRequest(template, request);
		return templateRepository.save(template);
	}

	@Transactional
	public void delete(Long userId, Long id) {
		PromptTemplate template = get(userId, id);
		templateRepository.delete(template);
	}

	@Transactional
	public Map<String, Object> run(Long userId, Long id, TemplateRunRequest request) {
		PromptTemplate template = get(userId, id);
		Map<String, String> variables = request.getVariables() == null ? new LinkedHashMap<>() : request.getVariables();
		String finalPrompt = promptRenderService.render(template.getContent(), variables);
		AiChatResponse aiResponse = aiService.chat(buildAiRequest(finalPrompt, request.getModelConfigId(),
				request.getTemperature(), request.getMaxTokens()));
		String aiResult = aiResponse.getContent();
		historyService.saveRun(
				userId,
				template.getId(),
				template.getTitle(),
				"template",
				toJson(variables),
				finalPrompt,
				aiResult);

		template.setUseCount(template.getUseCount() == null ? 1 : template.getUseCount() + 1);
		templateRepository.save(template);

		Map<String, Object> result = new LinkedHashMap<>();
		result.put("finalPrompt", finalPrompt);
		result.put("result", aiResult);
		result.put("provider", aiResponse.getProvider());
		result.put("modelName", aiResponse.getModelName());
		return result;
	}

	public List<String> parseVariables(String content) {
		return promptRenderService.parseVariables(content);
	}

	private void applyRequest(PromptTemplate template, TemplateCreateRequest request) {
		template.setTitle(request.getTitle());
		template.setCategory(request.getCategory());
		template.setDescription(request.getDescription());
		template.setContent(request.getContent());
		template.setTags(request.getTags());
		template.setFavorite(Boolean.TRUE.equals(request.getFavorite()));
	}

	private String toJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (JsonProcessingException exception) {
			return "{}";
		}
	}

	private AiChatRequest buildAiRequest(String prompt, Long modelConfigId, Double temperature, Integer maxTokens) {
		AiChatRequest aiRequest = new AiChatRequest();
		aiRequest.setPrompt(prompt);
		aiRequest.setModelConfigId(modelConfigId);
		aiRequest.setTemperature(temperature);
		aiRequest.setMaxTokens(maxTokens);
		return aiRequest;
	}
}

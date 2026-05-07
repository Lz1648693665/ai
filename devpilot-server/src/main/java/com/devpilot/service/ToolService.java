package com.devpilot.service;

import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.BugAnalyzeRequest;
import com.devpilot.dto.JsonToTsRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ToolService {

	private final AiService aiService;
	private final HistoryService historyService;
	private final ObjectMapper objectMapper;

	@Transactional
	public Map<String, Object> jsonToTs(Long userId, JsonToTsRequest request) {
		String prompt = """
				请将下面的 JSON 转换为 TypeScript 类型定义。
				要求：
				1. 推断合理的 interface 或 type
				2. 字段命名保持原 JSON 风格
				3. 只输出清晰可用的 TypeScript 代码

				JSON：
				%s
				""".formatted(request.getJson());
		AiChatResponse aiResponse = aiService.chat(buildAiRequest(prompt, request.getModelConfigId(),
				request.getTemperature(), request.getMaxTokens()));
		String aiResult = aiResponse.getContent();
		historyService.saveRun(userId, null, "JSON 转 TS", "json_to_ts",
				toJson(Map.of("json", request.getJson())), prompt, aiResult);
		return result(prompt, aiResponse);
	}

	@Transactional
	public Map<String, Object> bugAnalyze(Long userId, BugAnalyzeRequest request) {
		String prompt = """
				请帮我分析下面的前端 Bug，并给出排查思路和修复建议。

				问题描述：
				%s

				相关代码：
				%s

				错误信息：
				%s

				运行环境：
				%s
				""".formatted(
				blankToEmpty(request.getDescription()),
				blankToEmpty(request.getCode()),
				blankToEmpty(request.getError()),
				blankToEmpty(request.getEnvironment()));
		AiChatResponse aiResponse = aiService.chat(buildAiRequest(prompt, request.getModelConfigId(),
				request.getTemperature(), request.getMaxTokens()));
		String aiResult = aiResponse.getContent();
		historyService.saveRun(userId, null, "Bug 分析器", "bug_analyzer",
				toJson(request), prompt, aiResult);
		return result(prompt, aiResponse);
	}

	private Map<String, Object> result(String finalPrompt, AiChatResponse aiResponse) {
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("finalPrompt", finalPrompt);
		result.put("result", aiResponse.getContent());
		result.put("provider", aiResponse.getProvider());
		result.put("modelName", aiResponse.getModelName());
		return result;
	}

	private String blankToEmpty(String value) {
		return value == null ? "" : value;
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

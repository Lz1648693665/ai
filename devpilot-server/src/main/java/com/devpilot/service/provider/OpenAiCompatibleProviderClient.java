package com.devpilot.service.provider;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.ChatMessage;
import com.devpilot.entity.AiModelConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@RequiredArgsConstructor
public class OpenAiCompatibleProviderClient implements AiProviderClient {

	private final WebClient.Builder webClientBuilder;
	private final ObjectMapper objectMapper;

	@Override
	public String provider() {
		return "openai-compatible";
	}

	@Override
	@SuppressWarnings("unchecked")
	public AiChatResponse chat(AiModelConfig config, AiChatRequest request) {
		WebClient.Builder builder = webClientBuilder.baseUrl(trimTrailingSlash(config.getBaseUrl()));
		if (StringUtils.hasText(config.getApiKey())) {
			builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + config.getApiKey());
		}
		WebClient webClient = builder.build();

		String modelName = modelName(config, request);
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", modelName);
		body.put("messages", messages(request));
		body.put("temperature", request.getTemperature() == null ? 0.7 : request.getTemperature());
		if (request.getMaxTokens() != null) {
			body.put("max_tokens", request.getMaxTokens());
		}

		Map<String, Object> response = post(webClient, "/chat/completions", body);
		List<Object> choices = (List<Object>) response.get("choices");
		String content = "";
		if (choices != null && !choices.isEmpty() && choices.get(0) instanceof Map<?, ?> firstChoice) {
			Object messageValue = firstChoice.get("message");
			if (messageValue instanceof Map<?, ?> message) {
				Object contentValue = message.get("content");
				content = contentValue == null ? "" : String.valueOf(contentValue);
			}
		}
		return response(content, config.getProvider(), modelName);
	}

	private Map<String, Object> post(WebClient webClient, String uri, Map<String, Object> body) {
		try {
			Map<String, Object> response = webClient.post()
					.uri(uri)
					.bodyValue(body)
					.retrieve()
					.bodyToMono(Map.class)
					.block();
			if (response == null) {
				throw new BusinessException("OpenAI-compatible 接口返回为空");
			}
			return response;
		} catch (BusinessException exception) {
			throw exception;
		} catch (WebClientResponseException exception) {
			throw new BusinessException("OpenAI-compatible 调用失败：" + responseError(exception));
		} catch (RuntimeException exception) {
			throw new BusinessException("OpenAI-compatible 调用失败：" + exception.getMessage());
		}
	}

	private AiChatResponse response(String content, String provider, String modelName) {
		AiChatResponse result = new AiChatResponse();
		result.setContent(content);
		result.setProvider(provider);
		result.setModelName(modelName);
		return result;
	}

	private List<Map<String, String>> messages(AiChatRequest request) {
		List<Map<String, String>> messages = new ArrayList<>();
		if (request.getMessages() != null) {
			for (ChatMessage message : request.getMessages()) {
				if (message != null && StringUtils.hasText(message.getRole()) && StringUtils.hasText(message.getContent())) {
					messages.add(Map.of(
							"role", message.getRole(),
							"content", message.getContent()));
				}
			}
		}
		if (messages.isEmpty()) {
			messages.add(Map.of(
					"role", "user",
					"content", request.getPrompt()));
		}
		return messages;
	}

	private String modelName(AiModelConfig config, AiChatRequest request) {
		return StringUtils.hasText(request.getModelName()) ? request.getModelName() : config.getModelName();
	}

	private String trimTrailingSlash(String value) {
		return value == null ? "" : value.replaceAll("/+$", "");
	}

	private String responseError(WebClientResponseException exception) {
		String body = exception.getResponseBodyAsString();
		if (StringUtils.hasText(body)) {
			try {
				JsonNode node = objectMapper.readTree(body);
				JsonNode error = node.get("error");
				if (error != null && !error.isNull()) {
					if (error.isTextual()) {
						return error.asText();
					}
					JsonNode message = error.get("message");
					if (message != null && !message.isNull()) {
						return message.asText();
					}
				}
			} catch (Exception ignored) {
				return body;
			}
			return body;
		}
		return exception.getStatusCode() + " " + exception.getStatusText();
	}
}

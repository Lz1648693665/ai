package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.AiConfigRequest;
import com.devpilot.dto.AiModelOption;
import com.devpilot.dto.AiModelConfigRequest;
import com.devpilot.dto.AiModelsResponse;
import com.devpilot.entity.AiModelConfig;
import com.devpilot.repository.AiModelConfigRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiModelConfigService {

	private final AiModelConfigRepository configRepository;
	private final AiGatewayService aiGatewayService;
	private final WebClient.Builder webClientBuilder;

	@Transactional(readOnly = true)
	public List<AiModelConfig> list() {
		return configRepository.findAllByOrderByUpdatedAtDesc();
	}

	@Transactional(readOnly = true)
	public AiModelConfig get(Long id) {
		return configRepository.findById(id)
				.orElseThrow(() -> new BusinessException("模型配置不存在"));
	}

	@Transactional
	public AiModelConfig create(AiModelConfigRequest request) {
		AiModelConfig config = new AiModelConfig();
		applyRequest(config, request, false);
		if (Boolean.TRUE.equals(config.getIsDefault())) {
			clearDefault();
		} else if (!configRepository.existsByEnabledTrueAndIsDefaultTrue() && Boolean.TRUE.equals(config.getEnabled())) {
			config.setIsDefault(true);
		}
		return configRepository.save(config);
	}

	@Transactional
	public AiModelConfig update(Long id, AiModelConfigRequest request) {
		AiModelConfig config = get(id);
		applyRequest(config, request, true);
		if (Boolean.TRUE.equals(config.getIsDefault())) {
			clearDefaultExcept(id);
		}
		if (!Boolean.TRUE.equals(config.getEnabled())) {
			config.setIsDefault(false);
		}
		return configRepository.save(config);
	}

	@Transactional(readOnly = true)
	public AiModelConfig getDefaultOrNull() {
		return configRepository.findFirstByIsDefaultTrueAndEnabledTrue().orElse(null);
	}

	@Transactional(readOnly = true)
	public AiModelsResponse models() {
		List<AiModelConfig> configs = configRepository.findByEnabledTrueOrderByUpdatedAtDesc();
		AiModelConfig defaultConfig = configRepository.findFirstByIsDefaultTrueAndEnabledTrue()
				.orElse(configs.isEmpty() ? null : configs.get(0));

		Map<String, AiModelOption> options = new LinkedHashMap<>();
		for (AiModelConfig config : configs) {
			if ("ollama".equals(config.getProvider())) {
				for (String modelName : ollamaModels(config)) {
					options.putIfAbsent(modelName, option(modelName, labelFrom(modelName)));
				}
				continue;
			}
			String configuredModelName = config.getModelName();
			if (StringUtils.hasText(configuredModelName)) {
				options.putIfAbsent(configuredModelName, option(configuredModelName, labelFrom(configuredModelName)));
			}
		}

		AiModelsResponse response = new AiModelsResponse();
		if (options.isEmpty()) {
			response.setDefaultModel("暂无模型");
			return response;
		}
		response.setDefaultModel(resolveDefaultModel(defaultConfig, new ArrayList<>(options.keySet())));
		response.setModels(new ArrayList<>(options.values()));
		return response;
	}

	@Transactional
	public AiModelConfig saveDefault(AiConfigRequest request) {
		AiModelConfig config = configRepository.findFirstByIsDefaultTrueAndEnabledTrue()
				.orElseGet(AiModelConfig::new);
		config.setName(StringUtils.hasText(request.getModelName()) ? request.getModelName() : "默认模型");
		config.setProvider(normalizeProvider(request.getProvider()));
		config.setBaseUrl(trimTrailingSlash(request.getBaseUrl()));
		config.setApiKey(request.getApiKey());
		config.setModelName(request.getModelName());
		config.setEnabled(true);
		config.setIsDefault(true);
		clearDefault();
		return configRepository.save(config);
	}

	@Transactional
	public void delete(Long id) {
		AiModelConfig config = get(id);
		configRepository.delete(config);
	}

	@Transactional
	public AiModelConfig setDefault(Long id) {
		AiModelConfig config = get(id);
		if (!Boolean.TRUE.equals(config.getEnabled())) {
			throw new BusinessException("停用的模型不能设为默认");
		}
		clearDefaultExcept(id);
		config.setIsDefault(true);
		return configRepository.save(config);
	}

	public AiChatResponse test(Long id) {
		AiChatRequest request = new AiChatRequest();
		request.setModelConfigId(id);
		request.setPrompt("请只回复 OK");
		return aiGatewayService.chat(request);
	}

	private void applyRequest(AiModelConfig config, AiModelConfigRequest request, boolean preserveFlags) {
		config.setName(request.getName());
		config.setProvider(normalizeProvider(request.getProvider()));
		config.setBaseUrl(trimTrailingSlash(request.getBaseUrl()));
		config.setApiKey(request.getApiKey());
		config.setModelName(request.getModelName());
		if (request.getEnabled() != null || !preserveFlags) {
			config.setEnabled(request.getEnabled() == null || Boolean.TRUE.equals(request.getEnabled()));
		}
		if (request.getIsDefault() != null || !preserveFlags) {
			config.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));
		}
	}

	private String normalizeProvider(String provider) {
		return provider == null ? "" : provider.trim().toLowerCase();
	}

	private String trimTrailingSlash(String value) {
		if (!StringUtils.hasText(value)) {
			return value;
		}
		return value.trim().replaceAll("/+$", "");
	}

	@SuppressWarnings("unchecked")
	private List<String> ollamaModels(AiModelConfig config) {
		if (!StringUtils.hasText(config.getBaseUrl())) {
			return List.of();
		}
		try {
			Map<String, Object> response = webClientBuilder
					.baseUrl(trimTrailingSlash(config.getBaseUrl()))
					.build()
					.get()
					.uri("/api/tags")
					.retrieve()
					.bodyToMono(Map.class)
					.block();
			if (response == null || !(response.get("models") instanceof List<?> models)) {
				return List.of();
			}
			List<String> names = new ArrayList<>();
			for (Object item : models) {
				if (item instanceof Map<?, ?> model) {
					Object name = model.get("name");
					if (name != null && StringUtils.hasText(String.valueOf(name))) {
						names.add(String.valueOf(name));
					}
				}
			}
			return names;
		} catch (RuntimeException exception) {
			return List.of();
		}
	}

	private String resolveDefaultModel(AiModelConfig defaultConfig, List<String> modelNames) {
		if (defaultConfig == null || !StringUtils.hasText(defaultConfig.getModelName())) {
			return modelNames.isEmpty() ? null : modelNames.get(0);
		}
		String configured = defaultConfig.getModelName();
		if (modelNames.contains(configured)) {
			return configured;
		}
		String latestName = configured + ":latest";
		if (modelNames.contains(latestName)) {
			return latestName;
		}
		for (String modelName : modelNames) {
			if (modelName.startsWith(configured + ":")) {
				return modelName;
			}
		}
		return configured;
	}

	private AiModelOption option(String name, String label) {
		AiModelOption option = new AiModelOption();
		option.setName(name);
		option.setLabel(label);
		return option;
	}

	private String labelFrom(String modelName) {
		if (!StringUtils.hasText(modelName)) {
			return modelName;
		}
		String name = modelName;
		int tagIndex = name.indexOf(':');
		if (tagIndex > -1) {
			name = name.substring(0, tagIndex);
		}
		String[] parts = name.split("[-_]");
		List<String> words = new ArrayList<>();
		for (String part : parts) {
			if (StringUtils.hasText(part)) {
				words.add(part.substring(0, 1).toUpperCase() + part.substring(1));
			}
		}
		return words.isEmpty() ? modelName : String.join(" ", words);
	}

	private void clearDefault() {
		for (AiModelConfig item : configRepository.findAll()) {
			item.setIsDefault(false);
		}
	}

	private void clearDefaultExcept(Long id) {
		for (AiModelConfig item : configRepository.findAll()) {
			if (!item.getId().equals(id)) {
				item.setIsDefault(false);
			}
		}
	}
}

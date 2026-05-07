package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.entity.AiModelConfig;
import com.devpilot.repository.AiModelConfigRepository;
import com.devpilot.service.provider.AiProviderClient;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AiGatewayService {

	private final AiModelConfigRepository configRepository;
	private final Map<String, AiProviderClient> clientMap;

	public AiGatewayService(AiModelConfigRepository configRepository, List<AiProviderClient> clients) {
		this.configRepository = configRepository;
		this.clientMap = clients.stream()
				.collect(Collectors.toMap(AiProviderClient::provider, Function.identity()));
	}

	public AiChatResponse chat(AiChatRequest request) {
		AiModelConfig config = selectConfig(request);
		AiProviderClient client = clientMap.get(config.getProvider());
		if (client == null) {
			throw new BusinessException("不支持的 AI Provider：" + config.getProvider());
		}
		return client.chat(config, request);
	}

	private AiModelConfig selectConfig(AiChatRequest request) {
		AiModelConfig config;
		if (request.getModelConfigId() != null) {
			config = configRepository.findById(request.getModelConfigId())
					.orElseThrow(() -> new BusinessException("模型配置不存在"));
		} else if (StringUtils.hasText(request.getModelName())) {
			config = configRepository.findFirstByModelNameAndEnabledTrue(request.getModelName())
					.orElseGet(this::defaultConfig);
		} else {
			config = defaultConfig();
		}
		if (!Boolean.TRUE.equals(config.getEnabled())) {
			throw new BusinessException("模型配置已停用：" + config.getName());
		}
		return config;
	}

	private AiModelConfig defaultConfig() {
		return configRepository.findFirstByIsDefaultTrueAndEnabledTrue()
				.orElseThrow(() -> new BusinessException("请先配置默认 AI 模型"));
	}
}

package com.devpilot.service.provider;

import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.entity.AiModelConfig;

public interface AiProviderClient {

	String provider();

	AiChatResponse chat(AiModelConfig config, AiChatRequest request);
}

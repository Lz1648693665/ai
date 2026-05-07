package com.devpilot.service;

import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;

public interface AiService {

	AiChatResponse chat(AiChatRequest request);
}

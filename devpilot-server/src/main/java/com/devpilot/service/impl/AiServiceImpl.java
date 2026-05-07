package com.devpilot.service.impl;

import com.devpilot.dto.AiChatRequest;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.service.AiService;
import com.devpilot.service.AiGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

	private final AiGatewayService aiGatewayService;

	@Override
	public AiChatResponse chat(AiChatRequest request) {
		return aiGatewayService.chat(request);
	}
}

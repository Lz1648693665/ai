package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.AiConfigRequest;
import com.devpilot.entity.AiModelConfig;
import com.devpilot.service.AiModelConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-config")
@RequiredArgsConstructor
public class AiConfigController {

	private final AiModelConfigService aiModelConfigService;

	@GetMapping
	public Result<AiModelConfig> get() {
		return Result.success(aiModelConfigService.getDefaultOrNull());
	}

	@PostMapping
	public Result<AiModelConfig> save(@Valid @RequestBody AiConfigRequest request) {
		return Result.success(aiModelConfigService.saveDefault(request));
	}
}

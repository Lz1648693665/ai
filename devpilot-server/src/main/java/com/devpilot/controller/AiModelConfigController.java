package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.AiChatResponse;
import com.devpilot.dto.AiModelConfigRequest;
import com.devpilot.entity.AiModelConfig;
import com.devpilot.service.AiModelConfigService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-model-configs")
@RequiredArgsConstructor
public class AiModelConfigController {

	private final AiModelConfigService configService;

	@GetMapping
	public Result<List<AiModelConfig>> list() {
		return Result.success(configService.list());
	}

	@GetMapping("/{id}")
	public Result<AiModelConfig> get(@PathVariable Long id) {
		return Result.success(configService.get(id));
	}

	@PostMapping
	public Result<AiModelConfig> create(@Valid @RequestBody AiModelConfigRequest request) {
		return Result.success(configService.create(request));
	}

	@PutMapping("/{id}")
	public Result<AiModelConfig> update(@PathVariable Long id, @Valid @RequestBody AiModelConfigRequest request) {
		return Result.success(configService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public Result<Void> delete(@PathVariable Long id) {
		configService.delete(id);
		return Result.success(null);
	}

	@PostMapping("/{id}/default")
	public Result<AiModelConfig> setDefault(@PathVariable Long id) {
		return Result.success(configService.setDefault(id));
	}

	@PostMapping("/{id}/test")
	public Result<AiChatResponse> test(@PathVariable Long id) {
		return Result.success(configService.test(id));
	}
}

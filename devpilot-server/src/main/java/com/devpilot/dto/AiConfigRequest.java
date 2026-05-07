package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiConfigRequest {

	@NotBlank(message = "AI 提供方不能为空")
	private String provider;

	@NotBlank(message = "API Key 不能为空")
	private String apiKey;

	private String baseUrl;

	@NotBlank(message = "模型名称不能为空")
	private String modelName;
}

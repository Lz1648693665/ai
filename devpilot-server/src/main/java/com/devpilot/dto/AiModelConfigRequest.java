package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiModelConfigRequest {

	@NotBlank(message = "模型名称不能为空")
	private String name;

	@NotBlank(message = "Provider 不能为空")
	private String provider;

	@NotBlank(message = "Base URL 不能为空")
	private String baseUrl;

	private String apiKey;

	@NotBlank(message = "Model Name 不能为空")
	private String modelName;

	private Boolean enabled;

	private Boolean isDefault;
}

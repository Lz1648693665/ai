package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JsonToTsRequest {

	@NotBlank(message = "JSON 内容不能为空")
	private String json;

	private Long modelConfigId;

	private Double temperature;

	private Integer maxTokens;
}

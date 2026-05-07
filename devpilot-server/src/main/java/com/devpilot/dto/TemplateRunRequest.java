package com.devpilot.dto;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.Data;

@Data
public class TemplateRunRequest {

	private Long modelConfigId;

	private Double temperature;

	private Integer maxTokens;

	private Map<String, String> variables = new LinkedHashMap<>();
}

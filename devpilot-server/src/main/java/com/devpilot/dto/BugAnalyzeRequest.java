package com.devpilot.dto;

import lombok.Data;

@Data
public class BugAnalyzeRequest {

	private Long modelConfigId;

	private Double temperature;

	private Integer maxTokens;

	private String description;

	private String code;

	private String error;

	private String environment;
}

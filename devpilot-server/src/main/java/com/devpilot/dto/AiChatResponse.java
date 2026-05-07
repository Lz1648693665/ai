package com.devpilot.dto;

import lombok.Data;

@Data
public class AiChatResponse {

	private String content;

	private String result;

	private Long sessionId;

	private String provider;

	private String model;

	private String modelName;

	private Long historyId;

	private String title;

	private String updatedAt;

	public void setContent(String content) {
		this.content = content;
		this.result = content;
	}

	public void setModelName(String modelName) {
		this.modelName = modelName;
		this.model = modelName;
	}
}

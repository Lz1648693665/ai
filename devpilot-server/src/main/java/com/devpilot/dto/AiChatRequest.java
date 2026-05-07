package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class AiChatRequest {

	@NotBlank(message = "Prompt 不能为空")
	private String prompt;

	private Long modelConfigId;

	private String modelName;

	private List<ChatMessage> messages = new ArrayList<>();

	private Double temperature;

	private Integer maxTokens;
}
